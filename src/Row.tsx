import { Clue, clueClass, CluedLetter, clueWord } from "./clue";
import letterPoints from "./letterPoints";

export enum RowState {
  LockedIn,
  Editing,
  Pending,
}

interface RowProps {
  rowState: RowState;
  wordLength: number;
  cluedLetters: CluedLetter[];
  annotation?: string | null;
}

export function Row(props: RowProps) {
  const isLockedIn = props.rowState === RowState.LockedIn;
  const isEditing = props.rowState === RowState.Editing;
  const letterDivs = props.cluedLetters
    .concat(Array(props.wordLength).fill({ clue: Clue.Absent, letter: "" }))
    .slice(0, props.wordLength)
    .map(({ clue, letter }, i) => {
      let letterClass = "Row-letter";
      if (isLockedIn && clue !== undefined) {
        letterClass += " " + clueClass(clue);
      }
      let pointValue = letterPoints[letter];
      if (isLockedIn) {
        if (clue === Clue.Elsewhere) pointValue /= 2;
        else if (clue === Clue.Correct) pointValue = 0;
      }

      return (
        <td
          key={i}
          className={letterClass}
          aria-live={isEditing ? "assertive" : "off"}
          aria-label={
            isLockedIn
              ? letter.toUpperCase() +
                (clue === undefined ? "" : ": " + clueWord(clue))
              : ""
          }
        >
          <span>
            {letter}
            <sub className="Button-subscript">{pointValue}</sub>
          </span>
        </td>
      );
    });
  let rowClass = "Row";
  if (isLockedIn) rowClass += " Row-locked-in";

  return (
    <tr className={rowClass} data-row-score={props.annotation}>
      {letterDivs}
    </tr>
  );
}
