import { useGameStore } from '../../../shared/store/gameStore';
import type { RoleplayCase, RoleplayState } from '../../../types';

interface Props {
  currentCase: RoleplayCase;
  state: RoleplayState;
}

export function RoleplayResultPanel({ currentCase, state }: Props) {
  const { loadRoleplayCase, showToast } = useGameStore();

  if (!state.finished) return null;

  const won = state.won;
  const title = won
    ? `🎉 Победа! Диагноз угадан с ${state.attempts}-й попытки`
    : `😔 Поражение. Правильный диагноз: ${currentCase.diagnosis[0]}`;

  const ankiTag = currentCase.diagnosis[0].replace(/[\s\-]/g, '_');

  const handleShare = () => {
    const history = state.history;
    let grid = '';
    for (let i = 0; i < 6; i++) {
      grid += i < history.length ? (history[i] === 'correct' ? '🟩' : '🟥') : '⬜';
    }
    const text = `MediGuess Ролевой режим\n[${currentCase.roleName}]\n${won ? '✅ Угадано с ' + state.attempts + '-й попытки' : '❌ Не угадано'}\n${grid}\nhttps://mediguess.app`;
    navigator.clipboard.writeText(text).then(() => showToast('📋 Результат скопирован'));
  };

  const handleCopyAnki = () => {
    navigator.clipboard.writeText(`#${ankiTag}`).then(() => showToast('📋 Anki-тег скопирован'));
  };

  return (
    <div className={`result-area ${won ? 'win' : 'lose'}`}>
      <div className="result-title">{title}</div>
      <div className="explanation-box">
        <strong>Объяснение:</strong><br />
        {currentCase.explanation}
      </div>
      <div className="anki-tag" onClick={handleCopyAnki}>📋 #{ankiTag}</div>
      {won && (
        <button className="btn-primary share-btn" onClick={handleShare}>
          📤 Поделиться результатом
        </button>
      )}
      <button className="btn-secondary next-case-btn" onClick={() => loadRoleplayCase(currentCase.role)}>
        ➡️ Следующий кейс
      </button>
    </div>
  );
}
