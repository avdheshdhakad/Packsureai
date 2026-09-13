import React from 'react';
import { Shield, Award, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { User, UserRole } from '../../types';

interface UsersViewProps {
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, currentUser, onSelectUser }) => {
  const roleDescriptions: Record<UserRole, { title: string; permissions: string[] }> = {
    admin: {
      title: 'System Administrator',
      permissions: [
        'Manage statutory compliance rules & weights',
        'Configure Google Cloud Vision OCR API keys',
        'Full access to all jurisdiction scans & audits',
        'User and officer management',
      ],
    },
    officer: {
      title: 'Legal Metrology Officer',
      permissions: [
        'Conduct AI packaged commodity scans',
        'Review and override declaration values on label samples',
        'Resolve statutory non-compliances & issue hearing notices',
        'Generate authenticated digital inspection certificates',
      ],
    },
    inspector: {
      title: 'Field Enforcement Inspector',
      permissions: [
        'Upload packaging label photographs and camera captures',
        'Inspect products in retail markets and warehouses',
        'Flag packaging discrepancies for officer review',
        'Download field inspection certificates',
      ],
    },
    viewer: {
      title: 'Public / Read-only Auditor',
      permissions: [
        'Search scanned packaged commodities catalog',
        'Verify digital inspection certificate numbers',
        'View published statutory compliance statistics',
      ],
    },
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-700">Access Control & Jurisdictions</span>
          <span className="text-xs text-slate-300">•</span>
          <span className="text-xs font-semibold text-slate-500">Role-Based Enforcement (RBAC)</span>
        </div>
        <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
          Authorized Enforcement Personnel
        </h2>
        <p className="text-xs font-medium text-slate-600">
          Enforcement officers, field inspectors, and system administrators provisioned for Legal Metrology enforcement. Switch profiles below to test role permissions.
        </p>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {users.map((u) => {
          const isCurrent = currentUser.id === u.id;
          const roleInfo = roleDescriptions[u.role];

          return (
            <div
              key={u.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-2xs ${
                isCurrent
                  ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-400'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
                    <Shield className="h-6 w-6" />
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : u.role === 'officer'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : u.role === 'inspector'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-extrabold text-slate-900">{u.name}</h3>
                <p className="text-[11px] font-semibold text-slate-600">{roleInfo.title}</p>

                {u.badgeNumber && (
                  <div className="mt-2 flex items-center gap-1 font-mono text-[10px] font-bold text-blue-700">
                    <Award className="h-3.5 w-3.5" />
                    <span>Badge: {u.badgeNumber}</span>
                  </div>
                )}

                {u.jurisdiction && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{u.jurisdiction}</span>
                  </div>
                )}

                {/* Permissions snippet */}
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-[10px] text-slate-600 font-medium">
                  {roleInfo.permissions.slice(0, 3).map((perm, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span className="line-clamp-1">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3">
                {isCurrent ? (
                  <div className="flex items-center justify-center gap-1 rounded-xl bg-blue-100 border border-blue-300 py-2 text-xs font-bold text-blue-900">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Active Session</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectUser(u)}
                    className="flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs"
                  >
                    <span>Switch to Profile</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
