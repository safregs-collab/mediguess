import { useGameStore } from '../../store/gameStore';
import type { Case, RoleplayCase } from '../../types';

interface Props {
  mode: 'daily' | 'endless' | 'roleplay';
  currentCase: Case | RoleplayCase;
  state: { attempts: number; won: boolean };
}

export function ResultPanel({ mode, currentCase, state }: Props) {
  const { resetEndless, resetRoleplay, showToast } = useGameStore();

  const handleShare = () => {
    const text = `MediGuess ${mode === 'daily' ? '#' + currentCase.id : '♾️'}\n${state.won ? '✅ Угадано с ' + state.attempts + '-й попытки' : '❌ Не угадано'}\nhttps://mediguess.app`;
    navigator.clipboard.writeText(text).then(() => showToast('📋 Результат скопирован'));
  };

  const handleAnki = () => {
    const tag = (currentCase as Case).ankiTag || ('case_' + currentCase.id);
    navigator.clipboard.writeText('#' + tag).then(() => showToast('📋 Anki-тег скопирован'));
  };

  return (
    <div className={`result-area ${state.won ? 'win' : 'lose'}`}>
      <div className="result-title">
        {state.won ? '🎉 Победа!' : '💔 Поражение'}
      </div>
      <div className="explanation-box">
        <strong>Объяснение:</strong><br />
        {currentCase.explanation}
      </div>
      <div className="anki-tag" onClick={handleAnki}>
        📋 #{(currentCase as Case).ankiTag || ('case_' + currentCase.id)}
      </div>
      {state.won && (
        <button className="btn-primary share-btn" onClick={handleShare}>
          📤 Поделиться результатом
        </button>
      )}
      {mode === 'endless' && (
        <button className="btn-secondary next-case-btn" onClick={resetEndless}>
          ➡️ Следующий кейс
        </button>
      )}
      {mode === 'roleplay' && (
        <button className="btn-secondary next-case-btn" onClick={resetRoleplay}>
          ➡️ Следующий кейс
        </button>
      )}
    </div>
  );
}
