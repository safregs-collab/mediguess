import { useGameStore } from '../../store/gameStore';
import { getCaseById } from '../../data/cases';
import { AttemptsGrid } from '../ui/AttemptsGrid';
import { CluesList } from '../ui/CluesList';
import { DiagnosisInput } from '../ui/DiagnosisInput';
import { ResultPanel } from '../ui/ResultPanel';

export function EndlessMode() {
  const { endlessState } = useGameStore();

  if (!endlessState) return <div className="loading">Загрузка...</div>;

  const currentCase = getCaseById(endlessState.caseId);
  if (!currentCase) return <div className="loading">Кейс не найден</div>;

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="game-title">Бесконечный режим</div>
        <span className={`specialty-tag tag-${currentCase.specialty}`}>
          {currentCase.specialtyName}
        </span>
      </div>
      <AttemptsGrid
        history={endlessState.history}
        currentAttempt={endlessState.attempts}
        finished={endlessState.finished}
      />
      <CluesList
        clues={currentCase.clues}
        revealedCount={endlessState.attempts}
        finished={endlessState.finished}
      />
      <DiagnosisInput mode="endless" disabled={endlessState.finished} />
      {endlessState.finished && (
        <ResultPanel
          mode="endless"
          currentCase={currentCase}
          state={endlessState}
        />
      )}
    </div>
  );
}
