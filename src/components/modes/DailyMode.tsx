import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getCaseById } from '../../data/cases';
import { AttemptsGrid } from '../ui/AttemptsGrid';
import { CluesList } from '../ui/CluesList';
import { DiagnosisInput } from '../ui/DiagnosisInput';
import { ResultPanel } from '../ui/ResultPanel';

export function DailyMode() {
  const { dailyState, initDaily } = useGameStore();

  useEffect(() => {
    initDaily();
  }, [initDaily]);

  if (!dailyState) return <div className="loading">Загрузка...</div>;

  const currentCase = getCaseById(dailyState.caseId);
  if (!currentCase) return <div className="loading">Кейс не найден</div>;

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="game-title">Кейс #{currentCase.id}</div>
        <span className={`specialty-tag tag-${currentCase.specialty}`}>
          {currentCase.specialtyName}
        </span>
      </div>
      <AttemptsGrid
        history={dailyState.history}
        currentAttempt={dailyState.attempts}
        finished={dailyState.finished}
      />
      <CluesList
        clues={currentCase.clues}
        revealedCount={dailyState.attempts}
        finished={dailyState.finished}
      />
      <DiagnosisInput mode="daily" disabled={dailyState.finished} />
      {dailyState.finished && (
        <ResultPanel
          mode="daily"
          currentCase={currentCase}
          state={dailyState}
        />
      )}
    </div>
  );
}
