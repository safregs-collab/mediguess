import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function ArchiveGrid() {
  const { cases, dailyState, activeFilter, setActiveFilter, loadArchiveCase } = useGameStore();
  const [search, setSearch] = useState('');

  const specialtyMap = new Map<string, string>();
  cases.forEach((c) => specialtyMap.set(c.specialty, c.specialtyName));

  const searchLower = search.trim().toLowerCase();
  const filtered = cases.filter((c) => {
    const matchesFilter = activeFilter === 'all' || c.specialty === activeFilter;
    const matchesSearch =
      searchLower === '' ||
      c.diagnosis.some((d) => d.toLowerCase().includes(searchLower)) ||
      c.clues.some((clue) => clue.toLowerCase().includes(searchLower)) ||
      c.specialtyName.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="archive" className="section active">
      <div className="game-card">
        <div className="game-header">
          <div className="game-title">📚 Архив кейсов</div>
        </div>
        <div className="archive-filters">
          <button className={`filter-chip${activeFilter === 'all' ? ' active' : ''}`} onClick={() => setActiveFilter('all')}>
            Все
          </button>
          {Array.from(specialtyMap.entries()).map(([key, name]) => (
            <button key={key} className={`filter-chip${activeFilter === key ? ' active' : ''}`} onClick={() => setActiveFilter(key)}>
              {name}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            className="diagnosis-input"
            placeholder="🔍 Поиск по диагнозу, симптому или специальности..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="archive-grid">
          {filtered.map((c) => {
            let status = '⬜';
            if (dailyState && dailyState.caseId === c.id && dailyState.finished) {
              status = dailyState.won ? '✅' : '❌';
            }
            return (
              <div key={c.id} className="archive-card" onClick={() => loadArchiveCase(c.id)}>
                <div className="archive-card-header">
                  <span className="archive-case-num">Кейс #{c.id}</span>
                  <span className="archive-status">{status}</span>
                </div>
                <span className={`specialty-tag tag-${c.specialty}`}>{c.specialtyName}</span>
                <p className="archive-clue-preview" style={{ marginTop: '8px' }}>
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
