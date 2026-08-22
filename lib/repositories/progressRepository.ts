import type {
  Difficulty,
  QuestionAttempt,
  StudentProgress,
  TestSession,
  TopicProgress,
} from "@/types";
import { readFromStorage, writeToStorage, clearStorage } from "@/lib/storage";

// Local-storage-backed implementation. Swap the bodies of loadProgress/saveProgress
// for Supabase/Firebase/database calls later without touching the UI, the question
// selector, or the recommendation engine — they only depend on the StudentProgress shape.

export function getEmptyProgress(): StudentProgress {
  return {
    questionAttempts: [],
    testSessions: [],
    topicProgress: {},
    completedDailySessions: [],
    streak: 0,
    longestStreak: 0,
    achievements: [],
  };
}

export function loadProgress(): StudentProgress {
  return readFromStorage<StudentProgress>() ?? getEmptyProgress();
}

export function saveProgress(progress: StudentProgress): void {
  writeToStorage(progress);
}

export function resetProgress(): StudentProgress {
  clearStorage();
  return getEmptyProgress();
}

function nextDifficulty(current: Difficulty, accuracy: number, attempts: number): Difficulty {
  if (attempts < 5) return current;
  if (accuracy >= 85) return current === "easy" ? "medium" : current === "medium" ? "hard" : "hard";
  if (accuracy < 60) return current === "hard" ? "medium" : current === "medium" ? "easy" : "easy";
  return current;
}

function updateTopicProgress(
  existing: TopicProgress | undefined,
  attempt: QuestionAttempt,
  fallbackDifficulty: Difficulty
): TopicProgress {
  const base: TopicProgress = existing ?? {
    topicId: attempt.topicId,
    questionsAttempted: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
    currentDifficulty: fallbackDifficulty,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    totalRetests: 0,
  };

  const questionsAttempted = base.questionsAttempted + 1;
  const correctAnswers = base.correctAnswers + (attempt.isCorrect ? 1 : 0);
  const incorrectAnswers = base.incorrectAnswers + (attempt.isCorrect ? 0 : 1);
  const accuracy = Math.round((correctAnswers / questionsAttempted) * 100);
  const consecutiveCorrect = attempt.isCorrect ? (base.consecutiveCorrect ?? 0) + 1 : 0;
  const consecutiveIncorrect = attempt.isCorrect ? 0 : (base.consecutiveIncorrect ?? 0) + 1;

  return {
    ...base,
    questionsAttempted,
    correctAnswers,
    incorrectAnswers,
    accuracy,
    currentDifficulty: nextDifficulty(base.currentDifficulty, accuracy, questionsAttempted),
    lastPracticedAt: attempt.attemptedAt,
    consecutiveCorrect,
    consecutiveIncorrect,
    totalRetests: base.totalRetests,
  };
}

export function recordQuestionAttempt(
  progress: StudentProgress,
  attempt: QuestionAttempt,
  fallbackDifficulty: Difficulty = "easy"
): StudentProgress {
  const topicProgress = {
    ...progress.topicProgress,
    [attempt.topicId]: updateTopicProgress(
      progress.topicProgress[attempt.topicId],
      attempt,
      fallbackDifficulty
    ),
  };

  return {
    ...progress,
    questionAttempts: [...progress.questionAttempts, attempt],
    topicProgress,
  };
}

export function startTestSession(
  progress: StudentProgress,
  session: TestSession
): StudentProgress {
  const isRetest = session.mode === "retest";
  let topicProgress = progress.topicProgress;
  if (isRetest && session.topicId && topicProgress[session.topicId]) {
    topicProgress = {
      ...topicProgress,
      [session.topicId]: {
        ...topicProgress[session.topicId],
        totalRetests: topicProgress[session.topicId].totalRetests + 1,
      },
    };
  }
  return {
    ...progress,
    testSessions: [...progress.testSessions, session],
    topicProgress,
  };
}

export function completeTestSession(
  progress: StudentProgress,
  sessionId: string,
  result: { correctAnswers: number; completedAt: string }
): StudentProgress {
  const testSessions = progress.testSessions.map((session) => {
    if (session.id !== sessionId) return session;
    const percentage = Math.round((result.correctAnswers / session.totalQuestions) * 100);
    return {
      ...session,
      completedAt: result.completedAt,
      correctAnswers: result.correctAnswers,
      score: result.correctAnswers,
      percentage,
    };
  });

  const completedSession = testSessions.find((s) => s.id === sessionId);
  const topicProgress = completedSession?.topicId
    ? {
        ...progress.topicProgress,
        [completedSession.topicId]: progress.topicProgress[completedSession.topicId]
          ? {
              ...progress.topicProgress[completedSession.topicId],
              lastScore: completedSession.percentage,
            }
          : progress.topicProgress[completedSession.topicId],
      }
    : progress.topicProgress;

  return { ...progress, testSessions, topicProgress };
}

export function markDailySessionComplete(
  progress: StudentProgress,
  dailySessionKey: string,
  today: string
): StudentProgress {
  if (progress.completedDailySessions.includes(dailySessionKey)) {
    return { ...progress, lastPracticeDate: today };
  }

  const wasYesterday = (() => {
    if (!progress.lastPracticeDate) return false;
    const prev = new Date(progress.lastPracticeDate + "T00:00:00");
    prev.setDate(prev.getDate() + 1);
    return prev.toISOString().slice(0, 10) === today;
  })();

  const streak = wasYesterday ? progress.streak + 1 : progress.lastPracticeDate === today ? progress.streak : 1;
  const longestStreak = Math.max(progress.longestStreak, streak);

  return {
    ...progress,
    completedDailySessions: [...progress.completedDailySessions, dailySessionKey],
    lastPracticeDate: today,
    streak,
    longestStreak,
  };
}

export function unlockAchievements(progress: StudentProgress, newlyUnlockedIds: string[]): StudentProgress {
  if (newlyUnlockedIds.length === 0) return progress;
  const merged = Array.from(new Set([...progress.achievements, ...newlyUnlockedIds]));
  return { ...progress, achievements: merged };
}
