import { useGameStore } from '../../store/gameStore';
import { getWinRate } from '../../lib/gameLogic';
import { specialties } from '../../data/cases';
import { roles } from '../../data/roleplay';

export function StatsModal() {
  const { stats, statsOpen, closeStats } = useGameStore();

  if (!statsOpen) return null;

  const maxDist = Math.max(...stats.guessDistribution, 1);

  return (
    <div className="modal-overlay visible" onClick={e => { if (e.target === e.currentTarget) closeStats(); }}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📊 Статистика</div>
          <button className="modal-close" onClick={closeStats}>×</button>
        </div>
        <div className="modal-body">
          <div className="stats-grid">
            <div className="stat-box"><div className="stat-value">{stats.games}</div><div className="stat-label">Сыграно</div></div>
            <div className="stat-box"><div className="stat-value">{stats.currentStreak}</div><div className="stat-label">Серия 🔥</div></div>
            <div className="stat-box"><div className="stat-value">{stats.maxStreak}</div><div className="stat-label">Макс. серия</div></div>
            <div className="stat-box"><div className="stat-value">{getWinRate(stats)}%</div><div className="stat-label">Побед</div></div>
          </div>

          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Распределение попыток</h3>
          <div>
            {stats.guessDistribution.map((count, i) => {
              const pct = maxDist > 0 ? (count / maxDist) * 100 : 0;
              return (
                <div key={i} className="distribution-bar">
                  <span className="dist-label">{i + 1}</span>
                  <div className="dist-track"><div className="dist-fill" style={{ width: `${pct}%` }}></div></div>
                  <span className="dist-value">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="specialty-stats">
            <h3 style={{ fontSize: '1rem', margin: '20px 0 12px' }}>По специальностям</h3>
            {specialties.map(([spec, name]) => {
              const data = stats.specialtyStats[spec] || { games: 0, wins: 0 };
              const pct = data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0;
              return (
                <div key={spec} className="spec-stat-row">
                  <span style={{ width: '120px', fontSize: '0.85rem' }}>{name}</span>
                  <div className="spec-progress-track"><div className="spec-progress-fill" style={{ width: `${pct}%` }}></div></div>
                  <span style={{ width: '50px', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>{pct}%</span>
                </div>
              );
            })}
          </div>

          <div className="specialty-stats">
            <h3 style={{ fontSize: '1rem', margin: '20px 0 12px' }}>🎭 Ролевой режим</h3>
            {roles.map(role => {
              const data = stats.roleplayStats[role.key] || { games: 0, wins: 0 };
              const pct = data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0;
              return (
                <div key={role.key} className="spec-stat-row">
                  <span style={{ width: '120px', fontSize: '0.85rem' }}>{role.label}</span>
                  <div className="spec-progress-track"><div className="spec-progress-fill" style={{ width: `${pct}%` }}></div></div>
                  <span style={{ width: '50px', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
