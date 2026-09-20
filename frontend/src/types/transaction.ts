export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type TransactionDecision = 'APPROVED' | 'REVIEW' | 'BLOCKED';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'WIRE_TRANSFER' | 'CRYPTO' | 'ACH' | 'DIGITAL_WALLET';

export interface Transaction {
  id: string;
  customerId: string;
  customerName?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  ipAddress: string;
  deviceId: string;
  location?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: TransactionDecision;
  status: TransactionStatus;
  timestamp: string;
  flags?: string[];
}

export interface TransactionFilter {
  search?: string;
  ipAddress?: string;
  deviceId?: string;
  transactionId?: string;
  status?: TransactionStatus | 'ALL';
  riskLevel?: RiskLevel | 'ALL';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface ManualTransactionPayload {
  customerId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  ipAddress: string;
  deviceId: string;
  location: string;
}

export interface CsvImportResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  flaggedHighRisk: number;
  errors?: Array<{ row: number; reason: string }>;
}
