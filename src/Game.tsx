import { useEffect, useState } from "react";
import { Row, RowState } from "./Row";
import { pick, wordLength } from "./util";
import dictionary from "./dictionary.json";

enum GameState {
  Playing,
  Over,
}

interface GameProps {
  target: string;
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const maxGuesses = 6;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      console.log(e.key)
      if (gameState !== GameState.Playing) return;
      if (guesses.length === maxGuesses) return;
      if (/^[a-z]$/.test(e.key)) {
        setCurrentGuess((guess) => (guess + e.key).slice(0, wordLength));
      } else if (e.key === "Backspace") {
        setCurrentGuess((guess) => guess.slice(0, -1));
      } else if (e.key === "Enter") {
        if (currentGuess.length !== wordLength) {
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

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGuess]);

  let rowDivs = [];
  let i = 0;
  for (const guess of guesses) {
    rowDivs.push(
      <Row
        key={i++}
        rowState={RowState.LockedIn}
        letters={guess}
        target={props.target}
      />
    );
  }
  if (rowDivs.length < maxGuesses) {
    rowDivs.push(
      <Row
        key={i++}
        rowState={RowState.Pending}
        letters={currentGuess}
        target={props.target}
      />
    );
    while (rowDivs.length < maxGuesses) {
      rowDivs.push(
        <Row
          key={i++}
          rowState={RowState.Pending}
          letters=""
          target={props.target}
        />
      );
    }
  }

  return <div className="Game">{rowDivs}</div>;
}

export default Game;
