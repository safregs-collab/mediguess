import { create } from 'zustand';
import type { Case, DailyState, EndlessState, Stats, GameMode, Role, RoleplayState, RoleplayCase, SimulationCase, SimulationState, AppScreen, CompletedCaseInfo } from '../../types';
import { createDatabase } from '../../lib/db';
import {
  getDailyCase,
  initDailyState,
  processGuess,
  updateStats,
  shouldResetStreak,
  getTodayStr,
} from '../../features/games/logic/gameLogic';
import { getDefaultStats, loadRoleplayState, saveRoleplayState, loadSimulationState, saveSimulationState } from '../../features/games/logic/storage';
import { processRoleplayGuess } from '../../features/games/logic/roleplayLogic';
import { getRandomRoleplayCase } from '../../features/games/logic/roleplayCases';
import { getRandomSimulationCase } from '../../features/games/logic/simulationCases';
import { calculateCaseXp, calculateSimulationXp, addXp } from '../../features/gamification/xpLogic';
import { checkAchievements, checkPerfectSimulation } from '../../features/gamification/achievements';

const db = createDatabase();

function addCompletedCase(list: CompletedCaseInfo[], id: number, won: boolean): CompletedCaseInfo[] {
  const existing = list.find(c => c.id === id);
  const date = new Date().toISOString();
  if (existing) {
    return list.map(c => c.id === id ? { ...c, won, date } : c);
  }
  return [...list, { id, won, date }];
}

interface GameStore {
  cases: readonly Case[];
  roleplayCases: readonly RoleplayCase[];
  simulationCases: readonly SimulationCase[];
  loading: boolean;
  currentMode: GameMode;
  dailyState: DailyState | null;
  endlessState: EndlessState | null;
  roleplayState: RoleplayState | null;
  simulationCase: SimulationCase | null;
  simulationState: SimulationState | null;
  stats: Stats;
  activeFilter: string;
  roleplayRoleFilter: Role | 'all';
  toast: string | null;
  statsOpen: boolean;
  howtoOpen: boolean;
  selectedAutocomplete: number;
  currentMatches: string[];
  confetti: boolean;
  currentScreen: AppScreen;

  init: () => Promise<void>;
  goToHome: () => void;
  goToGames: () => void;
  switchMode: (mode: GameMode) => void;
  checkDiagnosis: (mode: 'daily' | 'endless', input: string) => void;
  checkRoleplayDiagnosis: (input: string) => void;
  loadEndlessCase: () => void;
  loadRoleplayCase: (role?: Role | null) => void;
  setActiveFilter: (filter: string) => void;
  setRoleplayRoleFilter: (filter: Role | 'all') => void;
  showToast: (msg: string) => void;
  dismissToast: () => void;
  openStats: () => void;
  closeStats: () => void;
  openHowto: () => void;
  closeHowto: () => void;
  setSelectedAutocomplete: (idx: number) => void;
  setCurrentMatches: (matches: string[]) => void;
  loadArchiveCase: (caseId: number) => void;
  loadRoleplayArchiveCase: (caseId: number) => void;
  loadSimulationArchiveCase: (caseId: number) => void;
  resetRoleplayState: () => void;
  loadSimulationCase: () => void;
  resetSimulationState: () => void;
  askSimulationQuestion: (questionId: string) => void;
  orderSimulationTest: (testId: string) => void;
  setSimulationDiagnosis: (diagnosis: string) => void;
  setSimulationTreatment: (treatment: string) => void;
  checkSimulationResult: () => void;
  nextSimulationStage: () => void;
  prevSimulationStage: () => void;
  dismissConfetti: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  cases: [],
  roleplayCases: [],
  simulationCases: [],
  loading: true,
  currentMode: 'daily',
  dailyState: null,
  endlessState: null,
  roleplayState: null,
  simulationCase: null,
  simulationState: null,
  stats: getDefaultStats(),
  activeFilter: 'all',
  roleplayRoleFilter: 'all',
  toast: null,
  statsOpen: false,
  howtoOpen: false,
  selectedAutocomplete: -1,
  currentMatches: [],
  confetti: false,
  currentScreen: 'home',

  init: async () => {
    const cases = await db.loadCases();
    const roleplayCases = await db.loadRoleplayCases();
    const simulationCases = await db.loadSimulationCases();

    let savedDaily = db.loadDailyState();
    let stats = db.loadStats();
    const savedRoleplay = loadRoleplayState();
    const savedSimulation = loadSimulationState();

    const tauriDb = db as any;
    if (typeof tauriDb.asyncLoadStats === 'function') {
      stats = await tauriDb.asyncLoadStats();
    }
    if (typeof tauriDb.asyncLoadDailyState === 'function') {
      savedDaily = await tauriDb.asyncLoadDailyState();
    }

    const dailyState = initDailyState(savedDaily, cases);

    const today = getTodayStr();
    if (shouldResetStreak(stats.lastPlayedDate, today)) {
      stats = { ...stats, currentStreak: 0 };
      db.saveStats(stats);
    }

    set({ cases, roleplayCases, simulationCases, dailyState, stats, loading: false });

    if (savedRoleplay) {
      const caseExists = roleplayCases.some((c) => c.id === savedRoleplay.caseId);
      if (caseExists && !savedRoleplay.finished) {
        set({ roleplayState: savedRoleplay });
      } else if (savedRoleplay.finished) {
        set({ roleplayState: savedRoleplay });
      }
    }

    if (savedSimulation) {
      set({ simulationState: savedSimulation });
    }
  },

  switchMode: (mode) => {
    set({ currentMode: mode });
    if (mode === 'endless' && !get().endlessState) {
      get().loadEndlessCase();
    }
    if (mode === 'roleplay') {
      set({ roleplayState: null });
    }
    if (mode === 'simulation') {
      set({ simulationCase: null, simulationState: null });
    }
  },

  checkDiagnosis: (mode, input) => {
    const state = get();
    const currentCase =
      mode === 'daily'
        ? getDailyCase(state.cases)
        : state.cases.find((c) => c.id === state.endlessState?.caseId) || null;

    if (!currentCase) return;

    const gameState = mode === 'daily' ? state.dailyState! : state.endlessState!;
    const result = processGuess(input, currentCase, gameState.attempts);

    if (mode === 'daily') {
      const newDaily: DailyState = {
        ...state.dailyState!,
        attempts: result.attempts,
        history: [...state.dailyState!.history, result.correct ? 'correct' : 'wrong'],
        finished: result.finished,
        won: result.won,
      };
      db.saveDailyState(newDaily);

      let newStats = state.stats;
      let newAchievements: import('../../features/gamification/types').AchievementDef[] = [];
      if (result.finished) {
        newStats = updateStats(state.stats, result.won, result.attempts, currentCase.specialty);
        newStats.completedCases.daily = addCompletedCase(newStats.completedCases.daily, currentCase.id, result.won);
        const xpBreakdown = calculateCaseXp('daily', result.won, result.attempts, currentCase.specialty, newStats);
        newStats.xp = addXp(newStats.xp, xpBreakdown.total);
        newAchievements = checkAchievements(newStats);
        db.saveStats(newStats);
      }

      const achToast = newAchievements.length > 0 ? ' 🏆 ' + newAchievements.map((a) => a.title).join(', ') + '!' : '';

      set({
        dailyState: newDaily,
        stats: newStats,
        toast: result.message + (newStats.xp.totalXp > state.stats.xp.totalXp ? ` +${newStats.xp.totalXp - state.stats.xp.totalXp} XP` : '') + achToast,
        confetti: result.won,
      });
    } else {
      const newEndless: EndlessState = {
        ...state.endlessState!,
        attempts: result.attempts,
        history: [...state.endlessState!.history, result.correct ? 'correct' : 'wrong'],
        finished: result.finished,
        won: result.won,
      };

      let newStats = state.stats;
      let xpToast = '';
      let newAchievements: import('../../features/gamification/types').AchievementDef[] = [];
      if (result.finished) {
        newStats = updateStats(state.stats, result.won, result.attempts, currentCase.specialty);
        newStats.completedCases.endless = addCompletedCase(newStats.completedCases.endless, currentCase.id, result.won);
        const xpBreakdown = calculateCaseXp('endless', result.won, result.attempts, currentCase.specialty, newStats);
        newStats.xp = addXp(newStats.xp, xpBreakdown.total);
        xpToast = ` +${xpBreakdown.total} XP`;
        newAchievements = checkAchievements(newStats);
        db.saveStats(newStats);
      }

      const achToast = newAchievements.length > 0 ? ' 🏆 ' + newAchievements.map((a) => a.title).join(', ') + '!' : '';

      set({
        endlessState: newEndless,
        stats: newStats,
        toast: result.message + xpToast + achToast,
        confetti: result.won,
      });
    }
  },

  checkRoleplayDiagnosis: (input) => {
    const state = get();
    const currentCase = state.roleplayCases.find((c) => c.id === state.roleplayState?.caseId);
    if (!currentCase || !state.roleplayState) return;

    const result = processRoleplayGuess(input, currentCase, state.roleplayState.attempts);

    const newRoleplayState: RoleplayState = {
      ...state.roleplayState,
      attempts: result.attempts,
      history: [...state.roleplayState.history, result.correct ? 'correct' : 'wrong'],
      finished: result.finished,
      won: result.won,
    };

    let newStats = state.stats;
    let xpToast = '';
    let newAchievements: import('../../features/gamification/types').AchievementDef[] = [];
    if (result.finished) {
      newStats = { ...state.stats };
      if (!newStats.roleplayStats) {
        newStats.roleplayStats = {};
      }
      const roleKey = currentCase.role;
      const currentRoleStats = newStats.roleplayStats[roleKey] || { games: 0, wins: 0 };
      newStats.roleplayStats = {
        ...newStats.roleplayStats,
        [roleKey]: {
          games: currentRoleStats.games + 1,
          wins: currentRoleStats.wins + (result.won ? 1 : 0),
        },
      };
      newStats.completedCases.roleplay = addCompletedCase(newStats.completedCases.roleplay, currentCase.id, result.won);
      const xpBreakdown = calculateCaseXp('roleplay', result.won, result.attempts, currentCase.role, newStats, currentCase.difficulty);
      newStats.xp = addXp(newStats.xp, xpBreakdown.total);
      xpToast = ` +${xpBreakdown.total} XP`;
      newAchievements = checkAchievements(newStats);
      db.saveStats(newStats);
    }

    const achToast = newAchievements.length > 0 ? ' 🏆 ' + newAchievements.map((a) => a.title).join(', ') + '!' : '';

    set({
      roleplayState: newRoleplayState,
      stats: newStats,
      toast: result.message + xpToast + achToast,
      confetti: result.won,
    });
    saveRoleplayState(newRoleplayState);
  },

  loadEndlessCase: () => {
    const cases = get().cases;
    if (cases.length === 0) return;
    const idx = Math.floor(Math.random() * cases.length);
    set({
      endlessState: {
        caseId: cases[idx].id,
        attempts: 0,
        history: [],
        finished: false,
        won: false,
      },
    });
  },

  loadRoleplayCase: (role) => {
    const roleplayCases = get().roleplayCases;
    if (roleplayCases.length === 0) return;
    const newCase = getRandomRoleplayCase(role);
    if (!newCase) return;
    set({
      roleplayState: {
        caseId: newCase.id,
        role: newCase.role,
        attempts: 0,
        history: [],
        finished: false,
        won: false,
      },
    });
    saveRoleplayState(get().roleplayState);
  },

  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setRoleplayRoleFilter: (filter) => set({ roleplayRoleFilter: filter }),
  showToast: (msg) => set({ toast: msg }),
  dismissToast: () => set({ toast: null }),
  openStats: () => set({ statsOpen: true }),
  closeStats: () => set({ statsOpen: false }),
  openHowto: () => set({ howtoOpen: true }),
  closeHowto: () => set({ howtoOpen: false }),
  setSelectedAutocomplete: (idx) => set({ selectedAutocomplete: idx }),
  setCurrentMatches: (matches) => set({ currentMatches: matches }),

  loadArchiveCase: (caseId) => {
    const c = get().cases.find((c) => c.id === caseId);
    if (!c) return;
    set({
      endlessState: {
        caseId: c.id,
        attempts: 0,
        history: [],
        finished: false,
        won: false,
      },
      currentMode: 'endless',
    });
  },

  loadRoleplayArchiveCase: (caseId) => {
    const c = get().roleplayCases.find((c) => c.id === caseId);
    if (!c) return;
    set({
      roleplayState: {
        caseId: c.id,
        role: c.role,
        attempts: 0,
        history: [],
        finished: false,
        won: false,
      },
      currentMode: 'roleplay',
    });
    saveRoleplayState(get().roleplayState);
  },

  loadSimulationArchiveCase: (caseId) => {
    const c = get().simulationCases.find((c) => c.id === caseId);
    if (!c) return;
    set({
      simulationCase: c,
      simulationState: {
        caseId: c.id,
        stage: 'patient',
        askedQuestions: [],
        revealedVitals: false,
        revealedExam: false,
        orderedTests: [],
        diagnosis: '',
        treatmentInput: '',
        finished: false,
        won: false,
        score: { diagnosisCorrect: false, treatmentCorrect: false, unnecessaryTests: 0, missedKeyTests: 0, total: 0 },
      },
      currentMode: 'simulation',
    });
    saveSimulationState(get().simulationState);
  },

  resetRoleplayState: () => {
    set({ roleplayState: null });
    saveRoleplayState(null);
  },

  loadSimulationCase: () => {
    const newCase = getRandomSimulationCase();
    set({
      simulationCase: newCase,
      simulationState: {
        caseId: newCase.id,
        stage: 'patient',
        askedQuestions: [],
        revealedVitals: false,
        revealedExam: false,
        orderedTests: [],
        diagnosis: '',
        treatmentInput: '',
        finished: false,
        won: false,
        score: { diagnosisCorrect: false, treatmentCorrect: false, unnecessaryTests: 0, missedKeyTests: 0, total: 0 },
      },
      currentMode: 'simulation',
    });
    saveSimulationState(get().simulationState);
  },

  resetSimulationState: () => {
    set({ simulationCase: null, simulationState: null });
    saveSimulationState(null);
  },

  askSimulationQuestion: (questionId) => {
    const state = get().simulationState;
    if (!state) return;
    set({
      simulationState: {
        ...state,
        askedQuestions: [...state.askedQuestions, questionId],
      },
    });
    saveSimulationState(get().simulationState);
  },

  orderSimulationTest: (testId: string) => {
    const state = get().simulationState;
    if (!state) return;
    if (state.orderedTests.find((t) => t.testId === testId)) return;
    const stageIdx = ['patient', 'vitals', 'exam', 'tests', 'diagnosis', 'treatment', 'result'].indexOf(state.stage);
    set({
      simulationState: {
        ...state,
        orderedTests: [...state.orderedTests, { testId, orderedAtStage: stageIdx, resultReady: true }],
      },
    });
    saveSimulationState(get().simulationState);
  },

  setSimulationDiagnosis: (diagnosis: string) => {
    const state = get().simulationState;
    if (!state) return;
    set({ simulationState: { ...state, diagnosis } });
    saveSimulationState(get().simulationState);
  },

  setSimulationTreatment: (treatmentInput: string) => {
    const state = get().simulationState;
    if (!state) return;
    set({ simulationState: { ...state, treatmentInput } });
    saveSimulationState(get().simulationState);
  },

  checkSimulationResult: () => {
    const state = get();
    const simCase = state.simulationCase;
    const simState = state.simulationState;
    if (!simCase || !simState) return;

    const diagnosisCorrect = simCase.correctDiagnosis.some(
      (d) => simState.diagnosis.toLowerCase().includes(d.toLowerCase())
    );

    const treatmentLower = simState.treatmentInput.toLowerCase();
    const treatmentCorrect = simCase.correctTreatment.drugs.every((drug) => {
      const names = [drug.name.toLowerCase(), ...(drug.synonyms || []).map((s) => s.toLowerCase())];
      return names.some((n) => treatmentLower.includes(n.split(" ")[0]));
    });

    const keyTests = simCase.availableTests.filter((t) =>
      ['ecg', 'troponin', 'd_dimer', 'ct_angio', 'usg_abdomen', 'usg_legs'].includes(t.id)
    );
    const orderedIds = simState.orderedTests.map((t) => t.testId);
    const missedKeyTests = keyTests.filter((t) => !orderedIds.includes(t.id)).length;
    const unnecessaryTests = Math.max(0, simState.orderedTests.length - keyTests.length);

    let total = 0;
    if (diagnosisCorrect) total += 40;
    if (treatmentCorrect) total += 30;
    total += Math.max(0, 20 - missedKeyTests * 5);
    total += Math.max(0, 10 - unnecessaryTests * 3);
    total = Math.min(100, total);

    const newSimState = {
      ...simState,
      finished: true,
      won: diagnosisCorrect,
      score: { diagnosisCorrect, treatmentCorrect, unnecessaryTests, missedKeyTests, total },
    };

    let newStats = state.stats;
    newStats.completedCases.simulation = addCompletedCase(newStats.completedCases.simulation, simCase.id, diagnosisCorrect);
    const xpBreakdown = calculateSimulationXp(total);
    newStats.xp = addXp(newStats.xp, xpBreakdown.total);
    const newAchievements = checkAchievements(newStats);
    if (total === 100) {
      const perfect = checkPerfectSimulation(newStats);
      if (perfect) newAchievements.push(perfect);
    }
    db.saveStats(newStats);

    const achToast = newAchievements.length > 0 ? ' 🏆 ' + newAchievements.map((a) => a.title).join(', ') + '!' : '';

    set({
      simulationState: newSimState,
      stats: newStats,
      toast: `Результат: ${total}/100  +${xpBreakdown.total} XP` + achToast,
    });
    saveSimulationState(newSimState);
  },

  nextSimulationStage: () => {
    const state = get().simulationState;
    if (!state) return;
    const stages: SimulationState['stage'][] = ['patient', 'vitals', 'exam', 'tests', 'diagnosis', 'treatment', 'result'];
    const idx = stages.indexOf(state.stage);
    const next = stages[Math.min(idx + 1, stages.length - 1)];
    const updates: Partial<SimulationState> = { stage: next };
    if (next === 'vitals') updates.revealedVitals = true;
    if (next === 'exam') updates.revealedExam = true;
    set({ simulationState: { ...state, ...updates } });
    saveSimulationState(get().simulationState);
  },

  prevSimulationStage: () => {
    const state = get().simulationState;
    if (!state) return;
    const stages: SimulationState['stage'][] = ['patient', 'vitals', 'exam', 'tests', 'diagnosis', 'treatment', 'result'];
    const idx = stages.indexOf(state.stage);
    const prev = stages[Math.max(idx - 1, 0)];
    set({ simulationState: { ...state, stage: prev } });
    saveSimulationState(get().simulationState);
  },

  dismissConfetti: () => set({ confetti: false }),

  goToHome: () => {
    set({ currentScreen: 'home' });
  },

  goToGames: () => {
    set({ currentScreen: 'games', currentMode: 'daily' });
  },
}));
