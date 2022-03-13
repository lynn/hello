import { Clue, clueClass } from "./clue";
import letterPoints from "./letterPoints";

interface KeyboardProps {
  layout: string;
  letterInfo: Map<string, Clue>;
  onKey: (key: string) => void;
}

export function Keyboard(props: KeyboardProps) {
  const keyboard = props.layout
    .split("-")
    .map((row) =>
      row
        .split("")
        .map((key) => key.replace("B", "Backspace").replace("E", "Enter"))
    );

  return (
    <div className="Game-keyboard" aria-hidden="true">
      {keyboard.map((row, i) => (
        <div key={i} className="Game-keyboard-row">
          {row.map((label, j) => {
            let className = "Game-keyboard-button";
            const clue = props.letterInfo.get(label);
            if (clue !== undefined) {
              className += " " + clueClass(clue);
            }
            if (label.length > 1) {
              className += " Game-keyboard-button-wide";
            }
            return (
              <button
                tabIndex={-1}
                key={j}
                className={className}
                onClick={() => {
                  props.onKey(label);
                }}
              >
                <span className="Button-label">
                  {label.replace("Backspace", "⌫")}
                  <sub className="Button-subscript">{letterPoints[label]}</sub>
                </span>
              </button>

            );
          })}
        </div>
      ))}
    </div>
  );
}
