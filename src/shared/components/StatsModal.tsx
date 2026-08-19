import { useGameStore } from '../store/gameStore';
import { getWinRate } from '../../features/games/logic/gameLogic';
import { XpBar } from '../../features/gamification/components/XpBar';
import { AchievementsPanel } from '../../features/gamification/components/AchievementsPanel';

export function StatsModal() {
  const { stats, statsOpen, closeStats, cases, roleplayCases } = useGameStore();

  if (!statsOpen) return null;

  const specialtyMap = new Map<string, string>();
  cases.forEach((c) => specialtyMap.set(c.specialty, c.specialtyName));

  const roleMap = new Map<string, string>();
  roleplayCases.forEach((c) => roleMap.set(c.role, c.roleName));

  const maxDist = Math.max(...stats.guessDistribution, 1);

  return (
    <div className="modal-overlay visible" onClick={(e) => { if (e.target === e.currentTarget) closeStats(); }}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📊 Статистика</div>
          <button className="modal-close" onClick={closeStats}>×</button>
        </div>
        <div className="modal-body">
          <XpBar totalXp={stats.xp?.totalXp ?? 0} />
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
            <div>
              {Object.entries(stats.specialtyStats).map(([spec, data]) => {
                const pct = data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0;
                return (
                  <div key={spec} className="spec-stat-row">
                    <span style={{ width: '120px', fontSize: '0.85rem' }}>{specialtyMap.get(spec) || spec}</span>
                    <div className="spec-progress-track">
                      <div className="spec-progress-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span style={{ width: '50px', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
              {Object.keys(stats.specialtyStats).length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Пока нет данных. Сыграйте в ежедневный режим!</p>
              )}
            </div>
          </div>

          <div className="specialty-stats">
            <h3 style={{ fontSize: '1rem', margin: '20px 0 12px' }}>🎭 Ролевой режим по ролям</h3>
            <div>
              {Object.entries(stats.roleplayStats).map(([role, data]) => {
                const pct = data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0;
                return (
                  <div key={role} className="spec-stat-row">
                    <span style={{ width: '120px', fontSize: '0.85rem' }}>{roleMap.get(role) || role}</span>
                    <div className="spec-progress-track">
                      <div className="spec-progress-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span style={{ width: '50px', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
              {Object.keys(stats.roleplayStats).length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Пока нет данных. Сыграйте в ролевой режим!</p>
              )}
            </div>
          </div>
          <AchievementsPanel />
        </div>
      </div>
    </div>
  );
}
