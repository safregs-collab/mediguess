import type { Stats, DailyState, RoleplayState, SimulationState } from '../../../types';

const STORAGE_KEY = 'mediguess_data';
const DAILY_STATE_KEY = 'mediguess_daily';
const ROLEPLAY_STATE_KEY = 'mediguess_roleplay';
const SIMULATION_STATE_KEY = 'mediguess_simulation';

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
    completedCases: { daily: [], endless: [], roleplay: [], simulation: [] },
    xp: { totalXp: 0, level: 1 },
    achievements: [],
  };
}

export function migrateStats(raw: any): Stats {
  if (!raw) return getDefaultStats();
  if (!raw.completedCases) {
    raw.completedCases = { daily: [], endless: [], roleplay: [], simulation: [] };
  }
  for (const key of ['daily', 'endless', 'roleplay', 'simulation'] as const) {
    if (!Array.isArray(raw.completedCases[key])) {
      raw.completedCases[key] = [];
    }
  }
  if (!raw.xp) {
    raw.xp = { totalXp: 0, level: 1 };
  }
  if (!raw.achievements) {
    raw.achievements = [];
  }
  return raw as Stats;
}

export function loadStats(): Stats {
  const raw = StorageAdapter.get<any>(STORAGE_KEY, null);
  if (!raw) return getDefaultStats();
  return migrateStats(raw);
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

export function loadRoleplayState(): RoleplayState | null {
  return StorageAdapter.get<RoleplayState | null>(ROLEPLAY_STATE_KEY, null);
}

export function saveRoleplayState(state: RoleplayState | null): void {
  if (state) StorageAdapter.set(ROLEPLAY_STATE_KEY, state);
  else StorageAdapter.remove(ROLEPLAY_STATE_KEY);
}

export function loadSimulationState(): SimulationState | null {
  return StorageAdapter.get<SimulationState | null>(SIMULATION_STATE_KEY, null);
}

export function saveSimulationState(state: SimulationState | null): void {
  if (state) StorageAdapter.set(SIMULATION_STATE_KEY, state);
  else StorageAdapter.remove(SIMULATION_STATE_KEY);
}
