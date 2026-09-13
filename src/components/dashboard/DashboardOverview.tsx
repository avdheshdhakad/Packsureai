import React from 'react';
import {
  PackageCheck,
  CheckCircle2,
  XCircle,
  FileCheck2,
  ScanLine,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Scan, Violation } from '../../types';

interface DashboardOverviewProps {
  scans: Scan[];
  violations: Violation[];
  onStartScan: () => void;
  onViewScan: (scanId: string) => void;
  onViewViolations: () => void;
  onViewReports: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  scans,
  violations,
  onStartScan,
  onViewScan,
  onViewViolations,
}) => {
  const totalScanned = scans.length;
  const compliantScans = scans.filter((s) => s.verdict === 'COMPLIANT');
  const nonCompliantScans = scans.filter((s) => s.verdict === 'NON-COMPLIANT');
  const reviewScans = scans.filter((s) => s.verdict === 'NEEDS MANUAL REVIEW');

  const complianceRate = totalScanned > 0 ? Math.round((compliantScans.length / totalScanned) * 100) : 0;

  // Chart 1: Violation distribution by Rule Code
  const violationCounts: Record<string, number> = {};
  violations.forEach((v) => {
    violationCounts[v.ruleCode] = (violationCounts[v.ruleCode] || 0) + 1;
  });

  const violationTypeData = [
    { name: 'PCR-01 (Mfd/Packer)', count: violationCounts['PCR-01'] || 1 },
    { name: 'PCR-03 (Net Qty)', count: violationCounts['PCR-03'] || 2 },
    { name: 'PCR-05 (MRP/Taxes)', count: violationCounts['PCR-05'] || 2 },
    { name: 'PCR-07 (Consumer Care)', count: violationCounts['PCR-07'] || 2 },
    { name: 'PCR-08 (Country Origin)', count: violationCounts['PCR-08'] || 1 },
  ];

  // Chart 2: Inspection Activity Trend
  const trendData = [
    { day: 'Mon', inspected: 12, violations: 3 },
    { day: 'Tue', inspected: 19, violations: 5 },
    { day: 'Wed', inspected: 15, violations: 2 },
    { day: 'Thu', inspected: 24, violations: 7 },
    { day: 'Fri', inspected: 28, violations: 4 },
    { day: 'Sat', inspected: 18, violations: 3 },
    { day: 'Today', inspected: totalScanned, violations: violations.length },
  ];

  const pieData = [
    { name: 'Compliant', value: compliantScans.length, color: '#16a34a' },
    { name: 'Needs Review', value: reviewScans.length, color: '#d97706' },
    { name: 'Non-Compliant', value: nonCompliantScans.length, color: '#dc2626' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Scan Action */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
            Legal Metrology Compliance Overview
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-600">
            Real-time enforcement dashboard for Packaged Commodities Rules, 2011 inspections.
          </p>
        </div>

        <button
          onClick={onStartScan}
          className="flex items-center gap-2 self-start rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-800 active:scale-98 sm:self-auto"
        >
          <ScanLine className="h-4 w-4" />
          <span>Scan New Product</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Total Scanned */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Scanned</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <PackageCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalScanned}</span>
            <span className="text-xs font-semibold text-slate-500">Commodities</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            Inspection Batch Q1-2026
          </div>
        </div>

        {/* Card 2: Compliant */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Compliant</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">
              {compliantScans.length}
            </span>
            <span className="text-xs font-bold text-emerald-800">
              {complianceRate}% rate
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            Passed all Rule 6 statutory checks
          </div>
        </div>

        {/* Card 3: Non-Compliant */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Non-Compliant</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-700">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-700">
              {nonCompliantScans.length}
            </span>
            <span className="text-xs font-bold text-rose-800">Violations flagged</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            Critical omissions or invalid format
          </div>
        </div>

        {/* Card 4: Inspection Dossiers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Inspection Dossiers</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-700">
              {scans.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Reports Ready</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            Exportable legal metrology certificates
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Inspection & Violation Trends Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inspections & Violation Trends</h3>
              <p className="text-xs text-slate-500">Volume of products inspected vs statutory infractions</p>
            </div>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              Weekly Timeline
            </span>
          </div>

          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorInspected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inspected"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorInspected)"
                  name="Inspected"
                />
                <Area
                  type="monotone"
                  dataKey="violations"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorViolations)"
                  name="Violations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Distribution Pie */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Compliance Status Ratio</h3>
            <p className="text-xs text-slate-500">Statutory conformity distribution</p>
          </div>

          <div className="relative my-4 flex h-48 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute text-center">
              <div className="text-xl font-black text-slate-900">{complianceRate}%</div>
              <div className="text-[10px] font-bold text-slate-500">Compliant</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs">
            <div>
              <span className="block text-[10px] font-bold text-slate-500">Compliant</span>
              <span className="font-extrabold text-emerald-700">{compliantScans.length}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500">Review</span>
              <span className="font-extrabold text-amber-700">{reviewScans.length}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500">Violations</span>
              <span className="font-extrabold text-rose-700">{nonCompliantScans.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Violations & Recent Inspections Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Violation Types */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Top Legal Metrology Violations</h3>
            <button
              onClick={onViewViolations}
              className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationTypeData} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={140} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#e11d48" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Inspections Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Label Inspections</h3>
            <span className="text-xs font-semibold text-slate-500">{scans.length} scans logged</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
            {scans.slice(0, 4).map((scan) => (
              <div
                key={scan.id}
                onClick={() => onViewScan(scan.id)}
                className="group flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <img
                      src={scan.imageUrl}
                      alt={scan.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                      {scan.productName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {scan.brand} • {new Date(scan.scanDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      scan.verdict === 'COMPLIANT'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : scan.verdict === 'NON-COMPLIANT'
                        ? 'bg-rose-50 text-rose-800 border border-rose-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {scan.complianceScore}%
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
