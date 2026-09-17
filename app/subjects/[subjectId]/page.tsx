"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectById } from "@/data/subjects";
import { getTopicsBySubject } from "@/data/topics";
import { useProgress } from "@/context/ProgressProvider";
import { getSubjectRunProgress } from "@/lib/subjectRun";
import { TopicCard } from "@/components/TopicCard";

export default function SubjectTopicsPage(props: PageProps<"/subjects/[subjectId]">) {
  const { subjectId } = use(props.params);
  const { progress, isReady } = useProgress();

  const subject = getSubjectById(subjectId);
  if (!subject) notFound();

  const topics = getTopicsBySubject(subjectId);
  const run = isReady ? getSubjectRunProgress(progress, subjectId) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{subject.icon}</span>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">{subject.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subject.description}</p>
        </div>
      </div>

      {run && (
        <Link
          href={`/practice?mode=full&subjectId=${subject.id}`}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-lg transition active:brightness-95 sm:hover:brightness-110"
        >
          <div>
            <p className="text-lg font-bold">
              {run.isComplete
                ? `You've answered every ${subject.shortName} question!`
                : run.hasStarted
                  ? `Keep going — ${run.totalQuestions - run.answered} questions left`
                  : `Attempt all ${run.totalQuestions} ${subject.shortName} questions`}
            </p>
            <p className="text-sm opacity-90">
              {run.hasStarted
                ? `${run.answered} of ${run.totalQuestions} attempted so far`
                : "Go through the whole subject at your own pace — your place is saved."}
            </p>
          </div>
          <span className="rounded-xl bg-white/15 px-4 py-2 text-base font-bold">
            {run.isComplete ? "Start again" : run.hasStarted ? "Continue →" : "Start →"}
          </span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} progress={progress.topicProgress[topic.id]} />
        ))}
      </div>
    </div>
  );
}
