import type { Question } from "@/types";
import { mathsQuestions } from "@/data/questions/maths";
import { englishQuestions } from "@/data/questions/english";
import { evsQuestions } from "@/data/questions/evs";
import { gkQuestions } from "@/data/questions/gk";
import { aptitudeQuestions } from "@/data/questions/aptitude";

export const questionBank: Question[] = [
  ...mathsQuestions,
  ...englishQuestions,
  ...evsQuestions,
  ...gkQuestions,
  ...aptitudeQuestions,
];
