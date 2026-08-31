import type { Stats, XpState } from '../../types';
import type { XpBreakdown } from './types';

export function xpForLevel(level: number): number {
  return 50 * level;
}

export function xpToReachLevel(targetLevel: number): number {
  let sum = 0;
  for (let i = 1; i < targetLevel; i++) {
    sum += xpForLevel(i);
  }
  return sum;
}

export function getLevelInfo(totalXp: number): { level: number; current: number; next: number; progress: number } {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const need = xpForLevel(level);
    if (totalXp < accumulated + need) {
      return {
        level,
        current: totalXp - accumulated,
        next: need,
        progress: (totalXp - accumulated) / need,
      };
    }
    accumulated += need;
    level++;
  }
}

export function getLevelTitle(level: number): string {
  if (level < 5) return 'Первокурсник';
  if (level < 10) return 'Интерн';
  if (level < 15) return 'Ординатор';
  if (level < 20) return 'Врач-специалист';
  if (level < 30) return 'Заведующий';
  if (level < 40) return 'Доцент';
  if (level < 50) return 'Профессор';
  return 'Академик';
}

function baseXp(mode: 'cases' | 'simulator', won: boolean): number {
  if (mode === 'cases') return won ? 40 : 10;
  return won ? 50 : 15;
}

function accuracyBonus(attempts: number, won: boolean): number {
  if (!won) return 0;
  if (attempts === 1) return 100;
  if (attempts === 2) return 50;
  if (attempts === 3) return 25;
  return 0;
}

function streakMultiplier(currentStreak: number): number {
  if (currentStreak >= 30) return 1.5;
  if (currentStreak >= 7) return 1.25;
  if (currentStreak >= 3) return 1.1;
  return 1.0;
}

function newSpecialtyBonus(stats: Stats, specialty: string, won: boolean): number {
  if (!won) return 0;
  const spec = stats.specialtyStats[specialty];
  if (!spec || spec.wins <= 1) return 20;
  return 0;
}

export function calculateCaseXp(
  mode: 'cases' | 'simulator',
  won: boolean,
  attempts: number,
  specialty: string,
  stats: Stats,
  difficulty?: number
): XpBreakdown {
  let base = baseXp(mode, won);
  if (mode === 'cases' && won && difficulty) {
    base = base * difficulty;
  }
  const acc = accuracyBonus(attempts, won);
  const mult = streakMultiplier(stats.currentStreak);
  const nsb = newSpecialtyBonus(stats, specialty, won);

  const rawTotal = (base + acc + nsb) * mult;
  const total = Math.round(rawTotal);

  return {
    base,
    accuracyBonus: acc,
    streakMultiplier: mult,
    streakBonus: 0,
    newSpecialtyBonus: nsb,
    total,
  };
}

export function calculateSimulationXp(score: number): XpBreakdown {
  const base = Math.round(score * 1.5);
  return {
    base,
    accuracyBonus: 0,
    streakMultiplier: 1,
    streakBonus: 0,
    newSpecialtyBonus: 0,
    total: base,
  };
}

export function addXp(state: XpState, amount: number): XpState {
  const newTotal = state.totalXp + amount;
  const info = getLevelInfo(newTotal);
  return {
    totalXp: newTotal,
    level: info.level,
  };
}
