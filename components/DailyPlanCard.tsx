import Link from "next/link";
import type { DailyPlan } from "@/types";
import { getSubjectById } from "@/data/subjects";
import { getTopicById } from "@/data/topics";

const typeLabels: Record<DailyPlan["type"], string> = {
  learning: "Learning Day",
  revision: "Revision Day",
  mixed: "Mixed Practice",
  mock: "Mock Test",
};

export function DailyPlanCard({ plan, alreadyCompleted }: { plan: DailyPlan; alreadyCompleted: boolean }) {
  const totalQuestions = plan.subjects.reduce((sum, slot) => sum + slot.questionCount, 0);

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          {typeLabels[plan.type]}
        </span>
        <span className="text-sm font-medium opacity-90">{totalQuestions} questions</span>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold">{plan.title}</h2>
        <p className="mt-1 text-sm opacity-90">{plan.description}</p>
      </div>

      <ul className="flex flex-wrap gap-2">
        {plan.subjects.map((slot) => {
          const subject = getSubjectById(slot.subjectId);
          const topicNames = (slot.focusTopics ?? [])
            .map((id) => getTopicById(id)?.name)
            .filter(Boolean)
            .join(", ");
          return (
            <li
              key={slot.subjectId}
              className="rounded-xl bg-white/15 px-3 py-2 text-sm"
              title={topicNames}
            >
              {subject?.icon} {subject?.shortName} · {slot.questionCount}q
              {topicNames && <span className="block text-xs opacity-80">{topicNames}</span>}
            </li>
          );
        })}
      </ul>

      <Link
        href={`/practice?mode=daily&day=${plan.day}`}
        className="mt-2 flex min-h-[3.5rem] items-center justify-center rounded-xl bg-white px-5 py-4 text-center text-lg font-bold text-indigo-700 transition active:bg-indigo-100 sm:hover:bg-indigo-50"
      >
        {alreadyCompleted ? "Practice Again" : "Start Today's Practice"}
      </Link>
    </div>
  );
}
