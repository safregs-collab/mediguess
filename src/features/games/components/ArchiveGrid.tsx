import { useState } from 'react';
import { useGameStore } from '../../../shared/store/gameStore';
import type { Profession, UnifiedCase } from '../../../types';
import { AnimatedIcon } from '../../../shared/components/AnimatedIcon';

type ArchiveMode = 'cases' | 'simulator';

const PROF_NAMES: Record<Profession, string> = {
  nurse: 'Медсестра',
  paramedic: 'Фельдшер',
  doctor: 'Врач',
};

function StatusIcon({ done, won }: { done: boolean; won: boolean }) {
  if (!done) return <AnimatedIcon name="square" size={16} color="var(--text-secondary)" />;
  if (won) return <AnimatedIcon name="check" size={16} color="var(--success)" />;
  return <AnimatedIcon name="cross" size={16} color="var(--error)" />;
}

function StarRating({ difficulty }: { difficulty: number }) {
  return (
    <>
      <AnimatedIcon name="star" size={10} color={difficulty >= 1 ? '#f59e0b' : 'var(--border)'} />{' '}
      <AnimatedIcon name="star" size={10} color={difficulty >= 2 ? '#f59e0b' : 'var(--border)'} />{' '}
      <AnimatedIcon name="star" size={10} color={difficulty >= 3 ? '#f59e0b' : 'var(--border)'} />
    </>
  );
}

export function ArchiveGrid() {
  const [archiveMode, setArchiveMode] = useState<ArchiveMode>('cases');
  const [search, setSearch] = useState('');

  const {
    professionCases,
    stats,
    activeFilter,
    setActiveFilter,
    loadArchiveCase,
    loadSimulatorArchiveCase,
  } = useGameStore();

  const getCaseStatus = (caseId: string, mode: ArchiveMode) => {
    const list = stats?.completedCases?.[mode] ?? [];
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

  const renderCasesArchive = () => {
    const allCases = Object.values(professionCases).flat();
    const specialtyMap = new Map<string, string>();
    allCases.forEach((c) => specialtyMap.set(c.specialty, c.specialtyName));

    const searchLower = search.trim().toLowerCase();
    const filtered = allCases.filter((c: UnifiedCase) => {
      const matchesFilter = activeFilter === 'all' || c.specialty === activeFilter;
      const matchesSearch =
        searchLower === '' ||
        c.diagnosis.some((d: string) => d.toLowerCase().includes(searchLower)) ||
        c.clues.some((clue: string) => clue.toLowerCase().includes(searchLower)) ||
        c.specialtyName.toLowerCase().includes(searchLower) ||
        PROF_NAMES[c.profession as Profession].toLowerCase().includes(searchLower);
      return matchesFilter && matchesSearch;
    });

    const doneCount = allCases.filter((c) => getCaseStatus(c.id, 'cases').done).length;

    return (
      <>
        {renderProgress(allCases.length, doneCount)}
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
            placeholder="Поиск по диагнозу, симптому, специальности или профессии..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="archive-grid">
          {filtered.map((c, idx) => {
            const status = getCaseStatus(c.id, 'cases');
            return (
              <div key={c.id} className="archive-card" onClick={() => loadArchiveCase(c.id)} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="archive-card-header">
                  <span className="archive-case-num">Кейс #{c.id}</span>
                  <span className="archive-status"><StatusIcon done={status.done} won={status.won} /></span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span className={`specialty-tag tag-${c.specialty}`}>{c.specialtyName}</span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                    {PROF_NAMES[c.profession]}
                  </span>
                  <span className={`difficulty-badge difficulty-${c.difficulty}`}><StarRating difficulty={c.difficulty} /></span>
                </div>
                <p className="archive-clue-preview" style={{ marginTop: '8px' }}>{c.clues[0].substring(0, 80)}...</p>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderSimulatorArchive = () => {
    const completed = stats?.completedCases?.simulator ?? [];
    const searchLower = search.trim().toLowerCase();
    const filtered = completed.filter((c) => {
      return searchLower === '' || c.id.toLowerCase().includes(searchLower);
    });

    const doneCount = completed.length;

    return (
      <>
        {renderProgress(completed.length + 10, doneCount)}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            className="diagnosis-input"
            placeholder="Поиск по ID сценария..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="archive-grid">
          {filtered.map((c, idx) => {
            const status = getCaseStatus(c.id, 'simulator');
            return (
              <div key={c.id} className="archive-card" onClick={() => loadSimulatorArchiveCase(c.id)} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="archive-card-header">
                  <span className="archive-case-num">Симуляция #{c.id}</span>
                  <span className="archive-status"><StatusIcon done={status.done} won={status.won} /></span>
                </div>
                <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {PROF_NAMES[c.profession as Profession] || c.profession}
                </div>
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
          <div className="game-title"><AnimatedIcon name="archive" size={20} /> Архив кейсов</div>
        </div>

        <div className="archive-mode-tabs">
          <button className={`archive-mode-tab${archiveMode === 'cases' ? ' active' : ''}`} onClick={() => { setArchiveMode('cases'); setActiveFilter('all'); setSearch(''); }}>
            <AnimatedIcon name="clipboard" size={14} /> Кейсы
          </button>
          <button className={`archive-mode-tab${archiveMode === 'simulator' ? ' active' : ''}`} onClick={() => { setArchiveMode('simulator'); setActiveFilter('all'); setSearch(''); }}>
            <AnimatedIcon name="simulator" size={14} /> Симуляторы
          </button>
        </div>

        {archiveMode === 'cases' && renderCasesArchive()}
        {archiveMode === 'simulator' && renderSimulatorArchive()}
      </div>
    </section>
  );
}
