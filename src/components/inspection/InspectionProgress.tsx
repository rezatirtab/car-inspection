export function InspectionProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-900 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-xs font-medium text-slate-500">
        {completed}/{total}
      </span>
    </div>
  );
}
