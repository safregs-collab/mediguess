import type { Case, Stats, DailyState, RoleplayCase } from '../../types';

export interface IAppDatabase {
  loadCases(): Promise<readonly Case[]>;
  loadRoleplayCases(): Promise<readonly RoleplayCase[]>;
  loadStats(): Stats;
  saveStats(stats: Stats): void;
  loadDailyState(): DailyState | null;
  saveDailyState(state: DailyState): void;
}
