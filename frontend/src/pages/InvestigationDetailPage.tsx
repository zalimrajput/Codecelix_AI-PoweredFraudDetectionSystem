import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { RiskBreakdownCard } from '../features/investigations/RiskBreakdownCard';
import { AiExplanationPanel } from '../features/investigations/AiExplanationPanel';
import { CustomerRiskProfile } from '../features/investigations/CustomerRiskProfile';
import { TriggeredRulesList } from '../features/investigations/TriggeredRulesList';
import { DetectedPatternsList } from '../features/investigations/DetectedPatternsList';
import { TransactionTimeline } from '../features/investigations/TransactionTimeline';
import { RelatedAlertsList } from '../features/investigations/RelatedAlertsList';
import { AnalystNotesCard } from '../features/investigations/AnalystNotesCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getInvestigationById } from '../api/investigations';
import { reviewAlert } from '../api/alerts';
import { InvestigationDetail } from '../types/investigation';
import { ShieldAlert, ArrowLeft, RefreshCw, Share2, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const InvestigationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [detail, setDetail] = useState<InvestigationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvestigation = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getInvestigationById(id);
      setDetail(data);
    } catch {
      // Backend pending integration: data remains null, UI renders clean ready states
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigation();
  }, [id]);

  const handleReviewAlert = async (alertId: string, action: 'ACKNOWLEDGED' | 'DISMISSED') => {
    try {
      await reviewAlert(alertId, action);
      showToast('info', 'Alert Updated', `Alert ${action.toLowerCase()} successfully.`);
    } catch {
      showToast('info', 'Integration Notice', `Endpoint POST /api/alerts/${alertId}/review is pending backend integration.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Case Header */}
      <PageHeader
        title={`Investigation Case ${id || ''}`}
        description="Holistic multi-dimensional risk dossier incorporating AI diagnostics, neural anomaly models, and rule traces"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Investigations', href: '/investigations' },
          { label: id || 'Case Detail' },
        ]}
        badge={
          detail?.status ? (
            <Badge variant={detail.status === 'OPEN' ? 'high' : 'medium'}>
              {detail.status.replace('_', ' ')}
            </Badge>
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/investigations')}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Queue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/network?case=${id}`)}
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
            >
              View in Fraud Network
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchInvestigation}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Case
            </Button>
          </div>
        }
      />

      {/* Case Metadata Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-card flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Customer ID</span>
            <span className="text-slate-200 font-bold mt-0.5 block">
              {detail?.customerId || 'Awaiting Sync'}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-6">
            <span className="text-slate-500 uppercase text-[10px] block">Assigned Analyst</span>
            <span className="text-slate-200 mt-0.5 block font-sans">
              {detail?.assignedAnalyst || 'Unassigned'}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-6 hidden sm:block">
            <span className="text-slate-500 uppercase text-[10px] block">Created Date</span>
            <span className="text-slate-200 mt-0.5 block">
              {detail?.createdDate || 'Pending'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Target Endpoint:</span>
          <code className="text-[11px] px-2 py-0.5 bg-slate-950 rounded text-indigo-400 border border-slate-800">
            GET /api/investigations/{id}
          </code>
        </div>
      </div>

      {/* Primary Intelligence Grid: Risk Breakdown & Gemini AI Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskBreakdownCard
          breakdown={detail?.riskBreakdown}
          isLoading={isLoading}
        />
        <AiExplanationPanel
          explanation={detail?.aiExplanation}
          isLoading={isLoading}
        />
      </div>

      {/* Customer Profile & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerRiskProfile
          profile={detail?.customerProfile}
          isLoading={isLoading}
        />
        <TransactionTimeline
          timeline={detail?.timeline}
          isLoading={isLoading}
        />
      </div>

      {/* Triggered Rules & Detected Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TriggeredRulesList
          rules={detail?.triggeredRules}
          isLoading={isLoading}
        />
        <DetectedPatternsList
          patterns={detail?.detectedPatterns}
          isLoading={isLoading}
        />
      </div>

      {/* Related Alerts */}
      <RelatedAlertsList
        alerts={detail?.relatedAlerts}
        isLoading={isLoading}
        onReviewAlert={handleReviewAlert}
      />

      {/* Analyst Disposition & Notes */}
      <AnalystNotesCard
        investigationId={id || 'CASE-000'}
        initialNotes={detail?.analystNotes}
        initialConclusion={detail?.conclusion}
        onUpdateSuccess={fetchInvestigation}
      />
    </div>
  );
};
