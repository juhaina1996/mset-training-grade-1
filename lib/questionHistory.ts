import type { QuestionAttempt, StudentProgress } from "@/types";

export function getAttemptedQuestionIds(progress: StudentProgress): Set<string> {
  return new Set(progress.questionAttempts.map((a) => a.questionId));
}

export function getRecentlyAttemptedQuestionIds(
  progress: StudentProgress,
  withinLastNSessions: number = 2
): Set<string> {
  const recentSessionIds = new Set(
    progress.testSessions
      .slice()
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, withinLastNSessions)
      .map((s) => s.id)
  );
  return new Set(
    progress.questionAttempts
      .filter((a) => recentSessionIds.has(a.sessionId))
      .map((a) => a.questionId)
  );
}

export function getIncorrectQuestionIds(progress: StudentProgress): Set<string> {
  const lastAttemptByQuestion = new Map<string, QuestionAttempt>();
  for (const attempt of progress.questionAttempts) {
    lastAttemptByQuestion.set(attempt.questionId, attempt);
  }
  return new Set(
    Array.from(lastAttemptByQuestion.values())
      .filter((a) => !a.isCorrect)
      .map((a) => a.questionId)
  );
}

export function getCorrectQuestionIds(progress: StudentProgress): Set<string> {
  const lastAttemptByQuestion = new Map<string, QuestionAttempt>();
  for (const attempt of progress.questionAttempts) {
    lastAttemptByQuestion.set(attempt.questionId, attempt);
  }
  return new Set(
    Array.from(lastAttemptByQuestion.values())
      .filter((a) => a.isCorrect)
      .map((a) => a.questionId)
  );
}

export function getQuestionAttemptCount(progress: StudentProgress, questionId: string): number {
  return progress.questionAttempts.filter((a) => a.questionId === questionId).length;
}

export function getLastAttemptForQuestion(
  progress: StudentProgress,
  questionId: string
): QuestionAttempt | undefined {
  const attempts = progress.questionAttempts.filter((a) => a.questionId === questionId);
  return attempts.length ? attempts[attempts.length - 1] : undefined;
}

export function getLastSessionQuestionIds(
  progress: StudentProgress,
  topicId: string,
  mode?: string
): Set<string> {
  const matching = progress.testSessions
    .filter((s) => s.topicId === topicId && (!mode || s.mode === mode))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return new Set(matching[0]?.questionIds ?? []);
}
