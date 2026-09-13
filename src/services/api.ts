import {
  Scan,
  ComplianceRule,
  Violation,
  InspectionReport,
  User,
  AuditLog,
  SystemConfig,
} from '../types';

export const api = {
  // Config
  getConfig: async (): Promise<SystemConfig> => {
    const res = await fetch('/api/config');
    return res.json();
  },

  updateConfig: async (config: Partial<SystemConfig>): Promise<SystemConfig> => {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  // Auth / Users
  getUsers: async (): Promise<User[]> => {
    const res = await fetch('/api/users');
    return res.json();
  },

  login: async (role: string, userId?: string): Promise<{ user: User; token: string }> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, userId }),
    });
    return res.json();
  },

  // Scans
  getScans: async (params?: {
    status?: string;
    verdict?: string;
    mode?: string;
    search?: string;
  }): Promise<Scan[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.verdict) query.set('verdict', params.verdict);
    if (params?.mode) query.set('mode', params.mode);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/scans?${query.toString()}`);
    return res.json();
  },

  getScan: async (id: string): Promise<Scan> => {
    const res = await fetch(`/api/scans/${id}`);
    if (!res.ok) throw new Error('Scan not found');
    return res.json();
  },

  createScan: async (scanData: Partial<Scan>): Promise<Scan> => {
    const res = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scanData),
    });
    if (!res.ok) throw new Error('Failed to create scan');
    return res.json();
  },

  analyzeScan: async (id: string): Promise<Scan> => {
    const res = await fetch(`/api/scans/${id}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to analyze scan');
    return res.json();
  },

  reviewScan: async (
    id: string,
    reviewData: {
      declarationId?: string;
      overrideValue?: string;
      overrideStatus?: string;
      officerRemarks?: string;
      officerDecision?: string;
      officerName?: string;
    }
  ): Promise<Scan> => {
    const res = await fetch(`/api/scans/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  updateDeclaration: async (
    scanId: string,
    declarationId: string,
    data: {
      value: string;
      status: string;
      remarks?: string;
      officerName?: string;
    }
  ): Promise<Scan> => {
    const res = await fetch(`/api/scans/${scanId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        declarationId,
        overrideValue: data.value,
        overrideStatus: data.status,
        officerRemarks: data.remarks,
        officerName: data.officerName,
      }),
    });
    if (!res.ok) throw new Error('Failed to update declaration');
    return res.json();
  },

  // Violations
  getViolations: async (params?: {
    severity?: string;
    ruleCode?: string;
    resolved?: boolean;
  }): Promise<Violation[]> => {
    const query = new URLSearchParams();
    if (params?.severity) query.set('severity', params.severity);
    if (params?.ruleCode) query.set('ruleCode', params.ruleCode);
    if (params?.resolved !== undefined) query.set('resolved', String(params.resolved));

    const res = await fetch(`/api/violations?${query.toString()}`);
    return res.json();
  },

  resolveViolation: async (id: string, officerName: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/violations/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerName }),
    });
    return res.json();
  },

  // Reports
  getReports: async (): Promise<InspectionReport[]> => {
    const res = await fetch('/api/reports');
    return res.json();
  },

  getReport: async (id: string): Promise<InspectionReport> => {
    const res = await fetch(`/api/reports/${id}`);
    if (!res.ok) throw new Error('Report not found');
    return res.json();
  },

  generateReport: async (scanId: string, summaryRemarks?: string): Promise<InspectionReport> => {
    const res = await fetch(`/api/reports/${scanId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summaryRemarks }),
    });
    return res.json();
  },

  // Rules
  getRules: async (): Promise<ComplianceRule[]> => {
    const res = await fetch('/api/rules');
    return res.json();
  },

  createRule: async (rule: Partial<ComplianceRule>): Promise<ComplianceRule> => {
    const res = await fetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    return res.json();
  },

  updateRule: async (id: string, updates: Partial<ComplianceRule>): Promise<ComplianceRule> => {
    const res = await fetch(`/api/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  deleteRule: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/rules/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Products
  getProducts: async (): Promise<any[]> => {
    const res = await fetch('/api/products');
    return res.json();
  },

  // Analytics
  getAnalytics: async (): Promise<any> => {
    const res = await fetch('/api/analytics');
    return res.json();
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await fetch('/api/audit-logs');
    return res.json();
  },

  // PackSure AI Legal Metrology Statutory Prompt & 100% Verification
  getStatutoryPrompt: async (): Promise<{
    title: string;
    act: string;
    rules: string;
    prompt: string;
    statutoryClausesCovered: Array<{ code: string; name: string; act: string }>;
  }> => {
    const res = await fetch('/api/rules/prompt');
    return res.json();
  },

  verifyStatutoryRules: async (payload: {
    text?: string;
    imageUrl?: string;
    declarations?: any[];
  }): Promise<{
    productName: string;
    brand: string;
    overallVerdict: 'COMPLIANT' | 'NON-COMPLIANT' | 'ACTION_REQUIRED';
    complianceScore: number;
    legalActReference: string;
    statutoryNotices: string[];
    checklist: Array<{
      clauseCode: string;
      ruleName: string;
      status: 'PASS' | 'FAIL' | 'WARNING';
      statutoryRequirement: string;
      detectedContent: string;
      legalSection: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      penaltyClause: string;
      statutoryNotes: string;
    }>;
    officerSummary: string;
    auditedAt: string;
    engineUsed: string;
  }> => {
    const res = await fetch('/api/rules/ai-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
