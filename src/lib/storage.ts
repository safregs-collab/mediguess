import type { Stats, DailyState } from '../types';

const STORAGE_KEY = 'mediguess_data';
const DAILY_STATE_KEY = 'mediguess_daily';

export class StorageAdapter {
  static get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Storage set error for key "${key}":`, e);
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}

export function getDefaultStats(): Stats {
  return {
    games: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
    specialtyStats: {},
    lastPlayedDate: null,
    roleplayStats: {},
  };
}

export function loadStats(): Stats {
  return StorageAdapter.get<Stats>(STORAGE_KEY, getDefaultStats());
}

export function saveStats(stats: Stats): void {
  StorageAdapter.set(STORAGE_KEY, stats);
}

export function loadDailyState(): DailyState | null {
  return StorageAdapter.get<DailyState | null>(DAILY_STATE_KEY, null);
}

export function saveDailyState(state: DailyState): void {
  StorageAdapter.set(DAILY_STATE_KEY, state);
}
