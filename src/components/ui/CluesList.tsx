interface Props {
  clues: string[];
  revealedCount: number;
  finished: boolean;
}

export function CluesList({ clues, revealedCount, finished }: Props) {
  return (
    <div className="clues-container">
      {clues.map((clue, i) => {
        const isRevealed = i < revealedCount || finished;
        return (
          <div key={i} className={`clue-item ${isRevealed ? 'revealed' : 'locked'}`}>
            <span className="clue-number">{i + 1}</span>
            <span className="clue-text">{isRevealed ? clue : ''}</span>
          </div>
        );
      })}
    </div>
  );
}
