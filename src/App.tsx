import "./App.css";
import { maxGuesses, seed } from "./util";
import Game from "./Game";
import { useEffect, useState } from "react";
import { About } from "./About";

function useSetting<T>(
  key: string,
  initial: T
): [T, (value: T | ((t: T) => T)) => void] {
  const [current, setCurrent] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch (e) {
      return initial;
    }
  });
  const setSetting = (value: T | ((t: T) => T)) => {
    try {
      const v = value instanceof Function ? value(current) : value;
      setCurrent(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {}
  };
  return [current, setSetting];
}

function App() {
  const [page, setPage] = useState<"game" | "about" | "settings">("game");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useSetting<boolean>("dark", prefersDark);
  const [hard, setHard] = useSetting<boolean>("hard", false);

  useEffect(() => {
    document.body.className = dark ? "dark" : "";
    setTimeout(() => {
      document.body.style.transition = "0.3s background-color ease-out";
    }, 1);
  }, [dark]);

  return (
    <div className="App-container">
      <h1>
        <span style={hard ? { color: "#e66" } : {}}>hell</span>o wordl
      </h1>
      <div className="top-right">
        {page !== "game" ? (
          <a
            className="emoji-link"
            href="#"
            onClick={() => setPage("game")}
            title="Close"
            aria-label="Close"
          >
            ❌
          </a>
        ) : (
          <>
            <a
              className="emoji-link"
              href="#"
              onClick={() => setPage("about")}
              title="About"
              aria-label="About"
            >
              ❓
            </a>
            <a
              className="emoji-link"
              href="#"
              onClick={() => setPage("settings")}
              title="Settings"
              aria-label="Settings"
            >
              ⚙️
            </a>
          </>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 5,
          top: 5,
          visibility: page === "game" ? "visible" : "hidden",
        }}
      >
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
      {page === "about" && <About />}
      {page === "settings" && (
        <div className="Settings">
          <div className="Settings-setting">
            <input
              id="dark-setting"
              type="checkbox"
              checked={dark}
              onChange={() => setDark((x: boolean) => !x)}
            />
            <label htmlFor="dark-setting">Dark theme</label>
          </div>
          <div className="Settings-setting">
            <input
              id="hard-setting"
              type="checkbox"
              checked={hard}
              onChange={() => setHard((x: boolean) => !x)}
            />
            <label htmlFor="hard-setting">Hard mode (must use all clues)</label>
          </div>
        </div>
      )}
      <Game maxGuesses={maxGuesses} hidden={page !== "game"} hard={hard} />
    </div>
  );
}

export default App;
