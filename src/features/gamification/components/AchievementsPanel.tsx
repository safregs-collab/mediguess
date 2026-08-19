import { useGameStore } from '../../../shared/store/gameStore';
import { ACHIEVEMENTS_LIST } from '../achievements';
import type { AchievementDef } from '../types';

const CATEGORY_NAMES: Record<AchievementDef['category'], string> = {
  diagnost: '🔍 Диагност',
  marathon: '🏃 Марафонец',
  specialist: '🩺 Специалист',
  roleplay: '🎭 Ролевик',
  simulation: '🏥 Симулятор',
  collector: '📚 Коллекционер',
};

export function AchievementsPanel() {
  const stats = useGameStore((s) => s.stats);
  const achievements = stats?.achievements ?? [];
  const unlockedIds = new Set(achievements.map((a) => a.id));

  const byCategory = ACHIEVEMENTS_LIST.reduce((acc, ach) => {
    if (!acc[ach.category]) acc[ach.category] = [];
    acc[ach.category].push(ach);
    return acc;
  }, {} as Record<string, AchievementDef[]>);

  const total = ACHIEVEMENTS_LIST.length;
  const unlocked = unlockedIds.size;

  return (
    <div className="achievements-panel">
      <div className="achievements-header">
        <h3>🏆 Достижения</h3>
        <span className="achievements-count">{unlocked} / {total}</span>
      </div>

      <div className="achievements-progress-bar">
        <div className="achievements-progress-fill" style={{ width: `${total > 0 ? (unlocked / total) * 100 : 0}%` }} />
      </div>

      {Object.entries(byCategory).map(([cat, list]) => (
        <div key={cat} className="achievements-category">
          <h4 className="achievements-category-title">{CATEGORY_NAMES[cat as AchievementDef['category']]}</h4>
          <div className="achievements-grid">
            {list.map((ach) => {
              const isUnlocked = unlockedIds.has(ach.id);
              return (
                <div key={ach.id} className={`achievement-card${isUnlocked ? ' unlocked' : ' locked'}`}>
                  <div className="achievement-emoji">{ach.emoji}</div>
                  <div className="achievement-info">
                    <div className="achievement-title">{ach.title}</div>
                    <div className="achievement-desc">{ach.description}</div>
                  </div>
                  <div className="achievement-xp">+{ach.xpReward} XP</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
