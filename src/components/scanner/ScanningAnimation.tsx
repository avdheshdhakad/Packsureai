import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  ScanLine,
  Sparkles,
  ShieldCheck,
  Search,
  FileCheck,
  Scale,
} from 'lucide-react';

interface ScanningAnimationProps {
  currentStage: number; // 1 to 4
  stageMessage?: string;
}

export const ScanningAnimation: React.FC<ScanningAnimationProps> = ({
  currentStage,
  stageMessage,
}) => {
  const stages = [
    {
      num: '01',
      title: '1. Scan Packaging Label',
      desc: 'Optical clarity, resolution, and multi-panel image ingestion',
    },
    {
      num: '02',
      title: '2. Optical Character Recognition (OCR)',
      desc: 'Extracting text tokens, words, numerals, and spatial coordinates',
    },
    {
      num: '03',
      title: '3. 100% AI Statutory Rules Check',
      desc: 'Legal Metrology Act, 2009 & PCR 2011 clause-by-clause audit',
    },
    {
      num: '04',
      title: '4. Generate Inspection Result',
      desc: 'Statutory compliance score, verdict, notice & certificate',
    },
  ];

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <ScanLine className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">PackSure AI Inspection Pipeline</h3>
            <p className="text-[11px] text-cyan-400">Scan ➔ OCR ➔ AI Check ➔ Result</p>
          </div>
        </div>

        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-300">
          STAGE 0{Math.min(currentStage, 4)} / 04
        </span>
      </div>

      {/* Animated Stages List */}
      <div className="mt-5 space-y-3">
        {stages.map((stage, idx) => {
          const stageIndex = idx + 1;
          const isDone = currentStage > stageIndex;
          const isCurrent = currentStage === stageIndex;
          const isPending = currentStage < stageIndex;

          return (
            <div
              key={stage.num}
              className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                isCurrent
                  ? 'border-cyan-500/50 bg-cyan-950/40 shadow-md shadow-cyan-950/50'
                  : isDone
                  ? 'border-emerald-500/30 bg-emerald-950/20'
                  : 'border-slate-800/80 bg-slate-950/40 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950'
                      : isCurrent
                      ? 'bg-cyan-500 text-slate-950 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : stage.num}
                </span>

                <div>
                  <div
                    className={`text-xs font-bold ${
                      isDone
                        ? 'text-emerald-300'
                        : isCurrent
                        ? 'text-cyan-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.title}
                  </div>
                  <div className="text-[11px] text-slate-400">{stage.desc}</div>
                </div>
              </div>

              {/* Status Indicator */}
              <div>
                {isDone && (
                  <span className="text-[10px] font-bold text-emerald-400">✓ Done</span>
                )}
                {isCurrent && (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-cyan-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
                {isPending && (
                  <span className="text-[10px] text-slate-600">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Realtime Feedback Message */}
      {stageMessage && (
        <div className="mt-4 rounded-lg bg-slate-950/80 p-2.5 text-center text-xs font-medium text-slate-300 border border-slate-800">
          <span className="text-cyan-400 font-bold">Active Pipeline:</span> {stageMessage}
        </div>
      )}
    </div>
  );
};
