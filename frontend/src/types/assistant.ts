export type AssistantSender = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface AssistantMessage {
  id: string;
  sender: AssistantSender;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  citationSources?: Array<{ title: string; link?: string }>;
}

export interface AssistantQueryPayload {
  prompt: string;
  context?: {
    customerId?: string;
    investigationId?: string;
    transactionId?: string;
    deviceId?: string;
    ipAddress?: string;
  };
}

export interface AssistantQueryResponse {
  answer: string;
  suggestedActions?: string[];
  confidenceScore?: number;
  sources?: string[];
}
