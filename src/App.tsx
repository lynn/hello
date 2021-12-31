import React from "react";
import logo from "./logo.svg";
import "./App.css";
import common from "./common.json";
import { pick } from "./util";
import Game from "./Game";

function App() {
  return <>
    <h1>Wordl!</h1>
    <div className="App">
      <Game target={pick(common)} />
    </div>
  </>;
}

export default App;
