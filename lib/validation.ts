import { z } from "zod";
import type { Question, Subject, Topic } from "@/types";

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const questionSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  topicId: z.string().min(1),
  subTopicId: z.string().optional(),
  question: z.string().min(1),
  options: z.array(questionOptionSchema).min(2),
  correctOptionId: z.string().min(1),
  explanation: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionType: z.enum(["mcq", "true-false", "fill-blank", "image-based"]),
  tags: z.array(z.string()),
  learningObjective: z.string().optional(),
  estimatedTimeSeconds: z.number().optional(),
});

/**
 * Validates the question bank against the schema and cross-references
 * subject/topic ids so a typo can't silently orphan a question.
 */
export function validateQuestionBank(
  questions: Question[],
  subjects: Subject[],
  topics: Topic[]
): string[] {
  const errors: string[] = [];
  const subjectIds = new Set(subjects.map((s) => s.id));
  const topicIds = new Set(topics.map((t) => t.id));
  const seenIds = new Set<string>();

  for (const question of questions) {
    const parsed = questionSchema.safeParse(question);
    if (!parsed.success) {
      errors.push(`${question.id ?? "<no id>"}: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
      continue;
    }

    if (seenIds.has(question.id)) {
      errors.push(`${question.id}: duplicate question id`);
    }
    seenIds.add(question.id);

    if (!subjectIds.has(question.subjectId)) {
      errors.push(`${question.id}: unknown subjectId "${question.subjectId}"`);
    }
    if (!topicIds.has(question.topicId)) {
      errors.push(`${question.id}: unknown topicId "${question.topicId}"`);
    }
    if (!question.options.some((o) => o.id === question.correctOptionId)) {
      errors.push(`${question.id}: correctOptionId "${question.correctOptionId}" not found in options`);
    }
  }

  return errors;
}
