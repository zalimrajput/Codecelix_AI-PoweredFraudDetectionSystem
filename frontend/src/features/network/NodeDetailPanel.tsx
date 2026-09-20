import React from 'react';
import { NetworkNodeData } from '../../types/network';
import { RiskBadge } from '../../components/common/RiskBadge';
import { X, User, Smartphone, Globe, ArrowLeftRight, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface NodeDetailPanelProps {
  nodeData: NetworkNodeData | null;
  onClose: () => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  nodeData,
  onClose,
}) => {
  if (!nodeData) return null;

  const nodeIcons = {
    CUSTOMER: <User className="w-4 h-4 text-blue-400" />,
    DEVICE: <Smartphone className="w-4 h-4 text-emerald-400" />,
    IP: <Globe className="w-4 h-4 text-purple-400" />,
    TRANSACTION: <ArrowLeftRight className="w-4 h-4 text-cyan-400" />,
  };

  return (
    <div className="w-80 bg-slate-900/95 border-l border-slate-800 shadow-elevated p-5 flex flex-col h-full font-sans text-xs overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          {nodeIcons[nodeData.type]}
          <span className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
            {nodeData.type} Detail
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-4 py-4 flex-1">
        {/* Entity Identifier */}
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-mono block">
            Entity ID / Identifier
          </span>
          <p className="text-sm font-bold font-mono text-slate-100 mt-0.5 break-all">
            {nodeData.id}
          </p>
        </div>

        {/* Risk Status */}
        <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span className="text-slate-400">Risk Assessment:</span>
          <RiskBadge level={nodeData.riskLevel} />
        </div>

        {/* Total Transactions */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">Total Linked Transactions</span>
          <span className="text-base font-bold text-slate-200 mt-1 block">
            {nodeData.totalTransactions ?? 0}
          </span>
          {nodeData.totalVolume !== undefined && (
            <span className="text-xs text-slate-400 mt-0.5 block">
              Cumulative Volume: ${nodeData.totalVolume.toLocaleString()}
            </span>
          )}
        </div>

        {/* Associated Customers */}
        <div>
          <span className="text-[11px] font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            Associated Customers ({nodeData.associatedCustomers?.length || 0})
          </span>
          {nodeData.associatedCustomers && nodeData.associatedCustomers.length > 0 ? (
            <div className="space-y-1">
              {nodeData.associatedCustomers.map((cust) => (
                <div
                  key={cust}
                  className="p-2 rounded bg-slate-950/40 border border-slate-800 font-mono text-[11px] text-blue-300"
                >
                  {cust}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px]">No direct customer linkages</p>
          )}
        </div>

        {/* Associated Devices */}
        <div>
          <span className="text-[11px] font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            Associated Devices ({nodeData.associatedDevices?.length || 0})
          </span>
          {nodeData.associatedDevices && nodeData.associatedDevices.length > 0 ? (
            <div className="space-y-1">
              {nodeData.associatedDevices.map((dev) => (
                <div
                  key={dev}
                  className="p-2 rounded bg-slate-950/40 border border-slate-800 font-mono text-[11px] text-emerald-300 truncate"
                >
                  {dev}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px]">No linked device fingerprints</p>
          )}
        </div>

        {/* Associated IPs */}
        <div>
          <span className="text-[11px] font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            Associated IP Addresses ({nodeData.associatedIps?.length || 0})
          </span>
          {nodeData.associatedIps && nodeData.associatedIps.length > 0 ? (
            <div className="space-y-1">
              {nodeData.associatedIps.map((ip) => (
                <div
                  key={ip}
                  className="p-2 rounded bg-slate-950/40 border border-slate-800 font-mono text-[11px] text-purple-300"
                >
                  {ip}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px]">No linked IP addresses</p>
          )}
        </div>
      </div>
    </div>
  );
};
