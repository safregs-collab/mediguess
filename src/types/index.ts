export type GameMode = 'daily' | 'endless' | 'archive' | 'roleplay' | 'roleplayArchive' | 'simulation';
export type GuessResult = 'correct' | 'wrong';

export type Specialty =
  | 'cardiology'
  | 'pulmonology'
  | 'gastroenterology'
  | 'neurology'
  | 'endocrinology'
  | 'nephrology'
  | 'dermatology'
  | 'rheumatology'
  | 'infections'
  | 'pediatrics'
  | 'oncology'
  | 'emergency';

export type Role =
  | 'nurse'
  | 'intern'
  | 'resident'
  | 'physician'
  | 'surgeon'
  | 'anesthesiologist'
  | 'therapist'
  | 'pediatrician';

export interface Case {
  id: number;
  specialty: Specialty;
  specialtyName: string;
  diagnosis: string[];
  clues: string[];
  explanation: string;
}

export interface RoleplayCase {
  id: number;
  role: Role;
  roleName: string;
  difficulty: 1 | 2 | 3;
  diagnosis: string[];
  clues: string[];
  explanation: string;
  image?: string;
}

export interface SpecialtyStats {
  games: number;
  wins: number;
}

export interface Stats {
  games: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: [number, number, number, number, number, number];
  specialtyStats: Record<string, SpecialtyStats>;
  lastPlayedDate: string | null;
  roleplayStats: Record<string, SpecialtyStats>;
}

export interface DailyState {
  date: string;
  caseId: number;
  attempts: number;
  history: GuessResult[];
  finished: boolean;
  won: boolean;
}

export interface EndlessState {
  caseId: number;
  attempts: number;
  history: GuessResult[];
  finished: boolean;
  won: boolean;
}

export interface RoleplayState {
  caseId: number;
  role: Role | null;
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
