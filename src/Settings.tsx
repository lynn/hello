type setSettingsFn<T> = { (value: T | ((value: T) => T)): void };

interface SettingsProps {
  dark: boolean;
  setDark: setSettingsFn<boolean>;
  colorBlind: boolean;
  setColorBlind: setSettingsFn<boolean>;
  difficulty: number;
  setDifficulty: setSettingsFn<number>;
  keyboard: string;
  setKeyboard: setSettingsFn<string>;
  enterLeft: boolean;
  setEnterLeft: setSettingsFn<boolean>;
}

const Settings = ({
  dark,
  setDark,
  colorBlind,
  setColorBlind,
  difficulty,
  setDifficulty,
  keyboard,
  setKeyboard,
  enterLeft,
  setEnterLeft,
}: SettingsProps) => (
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
        id="colorblind-setting"
        type="checkbox"
        checked={colorBlind}
        onChange={() => setColorBlind((x: boolean) => !x)}
      />
      <label htmlFor="colorblind-setting">Color blind mode</label>
    </div>
    <div className="Settings-setting">
      <input
        id="difficulty-setting"
        type="range"
        min="0"
        max="2"
        value={difficulty}
        onChange={(e) => setDifficulty(+e.target.value)}
      />
      <div>
        <label htmlFor="difficulty-setting">Difficulty:</label>
        <strong>{["Normal", "Hard", "Ultra Hard"][difficulty]}</strong>
        <div
          style={{
            fontSize: 14,
            height: 40,
            marginLeft: 8,
            marginTop: 8,
          }}
        >
          {
            [
              `Guesses must be valid dictionary words.`,
              `Wordle's "Hard Mode". Green letters must stay fixed, and yellow letters must be reused.`,
              `An even stricter Hard Mode. Yellow letters must move away from where they were clued, and gray clues must be obeyed.`,
            ][difficulty]
          }
        </div>
      </div>
    </div>
    <div className="Settings-setting">
      <label htmlFor="keyboard-setting">Keyboard layout:</label>
      <select
        name="keyboard-setting"
        id="keyboard-setting"
        value={keyboard}
        onChange={(e) => setKeyboard(e.target.value)}
      >
        <option value="qwertyuiop-asdfghjkl-BzxcvbnmE">QWERTY</option>
        <option value="azertyuiop-qsdfghjklm-BwxcvbnE">AZERTY</option>
        <option value="qwertzuiop-asdfghjkl-ByxcvbnmE">QWERTZ</option>
        <option value="BpyfgcrlE-aoeuidhtns-qjkxbmwvz">Dvorak</option>
        <option value="qwfpgjluy-arstdhneio-BzxcvbkmE">Colemak</option>
      </select>
      <input
        style={{ marginLeft: 20 }}
        id="enter-left-setting"
        type="checkbox"
        checked={enterLeft}
        onChange={() => setEnterLeft((x: boolean) => !x)}
      />
      <label htmlFor="enter-left-setting">"Enter" on left side</label>
    </div>
  </div>
);

export default Settings;
