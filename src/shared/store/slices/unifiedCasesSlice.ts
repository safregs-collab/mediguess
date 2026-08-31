import type { StateCreator } from 'zustand';
import type { UnifiedCase, CasesState, Profession } from '../../../types';
import type { GameStore } from '../types';
import { processGuess, getDayOfYear } from '../../../features/games/logic/gameLogic';
import { getProximityHint } from '../../../features/games/logic/hintEngine';
import { finalizeGame, playGameSounds, buildToast } from '../utils/finalizeGame';
import { createDatabase } from '../../../lib/db';

const db = createDatabase();

export interface UnifiedCasesSlice {
  professionCases: Record<Profession, UnifiedCase[]>;
  currentCase: UnifiedCase | null;
  casesState: CasesState | null;
  loading: boolean;
  init: () => Promise<void>;
  loadCase: (profession: Profession) => void;
  loadDailyCase: (profession: Profession) => void;
  loadEndlessCase: (profession: Profession) => void;
  checkGuess: (input: string) => void;
  nextCase: () => void;
}

export const createUnifiedCasesSlice: StateCreator<GameStore, [], [], UnifiedCasesSlice> = (set, get) => ({
  professionCases: { nurse: [], paramedic: [], doctor: [] },
  currentCase: null,
  casesState: null,
  loading: true,

  init: async () => {
    try {
      const staticCases = await db.loadCases();
      const nurseCases: UnifiedCase[] = [];
      const paramedicCases: UnifiedCase[] = [];
      const doctorCases: UnifiedCase[] = [];

      for (const c of staticCases) {
        const base = {
          specialty: c.specialty,
          specialtyName: c.specialtyName,
          diagnosis: c.diagnosis,
          clues: c.clues,
          explanation: c.explanation,
          source: c.source || ('manual' as const),
          difficulty: (c.difficulty || 1) as 1 | 2 | 3,
        };
        nurseCases.push({ ...base, id: `${c.id}-nurse`, profession: 'nurse' as const, taskType: 'recognize' as const, answerType: 'single' as const, hints: ['Обратите внимание на ключевые симптомы'], skills: ['наблюдение', 'фиксация виталов'] });
        paramedicCases.push({ ...base, id: `${c.id}-paramedic`, profession: 'paramedic' as const, taskType: 'diagnose' as const, answerType: 'single' as const, hints: ['Подумайте о предварительном диагнозе'], skills: ['диагностика', 'неотложная помощь'] });
        doctorCases.push({ ...base, id: `${c.id}-doctor`, profession: 'doctor' as const, taskType: 'full-cycle' as const, answerType: 'multiple' as const, skills: ['диагностика', 'лечение', 'дифференциальный диагноз'] });
      }

      set({
        professionCases: { nurse: nurseCases, paramedic: paramedicCases, doctor: doctorCases },
        loading: false,
      });

      const savedState = db.loadCasesState();
      if (savedState) set({ casesState: savedState });
    } catch (err) {
      console.error('[init] Failed to load cases:', err);
      set({ loading: false });
    }
  },

  loadCase: (profession) => {
    const cases = get().professionCases[profession];
    if (cases.length === 0) return;
    const idx = Math.floor(Math.random() * cases.length);
    const selected = cases[idx];
    set({
      currentCase: selected,
      casesState: {
        caseId: selected.id,
        profession,
        attempts: 0,
        history: [],
        finished: false,
        won: false,
      },
    });
  },

  loadDailyCase: (profession) => {
    const cases = get().professionCases[profession];
    if (cases.length === 0) return;
    const day = getDayOfYear();
    const idx = day % cases.length;
    const selected = cases[idx];
    set({
      currentCase: selected,
      casesState: {
        caseId: selected.id,
        profession,
        attempts: 0,
        history: [],
        finished: false,
        won: false,
      },
    });
  },

  loadEndlessCase: (profession) => {
    const cases = get().professionCases[profession];
    if (cases.length === 0) return;
    const idx = Math.floor(Math.random() * cases.length);
    const selected = cases[idx];
    set({
      currentCase: selected,
      casesState: {
        caseId: selected.id,
        profession,
        attempts: 0,
        history: [],
        finished: false,
        won: false,
      },
    });
  },

  checkGuess: (input) => {
    const state = get();
    const currentCase = state.currentCase;
    const casesState = state.casesState;
    if (!currentCase || !casesState || casesState.finished) return;

    const result = processGuess(input, currentCase as any, casesState.attempts);
    const newCasesState: CasesState = {
      ...casesState,
      attempts: result.attempts,
      history: [...casesState.history, result.correct ? 'correct' : 'wrong'],
      finished: result.finished,
      won: result.won,
    };
    db.saveCasesState(newCasesState);

    let newStats = state.stats;
    let xpGained = 0;
    let newAchievements: any[] = [];

    if (result.finished) {
      const outcome = finalizeGame(
        state.stats, result, currentCase.id, currentCase.specialty,
        currentCase.profession, 'cases', currentCase.difficulty
      );
      newStats = outcome.newStats;
      xpGained = outcome.xpGained;
      newAchievements = outcome.newAchievements;
      playGameSounds(result.won, newAchievements, state.soundEnabled);
    }

    let toastMsg = buildToast(result.message, xpGained, newAchievements);
    if (!result.correct && !result.finished) {
      const allCases = Object.values(state.professionCases).flat();
      const hint = getProximityHint(input, currentCase as any, allCases as any, result.attempts);
      if (hint.hint) toastMsg += `;${hint.hint}`;
    }

    set({
      casesState: newCasesState,
      stats: newStats,
      toast: toastMsg,
      confetti: result.won && state.confettiEnabled,
    });
  },

  nextCase: () => {
    const profession = get().currentProfession;
    if (!profession) return;
    get().loadCase(profession);
  },
});
