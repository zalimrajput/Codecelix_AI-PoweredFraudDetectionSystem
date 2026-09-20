/**
 * CodeCelix Rules Engine Service
 * 
 * Integrated with FastAPI backend:
 * - GET    /api/rules
 * - POST   /api/rules
 * - PATCH  /api/rules/{id}
 * - DELETE /api/rules/{id}
 */

import { apiClient } from './client';
import { 
  FraudRule, 
  CreateRulePayload, 
  UpdateRulePayload, 
  RuleAction, 
  RuleOperator, 
  RuleSeverity 
} from '../types/rule';

interface BackendRule {
  id: string;
  name: string;
  description?: string;
  rule_type: string;
  conditions?: any;
  action: string;
  score_impact: number;
  severity: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

const OP_TO_BACKEND: Record<RuleOperator, string> = {
  EQUALS: '==',
  NOT_EQUALS: '!=',
  GREATER_THAN: '>',
  LESS_THAN: '<',
  CONTAINS: 'contains',
  IN_LIST: 'in',
  GEO_MISMATCH: '!=',
};

const OP_FROM_BACKEND: Record<string, RuleOperator> = {
  '==': 'EQUALS',
  '!=': 'NOT_EQUALS',
  '>': 'GREATER_THAN',
  '>=': 'GREATER_THAN',
  '<': 'LESS_THAN',
  '<=': 'LESS_THAN',
  'contains': 'CONTAINS',
  'in': 'IN_LIST',
  'not_in': 'NOT_EQUALS',
};

function mapAction(action?: string): RuleAction {
  const a = (action || '').toLowerCase();
  if (a.includes('block')) return 'BLOCK';
  if (a.includes('2fa') || a.includes('auth')) return 'REQUIRE_2FA';
  if (a.includes('alert')) return 'ALERT_ANALYST';
  return 'FLAG_FOR_REVIEW';
}

function mapActionToBackend(action: RuleAction): string {
  if (action === 'BLOCK') return 'block';
  if (action === 'REQUIRE_2FA') return 'flag_review';
  if (action === 'ALLOW') return 'increase_risk';
  return 'flag_review';
}

function formatRule(r: BackendRule): FraudRule {
  const cond = r.conditions || {};
  const field = cond.field || 'amount';
  const opSymbol = cond.op || '>';
  const threshold = cond.value !== undefined ? String(cond.value) : '1000';

  return {
    id: r.id,
    name: r.name,
    description: r.description || 'Configured heuristic fraud detection rule',
    ruleType: r.rule_type || 'TRANSACTION',
    field,
    operator: OP_FROM_BACKEND[opSymbol] || 'GREATER_THAN',
    threshold,
    action: mapAction(r.action),
    scoreImpact: Number(r.score_impact ?? 25),
    severity: (r.severity || 'MEDIUM').toUpperCase() as RuleSeverity,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at,
    triggerCount: 0,
  };
}

export async function getRules(): Promise<FraudRule[]> {
  const data = await apiClient<BackendRule[]>('/rules', {
    method: 'GET',
  });

  const list = Array.isArray(data) ? data : [];
  return list.map(formatRule);
}

export async function createRule(payload: CreateRulePayload): Promise<FraudRule> {
  const op = OP_TO_BACKEND[payload.operator] || '>';
  const val = !isNaN(Number(payload.threshold)) ? Number(payload.threshold) : payload.threshold;

  const backendBody = {
    name: payload.name,
    description: payload.description,
    rule_type: payload.ruleType || 'velocity',
    conditions: {
      field: payload.field,
      op,
      value: val,
    },
    action: mapActionToBackend(payload.action),
    score_impact: payload.scoreImpact,
    severity: (payload.severity || 'medium').toLowerCase(),
    is_active: payload.isActive ?? true,
  };

  const res = await apiClient<BackendRule>('/rules', {
    method: 'POST',
    body: JSON.stringify(backendBody),
  });

  return formatRule(res);
}

export async function updateRule(id: string, payload: UpdateRulePayload): Promise<FraudRule> {
  const updateBody: Record<string, any> = {};

  if (payload.name) updateBody.name = payload.name;
  if (payload.description !== undefined) updateBody.description = payload.description;
  if (payload.scoreImpact !== undefined) updateBody.score_impact = payload.scoreImpact;
  if (payload.severity) updateBody.severity = payload.severity.toLowerCase();
  if (payload.isActive !== undefined) updateBody.is_active = payload.isActive;
  if (payload.action) updateBody.action = mapActionToBackend(payload.action);

  if (payload.field && payload.operator && payload.threshold !== undefined) {
    const op = OP_TO_BACKEND[payload.operator] || '>';
    const val = !isNaN(Number(payload.threshold)) ? Number(payload.threshold) : payload.threshold;
    updateBody.conditions = {
      field: payload.field,
      op,
      value: val,
    };
  }

  const res = await apiClient<BackendRule>(`/rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateBody),
  });

  return formatRule(res);
}

export async function deleteRule(id: string): Promise<void> {
  await apiClient<void>(`/rules/${id}`, {
    method: 'DELETE',
  });
}
