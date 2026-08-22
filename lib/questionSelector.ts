import type { DailyPlan, Difficulty, PracticeMode, Question, QuestionSelectionOptions, StudentProgress } from "@/types";
import {
  getAllQuestions,
  getQuestionsBySubject,
  getQuestionsByTopic,
} from "@/lib/repositories/questionRepository";
import {
  getAttemptedQuestionIds,
  getIncorrectQuestionIds,
  getLastSessionQuestionIds,
  getRecentlyAttemptedQuestionIds,
} from "@/lib/questionHistory";

function dedupe(questions: Question[]): Question[] {
  const seen = new Set<string>();
  return questions.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

function byDifficultyPreference(pool: Question[], preferred?: Difficulty): Question[] {
  if (!preferred) return pool;
  const fallbackOrder: Record<Difficulty, Difficulty[]> = {
    easy: ["medium", "hard"],
    medium: ["easy", "hard"],
    hard: ["medium", "easy"],
  };
  const exact = pool.filter((q) => q.difficulty === preferred);
  const rest = fallbackOrder[preferred].flatMap((d) => pool.filter((q) => q.difficulty === d));
  return [...exact, ...rest];
}

function interleaveBySubject(pool: Question[]): Question[] {
  const bySubject = new Map<string, Question[]>();
  for (const q of pool) {
    const list = bySubject.get(q.subjectId) ?? [];
    list.push(q);
    bySubject.set(q.subjectId, list);
  }
  const lists = Array.from(bySubject.values());
  const result: Question[] = [];
  let index = 0;
  let remaining = pool.length;
  while (remaining > 0) {
    for (const list of lists) {
      if (index < list.length) {
        result.push(list[index]);
        remaining--;
      }
    }
    index++;
  }
  return result;
}

function orderByPriority(
  pool: Question[],
  mode: PracticeMode,
  neverAttempted: Question[],
  previouslyIncorrect: Question[],
  notRecentlySeen: Question[]
): Question[] {
  if (mode === "revision") {
    return dedupe([...previouslyIncorrect, ...neverAttempted, ...notRecentlySeen, ...pool]);
  }
  return dedupe([...neverAttempted, ...previouslyIncorrect, ...notRecentlySeen, ...pool]);
}

/**
 * Decides which questions to show for a practice session. Retest sessions
 * exclude the immediately previous attempt for the topic, prefer unseen
 * questions, then previously-incorrect ones, and only repeat recently-seen
 * questions once the topic's bank is exhausted.
 */
export function getPracticeQuestions(options: QuestionSelectionOptions): Question[] {
  const { mode, subjectId, topicId, count, difficulty, excludeQuestionIds = [], studentProgress } = options;

  let pool: Question[];
  if (topicId) {
    pool = getQuestionsByTopic(topicId);
  } else if (subjectId) {
    pool = getQuestionsBySubject(subjectId);
  } else {
    pool = interleaveBySubject(getAllQuestions());
  }

  const excludeSet = new Set(excludeQuestionIds);

  if (mode === "retest" && topicId && studentProgress) {
    getLastSessionQuestionIds(studentProgress, topicId, "retest").forEach((id) => excludeSet.add(id));
    getLastSessionQuestionIds(studentProgress, topicId).forEach((id) => excludeSet.add(id));
  }

  const effectiveDifficulty: Difficulty | undefined =
    difficulty ?? (topicId ? studentProgress?.topicProgress[topicId]?.currentDifficulty : undefined);

  let candidatePool = pool.filter((q) => !excludeSet.has(q.id));
  candidatePool = byDifficultyPreference(candidatePool, effectiveDifficulty);

  if (!studentProgress) {
    return dedupe(candidatePool).slice(0, count);
  }

  const attempted = getAttemptedQuestionIds(studentProgress);
  const incorrect = getIncorrectQuestionIds(studentProgress);
  const recentlySeen = getRecentlyAttemptedQuestionIds(studentProgress, 2);

  const neverAttempted = candidatePool.filter((q) => !attempted.has(q.id));
  const previouslyIncorrect = candidatePool.filter((q) => incorrect.has(q.id));
  const notRecentlySeen = candidatePool.filter((q) => !recentlySeen.has(q.id));

  const ordered = orderByPriority(candidatePool, mode, neverAttempted, previouslyIncorrect, notRecentlySeen);

  return ordered.slice(0, count);
}

/**
 * Expands a DailyPlan into the actual list of questions to serve, splitting
 * each subject slot's questionCount evenly across its focus topics (or the
 * whole subject's bank when no focus topics are set).
 */
export function getQuestionsForDailyPlan(plan: DailyPlan, studentProgress: StudentProgress): Question[] {
  return plan.subjects.flatMap((slot) => {
    const focusTopics = slot.focusTopics ?? [];
    if (focusTopics.length === 0) {
      return getPracticeQuestions({
        mode: "daily",
        subjectId: slot.subjectId,
        count: slot.questionCount,
        studentProgress,
      });
    }

    const base = Math.floor(slot.questionCount / focusTopics.length);
    const remainder = slot.questionCount - base * focusTopics.length;

    return focusTopics.flatMap((topicId, i) =>
      getPracticeQuestions({
        mode: "daily",
        subjectId: slot.subjectId,
        topicId,
        count: base + (i < remainder ? 1 : 0),
        studentProgress,
      })
    );
  });
}
