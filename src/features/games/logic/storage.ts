import type { Stats, CasesState } from '../../../types';
import { runMigrations, getDefaultStats as getDefaultStatsMigrated } from '../../../shared/store/migrations';

const STORAGE_KEY = 'mediguess_data';
const CASES_STATE_KEY = 'doc_cases_state';

export class StorageAdapter {
  static get<T>(key: string, fallback: T): T { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } }
  static set<T>(key: string, value: T): void { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error('Storage error:', e); } }
  static remove(key: string): void { localStorage.removeItem(key); }
}

export function getDefaultStats(): Stats { return getDefaultStatsMigrated(); }
export function migrateStats(raw: any): Stats { return runMigrations(raw); }
export function loadStats(): Stats { const raw = StorageAdapter.get<any>(STORAGE_KEY, null); return raw ? migrateStats(raw) : getDefaultStats(); }
export function saveStats(stats: Stats): void { StorageAdapter.set(STORAGE_KEY, stats); }
export function loadCasesState(): CasesState | null { return StorageAdapter.get<CasesState | null>(CASES_STATE_KEY, null); }
export function saveCasesState(state: CasesState): void { StorageAdapter.set(CASES_STATE_KEY, state); }
export function clearLegacyStorage(): void { StorageAdapter.remove('mediguess_daily'); StorageAdapter.remove('mediguess_roleplay'); StorageAdapter.remove('mediguess_simulation'); }

export interface ProgressBackup { version: string; exportedAt: string; stats: Stats; casesState: CasesState | null; }
export function exportProgress(): string { return JSON.stringify({ version: '2.0', exportedAt: new Date().toISOString(), stats: loadStats(), casesState: loadCasesState() }, null, 2); }
export function importProgress(json: string): { success: boolean; error?: string } {
  try { const b = JSON.parse(json) as ProgressBackup; if (!b.version || !b.stats) return { success: false, error: 'Неверный формат' }; saveStats(b.stats); if (b.casesState) saveCasesState(b.casesState); return { success: true }; }
  catch (e) { return { success: false, error: 'Ошибка JSON' }; }
}
