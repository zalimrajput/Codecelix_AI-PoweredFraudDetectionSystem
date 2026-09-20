import React from 'react';
import { Search, Filter, ShieldAlert, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { NetworkFilter, NetworkNodeType } from '../../types/network';
import { RiskLevel } from '../../types/transaction';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';

export interface NetworkToolbarProps {
  filters: NetworkFilter;
  onFilterChange: (filters: NetworkFilter) => void;
  onFitView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export const NetworkToolbar: React.FC<NetworkToolbarProps> = ({
  filters,
  onFilterChange,
  onFitView,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-card flex flex-wrap items-center justify-between gap-3">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        <div className="w-56">
          <Input
            placeholder="Search entity, IP, device..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            leftIcon={<Search className="w-3.5 h-3.5 text-slate-500" />}
          />
        </div>

        <div className="w-36">
          <Select
            value={filters.nodeType || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, nodeType: e.target.value as NetworkNodeType | 'ALL' })}
            options={[
              { value: 'ALL', label: 'All Entities' },
              { value: 'CUSTOMER', label: 'Customers' },
              { value: 'DEVICE', label: 'Devices' },
              { value: 'IP', label: 'IP Addresses' },
              { value: 'TRANSACTION', label: 'Transactions' },
            ]}
          />
        </div>

        <div className="w-36">
          <Select
            value={filters.riskLevel || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, riskLevel: e.target.value as RiskLevel | 'ALL' })}
            options={[
              { value: 'ALL', label: 'All Risk' },
              { value: 'LOW', label: 'Low Risk' },
              { value: 'MEDIUM', label: 'Medium Risk' },
              { value: 'HIGH', label: 'High Risk' },
            ]}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700">
          <input
            type="checkbox"
            checked={Boolean(filters.showSuspiciousOnly)}
            onChange={(e) => onFilterChange({ ...filters, showSuspiciousOnly: e.target.checked })}
            className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
          />
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Suspicious links only</span>
        </label>
      </div>

      {/* Canvas Zoom Controls */}
      <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 p-1 rounded-lg shrink-0">
        {onZoomIn && (
          <button
            onClick={onZoomIn}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        )}
        {onZoomOut && (
          <button
            onClick={onZoomOut}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        )}
        {onFitView && (
          <button
            onClick={onFitView}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Fit to Canvas"
            aria-label="Fit to Canvas"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
