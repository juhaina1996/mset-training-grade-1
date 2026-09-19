import { examConfig, toLocalISODate, totalPreparationDays } from "@/config/exam";
import { subjects } from "@/data/subjects";
import { getTopicsBySubject } from "@/data/topics";
import type { DailyPlan, DailyPlanType, Topic } from "@/types";

const DAILY_TOTAL_QUESTIONS = 50;
const FOCUS_TOPICS_PER_SUBJECT = 2;

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toLocalISODate(d);
}

const totalDays = totalPreparationDays();

function planTypeForDay(day: number): DailyPlanType {
  if (day === totalDays) return "mock";
  if (day % 12 === 0) return "mock";
  if (day % 6 === 0) return "revision";
  return "learning";
}

function titleForDay(day: number, type: DailyPlanType): string {
  if (day === 1) return "Day 1: Let's Get Started!";
  if (type === "mock") return `Day ${day}: Mock Test Challenge`;
  if (type === "revision") return `Day ${day}: Revision Round-up`;
  return `Day ${day}: Keep Building!`;
}

function descriptionForDay(type: DailyPlanType): string {
  if (type === "mock") return "A mixed test across all subjects to check your progress.";
  if (type === "revision") return "Revisit earlier topics to strengthen your memory.";
  return "A mix of easy, medium and hard questions on today's topics.";
}

function pickFocusTopics(subjectTopics: Topic[], day: number, subjectIndex: number): Topic[] {
  if (subjectTopics.length === 0) return [];
  const howMany = Math.min(FOCUS_TOPICS_PER_SUBJECT, subjectTopics.length);
  const start = (day - 1 + subjectIndex) % subjectTopics.length;
  return Array.from({ length: howMany }, (_, i) => subjectTopics[(start + i) % subjectTopics.length]);
}

function buildDailyPlan(day: number): DailyPlan {
  const date = addDays(examConfig.preparationStartDate, day - 1);
  const type = planTypeForDay(day);
  // Every day serves an even spread of easy, medium and hard rather than
  // working through one difficulty band at a time: the exam mixes them, so
  // practice should too, and an easy question between two hard ones keeps
  // the session from feeling like a wall.
  const difficulty: DailyPlan["difficulty"] = "mixed";

  const baseCount = Math.floor(DAILY_TOTAL_QUESTIONS / subjects.length);
  const remainder = DAILY_TOTAL_QUESTIONS - baseCount * subjects.length;

  const subjectSlots = subjects.map((subject, subjectIndex) => {
    const subjectTopics = getTopicsBySubject(subject.id);
    const focusTopics = pickFocusTopics(subjectTopics, day, subjectIndex);
    const questionCount = baseCount + (subjectIndex < remainder ? 1 : 0);
    return {
      subjectId: subject.id,
      questionCount,
      focusTopics: focusTopics.length ? focusTopics.map((t) => t.id) : undefined,
    };
  });

  return {
    day,
    date,
    title: titleForDay(day, type),
    description: descriptionForDay(type),
    subjects: subjectSlots,
    difficulty,
    type,
  };
}

export const dailyPlans: DailyPlan[] = Array.from({ length: totalDays }, (_, i) =>
  buildDailyPlan(i + 1)
);

export function getAllDailyPlans(): DailyPlan[] {
  return dailyPlans;
}

export function getDailyPlanByDay(day: number): DailyPlan | undefined {
  return dailyPlans.find((p) => p.day === day);
}

export function getDailyPlanByDate(dateISO: string): DailyPlan | undefined {
  return dailyPlans.find((p) => p.date === dateISO);
}
