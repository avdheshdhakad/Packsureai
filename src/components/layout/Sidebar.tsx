import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  ListTodo,
  FileCheck2,
  Boxes,
  AlertTriangle,
  BarChart3,
  Scale,
  Eye,
  Users,
  Settings,
  Shield,
  Bot,
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavView =
  | 'landing'
  | 'dashboard'
  | 'scanner'
  | 'result'
  | 'queue'
  | 'reports'
  | 'repository'
  | 'violations'
  | 'analytics'
  | 'rules'
  | 'evidence'
  | 'users'
  | 'settings';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  userRole: UserRole;
  pendingReviewsCount?: number;
  criticalViolationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  criticalViolationsCount = 3,
}) => {
  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'scanner' as NavView,
      label: 'Product Scan',
      icon: ScanLine,
      highlight: true,
      badge: 'Pipeline',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200 font-bold',
    },
    ...(currentView === 'result'
      ? [
          {
            id: 'result' as NavView,
            label: 'Inspection Result',
            icon: FileCheck2,
            highlight: true,
            badge: 'Active',
            badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
          },
        ]
      : []),
    { id: 'reports' as NavView, label: 'Compliance Reports', icon: FileCheck2 },
    { id: 'repository' as NavView, label: 'Product Repository', icon: Boxes },
    {
      id: 'violations' as NavView,
      label: 'Violation Center',
      icon: AlertTriangle,
      badge: criticalViolationsCount > 0 ? criticalViolationsCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    },
    { id: 'analytics' as NavView, label: 'Analytics', icon: BarChart3 },
    { id: 'rules' as NavView, label: 'Statutory Rules', icon: Scale },
    { id: 'evidence' as NavView, label: 'Evidence Viewer', icon: Eye },
    { id: 'users' as NavView, label: 'User Roles', icon: Users },
    { id: 'settings' as NavView, label: 'System Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 shadow-2xs md:flex">
        <div className="mb-3 px-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Enforcement Navigation
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  item.highlight
                    ? isActive
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'border border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100'
                    : isActive
                    ? 'bg-slate-100 text-blue-800 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      item.highlight && !isActive ? 'text-blue-700' : ''
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Legal Metrology Quick Stamp Box */}
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-slate-700">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
            <Shield className="h-4 w-4 text-blue-700" />
            <span>PCR 2011 Mandate</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            Digital certification under Legal Metrology Act, 2009 & Packaged Commodities Rules.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 shadow-lg backdrop-blur-lg md:hidden">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            currentView === 'dashboard' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('scanner')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            currentView === 'scanner' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-white shadow-sm">
            <ScanLine className="h-4 w-4" />
          </div>
          <span>Scan</span>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            currentView === 'reports' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <FileCheck2 className="h-5 w-5" />
          <span>Reports</span>
        </button>

        <button
          onClick={() => onNavigate('violations')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            currentView === 'violations' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
          <span>Violations</span>
        </button>
      </div>
    </>
  );
};
