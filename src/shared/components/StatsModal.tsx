import { useGameStore } from '../store/gameStore';
import { getWinRate } from '../../features/games/logic/gameLogic';
import { exportProgress, importProgress } from '../../features/games/logic/storage';
import { RadarChart } from './RadarChart';
import { XpBar } from '../../features/gamification/components/XpBar';
import { AchievementsPanel } from '../../features/gamification/components/AchievementsPanel';

export function StatsModal() {
  const { stats, statsOpen, closeStats, professionCases } = useGameStore();

  if (!statsOpen) return null;

  const specialtyMap = new Map<string, string>();
  Object.values(professionCases).flat().forEach((c) => specialtyMap.set(c.specialty, c.specialtyName));

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

          {Object.keys(stats.specialtyStats).length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <RadarChart
                data={Object.entries(stats.specialtyStats).map(([spec, data]) => ({
                  label: specialtyMap.get(spec) || spec,
                  value: data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0,
                }))}
                size={220}
              />
            </div>
          )}

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
            <h3 style={{ fontSize: '1rem', margin: '20px 0 12px' }}>По профессиям</h3>
            <div>
              {Object.entries(stats.professionStats).map(([prof, data]) => {
                const pct = data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0;
                const profNames: Record<string, string> = { nurse: 'Медсестра', paramedic: 'Фельдшер', doctor: 'Врач' };
                return (
                  <div key={prof} className="spec-stat-row">
                    <span style={{ width: '120px', fontSize: '0.85rem' }}>{profNames[prof] || prof}</span>
                    <div className="spec-progress-track">
                      <div className="spec-progress-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span style={{ width: '50px', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
              {Object.keys(stats.professionStats).length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Пока нет данных. Выберите профессию и начните играть!</p>
              )}
            </div>
          </div>
          <div className="specialty-stats" style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>💾 Прогресс</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn"
                onClick={() => {
                  const blob = new Blob([exportProgress()], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `docw-backup-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                📥 Экспорт
              </button>
              <label className="btn" style={{ cursor: 'pointer' }}>
                📤 Импорт
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    const result = importProgress(text);
                    if (result.success) {
                      alert('Прогресс восстановлен! Перезагрузите страницу.');
                      window.location.reload();
                    } else {
                      alert('Ошибка: ' + result.error);
                    }
                  }}
                />
              </label>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '8px' }}>
              Сохраните прогресс в файл или восстановите из резервной копии.
            </p>
          </div>
          <AchievementsPanel />
        </div>
      </div>
    </div>
  );
}
