export type GameMode = 'professionSelect' | 'daily' | 'endless' | 'simulator' | 'archive' | 'specialtySelect';
export type AppScreen = 'home' | 'games' | 'metaZone';
export type GuessResult = 'correct' | 'wrong';
export type Profession = 'nurse' | 'paramedic' | 'doctor';
export type Specialty = 'cardiology' | 'pulmonology' | 'gastroenterology' | 'neurology' | 'endocrinology' | 'nephrology' | 'dermatology' | 'rheumatology' | 'infections' | 'pediatrics' | 'oncology' | 'emergency' | 'obstetrics' | 'ophthalmology' | 'ent' | 'hematology';

export interface MetaCaseRef {
  nosoId: string;
  hypothesisId: string;
  layer1Ids?: string[];
  layer2Ids?: string[];
  diffId?: string;
  evidenceIds?: string[];
  timelineId?: string;
}

export interface UnifiedCase {
  id: string;
  profession: Profession;
  specialty: Specialty;
  specialtyName: string;
  difficulty: 1 | 2 | 3;
  diagnosis: string[];
  clues: string[];
  explanation: string;
  source: 'manual' | 'cr' | 'meta';
  crRef?: { number: string; version: string; url: string };
  metaRef?: MetaCaseRef;
  patient?: { name?: string; age?: number; gender?: 'male' | 'female'; occupation?: string };
  taskType?: 'recognize' | 'diagnose' | 'full-cycle';
  answerType?: 'single' | 'multiple' | 'freetext';
  hints?: string[];
  skills?: string[];
  evidence?: { udd?: string; uur?: string; crSection?: string };
}

export interface SpecialtyStats { games: number; wins: number; }

export interface CompletedCaseInfo {
  id: string;
  won: boolean;
  date: string;
  profession: Profession;
  mode: 'cases' | 'simulator';
}

export interface XpState { totalXp: number; level: number; }
export interface Achievement { id: string; unlockedAt: string; }

export interface ProfessionStats {
  games: number;
  wins: number;
  casesCompleted: number;
  simCompleted: number;
  bestStreak: number;
}

export interface MetaStats {
  casesCompleted: number;
  perfectCases: number;
  evidenceEvaluated: number;
  algorithmsCompleted: number;
  scalesUsed: number;
  specialistLevelCompleted: boolean;
}

export interface Stats {
  _schemaVersion: number;
  games: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: [number, number, number, number, number, number];
  specialtyStats: Record<string, SpecialtyStats>;
  lastPlayedDate: string | null;
  professionStats: Record<Profession, ProfessionStats>;
  completedCases: { cases: CompletedCaseInfo[]; simulator: CompletedCaseInfo[] };
  xp: XpState;
  achievements: Achievement[];
  metaStats: MetaStats;
}

export interface CasesState {
  caseId: string;
  profession: Profession;
  attempts: number;
  history: GuessResult[];
  finished: boolean;
  won: boolean;
}

export interface GameCheckResult {
  correct: boolean;
  finished: boolean;
  won: boolean;
  attempts: number;
  message: string;
}

export * from './simulation';
