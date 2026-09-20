import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { DetectedPattern } from '../../types/investigation';
import { Network, Zap } from 'lucide-react';

export interface DetectedPatternsListProps {
  patterns?: DetectedPattern[];
  isLoading?: boolean;
}

export const DetectedPatternsList: React.FC<DetectedPatternsListProps> = ({
  patterns,
  isLoading = false,
}) => {
  return (
    <Card
      title="Neural Anomaly & Fraud Patterns"
      description="Behavioral patterns classified through automated graph & vector models"
    >
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !patterns || patterns.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No Anomaly Patterns Detected"
          description="Autonomous pattern correlation found no abnormal behavioral signatures."
        />
      ) : (
        <div className="space-y-2.5">
          {patterns.map((pattern) => (
            <div
              key={pattern.id}
              className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{pattern.name}</span>
                    <Badge variant="purple" size="sm">
                      {pattern.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{pattern.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] self-end sm:self-auto">
                <span className="text-slate-500">Confidence:</span>
                <span className="font-bold text-indigo-400">
                  {(pattern.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
