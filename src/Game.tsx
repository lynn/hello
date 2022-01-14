import { useEffect, useState } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue, describeClue } from "./clue";
import { Keyboard } from "./Keyboard";
import targetList from "./targets.json";
import { dictionarySet, pick, resetRng, seed, speak } from "./util";

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
    `${targets.length.toLocaleString()} possibilities`
  );
  const [srStatus, setSrStatus] = useState<string>(``);
  const [target, setTarget] = useState(() => {
    resetRng();
    return randomTarget(wordLength);
  });
  const [gameNumber, setGameNumber] = useState(1);
  const [exclusions, setExclusions] = useState<
    Record<string | number, string[]>
  >({
    found: ["", "", "", "", ""],
    nowhere: [],
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  });

  const startNextGame = () => {
    setTarget(randomTarget(wordLength));
    setGuesses([]);
    setCurrentGuess("");
    setHint("");
    setGameState(GameState.Playing);
    setGameNumber((x) => x + 1);
  };

  const onKey = (key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        startNextGame();
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-z]$/i.test(key)) {
      setCurrentGuess((guess) =>
        (guess + key.toLowerCase()).slice(0, wordLength)
      );
      setHint("");
      setSrStatus("");
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
      setHint("");
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

        setExclusions({
          found: currentClue.reduce((agg, cur, index) => {
            if (cur.clue === 2) agg.splice(index, 1, cur.letter);
            return agg;
          }, exclusions.found),
          nowhere: [...exclusions.nowhere, ...notFound],
          0:
            currentClue[0].clue === 1
              ? [...exclusions[0], currentClue[0].letter]
              : exclusions[0],
          1:
            currentClue[1].clue === 1
              ? [...exclusions[1], currentClue[1].letter]
              : exclusions[1],
          2:
            currentClue[2].clue === 1
              ? [...exclusions[2], currentClue[2].letter]
              : exclusions[2],
          3:
            currentClue[3].clue === 1
              ? [...exclusions[3], currentClue[3].letter]
              : exclusions[3],
          4:
            currentClue[4].clue === 1
              ? [...exclusions[4], currentClue[4].letter]
              : exclusions[4],
        });
      }
    }
  };

  useEffect(() => {
    setTimeout(() => setHint(`Make your first guess!`), 3000);
  }, [target]);

  useEffect(() => {
    if (exclusions.nowhere.length === 0) return;
    const nowherePattern = new RegExp(`^[^${exclusions.nowhere.join("")}]+$`);
    const notHerePattern = new RegExp(
      `^${
        exclusions.found[0] || exclusions[0].length
          ? `[^${exclusions[0].join("")}]`
          : "."
      }${
        exclusions.found[1] || exclusions[1].length
          ? `[^${exclusions[1].join("")}]`
          : "."
      }${
        exclusions.found[2] || exclusions[2].length
          ? `[^${exclusions[2].join("")}]`
          : "."
      }${
        exclusions.found[3] || exclusions[3].length
          ? `[^${exclusions[3].join("")}]`
          : "."
      }${
        exclusions.found[4] || exclusions[4].length
          ? `[^${exclusions[4].join("")}]`
          : "."
      }$`
    );

    console.log(exclusions, nowherePattern, notHerePattern);

    const possibilityCount = targets.filter(
      (word) => nowherePattern.test(word) && notHerePattern.test(word)
    ).length;
    setHint(`${possibilityCount.toLocaleString()} possibilities`);
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
          onChange={(e) => {
            const length = Number(e.target.value);
            resetRng();
            setGameNumber(1);
            setGameState(GameState.Playing);
            setGuesses([]);
            setCurrentGuess("");
            setTarget(randomTarget(length));
            setWordLength(length);
            setHint(`${length} letters`);
          }}
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
