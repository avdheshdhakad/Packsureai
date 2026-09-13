import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Scale,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Bot,
  ScanLine,
  Search,
  ArrowRight,
  ShieldCheck,
  Building,
  Calendar,
  IndianRupee,
  PhoneCall,
  Globe,
  Tag,
  Edit3,
  Save,
  Layers,
  FileText,
  AlertOctagon,
  Eye,
  PenTool,
  Stamp,
  BadgeCheck,
} from 'lucide-react';
import { Scan, Declaration, User, StatutoryAuditCheckItem } from '../../types';
import { DigitalSignaturePad, SignOffData } from './DigitalSignaturePad';

interface InspectionResultScreenProps {
  scan: Scan;
  currentUser: User;
  onUpdateDeclaration: (
    declarationId: string,
    value: string,
    status: 'detected' | 'low_confidence' | 'missing' | 'invalid_format',
    remarks: string
  ) => void;
  onGenerateReport?: (scanId: string) => void;
  onGenerateCertificate?: (scanId: string) => void;
  onNewScan?: () => void;
  onBackToScanner?: () => void;
  onViewViolations?: () => void;
  onSaveSignOff?: (scanId: string, signOff: SignOffData) => void;
}

export const InspectionResultScreen: React.FC<InspectionResultScreenProps> = ({
  scan,
  currentUser,
  onUpdateDeclaration,
  onGenerateReport,
  onGenerateCertificate,
  onNewScan,
  onBackToScanner,
  onViewViolations,
}) => {
  const triggerGenerateReport = (scanId: string) => {
    if (typeof onGenerateReport === 'function') {
      onGenerateReport(scanId);
    } else if (typeof onGenerateCertificate === 'function') {
      onGenerateCertificate(scanId);
    }
  };

  const triggerNewScan = () => {
    if (typeof onNewScan === 'function') {
      onNewScan();
    } else if (typeof onBackToScanner === 'function') {
      onBackToScanner();
    }
  };

  const triggerViewViolations = () => {
    if (typeof onViewViolations === 'function') {
      onViewViolations();
    }
  };

  const [activeTab, setActiveTab] = useState<'ai-rules' | 'ocr-text' | 'violations' | 'signoff'>('ai-rules');
  const [selectedDecId, setSelectedDecId] = useState<string | null>(
    scan.declarations[0]?.id || null
  );
  const [selectedPanelIndex, setSelectedPanelIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showSealOverlay, setShowSealOverlay] = useState<boolean>(true);

  // Quick officer edit states
  const [editingDec, setEditingDec] = useState<Declaration | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editStatus, setEditStatus] = useState<
    'detected' | 'low_confidence' | 'missing' | 'invalid_format'
  >('detected');
  const [editRemarks, setEditRemarks] = useState<string>('');

  // Digital Signature Pad & Seal Overlay state
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState<boolean>(false);
  const [localSignOff, setLocalSignOff] = useState<SignOffData | null>(
    (scan.inspectorSignOff as SignOffData) || null
  );

  const handleSignOffComplete = (data: SignOffData) => {
    setLocalSignOff(data);
    setIsSignOffModalOpen(false);
    if (onSaveSignOff) {
      onSaveSignOff(scan.id, data);
    }
  };

  // Handle multi-panel packaging
  const panels = scan.images && scan.images.length > 0
    ? scan.images
    : [{ id: 'img-1', url: scan.imageUrl, label: 'Primary Display Panel' }];

  const currentPanel = panels[selectedPanelIndex] || panels[0];

  // Statutory audit items: take from scan.statutoryAudit or fallback to synthesized clauses
  const auditChecklist: StatutoryAuditCheckItem[] =
    scan.statutoryAudit?.checklist && scan.statutoryAudit.checklist.length > 0
      ? scan.statutoryAudit.checklist
      : generateFallbackChecklist(scan);

  const handleStartEdit = (dec: Declaration) => {
    setEditingDec(dec);
    setEditValue(dec.officerOverride?.value || dec.detectedValue || '');
    setEditStatus(dec.status);
    setEditRemarks(dec.officerOverride?.remarks || '');
  };

  const handleSaveEdit = () => {
    if (!editingDec) return;
    onUpdateDeclaration(editingDec.id, editValue, editStatus, editRemarks);
    setEditingDec(null);
  };

  const isCompliant = scan.verdict === 'COMPLIANT';
  const isNonCompliant = scan.verdict === 'NON-COMPLIANT';

  return (
    <div className="space-y-6">
      {/* 4-STAGE PIPELINE PROGRESS STEPPER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          {/* Stage 1 */}
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
              ✓ 1
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-emerald-900 truncate">1. Scan Packaging</div>
              <div className="text-[10px] text-emerald-700">Label captured & verified</div>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
              ✓ 2
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-emerald-900 truncate">2. OCR Text Extraction</div>
              <div className="text-[10px] text-emerald-700">
                {scan.breakdown.ocrConfidence}% character confidence
              </div>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-2.5 shadow-2xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white font-bold text-xs shadow-2xs">
              ✓ 3
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-blue-950 truncate">3. 100% AI Rules Check</div>
              <div className="text-[10px] text-blue-800 font-medium">Act 2009 & PCR 2011 Audited</div>
            </div>
          </div>

          {/* Stage 4 */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-900 text-white p-2.5 shadow-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-900 font-bold text-xs">
              ✓ 4
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white truncate">4. Result & Enforcement</div>
              <div className="text-[10px] text-slate-300">
                Score: {scan.complianceScore}% ({scan.verdict})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP INSPECTION HEADER */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700">Official Statutory Inspection Result</span>
            <span className="text-xs text-slate-300">•</span>
            <span className="font-mono text-xs text-slate-500">ID: {scan.id}</span>
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
            {scan.productName}
          </h2>
          <p className="text-xs font-semibold text-slate-600">
            Brand: <span className="text-slate-900">{scan.brand}</span> • Category: {scan.category} • Packaging: {scan.packagingType}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Verdict and Score */}
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Statutory Score
              </div>
              <div className="text-2xl font-black text-slate-900">{scan.complianceScore}%</div>
            </div>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                isCompliant
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : isNonCompliant
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {scan.verdict}
            </span>
          </div>

          {/* Action: New Scan */}
          <button
            onClick={triggerNewScan}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-98"
          >
            <ScanLine className="h-4 w-4 text-blue-700" />
            <span>Scan Another</span>
          </button>

          {/* Action: Officer Sign-Off & Seal */}
          <button
            onClick={() => setIsSignOffModalOpen(true)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold shadow-2xs transition-all active:scale-98 ${
              localSignOff?.signed
                ? 'border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                : 'border border-blue-400 bg-blue-50 text-blue-900 hover:bg-blue-100'
            }`}
          >
            {localSignOff?.signed ? (
              <>
                <BadgeCheck className="h-4 w-4 text-emerald-700" />
                <span>Signed & Sealed</span>
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4 text-blue-700" />
                <span>Officer Sign-Off & Seal</span>
              </>
            )}
          </button>

          {/* Action: Generate Report */}
          <button
            onClick={() => triggerGenerateReport(scan.id)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 active:scale-98"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Generate Official Certificate</span>
          </button>
        </div>
      </div>

      {/* OFFICER MANUAL REVIEW BANNER IF FLAGGED */}
      {scan.requiresManualReview && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-2xs">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold">Legal Metrology Officer Review Required:</span> This packaged commodity
            has one or more non-standard formats or low-confidence reads. You can review the declarations in the OCR tab and override values as authorized under Section 18.
          </div>
        </div>
      )}

      {/* SPLIT SCREEN: LEFT (SCANNED LABEL + BOUNDING BOXES) | RIGHT (AI RULES CHECK & OCR) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: VISUAL PACKAGING & OPTICAL EVIDENCE */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Scanned Packaging Label</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                Zoom: {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            {/* Canvas Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50 shadow-2xs"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50 shadow-2xs"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50 shadow-2xs"
                title="Reset Zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowBoxes(!showBoxes)}
                className={`rounded-lg border px-2 py-1 text-xs font-bold transition-colors shadow-2xs ${
                  showBoxes
                    ? 'border-blue-300 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {showBoxes ? 'OCR Boxes Visible' : 'Hide Boxes'}
              </button>
              {localSignOff?.sealPlaced && (
                <button
                  onClick={() => setShowSealOverlay(!showSealOverlay)}
                  className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold transition-colors shadow-2xs ${
                    showSealOverlay
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                  title="Toggle official automated stamp on packaging preview"
                >
                  <Stamp className="h-3.5 w-3.5 text-indigo-700" />
                  <span>{showSealOverlay ? 'Seal Overlay On' : 'Show Seal'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Panel Selector (for multi-panel packages) */}
          {panels.length > 1 && (
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">Panels:</span>
              {panels.map((p, idx) => (
                <button
                  key={p.id || idx}
                  onClick={() => setSelectedPanelIndex(idx)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all shrink-0 ${
                    selectedPanelIndex === idx
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p.label || `Panel ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Image & Bounding Boxes Canvas */}
          <div className="relative mt-3 flex min-h-[460px] max-h-[560px] flex-1 items-center justify-center overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-2 shadow-inner">
            <div
              className="relative transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <img
                src={currentPanel.url}
                alt={scan.productName}
                className="max-h-[500px] w-auto rounded-lg object-contain"
              />

              {/* Automated Official Seal & Signature Placement Overlay */}
              {localSignOff && localSignOff.signed && localSignOff.sealPlaced && showSealOverlay && (
                <div
                  className={`absolute pointer-events-none transition-all duration-300 z-20 ${
                    localSignOff.sealPlacement === 'top_right'
                      ? 'top-3 right-3'
                      : localSignOff.sealPlacement === 'bottom_center'
                      ? 'bottom-3 left-1/2 -translate-x-1/2'
                      : 'bottom-3 right-3'
                  }`}
                >
                  <div className="flex flex-col items-center rounded-xl bg-slate-900/80 p-2.5 border border-indigo-400/50 shadow-2xl backdrop-blur-md">
                    {/* Official Circular Stamp Overlay */}
                    <div
                      className={`relative flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-dashed bg-white/95 p-1 text-center shadow-lg ${
                        isCompliant
                          ? 'border-emerald-700 text-emerald-950'
                          : isNonCompliant
                          ? 'border-rose-700 text-rose-950'
                          : 'border-amber-700 text-amber-950'
                      }`}
                    >
                      <div className="text-[5px] font-black uppercase tracking-widest text-slate-800">
                        ★ GOVT OF INDIA ★
                      </div>
                      <div className="text-[5.5px] font-extrabold uppercase leading-tight">
                        LEGAL METROLOGY
                      </div>
                      <div
                        className={`my-0.5 rounded px-1.5 py-0.2 text-[6.5px] font-black uppercase shadow-xs ${
                          isCompliant
                            ? 'bg-emerald-800 text-white'
                            : isNonCompliant
                            ? 'bg-rose-800 text-white'
                            : 'bg-amber-800 text-white'
                        }`}
                      >
                        {isCompliant ? 'VERIFIED' : isNonCompliant ? 'NON-COMPLIANT' : 'REVIEW'}
                      </div>
                      <div className="font-mono text-[5px] font-extrabold text-slate-700">
                        {localSignOff.badgeNumber || 'LM-4091'}
                      </div>
                      <div className="text-[4.5px] font-semibold text-slate-500">
                        {new Date(localSignOff.signedAt || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                    </div>

                    {/* Officer Signature Data Url if present */}
                    {localSignOff.signatureDataUrl && (
                      <div className="mt-1 h-7 w-24 overflow-hidden">
                        <img
                          src={localSignOff.signatureDataUrl}
                          alt="Officer Signature"
                          className="h-full w-full object-contain filter invert-0"
                        />
                      </div>
                    )}

                    <div className="mt-1 flex items-center gap-1 font-mono text-[7.5px] font-bold text-indigo-200">
                      <ShieldCheck className="h-2.5 w-2.5 text-indigo-400" />
                      <span>OFFICIALLY SEALED</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bounding Boxes Layer */}
              {showBoxes &&
                scan.declarations.map((dec) => {
                  if (!dec.boundingBox) return null;
                  const isSelected = selectedDecId === dec.id;
                  const isViolation = dec.status === 'missing' || dec.status === 'invalid_format';
                  const isReview = dec.status === 'low_confidence';

                  let borderColor = 'border-cyan-400 bg-cyan-500/20 text-cyan-200';
                  if (isSelected) {
                    borderColor = 'border-white bg-blue-600/35 ring-3 ring-blue-500 text-white shadow-xl';
                  } else if (isViolation) {
                    borderColor = 'border-rose-500 bg-rose-500/25 text-rose-200';
                  } else if (isReview) {
                    borderColor = 'border-amber-400 bg-amber-500/25 text-amber-200';
                  } else {
                    borderColor = 'border-emerald-400 bg-emerald-500/25 text-emerald-200';
                  }

                  return (
                    <div
                      key={dec.id}
                      onClick={() => setSelectedDecId(dec.id)}
                      style={{
                        position: 'absolute',
                        left: `${dec.boundingBox.x}%`,
                        top: `${dec.boundingBox.y}%`,
                        width: `${dec.boundingBox.width}%`,
                        height: `${dec.boundingBox.height}%`,
                      }}
                      className={`group cursor-pointer rounded border-2 transition-all ${borderColor}`}
                      title={`${dec.label}: ${dec.detectedValue}`}
                    >
                      <div className="absolute -top-5 left-0 whitespace-nowrap rounded bg-slate-950/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md backdrop-blur-md">
                        {dec.label} ({dec.confidence}%)
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Bounding Box Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600 font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-600" />
              <span>Compliant Pass</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-amber-500" />
              <span>Review Needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-rose-600" />
              <span>Statutory Violation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-600 ring-2 ring-blue-300" />
              <span>Selected Box</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3 TABS (AI RULES CHECK, OCR TEXT, VIOLATIONS) */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs lg:col-span-6">
          {/* TAB HEADERS */}
          <div className="flex items-center border-b border-slate-200">
            <button
              onClick={() => setActiveTab('ai-rules')}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'ai-rules'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>100% AI Rules Check</span>
              <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-blue-900">
                Act 2009
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ocr-text')}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'ocr-text'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Extracted OCR & Declarations</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-slate-700">
                {scan.declarations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('violations')}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'violations'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Statutory Infractions</span>
              <span
                className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                  scan.violations.length > 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {scan.violations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('signoff')}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'signoff'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <PenTool className="h-4 w-4" />
              <span>Sign-Off & Seal</span>
              <span
                className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                  localSignOff?.signed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {localSignOff?.signed ? 'Signed' : 'Action'}
              </span>
            </button>
          </div>

          {/* TAB CONTENT 1: 100% AI RULES CHECK (LEGAL METROLOGY ACT 2009 & PCR 2011) */}
          {activeTab === 'ai-rules' && (
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950">
                    <ShieldCheck className="h-4 w-4 text-blue-700" />
                    <span>Statutory Legal Metrology Verification</span>
                  </div>
                  <span className="rounded bg-white border border-blue-200 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-900">
                    PCR 2011 / Sec 18 & 36
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-blue-900 leading-relaxed">
                  Every mandatory statutory clause evaluated under the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011.
                </p>
              </div>

              {/* Checklist Items */}
              {auditChecklist.map((item, idx) => {
                const isPass = item.status === 'PASS';
                const isFail = item.status === 'FAIL';
                const isWarning = item.status === 'WARNING';

                return (
                  <div
                    key={item.clauseCode || idx}
                    className={`rounded-xl border p-3.5 transition-all ${
                      isPass
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : isFail
                        ? 'border-rose-200 bg-rose-50/25'
                        : 'border-amber-200 bg-amber-50/25'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-slate-900">
                            {item.clauseCode}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {item.ruleName}
                          </span>
                        </div>
                        <div className="text-[10px] font-medium text-slate-500">
                          {item.legalSection}
                        </div>
                      </div>

                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                          isPass
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isFail
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Detected Content */}
                    <div className="mt-2.5 rounded-lg border border-slate-200 bg-white p-2 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Detected on Label:
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] font-semibold text-slate-900 break-words">
                        {item.detectedContent || 'Not Detected'}
                      </div>
                    </div>

                    {/* Statutory Requirement & Penalty */}
                    <div className="mt-2 flex flex-col gap-1 text-[11px] text-slate-600">
                      <div>
                        <span className="font-bold text-slate-700">Statutory Standard: </span>
                        {item.statutoryRequirement}
                      </div>
                      {isFail && (
                        <div className="text-rose-700 font-semibold">
                          <span className="font-bold text-rose-900">Penalty: </span>
                          {item.penaltyClause}
                        </div>
                      )}
                      <div className="text-slate-500 text-[10px]">
                        <span className="font-bold text-slate-600">Finding: </span>
                        {item.statutoryNotes}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB CONTENT 2: EXTRACTED OCR TEXT & DECLARATIONS */}
          {activeTab === 'ocr-text' && (
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {/* Full OCR Raw Text Transcript */}
              {scan.ocrResult?.fullText && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Raw Optical OCR Transcript</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {scan.ocrResult.confidence}% confidence
                    </span>
                  </div>
                  <pre className="mt-2 max-h-36 overflow-y-auto rounded-lg bg-white p-2 font-mono text-[10px] leading-relaxed text-slate-700 border border-slate-200 whitespace-pre-wrap">
                    {scan.ocrResult.fullText}
                  </pre>
                </div>
              )}

              {/* Declarations List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900">Extracted Declarations & Locations</div>
                {scan.declarations.map((dec) => {
                  const isSelected = selectedDecId === dec.id;
                  const isViolation = dec.status === 'missing' || dec.status === 'invalid_format';
                  const isReview = dec.status === 'low_confidence';

                  return (
                    <div
                      key={dec.id}
                      onClick={() => setSelectedDecId(dec.id)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600'
                          : isViolation
                          ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                          : isReview
                          ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                            {dec.ruleCode}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{dec.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              dec.status === 'detected'
                                ? 'bg-emerald-100 text-emerald-800'
                                : dec.status === 'low_confidence'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {dec.status === 'detected' ? 'Detected' : dec.status} ({dec.confidence}%)
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(dec);
                            }}
                            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-100"
                            title="Officer Override / Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-blue-700" />
                          </button>
                        </div>
                      </div>

                      {/* Detected Value */}
                      <div className="mt-2 text-xs font-medium text-slate-800 break-words">
                        <span className="text-slate-500 font-bold">Value: </span>
                        {dec.detectedValue || 'Not Found'}
                      </div>

                      {dec.locationOnPackage && (
                        <div className="mt-1 text-[10px] text-slate-500">
                          <span className="font-semibold">Package Zone: </span>
                          {dec.locationOnPackage}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: STATUTORY VIOLATIONS & ENFORCEMENT */}
          {activeTab === 'violations' && (
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {scan.violations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/40 p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                  <h3 className="mt-3 text-sm font-extrabold text-emerald-950">
                    100% Statutory Compliance Confirmed
                  </h3>
                  <p className="mt-1 text-xs text-emerald-800 max-w-md">
                    No violations detected under the Legal Metrology Act, 2009 or Legal Metrology (Packaged Commodities) Rules, 2011. This product conforms to all mandatory statutory declarations.
                  </p>
                  <button
                    onClick={() => triggerGenerateReport(scan.id)}
                    className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    <span>Generate Compliance Certificate</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/60 p-3">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="h-5 w-5 text-rose-700" />
                      <div>
                        <div className="text-xs font-bold text-rose-950">
                          {scan.violations.length} Statutory Infractions Detected
                        </div>
                        <div className="text-[10px] text-rose-800">
                          Violations subject to statutory notice under Section 18 / Section 36
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={triggerViewViolations}
                      className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-800"
                    >
                      Violation Center →
                    </button>
                  </div>

                  {scan.violations.map((viol, vIdx) => (
                    <div
                      key={viol.id || vIdx}
                      className="rounded-xl border border-rose-200 bg-rose-50/20 p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-900 border border-rose-200">
                            {viol.ruleCode}
                          </span>
                          <span className="ml-2 text-xs font-extrabold text-slate-900">
                            {viol.title}
                          </span>
                        </div>
                        <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                          {viol.severity}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 leading-relaxed">
                        {viol.description}
                      </div>

                      <div className="rounded-lg bg-white p-2 text-xs border border-slate-200 space-y-1">
                        <div>
                          <span className="font-bold text-slate-700">Legal Reference: </span>
                          <span className="text-blue-800 font-semibold">{viol.legalReference}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Statutory Action: </span>
                          <span className="text-slate-900">{viol.recommendedAction}</span>
                        </div>
                        {viol.penaltyClause && (
                          <div className="text-rose-700">
                            <span className="font-bold text-rose-900">Penalty Clause: </span>
                            {viol.penaltyClause}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 4: OFFICER SIGN-OFF & SEAL */}
          {activeTab === 'signoff' && (
            <div className="mt-4 flex-1 space-y-4 overflow-y-auto max-h-[520px] pr-1">
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-blue-700" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-950">
                        Authorized Legal Metrology Sign-Off
                      </h4>
                      <p className="text-[11px] text-blue-800">
                        Sign off on the statutory findings and place the automated department seal on this inspection.
                      </p>
                    </div>
                  </div>
                  {localSignOff?.signed ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      OFFICIALLY SIGNED
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Pending Sign-Off
                    </span>
                  )}
                </div>
              </div>

              {/* Digital Signature Pad inline view */}
              <DigitalSignaturePad
                currentUser={currentUser}
                verdict={scan.verdict}
                scanProductName={scan.productName}
                reportNumber={`LM-INSP-${scan.id.replace('scan-', '').toUpperCase()}-2026`}
                initialSignOff={localSignOff || undefined}
                onSignOffComplete={handleSignOffComplete}
                inline={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL: OFFICER QUICK OVERRIDE EDIT */}
      {editingDec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-sm font-extrabold text-slate-900">
              Officer Declaration Override / Verification
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Editing: <span className="font-bold text-slate-800">{editingDec.label}</span>
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Verified Field Value</label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Statutory Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="detected">Compliant / Verified</option>
                  <option value="low_confidence">Ambiguous Print / Warning</option>
                  <option value="invalid_format">Non-Standard Format (Violation)</option>
                  <option value="missing">Completely Missing (Critical Violation)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Officer Certification Remarks</label>
                <textarea
                  rows={2}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="e.g. Verified physically on retail carton by Inspector..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setEditingDec(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Override</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL SIGNATURE PAD & AUTOMATED SEAL PLACEMENT */}
      {isSignOffModalOpen && (
        <DigitalSignaturePad
          currentUser={currentUser}
          verdict={scan.verdict}
          scanProductName={scan.productName}
          reportNumber={`LM-INSP-${scan.id.replace('scan-', '').toUpperCase()}-2026`}
          initialSignOff={localSignOff || undefined}
          onSignOffComplete={handleSignOffComplete}
          onClose={() => setIsSignOffModalOpen(false)}
          inline={false}
        />
      )}
    </div>
  );
};

function generateFallbackChecklist(scan: Scan): StatutoryAuditCheckItem[] {
  const decs = scan.declarations || [];
  const getDec = (type: string) => decs.find((d) => d.type === type);

  const mfgDec = getDec('manufacturer_name_address');
  const genericDec = getDec('commodity_name');
  const netQtyDec = getDec('net_quantity');
  const dateDec = getDec('manufacturing_date');
  const mrpDec = getDec('mrp');
  const uspDec = getDec('unit_sale_price');
  const careDec = getDec('consumer_care_details');
  const originDec = getDec('country_of_origin');

  return [
    {
      clauseCode: 'Rule 6(1)(a)',
      ruleName: 'Manufacturer / Packer Address with PIN Code',
      status: mfgDec?.status === 'detected' ? 'PASS' : 'FAIL',
      statutoryRequirement: 'Complete legal name, street address, and valid 6-digit Indian PIN Code.',
      detectedContent: mfgDec?.detectedValue || 'Not Detected',
      legalSection: 'Rule 6(1)(a) — PCR, 2011 & Sec 18 LM Act, 2009',
      penaltyClause: 'Penalty up to ₹25,000 under Section 36(1) of Legal Metrology Act, 2009',
      statutoryNotes: mfgDec?.status === 'detected' ? 'Valid address declaration verified.' : 'Manufacturer address missing or incomplete.',
    },
    {
      clauseCode: 'Rule 6(1)(b)',
      ruleName: 'Generic or Common Commodity Name',
      status: genericDec?.status === 'detected' ? 'PASS' : 'WARNING',
      statutoryRequirement: 'Clear common or generic commodity name to prevent consumer deception.',
      detectedContent: genericDec?.detectedValue || 'Generic classification ambiguous',
      legalSection: 'Rule 6(1)(b) — PCR, 2011 & Sec 18 LM Act, 2009',
      penaltyClause: 'Inquiry under Section 18 / Section 36(1)',
      statutoryNotes: 'Generic identity of pre-packaged goods evaluated.',
    },
    {
      clauseCode: 'Rule 6(1)(c)',
      ruleName: 'Net Quantity in Standard SI Metric Units',
      status: netQtyDec?.status === 'detected' ? 'PASS' : 'FAIL',
      statutoryRequirement: 'Expressed in SI units (g, kg, ml, l, N). Non-standard abbreviations like "gms" prohibited.',
      detectedContent: netQtyDec?.detectedValue || 'Not Detected',
      legalSection: 'Rule 6(1)(c) & Rule 11 — PCR, 2011',
      penaltyClause: 'Penalty up to ₹25,000 under Section 36(1) of Legal Metrology Act, 2009',
      statutoryNotes: netQtyDec?.status === 'detected' ? 'Standard metric unit verified.' : 'Metric unit non-standard or missing.',
    },
    {
      clauseCode: 'Rule 6(1)(d)',
      ruleName: 'Month and Year of Manufacture / Packing',
      status: dateDec?.status === 'detected' ? 'PASS' : 'FAIL',
      statutoryRequirement: 'Clear declaration of month and year of manufacture, packing, or import.',
      detectedContent: dateDec?.detectedValue || 'Not Detected',
      legalSection: 'Rule 6(1)(d) — PCR, 2011',
      penaltyClause: 'Penalty up to ₹25,000 under Section 36(1) of Legal Metrology Act, 2009',
      statutoryNotes: 'Stamping of date verified.',
    },
    {
      clauseCode: 'Rule 6(1)(e)',
      ruleName: 'MRP with Tax Inclusivity Clause',
      status: mrpDec?.status === 'detected' ? 'PASS' : 'FAIL',
      statutoryRequirement: 'Maximum Retail Price with mandatory phrase "(inclusive of all taxes)".',
      detectedContent: mrpDec?.detectedValue || 'Not Detected',
      legalSection: 'Rule 6(1)(e) — PCR, 2011 & Sec 18 / 36(2) LM Act, 2009',
      penaltyClause: 'Penalty up to ₹25,000 under Section 36(1) of Legal Metrology Act, 2009',
      statutoryNotes: 'Tax inclusive pricing verified under Legal Metrology Rules.',
    },
    {
      clauseCode: 'Rule 6(1)(e)-USP',
      ruleName: 'Unit Sale Price (USP) per Unit',
      status: uspDec?.status === 'detected' ? 'PASS' : 'FAIL',
      statutoryRequirement: 'Price per gram/kg/ml/litre or count for consumer price transparency.',
      detectedContent: uspDec?.detectedValue || 'Not Detected',
      legalSection: 'Rule 6(1)(e) Proviso — PCR, 2011 (Amended 2022/2024)',
      penaltyClause: 'Penalty up to ₹25,000 under Section 36(1) of Legal Metrology Act, 2009',
      statutoryNotes: 'Unit sale price declaration evaluated.',
    },
    {
      clauseCode: 'Rule 6(1)(f)',
      ruleName: 'Consumer Care Helpline & Email ID',
      status: careDec?.status === 'detected' ? 'PASS' : 'FAIL',
      statutoryRequirement: 'Consumer care cell: Name/Designation, Address, Phone Helpline, and Email ID.',
      detectedContent: careDec?.detectedValue || 'Not Detected',
      legalSection: 'Rule 6(1)(f) — PCR, 2011 & Sec 18 LM Act, 2009',
      penaltyClause: 'Penalty up to ₹25,000 under Section 36(1) of Legal Metrology Act, 2009',
      statutoryNotes: 'Consumer grievance redressal channel evaluated.',
    },
    {
      clauseCode: 'Rule 6(1)(g)',
      ruleName: 'Country of Origin Declaration',
      status: originDec?.status === 'detected' ? 'PASS' : 'FAIL',
      statutoryRequirement: 'Package must explicitly declare country of origin.',
      detectedContent: originDec?.detectedValue || 'Not Detected',
      legalSection: 'Rule 6(1)(g) — PCR, 2011',
      penaltyClause: 'Penalty up to ₹25,000 under Section 36(1) of Legal Metrology Act, 2009',
      statutoryNotes: 'Country of origin verified on label.',
    },
  ];
}
