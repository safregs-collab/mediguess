import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Stats, DailyState, EndlessState, RoleplayState, SimulatorState, GameMode
} from '../types';
import { cases } from '../data/cases';
import { roleplayCases } from '../data/roleplay';
import { simulatorScenarios } from '../data/simulator';
import { getDailyCase, getRandomCase } from '../data/cases';
import { getTodayStr, updateStats, processGuess } from '../lib/gameLogic';
import { getRandomRoleplayCase } from '../data/roleplay';
import { getRandomSimulatorCase, calculateScore } from '../data/simulator';

interface GameStore {
  activeTab: string;
  activeFilter: string;
  statsOpen: boolean;
  howToOpen: boolean;
  toast: string | null;
  currentScreen: 'home' | 'app';

  stats: Stats;
  dailyState: DailyState | null;
  endlessState: EndlessState | null;
  roleplayState: RoleplayState | null;
  simulatorState: SimulatorState | null;

  setActiveTab: (tab: string) => void;
  setActiveFilter: (filter: string) => void;
  openStats: () => void;
  closeStats: () => void;
  openHowTo: () => void;
  closeHowTo: () => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  goToHome: () => void;
  goToGames: () => void;

  initDaily: () => void;
  makeGuess: (mode: 'daily' | 'endless', guess: string) => void;
  initEndless: () => void;
  initRoleplay: (role: string) => void;
  makeRoleplayGuess: (guess: string) => void;
  initSimulator: () => void;
  updateSimulator: (updates: Partial<SimulatorState>) => void;
  finishSimulator: () => void;
  loadArchiveCase: (caseId: number) => void;
  resetDaily: () => void;
  resetEndless: () => void;
  resetRoleplay: () => void;
  resetSimulator: () => void;
}

const emptyStats: Stats = {
  games: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
  specialtyStats: {},
  roleplayStats: {},
  lastPlayedDate: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      activeTab: 'daily',
      activeFilter: 'all',
      statsOpen: false,
      howToOpen: false,
      toast: null,
      currentScreen: 'home',

      stats: { ...emptyStats },
      dailyState: null,
      endlessState: null,
      roleplayState: null,
      simulatorState: null,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      openStats: () => set({ statsOpen: true }),
      closeStats: () => set({ statsOpen: false }),
      openHowTo: () => set({ howToOpen: true }),
      closeHowTo: () => set({ howToOpen: false }),
      showToast: (msg) => set({ toast: msg }),
      clearToast: () => set({ toast: null }),
      goToHome: () => set({ currentScreen: 'home' }),
      goToGames: () => set({ currentScreen: 'app', activeTab: 'daily' }),

      initDaily: () => {
        const today = getTodayStr();
        const saved = get().dailyState;
        if (saved && saved.date === today) {
          return;
        }
        const c = getDailyCase();
        set({
          dailyState: {
            date: today,
            caseId: c.id,
            attempts: 0,
            history: [],
            finished: false,
            won: false,
          }
        });
      },

      initEndless: () => {
        const c = getRandomCase();
        set({
          endlessState: {
            caseId: c.id,
            attempts: 0,
            history: [],
            finished: false,
            won: false,
          }
        });
      },

      makeGuess: (mode, guess) => {
        const state = mode === 'daily' ? get().dailyState : get().endlessState;
        const caseData = mode === 'daily' 
          ? cases.find(c => c.id === state?.caseId)
          : cases.find(c => c.id === state?.caseId);
        if (!state || !caseData || state.finished) return;

        const result = processGuess(guess, caseData, state.attempts);
        const newHistory = [...state.history, result.correct ? 'correct' : 'wrong'];

        const newState = mode === 'daily' ? 'dailyState' : 'endlessState';
        set({
          [newState]: {
            ...state,
            attempts: result.attempts,
            history: newHistory,
            finished: result.finished,
            won: result.won,
          }
        });

        if (result.finished) {
          const newStats = updateStats(get().stats, result.won, result.attempts, caseData.specialty);
          set({ stats: newStats });
        }

        get().showToast(result.message);
      },

      initRoleplay: (role) => {
        const c = getRandomRoleplayCase(role);
        set({
          roleplayState: {
            caseId: c.id,
            role,
            attempts: 0,
            history: [],
            finished: false,
            won: false,
          }
        });
      },

      makeRoleplayGuess: (guess) => {
        const state = get().roleplayState;
        const caseData = roleplayCases.find(c => c.id === state?.caseId);
        if (!state || !caseData || state.finished) return;

        const result = processGuess(guess, caseData as any, state.attempts);
        const newHistory = [...state.history, result.correct ? 'correct' : 'wrong'];

        set({
          roleplayState: {
            ...state,
            attempts: result.attempts,
            history: newHistory,
            finished: result.finished,
            won: result.won,
          }
        });

        if (result.finished) {
          const newStats = updateStats(get().stats, result.won, result.attempts, state.role);
          set({ stats: newStats });
        }

        get().showToast(result.message);
      },

      initSimulator: () => {
        const c = getRandomSimulatorCase();
        set({
          simulatorState: {
            caseId: c.id,
            stageIndex: 0,
            selectedTests: [],
            orderedTests: [],
            diagnosisInput: '',
            treatmentInput: '',
            finished: false,
            score: { total: 0, diagnosisCorrect: false, treatmentCorrect: false, missedKeyTests: 0, unnecessaryTests: 0 },
          }
        });
      },

      updateSimulator: (updates) => {
        const state = get().simulatorState;
        if (!state) return;
        set({ simulatorState: { ...state, ...updates } });
      },

      finishSimulator: () => {
        const state = get().simulatorState;
        const scenario = simulatorScenarios.find(c => c.id === state?.caseId);
        if (!state || !scenario) return;

        const score = calculateScore(scenario, state);
        set({
          simulatorState: {
            ...state,
            finished: true,
            score,
          }
        });
        get().showToast(`Приём оценён: ${score.total}/100`);
      },

      loadArchiveCase: (caseId) => {
        const c = cases.find(c => c.id === caseId);
        if (!c) return;
        set({
          endlessState: {
            caseId: c.id,
            attempts: 0,
            history: [],
            finished: false,
            won: false,
          }
        });
        set({ activeTab: 'endless' });
      },

      resetDaily: () => set({ dailyState: null }),
      resetEndless: () => set({ endlessState: null }),
      resetRoleplay: () => set({ roleplayState: null }),
      resetSimulator: () => set({ simulatorState: null }),
    }),
    {
      name: 'mediguess-storage',
      partialize: (state) => ({
        stats: state.stats,
        dailyState: state.dailyState,
      }),
    }
  )
);
