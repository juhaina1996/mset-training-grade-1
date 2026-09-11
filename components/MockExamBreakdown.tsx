import { getQuestionById } from "@/lib/repositories/questionRepository";
import { getSubjectById } from "@/data/subjects";
import type { QuestionAttempt } from "@/types";

export function MockExamBreakdown({ attempts }: { attempts: QuestionAttempt[] }) {
  const bySubject = new Map<string, { correct: number; total: number }>();
  for (const attempt of attempts) {
    const entry = bySubject.get(attempt.subjectId) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (attempt.isCorrect) entry.correct += 1;
    bySubject.set(attempt.subjectId, entry);
  }

  const wrongAttempts = attempts.filter((a) => !a.isCorrect);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Subject breakdown</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from(bySubject.entries()).map(([subjectId, stat]) => {
            const subject = getSubjectById(subjectId);
            const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            return (
              <div
                key={subjectId}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {subject?.icon} {subject?.name ?? subjectId}
                </p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{accuracy}%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stat.correct} / {stat.total} correct
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {wrongAttempts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            Review your mistakes ({wrongAttempts.length})
          </h2>
          <div className="flex flex-col gap-3">
            {wrongAttempts.map((attempt) => {
              const question = getQuestionById(attempt.questionId);
              if (!question) return null;
              const selectedOption = question.options.find((o) => o.id === attempt.selectedOptionId);
              const correctOption = question.options.find((o) => o.id === question.correctOptionId);
              return (
                <div
                  key={attempt.id}
                  className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{question.question}</p>
                  <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
                    Your answer: {selectedOption?.text ?? "No answer"}
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Correct answer: {correctOption?.text}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{question.explanation}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
