import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { checkImageQuality, performVisionOCR, performDeepPackagingAnalysis } from './server/visionOcr';
import { extractDeclarations } from './server/declarationExtractor';
import { evaluateCompliance } from './server/complianceEngine';
import { LEGAL_METROLOGY_MASTER_PROMPT, auditPackagingWithAI } from './server/legalMetrologyAuditor';
import { Scan, InspectionReport } from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parsers with generous limits for high-resolution packaging images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ==========================================
  // REST API ROUTES
  // ==========================================

  // System Health & Config
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PackSure AI',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/config', (req, res) => {
    res.json(db.getConfig());
  });

  app.post('/api/config', (req, res) => {
    const updated = db.updateConfig(req.body);
    res.json(updated);
  });

  // Authentication & Current User
  app.post('/api/auth/login', (req, res) => {
    const { role = 'officer', userId } = req.body;
    const users = db.getUsers();
    let selectedUser = userId
      ? users.find((u) => u.id === userId)
      : users.find((u) => u.role === role);

    if (!selectedUser) {
      selectedUser = users[1] || users[0]; // fallback to officer
    }

    db.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: selectedUser.id,
      userName: selectedUser.name,
      userRole: selectedUser.role,
      action: 'USER_LOGIN',
      resourceType: 'user',
      resourceId: selectedUser.id,
      details: `User logged in as ${selectedUser.role} (${selectedUser.name}).`,
    });

    res.json({
      user: selectedUser,
      token: `jwt-simulated-${selectedUser.id}-${Date.now()}`,
    });
  });

  app.get('/api/users', (req, res) => {
    res.json(db.getUsers());
  });

  // Scans - CRUD
  app.get('/api/scans', (req, res) => {
    const { status, verdict, mode, search } = req.query;
    let scans = db.getScans();

    if (status) scans = scans.filter((s) => s.status === status);
    if (verdict) scans = scans.filter((s) => s.verdict === verdict);
    if (mode) scans = scans.filter((s) => s.mode === mode);
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      scans = scans.filter(
        (s) =>
          s.productName.toLowerCase().includes(q) ||
          s.brand.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.barcode && s.barcode.includes(q))
      );
    }

    res.json(scans);
  });

  app.get('/api/scans/:id', (req, res) => {
    const scan = db.getScan(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json(scan);
  });

  app.post('/api/scans', (req, res) => {
    const {
      productName = 'Unidentified Commodity',
      brand = 'Standard Packaging',
      barcode = '',
      category = 'Packaged Commodity',
      packagingType = 'Box / Pouch',
      imageUrl: directImageUrl,
      images = [],
      mode = 'live',
      inspectorId = 'usr-officer-01',
      inspectorName = 'Sanjay Sharma',
      inspectorRole = 'officer',
      inspectorBadge = 'LM-DEL-2024-88',
    } = req.body;

    const resolvedImageUrl = directImageUrl || (images && images[0]?.url) || '';

    if (!resolvedImageUrl && (!images || images.length === 0)) {
      return res.status(400).json({ error: 'At least one packaging image is required for scanning.' });
    }

    const scanId = `scan-${Date.now()}`;
    const newScan: Scan = {
      id: scanId,
      productName,
      brand,
      barcode,
      category,
      packagingType,
      imageUrl: resolvedImageUrl,
      images: images && images.length > 0 ? images : [{ id: 'img-1', url: resolvedImageUrl, panelType: 'Front / PDP', label: 'Primary Panel' }],
      inspectorId,
      inspectorName,
      inspectorRole,
      inspectorBadge,
      scanDate: new Date().toISOString(),
      status: 'uploaded',
      mode,
      complianceScore: 0,
      verdict: 'NEEDS MANUAL REVIEW',
      requiresManualReview: false,
      breakdown: {
        declarationCompleteness: 0,
        ocrConfidence: 0,
        formatValidity: 0,
        readability: 0,
        mandatoryFieldCompliance: 0,
      },
      declarations: [],
      violations: [],
    };

    const saved = db.createScan(newScan);
    res.status(201).json(saved);
  });

  // Core AI Pipeline: Quality Check -> Vision OCR -> Declaration Extraction -> Rule Validation -> Scoring
  app.post('/api/scans/:id/analyze', async (req, res) => {
    try {
      const scan = db.getScan(req.params.id);
      if (!scan) return res.status(404).json({ error: 'Scan not found' });

      // Step 1: Image Quality Assessment
      const quality = checkImageQuality(scan.imageUrl);
      db.updateScan(scan.id, { imageQuality: quality, status: 'quality_check' });

      // Step 2 & 3: Deep Multimodal Packaging Analysis & OCR across all images
      const imagesToAnalyze = scan.images && scan.images.length > 0 ? scan.images : scan.imageUrl;
      const deepResult = await performDeepPackagingAnalysis(imagesToAnalyze, {
        productName: scan.productName,
        brand: scan.brand,
      });

      const ocrResult = deepResult.ocr;
      db.updateScan(scan.id, { ocrResult, status: 'ocr_processing' });

      // Step 3 & 4: Declarations and Rules
      let declarations = deepResult.declarations && deepResult.declarations.length > 0
        ? deepResult.declarations
        : extractDeclarations(ocrResult);

      db.updateScan(scan.id, { declarations, status: 'extracting' });

      const activeRules = db.getRules();
      const evaluation = evaluateCompliance(scan.id, declarations, activeRules, quality);

      // Merge any critical multimodal violations detected by deep vision analysis
      const combinedViolations = [...evaluation.violations];
      if (deepResult.violations && deepResult.violations.length > 0) {
        deepResult.violations.forEach((v) => {
          if (!combinedViolations.some((cv) => cv.ruleCode === v.ruleCode)) {
            combinedViolations.push({ ...v, scanId: scan.id });
          }
        });
      }

      // Final score & verdict
      const finalScore = deepResult.complianceScore !== undefined
        ? Math.round((deepResult.complianceScore + evaluation.score) / 2)
        : evaluation.score;

      const finalVerdict = finalScore >= 85
        ? 'COMPLIANT'
        : finalScore < 65 || combinedViolations.some((v) => v.severity === 'critical')
        ? 'NON-COMPLIANT'
        : 'NEEDS MANUAL REVIEW';

      const detectedName = deepResult.productName || declarations.find((d) => d.type === 'commodity_name')?.detectedValue || scan.productName;
      const detectedBrand = deepResult.brand || scan.brand;
      const detectedCat = deepResult.category || scan.category;

      const updatedScan = db.updateScan(scan.id, {
        productName: scan.productName === 'Unidentified Commodity' ? detectedName : (scan.productName || detectedName),
        brand: scan.brand === 'Standard Packaging' ? detectedBrand : (scan.brand || detectedBrand),
        category: detectedCat,
        packagingType: deepResult.packagingType || scan.packagingType,
        status: 'completed',
        complianceScore: finalScore,
        verdict: finalVerdict,
        requiresManualReview: finalVerdict === 'NEEDS MANUAL REVIEW',
        breakdown: {
          ...evaluation.breakdown,
          ocrConfidence: ocrResult.confidence,
        },
        declarations,
        violations: combinedViolations,
      });

      // Auto generate initial report record
      const report: InspectionReport = {
        id: `rep-${scan.id}`,
        scanId: scan.id,
        reportNumber: `REP-LM-${scan.id.replace('scan-', '').toUpperCase()}-2026`,
        issuedAt: new Date().toISOString(),
        inspector: {
          name: scan.inspectorName,
          badge: scan.inspectorBadge,
          department: 'Directorate of Legal Metrology, Government of India',
        },
        product: {
          name: updatedScan?.productName || scan.productName,
          brand: updatedScan?.brand || scan.brand,
          category: updatedScan?.category || scan.category,
          packagingType: updatedScan?.packagingType || scan.packagingType,
        },
        complianceScore: finalScore,
        verdict: finalVerdict,
        ocrConfidence: ocrResult.confidence,
        declarations,
        violations: combinedViolations,
        summaryRemarks: finalVerdict === 'COMPLIANT'
          ? 'Automated scan confirms product complies with Legal Metrology (Packaged Commodities) Rules, 2011.'
          : finalVerdict === 'NON-COMPLIANT'
          ? 'Critical statutory violations detected on packaging label. Inspection notice recommended.'
          : 'Inspection flagged for Officer Manual Review due to label ambiguity or non-standard formatting.',
        legalNotices: combinedViolations.map((v) => `${v.ruleCode}: ${v.recommendedAction}`),
      };
      db.saveReport(report);

      db.addAuditLog({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: scan.inspectorId,
        userName: scan.inspectorName,
        userRole: scan.inspectorRole,
        action: 'AI_ANALYSIS_COMPLETED',
        resourceType: 'scan',
        resourceId: scan.id,
        details: `OCR and Legal Metrology compliance evaluated. Score: ${evaluation.score}%, Verdict: ${evaluation.verdict}. Violations found: ${evaluation.violations.length}.`,
      });

      res.json(updatedScan);
    } catch (err) {
      console.error('Analysis error:', err);
      res.status(500).json({ error: 'Failed to complete packaging compliance analysis' });
    }
  });

  // Officer Manual Review & Declaration Correction
  app.post('/api/scans/:id/review', (req, res) => {
    const scan = db.getScan(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    const {
      declarationId,
      overrideValue,
      overrideStatus,
      officerRemarks,
      officerDecision,
      officerName = 'Sanjay Sharma',
      inspectorSignOff,
    } = req.body;

    let updatedDeclarations = [...scan.declarations];

    if (declarationId) {
      updatedDeclarations = updatedDeclarations.map((dec) => {
        if (dec.id === declarationId) {
          return {
            ...dec,
            status: overrideStatus || dec.status,
            detectedValue: overrideValue !== undefined ? overrideValue : dec.detectedValue,
            officerOverride: {
              value: overrideValue !== undefined ? overrideValue : dec.detectedValue,
              status: overrideStatus || dec.status,
              by: officerName,
              at: new Date().toISOString(),
              remarks: officerRemarks || 'Officer verified declaration directly from label sample.',
            },
          };
        }
        return dec;
      });
    }

    // Recalculate score with officer overrides applied
    const activeRules = db.getRules();
    const reEvaluation = evaluateCompliance(scan.id, updatedDeclarations, activeRules, scan.imageQuality);

    const updatedScan = db.updateScan(scan.id, {
      declarations: updatedDeclarations,
      complianceScore: reEvaluation.score,
      verdict: officerDecision === 'accepted' ? 'COMPLIANT' : (officerDecision === 'rejected' ? 'NON-COMPLIANT' : reEvaluation.verdict),
      requiresManualReview: officerDecision === 'pending',
      breakdown: reEvaluation.breakdown,
      violations: reEvaluation.violations,
      officerRemarks: officerRemarks || scan.officerRemarks,
      officerDecision: officerDecision || scan.officerDecision,
      ...(inspectorSignOff ? { inspectorSignOff } : {}),
    });

    db.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'usr-officer-01',
      userName: officerName,
      userRole: 'officer',
      action: inspectorSignOff ? 'OFFICER_SIGN_OFF_RECORDED' : 'OFFICER_MANUAL_REVIEW',
      resourceType: 'scan',
      resourceId: scan.id,
      details: inspectorSignOff
        ? `Officer ${inspectorSignOff.officerName} (${inspectorSignOff.badgeNumber}) applied digital signature and automated seal.`
        : `Officer reviewed declarations and updated compliance assessment to score ${reEvaluation.score}%.`,
    });

    res.json(updatedScan);
  });

  // OCR specific endpoint
  app.get('/api/scans/:id/ocr', (req, res) => {
    const scan = db.getScan(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json(scan.ocrResult || { fullText: '', confidence: 0, blocks: [] });
  });

  // Compliance specific endpoint
  app.get('/api/scans/:id/compliance', (req, res) => {
    const scan = db.getScan(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json({
      complianceScore: scan.complianceScore,
      verdict: scan.verdict,
      breakdown: scan.breakdown,
      requiresManualReview: scan.requiresManualReview,
      violations: scan.violations,
      declarations: scan.declarations,
    });
  });

  // Violations Center
  app.get('/api/violations', (req, res) => {
    const { severity, ruleCode, resolved } = req.query;
    let violations = db.getAllViolations();

    if (severity) violations = violations.filter((v) => v.severity === severity);
    if (ruleCode) violations = violations.filter((v) => v.ruleCode === ruleCode);
    if (resolved !== undefined) {
      const isResolved = resolved === 'true';
      violations = violations.filter((v) => v.resolved === isResolved);
    }

    res.json(violations);
  });

  app.post('/api/violations/:id/resolve', (req, res) => {
    const { id } = req.params;
    const { officerName = 'Sanjay Sharma' } = req.body;
    let found = false;

    db.getScans().forEach((scan) => {
      const v = scan.violations?.find((vi) => vi.id === id);
      if (v) {
        v.resolved = true;
        v.resolvedBy = officerName;
        v.resolvedAt = new Date().toISOString();
        found = true;
      }
    });

    if (!found) return res.status(404).json({ error: 'Violation not found' });
    res.json({ success: true, message: 'Violation marked as resolved by officer.' });
  });

  // Reports
  app.get('/api/reports', (req, res) => {
    res.json(db.getReports());
  });

  app.get('/api/reports/:id', (req, res) => {
    const report = db.getReport(req.params.id) || db.getReportByScanId(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  });

  app.post('/api/reports/:id/generate', (req, res) => {
    const scan = db.getScan(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    const newReport: InspectionReport = {
      id: `rep-${scan.id}-${Date.now()}`,
      scanId: scan.id,
      reportNumber: `REP-LM-${scan.id.replace('scan-', '').toUpperCase()}-${Date.now().toString().slice(-4)}`,
      issuedAt: new Date().toISOString(),
      inspector: {
        name: scan.inspectorName,
        badge: scan.inspectorBadge,
        department: 'Directorate of Legal Metrology, Government of India',
      },
      product: {
        name: scan.productName,
        brand: scan.brand,
        category: scan.category,
        packagingType: scan.packagingType,
      },
      complianceScore: scan.complianceScore,
      verdict: scan.verdict,
      ocrConfidence: scan.breakdown.ocrConfidence,
      declarations: scan.declarations,
      violations: scan.violations,
      summaryRemarks: req.body.summaryRemarks || scan.officerRemarks || 'Official Legal Metrology compliance inspection report.',
      legalNotices: scan.violations.map((v) => `${v.ruleCode}: ${v.recommendedAction}`),
      ...(scan.inspectorSignOff ? { inspectorSignOff: scan.inspectorSignOff } : {}),
    };

    db.saveReport(newReport);
    res.json(newReport);
  });

  // Product Repository
  app.get('/api/products', (req, res) => {
    const scans = db.getScans();
    const productMap = new Map<string, any>();

    scans.forEach((s) => {
      const key = `${s.brand} - ${s.productName}`.toLowerCase();
      if (!productMap.has(key)) {
        productMap.set(key, {
          productName: s.productName,
          brand: s.brand,
          category: s.category,
          packagingType: s.packagingType,
          latestScanId: s.id,
          latestScore: s.complianceScore,
          latestVerdict: s.verdict,
          latestScanDate: s.scanDate,
          totalScans: 1,
          totalViolations: s.violations.length,
          imageUrl: s.imageUrl,
        });
      } else {
        const existing = productMap.get(key);
        existing.totalScans += 1;
        existing.totalViolations += s.violations.length;
      }
    });

    res.json(Array.from(productMap.values()));
  });

  // Configurable Legal Metrology Rules CRUD
  app.get('/api/rules', (req, res) => {
    res.json(db.getRules());
  });

  app.post('/api/rules', (req, res) => {
    const {
      ruleCode,
      declarationName,
      declarationType,
      required,
      validationType,
      expectedFormat,
      severity,
      description,
      legalMetrologyReference,
    } = req.body;

    const newRule = db.createRule({
      id: `rule-${Date.now()}`,
      ruleCode: ruleCode || `PCR-${Math.floor(10 + Math.random() * 90)}`,
      declarationName,
      declarationType,
      required: required !== false,
      validationType: validationType || 'presence',
      expectedFormat,
      severity: severity || 'high',
      description,
      legalMetrologyReference: legalMetrologyReference || 'Rule 6 — Legal Metrology Rules, 2011',
      active: true,
    });

    res.status(201).json(newRule);
  });

  app.put('/api/rules/:id', (req, res) => {
    const updated = db.updateRule(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Rule not found' });
    res.json(updated);
  });

  app.delete('/api/rules/:id', (req, res) => {
    const deleted = db.deleteRule(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Rule not found' });
    res.json({ success: true, message: 'Rule deleted successfully.' });
  });

  // PackSure AI Legal Metrology Statutory Prompt API
  app.get('/api/rules/prompt', (req, res) => {
    res.json({
      title: 'PackSure AI 100% Legal Metrology Act 2009 & PCR 2011 Master Prompt',
      act: 'The Legal Metrology Act, 2009 (Act No. 1 of 2010)',
      rules: 'The Legal Metrology (Packaged Commodities) Rules, 2011 (Amended 2021/2022/2024)',
      prompt: LEGAL_METROLOGY_MASTER_PROMPT,
      statutoryClausesCovered: [
        { code: 'Sec 18', name: 'Prohibition on non-conforming pre-packaged goods', act: 'Legal Metrology Act, 2009' },
        { code: 'Sec 36(1)', name: 'Statutory Penalties (up to ₹1,00,000 & prosecution)', act: 'Legal Metrology Act, 2009' },
        { code: 'Sec 36(2)', name: 'Penalty for selling above MRP (up to ₹50,000)', act: 'Legal Metrology Act, 2009' },
        { code: 'Rule 6(1)(a)', name: 'Manufacturer / Packer Name & Address with Postal PIN Code', act: 'PCR Rules, 2011' },
        { code: 'Rule 6(1)(b)', name: 'Generic / Common Commodity Name', act: 'PCR Rules, 2011' },
        { code: 'Rule 6(1)(c)', name: 'Net Quantity in Standard Metric SI Units (g, kg, ml, l, N)', act: 'PCR Rules, 2011' },
        { code: 'Rule 6(1)(d)', name: 'Month & Year of Manufacture / Pre-packing / Import', act: 'PCR Rules, 2011' },
        { code: 'Rule 6(1)(e)', name: 'Maximum Retail Price (MRP) with "(inclusive of all taxes)"', act: 'PCR Rules, 2011' },
        { code: 'Rule 6(1)(e)-USP', name: 'Unit Sale Price (USP) per unit/g/kg/ml/l/N', act: 'PCR Rules, 2011 (Amended 2022/2024)' },
        { code: 'Rule 6(1)(f)', name: 'Consumer Care Cell (Designation, Address, Helpline, Email)', act: 'PCR Rules, 2011' },
        { code: 'Rule 6(1)(g)', name: 'Country of Origin for domestic & imported commodities', act: 'PCR Rules, 2011' },
        { code: 'Rule 7/8/9', name: 'Principal Display Panel (PDP) area & numeral height sizing', act: 'PCR Rules, 2011' },
        { code: 'Rule 10', name: 'Declarations in Hindi (Devanagari) or English', act: 'PCR Rules, 2011' }
      ]
    });
  });

  // PackSure AI 100% Statutory Legal Metrology Verification Engine
  app.post('/api/rules/ai-verify', async (req, res) => {
    try {
      const { text, imageUrl, declarations } = req.body;
      const result = await auditPackagingWithAI({
        text: text || '',
        imageUrl,
        declarations,
      });
      res.json(result);
    } catch (err: any) {
      console.error('[PackSure AI] Statutory verification error:', err);
      res.status(500).json({ error: 'Statutory rules verification failed', message: err.message });
    }
  });

  // Analytics Engine
  app.get('/api/analytics', (req, res) => {
    const scans = db.getScans();
    const violations = db.getAllViolations();

    const totalScanned = scans.length;
    const compliantCount = scans.filter((s) => s.verdict === 'COMPLIANT').length;
    const nonCompliantCount = scans.filter((s) => s.verdict === 'NON-COMPLIANT').length;
    const reviewCount = scans.filter((s) => s.verdict === 'NEEDS MANUAL REVIEW').length;
    const complianceRate = totalScanned > 0 ? Math.round((compliantCount / totalScanned) * 100) : 0;

    // Violation types distribution
    const violationTypeCount: Record<string, number> = {};
    violations.forEach((v) => {
      const code = v.ruleCode || 'Other';
      violationTypeCount[code] = (violationTypeCount[code] || 0) + 1;
    });

    const topViolations = Object.entries(violationTypeCount).map(([ruleCode, count]) => ({
      ruleCode,
      count,
      name: db.getRules().find((r) => r.ruleCode === ruleCode)?.declarationName || ruleCode,
    }));

    // OCR Confidence Distribution
    const confidenceBands = [
      { range: '90-100%', count: scans.filter((s) => s.breakdown.ocrConfidence >= 90).length },
      { range: '80-89%', count: scans.filter((s) => s.breakdown.ocrConfidence >= 80 && s.breakdown.ocrConfidence < 90).length },
      { range: '70-79%', count: scans.filter((s) => s.breakdown.ocrConfidence >= 70 && s.breakdown.ocrConfidence < 80).length },
      { range: '< 70%', count: scans.filter((s) => s.breakdown.ocrConfidence < 70).length },
    ];

    // Recent inspection activity
    const recentActivity = scans.slice(0, 5).map((s) => ({
      id: s.id,
      productName: s.productName,
      brand: s.brand,
      verdict: s.verdict,
      score: s.complianceScore,
      date: s.scanDate,
      inspector: s.inspectorName,
    }));

    res.json({
      totalScanned,
      compliantCount,
      nonCompliantCount,
      reviewCount,
      complianceRate,
      topViolations,
      confidenceBands,
      recentActivity,
      totalViolations: violations.length,
    });
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(db.getAuditLogs());
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PackSure AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
