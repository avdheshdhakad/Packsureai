import React from 'react';
import {
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  ArrowLeft,
  Gavel,
  Clock,
  Building2,
  Award,
  BadgeCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { InspectionReport } from '../../types';
import { generateInspectionPDF } from '../../utils/pdfGenerator';
import { OfficialStamp, OfficerSignature } from './CertificateStampAndSignature';
import { deriveStatutoryActionOrder } from '../../utils/statutoryEnforcement';

interface ComplianceReportViewProps {
  report: InspectionReport;
  onBack: () => void;
}

export const ComplianceReportView: React.FC<ComplianceReportViewProps> = ({
  report,
  onBack,
}) => {
  const handleDownloadPDF = () => {
    generateInspectionPDF(report);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Report_${report.reportNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const actionOrder = deriveStatutoryActionOrder(report.verdict, report.violations);
  const formattedIssuedDate = new Date(report.issuedAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Action Bar (Hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Inspection</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <FileCode className="h-3.5 w-3.5 text-blue-700" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5 text-slate-600" />
            <span>Print Certificate</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition-all active:scale-98"
          >
            <Download className="h-4 w-4" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Container */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-md text-slate-900 sm:p-10 print:border-none print:p-0 print:shadow-none">
        {/* Ornate Indian Certificate Outer Border Frame */}
        <div className="pointer-events-none absolute inset-3 rounded-xl border-2 border-double border-slate-300/80" />

        {/* Tricolor Ribbon on Certificate Header */}
        <div className="flex h-2 w-full rounded-full overflow-hidden mb-6 shadow-xs">
          <div className="h-full w-1/3 bg-[#FF9933]" />
          <div className="h-full w-1/3 bg-slate-100 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-[#000080]" />
          </div>
          <div className="h-full w-1/3 bg-[#138808]" />
        </div>

        {/* Government Header */}
        <div className="border-b-2 border-slate-200 pb-6 text-center relative">
          <div className="inline-flex items-center justify-center rounded-2xl bg-amber-50/80 p-3 ring-1 ring-amber-300 shadow-2xs">
            <ShieldCheck className="h-9 w-9 text-blue-800" />
          </div>

          <h1 className="mt-3 text-xl font-black uppercase tracking-widest text-slate-950 font-serif">
            GOVERNMENT OF INDIA
          </h1>
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-700 mt-0.5">
            Ministry of Consumer Affairs, Food & Public Distribution
          </p>
          <p className="text-[11px] font-bold text-slate-600">
            Directorate of Legal Metrology • Central Metrological Verification Division
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-900/20 bg-blue-50/90 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-blue-950 shadow-2xs">
            <Award className="h-4 w-4 text-blue-700" />
            <span>Statutory Packaged Commodity Inspection & Enforcement Certificate</span>
          </div>

          <p className="mt-2 text-[10.5px] font-semibold text-slate-500 max-w-xl mx-auto">
            Issued in exercise of powers conferred under Section 15 & Section 18 of the Legal Metrology Act, 2009
            (Act No. 1 of 2010) read with the Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>

          {/* Certificate Registration Number Tag */}
          <div className="mt-3 flex items-center justify-center gap-3 text-xs">
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 border border-slate-200">
              GAZETTED RECORD
            </span>
            <span className="font-mono text-xs font-extrabold text-blue-900 tracking-wide">
              CERTIFICATE NO: {report.reportNumber}
            </span>
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs sm:grid-cols-4 shadow-2xs">
          <div>
            <span className="block text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Report Number</span>
            <span className="font-mono font-black text-slate-900">{report.reportNumber}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Inspection ID</span>
            <span className="font-mono font-bold text-slate-900">{report.scanId}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Inspection Date</span>
            <span className="text-slate-800 font-bold">
              {new Date(report.issuedAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Authorized Officer</span>
            <span className="text-slate-900 font-black">
              {report.inspector.name}
            </span>
            <span className="block text-[10px] text-blue-700 font-mono font-bold">
              {report.inspector.badge}
            </span>
          </div>
        </div>

        {/* Product Details Box */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-2xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Target Packaged Commodity Specification</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-500">COMMODITY NAME</span>
              <span className="font-black text-slate-950 text-sm">{report.product.name}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500">MANUFACTURER / PACKER</span>
              <span className="text-slate-900 font-bold text-sm">{report.product.brand}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500">COMMODITY CATEGORY</span>
              <span className="text-slate-800 font-semibold">{report.product.category}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500">PACKAGING FORMAT</span>
              <span className="text-slate-800 font-semibold">{report.product.packagingType}</span>
            </div>
          </div>
        </div>

        {/* Verdict Status Banner */}
        <div
          className={`mt-6 flex flex-col justify-between gap-4 rounded-xl p-5 sm:flex-row sm:items-center ${
            report.verdict === 'COMPLIANT'
              ? 'border-2 border-emerald-500/80 bg-emerald-50/70 text-emerald-950 shadow-xs'
              : report.verdict === 'NON-COMPLIANT'
              ? 'border-2 border-rose-500/80 bg-rose-50/70 text-rose-950 shadow-xs'
              : 'border-2 border-amber-500/80 bg-amber-50/70 text-amber-950 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3.5">
            {report.verdict === 'COMPLIANT' ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-700 shrink-0" />
            ) : report.verdict === 'NON-COMPLIANT' ? (
              <XCircle className="h-10 w-10 text-rose-700 shrink-0" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-amber-700 shrink-0" />
            )}
            <div>
              <div className="text-[11px] uppercase tracking-widest font-black text-slate-600">
                Official Statutory Audit Determination
              </div>
              <div className="text-2xl font-black tracking-tight">
                {report.verdict}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                Under Section 18 of Legal Metrology Act, 2009
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t border-slate-200/60 pt-3 sm:border-t-0 sm:pt-0 text-xs">
            <div className="text-center sm:text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Statutory Score
              </span>
              <div className="text-2xl font-black text-slate-900">
                {report.complianceScore}%
              </div>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div className="text-center sm:text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                OCR Optical Confidence
              </span>
              <div className="text-2xl font-black text-blue-700">
                {report.ocrConfidence}%
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Declarations Table */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-blue-700" />
              <span>Statutory Declarations Verification (Rule 6, PCR 2011)</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              {report.declarations.length} Clauses Audited
            </span>
          </div>

          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-extrabold">Mandatory Statutory Declaration</th>
                  <th className="p-3 font-extrabold">Detected Packaging Text</th>
                  <th className="p-3 font-extrabold">PCR Clause</th>
                  <th className="p-3 font-extrabold">Conformity</th>
                  <th className="p-3 font-extrabold text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.declarations.map((dec) => (
                  <tr key={dec.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-bold text-slate-900">{dec.label}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-800 max-w-xs break-words">
                      {dec.officerOverride?.value || dec.detectedValue || (
                        <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          OMITTED / NOT DETECTED
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-700">{dec.ruleCode}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                          dec.status === 'detected'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : dec.status === 'low_confidence'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {dec.status === 'detected' ? '✓ PASS' : dec.status === 'low_confidence' ? '⚠ REVIEW' : '✕ FAIL'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-right text-slate-600">{dec.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Violations Section */}
        {report.violations.length > 0 ? (
          <div className="mt-8 rounded-xl border-2 border-rose-300 bg-rose-50/40 p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-700" />
                <span>Recorded Statutory Non-Compliances & Offences ({report.violations.length})</span>
              </h3>
              <span className="rounded bg-rose-700 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                Section 36 Liability
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {report.violations.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl border border-rose-200 bg-white p-4 text-xs shadow-2xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-extrabold text-slate-950 text-sm">
                      [{v.severity.toUpperCase()}] {v.title}
                    </div>
                    <span className="rounded bg-rose-100 px-2 py-0.5 font-mono text-[10px] font-black text-rose-900 border border-rose-300">
                      {v.ruleCode}
                    </span>
                  </div>

                  {/* Location of Violation */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      📍 Package Zone: {v.locationOnPackage || `${v.panelName || 'Back Panel'} (X: ${v.boundingBox?.x || 50}%, Y: ${v.boundingBox?.y || 30}%)`}
                    </span>
                    {v.inspectionLocation && (
                      <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        🏢 Inspection Site: {v.inspectionLocation}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-2.5 sm:grid-cols-2 border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-bold">Detected Value: </span>
                      <span className="font-mono font-bold text-rose-800">
                        {v.detectedValue || 'None / Blank'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Statutory Requirement: </span>
                      <span className="font-semibold text-slate-900">{v.expectedValue}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium">
                    <span className="font-bold text-slate-700">Legal Reference: </span>
                    <span className="text-blue-900 font-semibold">{v.legalReference}</span>
                  </div>

                  <div className="rounded-lg bg-rose-50/80 p-2 border border-rose-200 text-xs">
                    <span className="font-black text-rose-900">Mandatory Statutory Action: </span>
                    <span className="font-medium text-rose-950">{v.recommendedAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border-2 border-emerald-300 bg-emerald-50/60 p-4 text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-2xs">
            <BadgeCheck className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>
              Zero statutory infractions detected. Packaging conforms fully with mandatory declaration standards under the Legal Metrology (Packaged Commodities) Rules, 2011 and Section 18 of the Legal Metrology Act, 2009.
            </span>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* STATUTORY ENFORCEMENT ORDER & LEGAL DIRECTIVE (NEW REALISTIC ACTION SECTION) */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div className="mt-8 rounded-xl border-2 border-slate-300 bg-slate-50 p-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-blue-800" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Gazetted Legal Metrology Order
                </span>
                <h4 className="text-xs font-black uppercase text-slate-950">
                  {actionOrder.orderTitle}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  actionOrder.urgency === 'IMMEDIATE'
                    ? 'bg-rose-700 text-white'
                    : actionOrder.urgency === '7_DAYS'
                    ? 'bg-amber-700 text-white'
                    : 'bg-blue-700 text-white'
                }`}
              >
                <Clock className="inline-block h-3 w-3 mr-1" />
                Urgency: {actionOrder.urgency.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2.5 text-xs">
            <div>
              <span className="font-bold text-slate-700">Enabling Law & Jurisdiction: </span>
              <span className="font-semibold text-blue-900">{actionOrder.legalActSection}</span>
            </div>

            <div>
              <span className="font-bold text-slate-700">Statutory Directive & Mandatory Order: </span>
              <p className="mt-0.5 rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 font-medium leading-relaxed">
                {actionOrder.statutoryDirective}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Applicable Penal Provisions
                </span>
                <span className="font-mono text-xs font-bold text-rose-800">
                  {actionOrder.penaltySection}
                </span>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">
                  {actionOrder.penaltiesSummary}
                </p>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Required Statutory Follow-up
                </span>
                <ul className="mt-1 space-y-1 text-[11px] text-slate-700 list-disc list-inside">
                  {actionOrder.nextSteps.map((step, idx) => (
                    <li key={idx} className="font-medium">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Officer Remarks & Determination */}
        <div className="mt-8 border-t-2 border-slate-200 pt-6">
          <div className="text-xs font-black uppercase tracking-wider text-slate-700">
            Inspector Remarks & Formal Statutory Determination
          </div>
          <p className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 leading-relaxed font-medium">
            {report.summaryRemarks}
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* AUTHENTIC OFFICIAL STAMP AND SIGNATURE SECTION */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div className="mt-10 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 text-center">
            Verification & Authentication Chamber • Directorate of Legal Metrology
          </div>

          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-end">
            {/* Left: Officer Signature block */}
            <div className="w-full sm:w-auto">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Authorized Inspector Signature:
              </span>
              <OfficerSignature
                inspectorName={report.inspector.name}
                inspectorBadge={report.inspector.badge}
                inspectorDepartment={report.inspector.department}
                verificationDate={formattedIssuedDate}
                signatureDataUrl={report.inspector.signatureDataUrl || report.inspectorSignOff?.signatureDataUrl}
              />
            </div>

            {/* Center: Official Indian Legal Metrology Ink Stamp */}
            <div className="flex flex-col items-center">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Official Department Seal:
              </span>
              <OfficialStamp
                verdict={report.verdict}
                reportNumber={report.reportNumber}
                dateStr={formattedIssuedDate}
                officerBadge={report.inspector.badge}
              />
            </div>

            {/* Right: Digital Cryptographic Certificate Verification QR / Stamp */}
            <div className="w-full sm:w-auto text-center sm:text-right space-y-1.5">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Digital Hash & E-Verification:
              </span>
              <div className="inline-block rounded-xl border border-blue-300 bg-white p-2.5 shadow-2xs text-center">
                <div className="font-mono text-[10px] font-black text-blue-950">
                  SHA-256 VERIFIED
                </div>
                <div className="mt-0.5 font-mono text-[8px] text-slate-500 max-w-[150px] truncate">
                  {report.reportNumber}-SEC18-PCR2011
                </div>
                <div className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[8.5px] font-extrabold text-emerald-900 border border-emerald-300">
                  <BadgeCheck className="h-3 w-3" />
                  GOVT METROLOGY SECURE
                </div>
              </div>

              <div className="text-[9.5px] font-medium text-slate-500">
                National Portal: <span className="font-mono font-bold text-slate-700">e-metrology.gov.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Legal Footer Notice */}
        <div className="mt-8 border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500">
          <p>
            This document constitutes an official inspection record generated by PackSure AI Metrology Engine.
            Any tampering or alteration of statutory findings is punishable under Section 465 of the Indian Penal Code.
          </p>
          <div className="mt-1 font-mono text-[9px] text-slate-400">
            Doc Ref: {report.reportNumber} • Generated on {new Date().toISOString()} • Ministry of Consumer Affairs, Food & Public Distribution
          </div>
        </div>
      </div>
    </div>
  );
};

