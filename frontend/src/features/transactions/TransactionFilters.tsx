import React, { useState } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { TransactionFilter, TransactionStatus, RiskLevel } from '../../types/transaction';

export interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilter) => void;
  onReset: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  onFilterChange,
  onReset,
}) => {
  const [filters, setFilters] = useState<TransactionFilter>({
    search: '',
    ipAddress: '',
    deviceId: '',
    transactionId: '',
    status: 'ALL',
    riskLevel: 'ALL',
    minAmount: undefined,
    maxAmount: undefined,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof TransactionFilter, value: unknown) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const resetValues: TransactionFilter = {
      search: '',
      ipAddress: '',
      deviceId: '',
      transactionId: '',
      status: 'ALL',
      riskLevel: 'ALL',
      minAmount: undefined,
      maxAmount: undefined,
    };
    setFilters(resetValues);
    onReset();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-card space-y-3">
      {/* Primary Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search customer, ID, IP or hash..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-500" />}
          />
        </div>

        <div className="w-full md:w-44">
          <Select
            value={filters.riskLevel || 'ALL'}
            onChange={(e) => handleChange('riskLevel', e.target.value as RiskLevel | 'ALL')}
            options={[
              { value: 'ALL', label: 'All Risk Tiers' },
              { value: 'LOW', label: 'Low Risk' },
              { value: 'MEDIUM', label: 'Medium Risk' },
              { value: 'HIGH', label: 'High Risk' },
            ]}
          />
        </div>

        <div className="w-full md:w-44">
          <Select
            value={filters.status || 'ALL'}
            onChange={(e) => handleChange('status', e.target.value as TransactionStatus | 'ALL')}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'REVERSED', label: 'Reversed' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsExpanded(!isExpanded)}
            leftIcon={<Filter className="w-3.5 h-3.5" />}
          >
            {isExpanded ? 'Fewer Filters' : 'More Filters'}
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={handleReset}
            title="Reset filters"
            aria-label="Reset filters"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 animate-in fade-in duration-150">
          <Input
            label="IP Address"
            placeholder="e.g. 192.168.1.1"
            value={filters.ipAddress || ''}
            onChange={(e) => handleChange('ipAddress', e.target.value)}
          />
          <Input
            label="Device Fingerprint"
            placeholder="e.g. dev_9f82d1"
            value={filters.deviceId || ''}
            onChange={(e) => handleChange('deviceId', e.target.value)}
          />
          <Input
            label="Min Amount ($)"
            type="number"
            placeholder="0"
            value={filters.minAmount !== undefined ? String(filters.minAmount) : ''}
            onChange={(e) => handleChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            label="Max Amount ($)"
            type="number"
            placeholder="100000"
            value={filters.maxAmount !== undefined ? String(filters.maxAmount) : ''}
            onChange={(e) => handleChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      )}
    </div>
  );
};
