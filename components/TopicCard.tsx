import Link from "next/link";
import type { Topic, TopicProgress } from "@/types";
import { ProgressBar } from "@/components/ProgressBar";

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export function TopicCard({ topic, progress }: { topic: Topic; progress?: TopicProgress }) {
  const accuracy = progress?.accuracy ?? 0;
  const attempted = progress?.questionsAttempted ?? 0;
  const difficulty = progress?.currentDifficulty ?? topic.difficultyRange[0];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">{topic.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{topic.description}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold capitalize ${difficultyColors[difficulty]}`}>
          {difficulty}
        </span>
      </div>

      {attempted > 0 ? (
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{attempted} attempted</span>
            <span>{accuracy}% correct</span>
          </div>
          <ProgressBar percentage={accuracy} colorClassName={accuracy >= 85 ? "bg-emerald-500" : accuracy >= 60 ? "bg-amber-500" : "bg-rose-500"} />
        </div>
      ) : (
        <p className="text-xs italic text-slate-400">Not practiced yet</p>
      )}

      <div className="mt-1 flex gap-3">
        <Link
          href={`/practice?mode=daily&topicId=${topic.id}&subjectId=${topic.subjectId}&count=10`}
          className="flex min-h-[3rem] flex-1 items-center justify-center rounded-xl bg-indigo-600 px-3 py-3 text-center text-base font-semibold text-white transition active:bg-indigo-800 sm:hover:bg-indigo-700"
        >
          Practice
        </Link>
        {attempted > 0 && (
          <Link
            href={`/practice?mode=retest&topicId=${topic.id}&subjectId=${topic.subjectId}&count=10`}
            className="flex min-h-[3rem] flex-1 items-center justify-center rounded-xl border-2 border-indigo-200 px-3 py-3 text-center text-base font-semibold text-indigo-700 transition active:bg-indigo-100 sm:hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:sm:hover:bg-indigo-900/30"
          >
            Retest
          </Link>
        )}
      </div>
    </div>
  );
}
