import React from 'react';

interface OfficialStampProps {
  verdict?: 'COMPLIANT' | 'NON-COMPLIANT' | 'NEEDS MANUAL REVIEW' | string;
  reportNumber?: string;
  dateStr?: string;
  officerBadge?: string;
  className?: string;
}

/**
 * High-authenticity Indian Directorate of Legal Metrology official circular ink seal/stamp
 */
export const OfficialStamp: React.FC<OfficialStampProps> = ({
  verdict = 'COMPLIANT',
  reportNumber = 'LM-INSP-2026',
  dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  officerBadge = 'LM-INSP-4091',
  className = '',
}) => {
  const isCompliant = verdict === 'COMPLIANT';
  const isNonCompliant = verdict === 'NON-COMPLIANT';

  // Ink stamp color styling
  const colorScheme = isCompliant
    ? {
        border: 'border-emerald-700',
        text: 'text-emerald-800',
        ring: 'ring-emerald-700/20',
        bg: 'bg-emerald-50/20',
        badge: 'bg-emerald-800 text-white',
        svgStroke: '#047857',
        svgFill: '#065f46',
      }
    : isNonCompliant
    ? {
        border: 'border-rose-700',
        text: 'text-rose-800',
        ring: 'ring-rose-700/20',
        bg: 'bg-rose-50/20',
        badge: 'bg-rose-800 text-white',
        svgStroke: '#be123c',
        svgFill: '#9f1239',
      }
    : {
        border: 'border-amber-700',
        text: 'text-amber-800',
        ring: 'ring-amber-700/20',
        bg: 'bg-amber-50/20',
        badge: 'bg-amber-800 text-white',
        svgStroke: '#b45309',
        svgFill: '#92400e',
      };

  return (
    <div
      className={`relative select-none transition-transform duration-300 hover:rotate-0 -rotate-3 ${className}`}
      title="Official Directorate of Legal Metrology Seal"
    >
      {/* Outer Stamp Circle */}
      <div
        className={`relative flex h-36 w-36 sm:h-40 sm:w-40 flex-col items-center justify-center rounded-full border-4 border-dashed ${colorScheme.border} p-1.5 shadow-xs`}
        style={{
          boxShadow: isCompliant
            ? '0 0 0 3px rgba(4,120,87,0.18), inset 0 0 0 2px rgba(4,120,87,0.45)'
            : isNonCompliant
            ? '0 0 0 3px rgba(190,18,60,0.18), inset 0 0 0 2px rgba(190,18,60,0.45)'
            : '0 0 0 3px rgba(180,83,9,0.18), inset 0 0 0 2px rgba(180,83,9,0.45)',
        }}
      >
        {/* Inner Solid Border Ring */}
        <div
          className={`flex h-full w-full flex-col items-center justify-between rounded-full border-2 border-double ${colorScheme.border} py-2 px-1 text-center`}
        >
          {/* Top Arc Text Simulation */}
          <div className="text-[7.5px] font-black uppercase tracking-wider text-slate-800" style={{ letterSpacing: '0.08em' }}>
            ★ GOVT OF INDIA ★
          </div>
          <div className="text-[6.5px] font-bold uppercase tracking-tight text-slate-700 -mt-1">
            LEGAL METROLOGY DEPT
          </div>

          {/* Central Emblem & Status */}
          <div className="my-0.5 flex flex-col items-center justify-center">
            {/* Ashoka Pillar Lion / Scale Symbol Representation */}
            <svg
              className="h-5 w-5 my-0.5 opacity-90"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colorScheme.svgStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
              <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
              <path d="M7 21h10" />
              <path d="M12 3v18" />
              <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
            </svg>

            {/* Stamp Decision Badge */}
            <div
              className={`rounded px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-widest ${colorScheme.badge} shadow-2xs`}
            >
              {isCompliant ? 'VERIFIED PASSED' : isNonCompliant ? 'REJECTED / NOTICE' : 'ACTION PENDING'}
            </div>
            <div className="mt-0.5 font-mono text-[7px] font-bold tracking-tight text-slate-700">
              {dateStr}
            </div>
          </div>

          {/* Bottom Arc Text */}
          <div className="space-y-0.5">
            <div className="font-mono text-[6.5px] font-extrabold uppercase text-slate-700 tracking-wider">
              {officerBadge}
            </div>
            <div className="text-[6px] font-extrabold uppercase tracking-widest text-slate-600">
              PCR 2011 • SEC 18
            </div>
          </div>
        </div>

        {/* Faint Authenticated Stamp Watermark Text */}
        <div
          className="pointer-events-none absolute -rotate-45 text-[7px] font-black uppercase tracking-widest opacity-15"
          style={{ color: colorScheme.svgStroke }}
        >
          {reportNumber.slice(0, 14)}
        </div>
      </div>
    </div>
  );
};

interface OfficerSignatureProps {
  inspectorName: string;
  inspectorBadge: string;
  inspectorDepartment?: string;
  verificationDate?: string;
  signatureDataUrl?: string;
  className?: string;
}

/**
 * Realistic cursive physical officer signature with digital cryptographic badge & timestamp
 */
export const OfficerSignature: React.FC<OfficerSignatureProps> = ({
  inspectorName,
  inspectorBadge,
  inspectorDepartment = 'Directorate of Legal Metrology, Government of India',
  verificationDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }),
  signatureDataUrl,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-start ${className}`}>
      {/* Ink cursive handwritten signature or drawn canvas signature */}
      <div className="relative h-14 w-44 flex items-center">
        {signatureDataUrl ? (
          <img
            src={signatureDataUrl}
            alt={`Signature of ${inspectorName}`}
            className="h-full w-full object-contain select-none"
          />
        ) : (
          <svg
            className="h-full w-full select-none"
            viewBox="0 0 200 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Realistic handwritten fluid strokes in classic blue ballpoint ink (#1e3a8a / #1d4ed8) */}
            <path
              d="M 12 38 Q 28 8, 42 22 T 55 45 Q 65 15, 80 28 T 98 42 Q 112 12, 126 30 Q 140 46, 158 20 T 178 35 Q 188 40, 194 36"
              stroke="#1d4ed8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M 32 30 C 50 18, 62 48, 88 34 C 114 20, 130 52, 165 32"
              stroke="#1e40af"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            {/* Underline flourish */}
            <path
              d="M 20 48 Q 90 42, 175 46 Q 185 47, 192 44"
              stroke="#1e3a8a"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Dot flourish */}
            <circle cx="186" cy="38" r="1.5" fill="#1e3a8a" />
          </svg>
        )}

        {/* Small e-sign verification chip */}
        <div className="absolute -top-1 right-0 rounded border border-blue-200 bg-blue-50/90 px-1.5 py-0.5 text-[8px] font-bold text-blue-900 shadow-2xs backdrop-blur-xs">
          DSC VALIDATED
        </div>
      </div>

      {/* Signature Line */}
      <div className="mt-1 h-0.5 w-48 bg-slate-400" />

      {/* Officer Credential block */}
      <div className="mt-2 space-y-0.5 text-left">
        <div className="text-xs font-black text-slate-900 flex items-center gap-1">
          <span>{inspectorName}</span>
          <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-bold text-slate-600">
            Authorized Inspector
          </span>
        </div>
        <div className="text-[10px] font-medium text-slate-600 leading-tight max-w-xs">
          {inspectorDepartment}
        </div>
        <div className="flex items-center gap-2 pt-0.5 font-mono text-[9.5px]">
          <span className="font-bold text-blue-700">Badge ID: {inspectorBadge}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">Date: {verificationDate}</span>
        </div>
      </div>
    </div>
  );
};
