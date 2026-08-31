import type { UnifiedCase, Stats, CasesState } from '../../types';
import type { IAppDatabase } from './types';
import { getDefaultStats, migrateStats } from '../../features/games/logic/storage';
import { invoke } from '@tauri-apps/api/core';

export class TauriDatabase implements IAppDatabase {
  async loadCases(): Promise<readonly UnifiedCase[]> { const json = await invoke<string>('load_cases'); return Object.freeze(JSON.parse(json)) as readonly UnifiedCase[]; }
  loadStats(): Stats { return getDefaultStats(); }
  saveStats(stats: Stats): void { invoke('save_stats', { stats: JSON.stringify(stats) }).catch(console.error); }
  loadCasesState(): CasesState | null { return null; }
  saveCasesState(state: CasesState): void { invoke('save_cases_state', { state: JSON.stringify(state) }).catch(console.error); }
  async asyncLoadStats(): Promise<Stats> { try { const json = await invoke<string>('load_stats'); return json ? migrateStats(JSON.parse(json)) : getDefaultStats(); } catch { return getDefaultStats(); } }
}
