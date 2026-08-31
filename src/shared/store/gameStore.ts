import { create } from 'zustand';
import { getDefaultStats } from '../../features/games/logic/storage';
import { createUnifiedCasesSlice } from './slices/unifiedCasesSlice';
import { createUnifiedSimulatorSlice } from './slices/unifiedSimulatorSlice';
import { createProfessionSlice } from './slices/professionSlice';
import { createFilterSlice } from './slices/filterSlice';
import { createArchiveSlice } from './slices/archiveSlice';
import { createUISlice } from './uiSlice';
import type { GameStore } from './types';

export const useGameStore = create<GameStore>()((set, get, store) => ({
  ...createUnifiedCasesSlice(set, get, store),
  ...createUnifiedSimulatorSlice(set, get, store),
  ...createProfessionSlice(set, get, store),
  ...createFilterSlice(set, get, store),
  ...createArchiveSlice(set, get, store),
  ...createUISlice(set, get, store),
  stats: getDefaultStats(),
}));
