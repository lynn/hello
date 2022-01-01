import { useEffect, useState } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue, clueClass } from "./clue";
import { Keyboard } from "./Keyboard";

enum GameState {
  Playing,
  Over,
}

interface GameProps {
  target: string;
  wordLength: number;
  maxGuesses: number;
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");

  const onKey = (key: string) => {
    console.log(key);
    if (gameState !== GameState.Playing) return;
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-z]$/.test(key)) {
      setCurrentGuess((guess) => (guess + key).slice(0, props.wordLength));
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
    } else if (key === "Enter") {
      if (currentGuess.length !== props.wordLength) {
        // TODO show a helpful message
        return;
      }
      if (!dictionary.includes(currentGuess)) {
        // TODO show a helpful message
        return;
      }
      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess((guess) => "");
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      onKey(e.key);
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGuess]);

  let letterInfo = new Map<string, Clue>();
  const rowDivs = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const cluedLetters = clue(guess, props.target);
      if (i < guesses.length) {
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
          wordLength={props.wordLength}
          rowState={i < guesses.length ? RowState.LockedIn : RowState.Pending}
          cluedLetters={cluedLetters}
        />
      );
    });

  return (
    <div className="Game">
      {rowDivs}
      <Keyboard letterInfo={letterInfo} onKey={onKey} />
    </div>
  );
}

export default Game;
