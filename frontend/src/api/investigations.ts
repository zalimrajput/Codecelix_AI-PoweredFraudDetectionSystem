/**
 * CodeCelix Investigations Service
 * 
 * Integrated with FastAPI backend:
 * - GET   /api/investigations
 * - GET   /api/investigations/{id}
 * - PATCH /api/investigations/{id}
 * - GET   /api/customers/{id}/risk-profile
 */

import { apiClient } from './client';
import { 
  Investigation, 
  InvestigationDetail, 
  AnalystNotesPayload, 
  CustomerProfile,
  RiskLevel,
  TransactionDecision,
  InvestigationStatus
} from '../types/investigation';

function normalizeStatus(status?: string): InvestigationStatus {
  const s = (status || 'OPEN').toUpperCase();
  if (s === 'CLOSED' || s === 'RESOLVED') return 'RESOLVED';
  if (s === 'UNDER_REVIEW' || s === 'INVESTIGATING') return 'UNDER_REVIEW';
  if (s === 'ESCALATED') return 'ESCALATED';
  return 'OPEN';
}

function normalizeRiskLevel(level?: string): RiskLevel {
  const l = (level || 'LOW').toUpperCase();
  if (l === 'HIGH') return 'HIGH';
  if (l === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
}

function normalizeDecision(dec?: string): TransactionDecision {
  const d = (dec || 'APPROVED').toUpperCase();
  if (d === 'BLOCK' || d === 'BLOCKED') return 'BLOCKED';
  if (d === 'REVIEW') return 'REVIEW';
  return 'APPROVED';
}

export async function getInvestigations(): Promise<{ investigations: Investigation[]; total: number }> {
  const data = await apiClient<any>('/investigations', {
    method: 'GET',
  });

  const rawList = Array.isArray(data) ? data : (data.investigations || data.items || []);
  const investigations: Investigation[] = rawList.map((item: any) => ({
    id: item.id,
    customerId: item.customer_id || 'Unknown',
    customerName: item.customer_id,
    riskScore: Number(item.risk_assessment?.risk_score ?? 65),
    riskLevel: normalizeRiskLevel(item.risk_assessment?.risk_level),
    decision: normalizeDecision(item.risk_assessment?.decision),
    status: normalizeStatus(item.status),
    assignedAnalyst: item.analyst_id || 'Unassigned',
    createdDate: item.created_at || new Date().toISOString(),
    updatedDate: item.updated_at,
    transactionCount: item.customer_history?.length || 1,
    totalVolume: item.transaction?.amount || 0,
  }));

  return {
    investigations,
    total: investigations.length,
  };
}

export async function getInvestigationById(id: string): Promise<InvestigationDetail> {
  const raw = await apiClient<any>(`/investigations/${id}`, {
    method: 'GET',
  });

  const risk = raw.risk_assessment || {};
  const score = Number(risk.risk_score ?? 60);
  const riskLevel = normalizeRiskLevel(risk.risk_level);
  const decision = normalizeDecision(risk.decision);

  const rawRules = Array.isArray(risk.triggered_rules) ? risk.triggered_rules : [];
  const triggeredRules = rawRules.map((r: any, idx: number) => ({
    id: r.id || `rule-${idx}`,
    name: r.name || r.rule_name || 'Heuristic Trigger',
    severity: (r.severity || 'MEDIUM').toUpperCase(),
    scoreImpact: Number(r.score_impact || 20),
    description: r.description || r.reason || 'Threshold breach',
    triggeredAt: r.triggered_at || raw.created_at || new Date().toISOString(),
  }));

  const rawPatterns = Array.isArray(risk.detected_patterns) ? risk.detected_patterns : [];
  const detectedPatterns = rawPatterns.map((p: any, idx: number) => ({
    id: `pat-${idx}`,
    name: p.pattern ? p.pattern.replace(/_/g, ' ').toUpperCase() : 'Suspicious Anomaly',
    category: 'BEHAVIORAL',
    confidenceScore: 0.9,
    description: p.details?.message || 'Statistical anomaly detected',
  }));

  const history = Array.isArray(raw.customer_history) ? raw.customer_history : [];
  const totalVolume = history.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const customerProfile: CustomerProfile = {
    id: raw.customer_id,
    name: raw.customer_id,
    email: `${raw.customer_id.toLowerCase()}@client.net`,
    accountCreated: history[history.length - 1]?.created_at || raw.created_at || new Date().toISOString(),
    riskCategory: riskLevel,
    kycStatus: 'VERIFIED',
    totalTransactionsCount: history.length,
    totalVolumeSpent: totalVolume,
    chargebackCount: 0,
  };

  const rawAlerts = Array.isArray(raw.related_alerts) ? raw.related_alerts : [];
  const relatedAlerts = rawAlerts.map((a: any) => ({
    id: a.id,
    type: a.title || 'Fraud Alert',
    severity: normalizeRiskLevel(a.severity),
    message: a.reason || a.title || 'Flagged activity',
    timestamp: a.created_at || new Date().toISOString(),
    status: (a.status === 'new' ? 'UNREVIEWED' : 'ACKNOWLEDGED') as any,
  }));

  const timeline = history.slice(0, 10).map((t: any, idx: number) => ({
    id: t.id || `evt-${idx}`,
    timestamp: t.created_at || new Date().toISOString(),
    title: `Transaction: $${Number(t.amount || 0).toLocaleString()}`,
    description: `Processed via ${t.payment_method || 'card'} (${t.city || 'Global'}, ${t.country || ''})`,
    severity: normalizeRiskLevel(t.status === 'blocked' ? 'HIGH' : (t.status === 'review' ? 'MEDIUM' : 'LOW')),
    type: 'TRANSACTION' as const,
  }));

  return {
    id: raw.id,
    customerId: raw.customer_id,
    customerName: raw.customer_id,
    riskScore: score,
    riskLevel,
    decision,
    status: normalizeStatus(raw.status),
    assignedAnalyst: raw.analyst_id || 'Analyst',
    createdDate: raw.created_at || new Date().toISOString(),
    updatedDate: raw.updated_at,
    transactionCount: history.length,
    totalVolume,
    riskBreakdown: {
      finalRiskScore: score,
      riskLevel,
      decision,
      mlAnomalyScore: Number(risk.ml_anomaly_score ?? 0),
      ruleScore: Number(risk.rule_score ?? 0),
      behaviorScore: Number(risk.customer_behavior_score ?? 0),
    },
    aiExplanation: {
      geminiSummary: risk.ai_explanation || 'No AI explanation generated yet.',
      deterministicExplanation: risk.ai_explanation || 'Standard transaction evaluation.',
      riskFactors: triggeredRules.map((r: any) => r.name),
      recommendedAction: decision === 'BLOCKED' ? 'Maintain block and require customer identity re-verification' : 'Approved for regular processing',
    },
    triggeredRules,
    detectedPatterns,
    customerProfile,
    timeline,
    relatedAlerts,
  };
}

export async function updateInvestigationNotes(id: string, payload: AnalystNotesPayload): Promise<InvestigationDetail> {
  await apiClient<any>(`/investigations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      notes: payload.notes,
      conclusion: payload.conclusion,
      status: payload.closeCase ? 'closed' : 'under_review',
    }),
  });

  return getInvestigationById(id);
}

export async function getCustomerRiskProfile(customerId: string): Promise<CustomerProfile> {
  const profile = await apiClient<any>(`/customers/${customerId}/risk-profile`, {
    method: 'GET',
  });

  return {
    id: customerId,
    name: customerId,
    email: `${customerId.toLowerCase()}@client.net`,
    accountCreated: profile.created_at || new Date().toISOString(),
    riskCategory: normalizeRiskLevel(profile.risk_level),
    kycStatus: 'VERIFIED',
    totalTransactionsCount: profile.devices_used_count || 1,
    totalVolumeSpent: Number(profile.risk_score || 0) * 10,
    chargebackCount: 0,
  };
}
