export function ProgressBar({
  percentage,
  colorClassName = "bg-emerald-500",
}: {
  percentage: number;
  colorClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <div
        className={`h-full rounded-full transition-all ${colorClassName}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
