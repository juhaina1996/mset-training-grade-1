import { getDailyPlanByDay } from "@/data/dailyPlans";
import { getWeakTopics } from "@/lib/recommendations";
import type { DailyPlan, StudentProgress } from "@/types";

/**
 * Personalises the base DailyPlan with a small revision slot for the
 * student's weakest topic, if that topic isn't already covered today.
 */
export function generateDailyPracticePlan(
  day: number,
  studentProgress: StudentProgress
): DailyPlan | undefined {
  const basePlan = getDailyPlanByDay(day);
  if (!basePlan) return undefined;

  const weakTopics = getWeakTopics(studentProgress);
  if (weakTopics.length === 0) return basePlan;

  const coveredTopicIds = new Set(basePlan.subjects.flatMap((slot) => slot.focusTopics ?? []));
  const topicNeedingRevision = weakTopics.find((topic) => !coveredTopicIds.has(topic.id));
  if (!topicNeedingRevision) return basePlan;

  let matchedExistingSlot = false;
  const subjects = basePlan.subjects.map((slot) => {
    if (slot.subjectId !== topicNeedingRevision.subjectId) return slot;
    matchedExistingSlot = true;
    return {
      ...slot,
      questionCount: slot.questionCount + 2,
      focusTopics: [...(slot.focusTopics ?? []), topicNeedingRevision.id],
    };
  });

  const finalSubjects = matchedExistingSlot
    ? subjects
    : [
        ...subjects,
        {
          subjectId: topicNeedingRevision.subjectId,
          questionCount: 3,
          focusTopics: [topicNeedingRevision.id],
        },
      ];

  return {
    ...basePlan,
    description: `${basePlan.description} We've added a quick revision of ${topicNeedingRevision.name} since it needs a bit more practice.`,
    subjects: finalSubjects,
    type: basePlan.type === "learning" ? "mixed" : basePlan.type,
  };
}
