"use client";

import type { Question } from "@/types";

export function QuestionCard({
  question,
  selectedOptionId,
  revealed,
  onSelect,
}: {
  question: Question;
  selectedOptionId?: string;
  revealed: boolean;
  onSelect: (optionId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-semibold capitalize text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          {question.difficulty}
        </span>
        {question.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl dark:text-slate-50">
        {question.question}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {question.options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isCorrectOption = option.id === question.correctOptionId;

          let style =
            "border-slate-200 bg-white active:border-indigo-300 active:bg-indigo-50 sm:hover:border-indigo-300 sm:hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-900 sm:dark:hover:bg-slate-700";
          if (revealed) {
            if (isCorrectOption) {
              style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30";
            } else if (isSelected && !isCorrectOption) {
              style = "border-rose-500 bg-rose-50 dark:bg-rose-900/30";
            } else {
              style = "border-slate-200 bg-white opacity-60 dark:border-slate-600 dark:bg-slate-900";
            }
          } else if (isSelected) {
            style = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30";
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={revealed}
              onClick={() => onSelect(option.id)}
              className={`flex min-h-[4.5rem] items-center rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold text-slate-800 transition disabled:cursor-default sm:text-xl dark:text-slate-100 ${style}`}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="rounded-2xl bg-slate-50 p-5 text-base text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <span className="font-semibold">Explanation: </span>
          {question.explanation}
        </div>
      )}
    </div>
  );
}
