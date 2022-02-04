import { useEffect, useRef, useState } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue, describeClue, violation } from "./clue";
import { Keyboard } from "./Keyboard";
import targetList from "./targets.json";
import {
  describeSeed,
  dictionarySet,
  Difficulty,
  pick,
  resetRng,
  seed,
  speak,
  urlParam,
} from "./util";
import { decode, encode } from "./base64";

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  maxGuesses: number;
  hidden: boolean;
  difficulty: Difficulty;
  colorBlind: boolean;
  keyboardLayout: string;
}

const targets = targetList.slice(0, targetList.indexOf("wirylizacja") + 1); // Words no rarer than this one
const minLength = 5;
const maxLength = 11;

function randomTarget(wordLength: number): string {
  const eligible = targets.filter((word) => word.length === wordLength);
  let candidate: string;
  do {
    candidate = pick(eligible);
  } while (/\*/.test(candidate));
  return candidate;
}

function getChallengeUrl(target: string): string {
  return (
    window.location.origin +
    window.location.pathname +
    "?challenge=" +
    encode(target)
  );
}

let initChallenge = "";
let challengeError = false;
try {
  initChallenge = decode(urlParam("challenge") ?? "").toLowerCase();
} catch (e) {
  console.warn(e);
  challengeError = true;
}
if (initChallenge && !dictionarySet.has(initChallenge)) {
  initChallenge = "";
  challengeError = true;
}

// function parseUrlLength(): number {
//   const lengthParam = urlParam("length");
//   if (!lengthParam) return 5;
//   const length = Number(lengthParam);
//   return length >= minLength && length <= maxLength ? length : 5;
// }

function getWordLength() {
  const param = urlParam("seed");
  if (!param) return randomIntFromInterval(minLength, maxLength);
  
  // get wordLength based on today's date
  const today = new Date();
  const dayOfTheMonth = today.getDate();
  let wordLength = dayOfTheMonth % (maxLength + 1);
  if (wordLength < minLength)
    wordLength = minLength;
  
  return wordLength;
}

function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function parseUrlGameNumber(): number {
  const gameParam = urlParam("game");
  if (!gameParam) return 1;
  const gameNumber = Number(gameParam);
  return gameNumber >= 1 && gameNumber <= 1000 ? gameNumber : 1;
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [challenge, setChallenge] = useState<string>(initChallenge);
  const [wordLength, setWordLength] = useState(
    challenge ? challenge.length : getWordLength()
  );
  // const [gameNumber, setGameNumber] = useState(parseUrlGameNumber());
  const [gameNumber, setGameNumber] = useState(1);
  const [target, setTarget] = useState(() => {
    resetRng();
    // Skip RNG ahead to the parsed initial game number:
    for (let i = 1; i < gameNumber; i++) randomTarget(wordLength);
    return challenge || randomTarget(wordLength);
  });
  const [hint, setHint] = useState<string>(
    challengeError
      ? `losowa gra.`
      : `Wymyśl pierwsze słowo, które kończy się na "cja".`
  );
  const currentSeedParams = () =>
    `?seed=${seed}&game=${gameNumber}`;
  useEffect(() => {
    if (seed) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + currentSeedParams()
      );
    }
  }, [wordLength, gameNumber]);
  const tableRef = useRef<HTMLTableElement>(null);
  const startNextGame = () => {
    if (challenge) {
      // Clear the URL parameters:
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setChallenge("");
    const newWordLength =
      wordLength >= minLength && wordLength <= maxLength ? wordLength : 5;
    setWordLength(newWordLength);
    setTarget(randomTarget(newWordLength));
    setHint("");
    setGuesses([]);
    setCurrentGuess("");
    setGameState(GameState.Playing);
    // setGameNumber((x) => x + 1);
    setGameNumber(1);
  };

  async function share(copiedHint: string, text?: string) {
    const url = seed
      ? window.location.origin + window.location.pathname + currentSeedParams()
      : getChallengeUrl(target);
    const body = url + (text ? "\n\n" + text : "");
    if (
      /android|iphone|ipad|ipod|webos/i.test(navigator.userAgent) &&
      !/firefox/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({ text: body });
        return;
      } catch (e) {
        console.warn("navigator.share failed:", e);
      }
    }
    try {
      await navigator.clipboard.writeText(body);
      setHint(copiedHint);
      return;
    } catch (e) {
      console.warn("navigator.clipboard.writeText failed:", e);
    }
    setHint(url);
  }

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
      tableRef.current?.focus();
      setHint("");
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
      setHint("");
    } else if (key === "Enter") {
      if (currentGuess.length !== wordLength) {
        setHint("Wyraz za krótki");
        return;
      }
      if (!dictionary.includes(currentGuess)) {
        setHint("Nie ma takiego wyrazu, nygusie.");
        return;
      }
      for (const g of guesses) {
        const c = clue(g, target);
        const feedback = violation(props.difficulty, c, currentGuess);
        if (feedback) {
          setHint(feedback);
          return;
        }
      }
      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess((guess) => "");

      const gameOver = (verbed: string) =>
        `You ${verbed}! Poprawna odpowiedź to ${target.toUpperCase()}.`;

      if (currentGuess === target) {
        setHint(gameOver("wygrałeś"));
        setGameState(GameState.Won);
      } else if (guesses.length + 1 === props.maxGuesses) {
        setHint(gameOver("przegrałeś"));
        setGameState(GameState.Lost);
      } else {
        setHint("");
        speak(describeClue(clue(currentGuess, target)));
      }
    }
  };

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
        {/*<label htmlFor="wordLength">Liczba liter:</label>*/}
        {/*<input*/}
        {/*  type="range"*/}
        {/*  min={minLength}*/}
        {/*  max={maxLength}*/}
        {/*  id="wordLength"*/}
        {/*  disabled={*/}
        {/*    gameState === GameState.Playing &&*/}
        {/*    (guesses.length > 0 || currentGuess !== "" || challenge !== "")*/}
        {/*  }*/}
        {/*  value={wordLength}*/}
        {/*  onChange={(e) => {*/}
        {/*    const length = Number(e.target.value);*/}
        {/*    resetRng();*/}
        {/*    setGameNumber(1);*/}
        {/*    setGameState(GameState.Playing);*/}
        {/*    setGuesses([]);*/}
        {/*    setCurrentGuess("");*/}
        {/*    setTarget(randomTarget(length));*/}
        {/*    setWordLength(length);*/}
        {/*    setHint(`${length} liter`);*/}
        {/*  }}*/}
        {/*></input>*/}
        {/*<button*/}
        {/*  style={{ flex: "0 0 auto" }}*/}
        {/*  disabled={gameState !== GameState.Playing || guesses.length === 0}*/}
        {/*  onClick={() => {*/}
        {/*    setHint(*/}
        {/*      `Poprawna odpowiedź to ${target.toUpperCase()}. (Wciśnij Enter żeby zagrać jeszcze raz)`*/}
        {/*    );*/}
        {/*    setGameState(GameState.Lost);*/}
        {/*    (document.activeElement as HTMLElement)?.blur();*/}
        {/*  }}*/}
        {/*>*/}
        {/*  Poddaj się*/}
        {/*</button>*/}
      </div>
      <table
        className="Game-rows"
        tabIndex={0}
        aria-label="Table of guesses"
        ref={tableRef}
      >
        <tbody>{tableRows}</tbody>
      </table>
      <p
        role="alert"
        style={{
          userSelect: /https?:/.test(hint) ? "text" : "none",
          whiteSpace: "pre-wrap",
        }}
      >
        {hint || `\u00a0`}
      </p>
      <Keyboard
        layout={props.keyboardLayout}
        letterInfo={letterInfo}
        onKey={onKey}
      />
      {/*<div className="Game-seed-info">*/}
      {/*  {challenge*/}
      {/*    ? "playing a challenge game"*/}
      {/*    : seed*/}
      {/*    ? `${describeSeed(seed)} — length ${wordLength}, game ${gameNumber}`*/}
      {/*    : "losowa gra"}*/}
      {/*</div>*/}
      <p>
        {/*<button*/}
        {/*  onClick={() => {*/}
        {/*    share("Link copied to clipboard!");*/}
        {/*  }}*/}
        {/*>*/}
        {/*  Wyślij link znajomemu*/}
        {/*</button>{" "}*/}
        {/*{gameState !== GameState.Playing && (*/}
        {/*  <button*/}
        {/*    onClick={() => {*/}
        {/*      const emoji = props.colorBlind*/}
        {/*        ? ["⬛", "🟦", "🟧"]*/}
        {/*        : ["⬛", "🟨", "🟩"];*/}
        {/*      share(*/}
        {/*        "Result copied to clipboard!",*/}
        {/*        guesses*/}
        {/*          .map((guess) =>*/}
        {/*            clue(guess, target)*/}
        {/*              .map((c) => emoji[c.clue ?? 0])*/}
        {/*              .join("")*/}
        {/*          )*/}
        {/*          .join("\n")*/}
        {/*      );*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    Share emoji results*/}
        {/*  </button>*/}
        {/*)}*/}
      </p>
    </div>
  );
}

export default Game;
