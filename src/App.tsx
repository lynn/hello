import "./App.css";
import Game from "./Game";

function App() {
  return (
    <>
      <h1>hello wordl</h1>
      <footer className="App-footer">
        by <a href="https://twitter.com/chordbug">@chordbug</a>, inspired by{" "}
        <a href="https://www.powerlanguage.co.uk/wordle/">wordle</a>. report
        issues <a href="https://github.com/lynn/hello-wordl/issues">here</a>
      </footer>
      <div className="App">
        <Game maxGuesses={6} />
      </div>
    </>
  );
}

export default App;
