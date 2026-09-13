import {
  Scan,
  ComplianceRule,
  Violation,
  InspectionReport,
  User,
  AuditLog,
  SystemConfig,
} from '../src/types';
import { SAMPLE_PRODUCTS } from '../src/data/sampleProducts';
import { DEFAULT_RULES } from '../src/data/rules';
import { SYSTEM_USERS } from '../src/data/users';

class DatabaseStore {
  private scans: Map<string, Scan> = new Map();
  private rules: Map<string, ComplianceRule> = new Map();
  private reports: Map<string, InspectionReport> = new Map();
  private users: Map<string, User> = new Map();
  private auditLogs: AuditLog[] = [];
  private config: SystemConfig = {
    mode: 'demo',
    ocrConfidenceThreshold: 75,
    manualReviewThreshold: 70,
    autoFlagViolations: true,
    visionApiConfigured: !!process.env.GOOGLE_VISION_API_KEY,
    geminiApiConfigured: !!process.env.GEMINI_API_KEY,
    demoModeActive: true,
    minConfidenceThreshold: 80,
    ocrProvider: process.env.GOOGLE_VISION_API_KEY
      ? 'google_cloud_vision'
      : process.env.GEMINI_API_KEY
      ? 'gemini_vision'
      : 'demo_engine',
  };

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed Users
    SYSTEM_USERS.forEach((u) => this.users.set(u.id, u));

    // Seed Rules
    DEFAULT_RULES.forEach((r) => this.rules.set(r.id, r));

    // Seed Sample Scans
    SAMPLE_PRODUCTS.forEach((scan) => {
      this.scans.set(scan.id, scan);
      
      // Seed pre-generated report for compliant product
      const report: InspectionReport = {
        id: `rep-${scan.id}`,
        scanId: scan.id,
        reportNumber: `REP-LM-${scan.id.replace('scan-', '').toUpperCase()}-2026`,
        issuedAt: scan.scanDate,
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
        summaryRemarks: scan.officerRemarks || 'Automated inspection report processed under Legal Metrology Rules, 2011.',
        legalNotices: scan.violations.map((v) => `${v.ruleCode}: ${v.recommendedAction}`),
      };
      this.reports.set(report.id, report);
    });

    // Seed initial audit log
    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'usr-admin-01',
      userName: 'Dr. Ramesh Chandra (Admin)',
      userRole: 'admin',
      action: 'SYSTEM_BOOTSTRAP',
      resourceType: 'system',
      resourceId: 'packsure-ai',
      details: 'PackSure AI platform initialized with Legal Metrology Act 2009 & PCR 2011 statutory ruleset and SIH presets.',
    });
  }

  // Scans
  public getScans(): Scan[] {
    return Array.from(this.scans.values()).sort(
      (a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime()
    );
  }

  public getScan(id: string): Scan | undefined {
    return this.scans.get(id);
  }

  public createScan(scan: Scan): Scan {
    this.scans.set(scan.id, scan);
    this.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: scan.inspectorId || 'usr-officer-01',
      userName: scan.inspectorName || 'Officer',
      userRole: scan.inspectorRole || 'officer',
      action: 'SCAN_CREATED',
      resourceType: 'scan',
      resourceId: scan.id,
      details: `Product scan initiated for ${scan.productName} (${scan.brand}). Mode: ${scan.mode}.`,
    });
    return scan;
  }

  public updateScan(id: string, updates: Partial<Scan>): Scan | undefined {
    const existing = this.scans.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.scans.set(id, updated);
    return updated;
  }

  public deleteScan(id: string): boolean {
    return this.scans.delete(id);
  }

  // Rules
  public getRules(): ComplianceRule[] {
    return Array.from(this.rules.values());
  }

  public getRule(id: string): ComplianceRule | undefined {
    return this.rules.get(id);
  }

  public createRule(rule: ComplianceRule): ComplianceRule {
    this.rules.set(rule.id, rule);
    this.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'usr-admin-01',
      userName: 'Admin',
      userRole: 'admin',
      action: 'RULE_CREATED',
      resourceType: 'rule',
      resourceId: rule.id,
      details: `Created rule ${rule.ruleCode}: ${rule.declarationName}`,
    });
    return rule;
  }

  public updateRule(id: string, updates: Partial<ComplianceRule>): ComplianceRule | undefined {
    const existing = this.rules.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.rules.set(id, updated);
    return updated;
  }

  public deleteRule(id: string): boolean {
    return this.rules.delete(id);
  }

  // Violations
  public getAllViolations(): Violation[] {
    const allViolations: Violation[] = [];
    this.scans.forEach((scan) => {
      if (scan.violations) {
        allViolations.push(...scan.violations);
      }
    });
    return allViolations;
  }

  // Reports
  public getReports(): InspectionReport[] {
    return Array.from(this.reports.values()).sort(
      (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );
  }

  public getReport(id: string): InspectionReport | undefined {
    return this.reports.get(id);
  }

  public getReportByScanId(scanId: string): InspectionReport | undefined {
    return Array.from(this.reports.values()).find((r) => r.scanId === scanId);
  }

  public saveReport(report: InspectionReport): InspectionReport {
    this.reports.set(report.id, report);
    return report;
  }

  // Users
  public getUsers(): User[] {
    return Array.from(this.users.values());
  }

  public getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].reverse();
  }

  public addAuditLog(entry: AuditLog) {
    this.auditLogs.push(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.shift();
    }
  }

  // Config
  public getConfig(): SystemConfig {
    return {
      ...this.config,
      visionApiConfigured: !!process.env.GOOGLE_VISION_API_KEY,
      geminiApiConfigured: !!process.env.GEMINI_API_KEY,
    };
  }

  public updateConfig(newConfig: Partial<SystemConfig>): SystemConfig {
    this.config = { ...this.config, ...newConfig };
    return this.getConfig();
  }
}

export const db = new DatabaseStore();
