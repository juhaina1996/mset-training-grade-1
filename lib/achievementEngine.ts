import type { StudentProgress } from "@/types";
import { achievements } from "@/data/achievements";

type Predicate = (progress: StudentProgress) => boolean;

const predicates: Record<string, Predicate> = {
  "first-steps": (p) => p.completedDailySessions.length >= 1,
  "three-day-streak": (p) => p.streak >= 3,
  "seven-day-streak": (p) => p.streak >= 7,
  "perfect-score": (p) => p.testSessions.some((s) => s.percentage === 100),
  "fifty-questions": (p) => p.questionAttempts.length >= 50,
  "hundred-questions": (p) => p.questionAttempts.length >= 100,
  "topic-master": (p) => Object.values(p.topicProgress).some((t) => t.accuracy >= 90 && t.questionsAttempted >= 10),
  "comeback-kid": (p) =>
    Object.values(p.topicProgress).some((t) => t.totalRetests >= 1 && t.accuracy >= 70),
};

export function getNewlyUnlockedAchievements(progress: StudentProgress): string[] {
  return achievements
    .map((a) => a.id)
    .filter((id) => !progress.achievements.includes(id))
    .filter((id) => predicates[id]?.(progress));
}
