import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { UserFilter, UserStatus } from '../../types/user';
import { UserRole } from '../../types/auth';

export interface UserFiltersProps {
  filters: UserFilter;
  onChange: (filters: UserFilter) => void;
  onReset: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-card flex flex-col md:flex-row items-center gap-3">
      <div className="flex-1 w-full">
        <Input
          placeholder="Filter team members by name or email..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          leftIcon={<Search className="w-4 h-4 text-slate-500" />}
        />
      </div>

      <div className="w-full md:w-48">
        <Select
          value={filters.role || 'ALL'}
          onChange={(e) => onChange({ ...filters, role: e.target.value as UserRole | 'ALL' })}
          options={[
            { value: 'ALL', label: 'All Roles' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'BUSINESS_MANAGER', label: 'Business Manager' },
            { value: 'ANALYST', label: 'Fraud Analyst' },
          ]}
        />
      </div>

      <div className="w-full md:w-48">
        <Select
          value={filters.status || 'ALL'}
          onChange={(e) => onChange({ ...filters, status: e.target.value as UserStatus | 'ALL' })}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'SUSPENDED', label: 'Suspended' },
            { value: 'PENDING_INVITE', label: 'Pending Invite' },
            { value: 'INACTIVE', label: 'Inactive' },
          ]}
        />
      </div>

      <Button
        variant="ghost"
        size="md"
        onClick={onReset}
        title="Reset filters"
        aria-label="Reset filters"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};
