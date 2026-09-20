import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { TransactionFilters } from '../features/transactions/TransactionFilters';
import { ManualTransactionModal } from '../features/transactions/ManualTransactionModal';
import { CsvImportModal } from '../features/transactions/CsvImportModal';
import { DataTable, Column } from '../components/common/DataTable';
import { RiskBadge } from '../components/common/RiskBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getTransactions } from '../api/transactions';
import { Transaction, TransactionFilter } from '../../src/types/transaction';
import { UploadCloud, Plus, ArrowLeftRight, RefreshCw, Eye, Smartphone, Globe } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<TransactionFilter>({});
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const fetchTransactionsList = async (currentFilters: TransactionFilter = filters) => {
    setIsLoading(true);
    try {
      const response = await getTransactions(currentFilters);
      setTransactions(response.transactions || []);
      setTotalCount(response.total || 0);
    } catch {
      // Backend not connected yet: transactions remain empty
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsList(filters);
  }, []);

  const handleFilterChange = (newFilters: TransactionFilter) => {
    setFilters(newFilters);
    fetchTransactionsList(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    fetchTransactionsList({});
  };

  const statusVariantMap = {
    COMPLETED: 'low' as const,
    PENDING: 'medium' as const,
    FAILED: 'high' as const,
    REVERSED: 'high' as const,
  };

  const columns: Column<Transaction>[] = [
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
      key: 'paymentMethod',
      header: 'Payment Method',
      render: (tx) => (
        <span className="font-mono text-[11px] text-slate-400">
          {tx.paymentMethod.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'deviceIp',
      header: 'Device / IP',
      render: (tx) => (
        <div className="space-y-0.5 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Globe className="w-3 h-3 text-purple-400 shrink-0" />
            <span className="truncate max-w-[120px]">{tx.ipAddress}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Smartphone className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[120px]">{tx.deviceId}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      render: (tx) => <RiskBadge level={tx.riskLevel} score={tx.riskScore} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (tx) => (
        <Badge variant={statusVariantMap[tx.status] || 'neutral'} size="sm">
          {tx.status}
        </Badge>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (tx) => <span className="font-mono text-[11px] text-slate-400">{tx.timestamp}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (tx) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {}}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Intelligence"
        description="Comprehensive audit register and real-time fraud classification stream"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Transactions' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCsvModalOpen(true)}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              CSV Batch Import
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsManualModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Evaluate Transaction
            </Button>
          </>
        }
      />

      {/* Advanced Filter Bar */}
      <TransactionFilters
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Dynamic Data Table */}
      <DataTable<Transaction>
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        emptyIcon={ArrowLeftRight}
        emptyTitle="No transactions available"
        emptyDescription="Transactions will populate upon stream connection or manual batch CSV ingestion."
        emptyActionLabel="Import CSV Transactions"
        onEmptyAction={() => setIsCsvModalOpen(true)}
        rowKey={(tx) => tx.id}
      />

      {/* Modals */}
      <ManualTransactionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => fetchTransactionsList()}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={() => fetchTransactionsList()}
      />
    </div>
  );
};
