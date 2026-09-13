import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  RotateCcw,
  CheckCircle2,
  Stamp,
  ShieldCheck,
  Award,
  Calendar,
  UserCheck,
  Type,
  X,
  FileCheck2,
} from 'lucide-react';
import { User, ComplianceVerdict } from '../../types';

export interface SignOffData {
  signed: boolean;
  signedBy: string;
  signedAt: string;
  badgeNumber: string;
  department: string;
  signatureDataUrl?: string;
  signatureType: 'draw' | 'typed';
  sealPlaced: boolean;
  sealPlacement: 'bottom_center' | 'bottom_right' | 'top_right';
  sealType: string;
  notes?: string;
}

interface DigitalSignaturePadProps {
  currentUser: User;
  verdict: ComplianceVerdict;
  scanProductName: string;
  reportNumber?: string;
  initialSignOff?: SignOffData;
  onSignOffComplete: (data: SignOffData) => void;
  onClose?: () => void;
  inline?: boolean;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  currentUser,
  verdict,
  scanProductName,
  reportNumber = 'LM-INSP-2026',
  initialSignOff,
  onSignOffComplete,
  onClose,
  inline = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'typed'>(
    initialSignOff?.signatureType || 'draw'
  );
  const [typedName, setTypedName] = useState<string>(currentUser.name || '');
  const [sealPlaced, setSealPlaced] = useState<boolean>(
    initialSignOff?.sealPlaced !== undefined ? initialSignOff.sealPlaced : true
  );
  const [sealPlacement, setSealPlacement] = useState<'bottom_center' | 'bottom_right' | 'top_right'>(
    initialSignOff?.sealPlacement || 'bottom_center'
  );
  const [sealType, setSealType] = useState<string>(
    initialSignOff?.sealType || 'Central Legal Metrology Verification Seal'
  );
  const [officerNotes, setOfficerNotes] = useState<string>(
    initialSignOff?.notes || 'Statutory review executed pursuant to Section 15 of Legal Metrology Act, 2009.'
  );

  // Initialize canvas
  useEffect(() => {
    if (signatureMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1d4ed8'; // Classic blue ballpoint ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // If an existing signature is provided, draw it onto canvas
        if (initialSignOff?.signatureDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setHasDrawn(true);
          };
          img.src = initialSignOff.signatureDataUrl;
        }
      }
    }
  }, [signatureMode, initialSignOff]);

  // Coordinate helper for canvas
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Generate cursive SVG typed signature data URL
  const generateTypedSignatureDataUrl = (name: string): string => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="150" viewBox="0 0 400 150">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&amp;display=swap');
          .sig-text { font-family: 'Caveat', cursive, sans-serif; font-size: 52px; fill: #1d4ed8; }
        </style>
      </defs>
      <text x="20" y="80" class="sig-text">${name}</text>
      <path d="M 20 110 Q 150 95, 360 110" stroke="#1e3a8a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="366" cy="108" r="3" fill="#1e3a8a"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  };

  const handleSubmit = () => {
    let signatureUrl = '';

    if (signatureMode === 'draw') {
      if (canvasRef.current && hasDrawn) {
        signatureUrl = canvasRef.current.toDataURL('image/png');
      } else {
        // Fallback to generated typed signature if canvas wasn't drawn
        signatureUrl = generateTypedSignatureDataUrl(currentUser.name);
      }
    } else {
      signatureUrl = generateTypedSignatureDataUrl(typedName || currentUser.name);
    }

    const signOffData: SignOffData = {
      signed: true,
      signedBy: typedName || currentUser.name,
      signedAt: new Date().toISOString(),
      badgeNumber: currentUser.badgeNumber || 'LM-INSP-4091',
      department: 'Directorate of Legal Metrology, Government of India',
      signatureDataUrl: signatureUrl,
      signatureType: signatureMode,
      sealPlaced,
      sealPlacement,
      sealType,
      notes: officerNotes,
    };

    onSignOffComplete(signOffData);
  };

  const isCompliant = verdict === 'COMPLIANT';
  const isNonCompliant = verdict === 'NON-COMPLIANT';

  const containerContent = (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Legal Metrology Officer Sign-Off & Official Seal</span>
              <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-900 border border-blue-200">
                Rule 15/18
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Directly authenticate packaging audit findings for{' '}
              <span className="font-bold text-slate-800">{scanProductName}</span>
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Officer Credential Bar */}
      <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3 text-xs">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-blue-700" />
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Authorized Officer</div>
            <div className="font-bold text-slate-900">{currentUser.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-600" />
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Statutory Badge ID</div>
            <div className="font-mono font-bold text-slate-900">
              {currentUser.badgeNumber || 'LM-INSP-4091'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Signing Timestamp</div>
            <div className="font-semibold text-slate-700">
              {new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Signature Pad (Left) & Automated Seal Settings (Right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT: DIGITAL SIGNATURE PAD */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3 lg:col-span-7 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <PenTool className="h-4 w-4 text-blue-700" />
              <span>Inspector Digital Signature</span>
            </div>

            {/* Mode Switcher: Draw vs Typed */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSignatureMode('draw')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                  signatureMode === 'draw'
                    ? 'bg-white text-blue-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="h-3 w-3" />
                <span>Draw Pen</span>
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('typed')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                  signatureMode === 'typed'
                    ? 'bg-white text-blue-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="h-3 w-3" />
                <span>Type Digital</span>
              </button>
            </div>
          </div>

          {signatureMode === 'draw' ? (
            <div>
              <div className="relative rounded-xl border-2 border-dashed border-blue-300 bg-slate-50/50 p-1">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="h-[125px] w-full touch-none cursor-crosshair rounded-lg bg-white"
                />
                {!hasDrawn && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <PenTool className="h-5 w-5 opacity-40 mb-1" />
                    <span className="text-[11px] font-semibold">
                      Draw your signature here with cursor or touch
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-medium">
                      Authentic legal metrology officer ink sign-off
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  Classic Blue Government Fountain Ink (#1d4ed8)
                </span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-98 shadow-2xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                  <span>Clear Pad</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Officer Name / Title</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Inspector R. K. Sharma"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Live Preview of Cursive Script */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 text-center">
                <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                  Digital Script Rendering:
                </div>
                <div
                  className="text-2xl text-blue-800 select-none py-1"
                  style={{
                    fontFamily: "'Brush Script MT', 'Caveat', cursive, sans-serif",
                    letterSpacing: '0.05em',
                  }}
                >
                  {typedName || currentUser.name}
                </div>
                <div className="mx-auto mt-1 h-0.5 w-36 bg-blue-400/80" />
                <div className="mt-1 text-[9.5px] font-mono text-blue-700">
                  Cryptographically Bound • DSC Validated
                </div>
              </div>
            </div>
          )}

          {/* Officer Certification Remarks */}
          <div>
            <label className="text-[11px] font-bold text-slate-700">
              Statutory Sign-Off Determination Notes
            </label>
            <textarea
              rows={2}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="e.g. Scanned packaging verified physically. Mandatory declarations audited under PCR 2011."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* RIGHT: AUTOMATED SEAL PLACEMENT OVERLAY */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3 lg:col-span-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Stamp className="h-4 w-4 text-emerald-700" />
              <span>Automated Seal Placement</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sealPlaced}
                onChange={(e) => setSealPlaced(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {sealPlaced ? (
            <div className="space-y-3">
              {/* Miniature Stamp Preview */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center">
                <div
                  className={`relative flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed p-1 shadow-2xs ${
                    isCompliant
                      ? 'border-emerald-700 bg-emerald-50/50 text-emerald-900'
                      : isNonCompliant
                      ? 'border-rose-700 bg-rose-50/50 text-rose-900'
                      : 'border-amber-700 bg-amber-50/50 text-amber-900'
                  }`}
                >
                  <div className="text-[5.5px] font-black uppercase tracking-wider">
                    ★ GOVT OF INDIA ★
                  </div>
                  <div className="text-[5px] font-bold uppercase">LEGAL METROLOGY</div>
                  <div
                    className={`mt-0.5 rounded px-1 py-0.2 text-[6.5px] font-black uppercase ${
                      isCompliant
                        ? 'bg-emerald-800 text-white'
                        : isNonCompliant
                        ? 'bg-rose-800 text-white'
                        : 'bg-amber-800 text-white'
                    }`}
                  >
                    {isCompliant ? 'VERIFIED' : isNonCompliant ? 'NOTICE' : 'PENDING'}
                  </div>
                  <div className="mt-0.5 font-mono text-[5px] font-bold">
                    {currentUser.badgeNumber || 'LM-4091'}
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-bold text-slate-700">
                  {sealType}
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  PCR 2011 • Sec 18 • Automated Placement Active
                </div>
              </div>

              {/* Placement Position Picker */}
              <div>
                <label className="text-[11px] font-bold text-slate-700">
                  Certificate Placement Position
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setSealPlacement('bottom_center')}
                    className={`rounded-lg border p-1.5 text-center transition-all ${
                      sealPlacement === 'bottom_center'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Bottom Center
                  </button>
                  <button
                    type="button"
                    onClick={() => setSealPlacement('bottom_right')}
                    className={`rounded-lg border p-1.5 text-center transition-all ${
                      sealPlacement === 'bottom_right'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Bottom Right
                  </button>
                  <button
                    type="button"
                    onClick={() => setSealPlacement('top_right')}
                    className={`rounded-lg border p-1.5 text-center transition-all ${
                      sealPlacement === 'top_right'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Top Header
                  </button>
                </div>
              </div>

              {/* Seal Type Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-700">Department Seal Type</label>
                <select
                  value={sealType}
                  onChange={(e) => setSealType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="Central Legal Metrology Verification Seal">
                    Central Legal Metrology Verification Seal (Primary)
                  </option>
                  <option value="State Metrological Standards Laboratory Seal">
                    State Metrological Standards Laboratory Seal
                  </option>
                  <option value="Statutory Market Surveillance Direct Seal">
                    Statutory Market Surveillance Direct Seal
                  </option>
                </select>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
              Automated seal stamp is disabled. Only the officer signature will be affixed to the report.
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-98 shadow-2xs"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800 active:scale-98"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Confirm Officer Sign-Off & Apply Seal</span>
        </button>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-xs">
        {containerContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
        {containerContent}
      </div>
    </div>
  );
};
