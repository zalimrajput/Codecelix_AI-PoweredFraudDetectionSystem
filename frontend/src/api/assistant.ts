import { apiClient } from './client';
import { AssistantQueryPayload, AssistantQueryResponse } from '../types/assistant';

interface BackendAssistantResponse {
  query: string;
  answer: string;
  mode: string;
  referenced_data: Record<string, any>;
}

export async function askAssistant(payload: AssistantQueryPayload): Promise<AssistantQueryResponse> {
  const backendRequest = {
    query: payload.prompt,
    customer_id: payload.context?.customerId,
    investigation_id: payload.context?.investigationId,
    transaction_id: payload.context?.transactionId,
    device_id: payload.context?.deviceId,
  };

  const res = await apiClient<BackendAssistantResponse>('/assistant/query', {
    method: 'POST',
    body: JSON.stringify(backendRequest),
  });

  const sources = res.referenced_data ? Object.keys(res.referenced_data) : [];
  return {
    answer: res.answer,
    confidenceScore: 0.95,
    sources,
    suggestedActions: [
      'Inspect customer transaction history',
      'Verify device biometric fingerprint',
      'Check triggered AML rule signals',
    ],
  };
}
