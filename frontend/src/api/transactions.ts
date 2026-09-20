/**
 * CodeCelix Transactions Service
 * 
 * Integrated with FastAPI backend:
 * - GET  /api/transactions
 * - GET  /api/transactions/{id}
 * - POST /api/transactions/manual
 * - POST /api/transactions/import/csv
 */

import { apiClient } from './client';
import { 
  Transaction, 
  TransactionFilter, 
  ManualTransactionPayload, 
  CsvImportResult,
  PaymentMethod,
  RiskLevel,
  TransactionDecision,
  TransactionStatus
} from '../types/transaction';

interface BackendTransaction {
  id: string;
  txn_external_id?: string;
  customer_id: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  status?: string;
  device_id?: string;
  ip_address_str?: string;
  country?: string;
  city?: string;
  created_at: string;
  reviewed?: boolean;
}

function mapPaymentMethod(pm?: string): PaymentMethod {
  const p = (pm || '').toLowerCase();
  if (p.includes('credit')) return 'CREDIT_CARD';
  if (p.includes('debit')) return 'DEBIT_CARD';
  if (p.includes('crypto')) return 'CRYPTO';
  if (p.includes('transfer') || p.includes('wire')) return 'WIRE_TRANSFER';
  if (p.includes('wallet') || p.includes('paypal') || p.includes('upi')) return 'DIGITAL_WALLET';
  return 'CREDIT_CARD';
}

function mapStatus(status?: string): { status: TransactionStatus; decision: TransactionDecision; riskLevel: RiskLevel; riskScore: number } {
  const s = (status || '').toLowerCase();
  if (s === 'blocked' || s === 'block') {
    return { status: 'FAILED', decision: 'BLOCKED', riskLevel: 'HIGH', riskScore: 88 };
  }
  if (s === 'review') {
    return { status: 'PENDING', decision: 'REVIEW', riskLevel: 'MEDIUM', riskScore: 52 };
  }
  return { status: 'COMPLETED', decision: 'APPROVED', riskLevel: 'LOW', riskScore: 12 };
}

function formatTransaction(t: BackendTransaction): Transaction {
  const { status, decision, riskLevel, riskScore } = mapStatus(t.status);
  const locationParts = [t.city, t.country].filter(Boolean);

  return {
    id: t.id,
    customerId: t.customer_id,
    customerName: t.customer_id,
    amount: Number(t.amount || 0),
    currency: t.currency || 'USD',
    paymentMethod: mapPaymentMethod(t.payment_method),
    ipAddress: t.ip_address_str || '127.0.0.1',
    deviceId: t.device_id || 'unknown-device',
    location: locationParts.length > 0 ? locationParts.join(', ') : 'Global',
    riskScore,
    riskLevel,
    decision,
    status,
    timestamp: t.created_at || new Date().toISOString(),
    flags: [],
  };
}

export async function getTransactions(filter?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};

  if (filter?.page) queryParams.page = filter.page;
  if (filter?.limit) queryParams.page_size = filter.limit;
  if (filter?.search) queryParams.search = filter.search;
  if (filter?.minAmount) queryParams.min_amount = filter.minAmount;
  if (filter?.maxAmount) queryParams.max_amount = filter.maxAmount;
  if (filter?.startDate) queryParams.date_from = filter.startDate;
  if (filter?.endDate) queryParams.date_to = filter.endDate;

  const data = await apiClient<{ items: BackendTransaction[]; total: number }>('/transactions', {
    method: 'GET',
    params: queryParams,
  });

  const rawItems = Array.isArray(data.items) ? data.items : [];
  return {
    transactions: rawItems.map(formatTransaction),
    total: data.total ?? rawItems.length,
  };
}

export async function getTransactionById(id: string): Promise<Transaction> {
  const data = await apiClient<BackendTransaction>(`/transactions/${id}`, {
    method: 'GET',
  });
  return formatTransaction(data);
}

export async function createTransaction(data: ManualTransactionPayload): Promise<Transaction> {
  const payload = {
    customer_id: data.customerId,
    amount: data.amount,
    currency: data.currency || 'USD',
    payment_method: data.paymentMethod?.toLowerCase() || 'card',
    ip_address: data.ipAddress,
    device_id: data.deviceId,
    country: data.location?.split(',')[1]?.trim() || data.location,
    city: data.location?.split(',')[0]?.trim(),
  };

  const res = await apiClient<BackendTransaction>('/transactions/manual', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return formatTransaction(res);
}

export async function importTransactionsCsv(file: File): Promise<CsvImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('codecelix_auth_token');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

  const response = await fetch(`${baseUrl}/transactions/import/csv`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Upload failed with status ${response.status}`;
    try {
      const err = await response.json();
      errorMessage = err.detail || err.message || errorMessage;
    } catch {
      // Non-JSON response
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  const created = result.created || 0;
  const errors = result.errors || [];

  return {
    totalProcessed: created + errors.length,
    successful: created,
    failed: errors.length,
    flaggedHighRisk: 0,
    errors: errors.map((e: any) => ({ row: e.line || 0, reason: e.error || 'Validation error' })),
  };
}
