/**
 * CodeCelix Fraud Network Visualization Service
 * 
 * Integrated with FastAPI backend:
 * - GET /api/network
 */

import { apiClient } from './client';
import { NetworkGraphData, NetworkFilter, NetworkNode, NetworkEdge, NetworkNodeType, RiskLevel } from '../types/network';

interface BackendNetworkNode {
  id: string;
  type: string;
  label?: string;
}

interface BackendNetworkEdge {
  source: string;
  target: string;
  relation?: string;
}

interface BackendNetworkResponse {
  nodes: BackendNetworkNode[];
  edges: BackendNetworkEdge[];
}

function mapNodeType(rawType?: string): NetworkNodeType {
  const t = (rawType || '').toLowerCase();
  if (t.includes('cust')) return 'CUSTOMER';
  if (t.includes('dev')) return 'DEVICE';
  if (t.includes('ip')) return 'IP';
  return 'TRANSACTION';
}

export async function getNetworkData(filter?: NetworkFilter): Promise<NetworkGraphData> {
  const res = await apiClient<BackendNetworkResponse>('/network', {
    method: 'GET',
    params: filter as Record<string, string | number | boolean | undefined>,
  });

  const rawNodes = Array.isArray(res.nodes) ? res.nodes : [];
  const rawEdges = Array.isArray(res.edges) ? res.edges : [];

  const total = rawNodes.length;
  const radius = Math.min(350, Math.max(180, total * 35));

  const nodes: NetworkNode[] = rawNodes.map((n, idx) => {
    const nodeType = mapNodeType(n.type);
    const angle = (2 * Math.PI * idx) / (total || 1);
    const x = Math.round(500 + radius * Math.cos(angle));
    const y = Math.round(350 + radius * Math.sin(angle));

    let riskLevel: RiskLevel = 'LOW';
    if (nodeType === 'DEVICE' && rawEdges.filter(e => e.target === n.id || e.source === n.id).length > 2) {
      riskLevel = 'HIGH';
    } else if (nodeType === 'CUSTOMER') {
      riskLevel = 'MEDIUM';
    }

    return {
      id: n.id,
      type: 'customNode',
      position: { x, y },
      data: {
        id: n.id,
        label: n.label || n.id.replace(/^(cust|dev|ip):/, ''),
        type: nodeType,
        riskLevel,
        totalTransactions: 1,
        totalVolume: 100,
        associatedCustomers: [],
        associatedDevices: [],
        associatedIps: [],
      },
    };
  });

  const edges: NetworkEdge[] = rawEdges.map((e, idx) => ({
    id: `edge-${idx}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    label: e.relation ? e.relation.replace(/_/g, ' ') : 'links to',
    isSuspicious: e.relation === 'used_device' || e.relation === 'shared_ip',
    animated: true,
  }));

  return { nodes, edges };
}
