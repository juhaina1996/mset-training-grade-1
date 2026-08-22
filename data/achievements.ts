import type { Achievement } from "@/types";

export const achievements: Achievement[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your very first practice session",
    icon: "🎉",
    criteria: "completedDailySessions.length >= 1",
  },
  {
    id: "three-day-streak",
    name: "On a Roll",
    description: "Practice for 3 days in a row",
    icon: "🔥",
    criteria: "streak >= 3",
  },
  {
    id: "seven-day-streak",
    name: "Week Warrior",
    description: "Practice for 7 days in a row",
    icon: "🏆",
    criteria: "streak >= 7",
  },
  {
    id: "perfect-score",
    name: "Perfect Score",
    description: "Score 100% on a practice session",
    icon: "⭐",
    criteria: "testSessions.some(s => s.percentage === 100)",
  },
  {
    id: "fifty-questions",
    name: "Question Explorer",
    description: "Answer 50 questions in total",
    icon: "🧭",
    criteria: "questionAttempts.length >= 50",
  },
  {
    id: "hundred-questions",
    name: "Century Club",
    description: "Answer 100 questions in total",
    icon: "💯",
    criteria: "questionAttempts.length >= 100",
  },
  {
    id: "topic-master",
    name: "Topic Master",
    description: "Reach 90% accuracy in any topic",
    icon: "🎯",
    criteria: "Object.values(topicProgress).some(t => t.accuracy >= 90)",
  },
  {
    id: "comeback-kid",
    name: "Comeback Kid",
    description: "Improve a topic's accuracy after a retest",
    icon: "💪",
    criteria: "Object.values(topicProgress).some(t => t.totalRetests >= 1 && t.accuracy >= 70)",
  },
];

export function getAllAchievements(): Achievement[] {
  return achievements;
}

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}
