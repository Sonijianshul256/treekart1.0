import { ReactNode } from 'react';

export function MetricCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded border border-grove-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-grove-700">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
