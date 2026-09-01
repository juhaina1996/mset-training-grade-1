import type { StudentProgress } from "@/types";
import { generateDailyPracticePlan } from "@/lib/dailyPlanGenerator";

export type MissedDay = {
  day: number;
  title: string;
  totalQuestions: number;
  questionsAnswered: number;
};

/**
 * Days before today whose daily plan was never marked complete, most
 * recently missed first. Includes in-progress days (started but not
 * finished) so students can pick back up instead of losing that progress.
 */
export function getMissedDays(studentProgress: StudentProgress, currentDay: number): MissedDay[] {
  const missed: MissedDay[] = [];

  for (let day = 1; day < currentDay; day++) {
    if (studentProgress.completedDailySessions.includes(`day-${day}`)) continue;

    const plan = generateDailyPracticePlan(day, studentProgress);
    if (!plan) continue;

    const totalQuestions = plan.subjects.reduce((sum, slot) => sum + slot.questionCount, 0);
    const session = studentProgress.testSessions.find((s) => s.id === `session-daily-day-${day}`);
    const questionsAnswered = session
      ? studentProgress.questionAttempts.filter((a) => a.sessionId === session.id).length
      : 0;

    missed.push({ day, title: plan.title, totalQuestions, questionsAnswered });
  }

  return missed.reverse();
}
