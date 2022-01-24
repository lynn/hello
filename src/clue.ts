import { Difficulty, englishNumbers, ordinal } from "./util";

export enum Clue {
  Absent,
  Elsewhere,
  Correct,
}

export interface CluedLetter {
  clue?: Clue;
  letter: string;
}

export function clue(word: string, target: string): CluedLetter[] {
  let elusive: string[] = [];
  target.split("").forEach((letter, i) => {
    if (word[i] !== letter) {
      elusive.push(letter);
    }
  });
  return word.split("").map((letter, i) => {
    let j: number;
    if (target[i] === letter) {
      return { clue: Clue.Correct, letter };
    } else if ((j = elusive.indexOf(letter)) > -1) {
      // "use it up" so we don't clue at it twice
      elusive[j] = "";
      return { clue: Clue.Elsewhere, letter };
    } else {
      return { clue: Clue.Absent, letter };
    }
  });
}

export function clueClass(clue: Clue): string {
  if (clue === Clue.Absent) {
    return "letter-absent";
  } else if (clue === Clue.Elsewhere) {
    return "letter-elsewhere";
  } else {
    return "letter-correct";
  }
}

export function clueWord(clue: Clue): string {
  if (clue === Clue.Absent) {
    return "no";
  } else if (clue === Clue.Elsewhere) {
    return "elsewhere";
  } else {
    return "correct";
  }
}

export function describeClue(clue: CluedLetter[]): string {
  return clue
    .map(({ letter, clue }) => letter.toUpperCase() + " " + clueWord(clue!))
    .join(", ");
}

export function violation(
  difficulty: Difficulty,
  clues: CluedLetter[],
  guess: string
): string | undefined {
  if (difficulty === Difficulty.Normal) {
    return undefined;
  }
  let i = 0;
  for (const { letter, clue } of clues) {
    const upper = letter.toUpperCase();
    const nth = ordinal(i + 1);
    if (clue === Clue.Correct) {
      if (guess[i] !== letter) {
        return nth + " letter must be " + upper;
      }
    } else if (clue === Clue.Elsewhere) {
      if (!guess.includes(letter)) {
        return "Guess must contain " + upper;
      }
    }
    if (difficulty === Difficulty.UltraHard) {
      if (clue !== Clue.Correct && guess[i] === letter) {
        return nth + " letter can't be " + upper;
      }
      const clueCount = clues.filter(
        (c) => c.letter === letter && c.clue !== Clue.Absent
      ).length;
      const guessCount = guess.split(letter).length - 1;
      const hasAbsent = clues.some(
        (c) => c.letter === letter && c.clue === Clue.Absent
      );
      const amount = englishNumbers[clueCount];
      const s = clueCount !== 1 ? "s" : "";
      if (hasAbsent) {
        if (guessCount !== clueCount) {
          if (clueCount === 0) {
            return `Guess can't contain ${upper}`;
          } else {
            return `Guess must contain exactly ${amount} ${upper}${s}`;
          }
        }
      } else {
        if (guessCount < clueCount) {
          return `Guess must contain at least ${amount} ${upper}${s}`;
        }
      }
    }
    ++i;
  }
  return undefined;
}
