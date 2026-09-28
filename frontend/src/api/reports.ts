/**
 * CodeCelix Reports Service
 *
 * Integrated with FastAPI backend:
 * - GET  /api/reports
 * - POST /api/reports { report_type, title, period_start, period_end, risk_threshold }
 * - GET  /api/reports/{id}/export?format=csv|json
 */

import { apiClient } from './client';
import { ReportFilter, ReportSummary, ReportFormat, ReportType } from '../types/report';

interface BackendReport {
  id: string;
  report_type: string;
  title: string;
  period_start?: string;
  period_end?: string;
  payload?: string;
  created_at: string;
}

const TYPE_TO_BACKEND: Record<ReportType, string> = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
  HIGH_RISK: 'high_risk',
  GEOGRAPHIC: 'geographic',
  RULE_PERFORMANCE: 'rule_performance',
};

function mapReportType(t?: string): ReportType {
  const s = (t || 'DAILY').toUpperCase();
  if (s.includes('GEOGRAPHIC')) return 'GEOGRAPHIC';
  if (s.includes('RULE')) return 'RULE_PERFORMANCE';
  if (s.includes('HIGH_RISK_CUSTOMERS') || s.includes('HIGH_RISK')) return 'HIGH_RISK';
  if (s.includes('MONTH')) return 'MONTHLY';
  return 'DAILY';
}

function formatReport(r: BackendReport): ReportSummary {
  let stats: Record<string, unknown> = {};
  try {
    stats = JSON.parse(r.payload || '{}');
  } catch {
    stats = {};
  }

  const resolved = Number(stats.false_positive_rate || 0);

  return {
    id: r.id,
    title: r.title || 'Risk & Fraud Activity Report',
    type: mapReportType(r.report_type),
    generatedDate: r.created_at || new Date().toISOString(),
    dateRange: {
      start: (r.period_start || '').split('T')[0],
      end: (r.period_end || '').split('T')[0],
    },
    totalTransactionsScanned: Number(stats.total_transactions || 0),
    flaggedSuspiciousCount: Number(stats.flagged_count ?? stats.suspicious_count ?? 0),
    blockedCount: Number(stats.blocked_count ?? 0),
    falsePositiveRate: resolved,
    estimatedLossPrevented: Number(stats.flagged_amount ?? 0),
  };
}

export async function getReports(): Promise<ReportSummary[]> {
  const data = await apiClient<BackendReport[]>('/reports', {
    method: 'GET',
  });

  const list = Array.isArray(data) ? data : [];
  return list.map(formatReport);
}

export async function generateReport(filter: ReportFilter): Promise<ReportSummary> {
  const report_type = TYPE_TO_BACKEND[filter.type] || 'daily';

  const res = await apiClient<BackendReport>('/reports', {
    method: 'POST',
    body: JSON.stringify({
      report_type,
      title: `${filter.type.replace('_', ' ')} Intelligence Report`,
      period_start: filter.startDate,
      period_end: filter.endDate,
      risk_threshold: filter.riskThreshold ?? 75,
    }),
  });

  return formatReport(res);
}

export async function exportReport(id: string, format: ReportFormat): Promise<Blob> {
  const token = localStorage.getItem('codecelix_auth_token');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

  const response = await fetch(`${baseUrl}/reports/${id}/export?format=${format.toLowerCase()}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed with status: ${response.status}`);
  }

  const json = await response.json();
  const mime = format.toLowerCase() === 'csv' ? 'text/csv' : 'application/json';
  return new Blob([json.content || ''], { type: mime });
}
