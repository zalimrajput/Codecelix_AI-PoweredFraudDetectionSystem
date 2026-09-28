import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { ReportGenerator } from '../features/reports/ReportGenerator';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getReports, generateReport, exportReport } from '../api/reports';
import { ReportSummary, ReportFilter, ReportFormat } from '../types/report';
import { BarChart3, Download, FileText, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReportsList = async () => {
    setIsLoading(true);
    try {
      const data = await getReports();
      setReports(data || []);
    } catch {
      // Backend not connected yet: empty list
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsList();
  }, []);

  const handleGenerate = async (filter: ReportFilter) => {
    setIsGenerating(true);
    try {
      const newReport = await generateReport(filter);
      setReports((prev) => [newReport, ...prev]);
      showToast('success', 'Report Generated', `Compiled ${filter.type.toLowerCase().replace('_', ' ')} report covering ${filter.startDate} to ${filter.endDate}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error while generating report.';
      showToast('error', 'Report Generation Failed', message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (reportId: string, format: ReportFormat) => {
    try {
      const blob = await exportReport(reportId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('success', 'Export Ready', `Downloaded ${format} report bundle.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error during export.';
      showToast('error', 'Export Failed', message);
    }
  };

  const columns: Column<ReportSummary>[] = [
    {
      key: 'title',
      header: 'Report Title',
      render: (r) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-sans font-semibold text-slate-200 text-xs">{r.title}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (r) => <Badge variant="neutral" size="sm">{r.type.replace('_', ' ')}</Badge>,
    },
    {
      key: 'dateRange',
      header: 'Covered Range',
      render: (r) => (
        <span className="font-mono text-[11px] text-slate-400">
          {r.dateRange.start} to {r.dateRange.end}
        </span>
      ),
    },
    {
      key: 'totalTransactionsScanned',
      header: 'Transactions Evaluated',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-200">
          {r.totalTransactionsScanned.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'flaggedSuspiciousCount',
      header: 'Flagged High',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-rose-400">
          {r.flaggedSuspiciousCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Export',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport(r.id, 'CSV')}
            leftIcon={<Download className="w-3 h-3" />}
          >
            CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport(r.id, 'JSON')}
            leftIcon={<Download className="w-3 h-3" />}
          >
            JSON
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Analytics & Compliance Reports"
        description="Comprehensive compliance dossiers, audit trails, and aggregate loss prevention reporting"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReportsList}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync Archive
          </Button>
        }
      />

      {/* Generator Controls */}
      <ReportGenerator
        onGenerate={handleGenerate}
        onExport={(format) => {
          const latest = reports[0];
          if (latest) {
            handleExport(latest.id, format);
          } else {
            showToast('info', 'Nothing to Export', 'Generate a report first, then export it from the archive below.');
          }
        }}
        isGenerating={isGenerating}
      />

      {/* Historical Reports Table */}
      <DataTable<ReportSummary>
        columns={columns}
        data={reports}
        isLoading={isLoading}
        emptyIcon={BarChart3}
        emptyTitle="No reports available"
        emptyDescription="Generate a new compliance or executive report above to populate this historical repository."
        rowKey={(r) => r.id}
      />
    </div>
  );
};
