import type { StudentProgress, TestSession } from "@/types";
import { getAllSubjectQuestions } from "@/lib/questionSelector";
import { getQuestionsBySubject } from "@/lib/repositories/questionRepository";
import { getAttemptedQuestionIds } from "@/lib/questionHistory";

// A "full run" is one pass through every question in a subject. Runs are
// stored as ordinary TestSessions under a deterministic id so an unfinished
// run can be picked up days later, and finishing one starts a fresh
// `-r<n>` run rather than overwriting the last one's score.

export type SubjectRunProgress = {
  subjectId: string;
  totalQuestions: number;
  /** Questions answered in the current (or most recently finished) run. */
  answered: number;
  correct: number;
  hasStarted: boolean;
  isComplete: boolean;
  /** Distinct questions in this subject seen in any mode, ever. */
  everAttempted: number;
  runNumber: number;
  sessionId?: string;
};

export function fullRunSessionIdBase(subjectId: string): string {
  return `session-full-${subjectId}`;
}

function getFullRunSessions(progress: StudentProgress, subjectId: string): TestSession[] {
  const base = fullRunSessionIdBase(subjectId);
  return progress.testSessions.filter((s) => s.id === base || s.id.startsWith(`${base}-r`));
}

/** The run in play: the newest one, whether or not it's finished. */
export function getLatestFullRun(
  progress: StudentProgress,
  subjectId: string
): TestSession | undefined {
  const runs = getFullRunSessions(progress, subjectId);
  return runs[runs.length - 1];
}

/**
 * Id for the next run. Numbered from the highest `-r` suffix already in use
 * rather than from how many rows exist, so it stays correct even if a run
 * somehow got recorded more than once.
 */
export function nextFullRunSessionId(progress: StudentProgress, subjectId: string): string {
  const base = fullRunSessionIdBase(subjectId);
  const runs = getFullRunSessions(progress, subjectId);
  if (runs.length === 0) return base;

  const highest = runs.reduce((max, session) => {
    const suffix = Number(session.id.slice(`${base}-r`.length));
    return session.id.startsWith(`${base}-r`) && Number.isFinite(suffix) ? Math.max(max, suffix) : max;
  }, 0);

  return `${base}-r${highest + 1}`;
}

export function getSubjectRunProgress(
  progress: StudentProgress,
  subjectId: string
): SubjectRunProgress {
  const totalQuestions = getAllSubjectQuestions(subjectId).length;
  const attemptedEver = getAttemptedQuestionIds(progress);
  const everAttempted = getQuestionsBySubject(subjectId).filter((q) => attemptedEver.has(q.id)).length;

  const run = getLatestFullRun(progress, subjectId);
  if (!run) {
    return {
      subjectId,
      totalQuestions,
      answered: 0,
      correct: 0,
      hasStarted: false,
      isComplete: false,
      everAttempted,
      runNumber: 0,
    };
  }

  const attempts = progress.questionAttempts.filter((a) => a.sessionId === run.id);
  const answeredIds = new Set(attempts.map((a) => a.questionId));

  return {
    subjectId,
    totalQuestions: run.totalQuestions || totalQuestions,
    answered: answeredIds.size,
    correct: attempts.filter((a) => a.isCorrect).length,
    hasStarted: true,
    isComplete: Boolean(run.completedAt),
    everAttempted,
    runNumber: getFullRunSessions(progress, subjectId).length,
    sessionId: run.id,
  };
}
