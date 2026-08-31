import { useGameStore } from '../../../shared/store/gameStore';
import { AttemptsGrid } from './AttemptsGrid';
import { CluesList } from './CluesList';
import { DiagnosisInput } from './DiagnosisInput';
import { ResultPanel } from './ResultPanel';

export function GameBoard() {
  const { currentCase, casesState } = useGameStore();

  if (!currentCase || !casesState) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Загрузка кейса...</p>
      </div>
    );
  }

  return (
    <section className="section active">
      <div className="game-card">
        <div className="game-header">
          <div className="game-title">Кейс #{currentCase.id}</div>
          <span className={`specialty-tag tag-${currentCase.specialty}`}>
            {currentCase.specialtyName}
          </span>
        </div>
        <AttemptsGrid history={casesState.history} currentAttempt={casesState.attempts} finished={casesState.finished} />
        <CluesList clues={currentCase.clues} revealedCount={casesState.attempts} finished={casesState.finished} />
        <DiagnosisInput disabled={casesState.finished} />
        <ResultPanel currentCase={currentCase} state={casesState} />
      </div>
    </section>
  );
}
