import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { TriggeredRule } from '../../types/investigation';
import { SlidersHorizontal, AlertCircle } from 'lucide-react';

export interface TriggeredRulesListProps {
  rules?: TriggeredRule[];
  isLoading?: boolean;
}

export const TriggeredRulesList: React.FC<TriggeredRulesListProps> = ({
  rules,
  isLoading = false,
}) => {
  return (
    <Card
      title="Triggered Deterministic Rules"
      description="Heuristic conditions matched against transaction and session payload"
    >
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !rules || rules.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No Rules Triggered"
          description="None of the active fraud rules were breached for this case."
        />
      ) : (
        <div className="space-y-2.5">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{rule.name}</span>
                    <Badge variant={rule.severity === 'HIGH' ? 'high' : 'medium'} size="sm">
                      {rule.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{rule.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] self-end sm:self-auto">
                <span className="text-slate-500">Score Impact:</span>
                <span className="font-bold text-rose-400">+{rule.scoreImpact}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
