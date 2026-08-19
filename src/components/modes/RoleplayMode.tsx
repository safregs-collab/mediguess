import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { roles, getCasesByRole, getRoleplayCaseById } from '../../data/roleplay';
import { AttemptsGrid } from '../ui/AttemptsGrid';
import { CluesList } from '../ui/CluesList';
import { DiagnosisInput } from '../ui/DiagnosisInput';
import { ResultPanel } from '../ui/ResultPanel';

export function RoleplayMode() {
  const { roleplayState, initRoleplay } = useGameStore();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  if (!roleplayState) {
    return (
      <div className="game-card">
        <div className="roleplay-intro">
          <h2>🎭 Ролевой режим</h2>
          <p>Выберите роль, чтобы начать игру</p>
        </div>
        <div className="role-grid">
          {roles.map(role => (
            <button
              key={role.key}
              className="role-card"
              onClick={() => {
                setSelectedRole(role.key);
                initRoleplay(role.key);
              }}
            >
              <div className="role-card-icon">{role.icon}</div>
              <div className="role-card-name">{role.label}</div>
              <div className="role-card-count">{getCasesByRole(role.key).length} кейсов</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentCase = getRoleplayCaseById(roleplayState.caseId);
  if (!currentCase) return <div className="loading">Кейс не найден</div>;

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="game-title">🎭 {currentCase.roleName}</div>
        <span className="difficulty-badge difficulty-{currentCase.difficulty}">{'★'.repeat(currentCase.difficulty)}{'☆'.repeat(3 - currentCase.difficulty)}</span>
      </div>
      <AttemptsGrid
        history={roleplayState.history}
        currentAttempt={roleplayState.attempts}
        finished={roleplayState.finished}
      />
      <CluesList
        clues={currentCase.clues}
        revealedCount={roleplayState.attempts}
        finished={roleplayState.finished}
      />
      <DiagnosisInput mode="roleplay" disabled={roleplayState.finished} />
      {roleplayState.finished && (
        <ResultPanel
          mode="roleplay"
          currentCase={currentCase}
          state={roleplayState}
        />
      )}
    </div>
  );
}
