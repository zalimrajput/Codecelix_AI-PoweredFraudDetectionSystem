export interface DashboardMetrics {
  totalTransactions: number;
  totalTransactionsChangePercent?: number;
  highRiskFlagged: number;
  highRiskChangePercent?: number;
  averageRiskScore: number;
  averageRiskScoreChange?: number;
  openAlerts: number;
  openAlertsChangePercent?: number;
}

export interface RiskDistributionItem {
  name: 'Low' | 'Medium' | 'High';
  value: number;
  color: string;
}

export interface FraudTrendDataPoint {
  date: string;
  totalVolume: number;
  suspiciousVolume: number;
  blockedVolume: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  riskDistribution: RiskDistributionItem[];
  fraudTrends: FraudTrendDataPoint[];
}
