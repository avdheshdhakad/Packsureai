import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { Scan, BoundingBox } from '../../types';

interface EvidenceViewerModalProps {
  scan: Scan;
  initialBox?: BoundingBox;
  onClose: () => void;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  scan,
  initialBox,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [filterMode, setFilterMode] = useState<'all' | 'violations' | 'declarations'>('all');
  const [highlightBox, setHighlightBox] = useState<BoundingBox | undefined>(initialBox);

  // Available images list: either from scan.images or fallback to scan.imageUrl
  const imageList = scan.images && scan.images.length > 0 
    ? scan.images 
    : [{ id: 'img-main', url: scan.imageUrl, panelType: 'Primary Packaging Label', label: 'Primary Panel' }];

  const currentImage = imageList[selectedImageIndex] || imageList[0];

  // Matched violation if highlighting a box
  const matchedViolation = highlightBox
    ? scan.violations.find((v) => v.boundingBox && v.boundingBox.x === highlightBox.x && v.boundingBox.y === highlightBox.y)
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">Packaging Evidence & Violation Location</h2>
                {matchedViolation && (
                  <span className="rounded bg-rose-100 border border-rose-300 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                    📍 {matchedViolation.locationOnPackage || 'Flagged Statutory Location'}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-600">
                {scan.productName} • {scan.brand} • Scan ID: {scan.id}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Multi-Panel Selector if multiple images */}
            {imageList.length > 1 && (
              <div className="flex items-center rounded-lg border border-blue-200 bg-blue-50 p-1 text-xs">
                {imageList.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`rounded px-2.5 py-1 text-[10px] font-bold transition-colors ${
                      selectedImageIndex === idx
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-blue-900 hover:bg-blue-100'
                    }`}
                  >
                    {img.label || img.panelType || `Panel ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Filter Toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`rounded px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  filterMode === 'all' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Boxes
              </button>
              <button
                onClick={() => setFilterMode('violations')}
                className={`rounded px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  filterMode === 'violations' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Violations Only
              </button>
              <button
                onClick={() => setFilterMode('declarations')}
                className={`rounded px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  filterMode === 'declarations' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Passed Only
              </button>
            </div>

            {/* Zoom controls */}
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 shadow-2xs"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 shadow-2xs"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 shadow-2xs"
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="relative flex flex-1 items-center justify-center overflow-auto bg-slate-950 p-4">
          <div
            className="relative transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <img
              src={currentImage.url}
              alt="Packaging Evidence"
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
            />

            {/* Render Bounding Boxes */}
            {scan.declarations.map((dec) => {
              if (!dec.boundingBox) return null;
              const isViolation = dec.status === 'missing' || dec.status === 'invalid';
              const isPassed = dec.status === 'detected';

              if (filterMode === 'violations' && !isViolation) return null;
              if (filterMode === 'declarations' && !isPassed) return null;

              const isHighlighted =
                highlightBox &&
                highlightBox.x === dec.boundingBox.x &&
                highlightBox.y === dec.boundingBox.y;

              let styleClass = 'border-cyan-400 bg-cyan-500/20 text-cyan-200';
              if (isHighlighted) {
                styleClass =
                  'border-white bg-rose-600/40 ring-4 ring-rose-400 text-white shadow-2xl animate-pulse';
              } else if (isViolation) {
                styleClass = 'border-rose-500 bg-rose-500/25 text-rose-200';
              } else if (isPassed) {
                styleClass = 'border-emerald-400 bg-emerald-500/20 text-emerald-200';
              }

              return (
                <div
                  key={dec.id}
                  onClick={() => setHighlightBox(dec.boundingBox)}
                  style={{
                    position: 'absolute',
                    left: `${dec.boundingBox.x}%`,
                    top: `${dec.boundingBox.y}%`,
                    width: `${dec.boundingBox.width}%`,
                    height: `${dec.boundingBox.height}%`,
                  }}
                  className={`group cursor-pointer rounded border-2 transition-all ${styleClass}`}
                >
                  <div className="absolute -top-6 left-0 whitespace-nowrap rounded bg-slate-950/95 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-lg backdrop-blur-sm">
                    {dec.label}: {dec.detectedValue || 'MISSING'} ({dec.confidence}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-600 font-semibold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Passed: {scan.declarations.filter((d) => d.status === 'detected').length}
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <ShieldAlert className="h-4 w-4" />
              Violations: {scan.violations.length}
            </span>
          </div>

          <div className="text-[11px] font-medium text-slate-500">
            Click any bounding box to highlight. Evidence certified under Legal Metrology Act, 2009.
          </div>
        </div>
      </div>
    </div>
  );
};
