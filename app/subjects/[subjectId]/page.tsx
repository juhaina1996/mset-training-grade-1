"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { getSubjectById } from "@/data/subjects";
import { getTopicsBySubject } from "@/data/topics";
import { useProgress } from "@/context/ProgressProvider";
import { TopicCard } from "@/components/TopicCard";

export default function SubjectTopicsPage(props: PageProps<"/subjects/[subjectId]">) {
  const { subjectId } = use(props.params);
  const { progress } = useProgress();

  const subject = getSubjectById(subjectId);
  if (!subject) notFound();

  const topics = getTopicsBySubject(subjectId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{subject.icon}</span>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">{subject.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subject.description}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} progress={progress.topicProgress[topic.id]} />
        ))}
      </div>
    </div>
  );
}
