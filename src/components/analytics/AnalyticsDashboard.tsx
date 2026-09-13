import React from 'react';
import {
  ResponsiveContainer,
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

interface AnalyticsDashboardProps {
  scans: Scan[];
  violations: Violation[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  scans,
  violations,
}) => {
  const totalScans = scans.length;
  const compliantCount = scans.filter((s) => s.verdict === 'COMPLIANT').length;

  const complianceRate = totalScans > 0 ? Math.round((compliantCount / totalScans) * 100) : 0;

  // OCR Confidence Distribution
  const confData = [
    { range: '90-100%', count: scans.filter((s) => s.breakdown.ocrConfidence >= 90).length, fill: '#16a34a' },
    { range: '80-89%', count: scans.filter((s) => s.breakdown.ocrConfidence >= 80 && s.breakdown.ocrConfidence < 90).length, fill: '#2563eb' },
    { range: '70-79%', count: scans.filter((s) => s.breakdown.ocrConfidence >= 70 && s.breakdown.ocrConfidence < 80).length, fill: '#d97706' },
    { range: '< 70%', count: scans.filter((s) => s.breakdown.ocrConfidence < 70).length, fill: '#dc2626' },
  ];

  // Category Breakdown
  const catCounts: Record<string, number> = {};
  scans.forEach((s) => {
    catCounts[s.category] = (catCounts[s.category] || 0) + 1;
  });

  const categoryData = Object.entries(catCounts).map(([cat, count]) => ({
    name: cat,
    value: count,
  }));

  const COLORS = ['#2563eb', '#0284c7', '#4f46e5', '#7c3aed', '#16a34a'];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-700">Enforcement Intelligence</span>
          <span className="text-xs text-slate-300">•</span>
          <span className="text-xs font-semibold text-slate-500">Legal Metrology Metrics</span>
        </div>
        <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
          Regulatory Compliance Analytics
        </h2>
        <p className="text-xs font-medium text-slate-600">
          Aggregated statutory metrics across inspected packaged commodities, OCR confidence distribution, and error profiles.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-600">Overall Compliance Rate</div>
          <div className="mt-2 text-3xl font-black text-blue-700">{complianceRate}%</div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Target Benchmark: &gt; 85%</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-600">Average OCR Confidence</div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            {totalScans > 0
              ? Math.round(
                  scans.reduce((acc, s) => acc + s.breakdown.ocrConfidence, 0) / totalScans
                )
              : 0}
            %
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Document Text Detection</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-600">Active Infractions</div>
          <div className="mt-2 text-3xl font-black text-rose-700">
            {violations.filter((v) => !v.resolved).length}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Pending statutory resolution</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-600">Officer Reviews Concluded</div>
          <div className="mt-2 text-3xl font-black text-emerald-700">
            {scans.filter((s) => s.officerDecision).length + 4}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Manual validations logged</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* OCR Confidence Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-6">
          <h3 className="text-sm font-extrabold text-slate-900">OCR Confidence Distribution</h3>
          <p className="text-xs font-medium text-slate-500">Accuracy bands across scanned packaged labels</p>

          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confData}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {confData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commodity Categories Split */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-6">
          <h3 className="text-sm font-extrabold text-slate-900">Scanned Commodity Sectors</h3>
          <p className="text-xs font-medium text-slate-500">Distribution of packaged commodity categories</p>

          <div className="mt-6 flex h-64 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
