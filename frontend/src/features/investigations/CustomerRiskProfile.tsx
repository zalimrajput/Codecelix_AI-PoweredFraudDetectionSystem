import React from 'react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { CustomerProfile } from '../../types/investigation';
import { User, ShieldCheck, CreditCard, AlertOctagon, Mail, Calendar } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { RiskBadge } from '../../components/common/RiskBadge';

export interface CustomerRiskProfileProps {
  profile?: CustomerProfile | null;
  isLoading?: boolean;
}

export const CustomerRiskProfile: React.FC<CustomerRiskProfileProps> = ({
  profile,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card title="Customer Intelligence Profile">
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card title="Customer Intelligence Profile">
        <EmptyState
          icon={User}
          title="No customer profile attached"
          description="Customer metadata telemetry will appear when connected to backend."
        />
      </Card>
    );
  }

  return (
    <Card
      title="Customer Intelligence Profile"
      description="Identity verification standing and historical transactional posture"
      className="h-full"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Customer Header Info */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-sm">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">{profile.name}</h4>
              <span className="text-[11px] font-mono text-slate-400">{profile.id}</span>
            </div>
          </div>
          <RiskBadge level={profile.riskCategory} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono text-[11px] truncate">{profile.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono text-[11px]">Member since: {profile.accountCreated}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>KYC Standing:</span>
            <Badge variant={profile.kycStatus === 'VERIFIED' ? 'low' : 'medium'} size="sm">
              {profile.kycStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-3.5 h-3.5 text-slate-500" />
            <span>Chargebacks:</span>
            <span className="font-mono font-bold text-rose-400">{profile.chargebackCount}</span>
          </div>
        </div>

        {/* Lifetime Telemetry */}
        <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Total Transactions</span>
            <span className="text-base font-bold text-slate-200 mt-0.5 block">
              {profile.totalTransactionsCount}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Total Volume Spent</span>
            <span className="text-base font-bold text-slate-200 mt-0.5 block">
              ${profile.totalVolumeSpent.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
