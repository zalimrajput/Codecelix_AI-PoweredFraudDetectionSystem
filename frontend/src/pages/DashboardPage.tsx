import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  ShieldAlert,
  Percent,
  Bell,
  RefreshCw,
  Plus,
  Inbox,
  Eye,
  Sliders,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../features/dashboard/MetricCard';
import { RiskDistributionChart } from '../features/dashboard/RiskDistributionChart';
import { FraudTrendChart } from '../features/dashboard/FraudTrendChart';
import { DataTable, Column } from '../components/common/DataTable';
import { RiskBadge } from '../components/common/RiskBadge';
import { DecisionBadge } from '../components/common/DecisionBadge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { getDashboardData } from '../api/dashboard';
import { getTransactions } from '../api/transactions';
import { DashboardData } from '../types/dashboard';
import { Transaction } from '../types/transaction';
import { ManualTransactionModal } from '../features/transactions/ManualTransactionModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [highRiskTransactions, setHighRiskTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const result = await getDashboardData();
      setData(result);
    } catch {
      // Backend not connected yet: data remains null to display empty/connect states
      setData(null);
    }

    try {
      const txResult = await getTransactions({ riskLevel: 'HIGH', limit: 5 });
      setHighRiskTransactions(txResult.transactions || []);
    } catch {
      // Backend not connected yet: transactions remain empty
      setHighRiskTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const tableColumns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Transaction ID',
      render: (tx) => <span className="font-mono text-xs text-slate-200">{tx.id}</span>,
    },
    {
      key: 'customerId',
      header: 'Customer',
      render: (tx) => (
        <div>
          <span className="font-sans font-medium text-slate-200 block text-xs">{tx.customerName || tx.customerId}</span>
          <span className="font-mono text-[10px] text-slate-500">{tx.customerId}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (tx) => (
        <span className="font-mono text-xs font-semibold text-slate-100">
          ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'riskScore',
      header: 'Risk Score',
      render: (tx) => <RiskBadge level={tx.riskLevel} score={tx.riskScore} size="sm" />,
    },
    {
      key: 'decision',
      header: 'Decision',
      render: (tx) => <DecisionBadge decision={tx.decision} size="sm" />,
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (tx) => <span className="font-mono text-[11px] text-slate-400">{tx.timestamp}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (tx) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/transactions?id=${tx.id}`)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Intelligence Center"
        description="Real-time multi-vector risk detection and autonomous transaction telemetry"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboard}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Telemetry
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsManualModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Manual Evaluation
            </Button>
          </>
        }
      />

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Transactions"
          value={data?.metrics.totalTransactions}
          changePercent={data?.metrics.totalTransactionsChangePercent}
          icon={ArrowLeftRight}
          isLoading={isLoading}
          statusColor="neutral"
        />
        <MetricCard
          title="High-Risk Flagged"
          value={data?.metrics.highRiskFlagged}
          changePercent={data?.metrics.highRiskChangePercent}
          icon={ShieldAlert}
          isLoading={isLoading}
          statusColor="crimson"
        />
        <MetricCard
          title="Average Risk Score"
          value={data?.metrics.averageRiskScore}
          changePercent={data?.metrics.averageRiskScoreChange}
          formatAs="score"
          icon={Percent}
          isLoading={isLoading}
          statusColor="amber"
        />
        <MetricCard
          title="Open Alerts"
          value={data?.metrics.openAlerts}
          changePercent={data?.metrics.openAlertsChangePercent}
          icon={Bell}
          isLoading={isLoading}
          statusColor="crimson"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FraudTrendChart
            data={data?.fraudTrends}
            isLoading={isLoading}
          />
        </div>
        <div>
          <RiskDistributionChart
            data={data?.riskDistribution}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* High-Risk Activity Table */}
      <Card
        title="High-Risk Activity Stream"
        description="Real-time transactions flagged by deterministic rules or ML anomaly thresholds"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/transactions')}
          >
            View All Transactions
          </Button>
        }
      >
        <DataTable<Transaction>
          columns={tableColumns}
          data={highRiskTransactions}
          isLoading={isLoading}
          emptyIcon={Inbox}
          emptyTitle="No high-risk activity detected"
          emptyDescription="Connect your data source to view real-time flagged transaction telemetry."
          rowKey={(tx) => tx.id}
        />
      </Card>

      {/* Manual Evaluation Modal */}
      <ManualTransactionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={fetchDashboard}
      />
    </div>
  );
};
