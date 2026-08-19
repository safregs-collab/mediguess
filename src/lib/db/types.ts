import type { Case, Stats, DailyState, RoleplayCase, SimulationCase } from '../../types';

export interface IAppDatabase {
  loadCases(): Promise<readonly Case[]>;
  loadRoleplayCases(): Promise<readonly RoleplayCase[]>;
  loadSimulationCases(): Promise<readonly SimulationCase[]>;
  loadStats(): Stats;
  saveStats(stats: Stats): void;
  loadDailyState(): DailyState | null;
  saveDailyState(state: DailyState): void;
}
