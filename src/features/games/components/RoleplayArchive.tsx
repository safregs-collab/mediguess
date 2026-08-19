import { useState } from 'react';
import { useGameStore } from '../../../shared/store/gameStore';
import type { Role } from '../../../types';

const ROLE_ORDER: { key: Role | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'Все роли', icon: '👥' },
  { key: 'nurse', label: 'Медсестра', icon: '👩‍⚕️' },
  { key: 'intern', label: 'Интерн', icon: '🩺' },
  { key: 'resident', label: 'Ординатор', icon: '📋' },
  { key: 'physician', label: 'Врач', icon: '👨‍⚕️' },
  { key: 'surgeon', label: 'Хирург', icon: '🔪' },
  { key: 'anesthesiologist', label: 'Анестезиолог', icon: '💉' },
  { key: 'therapist', label: 'Терапевт', icon: '🏥' },
  { key: 'pediatrician', label: 'Педиатр', icon: '👶' },
];

export function RoleplayArchive() {
  const { roleplayCases, roleplayState, roleplayRoleFilter, setRoleplayRoleFilter, loadRoleplayArchiveCase } = useGameStore();
  const [search, setSearch] = useState('');

  const searchLower = search.trim().toLowerCase();
  const filtered = roleplayCases.filter((c) => {
    const matchesRole = roleplayRoleFilter === 'all' || c.role === roleplayRoleFilter;
    const matchesSearch =
      searchLower === '' ||
      c.diagnosis.some((d) => d.toLowerCase().includes(searchLower)) ||
      c.clues.some((clue) => clue.toLowerCase().includes(searchLower)) ||
      c.roleName.toLowerCase().includes(searchLower);
    return matchesRole && matchesSearch;
  });

  return (
    <section id="roleplayArchive" className="section active">
      <div className="game-card">
        <div className="game-header">
          <div className="game-title">🎭 Архив ролевых кейсов</div>
        </div>
        <div className="archive-filters">
          {ROLE_ORDER.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`filter-chip${roleplayRoleFilter === key ? ' active' : ''}`}
              onClick={() => setRoleplayRoleFilter(key as Role | 'all')}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            className="diagnosis-input"
            placeholder="🔍 Поиск по диагнозу, симптому или роли..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="archive-grid">
          {filtered.map((c) => {
            let status = '⬜';
            if (roleplayState && roleplayState.caseId === c.id && roleplayState.finished) {
              status = roleplayState.won ? '✅' : '❌';
            }
            return (
              <div key={c.id} className="archive-card" onClick={() => loadRoleplayArchiveCase(c.id)}>
                <div className="archive-card-header">
                  <span className="archive-case-num">Кейс #{c.id}</span>
                  <span className="archive-status">{status}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span className={`role-tag tag-${c.role}`}>{c.roleName}</span>
                  <span className={`difficulty-badge difficulty-${c.difficulty}`}>
                    {'★'.repeat(c.difficulty)}{'☆'.repeat(3 - c.difficulty)}
                  </span>
                </div>
                <p className="archive-clue-preview">
                  {c.clues[0].substring(0, 80)}...
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
