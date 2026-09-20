import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ReportFilter, ReportType, ReportFormat } from '../../types/report';
import { FileText, Download, Play, AlertCircle } from 'lucide-react';

export interface ReportGeneratorProps {
  onGenerate: (filter: ReportFilter) => void;
  onExport: (format: ReportFormat) => void;
  isGenerating?: boolean;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  onGenerate,
  onExport,
  isGenerating = false,
}) => {
  const [filter, setFilter] = useState<ReportFilter>({
    type: 'DAILY',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    riskThreshold: 75,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(filter);
  };

  return (
    <Card
      title="Generate Intelligence Reports"
      description="Select report parameters, time horizons, and export formats"
      className="mb-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Select
            label="Report Classification"
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value as ReportType })}
            options={[
              { value: 'DAILY', label: 'Daily Fraud Summary' },
              { value: 'MONTHLY', label: 'Monthly Executive Audit' },
              { value: 'HIGH_RISK', label: 'High-Risk Incident Dossier' },
              { value: 'GEOGRAPHIC', label: 'Geographic Risk Distribution' },
              { value: 'RULE_PERFORMANCE', label: 'Rule Precision & Recall' },
            ]}
          />

          <Input
            label="Start Date"
            type="date"
            value={filter.startDate}
            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
            required
          />

          <Input
            label="End Date"
            type="date"
            value={filter.endDate}
            onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
            required
          />

          <Input
            label="Risk Score Threshold (>=)"
            type="number"
            min="0"
            max="100"
            value={String(filter.riskThreshold || 75)}
            onChange={(e) => setFilter({ ...filter, riskThreshold: Number(e.target.value) })}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isGenerating}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Generate Report
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onExport('CSV')}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onExport('JSON')}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export JSON
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
