"use client";

import Link from "next/link";
import { getAllSubjects } from "@/data/subjects";
import { useProgress } from "@/context/ProgressProvider";
import { getSubjectRunProgress } from "@/lib/subjectRun";
import { ProgressBar } from "@/components/ProgressBar";

export default function AllQuestionsPage() {
  const { progress, isReady } = useProgress();
  const subjects = getAllSubjects();

  if (!isReady) {
    return <p className="text-center text-slate-500">Loading your progress…</p>;
  }

  const runs = subjects.map((subject) => ({
    subject,
    run: getSubjectRunProgress(progress, subject.id),
  }));
  const grandTotal = runs.reduce((sum, { run }) => sum + run.totalQuestions, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">All Questions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Work through every question in a subject, one subject at a time. There are {grandTotal}{" "}
          questions in all — stop whenever you like and you&apos;ll come back to exactly where you left off.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {runs.map(({ subject, run }) => {
          const percentage = run.totalQuestions
            ? Math.round((run.answered / run.totalQuestions) * 100)
            : 0;
          const accuracy = run.answered ? Math.round((run.correct / run.answered) * 100) : 0;
          const inProgress = run.hasStarted && !run.isComplete;

          const label = run.isComplete ? "Start again" : inProgress ? "Continue" : "Start";
          const remaining = run.totalQuestions - run.answered;

          return (
            <div
              key={subject.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start gap-3">
                <span className="text-4xl">{subject.icon}</span>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{subject.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {run.totalQuestions} questions in total
                  </p>
                </div>
                {run.isComplete && (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    ✓ All done
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>
                    {run.answered} of {run.totalQuestions} attempted
                  </span>
                  <span>{run.answered > 0 ? `${accuracy}% correct` : "Not started yet"}</span>
                </div>
                <ProgressBar percentage={percentage} />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/practice?mode=full&subjectId=${subject.id}`}
                  className="flex min-h-[3rem] flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-center text-base font-bold text-white transition active:bg-indigo-800 sm:hover:bg-indigo-700"
                >
                  {label}
                  {inProgress ? ` — ${remaining} left` : ""}
                </Link>
                {run.sessionId && run.isComplete && (
                  <Link
                    href={`/results/${run.sessionId}`}
                    className="flex min-h-[3rem] items-center justify-center rounded-xl border-2 border-indigo-200 px-4 py-3 text-center text-base font-semibold text-indigo-700 transition active:bg-indigo-100 sm:hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:sm:hover:bg-indigo-900/30"
                  >
                    See results
                  </Link>
                )}
                <Link
                  href={`/subjects/${subject.id}`}
                  className="flex min-h-[3rem] items-center justify-center rounded-xl border-2 border-slate-200 px-4 py-3 text-center text-base font-semibold text-slate-600 transition active:bg-slate-100 sm:hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:sm:hover:bg-slate-700/50"
                >
                  By topic
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
