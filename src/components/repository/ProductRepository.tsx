import React, { useState } from 'react';
import {
  Search,
  Clock,
} from 'lucide-react';
import { Scan } from '../../types';

interface ProductRepositoryProps {
  scans: Scan[];
  onSelectScan: (scanId: string) => void;
  onOpenReport: (scanId: string) => void;
}

export const ProductRepository: React.FC<ProductRepositoryProps> = ({
  scans,
  onSelectScan,
  onOpenReport,
}) => {
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('all');
  const [selectedTimelineScan, setSelectedTimelineScan] = useState<Scan | null>(
    scans[0] || null
  );

  const filtered = scans.filter((s) => {
    if (verdictFilter !== 'all' && s.verdict !== verdictFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.productName.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.barcode && s.barcode.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-700">Commodity Catalog</span>
          <span className="text-xs text-slate-300">•</span>
          <span className="text-xs font-semibold text-slate-500">Inspection History & Timeline</span>
        </div>
        <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
          Packaged Commodities Repository
        </h2>
        <p className="text-xs font-medium text-slate-600">
          Searchable catalog of all scanned products, verified batches, and regulatory enforcement history.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commodity name, brand, or barcode..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Verdicts</option>
            <option value="COMPLIANT">Compliant Only</option>
            <option value="NEEDS MANUAL REVIEW">Needs Review Only</option>
            <option value="NON-COMPLIANT">Non-Compliant Only</option>
          </select>
        </div>
      </div>

      {/* Grid: Scans List (Left) + Timeline / Inspection Detail (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Product Scans Table / Cards */}
        <div className="space-y-3 lg:col-span-7">
          {filtered.map((scan) => {
            const isSelected = selectedTimelineScan?.id === scan.id;
            return (
              <div
                key={scan.id}
                onClick={() => setSelectedTimelineScan(scan)}
                className={`cursor-pointer rounded-xl border p-4 transition-all shadow-2xs ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-400'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <img
                        src={scan.imageUrl}
                        alt={scan.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900">{scan.productName}</h3>
                      <p className="text-[11px] font-medium text-slate-600">
                        {scan.brand} • {scan.packagingType}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{new Date(scan.scanDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Auditor: {scan.inspectorName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Verdict */}
                  <div className="text-right shrink-0">
                    <span
                      className={`rounded px-2.5 py-0.5 text-[10px] font-bold ${
                        scan.verdict === 'COMPLIANT'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : scan.verdict === 'NON-COMPLIANT'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {scan.complianceScore}% {scan.verdict.split(' ')[0]}
                    </span>
                    <div className="mt-2.5 flex items-center justify-end gap-2 text-[10px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectScan(scan.id);
                        }}
                        className="font-bold text-blue-700 hover:underline"
                      >
                        OCR Review
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReport(scan.id);
                        }}
                        className="font-bold text-slate-700 hover:text-slate-900 hover:underline"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Inspection Timeline & Audit trail */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-5">
          {selectedTimelineScan ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold text-slate-900">Inspection Audit Trail</h3>
                <span className="font-mono text-[10px] font-bold text-blue-800">
                  {selectedTimelineScan.id}
                </span>
              </div>

              {/* Product Snippet */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <img
                  src={selectedTimelineScan.imageUrl}
                  alt={selectedTimelineScan.productName}
                  className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {selectedTimelineScan.productName}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500">
                    {selectedTimelineScan.brand} • {selectedTimelineScan.packagingType}
                  </div>
                </div>
              </div>

              {/* Step-by-step Audit Timeline */}
              <div className="mt-5 space-y-4 border-l-2 border-slate-200 pl-4 text-xs">
                {/* 1. Label Upload */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="font-bold text-slate-900">Product Label Image Uploaded</div>
                  <div className="text-[10px] font-medium text-slate-500">
                    Logged by {selectedTimelineScan.inspectorName} ({selectedTimelineScan.inspectorBadge})
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(selectedTimelineScan.scanDate).toLocaleTimeString()}
                  </div>
                </div>

                {/* 2. OCR Detection */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="font-bold text-slate-900">Cloud Vision OCR Processed</div>
                  <div className="text-[10px] font-medium text-slate-500">
                    DOCUMENT_TEXT_DETECTION extracted {selectedTimelineScan.ocrResult?.blocks.length || 8} text blocks. Average confidence: {selectedTimelineScan.breakdown.ocrConfidence}%.
                  </div>
                </div>

                {/* 3. Statutory Extraction */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-600 ring-4 ring-white" />
                  <div className="font-bold text-slate-900">Mandatory Declarations Evaluated</div>
                  <div className="text-[10px] font-medium text-slate-500">
                    {selectedTimelineScan.declarations.length} statutory declarations identified under Rule 6 of PCR 2011.
                  </div>
                </div>

                {/* 4. Violations & Legal Rules */}
                <div className="relative">
                  <span
                    className={`absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                      selectedTimelineScan.violations.length > 0 ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                  />
                  <div className="font-bold text-slate-900">
                    {selectedTimelineScan.violations.length > 0
                      ? `${selectedTimelineScan.violations.length} Violations Logged`
                      : 'All Statutory Checks Passed'}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500">
                    {selectedTimelineScan.violations.length > 0
                      ? selectedTimelineScan.violations.map((v) => v.ruleCode).join(', ')
                      : 'Complies with mandatory packaging specifications.'}
                  </div>
                </div>

                {/* 5. Final Status */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <div className="font-bold text-slate-900">Digital Inspection Certificate Ready</div>
                  <div className="text-[10px] font-medium text-slate-500">
                    Overall Score: {selectedTimelineScan.complianceScore}% • {selectedTimelineScan.verdict}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => onSelectScan(selectedTimelineScan.id)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs"
                >
                  Open OCR Review
                </button>
                <button
                  onClick={() => onOpenReport(selectedTimelineScan.id)}
                  className="flex-1 rounded-xl bg-blue-700 py-2 text-center text-xs font-bold text-white shadow-sm hover:bg-blue-800"
                >
                  View Certificate
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Select a commodity from the list to view its inspection history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
