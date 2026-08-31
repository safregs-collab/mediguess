import type { UnifiedCase, Stats, CasesState } from '../../types';
import type { IAppDatabase } from './types';
import { getDefaultStats, migrateStats } from '../../features/games/logic/storage';
const BASE_URL: string = import.meta.env.BASE_URL || '/';
const STORAGE_KEY = 'mediguess_data';
const CASES_STATE_KEY = 'doc_cases_state';

export class WebDatabase implements IAppDatabase {
  async loadCases(): Promise<readonly UnifiedCase[]> {
    const res = await fetch(`${BASE_URL}data/cases.json`);
    if (!res.ok) throw new Error(`Failed to load cases: ${res.status}`);
    return Object.freeze(await res.json()) as readonly UnifiedCase[];
  }
  loadStats(): Stats { try { const r = localStorage.getItem(STORAGE_KEY); return r ? migrateStats(JSON.parse(r)) : getDefaultStats(); } catch { return getDefaultStats(); } }
  saveStats(stats: Stats): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); }
  loadCasesState(): CasesState | null { try { const r = localStorage.getItem(CASES_STATE_KEY); return r ? JSON.parse(r) as CasesState : null; } catch { return null; } }
  saveCasesState(state: CasesState): void { localStorage.setItem(CASES_STATE_KEY, JSON.stringify(state)); }
}
