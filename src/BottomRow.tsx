interface BottomRowProps {
  wordLength: number;
  totalScore: number;
}

export function BottomRow(props: BottomRowProps) {
  const { wordLength, totalScore } = props;
  const cells = Array(wordLength)
    .fill(0)
    .map((_, i) => <td key={i} className="Row-letter hidden" />);

  return (
    <tr key="bottom" className="Bottom-Row" data-row-score={totalScore}>
      {cells}
    </tr>
  );
}
