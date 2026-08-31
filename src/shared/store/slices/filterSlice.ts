import type { StateCreator } from 'zustand';
import type { GameStore } from '../types';

export interface FilterSlice {
  activeFilter: string;
  selectedAutocomplete: number;
  currentMatches: string[];

  setActiveFilter: (filter: string) => void;
  setSelectedAutocomplete: (idx: number) => void;
  setCurrentMatches: (matches: string[]) => void;
}

export const createFilterSlice: StateCreator<GameStore, [], [], FilterSlice> = (set) => ({
  activeFilter: 'all',
  selectedAutocomplete: -1,
  currentMatches: [],

  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSelectedAutocomplete: (idx) => set({ selectedAutocomplete: idx }),
  setCurrentMatches: (matches) => set({ currentMatches: matches }),
});
