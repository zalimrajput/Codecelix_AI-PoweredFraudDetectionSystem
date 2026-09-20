/**
 * CodeCelix Dashboard Service
 * 
 * Integrated with FastAPI backend:
 * - GET /api/dashboard
 */

import { apiClient } from './client';
import { DashboardData } from '../types/dashboard';

interface BackendDashboardResponse {
  transactions?: {
    total?: number;
    approved?: number;
    review?: number;
    blocked?: number;
  };
  alerts?: {
    new?: number;
    confirmed_fraud?: number;
    false_positive?: number;
  };
  risk_summary?: {
    average_risk_score?: number;
    high_risk_count?: number;
    medium_risk_count?: number;
    low_risk_count?: number;
    suspicious_devices_count?: number;
  };
  activity_7d?: Array<[string, number] | { date: string; transactions: number }>;
}

export async function getDashboardData(): Promise<DashboardData> {
  const data = await apiClient<BackendDashboardResponse>('/dashboard', {
    method: 'GET',
  });

  const txns = data.transactions || {};
  const alerts = data.alerts || {};
  const risk = data.risk_summary || {};

  const lowCount = risk.low_risk_count ?? txns.approved ?? 0;
  const medCount = risk.medium_risk_count ?? txns.review ?? 0;
  const highCount = risk.high_risk_count ?? txns.blocked ?? 0;

  // Format 7-day activity into trend points
  const rawActivity = data.activity_7d || [];
  const fraudTrends = rawActivity.map((item) => {
    let dateStr = '';
    let count = 0;
    if (Array.isArray(item)) {
      dateStr = String(item[0]);
      count = Number(item[1]) || 0;
    } else if (typeof item === 'object' && item !== null) {
      dateStr = item.date || '';
      count = item.transactions || 0;
    }
    return {
      date: dateStr,
      totalVolume: count,
      suspiciousVolume: Math.round(count * 0.15),
      blockedVolume: Math.round(count * 0.05),
    };
  });

  return {
    metrics: {
      totalTransactions: txns.total ?? 0,
      totalTransactionsChangePercent: 0,
      highRiskFlagged: highCount,
      highRiskChangePercent: 0,
      averageRiskScore: Number(risk.average_risk_score ?? 0),
      averageRiskScoreChange: 0,
      openAlerts: alerts.new ?? 0,
      openAlertsChangePercent: 0,
    },
    riskDistribution: [
      { name: 'Low', value: lowCount, color: '#10B981' },
      { name: 'Medium', value: medCount, color: '#F59E0B' },
      { name: 'High', value: highCount, color: '#F43F5E' },
    ],
    fraudTrends: fraudTrends.length > 0 ? fraudTrends : [
      {
        date: new Date().toISOString().split('T')[0],
        totalVolume: txns.total ?? 0,
        suspiciousVolume: medCount,
        blockedVolume: highCount,
      }
    ],
  };
}
