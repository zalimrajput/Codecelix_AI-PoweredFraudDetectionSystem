import React from 'react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RelatedAlert } from '../../types/investigation';
import { Bell, AlertTriangle, Check, X } from 'lucide-react';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Button } from '../../components/ui/Button';

export interface RelatedAlertsListProps {
  alerts?: RelatedAlert[];
  isLoading?: boolean;
  onReviewAlert?: (id: string, action: 'ACKNOWLEDGED' | 'DISMISSED') => void;
}

export const RelatedAlertsList: React.FC<RelatedAlertsListProps> = ({
  alerts,
  isLoading = false,
  onReviewAlert,
}) => {
  return (
    <Card
      title="Correlated System Alerts"
      description="Related telemetry warnings attached to this investigation case"
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Correlated Alerts"
          description="There are no active unreviewed alerts tied to this identity or transaction cluster."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{alert.type}</span>
                    <RiskBadge level={alert.severity} size="sm" />
                    <span className="text-[10px] font-mono text-slate-500">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                </div>
              </div>

              {onReviewAlert && alert.status === 'UNREVIEWED' && (
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReviewAlert(alert.id, 'ACKNOWLEDGED')}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Acknowledge
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReviewAlert(alert.id, 'DISMISSED')}
                    leftIcon={<X className="w-3.5 h-3.5" />}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
