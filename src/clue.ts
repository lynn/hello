export enum Clue {
  Absent,
  Elsewhere,
  Correct,
}

export interface CluedLetter {
  clue?: Clue;
  letter: string;
}

// clue("perks", "rebus")
// [
//   { letter: "p", clue: Absent },
//   { letter: "e", clue: Correct },
//   { letter: "r", clue: Elsewhere },
//   { letter: "k", clue: Absent },
//   { letter: "s", clue: Correct },
// ]

export function clue(word: string, target: string): CluedLetter[] {
  let notFound: string[] = [];
  target.split("").map((letter, i) => {
    if (word[i] !== letter) {
      notFound.push(letter);
    }
  });
  return word.split("").map((letter, i) => {
    let j: number;
    if (target[i] === letter) {
      return { clue: Clue.Correct, letter };
    } else if ((j = notFound.indexOf(letter)) > -1) {
      notFound[j] = "";
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
