import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ProductScanner } from './components/scanner/ProductScanner';
import { ScanningAnimation } from './components/scanner/ScanningAnimation';
import { ViolationCenter } from './components/violations/ViolationCenter';
import { ComplianceReportView } from './components/reports/ComplianceReportView';
import { ProductRepository } from './components/repository/ProductRepository';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { RulesManager } from './components/rules/RulesManager';
import { InspectionResultScreen } from './components/scanner/InspectionResultScreen';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { EvidenceViewerModal } from './components/evidence/EvidenceViewerModal';
import { api } from './services/api';
import {
  Scan,
  ComplianceRule,
  Violation,
  InspectionReport,
  User,
  SystemConfig,
  BoundingBox,
} from './types';
import { DEFAULT_RULES } from './data/rules';
import { SAMPLE_PRODUCTS } from './data/sampleProducts';
import { USERS } from './data/users';
import { Bell, AlertTriangle, ShieldCheck, X, FileCheck2, Eye } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('landing');
  const [currentUser, setCurrentUser] = useState<User>(USERS[1]); // Default to Legal Metrology Officer
  const [allUsers, setAllUsers] = useState<User[]>(USERS);
  const [scans, setScans] = useState<Scan[]>(SAMPLE_PRODUCTS);
  const [rules, setRules] = useState<ComplianceRule[]>(DEFAULT_RULES);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [config, setConfig] = useState<SystemConfig>({
    mode: 'demo',
    ocrConfidenceThreshold: 75,
    manualReviewThreshold: 70,
    autoFlagViolations: true,
  });

  // Selected entities
  const [selectedScanId, setSelectedScanId] = useState<string | null>(SAMPLE_PRODUCTS[0].id);
  const [selectedReport, setSelectedReport] = useState<InspectionReport | null>(null);
  const [evidenceScan, setEvidenceScan] = useState<Scan | null>(null);
  const [evidenceBox, setEvidenceBox] = useState<BoundingBox | undefined>(undefined);

  // AI Pipeline State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<number>(1);
  const [analysisMessage, setAnalysisMessage] = useState<string>('');

  // Notifications Modal
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scansData, rulesData, violationsData, configData, usersData] = await Promise.all([
          api.getScans(),
          api.getRules(),
          api.getViolations(),
          api.getConfig(),
          api.getUsers(),
        ]);

        if (scansData?.length) setScans(scansData);
        if (rulesData?.length) setRules(rulesData);
        if (violationsData) setViolations(violationsData);
        if (configData) setConfig(configData);
        if (usersData?.length) setAllUsers(usersData);
      } catch (err) {
        console.warn('API fetch fallback to local datasets:', err);
      }
    };
    fetchData();
  }, []);

  // Update violations list when scans change
  useEffect(() => {
    const allViols = scans.flatMap((s) => s.violations || []);
    setViolations(allViols);
  }, [scans]);

  // Handler: Select a sample demo product
  const handleSelectSample = (sampleId: string) => {
    setSelectedScanId(sampleId);
    setCurrentView('result');
  };

  // Handler: Start new scan
  const handleStartScan = () => {
    setCurrentView('scanner');
  };

  // Handler: Trigger AI Packaging Analysis across single or multiple panels
  const handleAnalyzeProduct = async (
    imageDataUrl: string,
    metadata?: {
      productName?: string;
      brand?: string;
      images?: any[];
    }
  ) => {
    setIsAnalyzing(true);
    // Stage 1: Scan
    setAnalysisStage(1);
    setAnalysisMessage('Step 1/4: Ingesting packaging label & checking optical clarity...');

    try {
      // 1. Create Scan in API with multi-image panel support
      const imagesList =
        metadata?.images && metadata.images.length > 0
          ? metadata.images
          : [{ id: 'img-1', url: imageDataUrl, panelType: 'Front (PDP)', label: 'Primary Panel' }];

      const newScan = await api.createScan({
        imageUrl: imageDataUrl,
        images: imagesList,
        productName: metadata?.productName || 'Unidentified Commodity',
        brand: metadata?.brand || 'Packaged Commodity',
        mode: config.mode,
        inspectorId: currentUser.id,
        inspectorName: currentUser.name,
        inspectorRole: currentUser.role,
        inspectorBadge: currentUser.badgeNumber || 'LM-OFF-2026',
      });

      // Stage 2: OCR
      setTimeout(() => {
        setAnalysisStage(2);
        setAnalysisMessage('Step 2/4: Optical Character Recognition (OCR) extracting text tokens & bounding boxes...');
      }, 700);

      // Stage 3: AI Rules Check
      setTimeout(() => {
        setAnalysisStage(3);
        setAnalysisMessage('Step 3/4: 100% AI Rules Check against Legal Metrology Act, 2009 & PCR 2011 clauses...');
      }, 1500);

      // Execute deep multimodal analysis (OCR + Declarations + Metrology AI Rule Audit)
      const analyzed = await api.analyzeScan(newScan.id);

      // Stage 4: Result Compilation
      setAnalysisStage(4);
      setAnalysisMessage('Step 4/4: Compiling inspection result, statutory notice & verification certificate...');

      setTimeout(() => {
        setIsAnalyzing(false);
        setScans((prev) => [analyzed, ...prev]);
        setSelectedScanId(analyzed.id);
        setCurrentView('result');
      }, 700);
    } catch (err) {
      console.error('Packaging analysis failed:', err);
      setIsAnalyzing(false);
      alert('Analysis encountered an issue. Please try with another packaging image.');
    }
  };

  // Handler: Update declaration officer override
  const handleUpdateDeclaration = async (
    declarationId: string,
    value: string,
    status: 'detected' | 'low_confidence' | 'missing' | 'invalid_format',
    remarks: string
  ) => {
    if (!selectedScanId) return;

    try {
      const updated = await api.updateDeclaration(selectedScanId, declarationId, {
        value,
        status,
        remarks,
        officerName: currentUser.name,
      });

      setScans((prev) => prev.map((s) => (s.id === selectedScanId ? updated : s)));
    } catch (err) {
      console.error('Failed to update declaration:', err);
    }
  };

  // Handler: Generate Report
  const handleGenerateReport = async (scanId: string) => {
    try {
      const report = await api.generateReport(scanId);
      setSelectedReport(report);
      setCurrentView('reports');
    } catch (err) {
      const scan = scans.find((s) => s.id === scanId);
      if (scan) {
        setSelectedReport({
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
          summaryRemarks: scan.officerRemarks || 'Official Legal Metrology compliance inspection certificate.',
          legalNotices: scan.violations.map((v) => `${v.ruleCode}: ${v.recommendedAction}`),
        });
        setCurrentView('reports');
      }
    }
  };

  // Handler: Resolve Violation
  const handleResolveViolation = async (violationId: string) => {
    try {
      await api.resolveViolation(violationId, currentUser.name);
      setScans((prev) =>
        prev.map((scan) => ({
          ...scan,
          violations: scan.violations.map((v) =>
            v.id === violationId
              ? {
                  ...v,
                  resolved: true,
                  resolvedBy: currentUser.name,
                  resolvedAt: new Date().toISOString(),
                }
              : v
          ),
        }))
      );
    } catch (err) {
      console.error('Failed to resolve violation:', err);
    }
  };

  // Handler: View Evidence in Modal
  const handleViewEvidence = (scanId: string, boundingBox?: BoundingBox) => {
    const found = scans.find((s) => s.id === scanId);
    if (found) {
      setEvidenceScan(found);
      setEvidenceBox(boundingBox);
    }
  };

  const selectedScan = scans.find((s) => s.id === selectedScanId) || scans[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={(u) => setCurrentUser(u)}
        onOpenSettings={() => setCurrentView('settings')}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadCount={scans.filter((s) => s.requiresManualReview).length}
        mode={config.mode}
        onToggleMode={() => {
          const next = config.mode === 'demo' ? 'live' : 'demo';
          setConfig((c) => ({ ...c, mode: next }));
          api.updateConfig({ mode: next });
        }}
      />

      <div className="flex min-h-[calc(100vh-4.25rem)]">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          userRole={currentUser.role}
          pendingReviewsCount={scans.filter((s) => s.requiresManualReview).length}
          criticalViolationsCount={
            violations.filter((v) => v.severity === 'critical' && !v.resolved).length
          }
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-x-hidden p-4 pb-24 sm:p-6 lg:p-8 md:pb-12">
          {/* AI Analyzing Overlay */}
          {isAnalyzing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
              <ScanningAnimation
                currentStage={analysisStage}
                stageMessage={analysisMessage}
              />
            </div>
          )}

          {/* VIEW: Landing Page */}
          {currentView === 'landing' && (
            <LandingPage
              onStartScan={handleStartScan}
              onSelectSample={handleSelectSample}
              onGoToDashboard={() => setCurrentView('dashboard')}
              samples={scans.slice(0, 3)}
            />
          )}

          {/* VIEW: Dashboard */}
          {currentView === 'dashboard' && (
            <DashboardOverview
              scans={scans}
              violations={violations}
              onStartScan={handleStartScan}
              onViewScan={(scanId) => {
                setSelectedScanId(scanId);
                setCurrentView('result');
              }}
              onViewViolations={() => setCurrentView('violations')}
              onViewReports={() => {
                if (scans[0]) handleGenerateReport(scans[0].id);
              }}
            />
          )}

          {/* VIEW: Product Scanner */}
          {currentView === 'scanner' && (
            <ProductScanner
              onAnalyze={handleAnalyzeProduct}
              onSelectSample={handleSelectSample}
              samples={scans.slice(0, 3)}
              currentUser={currentUser}
              isAnalyzing={isAnalyzing}
            />
          )}

          {/* VIEW: Inspection Result (Scan ➔ OCR ➔ AI Check ➔ Result) */}
          {currentView === 'result' && selectedScan && (
            <InspectionResultScreen
              scan={selectedScan}
              currentUser={currentUser}
              onGenerateReport={(scanId) => handleGenerateReport(scanId)}
              onGenerateCertificate={(scanId) => handleGenerateReport(scanId)}
              onNewScan={() => setCurrentView('scanner')}
              onBackToScanner={() => setCurrentView('scanner')}
              onViewViolations={() => setCurrentView('violations')}
              onUpdateDeclaration={handleUpdateDeclaration}
            />
          )}

          {/* VIEW: Violation Center */}
          {currentView === 'violations' && (
            <ViolationCenter
              violations={violations}
              currentUser={currentUser}
              onResolveViolation={handleResolveViolation}
              onViewEvidence={(scanId, box) => handleViewEvidence(scanId, box)}
            />
          )}

          {/* VIEW: Compliance Reports */}
          {currentView === 'reports' && (
            <div>
              {selectedReport ? (
                <ComplianceReportView
                  report={selectedReport}
                  onBack={() => setCurrentView('reports')}
                />
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                      <FileCheck2 className="h-4 w-4" />
                      <span>Statutory Records</span>
                    </div>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">Compliance Inspection Reports</h2>
                    <p className="text-xs font-medium text-slate-600">
                      Select a product to view or generate its official Legal Metrology inspection certificate.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {scans.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleGenerateReport(s.id)}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-400 hover:shadow-xs transition-all shadow-2xs"
                      >
                        <div className="text-xs font-bold text-slate-900">{s.productName}</div>
                        <div className="text-[11px] font-medium text-slate-500">
                          {s.brand} • {s.complianceScore}% {s.verdict}
                        </div>
                        <div className="mt-3 text-right text-xs font-bold text-blue-700 hover:underline">
                          Generate PDF Certificate →
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: Product Repository */}
          {currentView === 'repository' && (
            <ProductRepository
              scans={scans}
              onSelectScan={(scanId) => {
                setSelectedScanId(scanId);
                setCurrentView('result');
              }}
              onOpenReport={handleGenerateReport}
            />
          )}

          {/* VIEW: Analytics */}
          {currentView === 'analytics' && (
            <AnalyticsDashboard scans={scans} violations={violations} />
          )}

          {/* VIEW: Rules & Standards */}
          {currentView === 'rules' && (
            <RulesManager
              rules={rules}
              onToggleRule={(ruleId, active) => {
                setRules((prev) =>
                  prev.map((r) => (r.id === ruleId ? { ...r, active } : r))
                );
                api.updateRule(ruleId, { active });
              }}
              onSaveRule={async (rule) => {
                if (rule.id) {
                  const updated = await api.updateRule(rule.id, rule);
                  setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
                } else {
                  const created = await api.createRule(rule);
                  setRules((prev) => [...prev, created]);
                }
              }}
              onDeleteRule={async (ruleId) => {
                await api.deleteRule(ruleId);
                setRules((prev) => prev.filter((r) => r.id !== ruleId));
              }}
            />
          )}

          {/* VIEW: Evidence Viewer */}
          {currentView === 'evidence' && selectedScan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                    <Eye className="h-4 w-4" />
                    <span>Digital Vault</span>
                  </div>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-900">Packaging Evidence Vault</h2>
                  <p className="text-xs font-medium text-slate-600">
                    High-resolution label evidence with extracted bounding box layers.
                  </p>
                </div>
                <button
                  onClick={() => handleViewEvidence(selectedScan.id)}
                  className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-sm"
                >
                  Open Evidence Modal
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {scans.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleViewEvidence(s.id)}
                    className="cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-3 hover:border-blue-400 hover:shadow-xs transition-all shadow-2xs"
                  >
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <img
                        src={s.imageUrl}
                        alt={s.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-2 text-xs font-bold text-slate-900">{s.productName}</div>
                    <div className="text-[10px] font-medium text-slate-500">
                      {s.declarations.length} Bounding Boxes • {s.violations.length} Violations
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: Users & Access Control */}
          {currentView === 'users' && (
            <UsersView
              users={allUsers}
              currentUser={currentUser}
              onSelectUser={(u) => setCurrentUser(u)}
            />
          )}

          {/* VIEW: Settings */}
          {currentView === 'settings' && (
            <SettingsView
              config={config}
              onSaveConfig={(updated) => {
                setConfig((prev) => ({ ...prev, ...updated }));
                api.updateConfig(updated);
              }}
            />
          )}
        </main>
      </div>

      {/* Modal: Evidence Viewer */}
      {evidenceScan && (
        <EvidenceViewerModal
          scan={evidenceScan}
          initialBox={evidenceBox}
          onClose={() => {
            setEvidenceScan(null);
            setEvidenceBox(undefined);
          }}
        />
      )}

      {/* Modal: Notifications Drawer */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-700" />
                <h3 className="text-sm font-extrabold text-slate-900">Inspection Notifications</h3>
              </div>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {scans
                .filter((s) => s.requiresManualReview)
                .map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedScanId(s.id);
                      setCurrentView('queue');
                      setNotificationsOpen(false);
                    }}
                    className="cursor-pointer rounded-xl border border-amber-200 bg-amber-50 p-3 transition-colors hover:bg-amber-100/70"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                      <span>Officer Manual Review Required</span>
                    </div>
                    <div className="mt-1 font-bold text-slate-900">{s.productName}</div>
                    <div className="mt-0.5 text-[10px] text-slate-600 font-medium">
                      Score: {s.complianceScore}% • {s.declarations.filter((d) => d.status === 'low_confidence').length} low confidence fields
                    </div>
                  </div>
                ))}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-blue-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Google Cloud Vision OCR Online</span>
                </div>
                <div className="mt-1 text-[11px] font-medium text-slate-600">
                  Engine connected with Gemini 3.8 Flash multimodal structured extraction.
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-3 text-right">
              <button
                onClick={() => setNotificationsOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
