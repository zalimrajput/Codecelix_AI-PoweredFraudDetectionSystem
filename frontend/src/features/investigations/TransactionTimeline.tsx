import React from 'react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { TimelineEvent } from '../../types/investigation';
import { Clock, ArrowLeftRight, LogIn, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export interface TransactionTimelineProps {
  timeline?: TimelineEvent[];
  isLoading?: boolean;
}

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({
  timeline,
  isLoading = false,
}) => {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'TRANSACTION':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />;
      case 'LOGIN':
        return <LogIn className="w-3.5 h-3.5 text-blue-400" />;
      case 'RULE_TRIGGER':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'NOTE':
        return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      case 'STATUS_CHANGE':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <Card
      title="Chronological Telemetry Timeline"
      description="Sequenced audit trail of customer logins, transactions, and detection triggers"
    >
      {isLoading ? (
        <div className="space-y-4 p-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !timeline || timeline.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No timeline records available"
          description="Chronological event records will populate when linked to backend telemetry."
        />
      ) : (
        <div className="relative pl-6 border-l border-slate-800 space-y-6 my-2">
          {timeline.map((event) => (
            <div key={event.id} className="relative">
              {/* Event Marker */}
              <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                {getEventIcon(event.type)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">{event.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">{event.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
