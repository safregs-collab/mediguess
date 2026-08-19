import type { Case, Stats, DailyState, RoleplayCase, SimulationCase } from '../../types';
import type { IAppDatabase } from './types';
import { getDefaultStats, migrateStats } from '../../features/games/logic/storage';
import { roleplayCases as ROLEPLAY_CASES } from '../../features/games/logic/roleplayCases';
import { simulationCases as SIMULATION_CASES } from '../../features/games/logic/simulationCases';

const STORAGE_KEY = 'mediguess_data';
const DAILY_STATE_KEY = 'mediguess_daily';

export class WebDatabase implements IAppDatabase {
  async loadCases(): Promise<readonly Case[]> {
    const res = await fetch('./data/cases.json');
    if (!res.ok) throw new Error(`Failed to load cases: ${res.status}`);
    return Object.freeze(await res.json()) as readonly Case[];
  }

  async loadRoleplayCases(): Promise<readonly RoleplayCase[]> {
    return Object.freeze(ROLEPLAY_CASES);
  }

  async loadSimulationCases(): Promise<readonly SimulationCase[]> {
    return Object.freeze(SIMULATION_CASES);
  }

  loadStats(): Stats {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? migrateStats(JSON.parse(raw)) : getDefaultStats();
    } catch {
      return getDefaultStats();
    }
  }

  saveStats(stats: Stats): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  loadDailyState(): DailyState | null {
    try {
      const raw = localStorage.getItem(DAILY_STATE_KEY);
      return raw ? (JSON.parse(raw) as DailyState) : null;
    } catch {
      return null;
    }
  }

  saveDailyState(state: DailyState): void {
    localStorage.setItem(DAILY_STATE_KEY, JSON.stringify(state));
  }
}
