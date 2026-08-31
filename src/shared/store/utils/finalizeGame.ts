import type { Stats, GameCheckResult, CompletedCaseInfo, Profession } from '../../../types';
import type { AchievementDef } from '../../../features/gamification/types';
import { updateStats } from '../../../features/games/logic/gameLogic';
import { calculateCaseXp, addXp } from '../../../features/gamification/xpLogic';
import { checkAchievements } from '../../../features/gamification/achievements';
import { playWinSound, playLoseSound, playAchievementSound } from '../../../shared/audio';
import { createDatabase } from '../../../lib/db';
const db = createDatabase();

export function addCompletedCase(list: CompletedCaseInfo[], id: string, won: boolean, profession: Profession, mode: 'cases' | 'simulator'): CompletedCaseInfo[] {
  const existing = list.find((c) => c.id === id);
  const date = new Date().toISOString();
  if (existing) return list.map((c) => (c.id === id ? { ...c, won, date, profession, mode } : c));
  return [...list, { id, won, date, profession, mode }];
}

export interface FinalizeOutcome { newStats: Stats; xpGained: number; newAchievements: AchievementDef[]; }

export function finalizeGame(stats: Stats, result: GameCheckResult, caseId: string, specialty: string, profession: Profession, mode: 'cases' | 'simulator', difficulty?: number): FinalizeOutcome {
  const newStats = updateStats(stats, result.won, result.attempts, specialty);
  if (!newStats.professionStats[profession]) newStats.professionStats[profession] = { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 };
  const p = newStats.professionStats[profession];
  p.games++; if (mode === 'cases') p.casesCompleted++; if (mode === 'simulator') p.simCompleted++;
  if (result.won) { p.wins++; p.bestStreak = Math.max(p.bestStreak, newStats.currentStreak); }
  const key = mode === 'cases' ? 'cases' : 'simulator';
  newStats.completedCases[key] = addCompletedCase(newStats.completedCases[key], caseId, result.won, profession, mode);
  const xpB = calculateCaseXp(mode, result.won, result.attempts, specialty, newStats, difficulty);
  newStats.xp = addXp(newStats.xp, xpB.total);
  const ach = checkAchievements(newStats);
  db.saveStats(newStats);
  return { newStats, xpGained: xpB.total, newAchievements: ach };
}

export function playGameSounds(won: boolean, ach: AchievementDef[], sound: boolean): void {
  if (!sound) return; if (won) playWinSound(); else playLoseSound(); if (ach.length > 0) playAchievementSound();
}

export function buildToast(msg: string, xp: number, ach: AchievementDef[]): string {
  return msg + (xp > 0 ? ` +${xp} XP` : '') + (ach.length > 0 ? ' 🏆 ' + ach.map((a) => a.title).join(', ') + '!' : '');
}
