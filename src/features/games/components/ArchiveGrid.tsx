import { useState } from 'react';
import { useGameStore } from '../../../shared/store/gameStore';
import type { Role } from '../../../types';

type ArchiveMode = 'classic' | 'roleplay' | 'simulation';

const ROLE_NAMES: Record<Role, string> = {
  nurse: 'Медсестра',
  intern: 'Интерн',
  resident: 'Ординатор',
  physician: 'Врач',
  surgeon: 'Хирург',
  anesthesiologist: 'Анестезиолог',
  therapist: 'Терапевт',
  pediatrician: 'Педиатр',
};

const ROLE_ICONS: Record<Role, string> = {
  nurse: '👩‍⚕️',
  intern: '🩺',
  resident: '📋',
  physician: '👨‍⚕️',
  surgeon: '🔪',
  anesthesiologist: '💉',
  therapist: '🏥',
  pediatrician: '👶',
};

export function ArchiveGrid() {
  const [archiveMode, setArchiveMode] = useState<ArchiveMode>('classic');
  const [search, setSearch] = useState('');

  const {
    cases,
    roleplayCases,
    simulationCases,
    stats,
    activeFilter,
    setActiveFilter,
    loadArchiveCase,
    loadRoleplayArchiveCase,
    loadSimulationArchiveCase,
  } = useGameStore();

  const getCaseStatus = (caseId: number, mode: ArchiveMode) => {
    const key = mode === 'classic' ? 'endless' : mode;
    const list = stats?.completedCases?.[key] ?? [];
    const found = list.find((c) => c.id === caseId);
    if (!found) return { done: false, won: false };
    return { done: true, won: found.won };
  };

  const renderProgress = (total: number, doneCount: number) => {
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          <span>Прогресс</span>
          <span>{doneCount} / {total} ({pct}%)</span>
        </div>
        <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
        </div>
      </div>
    );
  };

  const renderClassicArchive = () => {
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

    const doneCount = cases.filter((c) => getCaseStatus(c.id, 'classic').done).length;

    return (
      <>
        {renderProgress(cases.length, doneCount)}
        <div className="archive-filters">
          <button className={`filter-chip${activeFilter === 'all' ? ' active' : ''}`} onClick={() => setActiveFilter('all')}>Все</button>
          {Array.from(specialtyMap.entries()).map(([key, name]) => (
            <button key={key} className={`filter-chip${activeFilter === key ? ' active' : ''}`} onClick={() => setActiveFilter(key)}>{name}</button>
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
            const status = getCaseStatus(c.id, 'classic');
            const statusIcon = status.done ? (status.won ? '✅' : '❌') : '⬜';
            return (
              <div key={c.id} className="archive-card" onClick={() => loadArchiveCase(c.id)}>
                <div className="archive-card-header">
                  <span className="archive-case-num">Кейс #{c.id}</span>
                  <span className="archive-status">{statusIcon}</span>
                </div>
                <span className={`specialty-tag tag-${c.specialty}`}>{c.specialtyName}</span>
                <p className="archive-clue-preview" style={{ marginTop: '8px' }}>{c.clues[0].substring(0, 80)}...</p>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderRoleplayArchive = () => {
    const searchLower = search.trim().toLowerCase();
    const filtered = roleplayCases.filter((c) => {
      const matchesFilter = activeFilter === 'all' || c.role === activeFilter;
      const matchesSearch =
        searchLower === '' ||
        c.diagnosis.some((d) => d.toLowerCase().includes(searchLower)) ||
        c.clues.some((clue) => clue.toLowerCase().includes(searchLower)) ||
        c.roleName.toLowerCase().includes(searchLower);
      return matchesFilter && matchesSearch;
    });

    const doneCount = roleplayCases.filter((c) => getCaseStatus(c.id, 'roleplay').done).length;

    return (
      <>
        {renderProgress(roleplayCases.length, doneCount)}
        <div className="archive-filters">
          <button className={`filter-chip${activeFilter === 'all' ? ' active' : ''}`} onClick={() => setActiveFilter('all')}>Все роли</button>
          {(Object.keys(ROLE_NAMES) as Role[]).map((role) => (
            <button key={role} className={`filter-chip${activeFilter === role ? ' active' : ''}`} onClick={() => setActiveFilter(role)}>
              {ROLE_ICONS[role]} {ROLE_NAMES[role]}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            className="diagnosis-input"
            placeholder="🔍 Поиск по диагнозу, роли или симптому..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="archive-grid">
          {filtered.map((c) => {
            const status = getCaseStatus(c.id, 'roleplay');
            const statusIcon = status.done ? (status.won ? '✅' : '❌') : '⬜';
            return (
              <div key={c.id} className="archive-card" onClick={() => loadRoleplayArchiveCase(c.id)}>
                <div className="archive-card-header">
                  <span className="archive-case-num">Кейс #{c.id}</span>
                  <span className="archive-status">{statusIcon}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span className={`role-tag tag-${c.role}`}>{ROLE_ICONS[c.role]} {c.roleName}</span>
                  <span className={`difficulty-badge difficulty-${c.difficulty}`}>{'★'.repeat(c.difficulty)}{'☆'.repeat(3 - c.difficulty)}</span>
                </div>
                <p className="archive-clue-preview" style={{ marginTop: '8px' }}>{c.clues[0].substring(0, 80)}...</p>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderSimulationArchive = () => {
    const searchLower = search.trim().toLowerCase();
    const filtered = simulationCases.filter((c) => {
      const matchesSearch =
        searchLower === '' ||
        c.correctDiagnosis.some((d) => d.toLowerCase().includes(searchLower)) ||
        c.chiefComplaint.toLowerCase().includes(searchLower) ||
        c.patient.name.toLowerCase().includes(searchLower);
      return matchesSearch;
    });

    const doneCount = simulationCases.filter((c) => getCaseStatus(c.id, 'simulation').done).length;

    return (
      <>
        {renderProgress(simulationCases.length, doneCount)}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            className="diagnosis-input"
            placeholder="🔍 Поиск по диагнозу, жалобе или фамилии пациента..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="archive-grid">
          {filtered.map((c) => {
            const status = getCaseStatus(c.id, 'simulation');
            const statusIcon = status.done ? (status.won ? '✅' : '❌') : '⬜';
            return (
              <div key={c.id} className="archive-card" onClick={() => loadSimulationArchiveCase(c.id)}>
                <div className="archive-card-header">
                  <span className="archive-case-num">Симуляция #{c.id}</span>
                  <span className="archive-status">{statusIcon}</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>{c.patient.name}, {c.patient.age} лет</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{c.chiefComplaint.substring(0, 80)}...</div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <section id="archive" className="section active">
      <div className="game-card">
        <div className="game-header">
          <div className="game-title">📚 Архив кейсов</div>
        </div>

        <div className="archive-mode-tabs">
          <button className={`archive-mode-tab${archiveMode === 'classic' ? ' active' : ''}`} onClick={() => { setArchiveMode('classic'); setActiveFilter('all'); setSearch(''); }}>
            📋 Классический
          </button>
          <button className={`archive-mode-tab${archiveMode === 'roleplay' ? ' active' : ''}`} onClick={() => { setArchiveMode('roleplay'); setActiveFilter('all'); setSearch(''); }}>
            🎭 Ролевой
          </button>
          <button className={`archive-mode-tab${archiveMode === 'simulation' ? ' active' : ''}`} onClick={() => { setArchiveMode('simulation'); setActiveFilter('all'); setSearch(''); }}>
            🏥 Симулятор
          </button>
        </div>

        {archiveMode === 'classic' && renderClassicArchive()}
        {archiveMode === 'roleplay' && renderRoleplayArchive()}
        {archiveMode === 'simulation' && renderSimulationArchive()}
      </div>
    </section>
  );
}
