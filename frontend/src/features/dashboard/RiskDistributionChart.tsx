import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, PieChart as PieIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RiskDistributionItem } from '../../types/dashboard';

export interface RiskDistributionChartProps {
  data?: RiskDistributionItem[];
  isLoading?: boolean;
}

const DEFAULT_COLORS = {
  Low: '#10B981',    // Emerald
  Medium: '#F59E0B', // Amber
  High: '#F43F5E',   // Crimson
};

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  data,
  isLoading = false,
}) => {
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0);

  return (
    <Card
      title="Risk Tier Distribution"
      description="Aggregated transaction risk segmentation across neural fraud classifiers"
      className="h-full"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Skeleton variant="circular" className="w-36 h-36" />
          <div className="flex gap-4">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
        </div>
      ) : !hasData ? (
        <div className="h-64 flex items-center justify-center">
          <EmptyState
            icon={PieIcon}
            title="No risk distribution telemetry"
            description="Connect your data source to view fraud classification metrics."
          />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                          <p className="font-semibold text-slate-200">{item.name}</p>
                          <p className="text-slate-400 mt-1">
                            Volume: <span className="text-indigo-400 font-bold">{item.value}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data?.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.color || DEFAULT_COLORS[entry.name] || '#64748B'}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-slate-800 text-center font-mono">
            {data?.map((item) => (
              <div key={item.name} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color || DEFAULT_COLORS[item.name] }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-200 mt-0.5">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
