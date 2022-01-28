import { MouseEvent, useRef, useState } from "react";
import { Clue, clueClass, CluedLetter, clueWord, getClueDefinitionLink } from "./clue";
import searchIcon from "./images/search.svg";

export enum RowState {
  LockedIn,
  Editing,
  Pending,
}

interface RowProps {
  rowState: RowState;
  wordLength: number;
  cluedLetters: CluedLetter[];
  annotation?: string;
}

interface DefinitionProps {
  shown: boolean,
  left: number;
  width: number;
}

export function Row(props: RowProps) {
  const [definitionInfo, setDefinitionInfo] = useState<DefinitionProps>({ shown: false, left: 0, width: 0 });
  const lastLetterRef = useRef<HTMLTableCellElement>(null);
  const isLockedIn = props.rowState === RowState.LockedIn;
  const isEditing = props.rowState === RowState.Editing;
  function showDictionary(e: MouseEvent<HTMLTableCellElement>) {
    let lastLetterLeft = lastLetterRef.current?.offsetLeft ?? 0;
    let lastLetterWidth = lastLetterRef.current?.offsetWidth ?? 0;
    setDefinitionInfo({ shown: true, left: lastLetterLeft, width: lastLetterWidth });
  }
  function hideDictionary(e: MouseEvent<HTMLTableCellElement>) {
    let toElement = e.relatedTarget as Element;
    if (toElement.className === "Row-definition" || toElement.className === "Icon-img") return;
    setDefinitionInfo({ shown: false, left: 0, width: 0 });
      
  }
  const letterDivs = props.cluedLetters
    .concat(Array(props.wordLength).fill({ clue: Clue.Absent, letter: "" }))
    .slice(0, props.wordLength)
    .map(({ clue, letter }, i) => {
      let letterClass = "Row-letter";
      let isLastLetter = i === props.wordLength - 1;
      if (isLockedIn && clue !== undefined) {
        letterClass += " " + clueClass(clue);
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
          onMouseEnter={showDictionary}
          onMouseLeave={hideDictionary}
          ref={isLastLetter ? lastLetterRef : undefined}
        >
          {letter}
        </td>
      );
    });
  let rowClass = "Row";
  if (isLockedIn) rowClass += " Row-locked-in";
  return (
    <tr className={rowClass}>
      {letterDivs}
      {props.annotation && (
        <span className="Row-annotation">{props.annotation}</span>
      )}
      {isLockedIn && definitionInfo.shown && (
        <div 
          className="Row-definition"
          onMouseLeave={hideDictionary}
          style={{
            left: definitionInfo.left + definitionInfo.width
          }}
        >
          <a 
            className="Icon-container" 
            href={getClueDefinitionLink(props.cluedLetters)}
            target="_blank"
            title="View Definition"
          >
            <img 
              className="Icon-img" 
              src={searchIcon} 
            />
          </a>
        </div>
      )}
    </tr>
  );
}
