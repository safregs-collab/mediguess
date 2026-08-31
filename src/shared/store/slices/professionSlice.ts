import type { StateCreator } from 'zustand';
import type { Profession, AppScreen } from '../../../types';
import type { GameStore } from '../types';

export interface ProfessionSlice {
  currentProfession: Profession | null;
  currentMode: 'professionSelect' | 'daily' | 'endless' | 'simulator' | 'archive' | 'specialtySelect';
  currentScreen: AppScreen;
  selectProfession: (profession: Profession) => void;
  selectMode: (mode: ProfessionSlice['currentMode']) => void;
  goToProfessionSelect: () => void;
  goToDaily: () => void;
  goToEndless: () => void;
  goToSimulator: () => void;
  goToArchive: () => void;
  goToSpecialtySelect: () => void;
  clearProfession: () => void;
}

export const createProfessionSlice: StateCreator<GameStore, [], [], ProfessionSlice> = (set) => ({
  currentProfession: null, currentMode: 'professionSelect', currentScreen: 'home',
  selectProfession: (profession) => {
    set({ currentProfession: profession, currentMode: 'specialtySelect', currentScreen: 'games' });
  },
  selectMode: (mode) => set({ currentMode: mode }),
  goToProfessionSelect: () => set({ currentMode: 'professionSelect', currentScreen: 'home' }),
  goToDaily: () => set({ currentMode: 'daily' }),
  goToEndless: () => set({ currentMode: 'endless' }),
  goToSimulator: () => set({ currentMode: 'simulator' }),
  goToArchive: () => set({ currentMode: 'archive' }),
  goToSpecialtySelect: () => set({ currentMode: 'specialtySelect' }),
  clearProfession: () => set({ currentProfession: null, currentMode: 'professionSelect', currentScreen: 'home' }),
});
