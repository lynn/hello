import { useEffect, useState, ChangeEvent } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue, describeClue } from "./clue";
import { Keyboard } from "./Keyboard";
import targetList from "./targets.json";
import { dictionarySet, initExclusions, pick, resetRng, seed, speak } from "./util";

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  maxGuesses: number;
  hidden: boolean;
}

const targets = targetList.slice(0, targetList.indexOf("murky") + 1); // Words no rarer than this one

function randomTarget(wordLength: number) {
  const eligible = targets.filter((word) => word.length === wordLength);
  return pick(eligible);
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [wordLength, setWordLength] = useState(5);
  const [hint, setHint] = useState<string>(
    `${targets
      .filter(({ length }) => length === wordLength)
      .length.toLocaleString()} possibilities`
  );
  const [srStatus, setSrStatus] = useState<string>(``);
  const [target, setTarget] = useState(() => {
    resetRng();
    return randomTarget(wordLength);
  });
  const [gameNumber, setGameNumber] = useState(1);
  const [exclusions, setExclusions] = useState<
    Record<"found" | "nowhere" | number, string[]>
  >(initExclusions(wordLength));

  const startNextGame = () => {
    setTarget(randomTarget(wordLength));
    setGuesses([]);
    setCurrentGuess("");
    setHint("");
    setGameState(GameState.Playing);
    setGameNumber((x) => x + 1);
    setExclusions(initExclusions(wordLength));
  };

  const onKey = (key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        startNextGame();
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-z]$/.test(key)) {
      setCurrentGuess((guess) => (guess + key).slice(0, wordLength));
      setSrStatus("");
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
    } else if (key === "Enter") {
      if (currentGuess.length !== wordLength) {
        setHint("Too short");
        return;
      }
      if (!dictionary.includes(currentGuess)) {
        setHint("Not a valid word");
        return;
      }
      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess((guess) => "");
      if (currentGuess === target) {
        setHint(
          `You won! The answer was ${target.toUpperCase()}. (Enter to play again)`
        );
        setGameState(GameState.Won);
      } else if (guesses.length + 1 === props.maxGuesses) {
        setHint(
          `You lost! The answer was ${target.toUpperCase()}. (Enter to play again)`
        );
        setGameState(GameState.Lost);
      } else {
        speak(describeClue(clue(currentGuess, target)));
        const currentClue = clue(currentGuess, target);
        const notFound = currentClue
          .filter(({ clue }) => clue === 0)
          .filter(
            ({ letter }) =>
              !currentClue.some(
                (otherPosition) =>
                  otherPosition.letter === letter && otherPosition.clue
              )
          )
          .map(({ letter }) => letter);

        setExclusions(
          currentClue.reduce(
            (agg, { letter, clue }, index) => ({
              ...agg,
              [index]:
                clue === 1 ? [...exclusions[index], letter] : exclusions[index],
            }),
            {
              found: currentClue.reduce((agg, cur, index) => {
                if (cur.clue === 2) agg.splice(index, 1, cur.letter);
                return agg;
              }, exclusions.found),
              nowhere: [...exclusions.nowhere, ...notFound],
            }
          )
        );
      }
    }
  };

  useEffect(() => {
    setTimeout(() => setHint(`Make your first guess!`), 3000);
  }, [target]);

  useEffect(() => {
    if (exclusions.nowhere.length === 0) return;

    const { found, nowhere, ...rest } = exclusions;
    const nowherePattern = `(?=^[^${exclusions.nowhere.join("")}]+$)`;
    const somewherePattern = Object.values(rest)
      .reduce((agg: string[], cur: string[]) => [...agg, ...cur], [])
      .filter(
        (letter: string, index: number, array: string[]) =>
          array.indexOf(letter) === index && !found.includes(letter)
      )
      .map((letter: string) => `(?=.*${letter})`)
      .join("");
    const byPositionPattern = `(?=^${exclusions.found
      .map((foundLetter, index) => {
        return (
          foundLetter ||
          (exclusions[index].length ? `[^${exclusions[index].join("")}]` : ".")
        );
      })
      .join("")}$)`;

    const re = new RegExp(
      [somewherePattern, nowherePattern, byPositionPattern].join("")
    );
    const possibilities = targets.filter((word) => re.test(word));
    setHint(`${possibilities.length.toLocaleString()} possibilities`);
    console.log({ exclusions, possibilities });
  }, [exclusions]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onKey(e.key);
      }
      if (e.key === "Backspace") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [currentGuess, gameState]);

  let letterInfo = new Map<string, Clue>();
  const tableRows = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const cluedLetters = clue(guess, target);
      const lockedIn = i < guesses.length;
      if (lockedIn) {
        for (const { clue, letter } of cluedLetters) {
          if (clue === undefined) break;
          const old = letterInfo.get(letter);
          if (old === undefined || clue > old) {
            letterInfo.set(letter, clue);
          }
        }
      }
      return (
        <Row
          key={i}
          wordLength={wordLength}
          rowState={
            lockedIn
              ? RowState.LockedIn
              : i === guesses.length
              ? RowState.Editing
              : RowState.Pending
          }
          cluedLetters={cluedLetters}
        />
      );
    });

  const handleWordLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const length = Number(e.target.value);
    resetRng();
    setGameNumber(1);
    setGameState(GameState.Playing);
    setGuesses([]);
    setTarget(randomTarget(length));
    setWordLength(length);
    setHint(`${length} letters`);
    setExclusions(initExclusions(length));
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <div className="Game" style={{ display: props.hidden ? "none" : "block" }}>
      <div className="Game-options">
        <label htmlFor="wordLength">Letters:</label>
        <input
          type="range"
          min="4"
          max="11"
          id="wordLength"
          disabled={
            gameState === GameState.Playing &&
            (guesses.length > 0 || currentGuess !== "")
          }
          value={wordLength}
          onChange={handleWordLengthChange}
        ></input>
        <button
          style={{ flex: "0 0 auto" }}
          disabled={gameState !== GameState.Playing || guesses.length === 0}
          onClick={() => {
            setHint(
              `The answer was ${target.toUpperCase()}. (Enter to play again)`
            );
            setGameState(GameState.Lost);
            (document.activeElement as HTMLElement)?.blur();
          }}
        >
          Give up
        </button>
      </div>
      <table className="Game-rows" tabIndex={0} aria-label="Table of guesses">
        <tbody>{tableRows}</tbody>
      </table>
      <p role="alert">{hint || `\u00a0`}</p>
      {/* <p role="alert" className="Game-sr-feedback">
        {srStatus}
      </p> */}
      <Keyboard letterInfo={letterInfo} onKey={onKey} />
      {seed ? (
        <div className="Game-seed-info">
          seed {seed}, length {wordLength}, game {gameNumber}
        </div>
      ) : undefined}
    </div>
  );
}

export default Game;
