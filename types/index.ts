export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "mcq" | "true-false" | "fill-blank" | "image-based";

export type PracticeMode = "daily" | "retest" | "revision" | "mock" | "mistakes" | "full";

export type DailyPlanType = "learning" | "revision" | "mixed" | "mock";

export type Subject = {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  topics: string[];
};

export type Topic = {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  order: number;
  difficultyRange: Difficulty[];
  questionTarget?: number;
};

export type QuestionOption = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  subjectId: string;
  topicId: string;
  subTopicId?: string;
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  tags: string[];
  learningObjective?: string;
  estimatedTimeSeconds?: number;
};

export type QuestionAttempt = {
  id: string;
  questionId: string;
  subjectId: string;
  topicId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeTakenSeconds?: number;
  attemptedAt: string;
  sessionId: string;
  attemptNumber: number;
};

export type TestSession = {
  id: string;
  mode: PracticeMode;
  subjectId?: string;
  topicId?: string;
  questionIds: string[];
  startedAt: string;
  completedAt?: string;
  score?: number;
  totalQuestions: number;
  correctAnswers?: number;
  percentage?: number;
};

export type TopicProgress = {
  topicId: string;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  currentDifficulty: Difficulty;
  lastPracticedAt?: string;
  lastScore?: number;
  consecutiveCorrect?: number;
  consecutiveIncorrect?: number;
  totalRetests: number;
};

export type StudentProgress = {
  questionAttempts: QuestionAttempt[];
  testSessions: TestSession[];
  topicProgress: Record<string, TopicProgress>;
  completedDailySessions: string[];
  streak: number;
  longestStreak: number;
  lastPracticeDate?: string;
  achievements: string[];
};

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
};

export type DailyPlanSubjectSlot = {
  subjectId: string;
  questionCount: number;
  focusTopics?: string[];
};

export type DailyPlan = {
  day: number;
  date: string;
  title: string;
  description: string;
  subjects: DailyPlanSubjectSlot[];
  difficulty: Difficulty | "mixed";
  type: DailyPlanType;
};

export type QuestionSelectionOptions = {
  mode: PracticeMode;
  subjectId?: string;
  topicId?: string;
  count: number;
  difficulty?: Difficulty;
  excludeQuestionIds?: string[];
  studentProgress?: StudentProgress;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
};

export type Message = {
  id: string;
  category: "encouragement" | "streak" | "milestone" | "correct" | "incorrect";
  text: string;
};
