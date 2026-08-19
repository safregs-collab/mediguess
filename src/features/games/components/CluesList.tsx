interface Props {
  clues: string[];
  revealedCount: number;
  finished: boolean;
}

function parseClue(clue: string): { type: 'text'; content: string } | { type: 'image'; src: string } {
  const match = clue.match(/^\[img:(.+)\]$/);
  if (match) {
    return { type: 'image', src: match[1] };
  }
  return { type: 'text', content: clue };
}

export function CluesList({ clues, revealedCount, finished }: Props) {
  return (
    <div className="clues-container">
      {clues.map((clue, idx) => {
        const isRevealed = idx <= revealedCount || finished;
        const parsed = parseClue(clue);

        if (parsed.type === 'image') {
          return (
            <div
              key={idx}
              className={`clue-item clue-image${isRevealed ? ' revealed' : ' locked'}`}
              style={{ transitionDelay: `${idx * 60}ms` }}
            >
              {isRevealed ? (
                <img src={parsed.src} alt="Медицинское изображение" loading="lazy" />
              ) : (
                <span className="clue-number">{idx + 1}</span>
              )}
            </div>
          );
        }

        return (
          <div
            key={idx}
            className={`clue-item${isRevealed ? ' revealed' : ' locked'}`}
            style={{ transitionDelay: `${idx * 60}ms` }}
          >
            <span className="clue-number">{idx + 1}</span>
            <span className="clue-text">{isRevealed ? parsed.content : ''}</span>
          </div>
        );
      })}
    </div>
  );
}
