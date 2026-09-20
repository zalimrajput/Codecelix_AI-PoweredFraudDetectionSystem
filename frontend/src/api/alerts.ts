/**
 * CodeCelix Alerts Service
 * 
 * Integrated with FastAPI backend:
 * - GET  /api/alerts
 * - POST /api/alerts/{id}/review
 */

import { apiClient } from './client';
import { RelatedAlert, RiskLevel } from '../types/investigation';

interface BackendAlert {
  id: string;
  transaction_id: string;
  customer_id: string;
  title: string;
  reason?: string;
  severity: string;
  status: string;
  created_at: string;
}

function normalizeSeverity(sev?: string): RiskLevel {
  const s = (sev || 'MEDIUM').toUpperCase();
  if (s === 'CRITICAL' || s === 'HIGH') return 'HIGH';
  if (s === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
}

function formatAlert(a: BackendAlert): RelatedAlert {
  return {
    id: a.id,
    type: a.title || 'Security Anomaly',
    severity: normalizeSeverity(a.severity),
    message: a.reason || a.title || 'Alert flagged for analyst review',
    timestamp: a.created_at || new Date().toISOString(),
    status: (a.status === 'new' ? 'UNREVIEWED' : 'ACKNOWLEDGED') as any,
  };
}

export async function getAlerts(): Promise<RelatedAlert[]> {
  const res = await apiClient<any>('/alerts', {
    method: 'GET',
  });

  const rawList: BackendAlert[] = Array.isArray(res) ? res : (res.items || []);
  return rawList.map(formatAlert);
}

export async function reviewAlert(id: string, decision: 'ACKNOWLEDGED' | 'DISMISSED'): Promise<RelatedAlert> {
  const backendStatus = decision === 'ACKNOWLEDGED' ? 'confirmed_fraud' : 'false_positive';
  const res = await apiClient<BackendAlert>(`/alerts/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({
      status: backendStatus,
      note: `Analyst disposition: ${decision}`,
    }),
  });

  return formatAlert(res);
}
