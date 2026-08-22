import type { Profile } from "@/types";
import { getAllProfiles } from "@/lib/repositories/profileRepository";
import { loadProgress } from "@/lib/repositories/progressRepository";

export type LeaderboardEntry = {
  profile: Profile;
  totalCorrect: number;
  totalAttempted: number;
  accuracy: number;
  streak: number;
  longestStreak: number;
  daysCompleted: number;
};

export function getLeaderboard(): LeaderboardEntry[] {
  const entries = getAllProfiles().map((profile) => {
    const progress = loadProgress(profile.id);
    const totalCorrect = progress.questionAttempts.filter((a) => a.isCorrect).length;
    const totalAttempted = progress.questionAttempts.length;
    const accuracy = totalAttempted ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    return {
      profile,
      totalCorrect,
      totalAttempted,
      accuracy,
      streak: progress.streak,
      longestStreak: progress.longestStreak,
      daysCompleted: progress.completedDailySessions.length,
    };
  });

  return entries.sort(
    (a, b) => b.totalCorrect - a.totalCorrect || b.accuracy - a.accuracy || b.streak - a.streak
  );
}
