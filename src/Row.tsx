import { wordLength } from "./util";

export enum RowState {
  LockedIn,
  Pending,
}

interface RowProps {
  rowState: RowState;
  letters: string;
  target: string;
}

export function Row(props: RowProps) {
  const isLockedIn = props.rowState === RowState.LockedIn;
  const letterDivs = props.letters
    .padEnd(wordLength)
    .split("")
    .map((letter, i) => {
      let letterClass = "Row-letter";
      if (isLockedIn) {
        if (props.target[i] === letter) {
          letterClass += " Row-letter-green";
        } else if (props.target.includes(letter)) {
          // TODO don't color letters accounted for by a green clue
          letterClass += " Row-letter-yellow";
        } else {
          letterClass += " Row-letter-gray";
        }
      }
      return (
        <div key={i} className={letterClass}>
          {letter}
        </div>
      );
    });
  let rowClass = "Row";
  if (isLockedIn) rowClass += " Row-locked-in";
  return <div className={rowClass}>{letterDivs}</div>;
}
