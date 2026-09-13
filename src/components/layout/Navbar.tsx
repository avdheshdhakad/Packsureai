import React from 'react';
import { ShieldCheck, Bell, Search, Sparkles, Settings } from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onOpenSettings?: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  mode: 'demo' | 'live';
  onToggleMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  onOpenSettings,
  onOpenNotifications,
  unreadCount = 2,
  mode,
  onToggleMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-md">
      {/* Official Government Tricolor Strip */}
      <div className="flex h-1 w-full">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & National Emblem Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm ring-1 ring-blue-950/10">
            <ShieldCheck className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                Pack<span className="text-blue-700">Sure</span>
              </span>
              <span className="hidden rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 sm:inline-block">
                PCR 2011 COMPLIANT
              </span>
            </div>
            <p className="hidden text-[10px] font-semibold tracking-wide text-slate-600 md:block">
              DIRECTORATE OF LEGAL METROLOGY • MINISTRY OF CONSUMER AFFAIRS
            </p>
          </div>
        </div>

        {/* Global Quick Search */}
        <div className="hidden max-w-md flex-1 px-8 lg:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search packaged commodities, brands, barcodes, or rule clauses..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <button
            onClick={onToggleMode}
            title="Toggle between Pre-calibrated Demo Dataset and Live Scanner"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              mode === 'demo'
                ? 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                : 'border border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-700" />
            <span>{mode === 'demo' ? 'DEMO SAMPLES' : 'LIVE OCR'}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
            title="Inspection notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
              title="System Configuration & Engine Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}

          {/* Role Switcher for SIH Judges */}
          <div className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 pl-2.5 shadow-2xs">
            <div className="hidden text-right text-[11px] sm:block">
              <div className="font-bold text-slate-900">{currentUser.name.split(' ')[0]}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = allUsers.find((u) => u.id === e.target.value);
                if (found) onSelectUser(found);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none"
              title="Switch user role"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.role.toUpperCase()}: {u.name.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
