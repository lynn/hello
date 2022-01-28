interface GuessProps {
  onKey: (key: string) => void;
  wordLength: number;
}

export function RandomGuess(props: GuessProps) {
  return (
    <div className="Game-random" aria-hidden="true">
      <div className="Game-random-guess"
        tabIndex={-1}
        role="button"
        onClick={() => {
          let guess = "";
          for (let i = 0; i < props.wordLength; i++) {
            props.onKey("Backspace")
          }
          const chars = "abcdefghijklmnopqrstuvwxyz";
          for (let i = 0; i < props.wordLength; i++) {
            let letter = chars.charAt(Math.random() * chars.length)
            props.onKey(letter);
          }
        }}
      >
        Random Guess
      </div>
    </div>
  );
}
