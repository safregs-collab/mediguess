import type { Stats } from '../../types';
import type { AchievementDef } from './types';

export const ACHIEVEMENTS_LIST: AchievementDef[] = [
  { id: 'first_blood', title: 'Первый диагноз', description: 'Угадайте первый диагноз', emoji: '🩺', xpReward: 50, category: 'diagnost' },
  { id: 'perfect_guess', title: 'Дедуктивный метод', description: 'Угадайте с первой попытки', emoji: '🎯', xpReward: 100, category: 'diagnost' },
  { id: 'speed_diagnost', title: 'На скорость', description: 'Угадайте со 2-й попытки 5 раз', emoji: '⚡', xpReward: 150, category: 'diagnost' },
  { id: 'streak_7', title: 'Неделя без выходных', description: 'Серия побед 7 дней', emoji: '🔥', xpReward: 200, category: 'marathon' },
  { id: 'streak_30', title: 'Месяц на ногах', description: 'Серия побед 30 дней', emoji: '📅', xpReward: 1000, category: 'marathon' },
  { id: 'streak_100', title: 'Железный врач', description: 'Серия побед 100 дней', emoji: '👑', xpReward: 5000, category: 'marathon' },
  { id: 'games_100', title: 'Стажёр', description: 'Сыграйте 100 игр', emoji: '🎓', xpReward: 300, category: 'marathon' },
  { id: 'games_500', title: 'Практик', description: 'Сыграйте 500 игр', emoji: '🏥', xpReward: 1000, category: 'marathon' },
  { id: 'cardio_master', title: 'Кардиолог', description: '10 побед в кардиологии', emoji: '❤️', xpReward: 150, category: 'specialist' },
  { id: 'pulmo_master', title: 'Пульмонолог', description: '10 побед в пульмонологии', emoji: '🫁', xpReward: 150, category: 'specialist' },
  { id: 'all_specs', title: 'Поликлиника', description: 'Победа в каждой специальности', emoji: '🏛️', xpReward: 500, category: 'specialist' },
  { id: 'sim_90', title: 'Симулятор-мастер', description: '10 симуляций с оценкой >90', emoji: '🏆', xpReward: 300, category: 'simulation' },
  { id: 'sim_perfect', title: 'Идеальный приём', description: 'Симуляция на 100 баллов', emoji: '💯', xpReward: 500, category: 'simulation' },
  { id: 'archive_half', title: 'Половина пути', description: 'Пройдите 50% всех кейсов', emoji: '📂', xpReward: 200, category: 'collector' },
  { id: 'archive_full', title: 'Полный архив', description: 'Пройдите все кейсы', emoji: '📚', xpReward: 1000, category: 'collector' },
  { id: 'meta_first_case', title: 'Первый шаг', description: 'Завершите первый клинический кейс Мета-Зоны', emoji: '🩺', xpReward: 50, category: 'simulation' },
  { id: 'meta_perfect', title: 'Идеальный диагноз', description: '100% правильных ответов в кейсе Мета-Зоны', emoji: '💯', xpReward: 200, category: 'simulation' },
  { id: 'meta_evidence', title: 'Мастер доказательств', description: 'Правильно оцените 10 рекомендаций по УДД/УУР', emoji: '📊', xpReward: 150, category: 'simulation' },
  { id: 'meta_algorithm', title: 'Алгоритмическое мышление', description: 'Пройдите 5 алгоритмов врача', emoji: '🔄', xpReward: 100, category: 'simulation' },
  { id: 'meta_scales', title: 'Калькулятор', description: 'Используйте все клинические калькуляторы', emoji: '📏', xpReward: 80, category: 'simulation' },
  { id: 'meta_specialist', title: 'Специалист', description: 'Пройдите кейс на уровне «Специалист» с результатом ≥80%', emoji: '🔴', xpReward: 300, category: 'simulation' },
];

function hasAchievement(stats: Stats, id: string): boolean {
  return stats.achievements.some((a) => a.id === id);
}

export function checkAchievements(stats: Stats): AchievementDef[] {
  const unlocked: AchievementDef[] = [];
  const now = new Date().toISOString();

  for (const def of ACHIEVEMENTS_LIST) {
    if (hasAchievement(stats, def.id)) continue;

    let shouldUnlock = false;

    switch (def.id) {
      case 'first_blood':
        shouldUnlock = stats.wins >= 1;
        break;
      case 'perfect_guess':
        shouldUnlock = stats.guessDistribution[0] >= 1;
        break;
      case 'speed_diagnost':
        shouldUnlock = stats.guessDistribution[1] >= 5;
        break;
      case 'streak_7':
        shouldUnlock = stats.maxStreak >= 7;
        break;
      case 'streak_30':
        shouldUnlock = stats.maxStreak >= 30;
        break;
      case 'streak_100':
        shouldUnlock = stats.maxStreak >= 100;
        break;
      case 'games_100':
        shouldUnlock = stats.games >= 100;
        break;
      case 'games_500':
        shouldUnlock = stats.games >= 500;
        break;
      case 'cardio_master':
        shouldUnlock = stats.specialtyStats['cardiology']?.wins >= 10;
        break;
      case 'pulmo_master':
        shouldUnlock = stats.specialtyStats['pulmonology']?.wins >= 10;
        break;
      case 'all_specs': {
        const specs = Object.keys(stats.specialtyStats);
        shouldUnlock = specs.length >= 5 && specs.every((k) => stats.specialtyStats[k].wins >= 1);
        break;
      }
      case 'sim_90': {
        const simWon = stats.completedCases.simulator.filter((c) => c.won).length;
        shouldUnlock = simWon >= 10;
        break;
      }
      case 'sim_perfect':
        shouldUnlock = false;
        break;
      case 'archive_half': {
        const allIds = new Set([
          ...stats.completedCases.cases.map((c) => c.id),
          ...stats.completedCases.simulator.map((c) => c.id),
        ]);
        shouldUnlock = allIds.size >= 25;
        break;
      }
      case 'archive_full': {
        const allIds = new Set([
          ...stats.completedCases.cases.map((c) => c.id),
          ...stats.completedCases.simulator.map((c) => c.id),
        ]);
        shouldUnlock = allIds.size >= 50;
        break;
      }
      case 'meta_first_case':
        shouldUnlock = stats.metaStats.casesCompleted >= 1;
        break;
      case 'meta_perfect':
        shouldUnlock = stats.metaStats.perfectCases >= 1;
        break;
      case 'meta_evidence':
        shouldUnlock = stats.metaStats.evidenceEvaluated >= 10;
        break;
      case 'meta_algorithm':
        shouldUnlock = stats.metaStats.algorithmsCompleted >= 5;
        break;
      case 'meta_scales':
        shouldUnlock = stats.metaStats.scalesUsed >= 5;
        break;
      case 'meta_specialist':
        shouldUnlock = stats.metaStats.specialistLevelCompleted;
        break;
    }

    if (shouldUnlock) {
      stats.achievements.push({ id: def.id, unlockedAt: now });
      unlocked.push(def);
    }
  }

  return unlocked;
}

export function checkPerfectSimulation(stats: Stats): AchievementDef | null {
  if (hasAchievement(stats, 'sim_perfect')) return null;
  const def = ACHIEVEMENTS_LIST.find((d) => d.id === 'sim_perfect')!;
  stats.achievements.push({ id: def.id, unlockedAt: new Date().toISOString() });
  return def;
}
