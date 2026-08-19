import { useGameStore } from '../../store/gameStore';
import { cases, specialties } from '../../data/cases';

export function ArchiveMode() {
  const { activeFilter, setActiveFilter, loadArchiveCase } = useGameStore();

  const filtered = activeFilter === 'all'
    ? cases
    : cases.filter(c => c.specialty === activeFilter);

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="game-title">📚 Архив кейсов</div>
      </div>
      <div className="archive-filters">
        <button
          className={`filter-chip${activeFilter === 'all' ? ' active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Все
        </button>
        {specialties.map(([key, name]) => (
          <button
            key={key}
            className={`filter-chip${activeFilter === key ? ' active' : ''}`}
            onClick={() => setActiveFilter(key)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="archive-grid">
        {filtered.map(c => (
          <div
            key={c.id}
            className="archive-card"
            onClick={() => loadArchiveCase(c.id)}
          >
            <div className="archive-card-header">
              <span className="archive-case-num">Кейс #{c.id}</span>
            </div>
            <span className={`specialty-tag tag-${c.specialty}`}>
              {c.specialtyName}
            </span>
            <p className="archive-clue-preview">
              {c.clues[0].substring(0, 80)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
