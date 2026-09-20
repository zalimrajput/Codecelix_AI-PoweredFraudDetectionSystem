export type ReportType = 'DAILY' | 'MONTHLY' | 'HIGH_RISK' | 'GEOGRAPHIC' | 'RULE_PERFORMANCE';
export type ReportFormat = 'CSV' | 'JSON' | 'PDF';

export interface ReportFilter {
  type: ReportType;
  startDate: string;
  endDate: string;
  riskThreshold?: number;
  includeResolvedInvestigations?: boolean;
}

export interface ReportSummary {
  id: string;
  title: string;
  type: ReportType;
  generatedDate: string;
  dateRange: {
    start: string;
    end: string;
  };
  totalTransactionsScanned: number;
  flaggedSuspiciousCount: number;
  blockedCount: number;
  falsePositiveRate: number;
  estimatedLossPrevented: number;
  downloadUrl?: string;
}
