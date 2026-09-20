import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeMouseHandler,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NetworkGraphData, NetworkNodeData, NetworkFilter } from '../../types/network';
import { CustomNode } from './CustomNode';
import { NodeDetailPanel } from './NodeDetailPanel';
import { NetworkToolbar } from './NetworkToolbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Share2 } from 'lucide-react';

export interface NetworkGraphProps {
  data?: NetworkGraphData | null;
  isLoading?: boolean;
  onFilterChange?: (filters: NetworkFilter) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  data,
  isLoading = false,
  onFilterChange,
}) => {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<NetworkNodeData | null>(null);
  const [filters, setFilters] = useState<NetworkFilter>({
    search: '',
    nodeType: 'ALL',
    riskLevel: 'ALL',
    showSuspiciousOnly: false,
  });

  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  // Filter nodes and edges dynamically based on user controls
  const filteredNodes: Node[] = useMemo(() => {
    if (!data?.nodes) return [];
    return data.nodes
      .filter((n) => {
        const d = n.data;
        if (filters.nodeType && filters.nodeType !== 'ALL' && d.type !== filters.nodeType) {
          return false;
        }
        if (filters.riskLevel && filters.riskLevel !== 'ALL' && d.riskLevel !== filters.riskLevel) {
          return false;
        }
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchLabel = d.label?.toLowerCase().includes(query);
          const matchId = d.id?.toLowerCase().includes(query);
          if (!matchLabel && !matchId) return false;
        }
        return true;
      })
      .map((n) => ({
        id: n.id,
        type: 'customNode',
        position: n.position || { x: 0, y: 0 },
        data: n.data as unknown as Record<string, unknown>,
      }));
  }, [data?.nodes, filters]);

  const filteredEdges: Edge[] = useMemo(() => {
    if (!data?.edges) return [];
    const activeNodeIds = new Set(filteredNodes.map((n) => n.id));
    return data.edges
      .filter((e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target))
      .filter((e) => (filters.showSuspiciousOnly ? e.isSuspicious : true))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: e.animated || e.isSuspicious,
        style: {
          stroke: e.isSuspicious ? '#F43F5E' : '#475569',
          strokeWidth: e.isSuspicious ? 2 : 1.5,
        },
      }));
  }, [data?.edges, filteredNodes, filters.showSuspiciousOnly]);

  const [nodes, setNodes, onNodesChange] = useNodesState(filteredNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(filteredEdges);

  // Sync state when filtered items change
  React.useEffect(() => {
    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [filteredNodes, filteredEdges, setNodes, setEdges]);

  const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNodeData(node.data as unknown as NetworkNodeData);
  }, []);

  const handleFilterUpdate = (newFilters: NetworkFilter) => {
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const hasGraphData = data && data.nodes && data.nodes.length > 0;

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-12rem)]">
      {/* Network Toolbar */}
      <NetworkToolbar
        filters={filters}
        onFilterChange={handleFilterUpdate}
        onFitView={() => rfInstance?.fitView({ padding: 0.2 })}
        onZoomIn={() => rfInstance?.zoomIn()}
        onZoomOut={() => rfInstance?.zoomOut()}
      />

      {/* Graph Canvas Container */}
      <div className="relative flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-card flex">
        {!hasGraphData ? (
          <div className="w-full h-full flex items-center justify-center p-6">
            <EmptyState
              icon={Share2}
              title="No network data available"
              description="Entity relationship graph will visualize customer, device, IP, and transaction linkages once populated by the backend."
            />
          </div>
        ) : (
          <div className="flex-1 h-full relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              onNodeClick={handleNodeClick}
              onInit={setRfInstance}
              fitView
              minZoom={0.2}
              maxZoom={2}
            >
              <Background color="#1E293B" gap={18} size={1} />
              <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-300" />
            </ReactFlow>
          </div>
        )}

        {/* Selected Node Details Side Panel */}
        {selectedNodeData && (
          <NodeDetailPanel
            nodeData={selectedNodeData}
            onClose={() => setSelectedNodeData(null)}
          />
        )}
      </div>
    </div>
  );
};
