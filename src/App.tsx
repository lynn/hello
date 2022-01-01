import "./App.css";
import common from "./common.json";
import { dictionarySet, pick } from "./util";
import Game from "./Game";
import { names } from "./names";
import { useEffect, useState } from "react";

const targets = common
  .slice(0, 20000) // adjust for max target freakiness
  .filter((word) => dictionarySet.has(word) && !names.has(word));

function randomTarget(wordLength: number) {
  const eligible = targets.filter((word) => word.length === wordLength);
  console.log(eligible);
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
        min="3"
        max="15"
        value={wordLength}
        onChange={(e) => {
          setTarget(randomTarget(Number(e.target.value)));
          setWordLength(Number(e.target.value));
        }}
      ></input>
      <div className="App">
        <Game
          key={wordLength}
          wordLength={wordLength}
          target={target}
          maxGuesses={6}
        />
      </div>
    </>
  );
}

export default App;
