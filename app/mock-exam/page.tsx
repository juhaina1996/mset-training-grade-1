"use client";

import Link from "next/link";
import { mockExamConfig } from "@/config/exam";
import { getSubjectById } from "@/data/subjects";
import { useProgress } from "@/context/ProgressProvider";

export default function MockExamPage() {
  const { progress, isReady } = useProgress();

  const subjects = mockExamConfig.subjectIds
    .map((id) => getSubjectById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const perSubjectCount = Math.floor(mockExamConfig.totalQuestions / mockExamConfig.subjectIds.length);
  const pastMocks = isReady
    ? progress.testSessions.filter((s) => s.mode === "mock" && s.completedAt).slice(-3).reverse()
    : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Mock Exam</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A timed practice test that mirrors the real exam, across all official syllabus subjects.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-2">
          <div>
            <p className="text-3xl font-black">{mockExamConfig.totalQuestions}</p>
            <p className="text-sm opacity-90">Questions</p>
          </div>
          <div>
            <p className="text-3xl font-black">{mockExamConfig.timeLimitMinutes}</p>
            <p className="text-sm opacity-90">Minutes</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-90">Subjects covered</p>
          <ul className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <li key={subject.id} className="rounded-xl bg-white/15 px-3 py-2 text-sm">
                {subject.icon} {subject.name} · ~{perSubjectCount}q
              </li>
            ))}
          </ul>
        </div>

        <ul className="list-disc pl-5 text-sm opacity-90">
          <li>The timer starts as soon as you begin and cannot be paused.</li>
          <li>When time runs out, the exam finishes automatically with whatever you&apos;ve answered.</li>
          <li>You&apos;ll get a full results page with a per-subject score breakdown afterwards.</li>
        </ul>

        <Link
          href="/practice?mode=mock"
          className="mt-2 flex min-h-[3.5rem] items-center justify-center rounded-xl bg-white px-5 py-4 text-center text-lg font-bold text-indigo-700 transition active:bg-indigo-100 sm:hover:bg-indigo-50"
        >
          Start Mock Exam
        </Link>
      </div>

      {pastMocks.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Your recent mock exams</h2>
          <div className="flex flex-col gap-2">
            {pastMocks.map((session) => (
              <Link
                key={session.id}
                href={`/results/${session.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition active:bg-slate-100 sm:hover:border-indigo-300 sm:hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <span>{new Date(session.startedAt).toLocaleDateString()}</span>
                <span>{session.percentage ?? 0}%</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
