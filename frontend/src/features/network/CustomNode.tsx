import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NetworkNodeData } from '../../types/network';
import { User, Smartphone, Globe, ArrowLeftRight } from 'lucide-react';

export const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as NetworkNodeData;

  const nodeIcons = {
    CUSTOMER: <User className="w-3.5 h-3.5" />,
    DEVICE: <Smartphone className="w-3.5 h-3.5" />,
    IP: <Globe className="w-3.5 h-3.5" />,
    TRANSACTION: <ArrowLeftRight className="w-3.5 h-3.5" />,
  };

  const borderColors = {
    CUSTOMER: 'border-blue-500/80 bg-blue-950/40 text-blue-300',
    DEVICE: 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300',
    IP: 'border-purple-500/80 bg-purple-950/40 text-purple-300',
    TRANSACTION: 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300',
  };

  const riskDotColors = {
    LOW: 'bg-emerald-400',
    MEDIUM: 'bg-amber-400',
    HIGH: 'bg-rose-400 animate-pulse',
  };

  return (
    <div
      className={`px-3 py-2 rounded-lg border shadow-lg backdrop-blur-md min-w-[140px] transition-all cursor-pointer ${
        borderColors[nodeData.type] || 'border-slate-700 bg-slate-900 text-slate-200'
      } ${selected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-105' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          {nodeIcons[nodeData.type]}
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
            {nodeData.type}
          </span>
        </div>
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${riskDotColors[nodeData.riskLevel]}`}
          title={`Risk: ${nodeData.riskLevel}`}
        />
      </div>

      <div className="text-xs font-mono font-semibold text-slate-100 truncate">
        {nodeData.label || nodeData.id}
      </div>

      {nodeData.totalTransactions !== undefined && (
        <div className="text-[10px] font-mono text-slate-400 mt-1">
          Tx: {nodeData.totalTransactions}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
};
