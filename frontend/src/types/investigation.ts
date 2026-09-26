import { RiskLevel, TransactionDecision } from './transaction';

export type { RiskLevel, TransactionDecision };

export type InvestigationStatus = 'OPEN' | 'UNDER_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
export type InvestigationDecision = 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE' | 'SUSPICIOUS_CLEARED' | 'PENDING_INFO';

export interface Investigation {
  id: string;
  customerId: string;
  customerName?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: TransactionDecision;
  status: InvestigationStatus;
  assignedAnalyst?: string;
  assignedAnalystId?: string;
  createdDate: string;
  updatedDate?: string;
  transactionCount?: number;
  totalVolume?: number;
}

export interface RiskBreakdown {
  finalRiskScore: number;
  riskLevel: RiskLevel;
  decision: TransactionDecision;
  mlAnomalyScore: number;
  ruleScore: number;
  behaviorScore: number;
}

export interface AiExplanation {
  geminiSummary: string;
  deterministicExplanation: string;
  riskFactors: string[];
  recommendedAction?: string;
}

export interface TriggeredRule {
  id: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  scoreImpact: number;
  description: string;
  triggeredAt: string;
}

export interface DetectedPattern {
  id: string;
  name: string;
  category: string;
  confidenceScore: number;
  description: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountCreated: string;
  riskCategory: RiskLevel;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  totalTransactionsCount: number;
  totalVolumeSpent: number;
  chargebackCount: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'TRANSACTION' | 'LOGIN' | 'RULE_TRIGGER' | 'NOTE' | 'STATUS_CHANGE';
}

export interface RelatedAlert {
  id: string;
  type: string;
  severity: RiskLevel;
  message: string;
  timestamp: string;
  status: 'UNREVIEWED' | 'ACKNOWLEDGED' | 'DISMISSED';
}

export interface AnalystNotesPayload {
  investigationId: string;
  notes: string;
  conclusion: InvestigationDecision;
  closeCase?: boolean;
}

export interface InvestigationDetail extends Investigation {
  riskBreakdown: RiskBreakdown;
  aiExplanation: AiExplanation;
  triggeredRules: TriggeredRule[];
  detectedPatterns: DetectedPattern[];
  customerProfile: CustomerProfile;
  timeline: TimelineEvent[];
  relatedAlerts: RelatedAlert[];
  analystNotes?: string;
  conclusion?: InvestigationDecision;
}
