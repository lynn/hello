import "./App.css";
import common from "./common.json";
import { dictionarySet, pick } from "./util";
import Game from "./Game";
import { names } from "./names";
import { useState } from "react";

const targets = common
  .slice(0, 20000) // adjust for max target freakiness
  .filter((word) => dictionarySet.has(word) && !names.has(word));

function randomTarget(wordLength: number) {
  const eligible = targets.filter((word) => word.length === wordLength);
  return pick(eligible);
}

function App() {
  const [wordLength, setWordLength] = useState(5);
  const [target, setTarget] = useState(randomTarget(wordLength));
  if (target.length !== wordLength) {
    throw new Error("length mismatch");
  }
  return (
    <>
      <h1>hello wordl</h1>
      <input
        type="range"
        min="4"
        max="11"
        value={wordLength}
        onChange={(e) => {
          const length = Number(e.target.value);
          setTarget(randomTarget(length));
          setWordLength(length);
        }}
      ></input>
      <div className="App">
        <Game
          key={target}
          wordLength={wordLength}
          target={target}
          maxGuesses={6}
          restart={() => {
            setTarget(randomTarget(wordLength));
          }}
        />
      </div>
    </>
  );
}

export default App;
