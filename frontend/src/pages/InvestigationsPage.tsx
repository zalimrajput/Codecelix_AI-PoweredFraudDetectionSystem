import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { RiskBadge } from '../components/common/RiskBadge';
import { DecisionBadge } from '../components/common/DecisionBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getInvestigations } from '../api/investigations';
import { Investigation } from '../types/investigation';
import { ShieldAlert, RefreshCw, Eye, ArrowRight } from 'lucide-react';

export const InvestigationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvestigationsList = async () => {
    setIsLoading(true);
    try {
      const response = await getInvestigations();
      setInvestigations(response.investigations || []);
    } catch {
      // Backend not connected yet: empty list
      setInvestigations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigationsList();
  }, []);

  const statusVariantMap = {
    OPEN: 'high' as const,
    UNDER_REVIEW: 'medium' as const,
    ESCALATED: 'high' as const,
    RESOLVED: 'low' as const,
    CLOSED: 'neutral' as const,
  };

  const columns: Column<Investigation>[] = [
    {
      key: 'id',
      header: 'Investigation ID',
      render: (item) => <span className="font-mono text-xs text-slate-200">{item.id}</span>,
    },
    {
      key: 'customerId',
      header: 'Customer',
      render: (item) => (
        <div>
          <span className="font-sans font-medium text-slate-200 block text-xs">{item.customerName || item.customerId}</span>
          <span className="font-mono text-[10px] text-slate-500">{item.customerId}</span>
        </div>
      ),
    },
    {
      key: 'riskScore',
      header: 'Risk Score',
      render: (item) => <RiskBadge level={item.riskLevel} score={item.riskScore} size="sm" />,
    },
    {
      key: 'decision',
      header: 'Decision',
      render: (item) => <DecisionBadge decision={item.decision} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={statusVariantMap[item.status] || 'neutral'} size="sm">
          {item.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'assignedAnalyst',
      header: 'Assigned Analyst',
      render: (item) => (
        <span className="font-sans text-xs text-slate-300">
          {item.assignedAnalyst || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'createdDate',
      header: 'Created Date',
      render: (item) => <span className="font-mono text-[11px] text-slate-400">{item.createdDate}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (item) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/investigations/${item.id}`)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Open Case
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Investigations Queue"
        description="Priority incident dossiers escalated by anomaly detection models and threshold rules"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Investigations' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvestigationsList}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Queue
          </Button>
        }
      />

      <DataTable<Investigation>
        columns={columns}
        data={investigations}
        isLoading={isLoading}
        emptyIcon={ShieldAlert}
        emptyTitle="No investigations available"
        emptyDescription="Active investigation cases will populate when incidents are flagged by detection models."
        onRowClick={(item) => navigate(`/investigations/${item.id}`)}
        rowKey={(item) => item.id}
      />
    </div>
  );
};
