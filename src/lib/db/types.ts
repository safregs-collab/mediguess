import type { UnifiedCase, Stats, CasesState } from '../../types';
export interface IAppDatabase {
  loadCases(): Promise<readonly UnifiedCase[]>;
  loadStats(): Stats;
  saveStats(stats: Stats): void;
  loadCasesState(): CasesState | null;
  saveCasesState(state: CasesState): void;
}
