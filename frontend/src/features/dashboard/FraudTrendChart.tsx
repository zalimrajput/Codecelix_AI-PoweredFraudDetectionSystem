import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FraudTrendDataPoint } from '../../types/dashboard';

export interface FraudTrendChartProps {
  data?: FraudTrendDataPoint[];
  isLoading?: boolean;
}

export const FraudTrendChart: React.FC<FraudTrendChartProps> = ({
  data,
  isLoading = false,
}) => {
  const hasData = data && data.length > 0;

  return (
    <Card
      title="30-Day Fraud & Volume Trends"
      description="Comparative telemetry tracking gross volume vs. suspicious and blocked velocity"
      className="h-full"
    >
      {isLoading ? (
        <div className="h-64 flex flex-col justify-end gap-3 p-4">
          <Skeleton className="h-48 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ) : !hasData ? (
        <div className="h-64 flex items-center justify-center">
          <EmptyState
            icon={Activity}
            title="No trend data available"
            description="Connect your data source to track multi-day volume and fraud velocity."
          />
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="totalVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="suspiciousGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-mono">
                        <p className="font-semibold text-slate-200 mb-1.5">{label}</p>
                        {payload.map((entry, idx) => (
                          <div key={`item-${idx}`} className="flex items-center justify-between gap-4 py-0.5">
                            <span className="text-slate-400 capitalize">{entry.name}:</span>
                            <span className="font-bold text-slate-100">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="totalVolume"
                name="Total Volume"
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#totalVolumeGradient)"
              />
              <Area
                type="monotone"
                dataKey="suspiciousVolume"
                name="Suspicious"
                stroke="#F43F5E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#suspiciousGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
