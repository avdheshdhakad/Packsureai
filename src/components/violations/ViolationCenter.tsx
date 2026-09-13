import React, { useState } from 'react';
import {
  CheckCircle2,
  Filter,
  Eye,
  Scale,
  Check,
  MapPin,
  Compass,
} from 'lucide-react';
import { Violation, User } from '../../types';

interface ViolationCenterProps {
  violations: Violation[];
  currentUser: User;
  onResolveViolation: (violationId: string) => void;
  onViewEvidence: (scanId: string, boundingBox?: any) => void;
}

export const ViolationCenter: React.FC<ViolationCenterProps> = ({
  violations,
  onResolveViolation,
  onViewEvidence,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [panelFilter, setPanelFilter] = useState<string>('all');
  const [searchQuery] = useState<string>('');

  const filteredViolations = violations.filter((v) => {
    if (severityFilter !== 'all' && v.severity !== severityFilter) return false;
    if (statusFilter === 'unresolved' && v.resolved) return false;
    if (statusFilter === 'resolved' && !v.resolved) return false;
    if (panelFilter !== 'all') {
      const panel = (v.panelName || v.locationOnPackage || '').toLowerCase();
      if (!panel.includes(panelFilter.toLowerCase())) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.ruleCode.toLowerCase().includes(q) ||
        (v.locationOnPackage && v.locationOnPackage.toLowerCase().includes(q)) ||
        v.legalReference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = violations.filter((v) => v.severity === 'critical' && !v.resolved).length;
  const highCount = violations.filter((v) => v.severity === 'high' && !v.resolved).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-700">Statutory Infractions</span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">Legal Metrology Act, 2009 (Sec 36)</span>
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
            Packaging Violation Center
          </h2>
          <p className="text-xs font-medium text-slate-600">
            Recorded statutory non-compliances flagged with precise physical package location & legal inspection notices.
          </p>
        </div>

        {/* Severity Metrics Pills */}
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-rose-800">Critical</div>
            <div className="text-xl font-black text-rose-700">{criticalCount}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-amber-800">High</div>
            <div className="text-xl font-black text-amber-700">{highCount}</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Severity:</span>

          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Compass className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Panel:</span>
          <select
            value={panelFilter}
            onChange={(e) => setPanelFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Panels & Locations</option>
            <option value="back">Back Panel</option>
            <option value="front">Front / PDP</option>
            <option value="side">Side Panel</option>
            <option value="bottom">Bottom Panel</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="unresolved">Unresolved Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Violations Cards Grid */}
      {filteredViolations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-2xs">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <h3 className="mt-3 text-base font-bold text-slate-900">No Active Violations Found</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">
            All scanned packaged commodities under this filter meet statutory Legal Metrology requirements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredViolations.map((v) => {
            const isResolved = v.resolved;
            return (
              <div
                key={v.id}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-2xs ${
                  isResolved
                    ? 'border-emerald-200 bg-emerald-50/40 opacity-80'
                    : v.severity === 'critical'
                    ? 'border-rose-300 bg-rose-50/40'
                    : v.severity === 'high'
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  {/* Card Header: Severity & Rule Code */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          v.severity === 'critical'
                            ? 'bg-rose-600 text-white'
                            : v.severity === 'high'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {v.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {v.ruleCode}
                      </span>
                    </div>

                    {isResolved ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Resolved
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                        Action Required
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="mt-2.5 text-sm font-bold text-slate-900">{v.title}</h3>

                  {/* Location of Violation (Prominently Highlighted) */}
                  <div className="mt-2.5 rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-[11px] shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <MapPin className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                        <span>Location of Violation on Packaging</span>
                      </div>
                      <span className="rounded bg-amber-200/70 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-900">
                        X: {v.boundingBox?.x || 50}% • Y: {v.boundingBox?.y || 30}%
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md border border-amber-300 bg-white px-2 py-0.5 font-bold text-slate-900">
                        📍 {v.locationOnPackage || `${v.panelName || 'Back Panel'} — Quadrant (X: ${v.boundingBox?.x || 50}%, Y: ${v.boundingBox?.y || 30}%)`}
                      </span>
                      {v.inspectionLocation && (
                        <span className="rounded-md border border-amber-200 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          🏢 Site: {v.inspectionLocation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detected vs Expected Box */}
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 text-[11px] shadow-2xs">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-bold">Detected Value:</span>
                      <span className="font-mono font-bold text-rose-700">
                        {v.detectedValue || 'MISSING / UNDETECTED'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-bold">Statutory Standard:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {v.expectedValue}
                      </span>
                    </div>
                  </div>

                  {/* Legal Clause Reference */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <Scale className="h-3.5 w-3.5 text-blue-700" />
                    <span>Statutory Reference: {v.legalReference}</span>
                  </div>

                  {/* Recommended Action */}
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-700">
                    <span className="font-bold text-slate-900">Recommended Action: </span>
                    {v.recommendedAction}
                  </div>

                  {isResolved && v.resolvedBy && (
                    <div className="mt-2 text-[10px] text-emerald-800 font-semibold">
                      ✓ Resolved by Officer {v.resolvedBy} on {new Date(v.resolvedAt!).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                  <button
                    onClick={() => onViewEvidence(v.scanId, v.boundingBox)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Pinpoint & View Evidence</span>
                  </button>

                  {!isResolved && (
                    <button
                      onClick={() => onResolveViolation(v.id)}
                      className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
