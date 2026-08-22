import type { Difficulty, Question } from "@/types";
import { questionBank } from "@/data/questionBank";

// Local, in-memory implementation. Swap the bodies of these functions for
// Supabase/Firebase/database calls later without touching any UI or the
// question selector — everything above this layer only calls these functions.

export function getAllQuestions(): Question[] {
  return questionBank;
}

export function getQuestionById(questionId: string): Question | undefined {
  return questionBank.find((q) => q.id === questionId);
}

export function getQuestionsBySubject(subjectId: string): Question[] {
  return questionBank.filter((q) => q.subjectId === subjectId);
}

export function getQuestionsByTopic(topicId: string): Question[] {
  return questionBank.filter((q) => q.topicId === topicId);
}

export function getQuestionsByDifficulty(topicId: string, difficulty: Difficulty): Question[] {
  return questionBank.filter((q) => q.topicId === topicId && q.difficulty === difficulty);
}

export function getQuestionsByTag(tag: string): Question[] {
  return questionBank.filter((q) => q.tags.includes(tag));
}
