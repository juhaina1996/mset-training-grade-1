"use client";

import { getAllSubjects } from "@/data/subjects";
import { getTopicsBySubject } from "@/data/topics";
import { useProgress } from "@/context/ProgressProvider";
import { SubjectCard } from "@/components/SubjectCard";

export default function SubjectsPage() {
  const { progress } = useProgress();
  const subjects = getAllSubjects();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Subjects</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {subjects.map((subject) => {
          const topics = getTopicsBySubject(subject.id);
          const practicedTopics = topics
            .map((topic) => progress.topicProgress[topic.id])
            .filter((topicProgress): topicProgress is NonNullable<typeof topicProgress> => Boolean(topicProgress));
          const averageAccuracy = practicedTopics.length
            ? Math.round(
                practicedTopics.reduce((sum, tp) => sum + tp.accuracy, 0) / practicedTopics.length
              )
            : undefined;

          return <SubjectCard key={subject.id} subject={subject} averageAccuracy={averageAccuracy} />;
        })}
      </div>
    </div>
  );
}
