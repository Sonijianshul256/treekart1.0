export function ProgressRing({ value, label, tone = 'green' }: { value: number; label: string; tone?: 'green' | 'yellow' | 'red' }) {
  const color = tone === 'green' ? '#2f6b45' : tone === 'yellow' ? '#e9a93a' : '#dc2626';
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid h-24 w-24 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${Math.min(100, Math.max(0, value))}%, #e5eadf 0)` }}
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-lg font-bold text-ink">{value}%</div>
      </div>
      <span className="text-sm font-medium text-grove-700">{label}</span>
    </div>
  );
}
