export type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type RuleAction = 'BLOCK' | 'FLAG_FOR_REVIEW' | 'REQUIRE_2FA' | 'ALLOW' | 'ALERT_ANALYST';
export type RuleOperator = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN_LIST' | 'GEO_MISMATCH';

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  ruleType: string;
  field: string;
  operator: RuleOperator;
  threshold: string;
  action: RuleAction;
  scoreImpact: number; // e.g. 0 to 100
  severity: RuleSeverity;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  triggerCount?: number;
}

export interface CreateRulePayload {
  name: string;
  description: string;
  ruleType: string;
  field: string;
  operator: RuleOperator;
  threshold: string;
  action: RuleAction;
  scoreImpact: number;
  severity: RuleSeverity;
  isActive?: boolean;
}

export interface UpdateRulePayload extends Partial<CreateRulePayload> {
  id?: string;
  isActive?: boolean;
}
