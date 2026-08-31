import type { StateCreator } from 'zustand';
import type { Profession } from '../../../types';
import type { SimulatorScenario, SimulatorState, SimulatorResult } from '../../../professions/types';
import { initSimulator, selectOption, autoSelectWorstOption, calculateResult } from '../../../simulator/engine/simulatorEngine';
import { ALL_SIMULATIONS } from '../../../professions';
import type { GameStore } from '../types';
import { createDatabase } from '../../../lib/db';
const db = createDatabase();

export interface UnifiedSimulatorSlice {
  currentScenario: SimulatorScenario | null;
  simulatorState: SimulatorState | null;
  simulatorResult: SimulatorResult | null;
  loadSimulatorScenario: (profession: Profession) => void;
  selectSimulatorOption: (optionIndex: number) => void;
  handleTimeout: () => void;
  resetSimulator: () => void;
}

export const createUnifiedSimulatorSlice: StateCreator<GameStore, [], [], UnifiedSimulatorSlice> = (set, get) => ({
  currentScenario: null, simulatorState: null, simulatorResult: null,

  loadSimulatorScenario: (profession) => {
    const scenarios = ALL_SIMULATIONS[profession];
    if (!scenarios || scenarios.length === 0) return;
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    set({ currentScenario: scenario, simulatorState: initSimulator(scenario), simulatorResult: null });
  },

  selectSimulatorOption: (optionIndex) => {
    const state = get();
    if (!state.simulatorState) return;
    const newState = selectOption(state.simulatorState, optionIndex);
    set({ simulatorState: newState });
    if (newState.gameOver) {
      const result = calculateResult(newState);
      set({ simulatorResult: result });
      const profession = state.currentProfession;
      if (profession && result) {
        const ns = { ...state.stats };
        ns.games++;
        if (result.resultType === 'excellent' || result.resultType === 'good') ns.wins++;
        if (!ns.professionStats[profession]) ns.professionStats[profession] = { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 };
        ns.professionStats[profession].games++;
        ns.professionStats[profession].simCompleted++;
        if (result.resultType === 'excellent' || result.resultType === 'good') ns.professionStats[profession].wins++;
        ns.completedCases.simulator.push({ id: state.currentScenario?.id || 'unknown', won: result.resultType === 'excellent' || result.resultType === 'good', date: new Date().toISOString(), profession, mode: 'simulator' });
        db.saveStats(ns);
        set({ stats: ns });
      }
    }
  },

  handleTimeout: () => {
    const s = get();
    if (!s.simulatorState) return;
    get().selectSimulatorOption(autoSelectWorstOption(s.simulatorState));
  },

  resetSimulator: () => set({ currentScenario: null, simulatorState: null, simulatorResult: null }),
});
