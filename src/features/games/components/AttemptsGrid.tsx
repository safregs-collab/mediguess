import type { GuessResult } from '../../../types';

interface Props {
  history: GuessResult[];
  currentAttempt: number;
  finished: boolean;
}

export function AttemptsGrid({ history, currentAttempt, finished }: Props) {
  return (
    <div className="attempts-grid">
      {Array.from({ length: 6 }).map((_, i) => {
        let cls = 'attempt-cell';
        if (i < history.length) {
          cls += history[i] === 'correct' ? ' correct' : ' wrong';
        } else if (i === currentAttempt && !finished) {
          cls += ' current';
        } else {
          cls += ' future';
        }
        return <div key={i} className={cls}></div>;
      })}
    </div>
  );
}
