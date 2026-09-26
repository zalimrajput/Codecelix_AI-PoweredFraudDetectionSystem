import { RiskLevel } from './transaction';

export type { RiskLevel };

export type NetworkNodeType = 'CUSTOMER' | 'DEVICE' | 'IP' | 'TRANSACTION';

export interface NetworkNodeData {
  id: string;
  label: string;
  type: NetworkNodeType;
  riskLevel: RiskLevel;
  totalTransactions?: number;
  totalVolume?: number;
  associatedCustomers?: string[];
  associatedDevices?: string[];
  associatedIps?: string[];
  metadata?: Record<string, string | number | boolean>;
}

export interface NetworkNode {
  id: string;
  type: string; // custom node type in React Flow
  position: { x: number; y: number };
  data: NetworkNodeData;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  isSuspicious?: boolean;
  animated?: boolean;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface NetworkFilter {
  search?: string;
  nodeType?: NetworkNodeType | 'ALL';
  riskLevel?: RiskLevel | 'ALL';
  showSuspiciousOnly?: boolean;
}
