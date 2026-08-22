// Dev-time content generator. Produces the static question data files under data/questions/.
// Run with: node scripts/generate-questions.mjs
// This script is NOT imported by the app at runtime — it only materializes data files.

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "data", "questions");

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function pad(n) {
  return String(n).padStart(3, "0");
}

function shuffleDeterministic(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeMcq({
  id,
  subjectId,
  topicId,
  question,
  correctText,
  distractors,
  explanation,
  difficulty,
  tags,
  learningObjective,
  estimatedTimeSeconds = 30,
  seed = 1,
  questionType = "mcq",
}) {
  const optionTexts = shuffleDeterministic(
    [correctText, ...distractors].map(String),
    seed
  );
  const letters = ["a", "b", "c", "d", "e"];
  const options = optionTexts.map((text, i) => ({ id: letters[i], text }));
  const correctOptionId = options.find((o) => o.text === String(correctText)).id;
  return {
    id,
    subjectId,
    topicId,
    question,
    options,
    correctOptionId,
    explanation,
    difficulty,
    questionType,
    tags,
    learningObjective,
    estimatedTimeSeconds,
  };
}

function tier(index, total) {
  if (index < total / 3) return "easy";
  if (index < (2 * total) / 3) return "medium";
  return "hard";
}

// ---------------------------------------------------------------------------
// MATHS
// ---------------------------------------------------------------------------

function generateCounting() {
  const qs = [];
  let n = 1;
  // Counting objects (1-15)
  for (let i = 1; i <= 12; i++) {
    const count = i + 2;
    const emoji = ["🍎", "⭐", "🐠", "🎈"][i % 4];
    qs.push(
      makeMcq({
        id: `math-count-${pad(n++)}`,
        subjectId: "maths",
        topicId: "counting",
        question: `Count the ${emoji} symbols: ${emoji.repeat(count)}. How many are there?`,
        correctText: count,
        distractors: [count - 1, count + 1, count + 2],
        explanation: `There are ${count} ${emoji} symbols in total.`,
        difficulty: tier(i - 1, 12),
        tags: ["counting", "objects"],
        learningObjective: "Count a group of objects up to 15",
        seed: i,
      })
    );
  }
  // Number before/after (9)
  for (let i = 1; i <= 9; i++) {
    const base = i * 3 + 1;
    const askAfter = i % 2 === 0;
    qs.push(
      makeMcq({
        id: `math-count-${pad(n++)}`,
        subjectId: "maths",
        topicId: "counting",
        question: askAfter
          ? `What number comes right after ${base}?`
          : `What number comes right before ${base}?`,
        correctText: askAfter ? base + 1 : base - 1,
        distractors: [base, askAfter ? base + 2 : base - 2, askAfter ? base - 1 : base + 1],
        explanation: askAfter
          ? `${base + 1} comes right after ${base}.`
          : `${base - 1} comes right before ${base}.`,
        difficulty: tier(i - 1, 9),
        tags: ["counting", "sequence"],
        learningObjective: "Identify numbers before and after a given number",
        seed: i + 20,
      })
    );
  }
  // Skip counting (9)
  const skipSteps = [2, 5, 10];
  for (let i = 1; i <= 9; i++) {
    const step = skipSteps[i % 3];
    const start = (Math.floor((i - 1) / 3) + 1) * step;
    const sequence = [start, start + step, start + 2 * step, start + 3 * step];
    const answer = start + 4 * step;
    qs.push(
      makeMcq({
        id: `math-count-${pad(n++)}`,
        subjectId: "maths",
        topicId: "counting",
        question: `Skip count: ${sequence.join(", ")}, ?`,
        correctText: answer,
        distractors: [answer - step + 1, answer + 1, answer - 1],
        explanation: `Counting by ${step}s: ${[...sequence, answer].join(", ")}.`,
        difficulty: tier(i - 1, 9),
        tags: ["counting", "skip-counting"],
        learningObjective: `Skip count by ${step}s`,
        seed: i + 40,
      })
    );
  }
  return qs;
}

function generateNumberSense() {
  const qs = [];
  let n = 1;
  // Greater/smaller comparisons (12)
  for (let i = 1; i <= 12; i++) {
    const a = i * 4 + 2;
    const b = i * 4 + 7;
    const askGreater = i % 2 === 0;
    qs.push(
      makeMcq({
        id: `math-numsense-${pad(n++)}`,
        subjectId: "maths",
        topicId: "number-sense",
        question: askGreater
          ? `Which number is greater: ${a} or ${b}?`
          : `Which number is smaller: ${a} or ${b}?`,
        correctText: askGreater ? Math.max(a, b) : Math.min(a, b),
        distractors: [askGreater ? Math.min(a, b) : Math.max(a, b), a + b, Math.abs(a - b)],
        explanation: askGreater
          ? `${Math.max(a, b)} is greater than ${Math.min(a, b)}.`
          : `${Math.min(a, b)} is smaller than ${Math.max(a, b)}.`,
        difficulty: tier(i - 1, 12),
        tags: ["number-sense", "comparison"],
        learningObjective: "Compare two numbers",
        seed: i + 60,
      })
    );
  }
  // Place value: tens and ones (9)
  for (let i = 1; i <= 9; i++) {
    const tens = ((i - 1) % 9) + 1;
    const ones = ((i * 3) % 9) + 1;
    const num = tens * 10 + ones;
    const askTens = i % 2 === 0;
    qs.push(
      makeMcq({
        id: `math-numsense-${pad(n++)}`,
        subjectId: "maths",
        topicId: "number-sense",
        question: askTens
          ? `In the number ${num}, how many tens are there?`
          : `In the number ${num}, how many ones are there?`,
        correctText: askTens ? tens : ones,
        distractors: [askTens ? ones : tens, askTens ? tens + 1 : ones + 1, askTens ? tens - 1 >= 0 ? tens - 1 : tens + 2 : ones - 1 >= 0 ? ones - 1 : ones + 2],
        explanation: `${num} = ${tens} tens and ${ones} ones.`,
        difficulty: tier(i - 1, 9),
        tags: ["number-sense", "place-value"],
        learningObjective: "Understand tens and ones place value",
        seed: i + 80,
      })
    );
  }
  // Ordering numbers (9)
  for (let i = 1; i <= 9; i++) {
    const start = i * 5;
    const nums = [start + 3, start, start + 5, start + 1];
    const smallest = Math.min(...nums);
    qs.push(
      makeMcq({
        id: `math-numsense-${pad(n++)}`,
        subjectId: "maths",
        topicId: "number-sense",
        question: `Which is the smallest number? ${nums.join(", ")}`,
        correctText: smallest,
        distractors: nums.filter((x) => x !== smallest).slice(0, 3),
        explanation: `${smallest} is the smallest among ${nums.join(", ")}.`,
        difficulty: tier(i - 1, 9),
        tags: ["number-sense", "ordering"],
        learningObjective: "Order numbers from smallest to largest",
        seed: i + 100,
      })
    );
  }
  return qs;
}

function generateAddition() {
  const qs = [];
  let n = 1;
  // Easy: sums to 10 (10)
  for (let i = 1; i <= 10; i++) {
    const x = i;
    const y = ((i * 3) % 8) + 1;
    const sum = x + y;
    qs.push(
      makeMcq({
        id: `math-add-${pad(n++)}`,
        subjectId: "maths",
        topicId: "addition",
        question: `What is ${x} + ${y}?`,
        correctText: sum,
        distractors: [sum + 1, sum - 1, sum + 2],
        explanation: `${x} + ${y} = ${sum}.`,
        difficulty: "easy",
        tags: ["addition", "basic-facts"],
        learningObjective: "Add numbers up to 10",
        estimatedTimeSeconds: 25,
        seed: i + 120,
      })
    );
  }
  // Medium: sums to 20 + word problems (10)
  const names = ["Riya", "Aarav", "Meera", "Kabir", "Zara", "Dev", "Anaya", "Ishaan", "Tara", "Vihaan"];
  for (let i = 1; i <= 10; i++) {
    const x = 5 + i;
    const y = 4 + ((i * 2) % 9);
    const sum = x + y;
    const name = names[i - 1];
    qs.push(
      makeMcq({
        id: `math-add-${pad(n++)}`,
        subjectId: "maths",
        topicId: "addition",
        question: `${name} has ${x} candies. Someone gives ${name} ${y} more. How many candies does ${name} have now?`,
        correctText: sum,
        distractors: [sum + 1, sum - 1, x + y - 2 > 0 ? x + y - 2 : sum + 3],
        explanation: `${x} + ${y} = ${sum}. ${name} has ${sum} candies.`,
        difficulty: "medium",
        tags: ["addition", "word-problem"],
        learningObjective: "Solve addition word problems within 20",
        seed: i + 140,
      })
    );
  }
  // Hard: two-digit addition (10)
  for (let i = 1; i <= 10; i++) {
    const x = 10 + i * 2;
    const y = 11 + ((i * 5) % 20);
    const sum = x + y;
    qs.push(
      makeMcq({
        id: `math-add-${pad(n++)}`,
        subjectId: "maths",
        topicId: "addition",
        question: `What is ${x} + ${y}?`,
        correctText: sum,
        distractors: [sum + 10, sum - 10, sum + 1],
        explanation: `${x} + ${y} = ${sum}.`,
        difficulty: "hard",
        tags: ["addition", "two-digit"],
        learningObjective: "Add two-digit numbers",
        estimatedTimeSeconds: 40,
        seed: i + 160,
      })
    );
  }
  return qs;
}

function generateSubtraction() {
  const qs = [];
  let n = 1;
  for (let i = 1; i <= 10; i++) {
    const b = i;
    const a = b + ((i * 2) % 6) + 2;
    const diff = a - b;
    qs.push(
      makeMcq({
        id: `math-sub-${pad(n++)}`,
        subjectId: "maths",
        topicId: "subtraction",
        question: `What is ${a} - ${b}?`,
        correctText: diff,
        distractors: [diff + 1, diff - 1 >= 0 ? diff - 1 : diff + 2, diff + 2],
        explanation: `${a} - ${b} = ${diff}.`,
        difficulty: "easy",
        tags: ["subtraction", "basic-facts"],
        learningObjective: "Subtract numbers within 10",
        estimatedTimeSeconds: 25,
        seed: i + 180,
      })
    );
  }
  const names = ["Sara", "Ali", "Nina", "Omar", "Leah", "Ravi", "Maya", "Yusuf", "Priya", "Arjun"];
  for (let i = 1; i <= 10; i++) {
    const a = 10 + i;
    const b = 3 + ((i * 2) % 8);
    const diff = a - b;
    const name = names[i - 1];
    qs.push(
      makeMcq({
        id: `math-sub-${pad(n++)}`,
        subjectId: "maths",
        topicId: "subtraction",
        question: `${name} had ${a} balloons. ${b} balloons flew away. How many balloons does ${name} have left?`,
        correctText: diff,
        distractors: [diff + 1, diff - 1 >= 0 ? diff - 1 : diff + 2, a + b],
        explanation: `${a} - ${b} = ${diff}. ${name} has ${diff} balloons left.`,
        difficulty: "medium",
        tags: ["subtraction", "word-problem"],
        learningObjective: "Solve subtraction word problems within 20",
        seed: i + 200,
      })
    );
  }
  for (let i = 1; i <= 10; i++) {
    const a = 30 + i * 2;
    const b = 11 + ((i * 3) % 15);
    const diff = a - b;
    qs.push(
      makeMcq({
        id: `math-sub-${pad(n++)}`,
        subjectId: "maths",
        topicId: "subtraction",
        question: `What is ${a} - ${b}?`,
        correctText: diff,
        distractors: [diff + 10, diff - 10 >= 0 ? diff - 10 : diff + 5, diff + 1],
        explanation: `${a} - ${b} = ${diff}.`,
        difficulty: "hard",
        tags: ["subtraction", "two-digit"],
        learningObjective: "Subtract two-digit numbers",
        estimatedTimeSeconds: 40,
        seed: i + 220,
      })
    );
  }
  return qs;
}

function generateShapesAndSizes() {
  const shapes = [
    ["circle", 0, 0],
    ["triangle", 3, 3],
    ["square", 4, 4],
    ["rectangle", 4, 4],
    ["pentagon", 5, 5],
    ["hexagon", 6, 6],
    ["oval", 0, 0],
    ["star", 10, 5],
    ["rhombus", 4, 4],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < shapes.length; i++) {
    const [name, sides] = shapes[i];
    const distractorShapes = shapes.filter((_, idx) => idx !== i);
    qs.push(
      makeMcq({
        id: `math-shape-${pad(n++)}`,
        subjectId: "maths",
        topicId: "shapes-and-sizes",
        question: `How many sides does a ${name} have?`,
        correctText: sides,
        distractors: [...new Set(distractorShapes.map((s) => s[1]))].filter((x) => x !== sides).slice(0, 3),
        explanation: `A ${name} has ${sides} sides.`,
        difficulty: tier(i, shapes.length * 2),
        tags: ["shapes", "sides"],
        learningObjective: "Count the sides of common shapes",
        seed: i + 1,
      })
    );
    qs.push(
      makeMcq({
        id: `math-shape-${pad(n++)}`,
        subjectId: "maths",
        topicId: "shapes-and-sizes",
        question: `Which shape has ${sides} sides?`,
        correctText: name,
        distractors: distractorShapes.filter((s) => s[1] !== sides).slice(0, 3).map((s) => s[0]),
        explanation: `A ${name} has ${sides} sides.`,
        difficulty: tier(shapes.length + i, shapes.length * 2),
        tags: ["shapes", "identification"],
        learningObjective: "Identify shapes from their number of sides",
        seed: i + 40,
      })
    );
  }
  const sizeScenarios = [
    ["Which is bigger, an elephant or a mouse?", "Elephant", ["Mouse"]],
    ["Which is smaller, an ant or a dog?", "Ant", ["Dog"]],
    ["Which is taller, a tree or a flower?", "Tree", ["Flower"]],
    ["Which is shorter, a pencil or a bus?", "Pencil", ["Bus"]],
    ["Which is longer, a snake or a spoon?", "Snake", ["Spoon"]],
    ["Which is nearer to the ground, the sky or the floor?", "Floor", ["Sky"]],
    ["Which animal is bigger, a lion or a rabbit?", "Lion", ["Rabbit"]],
  ];
  for (let i = 0; i < sizeScenarios.length; i++) {
    const [question, correct, distractors] = sizeScenarios[i];
    qs.push(
      makeMcq({
        id: `math-shape-${pad(n++)}`,
        subjectId: "maths",
        topicId: "shapes-and-sizes",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(2 * shapes.length + i, 2 * shapes.length + sizeScenarios.length),
        questionType: "true-false",
        tags: ["sizes", "comparison"],
        learningObjective: "Compare the size of common objects",
        seed: i + 80,
      })
    );
  }
  return qs;
}

function generateTime() {
  const qs = [];
  let n = 1;
  const clocks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  for (let i = 0; i < clocks.length; i++) {
    const hour = clocks[i];
    qs.push(
      makeMcq({
        id: `math-time-${pad(n++)}`,
        subjectId: "maths",
        topicId: "time",
        question: `A clock shows the hour hand at ${hour} and the minute hand at 12. What time is it?`,
        correctText: `${hour} o'clock`,
        distractors: [`${(hour % 12) + 1} o'clock`, `${hour}:30`, `${((hour + 5) % 12) + 1} o'clock`],
        explanation: `When the minute hand points to 12, the clock shows ${hour} o'clock.`,
        difficulty: tier(i, clocks.length + 8),
        tags: ["time", "clock"],
        learningObjective: "Read the time to the hour",
        seed: i + 1,
      })
    );
  }
  const dayNight = [
    ["When do we see the sun in the sky?", "Daytime", ["Nighttime"]],
    ["When do we usually see the moon and stars?", "Nighttime", ["Daytime"]],
    ["When do most children go to school?", "Daytime", ["Nighttime"]],
    ["When do we usually sleep?", "Nighttime", ["Daytime"]],
  ];
  for (let i = 0; i < dayNight.length; i++) {
    const [question, correct, distractors] = dayNight[i];
    qs.push(
      makeMcq({
        id: `math-time-${pad(n++)}`,
        subjectId: "maths",
        topicId: "time",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: "easy",
        questionType: "true-false",
        tags: ["time", "day-night"],
        learningObjective: "Understand day and night",
        seed: i + 20,
      })
    );
  }
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  for (let i = 0; i < 4; i++) {
    const idx = i * 2;
    const day = days[idx % 7];
    const next = days[(idx + 1) % 7];
    qs.push(
      makeMcq({
        id: `math-time-${pad(n++)}`,
        subjectId: "maths",
        topicId: "time",
        question: `Which day comes right after ${day}?`,
        correctText: next,
        distractors: [days[(idx + 2) % 7], days[(idx + 3) % 7], days[(idx - 1 + 7) % 7]],
        explanation: `${next} comes right after ${day}.`,
        difficulty: "medium",
        tags: ["time", "days-of-week"],
        learningObjective: "Recall the order of the days of the week",
        seed: i + 30,
      })
    );
  }
  return qs;
}

function generateMoney() {
  const qs = [];
  let n = 1;
  const coins = [1, 2, 5, 10, 20];
  for (let i = 0; i < coins.length; i++) {
    const value = coins[i];
    qs.push(
      makeMcq({
        id: `math-money-${pad(n++)}`,
        subjectId: "maths",
        topicId: "money",
        question: `What is the value of a ₹${value} coin?`,
        correctText: `₹${value}`,
        distractors: coins.filter((c) => c !== value).slice(0, 3).map((c) => `₹${c}`),
        explanation: `This coin is worth ₹${value}.`,
        difficulty: "easy",
        tags: ["money", "coins"],
        learningObjective: "Recognise the value of common coins",
        seed: i + 1,
      })
    );
  }
  for (let i = 1; i <= 10; i++) {
    const a = coins[i % coins.length];
    const b = coins[(i + 2) % coins.length];
    const total = a + b;
    qs.push(
      makeMcq({
        id: `math-money-${pad(n++)}`,
        subjectId: "maths",
        topicId: "money",
        question: `Riya has a ₹${a} coin and a ₹${b} coin. How much money does she have in total?`,
        correctText: `₹${total}`,
        distractors: [`₹${total + 1}`, `₹${total - 1}`, `₹${Math.abs(a - b)}`],
        explanation: `₹${a} + ₹${b} = ₹${total}.`,
        difficulty: tier(i, 15),
        tags: ["money", "addition"],
        learningObjective: "Add the value of simple coins",
        seed: i + 20,
      })
    );
  }
  return qs;
}

function generateMeasurementAndPatterns() {
  const qs = [];
  let n = 1;
  const heavyLight = [
    ["Which is heavier, a rock or a feather?", "Rock", ["Feather"]],
    ["Which is lighter, a balloon or a brick?", "Balloon", ["Brick"]],
    ["Which is heavier, an elephant or a cat?", "Elephant", ["Cat"]],
    ["Which is lighter, a leaf or a bag of rice?", "Leaf", ["Bag of rice"]],
    ["Which is longer, a ruler or a pencil eraser?", "Ruler", ["Pencil eraser"]],
    ["Which is shorter, a pin or a broomstick?", "Pin", ["Broomstick"]],
  ];
  for (let i = 0; i < heavyLight.length; i++) {
    const [question, correct, distractors] = heavyLight[i];
    qs.push(
      makeMcq({
        id: `math-measure-${pad(n++)}`,
        subjectId: "maths",
        topicId: "measurement-and-patterns",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: "easy",
        questionType: "true-false",
        tags: ["measurement", "comparison"],
        learningObjective: "Compare weight and length using non-standard units",
        seed: i + 1,
      })
    );
  }
  const patternSymbols = [
    ["🔴", "🔵"],
    ["⭐", "🌙"],
    ["🟥", "🟦"],
    ["🔺", "🔻"],
  ];
  for (let i = 0; i < 12; i++) {
    const [a, b] = patternSymbols[i % patternSymbols.length];
    const sequence = [a, b, a, b, a];
    qs.push(
      makeMcq({
        id: `math-measure-${pad(n++)}`,
        subjectId: "maths",
        topicId: "measurement-and-patterns",
        question: `What comes next in the pattern? ${sequence.join(" ")} ?`,
        correctText: b,
        distractors: [a, patternSymbols[(i + 1) % patternSymbols.length][0]],
        explanation: `The pattern repeats ${a}, ${b}, so ${b} comes next.`,
        difficulty: tier(i, 12),
        tags: ["patterns", "sequence"],
        learningObjective: "Continue a simple repeating pattern",
        seed: i + 20,
      })
    );
  }
  return qs;
}

function generateDataHandling() {
  const qs = [];
  let n = 1;
  const items = ["apples", "balloons", "stars", "flowers"];
  for (let i = 1; i <= 16; i++) {
    const item = items[i % items.length];
    const count = 3 + (i % 6);
    const tally = "|".repeat(count);
    qs.push(
      makeMcq({
        id: `math-data-${pad(n++)}`,
        subjectId: "maths",
        topicId: "data-handling",
        question: `A picture graph shows ${count} ${item} using marks: ${tally}. How many ${item} are there?`,
        correctText: count,
        distractors: [count - 1, count + 1, count + 2],
        explanation: `Counting the marks: ${tally} = ${count}.`,
        difficulty: tier(i - 1, 16),
        tags: ["data-handling", "tally"],
        learningObjective: "Read a simple tally or picture graph",
        seed: i,
      })
    );
  }
  return qs;
}

// ---------------------------------------------------------------------------
// ENGLISH
// ---------------------------------------------------------------------------

function generateAlphabet() {
  const qs = [];
  let n = 1;
  for (let i = 1; i <= 26; i++) {
    const idx = i - 1;
    let q;
    const kind = i % 4;
    if (kind === 1 && idx < 25) {
      const letter = LETTERS[idx];
      const next = LETTERS[idx + 1];
      q = makeMcq({
        id: `eng-alpha-${pad(n++)}`,
        subjectId: "english",
        topicId: "alphabet",
        question: `Which letter comes right after ${letter}?`,
        correctText: next,
        distractors: [LETTERS[(idx + 2) % 26], LETTERS[(idx - 1 + 26) % 26], LETTERS[(idx + 3) % 26]],
        explanation: `${next} comes right after ${letter} in the alphabet.`,
        difficulty: "easy",
        tags: ["alphabet", "sequence"],
        learningObjective: "Recall alphabet order",
        seed: i,
      });
    } else if (kind === 2 && idx > 0) {
      const letter = LETTERS[idx];
      const prev = LETTERS[idx - 1];
      q = makeMcq({
        id: `eng-alpha-${pad(n++)}`,
        subjectId: "english",
        topicId: "alphabet",
        question: `Which letter comes right before ${letter}?`,
        correctText: prev,
        distractors: [LETTERS[(idx - 2 + 26) % 26], LETTERS[(idx + 1) % 26], LETTERS[(idx - 3 + 26) % 26]],
        explanation: `${prev} comes right before ${letter} in the alphabet.`,
        difficulty: "medium",
        tags: ["alphabet", "sequence"],
        learningObjective: "Recall alphabet order",
        seed: i + 30,
      });
    } else if (kind === 3) {
      const letter = LETTERS[idx];
      q = makeMcq({
        id: `eng-alpha-${pad(n++)}`,
        subjectId: "english",
        topicId: "alphabet",
        question: `What is the small (lowercase) letter for capital '${letter}'?`,
        correctText: letter.toLowerCase(),
        distractors: [
          LETTERS[(idx + 1) % 26].toLowerCase(),
          LETTERS[(idx - 1 + 26) % 26].toLowerCase(),
          LETTERS[(idx + 2) % 26].toLowerCase(),
        ],
        explanation: `'${letter.toLowerCase()}' is the lowercase form of '${letter}'.`,
        difficulty: "hard",
        tags: ["alphabet", "case-matching"],
        learningObjective: "Match capital and small letters",
        seed: i + 60,
      });
    } else {
      const letter = LETTERS[idx];
      q = makeMcq({
        id: `eng-alpha-${pad(n++)}`,
        subjectId: "english",
        topicId: "alphabet",
        question: `What is the capital letter for small '${letter.toLowerCase()}'?`,
        correctText: letter,
        distractors: [LETTERS[(idx + 1) % 26], LETTERS[(idx - 1 + 26) % 26], LETTERS[(idx + 2) % 26]],
        explanation: `'${letter}' is the capital form of '${letter.toLowerCase()}'.`,
        difficulty: "hard",
        tags: ["alphabet", "case-matching"],
        learningObjective: "Match capital and small letters",
        seed: i + 90,
      });
    }
    qs.push(q);
  }
  return qs.slice(0, 30);
}

function generateRhymingWords() {
  const families = [
    ["cat", "hat", "bat", "mat", "sat"],
    ["dog", "log", "fog", "jog", "bog"],
    ["sun", "fun", "run", "bun", "gun"],
    ["hen", "pen", "ten", "den", "men"],
    ["pig", "big", "wig", "dig", "fig"],
    ["car", "star", "far", "jar", "bar"],
    ["cake", "lake", "rake", "make", "bake"],
    ["ball", "tall", "wall", "call", "fall"],
    ["frog", "log", "dog", "jog", "bog"],
    ["king", "ring", "sing", "wing", "ring"],
  ];
  const allWords = families.flat();
  const qs = [];
  let n = 1;
  let count = 0;
  outer: for (let f = 0; f < families.length; f++) {
    const family = families[f];
    for (let w = 0; w < family.length; w++) {
      if (count >= 30) break outer;
      const word = family[w];
      const correct = family[(w + 1) % family.length];
      const otherWords = allWords.filter((x) => !family.includes(x));
      const distractors = [
        otherWords[(f * 3 + w) % otherWords.length],
        otherWords[(f * 3 + w + 5) % otherWords.length],
        otherWords[(f * 3 + w + 9) % otherWords.length],
      ];
      qs.push(
        makeMcq({
          id: `eng-rhyme-${pad(n++)}`,
          subjectId: "english",
          topicId: "rhyming-words",
          question: `Which word rhymes with '${word}'?`,
          correctText: correct,
          distractors,
          explanation: `'${correct}' rhymes with '${word}' — they both end with the same sound.`,
          difficulty: tier(count, 30),
          tags: ["rhyming-words"],
          learningObjective: "Identify rhyming word pairs",
          seed: count + 1,
        })
      );
      count++;
    }
  }
  return qs;
}

function generateVocabulary() {
  const words = [
    ["happy", "feeling joyful and glad"],
    ["huge", "very big in size"],
    ["tiny", "very small in size"],
    ["quick", "moving very fast"],
    ["shiny", "giving off a bright light"],
    ["brave", "not afraid to do hard things"],
    ["gentle", "soft and kind"],
    ["loud", "making a big sound"],
    ["quiet", "making very little sound"],
    ["clever", "able to think and learn quickly"],
    ["messy", "not neat or tidy"],
    ["neat", "clean and tidy"],
    ["kind", "friendly and caring towards others"],
    ["lazy", "not wanting to work or move"],
    ["active", "full of energy and movement"],
    ["curious", "eager to learn or know new things"],
    ["polite", "having good manners"],
    ["honest", "always telling the truth"],
    ["careful", "paying close attention to avoid mistakes"],
    ["cheerful", "happy and full of good spirits"],
    ["friendly", "kind and pleasant to others"],
    ["patient", "able to wait calmly"],
    ["strong", "having a lot of physical power"],
    ["weak", "having very little power or strength"],
    ["fresh", "newly made or grown, not old"],
    ["stale", "no longer fresh"],
    ["bright", "full of light or very colorful"],
    ["dull", "not bright or interesting"],
    ["soft", "not hard, easy to press or bend"],
    ["hard", "firm and not easy to bend or break"],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < words.length && i < 30; i++) {
    const [word, meaning] = words[i];
    const distractorPool = words.filter((_, idx) => idx !== i).map((w) => w[1]);
    const distractors = [
      distractorPool[(i * 2) % distractorPool.length],
      distractorPool[(i * 2 + 7) % distractorPool.length],
      distractorPool[(i * 2 + 13) % distractorPool.length],
    ];
    qs.push(
      makeMcq({
        id: `eng-vocab-${pad(n++)}`,
        subjectId: "english",
        topicId: "vocabulary",
        question: `What does the word '${word}' mean?`,
        correctText: meaning,
        distractors,
        explanation: `'${word}' means: ${meaning}.`,
        difficulty: tier(i, 30),
        tags: ["vocabulary", "word-meaning"],
        learningObjective: "Understand simple word meanings",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateOpposites() {
  const pairs = [
    ["hot", "cold"],
    ["big", "small"],
    ["fast", "slow"],
    ["up", "down"],
    ["day", "night"],
    ["happy", "sad"],
    ["open", "closed"],
    ["full", "empty"],
    ["heavy", "light"],
    ["long", "short"],
    ["tall", "short"],
    ["wet", "dry"],
    ["old", "new"],
    ["clean", "dirty"],
    ["easy", "difficult"],
    ["near", "far"],
    ["in", "out"],
    ["true", "false"],
    ["win", "lose"],
    ["begin", "end"],
    ["young", "old"],
    ["thick", "thin"],
    ["hard", "soft"],
    ["loud", "quiet"],
    ["awake", "asleep"],
    ["push", "pull"],
    ["front", "back"],
    ["left", "right"],
    ["over", "under"],
    ["rich", "poor"],
  ];
  const allWords = pairs.flat();
  const qs = [];
  let n = 1;
  for (let i = 0; i < pairs.length && i < 30; i++) {
    const [word, opposite] = pairs[i];
    const distractorPool = allWords.filter((w) => w !== word && w !== opposite);
    const distractors = [
      distractorPool[(i * 3) % distractorPool.length],
      distractorPool[(i * 3 + 5) % distractorPool.length],
      distractorPool[(i * 3 + 11) % distractorPool.length],
    ];
    qs.push(
      makeMcq({
        id: `eng-opp-${pad(n++)}`,
        subjectId: "english",
        topicId: "opposites",
        question: `What is the opposite of '${word}'?`,
        correctText: opposite,
        distractors,
        explanation: `'${opposite}' is the opposite of '${word}'.`,
        difficulty: tier(i, 30),
        tags: ["opposites"],
        learningObjective: "Identify opposite word pairs",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateGrammarBasics() {
  const qs = [];
  let n = 1;

  const plurals = [
    ["cat", "cats"], ["dog", "dogs"], ["book", "books"], ["ball", "balls"], ["toy", "toys"],
    ["box", "boxes"], ["child", "children"], ["man", "men"], ["mouse", "mice"], ["tooth", "teeth"],
  ];
  for (let i = 0; i < plurals.length; i++) {
    const [singular, plural] = plurals[i];
    qs.push(
      makeMcq({
        id: `eng-grammar-${pad(n++)}`,
        subjectId: "english",
        topicId: "grammar-basics",
        question: `What is the plural (many) form of '${singular}'?`,
        correctText: plural,
        distractors: [singular + "s", singular + "es", plurals[(i + 1) % plurals.length][1]].filter((d) => d !== plural).slice(0, 3),
        explanation: `The plural of '${singular}' is '${plural}'.`,
        difficulty: tier(i, plurals.length),
        tags: ["grammar", "one-and-many"],
        learningObjective: "Form the plural of common nouns",
        seed: i + 1,
      })
    );
  }

  const namingWords = ["dog", "school", "apple", "teacher", "river", "chair", "flower", "city"];
  const actionWords = ["run", "jump", "eat", "sing", "sleep", "write", "swim", "laugh"];
  for (let i = 0; i < namingWords.length; i++) {
    qs.push(
      makeMcq({
        id: `eng-grammar-${pad(n++)}`,
        subjectId: "english",
        topicId: "grammar-basics",
        question: `Which of these is a naming word (noun)?`,
        correctText: namingWords[i],
        distractors: [actionWords[i], actionWords[(i + 1) % actionWords.length], actionWords[(i + 2) % actionWords.length]],
        explanation: `'${namingWords[i]}' names a person, place, or thing, so it is a naming word.`,
        difficulty: tier(i, namingWords.length),
        tags: ["grammar", "nouns"],
        learningObjective: "Identify naming words (nouns)",
        seed: i + 20,
      })
    );
  }
  for (let i = 0; i < actionWords.length; i++) {
    qs.push(
      makeMcq({
        id: `eng-grammar-${pad(n++)}`,
        subjectId: "english",
        topicId: "grammar-basics",
        question: `Which of these is an action word (verb)?`,
        correctText: actionWords[i],
        distractors: [namingWords[i], namingWords[(i + 1) % namingWords.length], namingWords[(i + 2) % namingWords.length]],
        explanation: `'${actionWords[i]}' tells us what someone is doing, so it is an action word.`,
        difficulty: tier(i, actionWords.length),
        tags: ["grammar", "verbs"],
        learningObjective: "Identify action words (verbs)",
        seed: i + 40,
      })
    );
  }

  const articleWords = ["apple", "umbrella", "elephant", "orange", "igloo", "ant", "egg", "owl"];
  for (let i = 0; i < articleWords.length; i++) {
    qs.push(
      makeMcq({
        id: `eng-grammar-${pad(n++)}`,
        subjectId: "english",
        topicId: "grammar-basics",
        question: `Which article goes before '${articleWords[i]}': 'a' or 'an'?`,
        correctText: "an",
        distractors: ["a"],
        explanation: `We use 'an' before words that start with a vowel sound, like '${articleWords[i]}'.`,
        difficulty: "medium",
        questionType: "true-false",
        tags: ["grammar", "articles"],
        learningObjective: "Use 'a' and 'an' correctly",
        seed: i + 60,
      })
    );
  }
  const aWords = ["dog", "cat", "table", "ball", "house"];
  for (let i = 0; i < aWords.length; i++) {
    qs.push(
      makeMcq({
        id: `eng-grammar-${pad(n++)}`,
        subjectId: "english",
        topicId: "grammar-basics",
        question: `Which article goes before '${aWords[i]}': 'a' or 'an'?`,
        correctText: "a",
        distractors: ["an"],
        explanation: `We use 'a' before words that start with a consonant sound, like '${aWords[i]}'.`,
        difficulty: "medium",
        questionType: "true-false",
        tags: ["grammar", "articles"],
        learningObjective: "Use 'a' and 'an' correctly",
        seed: i + 70,
      })
    );
  }

  const prepositions = [
    ["The cat is ___ the box.", "in", ["on top", "under", "beside"]],
    ["The book is ___ the table.", "on", ["in", "under", "beside"]],
    ["The ball rolled ___ the bed.", "under", ["on", "in", "above"]],
    ["The bird flew ___ the tree.", "over", ["under", "beside", "into"]],
    ["Sit ___ your friend.", "beside", ["over", "under", "into"]],
  ];
  for (let i = 0; i < prepositions.length; i++) {
    const [question, correct, distractors] = prepositions[i];
    qs.push(
      makeMcq({
        id: `eng-grammar-${pad(n++)}`,
        subjectId: "english",
        topicId: "grammar-basics",
        question,
        correctText: correct,
        distractors,
        explanation: `'${correct}' correctly completes the sentence.`,
        difficulty: "hard",
        tags: ["grammar", "prepositions"],
        learningObjective: "Use prepositions correctly",
        seed: i + 80,
      })
    );
  }

  return qs;
}

function generateHomonyms() {
  const pairs = [
    ["bat (flying animal)", "bat (used to hit a ball)"],
    ["bark (sound a dog makes)", "bark (the outer covering of a tree)"],
    ["bear (the animal)", "bare (without covering)"],
    ["right (correct)", "write (to put words on paper)"],
    ["sea (the ocean)", "see (to look with your eyes)"],
    ["son (a boy child)", "sun (the star in our sky)"],
    ["flower (a bloom)", "flour (used to make bread)"],
    ["eye (part of the body)", "I (used for yourself)"],
    ["hair (on your head)", "hare (a fast animal like a rabbit)"],
    ["knight (a warrior)", "night (when it is dark)"],
    ["ate (past of eat)", "eight (the number 8)"],
    ["blue (a colour)", "blew (past of blow)"],
    ["pair (a set of two)", "pear (a fruit)"],
    ["road (a street)", "rode (past of ride)"],
    ["tail (of an animal)", "tale (a story)"],
    ["week (7 days)", "weak (not strong)"],
    ["wood (from a tree)", "would (used for a wish)"],
    ["meat (food from animals)", "meet (to see someone)"],
    ["horse (the animal)", "hoarse (a rough voice)"],
    ["mail (letters)", "male (a boy or man)"],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < pairs.length; i++) {
    const [a, b] = pairs[i];
    const wordA = a.split(" (")[0];
    const wordB = b.split(" (")[0];
    const meaningA = a.split(" (")[1].replace(")", "");
    qs.push(
      makeMcq({
        id: `eng-homonym-${pad(n++)}`,
        subjectId: "english",
        topicId: "homonyms",
        question: `'${wordA}' and '${wordB}' sound the same. Which one means "${meaningA}"?`,
        correctText: wordA,
        distractors: [wordB],
        explanation: `'${wordA}' means ${meaningA}, even though it sounds like '${wordB}'.`,
        difficulty: tier(i, pairs.length),
        questionType: "true-false",
        tags: ["homonyms"],
        learningObjective: "Distinguish between words that sound alike",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateSentenceRearrangement() {
  const sentences = [
    ["I", "am", "happy"],
    ["The", "cat", "is", "sleeping"],
    ["She", "likes", "ice cream"],
    ["We", "go", "to school"],
    ["The", "sun", "is", "bright"],
    ["He", "has", "a red ball"],
    ["Birds", "can", "fly"],
    ["I", "like", "my school"],
    ["The", "dog", "is", "barking"],
    ["Mom", "made", "a cake"],
    ["The", "boy", "is", "running"],
    ["Fish", "live", "in water"],
    ["I", "have", "two hands"],
    ["The", "flower", "smells", "nice"],
    ["We", "play", "in the park"],
    ["The", "moon", "shines", "at night"],
    ["My", "friend", "is", "kind"],
    ["The", "baby", "is", "sleeping"],
    ["I", "drink", "milk"],
    ["The", "teacher", "is", "kind"],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < sentences.length; i++) {
    const words = sentences[i];
    const correct = words.join(" ");
    const shuffledWrong1 = [...words].reverse().join(" ");
    const shuffledWrong2 = words.length > 2 ? [words[1], words[0], ...words.slice(2)].join(" ") : correct + "!";
    qs.push(
      makeMcq({
        id: `eng-rearrange-${pad(n++)}`,
        subjectId: "english",
        topicId: "sentence-rearrangement",
        question: `Put these words in the correct order: "${[...words].sort(() => 0).reverse().join(" / ")}"`,
        correctText: correct,
        distractors: [shuffledWrong1, shuffledWrong2].filter((d) => d !== correct),
        explanation: `The correct sentence is: "${correct}".`,
        difficulty: tier(i, sentences.length),
        tags: ["sentence-rearrangement"],
        learningObjective: "Arrange jumbled words into a meaningful sentence",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateComprehension() {
  const passages = [
    {
      text: "Riya has a small dog named Tom. Tom is white and loves to play with a ball.",
      question: "What is the name of Riya's dog?",
      correct: "Tom",
      distractors: ["Riya", "Ball", "White"],
    },
    {
      text: "Riya has a small dog named Tom. Tom is white and loves to play with a ball.",
      question: "What colour is Tom?",
      correct: "White",
      distractors: ["Black", "Brown", "Pink"],
    },
    {
      text: "Aarav went to the park with his mother. He played on the swing and ate an ice cream.",
      question: "Who did Aarav go to the park with?",
      correct: "His mother",
      distractors: ["His father", "His friend", "His teacher"],
    },
    {
      text: "Aarav went to the park with his mother. He played on the swing and ate an ice cream.",
      question: "What did Aarav eat at the park?",
      correct: "Ice cream",
      distractors: ["Cake", "Fruit", "Bread"],
    },
    {
      text: "The little bird built a nest in the tall tree. She laid three tiny eggs in the nest.",
      question: "Where did the bird build her nest?",
      correct: "In the tall tree",
      distractors: ["On the ground", "In the water", "On a car"],
    },
    {
      text: "The little bird built a nest in the tall tree. She laid three tiny eggs in the nest.",
      question: "How many eggs did the bird lay?",
      correct: "Three",
      distractors: ["Two", "Four", "Five"],
    },
    {
      text: "Meera loves flowers. Every morning she waters the red roses in her garden.",
      question: "What colour are the roses in Meera's garden?",
      correct: "Red",
      distractors: ["Yellow", "Blue", "White"],
    },
    {
      text: "Meera loves flowers. Every morning she waters the red roses in her garden.",
      question: "When does Meera water the roses?",
      correct: "Every morning",
      distractors: ["Every night", "Once a year", "Never"],
    },
    {
      text: "Kabir has a red bicycle. He rides it to school every day with his best friend.",
      question: "What colour is Kabir's bicycle?",
      correct: "Red",
      distractors: ["Blue", "Green", "Black"],
    },
    {
      text: "Kabir has a red bicycle. He rides it to school every day with his best friend.",
      question: "Who does Kabir ride his bicycle with?",
      correct: "His best friend",
      distractors: ["His teacher", "His dog", "No one"],
    },
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < passages.length; i++) {
    const p = passages[i];
    qs.push(
      makeMcq({
        id: `eng-comprehension-${pad(n++)}`,
        subjectId: "english",
        topicId: "comprehension",
        question: `Read: "${p.text}" — ${p.question}`,
        correctText: p.correct,
        distractors: p.distractors,
        explanation: `The passage says: "${p.text}"`,
        difficulty: tier(i, passages.length),
        tags: ["comprehension"],
        learningObjective: "Answer simple questions about a short passage",
        estimatedTimeSeconds: 45,
        seed: i + 1,
      })
    );
  }
  return qs;
}

// ---------------------------------------------------------------------------
// EVS
// ---------------------------------------------------------------------------

function generateLivingThings() {
  const items = [
    ["dog", "living"], ["cat", "living"], ["tree", "living"], ["flower", "living"],
    ["bird", "living"], ["fish", "living"], ["butterfly", "living"], ["ant", "living"],
    ["rabbit", "living"], ["elephant", "living"], ["grass", "living"], ["frog", "living"],
    ["stone", "non-living"], ["chair", "non-living"], ["book", "non-living"], ["car", "non-living"],
    ["pencil", "non-living"], ["table", "non-living"], ["cloud", "non-living"], ["mountain", "non-living"],
    ["ball", "non-living"], ["cup", "non-living"], ["shoe", "non-living"], ["bicycle", "non-living"],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < items.length; i++) {
    const [name, answer] = items[i];
    qs.push(
      makeMcq({
        id: `evs-living-${pad(n++)}`,
        subjectId: "evs",
        topicId: "living-things",
        question: `Is a '${name}' living or non-living?`,
        correctText: answer === "living" ? "Living" : "Non-living",
        distractors: [answer === "living" ? "Non-living" : "Living"],
        explanation: `A '${name}' is ${answer}.`,
        difficulty: tier(i, items.length),
        questionType: "true-false",
        tags: ["living-things", "classification"],
        learningObjective: "Classify things as living or non-living",
        seed: i + 1,
      })
    );
  }
  const needs = [
    ["Which of these do living things need to survive?", "Food, water and air", ["Only toys", "Only sunlight", "Nothing at all"]],
    ["What do plants need to grow well?", "Sunlight, water and air", ["Only darkness", "Only sand", "Only noise"]],
    ["Why do animals need food?", "To get energy to grow and move", ["To make toys", "To make noise", "To change color"]],
    ["What do fish need to breathe underwater?", "Their gills to take in oxygen from water", ["Their tail", "Their eyes", "Their fins only"]],
    ["Which is a sign that something is living?", "It can grow and reproduce", ["It never changes", "It is made of metal", "It cannot move at all"]],
    ["Why do we water plants?", "So they get water to grow", ["To make them heavier", "To change their color", "To make them noisy"]],
  ];
  for (let i = 0; i < needs.length; i++) {
    const [question, correct, distractors] = needs[i];
    qs.push(
      makeMcq({
        id: `evs-living-${pad(n++)}`,
        subjectId: "evs",
        topicId: "living-things",
        question,
        correctText: correct,
        distractors,
        explanation: correct,
        difficulty: tier(items.length + i, items.length + needs.length),
        tags: ["living-things", "needs"],
        learningObjective: "Understand basic needs of living things",
        seed: i + 50,
      })
    );
  }
  return qs;
}

function generateMyBody() {
  const parts = [
    ["eyes", "see"], ["ears", "hear"], ["nose", "smell"], ["mouth", "eat and talk"],
    ["hands", "hold and touch things"], ["legs", "walk and run"], ["teeth", "chew food"],
    ["skin", "feel touch and protect the body"], ["brain", "think and learn"],
    ["heart", "pump blood around the body"], ["lungs", "breathe air"], ["tongue", "taste food"],
    ["hair", "protect the head"], ["nails", "protect fingers and toes"],
    ["stomach", "digest food"], ["bones", "support the body"], ["muscles", "move the body"],
    ["elbow", "bend the arm"], ["knee", "bend the leg"], ["fingers", "grip and pick up things"],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < parts.length; i++) {
    const [part, fn] = parts[i];
    const distractorParts = parts.filter((_, idx) => idx !== i).map((p) => p[0]);
    qs.push(
      makeMcq({
        id: `evs-body-${pad(n++)}`,
        subjectId: "evs",
        topicId: "my-body",
        question: `Which body part do we use to ${fn}?`,
        correctText: part,
        distractors: [
          distractorParts[(i * 2) % distractorParts.length],
          distractorParts[(i * 2 + 3) % distractorParts.length],
          distractorParts[(i * 2 + 7) % distractorParts.length],
        ],
        explanation: `We use our ${part} to ${fn}.`,
        difficulty: tier(i, parts.length),
        tags: ["my-body", "body-parts"],
        learningObjective: "Match body parts to their functions",
        seed: i + 1,
      })
    );
  }
  for (let i = 0; i < 10 && i < parts.length; i++) {
    const [part, fn] = parts[i];
    const distractorFns = parts.filter((_, idx) => idx !== i).map((p) => p[1]);
    qs.push(
      makeMcq({
        id: `evs-body-${pad(n++)}`,
        subjectId: "evs",
        topicId: "my-body",
        question: `What do we use our ${part} for?`,
        correctText: fn,
        distractors: [
          distractorFns[(i * 3) % distractorFns.length],
          distractorFns[(i * 3 + 4) % distractorFns.length],
          distractorFns[(i * 3 + 8) % distractorFns.length],
        ],
        explanation: `We use our ${part} to ${fn}.`,
        difficulty: tier(parts.length + i, parts.length + 10),
        tags: ["my-body", "body-parts"],
        learningObjective: "Match body parts to their functions",
        seed: i + 40,
      })
    );
  }
  return qs.slice(0, 30);
}

function generateGoodHabits() {
  const scenarios = [
    ["What should you do before eating food?", "Wash your hands", ["Play outside", "Watch TV", "Shout loudly"]],
    ["What should you do after using the toilet?", "Wash your hands with soap", ["Eat a snack", "Run around", "Do nothing"]],
    ["When should you brush your teeth?", "Morning and night", ["Only on Sundays", "Never", "Once a year"]],
    ["What should you do before crossing the road?", "Look both ways", ["Run quickly", "Close your eyes", "Jump"]],
    ["What should you do if you see a stranger offering candy?", "Say no and tell an adult", ["Take the candy", "Go with them", "Say nothing"]],
    ["Why should you cover your mouth when you cough?", "To stop germs from spreading", ["To look funny", "To make noise", "It is not needed"]],
    ["What should you do with your toys after playing?", "Put them back neatly", ["Leave them anywhere", "Throw them away", "Hide them"]],
    ["How should you talk to your friends?", "Kindly and politely", ["Rudely", "By shouting", "By ignoring them"]],
    ["What should you do before sleeping?", "Brush your teeth and wash your face", ["Eat lots of sweets", "Watch TV all night", "Skip washing up"]],
    ["What should you say when someone helps you?", "Thank you", ["Nothing", "Go away", "Be quiet"]],
    ["What should you do when you make a mistake?", "Say sorry and try to fix it", ["Blame someone else", "Hide it", "Ignore it"]],
    ["Why should we eat fruits and vegetables?", "To stay healthy and strong", ["To make a mess", "They taste bad", "There is no reason"]],
    ["What should you do before you enter someone's room?", "Knock and ask permission", ["Barge in", "Shout loudly", "Peek quietly"]],
    ["What should you do with waste paper?", "Throw it in the dustbin", ["Throw it on the floor", "Leave it on the desk", "Hide it under the bed"]],
    ["How should you sit while studying?", "Sit up straight at a table", ["Lie down", "Stand on one leg", "Sit in the dark"]],
    ["What should you do if you spill water?", "Clean it up right away", ["Leave it there", "Walk away", "Splash more water"]],
    ["Why should you sleep on time?", "So your body can rest and grow well", ["To miss school", "It doesn't matter", "To stay tired"]],
    ["What should you do before going out in the sun?", "Wear a hat or use sunscreen", ["Run around bare-headed for hours", "Nothing at all", "Cover your eyes only"]],
    ["What should you do when the teacher is talking?", "Listen quietly", ["Talk to friends", "Play with toys", "Shout"]],
    ["How should you treat animals?", "Gently and with care", ["Roughly", "By hurting them", "By ignoring them"]],
    ["What should you do with sharp objects like scissors?", "Handle them carefully with adult help", ["Play with them alone", "Throw them around", "Put them in your mouth"]],
    ["What should you do before drinking water outside?", "Make sure it is clean or boiled", ["Drink any water without checking", "Avoid water completely", "Add mud to it"]],
    ["Why should you wear a helmet while cycling?", "To protect your head from injury", ["To look stylish", "It is not important", "To make noise"]],
    ["What should you do if a fire alarm rings?", "Walk calmly to the exit", ["Hide under the desk", "Ignore it", "Run and push others"]],
    ["What should you do with your school bag?", "Keep it organised and pack it the night before", ["Leave everything scattered", "Forget your books", "Throw it around"]],
    ["What should you do when you feel sick?", "Tell an adult right away", ["Keep quiet about it", "Play outside anyway", "Ignore it"]],
    ["What should you do before switching on electrical switches?", "Make sure your hands are dry", ["Touch them with wet hands", "Ignore safety", "Poke them with metal"]],
    ["Why do we take a bath every day?", "To keep our body clean and healthy", ["It is not necessary", "To waste water", "To get wet only"]],
    ["What should you do at the dinner table?", "Eat neatly and use good manners", ["Throw food", "Talk with a full mouth", "Grab food from others"]],
    ["What should you do when you borrow something?", "Return it on time and in good condition", ["Keep it forever", "Break it", "Never return it"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < scenarios.length; i++) {
    const [question, correct, distractors] = scenarios[i];
    qs.push(
      makeMcq({
        id: `evs-habits-${pad(n++)}`,
        subjectId: "evs",
        topicId: "good-habits",
        question,
        correctText: correct,
        distractors,
        explanation: correct,
        difficulty: tier(i, scenarios.length),
        tags: ["good-habits"],
        learningObjective: "Recognise good habits in everyday situations",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generatePlantsAroundUs() {
  const facts = [
    ["Which part of the plant is usually underground?", "Root", ["Leaf", "Flower", "Stem"]],
    ["Which part of the plant makes food using sunlight?", "Leaf", ["Root", "Flower", "Seed"]],
    ["Which part of the plant grows into a new plant?", "Seed", ["Stem", "Leaf", "Petal"]],
    ["Which part of the plant supports it and carries water?", "Stem", ["Root", "Flower", "Fruit"]],
    ["Which part of the plant later turns into a fruit?", "Flower", ["Root", "Stem", "Bark"]],
    ["What do plants need to make their own food?", "Sunlight, water and air", ["Only soil", "Only darkness", "Only sand"]],
    ["Which of these is a tree?", "Mango", ["Rose", "Grass", "Tulip"]],
    ["Which of these is a small plant, not a tree?", "Rose", ["Mango tree", "Coconut tree", "Banyan tree"]],
    ["What do we call plants grown for food?", "Crops", ["Weeds", "Wild plants", "Rocks"]],
    ["Which part of a plant do we eat when we eat a carrot?", "Root", ["Leaf", "Flower", "Stem"]],
    ["Which part of a plant do we eat when we eat spinach?", "Leaf", ["Root", "Flower", "Seed"]],
    ["What is the green colouring in leaves called?", "Chlorophyll", ["Chloroform", "Cellulose", "Carbon"]],
    ["Which of these grows from a seed?", "A new plant", ["A rock", "A cloud", "A car"]],
    ["Which of these plants has thorns?", "Rose", ["Grass", "Mango leaf", "Banana leaf"]],
    ["What do we call very tiny plants that grow without seeds, like moss?", "Moss", ["Trees", "Crops", "Flowers"]],
    ["Which of these is a climbing plant?", "Money plant", ["Mango tree", "Coconut tree", "Banyan tree"]],
    ["Why are plants important for us?", "They give us food, oxygen and shade", ["They make noise", "They make it dark", "They have no use"]],
    ["Which of these is a water plant?", "Lotus", ["Cactus", "Mango tree", "Rose"]],
    ["Which of these is a desert plant?", "Cactus", ["Lotus", "Water lily", "Fern"]],
    ["What do we call the process of growing plants?", "Farming", ["Fishing", "Cooking", "Painting"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `evs-plants-${pad(n++)}`,
        subjectId: "evs",
        topicId: "plants-around-us",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["plants"],
        learningObjective: "Learn about parts and types of plants",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateAnimalsAroundUs() {
  const facts = [
    ["Where does a fish live?", "In water", ["On land", "In the sky", "In a tree"]],
    ["Where does a bird build its home?", "In a nest", ["In a burrow", "In water", "In a cave"]],
    ["What is a baby dog called?", "Puppy", ["Kitten", "Calf", "Cub"]],
    ["What is a baby cat called?", "Kitten", ["Puppy", "Calf", "Cub"]],
    ["What is a baby cow called?", "Calf", ["Puppy", "Kitten", "Foal"]],
    ["What sound does a cow make?", "Moo", ["Woof", "Meow", "Quack"]],
    ["What sound does a dog make?", "Woof", ["Moo", "Meow", "Quack"]],
    ["What sound does a duck make?", "Quack", ["Moo", "Woof", "Roar"]],
    ["Which animal is known as man's best friend?", "Dog", ["Cat", "Lion", "Snake"]],
    ["Which animal has a long trunk?", "Elephant", ["Lion", "Tiger", "Deer"]],
    ["Which animal has a long neck to reach tall trees?", "Giraffe", ["Elephant", "Lion", "Zebra"]],
    ["Which animal lives in a burrow underground?", "Rabbit", ["Fish", "Bird", "Cow"]],
    ["Which animal can fly?", "Bird", ["Fish", "Cow", "Dog"]],
    ["Which animal gives us milk?", "Cow", ["Cat", "Lion", "Snake"]],
    ["Which animal is called the King of the Jungle?", "Lion", ["Elephant", "Deer", "Rabbit"]],
    ["Which animal has stripes on its body?", "Zebra", ["Elephant", "Cow", "Dog"]],
    ["Which animal lives both on land and in water?", "Frog", ["Cow", "Dog", "Cat"]],
    ["Which animal has a hard shell on its back?", "Tortoise", ["Rabbit", "Dog", "Cat"]],
    ["Which of these is a farm animal?", "Cow", ["Lion", "Tiger", "Zebra"]],
    ["Which of these is a wild animal?", "Tiger", ["Cow", "Dog", "Cat"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `evs-animals-${pad(n++)}`,
        subjectId: "evs",
        topicId: "animals-around-us",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["animals"],
        learningObjective: "Learn about common animals, their homes and sounds",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateOurNeeds() {
  const facts = [
    ["Which of these is a basic need of every person?", "Food", ["Toys", "Television", "Games"]],
    ["Why do we need water?", "To drink and stay healthy", ["To play games", "To watch TV", "It has no use"]],
    ["Why do we need a house?", "For shelter and safety", ["To play games", "To watch TV", "It has no use"]],
    ["Why do we wear clothes?", "To protect our body and stay warm", ["To make noise", "To play games", "It has no use"]],
    ["Which of these do we need to breathe?", "Air", ["Toys", "Television", "Money"]],
    ["Which meal should you never skip for good health?", "Breakfast", ["Dessert", "Snacks only", "No meals"]],
    ["What do we call food, water, shelter and clothing together?", "Basic needs", ["Wants", "Toys", "Games"]],
    ["Why do farmers grow crops?", "To give us food", ["To make noise", "To play games", "It has no use"]],
    ["What keeps us warm in winter?", "Warm clothes", ["Cold water", "Ice", "Fans"]],
    ["Which of these keeps us healthy and strong?", "Nutritious food", ["Junk food only", "No food", "Only sweets"]],
    ["Why do we need sleep?", "To rest our body and mind", ["To waste time", "It has no use", "To make noise"]],
    ["Which of these is NOT a basic need?", "A video game", ["Food", "Water", "Shelter"]],
    ["Why do we need clean water to drink?", "To stay healthy and avoid sickness", ["To make it taste bad", "It has no use", "To waste it"]],
    ["What do plants need that people also need?", "Water", ["Toys", "Money", "Games"]],
    ["Which need protects us from rain, sun and cold?", "Shelter", ["Toys", "Television", "Games"]],
    ["Why should we not waste food?", "Because many people need food to live", ["It tastes bad", "It has no reason", "Food never runs out"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `evs-needs-${pad(n++)}`,
        subjectId: "evs",
        topicId: "our-needs",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["our-needs"],
        learningObjective: "Understand basic human needs",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateNeighbourhood() {
  const facts = [
    ["Who helps us when we are sick?", "Doctor", ["Farmer", "Postman", "Driver"]],
    ["Who teaches us in school?", "Teacher", ["Doctor", "Farmer", "Postman"]],
    ["Who delivers our letters and parcels?", "Postman", ["Doctor", "Teacher", "Farmer"]],
    ["Who helps put out fires?", "Firefighter", ["Postman", "Farmer", "Teacher"]],
    ["Who keeps us safe and controls traffic?", "Police officer", ["Farmer", "Postman", "Teacher"]],
    ["Where do we go to buy vegetables?", "Market", ["School", "Hospital", "Post office"]],
    ["Where do we go when we are sick?", "Hospital", ["Market", "School", "Playground"]],
    ["Where do we go to borrow books?", "Library", ["Hospital", "Market", "Petrol station"]],
    ["Where do children go to play games outdoors?", "Playground", ["Hospital", "Bank", "Post office"]],
    ["Where do we go to pray?", "A place of worship", ["A petrol station", "A market", "A parking lot"]],
    ["Who grows the food we eat?", "Farmer", ["Postman", "Doctor", "Driver"]],
    ["Where do we keep our money safely?", "Bank", ["Market", "Playground", "Library"]],
    ["Who drives the bus to take us places?", "Driver", ["Doctor", "Teacher", "Farmer"]],
    ["Where do we go to buy medicine?", "Pharmacy", ["Playground", "Library", "Bank"]],
    ["Who cuts our hair?", "Barber", ["Doctor", "Farmer", "Teacher"]],
    ["Where do trains stop to pick up passengers?", "Railway station", ["Library", "Bank", "Playground"]],
    ["Where do planes take off and land?", "Airport", ["Market", "Library", "Playground"]],
    ["Who helps us cross the road safely?", "Police officer", ["Farmer", "Postman", "Teacher"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `evs-neighbour-${pad(n++)}`,
        subjectId: "evs",
        topicId: "neighbourhood",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["neighbourhood", "community-helpers"],
        learningObjective: "Identify people who help us and public places",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateEarthAndSky() {
  const facts = [
    ["What gives us light during the day?", "The sun", ["The moon", "Stars", "Clouds"]],
    ["What do we see in the sky at night?", "The moon and stars", ["The sun", "Rainbows only", "Nothing"]],
    ["What falls from the clouds when it rains?", "Water (rain drops)", ["Sand", "Snow only", "Nothing"]],
    ["What do we call the white fluffy things in the sky?", "Clouds", ["Stars", "Planets", "Rockets"]],
    ["What is the name of the planet we live on?", "Earth", ["Moon", "Sun", "Mars"]],
    ["What appears in the sky after it rains, with many colours?", "A rainbow", ["A cloud", "A star", "The moon"]],
    ["What season is usually very hot?", "Summer", ["Winter", "Monsoon", "Autumn"]],
    ["What season has a lot of rain?", "Monsoon", ["Summer", "Winter", "Spring"]],
    ["What season is usually very cold?", "Winter", ["Summer", "Monsoon", "Autumn"]],
    ["What do we call strong wind with rain and thunder?", "A storm", ["A rainbow", "A sunrise", "A sunset"]],
    ["When does the sun rise?", "In the morning", ["At midnight", "In the evening only", "Never"]],
    ["When does the sun set?", "In the evening", ["At midnight", "In the morning", "Never"]],
    ["What do we call the shining objects we see in the night sky?", "Stars", ["Clouds", "Rainbows", "Rocks"]],
    ["What covers most of the Earth's surface?", "Water", ["Sand", "Ice only", "Rocks only"]],
    ["Which is closer to the Earth: the moon or the sun?", "The moon", ["The sun", "Both are the same distance", "Neither"]],
    ["What do we wear to protect ourselves from heavy rain?", "A raincoat", ["A swimsuit", "Sunglasses only", "Nothing"]],
    ["What do we use to protect ourselves from the hot sun?", "A hat or umbrella", ["A raincoat only", "A blanket", "Nothing"]],
    ["Which of these happens because the Earth spins?", "Day and night", ["Rain", "Wind", "Snow"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `evs-earthsky-${pad(n++)}`,
        subjectId: "evs",
        topicId: "earth-and-sky",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["earth-and-sky", "weather"],
        learningObjective: "Learn about the sun, moon, seasons and weather",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateTransport() {
  const facts = [
    ["Which of these travels on roads?", "Car", ["Boat", "Aeroplane", "Ship"]],
    ["Which of these travels on water?", "Boat", ["Car", "Aeroplane", "Bicycle"]],
    ["Which of these travels in the air?", "Aeroplane", ["Car", "Boat", "Bicycle"]],
    ["Which of these travels on railway tracks?", "Train", ["Car", "Boat", "Aeroplane"]],
    ["Which vehicle has two wheels and needs pedalling?", "Bicycle", ["Car", "Train", "Ship"]],
    ["Which vehicle is used to carry many passengers on roads?", "Bus", ["Boat", "Aeroplane", "Ship"]],
    ["Which of these is the fastest way to travel long distances?", "Aeroplane", ["Bicycle", "Bullock cart", "Walking"]],
    ["Which vehicle is pulled by animals?", "Bullock cart", ["Car", "Aeroplane", "Ship"]],
    ["Which of these is a water transport used for cargo?", "Ship", ["Car", "Bicycle", "Aeroplane"]],
    ["Where do we wait to catch a train?", "Railway station", ["Airport", "Bus stop", "Harbour"]],
    ["Where do we wait to catch a bus?", "Bus stop", ["Airport", "Railway station", "Harbour"]],
    ["Where do aeroplanes take off and land?", "Airport", ["Bus stop", "Railway station", "Harbour"]],
    ["What do we call transport that does not use fuel, like walking or cycling?", "Non-motorised transport", ["Air transport", "Water transport", "Space transport"]],
    ["Which of these helps people travel underground in big cities?", "Metro train", ["Boat", "Bicycle", "Aeroplane"]],
    ["Which safety gear should you wear while riding a bicycle?", "Helmet", ["Sunglasses", "Gloves only", "Nothing"]],
    ["Which of these can travel both on roads, only with fuel?", "Motorbike", ["Bicycle", "Boat", "Aeroplane"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `evs-transport-${pad(n++)}`,
        subjectId: "evs",
        topicId: "transport",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["transport"],
        learningObjective: "Identify modes of transport by land, water and air",
        seed: i + 1,
      })
    );
  }
  return qs;
}

// ---------------------------------------------------------------------------
// GK
// ---------------------------------------------------------------------------

function generateMySurroundings() {
  const facts = [
    ["Who are the people who take care of you at home?", "Family", ["Strangers", "Shopkeepers", "No one"]],
    ["What do we call people who live near our house?", "Neighbours", ["Strangers", "Tourists", "Guests"]],
    ["What should you do when you meet elders?", "Greet them respectfully", ["Ignore them", "Run away", "Shout at them"]],
    ["What is the name of the place where you learn every day?", "School", ["Hospital", "Market", "Airport"]],
    ["Who are the people you play and study with at school?", "Friends", ["Strangers", "Enemies", "No one"]],
    ["What should you say when you meet someone in the morning?", "Good morning", ["Good night", "Goodbye", "Nothing"]],
    ["What is the name of the country you live in called?", "Nation", ["Planet", "Galaxy", "Ocean"]],
    ["Who is the head of your family who takes care of everyone?", "Parents", ["Strangers", "Postman", "Teacher"]],
    ["What should you do if you get lost in a crowd?", "Stay calm and find a trusted adult", ["Run around alone", "Hide and cry", "Talk to strangers"]],
    ["What do we call the place where we live, eat and sleep?", "Home", ["School", "Market", "Playground"]],
    ["What is your mother's mother called?", "Grandmother", ["Aunt", "Sister", "Cousin"]],
    ["What is your father's father called?", "Grandfather", ["Uncle", "Brother", "Cousin"]],
    ["What is your father's brother called?", "Uncle", ["Grandfather", "Cousin", "Nephew"]],
    ["What is your parent's daughter, other than you, called?", "Sister", ["Aunt", "Grandmother", "Niece"]],
    ["What should you always remember and tell someone if needed?", "Your home address", ["Your favourite toy", "Your favourite food", "Nothing"]],
    ["Who keeps our home clean and takes care of us daily?", "Family members", ["Strangers", "Tourists", "No one"]],
    ["What is a group of people related to each other called?", "Family", ["Team", "Class", "Crowd"]],
    ["Which number should you remember to call in an emergency?", "Emergency helpline number", ["Your friend's toy number", "A random number", "No number"]],
    ["What should you do when your friend is sad?", "Comfort and help them", ["Laugh at them", "Ignore them", "Walk away"]],
    ["What is the name for the place of worship in your area?", "A temple, church, or mosque", ["A market", "A playground", "A bank"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `gk-surround-${pad(n++)}`,
        subjectId: "gk",
        topicId: "my-surroundings",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["my-surroundings", "family"],
        learningObjective: "Understand family, friends and surroundings",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generatePlantsAndAnimalsGK() {
  const facts = [
    ["Which of these is a fruit?", "Mango", ["Carrot", "Potato", "Onion"]],
    ["Which of these is a vegetable?", "Carrot", ["Mango", "Apple", "Banana"]],
    ["Which animal is known as the national animal of India?", "Tiger", ["Lion", "Elephant", "Peacock"]],
    ["Which bird is known as the national bird of India?", "Peacock", ["Sparrow", "Crow", "Eagle"]],
    ["Which of these animals can swim very well?", "Fish", ["Cat", "Dog", "Rabbit"]],
    ["Which of these animals lives in cold, icy places?", "Polar bear", ["Camel", "Lion", "Cow"]],
    ["Which animal is famous for its long neck?", "Giraffe", ["Elephant", "Zebra", "Tiger"]],
    ["Which animal can change its skin colour to hide?", "Chameleon", ["Dog", "Cat", "Cow"]],
    ["Which of these is the tallest animal on land?", "Giraffe", ["Elephant", "Horse", "Camel"]],
    ["Which of these is the largest animal on land?", "Elephant", ["Giraffe", "Horse", "Deer"]],
    ["Which insect makes honey?", "Bee", ["Ant", "Fly", "Spider"]],
    ["Which animal is known for being very slow?", "Tortoise", ["Cheetah", "Rabbit", "Horse"]],
    ["Which animal is known for being very fast?", "Cheetah", ["Tortoise", "Snail", "Elephant"]],
    ["Which of these fruits is yellow and curved?", "Banana", ["Apple", "Grapes", "Watermelon"]],
    ["Which of these vegetables is round and red?", "Tomato", ["Potato", "Onion", "Cabbage"]],
    ["Which animal has a hump on its back and lives in deserts?", "Camel", ["Cow", "Horse", "Goat"]],
    ["Which sea creature has eight arms?", "Octopus", ["Fish", "Crab", "Starfish"]],
    ["Which bird cannot fly but can run very fast?", "Ostrich", ["Sparrow", "Eagle", "Parrot"]],
    ["Which of these animals lays eggs?", "Hen", ["Cow", "Dog", "Cat"]],
    ["Which of these animals gives us wool?", "Sheep", ["Cow", "Dog", "Cat"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `gk-plantsanimals-${pad(n++)}`,
        subjectId: "gk",
        topicId: "plants-and-animals",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["plants-and-animals", "general-knowledge"],
        learningObjective: "General knowledge about plants and animals",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateIndiaAndWorld() {
  const facts = [
    ["What is the name of our country?", "India", ["China", "Japan", "Nepal"]],
    ["What are the colours of the Indian flag?", "Saffron, white and green", ["Red, white and blue", "Black and white", "Yellow and red"]],
    ["What is at the centre of the Indian flag?", "The Ashoka Chakra (a wheel)", ["A star", "A sun", "A flower"]],
    ["What is the capital city of India?", "New Delhi", ["Mumbai", "Chennai", "Kolkata"]],
    ["Which animal is the national animal of India?", "Tiger", ["Lion", "Elephant", "Deer"]],
    ["Which flower is the national flower of India?", "Lotus", ["Rose", "Sunflower", "Tulip"]],
    ["Which fruit is called the national fruit of India?", "Mango", ["Apple", "Banana", "Grapes"]],
    ["Which festival is known as the festival of lights?", "Diwali", ["Holi", "Eid", "Christmas"]],
    ["Which festival is known as the festival of colours?", "Holi", ["Diwali", "Eid", "Christmas"]],
    ["On which day do we celebrate India's Independence Day?", "15th August", ["26th January", "2nd October", "25th December"]],
    ["On which day do we celebrate Republic Day?", "26th January", ["15th August", "2nd October", "1st January"]],
    ["Who is known as the Father of the Nation in India?", "Mahatma Gandhi", ["Jawaharlal Nehru", "Subhas Chandra Bose", "Sardar Patel"]],
    ["What is the name of our planet?", "Earth", ["Mars", "Moon", "Sun"]],
    ["What language is widely spoken across India?", "Hindi", ["Spanish", "French", "German"]],
    ["Which of these is a large city in India?", "Mumbai", ["Paris", "London", "Tokyo"]],
    ["What do we call a country's song of pride, sung on special days?", "National anthem", ["Lullaby", "Nursery rhyme", "Advertisement"]],
    ["What shape is the Indian flag?", "Rectangle", ["Circle", "Triangle", "Square"]],
    ["Which continent is India part of?", "Asia", ["Europe", "Africa", "Australia"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `gk-india-${pad(n++)}`,
        subjectId: "gk",
        topicId: "india-and-world",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["india", "national-symbols"],
        learningObjective: "Learn national symbols and basic facts about India",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateEntertainmentAndSports() {
  const facts = [
    ["Which equipment do you use to play cricket?", "Bat and ball", ["Racket", "Net only", "Goal post"]],
    ["Which equipment do you use to play football?", "A football", ["A bat", "A racket", "A net only"]],
    ["Which sport uses a racket and a shuttlecock?", "Badminton", ["Cricket", "Football", "Swimming"]],
    ["Which sport do you play in a swimming pool?", "Swimming", ["Cricket", "Badminton", "Football"]],
    ["How many players are usually on a football team on the field?", "Eleven", ["Five", "Nine", "Fifteen"]],
    ["Which game do you play by rolling a ball to knock down pins?", "Bowling", ["Chess", "Cricket", "Badminton"]],
    ["Which board game is played with black and white pieces and a king?", "Chess", ["Cricket", "Football", "Bowling"]],
    ["Which of these is an indoor game?", "Carrom", ["Football", "Cricket", "Swimming"]],
    ["Which of these is an outdoor game?", "Cricket", ["Carrom", "Chess", "Video games"]],
    ["What do we call a place where movies are shown?", "Cinema", ["Library", "Hospital", "Bank"]],
    ["What do we call colourful drawings that move and tell a story?", "Cartoons", ["Newspapers", "Recipes", "Maps"]],
    ["Which of these is a musical instrument?", "Guitar", ["Football", "Bat", "Racket"]],
    ["What do we call a place where wild animals are kept for people to see?", "Zoo", ["School", "Bank", "Market"]],
    ["What do we call a large event with rides and games for fun?", "A fair/carnival", ["A hospital visit", "A bank visit", "A meeting"]],
    ["Which sport is played on ice with skates?", "Ice skating", ["Cricket", "Football", "Badminton"]],
    ["Which of these is a popular children's outdoor game involving hiding?", "Hide and seek", ["Chess", "Carrom", "Bowling"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `gk-entertainment-${pad(n++)}`,
        subjectId: "gk",
        topicId: "entertainment-and-sports",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["entertainment", "sports"],
        learningObjective: "General knowledge about games, sports and entertainment",
        seed: i + 1,
      })
    );
  }
  return qs;
}

// ---------------------------------------------------------------------------
// APTITUDE
// ---------------------------------------------------------------------------

function generateNumberPatterns() {
  const qs = [];
  let n = 1;
  const steps = [1, 2, 3, 5, 10, -1, -2];
  for (let i = 1; i <= 30; i++) {
    const step = steps[i % steps.length];
    const start = step > 0 ? ((i * 2) % 10) + 1 : 30 + ((i * 2) % 10);
    const sequence = [start, start + step, start + 2 * step, start + 3 * step];
    const answer = start + 4 * step;
    qs.push(
      makeMcq({
        id: `apt-pattern-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "number-patterns",
        question: `What comes next in the pattern? ${sequence.join(", ")}, ?`,
        correctText: answer,
        distractors: [answer + 1, answer - 1, answer + (step > 0 ? step : -step)],
        explanation: `The pattern changes by ${step > 0 ? "+" : ""}${step} each time, so the next number is ${answer}.`,
        difficulty: tier(i - 1, 30),
        tags: ["number-patterns", "sequence"],
        learningObjective: "Identify the rule in a number pattern",
        seed: i,
      })
    );
  }
  return qs;
}

function generateOddOneOut() {
  const groups = [
    [["apple", "banana", "mango", "table"], "table"],
    [["dog", "cat", "cow", "chair"], "chair"],
    [["red", "blue", "green", "seven"], "seven"],
    [["circle", "square", "triangle", "happy"], "happy"],
    [["car", "bus", "train", "banana"], "banana"],
    [["eye", "ear", "nose", "spoon"], "spoon"],
    [["Monday", "Tuesday", "Friday", "January"], "January"],
    [["one", "two", "three", "blue"], "blue"],
    [["rose", "lily", "tulip", "cat"], "cat"],
    [["lion", "tiger", "bear", "rose"], "rose"],
    [["pen", "pencil", "eraser", "elephant"], "elephant"],
    [["hot", "cold", "warm", "chair"], "chair"],
    [["shirt", "pants", "shoes", "carrot"], "carrot"],
    [["fish", "shark", "whale", "sparrow"], "sparrow"],
    [["ant", "bee", "butterfly", "dog"], "dog"],
    [["sun", "moon", "star", "book"], "book"],
    [["milk", "juice", "water", "spoon"], "spoon"],
    [["square", "rectangle", "cube", "loud"], "loud"],
    [["January", "March", "May", "Monday"], "Monday"],
    [["1", "2", "3", "cat"], "cat"],
    [["cup", "plate", "bowl", "kite"], "kite"],
    [["happy", "sad", "angry", "chair"], "chair"],
    [["north", "south", "east", "square"], "square"],
    [["doctor", "teacher", "nurse", "banana"], "banana"],
    [["guitar", "drum", "piano", "apple"], "apple"],
    [["kite", "ball", "doll", "onion"], "onion"],
    [["mango", "onion", "potato", "carrot"], "mango"],
    [["ant", "spider", "bee", "cow"], "cow"],
    [["red", "green", "blue", "loud"], "loud"],
    [["A", "B", "C", "1"], "1"],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < groups.length && i < 30; i++) {
    const [items, odd] = groups[i];
    qs.push(
      makeMcq({
        id: `apt-odd-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "odd-one-out",
        question: `Which one does not belong with the others? ${items.join(", ")}`,
        correctText: odd,
        distractors: items.filter((x) => x !== odd),
        explanation: `'${odd}' does not belong because the other items share something in common that it does not.`,
        difficulty: tier(i, groups.length),
        tags: ["odd-one-out", "classification"],
        learningObjective: "Identify the item that does not belong in a group",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateSpatialUnderstanding() {
  const facts = [
    ["If you are facing a wall and turn around, what is now in front of you?", "What was behind you", ["The same wall", "The sky", "Nothing changes"]],
    ["Which hand do most people write with, if they are right-handed?", "Right hand", ["Left hand", "Both hands", "Neither hand"]],
    ["If the sun rises in the east, which direction do you face to see the sunset?", "West", ["North", "South", "East"]],
    ["A ball is on the table. Where is it in relation to the floor?", "Above the floor", ["Below the floor", "Inside the floor", "Behind the floor"]],
    ["A cat is under the bed. Where is the bed compared to the cat?", "Above the cat", ["Below the cat", "Beside the cat only", "Inside the cat"]],
    ["If you walk forward and then turn left, which direction were you originally facing relative to now?", "To your right", ["To your left", "Behind you", "The same direction"]],
    ["Which is on top of a book kept on a table: the book or the table?", "The book", ["The table", "Both are equal", "Neither"]],
    ["If a bird is flying above a tree, where is the tree?", "Below the bird", ["Above the bird", "Beside the bird", "Inside the bird"]],
    ["You are standing between your mother and father. Who is beside you?", "Both of them", ["Only your mother", "Only your father", "Neither"]],
    ["If your school bag is behind your chair, where should you look to find it?", "Behind the chair", ["In front of the chair", "On top of the chair", "Under the table"]],
    ["Which side is opposite to 'up'?", "Down", ["Left", "Right", "Forward"]],
    ["Which side is opposite to 'left'?", "Right", ["Up", "Down", "Forward"]],
    ["If you are the 3rd person in a line of 5, how many people are in front of you?", "2", ["3", "4", "1"]],
    ["If you are the 3rd person in a line of 5, how many people are behind you?", "2", ["3", "4", "1"]],
    ["A picture is hung near the ceiling. Is it high up or low down?", "High up", ["Low down", "In the middle", "Nowhere"]],
    ["If your shoes are near the door, where should you look for them?", "Near the door", ["In the kitchen", "On the roof", "Under your bed"]],
    ["Which direction is opposite to 'near'?", "Far", ["Beside", "Above", "Below"]],
    ["If the cup is inside the cupboard, where is the cupboard compared to the cup?", "Outside the cup", ["Inside the cup", "Below the cup", "Above the cup"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `apt-spatial-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "spatial-understanding",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["spatial-understanding", "directions"],
        learningObjective: "Understand position and direction words",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateAnalogy() {
  const pairs = [
    ["Dog", "Puppy", "Cat", "Kitten"],
    ["Bird", "Fly", "Fish", "Swim"],
    ["Sun", "Day", "Moon", "Night"],
    ["Hand", "Glove", "Foot", "Shoe"],
    ["Cow", "Moo", "Dog", "Woof"],
    ["Eye", "See", "Ear", "Hear"],
    ["Hot", "Cold", "Big", "Small"],
    ["Doctor", "Hospital", "Teacher", "School"],
    ["Bee", "Honey", "Cow", "Milk"],
    ["Pen", "Write", "Knife", "Cut"],
    ["Book", "Read", "Song", "Sing"],
    ["Water", "Drink", "Food", "Eat"],
    ["King", "Queen", "Father", "Mother"],
    ["Tree", "Leaves", "Bird", "Feathers"],
    ["Fish", "Water", "Bird", "Sky"],
    ["One", "First", "Two", "Second"],
    ["Cold", "Ice", "Hot", "Fire"],
    ["Baby", "Crawl", "Adult", "Walk"],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < pairs.length; i++) {
    const [a, b, c, d] = pairs[i];
    const distractorPool = pairs.flatMap((p) => [p[1], p[3]]).filter((w) => w !== d);
    qs.push(
      makeMcq({
        id: `apt-analogy-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "analogy",
        question: `${a} is to ${b} as ${c} is to ?`,
        correctText: d,
        distractors: [
          distractorPool[(i * 2) % distractorPool.length],
          distractorPool[(i * 2 + 5) % distractorPool.length],
          distractorPool[(i * 2 + 9) % distractorPool.length],
        ],
        explanation: `Just as ${a} relates to ${b}, ${c} relates to ${d}.`,
        difficulty: tier(i, pairs.length),
        tags: ["analogy"],
        learningObjective: "Complete a simple word analogy",
        seed: i + 1,
      })
    );
  }
  return qs;
}

function generateRanking() {
  const qs = [];
  let n = 1;
  const heightSets = [
    ["Ravi", 120, "Sam", 100, "Tia", 140],
    ["Ann", 90, "Ben", 130, "Cid", 110],
    ["Dev", 150, "Eva", 95, "Fin", 125],
    ["Gia", 105, "Hal", 160, "Ira", 115],
    ["Jai", 135, "Kim", 100, "Leo", 145],
    ["Mia", 98, "Nik", 128, "Ola", 108],
  ];
  for (let i = 0; i < heightSets.length; i++) {
    const [n1, h1, n2, h2, n3, h3] = heightSets[i];
    const people = [
      [n1, h1],
      [n2, h2],
      [n3, h3],
    ];
    const tallest = people.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    const shortest = people.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
    qs.push(
      makeMcq({
        id: `apt-rank-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "ranking",
        question: `${n1} is ${h1}cm tall, ${n2} is ${h2}cm tall, and ${n3} is ${h3}cm tall. Who is the tallest?`,
        correctText: tallest,
        distractors: people.map((p) => p[0]).filter((name) => name !== tallest),
        explanation: `${tallest} has the greatest height, so ${tallest} is the tallest.`,
        difficulty: tier(i, heightSets.length * 2),
        tags: ["ranking", "comparison"],
        learningObjective: "Rank people or objects by size",
        seed: i + 1,
      })
    );
    qs.push(
      makeMcq({
        id: `apt-rank-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "ranking",
        question: `${n1} is ${h1}cm tall, ${n2} is ${h2}cm tall, and ${n3} is ${h3}cm tall. Who is the shortest?`,
        correctText: shortest,
        distractors: people.map((p) => p[0]).filter((name) => name !== shortest),
        explanation: `${shortest} has the smallest height, so ${shortest} is the shortest.`,
        difficulty: tier(heightSets.length + i, heightSets.length * 2),
        tags: ["ranking", "comparison"],
        learningObjective: "Rank people or objects by size",
        seed: i + 20,
      })
    );
  }
  const racePositions = [
    ["Sam finished the race before Tia but after Ravi. Who finished first?", "Ravi", ["Sam", "Tia"]],
    ["In a race, Mia came 2nd, Nik came 1st, and Ola came 3rd. Who won the race?", "Nik", ["Mia", "Ola"]],
    ["Dev is older than Eva. Eva is older than Fin. Who is the oldest?", "Dev", ["Eva", "Fin"]],
    ["Gia is younger than Hal. Hal is younger than Ira. Who is the youngest?", "Gia", ["Hal", "Ira"]],
    ["Jai stood in line after Kim but before Leo. Who is at the front of these three?", "Kim", ["Jai", "Leo"]],
    ["Ann's box is bigger than Ben's box. Ben's box is bigger than Cid's box. Whose box is the smallest?", "Cid", ["Ann", "Ben"]],
  ];
  for (let i = 0; i < racePositions.length; i++) {
    const [question, correct, distractors] = racePositions[i];
    qs.push(
      makeMcq({
        id: `apt-rank-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "ranking",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct based on the order given.`,
        difficulty: tier(i, racePositions.length),
        tags: ["ranking", "ordering"],
        learningObjective: "Work out order and position from clues",
        seed: i + 40,
      })
    );
  }
  return qs;
}

function generateSymmetry() {
  const qs = [];
  let n = 1;
  const symmetricLetters = ["A", "H", "I", "M", "O", "T", "U", "V", "W", "X", "Y"];
  const nonSymmetricLetters = ["B", "C", "D", "F", "G", "J", "K", "L", "N", "P", "Q", "R", "S", "Z"];
  for (let i = 0; i < symmetricLetters.length; i++) {
    const letter = symmetricLetters[i];
    qs.push(
      makeMcq({
        id: `apt-symmetry-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "symmetry",
        question: `Does the letter '${letter}' look the same on both sides when you draw a line down the middle (a line of symmetry)?`,
        correctText: "Yes",
        distractors: ["No"],
        explanation: `'${letter}' has a line of symmetry — both halves match.`,
        difficulty: tier(i, symmetricLetters.length + 6),
        questionType: "true-false",
        tags: ["symmetry"],
        learningObjective: "Recognise lines of symmetry in letters and shapes",
        seed: i + 1,
      })
    );
  }
  for (let i = 0; i < 6; i++) {
    const letter = nonSymmetricLetters[i];
    qs.push(
      makeMcq({
        id: `apt-symmetry-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "symmetry",
        question: `Does the letter '${letter}' look the same on both sides when you draw a line down the middle (a line of symmetry)?`,
        correctText: "No",
        distractors: ["Yes"],
        explanation: `'${letter}' does NOT have a line of symmetry down the middle — the two halves don't match.`,
        difficulty: tier(symmetricLetters.length + i, symmetricLetters.length + 6),
        questionType: "true-false",
        tags: ["symmetry"],
        learningObjective: "Recognise lines of symmetry in letters and shapes",
        seed: i + 30,
      })
    );
  }
  const shapeSymmetry = [
    ["circle", "Yes"], ["square", "Yes"], ["rectangle", "Yes"], ["heart", "Yes"], ["star", "Yes"],
  ];
  for (let i = 0; i < shapeSymmetry.length; i++) {
    const [shape, answer] = shapeSymmetry[i];
    qs.push(
      makeMcq({
        id: `apt-symmetry-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "symmetry",
        question: `Does a ${shape} have at least one line of symmetry?`,
        correctText: answer,
        distractors: [answer === "Yes" ? "No" : "Yes"],
        explanation: `A ${shape} can be folded so both halves match, so it has a line of symmetry.`,
        difficulty: "medium",
        questionType: "true-false",
        tags: ["symmetry", "shapes"],
        learningObjective: "Recognise lines of symmetry in shapes",
        seed: i + 40,
      })
    );
  }
  return qs;
}

function generateMirrorImage() {
  const qs = [];
  let n = 1;
  const mirrorPairs = [
    ["b", "d"], ["p", "q"], ["3", "E"], ["N", "Ƨ (backwards S)"], ["b", "d"], ["6", "9"],
  ];
  const letters = ["A", "B", "C", "D", "E", "F", "M", "T", "W", "H"];
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    const looksSame = ["A", "M", "T", "W", "H"].includes(letter);
    qs.push(
      makeMcq({
        id: `apt-mirror-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "mirror-image",
        question: `If you look at the letter '${letter}' in a mirror, does it look exactly the same as the original?`,
        correctText: looksSame ? "Yes" : "No",
        distractors: [looksSame ? "No" : "Yes"],
        explanation: looksSame
          ? `'${letter}' has a vertical line of symmetry, so it looks the same in a mirror.`
          : `'${letter}' looks flipped/different in a mirror.`,
        difficulty: tier(i, letters.length + mirrorPairs.length),
        questionType: "true-false",
        tags: ["mirror-image"],
        learningObjective: "Recognise how letters appear in a mirror",
        seed: i + 1,
      })
    );
  }
  const bdFacts = [
    ["The mirror image of 'b' looks like which letter?", "d", ["p", "q", "b"]],
    ["The mirror image of 'p' looks like which letter?", "q", ["b", "d", "p"]],
    ["The mirror image of the number '2' looks like a backwards 2. Is it the same as a normal '2'?", "No", ["Yes"]],
    ["The mirror image of the number '8' looks the same as a normal '8'. Is this true?", "Yes", ["No"]],
    ["The mirror image of the word 'MOM' still reads the same. Is this true?", "Yes", ["No"]],
  ];
  for (let i = 0; i < bdFacts.length; i++) {
    const [question, correct, distractors] = bdFacts[i];
    qs.push(
      makeMcq({
        id: `apt-mirror-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "mirror-image",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(letters.length + i, letters.length + bdFacts.length),
        tags: ["mirror-image"],
        learningObjective: "Recognise mirror images of letters and numbers",
        seed: i + 30,
      })
    );
  }
  return qs;
}

function generatePaperFolding() {
  const facts = [
    ["If you fold a square paper exactly in half once, how many equal parts do you get?", "2", ["3", "4", "1"]],
    ["If you fold a square paper in half twice, how many equal parts do you get?", "4", ["2", "3", "8"]],
    ["If you fold a round paper in half, what shape do you get?", "A half circle", ["A square", "A triangle", "A star"]],
    ["If you fold a square paper corner to corner, what shape do you get?", "A triangle", ["A circle", "A rectangle", "A star"]],
    ["If you fold a rectangle paper in half the short way, what shape do you usually get?", "A smaller rectangle", ["A triangle", "A circle", "A star"]],
    ["If you unfold a paper that was folded once and cut at the fold, how many pieces do you get?", "2", ["1", "3", "4"]],
    ["If you fold a paper in half and cut a small circle at the fold, what do you see when you unfold it?", "A full circle (or two half circles joined)", ["A square", "A triangle", "Nothing"]],
    ["When you fold a piece of paper, does the folded part become smaller or bigger?", "Smaller", ["Bigger", "The same size", "It disappears"]],
    ["If you fold a paper in half 3 times, how many layers of paper do you have?", "8", ["4", "6", "2"]],
    ["What is the crease made by folding paper called?", "A fold line", ["A cut", "A tear", "A drawing"]],
    ["If you fold a heart shape in half down the middle, do both sides match?", "Yes", ["No"]],
    ["If a square paper is folded once, does it always make two equal rectangles or triangles?", "Yes, if folded straight or corner-to-corner", ["No, it always makes a circle", "No, it always makes a star", "No, it disappears"]],
  ];
  const qs = [];
  let n = 1;
  for (let i = 0; i < facts.length; i++) {
    const [question, correct, distractors] = facts[i];
    qs.push(
      makeMcq({
        id: `apt-fold-${pad(n++)}`,
        subjectId: "aptitude",
        topicId: "paper-folding",
        question,
        correctText: correct,
        distractors,
        explanation: `${correct} is correct.`,
        difficulty: tier(i, facts.length),
        tags: ["paper-folding"],
        learningObjective: "Predict simple outcomes of folding paper",
        seed: i + 1,
      })
    );
  }
  return qs;
}

// ---------------------------------------------------------------------------
// WRITE FILES
// ---------------------------------------------------------------------------

function toFileContent(varName, questions) {
  return `import type { Question } from "@/types";\n\nexport const ${varName}: Question[] = ${JSON.stringify(
    questions,
    null,
    2
  )};\n`;
}

function assertValid(questions, subjectId) {
  const ids = new Set();
  for (const q of questions) {
    if (ids.has(q.id)) throw new Error(`Duplicate id ${q.id}`);
    ids.add(q.id);
    if (q.subjectId !== subjectId) throw new Error(`Bad subjectId in ${q.id}`);
    if (q.options.length < 2) throw new Error(`Too few options in ${q.id}`);
    if (!q.options.find((o) => o.id === q.correctOptionId)) {
      throw new Error(`Missing correct option in ${q.id}`);
    }
    if (!q.explanation) throw new Error(`Missing explanation in ${q.id}`);
  }
}

const mathsQuestions = [
  ...generateCounting(),
  ...generateNumberSense(),
  ...generateAddition(),
  ...generateSubtraction(),
  ...generateShapesAndSizes(),
  ...generateTime(),
  ...generateMoney(),
  ...generateMeasurementAndPatterns(),
  ...generateDataHandling(),
];
const englishQuestions = [
  ...generateAlphabet(),
  ...generateVocabulary(),
  ...generateOpposites(),
  ...generateGrammarBasics(),
  ...generateRhymingWords(),
  ...generateHomonyms(),
  ...generateSentenceRearrangement(),
  ...generateComprehension(),
];
const evsQuestions = [
  ...generateMyBody(),
  ...generatePlantsAroundUs(),
  ...generateAnimalsAroundUs(),
  ...generateLivingThings(),
  ...generateOurNeeds(),
  ...generateGoodHabits(),
  ...generateNeighbourhood(),
  ...generateEarthAndSky(),
  ...generateTransport(),
];
const gkQuestions = [
  ...generateMySurroundings(),
  ...generatePlantsAndAnimalsGK(),
  ...generateIndiaAndWorld(),
  ...generateEntertainmentAndSports(),
];
const aptitudeQuestions = [
  ...generateOddOneOut(),
  ...generateNumberPatterns(),
  ...generateSpatialUnderstanding(),
  ...generateAnalogy(),
  ...generateRanking(),
  ...generateSymmetry(),
  ...generateMirrorImage(),
  ...generatePaperFolding(),
];

assertValid(mathsQuestions, "maths");
assertValid(englishQuestions, "english");
assertValid(evsQuestions, "evs");
assertValid(gkQuestions, "gk");
assertValid(aptitudeQuestions, "aptitude");

writeFileSync(join(OUT_DIR, "maths.ts"), toFileContent("mathsQuestions", mathsQuestions));
writeFileSync(join(OUT_DIR, "english.ts"), toFileContent("englishQuestions", englishQuestions));
writeFileSync(join(OUT_DIR, "evs.ts"), toFileContent("evsQuestions", evsQuestions));
writeFileSync(join(OUT_DIR, "gk.ts"), toFileContent("gkQuestions", gkQuestions));
writeFileSync(join(OUT_DIR, "aptitude.ts"), toFileContent("aptitudeQuestions", aptitudeQuestions));

console.log("Generated question banks:");
console.log("  maths:", mathsQuestions.length);
console.log("  english:", englishQuestions.length);
console.log("  evs:", evsQuestions.length);
console.log("  gk:", gkQuestions.length);
console.log("  aptitude:", aptitudeQuestions.length);
