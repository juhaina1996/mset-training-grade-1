"use client";

import { use } from "react";
import Link from "next/link";
import { useProgress } from "@/context/ProgressProvider";
import { ScoreSummary } from "@/components/ScoreSummary";
import { MockExamBreakdown } from "@/components/MockExamBreakdown";
import { getRecommendedRetests } from "@/lib/recommendations";
import { getTopicById } from "@/data/topics";
import { getSubjectById } from "@/data/subjects";

export default function ResultsPage(props: PageProps<"/results/[sessionId]">) {
  const { sessionId } = use(props.params);
  const { progress, isReady } = useProgress();

  if (!isReady) {
    return <p className="text-center text-slate-500">Loading results…</p>;
  }

  const session = progress.testSessions.find((s) => s.id === sessionId);

  if (!session) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
        <p className="font-semibold">We couldn&apos;t find that practice session.</p>
        <Link href="/subjects" className="mt-3 inline-block text-indigo-600 hover:underline dark:text-indigo-400">
          Back to subjects
        </Link>
      </div>
    );
  }

  const topic = session.topicId ? getTopicById(session.topicId) : undefined;
  const recommendedRetests = getRecommendedRetests(progress, 3);
  const isMockExam = session.mode === "mock";
  const fullRunSubject =
    session.mode === "full" && session.subjectId ? getSubjectById(session.subjectId) : undefined;
  const sessionAttempts = isMockExam
    ? progress.questionAttempts.filter((a) => a.sessionId === session.id)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
        {isMockExam
          ? "Mock Exam Results"
          : fullRunSubject
            ? `All ${fullRunSubject.name} Questions — Complete!`
            : topic
              ? `${topic.name} Results`
              : "Practice Results"}
      </h1>

      <ScoreSummary session={session} />

      {isMockExam && <MockExamBreakdown attempts={sessionAttempts} />}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="flex min-h-[3.25rem] items-center rounded-xl bg-indigo-600 px-6 py-3 text-lg font-bold text-white transition active:bg-indigo-800 sm:hover:bg-indigo-700"
        >
          Back to Home
        </Link>
        {session.topicId && session.subjectId && (
          <Link
            href={`/practice?mode=retest&topicId=${session.topicId}&subjectId=${session.subjectId}&count=${session.totalQuestions}`}
            className="flex min-h-[3.25rem] items-center rounded-xl border-2 border-indigo-200 px-6 py-3 text-lg font-bold text-indigo-700 transition active:bg-indigo-100 sm:hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:sm:hover:bg-indigo-900/30"
          >
            Retest This Topic
          </Link>
        )}
        {fullRunSubject && (
          <Link
            href="/all-questions"
            className="flex min-h-[3.25rem] items-center rounded-xl border-2 border-indigo-200 px-6 py-3 text-lg font-bold text-indigo-700 transition active:bg-indigo-100 sm:hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:sm:hover:bg-indigo-900/30"
          >
            Back to All Questions
          </Link>
        )}
        {isMockExam && (
          <Link
            href="/practice?mode=mock"
            className="flex min-h-[3.25rem] items-center rounded-xl border-2 border-indigo-200 px-6 py-3 text-lg font-bold text-indigo-700 transition active:bg-indigo-100 sm:hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:sm:hover:bg-indigo-900/30"
          >
            Take Another Mock Exam
          </Link>
        )}
      </div>

      {recommendedRetests.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            Suggested topics to strengthen
          </h2>
          <div className="flex flex-wrap gap-2">
            {recommendedRetests.map((t) => (
              <Link
                key={t.id}
                href={`/practice?mode=retest&topicId=${t.id}&subjectId=${t.subjectId}&count=10`}
                className="flex min-h-[2.75rem] items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-base font-semibold text-slate-700 shadow-sm transition active:bg-slate-100 sm:hover:border-indigo-300 sm:hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
