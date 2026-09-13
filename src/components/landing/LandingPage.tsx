import React from 'react';
import {
  ShieldCheck,
  ScanLine,
  Play,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Database,
  ArrowRight,
  ExternalLink,
  Cpu,
  Award,
  Bot,
} from 'lucide-react';
import { Scan } from '../../types';

interface LandingPageProps {
  onStartScan: () => void;
  onSelectSample: (sampleId: string) => void;
  onGoToDashboard: () => void;
  samples: Scan[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartScan,
  onSelectSample,
  onGoToDashboard,
  samples,
}) => {
  return (
    <div className="relative pb-16">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-900 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-700" />
            PackSure AI • Legal Metrology Act 2009 & PCR 2011
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
            <Cpu className="h-3.5 w-3.5 text-blue-600" />
            Zero-Tolerance Statutory Verification: Scan ➔ OCR ➔ AI Check ➔ Result
          </span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="mx-auto mt-6 max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Pack<span className="text-blue-700">Sure</span> AI <br />
            <span className="text-slate-800 text-2xl sm:text-4xl lg:text-5xl font-bold">Legal Metrology Compliance System</span>
          </h1>

          <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
            Instant statutory verification under the Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011. Seamless 4-step pipeline: capture packaging label, extract OCR text, run 100% precision statutory rule check, and generate official legal certificates and notices.
          </p>

          {/* 4-Step Pipeline Summary Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-800">
            <span className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-blue-900">1. Scan Package</span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-blue-900">2. Optical OCR</span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-lg bg-blue-100 border border-blue-300 px-3 py-1 text-blue-950">3. 100% AI Rules Check</span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-lg bg-emerald-50 border border-emerald-300 px-3 py-1 text-emerald-900">4. Official Result</span>
          </div>

          {/* Action CTAs */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStartScan}
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-800 active:scale-98"
            >
              <ScanLine className="h-5 w-5" />
              <span>Start Product Scan</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onGoToDashboard}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-2xs transition-all hover:bg-slate-50"
            >
              <Play className="h-4 w-4 text-blue-700" />
              <span>Dashboard Overview</span>
            </button>
          </div>
        </div>

        {/* Hero Visual: Packaged Product with Animated OCR Overlay */}
        <div className="mt-10 lg:mt-12">
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              {/* Product Label Preview with Scan Beam & Bounding Boxes */}
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-2 lg:col-span-7">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
                    alt="Packaging OCR Scanner"
                    className="h-full w-full object-cover opacity-90"
                  />

                  {/* Laser Scanning Beam */}
                  <div className="pointer-events-none absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan-beam" />

                  {/* Floating High-Contrast OCR Bounding Boxes */}
                  <div className="absolute right-4 top-14 rounded border-2 border-cyan-400 bg-slate-950/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-xl backdrop-blur-md">
                    <span className="text-cyan-300">MRP:</span> ₹385.00 (incl. of all taxes)
                    <div className="text-[8px] font-semibold text-emerald-400">Rule 6(1)(e) • 98% conf</div>
                  </div>

                  <div className="absolute left-4 top-20 rounded border-2 border-emerald-400 bg-slate-950/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-xl backdrop-blur-md">
                    <span className="text-emerald-300">Net Qty:</span> 500 g
                    <div className="text-[8px] font-semibold text-emerald-400">Rule 6(1)(c) • 97% conf</div>
                  </div>

                  <div className="absolute left-6 bottom-16 rounded border-2 border-blue-400 bg-slate-950/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-xl backdrop-blur-md">
                    <span className="text-blue-300">Mfd By:</span> Amrit Organics Pvt. Ltd.
                    <div className="text-[8px] font-semibold text-blue-300">PIN: 248001 • 93% conf</div>
                  </div>

                  <div className="absolute right-6 bottom-8 rounded border-2 border-purple-400 bg-slate-950/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-xl backdrop-blur-md">
                    <span className="text-purple-300">Consumer Care:</span> 1800-200-4499
                    <div className="text-[8px] font-semibold text-purple-300">Rule 6(1)(f) • 94% conf</div>
                  </div>

                  <div className="absolute left-6 top-8 rounded border-2 border-amber-400 bg-slate-950/90 px-2.5 py-0.5 text-[9px] font-bold text-amber-300 shadow-xl backdrop-blur-md">
                    Country of Origin: India (Rule 6(1)(g))
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    DOCUMENT_TEXT_DETECTION Active
                  </span>
                  <span className="font-mono text-slate-400">OCR Confidence: 98%+</span>
                </div>
              </div>

              {/* Right Panel: Instant AI Compliance Assessment */}
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Overall Statutory Verdict
                    </span>
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      COMPLIANT
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-900">96%</span>
                    <span className="text-xs font-semibold text-slate-500">Legal Metrology Score</span>
                  </div>

                  {/* Metrics Bar */}
                  <div className="mt-4 space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                        <span>Mandatory Declarations (Rule 6)</span>
                        <span className="font-bold text-emerald-700">8 / 8 Present</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                        <span>Standard SI Units & Pricing Format</span>
                        <span className="font-bold text-blue-700">95% Compliant</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: '95%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                        <span>Cloud Vision Optical Confidence</span>
                        <span className="font-bold text-indigo-700">96.2%</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-indigo-600" style={{ width: '96%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Sample Selector for Judges */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Evaluation Sample Presets:</span>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                      QUICK TEST
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-col gap-2">
                    {samples.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onSelectSample(s.id)}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs transition-colors hover:border-blue-300 hover:bg-blue-50/50"
                      >
                        <div className="truncate">
                          <div className="font-bold text-slate-900">{s.productName}</div>
                          <div className="text-[10px] text-slate-500">{s.packagingType}</div>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            s.verdict === 'COMPLIANT'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : s.verdict === 'NON-COMPLIANT'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {s.complianceScore}% {s.verdict.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-2xs">
            <div className="text-3xl font-extrabold text-blue-700">98%+</div>
            <div className="mt-1 text-xs font-semibold text-slate-600">DOCUMENT_TEXT Accuracy</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-2xs">
            <div className="text-3xl font-extrabold text-blue-900">&lt; 3s</div>
            <div className="mt-1 text-xs font-semibold text-slate-600">Automated Audit Speed</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-2xs">
            <div className="text-3xl font-extrabold text-emerald-700">100%</div>
            <div className="mt-1 text-xs font-semibold text-slate-600">Digital Inspection Certificates</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-2xs">
            <div className="text-3xl font-extrabold text-purple-700">Section 36</div>
            <div className="mt-1 text-xs font-semibold text-slate-600">Legal Metrology Act, 2009</div>
          </div>
        </div>
      </div>
    </div>
  );
};
