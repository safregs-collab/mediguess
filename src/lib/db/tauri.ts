import type { Case, Stats, DailyState, RoleplayCase, SimulationCase } from '../../types';
import type { IAppDatabase } from './types';
import { getDefaultStats, migrateStats } from '../../features/games/logic/storage';
import { invoke } from '@tauri-apps/api/core';
import { roleplayCases as ROLEPLAY_CASES } from '../../features/games/logic/roleplayCases';
import { simulationCases as SIMULATION_CASES } from '../../features/games/logic/simulationCases';

export class TauriDatabase implements IAppDatabase {
  async loadCases(): Promise<readonly Case[]> {
    const json = await invoke<string>('load_cases');
    return Object.freeze(JSON.parse(json)) as readonly Case[];
  }

  async loadRoleplayCases(): Promise<readonly RoleplayCase[]> {
    return Object.freeze(ROLEPLAY_CASES);
  }

  async loadSimulationCases(): Promise<readonly SimulationCase[]> {
    return Object.freeze(SIMULATION_CASES);
  }

  loadStats(): Stats {
    // Tauri loadStats is async, but interface requires sync.
    // We return defaults here; actual loading happens in init.
    return getDefaultStats();
  }

  saveStats(stats: Stats): void {
    invoke('save_stats', { stats: JSON.stringify(stats) }).catch(console.error);
  }

  loadDailyState(): DailyState | null {
    // Same as above — defaults here, async init loads real data.
    return null;
  }

  saveDailyState(state: DailyState): void {
    invoke('save_daily_state', { state: JSON.stringify(state) }).catch(console.error);
  }

  // Async helpers for init
  async asyncLoadStats(): Promise<Stats> {
    try {
      const json = await invoke<string>('load_stats');
      if (!json) return getDefaultStats();
      return migrateStats(JSON.parse(json));
    } catch {
      return getDefaultStats();
    }
  }

  async asyncLoadDailyState(): Promise<DailyState | null> {
    try {
      const json = await invoke<string>('load_daily_state');
      if (!json) return null;
      return JSON.parse(json) as DailyState;
    } catch {
      return null;
    }
  }
}
