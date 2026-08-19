import { getDailyCase } from '../logic/gameLogic';
import { useGameStore } from '../../../shared/store/gameStore';
import { AttemptsGrid } from './AttemptsGrid';
import { CluesList } from './CluesList';
import { DiagnosisInput } from './DiagnosisInput';
import { ResultPanel } from './ResultPanel';

interface Props {
  mode: 'daily' | 'endless';
}

export function GameBoard({ mode }: Props) {
  const { cases, dailyState, endlessState } = useGameStore();

  const currentCase =
    mode === 'daily'
      ? getDailyCase(cases)
      : cases.find((c) => c.id === endlessState?.caseId) || null;

  const state = mode === 'daily' ? dailyState : endlessState;

  if (!currentCase || !state) return null;

  return (
    <section id={mode} className="section active">
      <div className="game-card">
        <div className="game-header">
          <div className="game-title">
            {mode === 'daily' ? `Кейс #${currentCase.id}` : 'Бесконечный режим'}
          </div>
          <span className={`specialty-tag tag-${currentCase.specialty}`}>
            {currentCase.specialtyName}
          </span>
        </div>
        <AttemptsGrid history={state.history} currentAttempt={state.attempts} finished={state.finished} />
        <CluesList clues={currentCase.clues} revealedCount={state.attempts} finished={state.finished} />
        <DiagnosisInput mode={mode} disabled={state.finished} />
        <ResultPanel mode={mode} currentCase={currentCase} state={state} />
      </div>
    </section>
  );
}
