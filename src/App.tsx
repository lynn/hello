import "./App.css";
import { seed } from "./util";
import Game from "./Game";
import { useState } from "react";
import { Row, RowState } from "./Row";
import { Clue } from "./clue";

const maxGuesses = 6;

function About() {
  return (
    <div className="App-about">
      <p>
        <i>hello wordl</i> is a remake of the word game{" "}
        <a href="https://www.powerlanguage.co.uk/wordle/">
          <i>Wordle</i>
        </a>{" "}
        by <a href="https://twitter.com/powerlanguish">powerlanguage</a>, which
        I think is based on the TV show <i>Lingo</i>.
      </p>
      <p>
        You get {maxGuesses} tries to guess a target word.
        <br />
        After each guess, you get Mastermind-style feedback:
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={4}
        cluedLetters={[
          { clue: Clue.Absent, letter: "w" },
          { clue: Clue.Absent, letter: "o" },
          { clue: Clue.Correct, letter: "r" },
          { clue: Clue.Elsewhere, letter: "d" },
        ]}
      />
      <p>
        <b>W</b> and <b>O</b> aren't in the target word at all.
        <br />
        <b>R</b> is correct! The third letter is <b>R</b>
        .<br />
        <b>D</b> occurs <em>elsewhere</em> in the target word.
      </p>
      <p>
        Let's move the <b>D</b> in our next guess:
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={4}
        cluedLetters={[
          { clue: Clue.Correct, letter: "d" },
          { clue: Clue.Correct, letter: "a" },
          { clue: Clue.Correct, letter: "r" },
          { clue: Clue.Absent, letter: "k" },
        ]}
      />
      <p>So close!</p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={4}
        cluedLetters={[
          { clue: Clue.Correct, letter: "d" },
          { clue: Clue.Correct, letter: "a" },
          { clue: Clue.Correct, letter: "r" },
          { clue: Clue.Correct, letter: "t" },
        ]}
      />
      <p>Got it!</p>
      <p>
        Report issues{" "}
        <a href="https://github.com/lynn/hello-wordl/issues">here</a>, or tweet{" "}
        <a href="https://twitter.com/chordbug">@chordbug</a>.
      </p>
    </div>
  );
}

function App() {
  const [about, setAbout] = useState(false);
  return (
    <div className="App-container">
      <h1>hello wordl</h1>
      <div style={{ position: "absolute", right: 5, top: 5 }}>
        <a href="#" onClick={() => setAbout((a) => !a)}>
          {about ? "Close" : "About"}
        </a>
      </div>
      <div style={{ position: "absolute", left: 5, top: 5 }}>
        <a
          href="#"
          onClick={() =>
            (document.location = seed
              ? "?"
              : "?seed=" +
                new Date().toISOString().replace(/-/g, "").slice(0, 8))
          }
        >
          {seed ? "Random" : "Today's"}
        </a>
      </div>
      {about && <About />}
      <Game maxGuesses={maxGuesses} hidden={about} />
    </div>
  );
}

export default App;
