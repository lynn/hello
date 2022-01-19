import { Clue, clueClass } from "./clue";

interface KeyboardProps {
  letterInfo: Map<string, Clue>;
  onKey: (key: string) => void;
  disabled: boolean;
}

export function Keyboard(props: KeyboardProps) {
  const keyboard = [
    "q w e r t y u i o p".split(" "),
    "a s d f g h j k l".split(" "),
    "Backspace z x c v b n m Enter".split(" "),
  ];

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
            if (props.disabled) {
              className += " disabled";
            }
            return (
              <div
                tabIndex={-1}
                key={j}
                role="button"
                className={className}
                onClick={() => {
                  props.onKey(label);
                }}
              >
                {label.replace("Backspace", "⌫")}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
