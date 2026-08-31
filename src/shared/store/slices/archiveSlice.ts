import type { StateCreator } from 'zustand';
import type { GameStore } from '../types';
import { getSimulationById } from '../../../professions';

export interface ArchiveSlice {
  loadArchiveCase: (caseId: string) => void;
  loadSimulatorArchiveCase: (scenarioId: string) => void;
}

export const createArchiveSlice: StateCreator<GameStore, [], [], ArchiveSlice> = (set, get) => ({
  loadArchiveCase: (caseId) => {
    const c = Object.values(get().professionCases).flat().find((c) => c.id === caseId);
    if (!c) return;
    set({ currentCase: c, casesState: { caseId: c.id, profession: c.profession, attempts: 0, history: [], finished: false, won: false }, currentMode: 'endless' });
  },
  loadSimulatorArchiveCase: (scenarioId) => {
    const s = getSimulationById(scenarioId);
    if (!s) return;
    set({ currentScenario: s, currentMode: 'simulator' });
  },
});
