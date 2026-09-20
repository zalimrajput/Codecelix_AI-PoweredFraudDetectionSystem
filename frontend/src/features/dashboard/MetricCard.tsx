import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

export interface MetricCardProps {
  title: string;
  value?: number | string | null;
  changePercent?: number;
  changeLabel?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  formatAs?: 'number' | 'currency' | 'percent' | 'score';
  statusColor?: 'neutral' | 'emerald' | 'amber' | 'crimson';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  changePercent,
  changeLabel = 'vs last 30 days',
  icon: Icon,
  isLoading = false,
  formatAs = 'number',
  statusColor = 'neutral',
}) => {
  const formatValue = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined) return 'No data available';
    if (typeof val === 'string') return val;
    switch (formatAs) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      case 'score':
        return `${val.toFixed(0)} / 100`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const colorStyles = {
    neutral: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    crimson: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-card relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${colorStyles[statusColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <Skeleton className="h-8 w-28 mb-2" />
        ) : (
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-100">
            {value !== undefined && value !== null ? (
              formatValue(value)
            ) : (
              <span className="text-xs font-sans text-slate-500 font-normal">
                No data available
              </span>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center gap-1.5 text-[11px]">
          {isLoading ? (
            <Skeleton className="h-3.5 w-36" />
          ) : changePercent !== undefined ? (
            <>
              {changePercent > 0 ? (
                <span className="text-rose-400 flex items-center font-mono font-medium">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +{changePercent}%
                </span>
              ) : changePercent < 0 ? (
                <span className="text-emerald-400 flex items-center font-mono font-medium">
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                  {changePercent}%
                </span>
              ) : (
                <span className="text-slate-400 flex items-center font-mono font-medium">
                  <Minus className="w-3 h-3 mr-0.5" />
                  0%
                </span>
              )}
              <span className="text-slate-500">{changeLabel}</span>
            </>
          ) : (
            <span className="text-slate-500">Telemetry awaiting sync</span>
          )}
        </div>
      </div>
    </div>
  );
};
