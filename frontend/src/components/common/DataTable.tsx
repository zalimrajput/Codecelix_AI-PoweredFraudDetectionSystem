import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  rowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data = [],
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'No records have been returned from the telemetry source.',
  emptyIcon = Inbox,
  emptyActionLabel,
  onEmptyAction,
  rowKey,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <TableSkeleton rows={5} columns={columns.length} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={`w-full overflow-x-auto border border-slate-800 rounded-xl bg-slate-900 ${className}`}>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/60">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                className={`py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-[11px] select-none ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
          {data.map((item, index) => (
            <tr
              key={rowKey(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-slate-800/50' : 'hover:bg-slate-850'
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`py-3 px-4 whitespace-nowrap ${col.className || ''}`}>
                  {col.render ? col.render(item, index) : ((item as unknown as Record<string, unknown>)[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
