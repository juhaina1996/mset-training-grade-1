import type { TestSession } from "@/types";
import { ProgressBar } from "@/components/ProgressBar";

export function ScoreSummary({ session }: { session: TestSession }) {
  const percentage = session.percentage ?? 0;
  const message =
    percentage >= 90
      ? "Outstanding work! 🌟"
      : percentage >= 70
        ? "Great job! Keep it up! 🎉"
        : percentage >= 50
          ? "Good effort — a little more practice will help! 💪"
          : "That's okay — let's review and try again! 📚";

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <span className="text-6xl font-black text-indigo-600 dark:text-indigo-400">{percentage}%</span>
      <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{message}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {session.correctAnswers ?? 0} out of {session.totalQuestions} correct
      </p>
      <div className="w-full max-w-xs">
        <ProgressBar percentage={percentage} colorClassName={percentage >= 85 ? "bg-emerald-500" : percentage >= 60 ? "bg-amber-500" : "bg-rose-500"} />
      </div>
    </div>
  );
}
