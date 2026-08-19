import { useState } from 'react';
import { useGameStore } from '../../../shared/store/gameStore';
import type { Role } from '../../../types';
import { AttemptsGrid } from './AttemptsGrid';
import { CluesList } from './CluesList';
import { RoleplayDiagnosisInput } from './RoleplayDiagnosisInput';
import { RoleplayResultPanel } from './RoleplayResultPanel';

const ROLES: { key: Role; label: string; icon: string; desc: string }[] = [
  { key: 'nurse', label: 'Медсестра', icon: '👩‍⚕️', desc: 'Экстренные ситуации в палате' },
  { key: 'intern', label: 'Интерн', icon: '🩺', desc: 'Первичный приём и диагностика' },
  { key: 'resident', label: 'Ординатор', icon: '📋', desc: 'Сложные случаи в стационаре' },
  { key: 'physician', label: 'Врач', icon: '👨‍⚕️', desc: 'Редкие и тяжёлые патологии' },
  { key: 'surgeon', label: 'Хирург', icon: '🔪', desc: 'Острые хирургические состояния' },
  { key: 'anesthesiologist', label: 'Анестезиолог', icon: '💉', desc: 'Периоперационные осложнения' },
  { key: 'therapist', label: 'Терапевт', icon: '🏥', desc: 'Хронические и острые заболевания' },
  { key: 'pediatrician', label: 'Педиатр', icon: '👶', desc: 'Детские патологии' },
];

export function RoleplayBoard() {
  const { roleplayCases, roleplayState, loadRoleplayCase, resetRoleplayState } = useGameStore();
  const [imgOpen, setImgOpen] = useState(true);

  const currentCase = roleplayCases.find((c) => c.id === roleplayState?.caseId) || null;
  const state = roleplayState;

  const countByRole = (role: Role) => roleplayCases.filter((c) => c.role === role).length;

  if (!currentCase || !state) {
    return (
      <section id="roleplay" className="section active">
        <div className="game-card">
          <div className="game-header">
            <div className="game-title">🎭 Ролевой режим</div>
          </div>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
            Выберите роль, чтобы начать игру
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {ROLES.map(({ key, label, icon, desc }) => {
              const count = countByRole(key);
              return (
                <div
                  key={key}
                  className="archive-card"
                  onClick={() => loadRoleplayCase(key)}
                  style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = '';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{desc}</div>
                  <span className={`role-tag tag-${key}`}>{count} кейсов</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  const hasImage = !!currentCase.image;

  return (
    <section id="roleplay" className="section active">
      <div className="game-card">
        <div className="game-header">
          <div className="game-title">🎭 Кейс #{currentCase.id}</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`role-tag tag-${currentCase.role}`}>{currentCase.roleName}</span>
            <span className={`difficulty-badge difficulty-${currentCase.difficulty}`}>
              {'★'.repeat(currentCase.difficulty)}{'☆'.repeat(3 - currentCase.difficulty)}
            </span>
          </div>
        </div>

        <AttemptsGrid history={state.history} currentAttempt={state.attempts} finished={state.finished} />
        <CluesList clues={currentCase.clues} revealedCount={state.attempts} finished={state.finished} />
        <RoleplayDiagnosisInput disabled={state.finished} />
        <RoleplayResultPanel currentCase={currentCase} state={state} />

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button className="btn-secondary" onClick={resetRoleplayState}>
            ← Выбрать другую роль
          </button>
        </div>
      </div>

      {hasImage && (
        <div className={`floating-image${imgOpen ? '' : ' collapsed'}`}>
          <div className="floating-image-tab" onClick={() => setImgOpen((v) => !v)}>
            {imgOpen ? '›' : '‹'}
          </div>
          <div className="floating-image-panel">
            <div className="floating-image-label">📎 Медицинское изображение</div>
            <img src={currentCase.image} alt="Медицинское изображение" loading="lazy" />
          </div>
        </div>
      )}
    </section>
  );
}
