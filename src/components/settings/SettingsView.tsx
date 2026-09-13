import React, { useState } from 'react';
import {
  Cpu,
  Save,
  CheckCircle2,
  Layers,
  Camera,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { SystemConfig } from '../../types';

interface SettingsViewProps {
  config: SystemConfig;
  onSaveConfig: (updated: Partial<SystemConfig>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, onSaveConfig }) => {
  const [mode, setMode] = useState<'demo' | 'live'>(config.mode);
  const [ocrConfidenceThreshold, setOcrConfidenceThreshold] = useState<number>(
    config.ocrConfidenceThreshold
  );
  const [manualReviewThreshold, setManualReviewThreshold] = useState<number>(
    config.manualReviewThreshold
  );
  const [autoFlagViolations, setAutoFlagViolations] = useState<boolean>(
    config.autoFlagViolations
  );
  const [multiPanelInspection, setMultiPanelInspection] = useState<boolean>(true);
  const [enforceRule6Strictness, setEnforceRule6Strictness] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    onSaveConfig({
      mode,
      ocrConfidenceThreshold,
      manualReviewThreshold,
      autoFlagViolations,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700">PackSure Regulatory Suite</span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">System & Engine Configuration</span>
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
            PackSure AI Engine Settings
          </h2>
          <p className="text-xs font-medium text-slate-600">
            Calibrate OCR document detection thresholds, multi-image packaging audits, and Legal Metrology Rule 6 statutory enforcement.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition-all active:scale-98"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-900 shadow-2xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          <span>System configuration successfully saved and applied.</span>
        </div>
      )}

      {/* Cloud Vision & Dual-Engine Status Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Google Cloud Vision & Multimodal Engine
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Dual-engine OCR with Gemini multimodal structured extraction and location mapping
              </p>
            </div>
          </div>

          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
            ENGINE ONLINE
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Multimodal AI</span>
            <div className="mt-1 font-extrabold text-slate-900">Gemini Flash Multimodal</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Optical Character Engine</span>
            <div className="mt-1 font-extrabold text-blue-700">Google Cloud Vision OCR</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Statutory Framework</span>
            <div className="mt-1 font-extrabold text-slate-800">Legal Metrology Rules, 2011</div>
          </div>
        </div>
      </div>

      {/* Multi-Image & Camera Configuration */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-700" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Multi-Image & Packaging Panel Settings
          </h3>
        </div>

        {/* Multi-Panel Joint Inspection Switch */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="text-xs font-bold text-slate-900">Multi-Panel Joint Inspection</div>
            <div className="text-[11px] font-medium text-slate-500">
              Jointly evaluate front, back, and side panels in a single unified AI audit run.
            </div>
          </div>

          <button
            onClick={() => setMultiPanelInspection(!multiPanelInspection)}
            className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
              multiPanelInspection ? 'bg-blue-700' : 'bg-slate-300'
            }`}
          >
            <div
              className={`h-4 w-4 rounded-full bg-white transition-transform ${
                multiPanelInspection ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Rule 6 Strictness */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="text-xs font-bold text-slate-900">Rule 6 Statutory Strictness</div>
            <div className="text-[11px] font-medium text-slate-500">
              Enforce exact phrase matching for "(inclusive of all taxes)", SI unit symbols ("N", "g", "ml"), and manufacturer PIN code.
            </div>
          </div>

          <button
            onClick={() => setEnforceRule6Strictness(!enforceRule6Strictness)}
            className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
              enforceRule6Strictness ? 'bg-blue-700' : 'bg-slate-300'
            }`}
          >
            <div
              className={`h-4 w-4 rounded-full bg-white transition-transform ${
                enforceRule6Strictness ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mode & Threshold Controls */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-blue-700" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Compliance & Scoring Calibration
          </h3>
        </div>

        {/* Mode Switch */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="text-xs font-bold text-slate-900">Operating Mode</div>
            <div className="text-[11px] font-medium text-slate-500">
              Demo dataset runs with pre-calibrated sample packages; Live mode executes on-device capture and deep AI analysis.
            </div>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              onClick={() => setMode('demo')}
              className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
                mode === 'demo' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demo Data
            </button>
            <button
              onClick={() => setMode('live')}
              className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
                mode === 'live' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live API
            </button>
          </div>
        </div>

        {/* OCR Confidence Threshold Slider */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">OCR Confidence Threshold</div>
              <div className="text-[11px] font-medium text-slate-500">
                Minimum character confidence threshold before flagging a declaration for inspection review.
              </div>
            </div>
            <span className="font-mono text-sm font-black text-blue-700">
              {ocrConfidenceThreshold}%
            </span>
          </div>

          <input
            type="range"
            min={50}
            max={95}
            step={1}
            value={ocrConfidenceThreshold}
            onChange={(e) => setOcrConfidenceThreshold(Number(e.target.value))}
            className="mt-3 w-full accent-blue-700"
          />
        </div>

        {/* Auto flag switch */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="text-xs font-bold text-slate-900">Auto-Flag Critical Violations</div>
            <div className="text-[11px] font-medium text-slate-500">
              Instantly draft statutory notices when mandatory declarations (MRP, Net Quantity, Manufacturer details) are missing or non-standard.
            </div>
          </div>

          <button
            onClick={() => setAutoFlagViolations(!autoFlagViolations)}
            className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
              autoFlagViolations ? 'bg-blue-700' : 'bg-slate-300'
            }`}
          >
            <div
              className={`h-4 w-4 rounded-full bg-white transition-transform ${
                autoFlagViolations ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
