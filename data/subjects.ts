import type { Subject } from "@/types";

// Subject and topic structure mirrors the official Malappuram Sahodaya
// Aptitude Test (MSAT) Grade 1 syllabus (2025-26).
export const subjects: Subject[] = [
  {
    id: "maths",
    name: "Mathematics",
    shortName: "Maths",
    icon: "🔢",
    description: "Numbers, calculations and logical maths",
    topics: [
      "counting",
      "number-sense",
      "addition",
      "subtraction",
      "shapes-and-sizes",
      "time",
      "money",
      "measurement-and-patterns",
      "data-handling",
    ],
  },
  {
    id: "english",
    name: "English",
    shortName: "English",
    icon: "📖",
    description: "Vocabulary, grammar and language skills",
    topics: [
      "alphabet",
      "vocabulary",
      "opposites",
      "grammar-basics",
      "rhyming-words",
      "homonyms",
      "sentence-rearrangement",
      "comprehension",
    ],
  },
  {
    id: "evs",
    name: "Environmental Studies",
    shortName: "EVS",
    icon: "🌱",
    description: "Our body, surroundings and the world around us",
    topics: [
      "my-body",
      "plants-around-us",
      "animals-around-us",
      "living-things",
      "our-needs",
      "good-habits",
      "neighbourhood",
      "earth-and-sky",
      "transport",
    ],
  },
  {
    id: "gk",
    name: "General Knowledge",
    shortName: "GK",
    icon: "🌍",
    description: "Me, my surroundings, India and the world",
    topics: [
      "around-you",
      "plants-and-animals",
      "my-country",
      "the-world",
      "science-and-technology",
      "entertainment",
      "sports",
      "current-affairs",
    ],
  },
  {
    id: "aptitude",
    name: "Mental Ability",
    shortName: "Mental Ability",
    icon: "🧩",
    description: "Patterns, logic and problem solving",
    topics: [
      "odd-one-out",
      "number-patterns",
      "spatial-understanding",
      "analogy",
      "ranking",
      "symmetry",
      "mirror-image",
      "paper-folding",
    ],
  },
];

export function getAllSubjects(): Subject[] {
  return subjects;
}

export function getSubjectById(subjectId: string): Subject | undefined {
  return subjects.find((subject) => subject.id === subjectId);
}
