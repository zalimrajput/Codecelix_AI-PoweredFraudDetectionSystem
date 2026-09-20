import React from 'react';
import { Card } from '../../components/ui/Card';
import { RiskBadge } from '../../components/common/RiskBadge';
import { DecisionBadge } from '../../components/common/DecisionBadge';
import { RiskBreakdown } from '../../types/investigation';
import { Cpu, Scale, UserCheck } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

export interface RiskBreakdownCardProps {
  breakdown?: RiskBreakdown | null;
  isLoading?: boolean;
}

export const RiskBreakdownCard: React.FC<RiskBreakdownCardProps> = ({
  breakdown,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card title="Risk Scoring Decomposition" className="h-full">
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card title="Risk Scoring Decomposition" className="h-full">
        <div className="p-6 text-center text-xs text-slate-500">
          No scoring breakdown available for this case.
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Risk Scoring Decomposition"
      description="Multi-factor machine learning and rule-based heuristic weighting"
      className="h-full"
    >
      <div className="space-y-4 font-mono">
        {/* Main Composite Score */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
              Composite Risk Score
            </span>
            <div className="text-3xl font-bold text-slate-100 mt-1">
              {breakdown.finalRiskScore}
              <span className="text-xs text-slate-500 font-normal"> / 100</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <RiskBadge level={breakdown.riskLevel} />
            <DecisionBadge decision={breakdown.decision} />
          </div>
        </div>

        {/* Sub-Score Bars */}
        <div className="space-y-3 pt-2">
          {/* ML Anomaly Score */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                ML Anomaly Model
              </span>
              <span className="text-slate-200 font-bold">{breakdown.mlAnomalyScore} / 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(breakdown.mlAnomalyScore, 100)}%` }}
              />
            </div>
          </div>

          {/* Heuristic Rule Score */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Deterministic Rules
              </span>
              <span className="text-slate-200 font-bold">{breakdown.ruleScore} / 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(breakdown.ruleScore, 100)}%` }}
              />
            </div>
          </div>

          {/* Behavior Velocity Score */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                Behavior Velocity
              </span>
              <span className="text-slate-200 font-bold">{breakdown.behaviorScore} / 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(breakdown.behaviorScore, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
