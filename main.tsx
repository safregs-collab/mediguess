import type { Case, Stats, DailyState, RoleplayCase } from '../../types';
import type { IAppDatabase } from './types';
import { getDefaultStats } from '../storage';
import { invoke } from '@tauri-apps/api/core';
import { roleplayCases as ROLEPLAY_CASES } from '../roleplayCases';

export class TauriDatabase implements IAppDatabase {
  async loadCases(): Promise<readonly Case[]> {
    const json = await invoke<string>('load_cases');
    return Object.freeze(JSON.parse(json)) as readonly Case[];
  }

  async loadRoleplayCases(): Promise<readonly RoleplayCase[]> {
    // Используем встроенные данные из TypeScript (с image и прочими полями)
    return Object.freeze(ROLEPLAY_CASES);
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
      return JSON.parse(json) as Stats;
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
