import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit3,
  ZoomIn,
  ZoomOut,
  FileCheck2,
  Scale,
  RotateCcw,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Scan, Declaration, User } from '../../types';

interface OcrReviewScreenProps {
  scan: Scan;
  currentUser: User;
  onUpdateDeclaration: (
    declarationId: string,
    value: string,
    status: 'detected' | 'low_confidence' | 'missing' | 'invalid_format',
    remarks: string
  ) => void;
  onGenerateReport: (scanId: string) => void;
  onViewViolations: () => void;
}

export const OcrReviewScreen: React.FC<OcrReviewScreenProps> = ({
  scan,
  currentUser,
  onUpdateDeclaration,
  onGenerateReport,
}) => {
  const [selectedDecId, setSelectedDecId] = useState<string | null>(
    scan.declarations[0]?.id || null
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [editingDec, setEditingDec] = useState<Declaration | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editStatus, setEditStatus] = useState<
    'detected' | 'low_confidence' | 'missing' | 'invalid_format'
  >('detected');
  const [editRemarks, setEditRemarks] = useState<string>('');

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

  return (
    <div className="space-y-6">
      {/* Top Banner: Product & Compliance Status */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700">OCR & Mandatory Declaration Inspection</span>
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Compliance Score</div>
              <div className="text-2xl font-black text-slate-900">{scan.complianceScore}%</div>
            </div>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                scan.verdict === 'COMPLIANT'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : scan.verdict === 'NON-COMPLIANT'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {scan.verdict}
            </span>
          </div>

          <button
            onClick={() => onGenerateReport(scan.id)}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition-all active:scale-98"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Generate Official Certificate</span>
          </button>
        </div>
      </div>

      {/* Manual Review Alert if flagged */}
      {scan.requiresManualReview && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-2xs">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-xs">
            <span className="font-extrabold">Legal Metrology Officer Review Required:</span> This packaged commodity
            has one or more low-confidence OCR reads or non-standard formatting. As an authorized officer, you can
            verify the declarations directly and override values using the "Edit / Verify" tool.
          </div>
        </div>
      )}

      {/* Split-Screen: LEFT (Image & Bounding Boxes) | RIGHT (Declarations List) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: Product Image with Interactive Bounding Boxes */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Packaging Label Evidence</span>
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
                {showBoxes ? 'Boxes Visible' : 'Hide Boxes'}
              </button>
            </div>
          </div>

          {/* Image & Bounding Boxes Canvas */}
          <div className="relative mt-4 flex min-h-[460px] max-h-[560px] flex-1 items-center justify-center overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-2 shadow-inner">
            <div
              className="relative transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <img
                src={scan.imageUrl}
                alt={scan.productName}
                className="max-h-[500px] w-auto rounded-lg object-contain"
              />

              {/* Bounding Boxes Layer */}
              {showBoxes &&
                scan.declarations.map((dec) => {
                  if (!dec.boundingBox) return null;
                  const isSelected = selectedDecId === dec.id;
                  const isViolation = dec.status === 'missing' || dec.status === 'invalid_format';
                  const isReview = dec.status === 'low_confidence';

                  let borderColor = 'border-cyan-400 bg-cyan-500/20 text-cyan-200';
                  if (isSelected) {
                    borderColor = 'border-white bg-blue-600/30 ring-3 ring-blue-500 text-white shadow-xl';
                  } else if (isViolation) {
                    borderColor = 'border-rose-500 bg-rose-500/20 text-rose-200';
                  } else if (isReview) {
                    borderColor = 'border-amber-400 bg-amber-500/20 text-amber-200';
                  } else {
                    borderColor = 'border-emerald-400 bg-emerald-500/20 text-emerald-200';
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
              <span>Valid Passed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-amber-500" />
              <span>Low Confidence</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-rose-600" />
              <span>Statutory Violation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-600 ring-2 ring-blue-300" />
              <span>Selected Item</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Mandatory Extracted Declarations List */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Mandatory Rule 6 Declarations</h3>
              <p className="text-[11px] font-medium text-slate-500">Legal Metrology (Packaged Commodities) Rules, 2011</p>
            </div>
            <span className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[10px] font-bold text-blue-900">
              {scan.declarations.filter((d) => d.status === 'detected').length} / {scan.declarations.length} Detected
            </span>
          </div>

          {/* Declarations Items List */}
          <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto pr-1">
            {scan.declarations.map((dec) => {
              const isSelected = selectedDecId === dec.id;
              return (
                <div
                  key={dec.id}
                  onClick={() => setSelectedDecId(dec.id)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-400'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{dec.label}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-slate-600">
                          {dec.ruleCode}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] font-medium text-slate-500">
                        {dec.legalReference}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          dec.status === 'detected'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : dec.status === 'low_confidence'
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : 'bg-rose-50 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {dec.status === 'detected' && <CheckCircle2 className="h-3 w-3" />}
                        {dec.status === 'low_confidence' && <AlertTriangle className="h-3 w-3" />}
                        {dec.status === 'missing' && <XCircle className="h-3 w-3" />}
                        {dec.status === 'invalid_format' && <AlertCircle className="h-3 w-3" />}
                        <span className="capitalize">{dec.status.replace('_', ' ')}</span>
                      </span>

                      {/* Officer Edit Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(dec);
                        }}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:border-blue-500 hover:text-blue-700 shadow-2xs"
                        title="Officer Manual Verify / Override"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Detected Value */}
                  <div className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-900">
                    {dec.officerOverride ? (
                      <div>
                        <div className="text-[11px] text-blue-800 font-bold">
                          Officer Verified: {dec.officerOverride.value}
                        </div>
                        <div className="text-[9px] text-slate-500">
                          Raw OCR: {dec.detectedValue || 'None'}
                        </div>
                      </div>
                    ) : (
                      dec.detectedValue || (
                        <span className="italic font-sans text-rose-700 font-semibold">Declaration not found on packaging</span>
                      )
                    )}
                  </div>

                  {/* Confidence Bar & Format Guidance */}
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">
                      Standard: <span className="text-slate-800 font-semibold">{dec.expectedFormat || 'Rule standard'}</span>
                    </span>
                    <span className="font-bold text-blue-700">
                      Confidence: {dec.confidence}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Officer Manual Edit / Verify Modal */}
      {editingDec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-700" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Officer Declaration Verification
                </h3>
              </div>
              <button
                onClick={() => setEditingDec(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">Statutory Declaration</label>
                <div className="mt-1 font-bold text-blue-800">
                  {editingDec.label} ({editingDec.ruleCode})
                </div>
                <div className="text-[11px] font-medium text-slate-500">{editingDec.legalReference}</div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Verified Value on Physical Packaging</label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Enter officer verified text/value..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Compliance Assessment Status</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="detected">Passed / Compliant (Valid)</option>
                  <option value="low_confidence">Low Confidence / Ambiguous</option>
                  <option value="invalid_format">Invalid Format / Non-standard unit</option>
                  <option value="missing">Statutory Declaration Missing</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Officer Inspection Remarks</label>
                <textarea
                  rows={3}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="e.g. Verified with physical sample in batch; print verified legible under magnifier."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-[11px] font-medium text-blue-950">
                Auditor: <span className="font-bold">{currentUser.name}</span> ({currentUser.badgeNumber || 'Inspector'})
                • Changes are cryptographically timestamped in statutory inspection audit logs.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingDec(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800"
              >
                <Save className="h-4 w-4" />
                <span>Save & Recalculate Score</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
