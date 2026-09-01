import Link from "next/link";
import type { MissedDay } from "@/lib/missedDays";

const VISIBLE_LIMIT = 6;

export function MissedDaysCard({ missedDays }: { missedDays: MissedDay[] }) {
  if (missedDays.length === 0) return null;

  const visible = missedDays.slice(0, VISIBLE_LIMIT);
  const hiddenCount = missedDays.length - visible.length;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
      <div>
        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
          Missed practice days ({missedDays.length})
        </h2>
        <p className="text-sm text-amber-800/80 dark:text-amber-300/80">
          Catch up on days you didn&apos;t finish.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {visible.map((d) => (
          <Link
            key={d.day}
            href={`/practice?mode=daily&day=${d.day}`}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm transition active:bg-amber-100 sm:hover:border sm:hover:border-amber-300 dark:bg-slate-800 dark:text-amber-200"
          >
            <span>
              Day {d.day}: {d.title.replace(/^Day \d+:\s*/, "")}
            </span>
            <span className="text-xs font-medium opacity-80">
              {d.questionsAnswered > 0 ? `${d.questionsAnswered}/${d.totalQuestions} done` : "Not started"}
            </span>
          </Link>
        ))}
      </div>
      {hiddenCount > 0 && (
        <p className="text-xs font-medium text-amber-800/80 dark:text-amber-300/80">
          +{hiddenCount} more missed {hiddenCount === 1 ? "day" : "days"}
        </p>
      )}
    </section>
  );
}
