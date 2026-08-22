import type { Question, QuestionSelectionOptions } from "@/types";
import { getAllQuestions } from "@/lib/repositories/questionRepository";
import { getPracticeQuestions } from "@/lib/questionSelector";

// Abstraction so the app doesn't care whether questions come from static
// local data or, later, an AI generation service. The selector and UI only
// ever talk to a QuestionProvider.
export interface QuestionProvider {
  getQuestions(): Question[];
  generateQuestions(options: QuestionSelectionOptions): Question[];
}

export class LocalQuestionProvider implements QuestionProvider {
  getQuestions(): Question[] {
    return getAllQuestions();
  }

  generateQuestions(options: QuestionSelectionOptions): Question[] {
    return getPracticeQuestions(options);
  }
}

export const defaultQuestionProvider: QuestionProvider = new LocalQuestionProvider();
