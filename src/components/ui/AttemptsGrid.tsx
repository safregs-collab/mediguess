interface Props {
  history: string[];
  currentAttempt: number;
  finished: boolean;
}

export function AttemptsGrid({ history, currentAttempt, finished }: Props) {
  return (
    <div className="attempts-grid">
      {Array.from({ length: 6 }).map((_, i) => {
        const status = history[i];
        let className = 'attempt-cell';
        if (status === 'correct') className += ' correct';
        else if (status === 'wrong') className += ' wrong';
        else if (i === currentAttempt && !finished) className += ' current';
        else className += ' future';
        return <div key={i} className={className} />;
      })}
    </div>
  );
}
