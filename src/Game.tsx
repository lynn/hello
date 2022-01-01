import { useEffect, useState } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue } from "./clue";
import { Keyboard } from "./Keyboard";

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  target: string;
  wordLength: number;
  maxGuesses: number;
  restart: () => void;
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [hint, setHint] = useState<string>(`${props.wordLength} letters`);

  const onKey = (key: string) => {
    console.log(key);
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        props.restart();
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-z]$/.test(key)) {
      setCurrentGuess((guess) => (guess + key).slice(0, props.wordLength));
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
    } else if (key === "Enter") {
      if (currentGuess.length !== props.wordLength) {
        setHint("Too short");
        return;
      }
      if (!dictionary.includes(currentGuess)) {
        setHint("Not a valid word");
        return;
      }
      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess((guess) => "");
      if (currentGuess === props.target) {
        setHint("You won! (Enter to play again)");
        setGameState(GameState.Won);
      } else if (guesses.length + 1 === props.maxGuesses) {
        setHint(
          `You lost! The answer was ${props.target.toUpperCase()}. (Enter to play again)`
        );
        setGameState(GameState.Lost);
      } else {
        setHint("");
      }
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
  }, [currentGuess, gameState]);

  let letterInfo = new Map<string, Clue>();
  const rowDivs = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const cluedLetters = clue(guess, props.target);
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
          wordLength={props.wordLength}
          rowState={lockedIn ? RowState.LockedIn : RowState.Pending}
          cluedLetters={cluedLetters}
        />
      );
    });

  return (
    <div className="Game">
      {rowDivs}
      <p>{hint || `\u00a0`}</p>
      <Keyboard letterInfo={letterInfo} onKey={onKey} />
    </div>
  );
}

export default Game;
