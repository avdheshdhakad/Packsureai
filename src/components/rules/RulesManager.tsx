import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Bot,
  Sparkles,
} from 'lucide-react';
import { ComplianceRule } from '../../types';

interface RulesManagerProps {
  rules: ComplianceRule[];
  onToggleRule: (ruleId: string, active: boolean) => void;
  onSaveRule: (rule: Partial<ComplianceRule>) => void;
  onDeleteRule: (ruleId: string) => void;
}

export const RulesManager: React.FC<RulesManagerProps> = ({
  rules,
  onToggleRule,
  onSaveRule,
  onDeleteRule,
}) => {
  const [editingRule, setEditingRule] = useState<Partial<ComplianceRule> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleOpenAdd = () => {
    setIsNew(true);
    setEditingRule({
      ruleCode: `PCR-${Math.floor(10 + Math.random() * 89)}`,
      declarationName: '',
      declarationType: 'commodity_name',
      required: true,
      validationType: 'presence',
      expectedFormat: '',
      severity: 'high',
      description: '',
      legalMetrologyReference: 'Rule 6 — Legal Metrology Rules, 2011',
      active: true,
    });
  };

  const handleOpenEdit = (rule: ComplianceRule) => {
    setIsNew(false);
    setEditingRule({ ...rule });
  };

  const handleSave = () => {
    if (!editingRule || !editingRule.declarationName) return;
    onSaveRule(editingRule);
    setEditingRule(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700">Statutory Framework</span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">Legal Metrology Rules, 2011</span>
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
            Packaging Compliance Rules Engine
          </h2>
          <p className="text-xs font-medium text-slate-600">
            Configurable statutory parameters, mandatory field clauses, and severity weights enforced during scans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>Add Statutory Rule</span>
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
            <tr>
              <th className="p-4">Rule Code</th>
              <th className="p-4">Mandatory Field</th>
              <th className="p-4">Legal Clause Ref</th>
              <th className="p-4">Expected Format</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70">
                <td className="p-4 font-mono font-bold text-blue-700">{r.ruleCode}</td>
                <td className="p-4">
                  <div className="font-bold text-slate-900">{r.declarationName}</div>
                  <div className="text-[10px] font-medium text-slate-500">{r.description}</div>
                </td>
                <td className="p-4 text-slate-700 font-semibold">{r.legalMetrologyReference}</td>
                <td className="p-4 font-mono text-[11px] text-slate-600">
                  {r.expectedFormat || 'Standard Presence'}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      r.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : r.severity === 'high'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {r.severity}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onToggleRule(r.id, !r.active)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                      r.active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        r.active ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}
                    />
                    {r.active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      title="Edit Rule"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteRule(r.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {isNew ? 'Add Statutory Compliance Rule' : `Edit Rule: ${editingRule.ruleCode}`}
              </h3>
              <button
                onClick={() => setEditingRule(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Rule Code</label>
                  <input
                    type="text"
                    value={editingRule.ruleCode}
                    onChange={(e) => setEditingRule({ ...editingRule, ruleCode: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 font-mono font-bold focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Severity</label>
                  <select
                    value={editingRule.severity}
                    onChange={(e: any) => setEditingRule({ ...editingRule, severity: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 font-bold focus:border-blue-600 focus:outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Mandatory Declaration Name</label>
                <input
                  type="text"
                  value={editingRule.declarationName}
                  onChange={(e) => setEditingRule({ ...editingRule, declarationName: e.target.value })}
                  placeholder="e.g. Unit Sale Price (USP)"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Legal Reference / Act Clause</label>
                <input
                  type="text"
                  value={editingRule.legalMetrologyReference}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, legalMetrologyReference: e.target.value })
                  }
                  placeholder="e.g. Rule 6(1)(e) — Legal Metrology Rules, 2011"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Expected Format / Unit Standard</label>
                <input
                  type="text"
                  value={editingRule.expectedFormat}
                  onChange={(e) => setEditingRule({ ...editingRule, expectedFormat: e.target.value })}
                  placeholder="e.g. Standard SI units (g, kg, ml, L) without non-standard symbols"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Description & Statutory Requirement</label>
                <textarea
                  rows={2}
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingRule(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-blue-700 px-5 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-sm"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
