import type { Specialty } from '../types';

export type Profession = 'nurse' | 'paramedic' | 'doctor';

export interface ProfessionConfig {
  id: Profession;
  title: string;
  titlePlural: string;
  description: string;
  color: string;
  icon: string;
  level: 'basic' | 'intermediate' | 'advanced';
  caseFocus: string[];
  simFocus: string[];
  maxDifficulty: 1 | 2 | 3;
  features: string[];
}

export const PROFESSIONS: Record<Profession, ProfessionConfig> = {
  nurse: {
    id: 'nurse',
    title: 'Медсестра',
    titlePlural: 'Медсёстры',
    description: 'Базовый уровень: наблюдение, фиксация виталов, распознавание угроз, базовая помощь',
    color: '#0d9488',
    icon: 'nurse',
    level: 'basic',
    caseFocus: ['наблюдение', 'фиксация виталов', 'распознавание угроз', 'базовая помощь'],
    simFocus: ['палатные сценарии', 'мониторинг', 'неотложная помощь'],
    maxDifficulty: 2,
    features: ['Подсказки всегда доступны', 'Фокус на наблюдении', 'Простые сценарии'],
  },
  paramedic: {
    id: 'paramedic',
    title: 'Фельдшер',
    titlePlural: 'Фельдшеры',
    description: 'Средний уровень: первичная диагностика, неотложная помощь, стабилизация, транспортировка',
    color: '#0ea5e9',
    icon: 'ambulance',
    level: 'intermediate',
    caseFocus: ['первичная диагностика', 'неотложная помощь', 'стабилизация', 'транспортировка'],
    simFocus: ['экстренные вызовы', 'ДТП', 'ОКС', 'травма', 'ОНМК'],
    maxDifficulty: 2,
    features: ['Частичные подсказки', 'Алгоритмы стабилизации', 'Показания к транспортировке'],
  },
  doctor: {
    id: 'doctor',
    title: 'Врач',
    titlePlural: 'Врачи',
    description: 'Высокий уровень: полный клинический цикл с выбором специальности',
    color: '#8b5cf6',
    icon: 'physician',
    level: 'advanced',
    caseFocus: ['анамнез', 'диагностика', 'диагноз', 'лечение', 'наблюдение'],
    simFocus: ['сложные клинические цепочки', 'множественная патология', 'осложнения'],
    maxDifficulty: 3,
    features: ['Без подсказок', 'Дифференциальная диагностика', 'Доказательная база', 'Выбор специальности'],
  },
};

export type SimStageType = 'assessment' | 'action' | 'decision' | 'documentation' | 'communication';

export interface SimStageOption {
  id: string;
  text: string;
  correct: boolean;
  requires?: string[];
  score?: { assessment?: number; action?: number; documentation?: number; communication?: number };
  patientEffect?: {
    bp_sys?: number; bp_dia?: number; pulse?: number; spo2?: number; rr?: number;
    temp?: number; pain?: number; consciousness?: number; consciousnessText?: string;
    status?: 'stable' | 'warning' | 'critical';
  };
  timeCost?: number;
  nextStage: string;
  feedback: string;
  log?: string;
}

export interface SimStage {
  id: string;
  title: string;
  description: string;
  type: SimStageType;
  timeLimit: number;
  hint?: string;
  options: SimStageOption[];
  final?: boolean;
  result?: 'success' | 'partial' | 'failure' | 'death';
}

export interface SimulatorScenario {
  id: string;
  title: string;
  profession: Profession;
  specialty: Specialty;
  specialtyName: string;
  difficulty: 1 | 2 | 3;
  description: string;
  tags: string[];
  startStage: string;
  initialPatient: {
    name: string; age: string; avatar?: string; gender: 'male' | 'female';
    consciousness: number; consciousnessText: string;
    vitals: { bp_sys: number; bp_dia: number; pulse: number; spo2: number; rr: number; temp: number; pain: number };
    skin?: string; status: 'stable' | 'warning' | 'critical';
  };
  inventory: string[];
  stages: Record<string, SimStage>;
  crRef?: { number: string; version: string; url: string };
  learningOutcomes: string[];
}

export interface SimulatorState {
  scenario: SimulatorScenario | null;
  currentStage: string;
  patient: SimulatorScenario['initialPatient'] | null;
  inventory: string[];
  selectedItems: string[];
  score: { assessment: number; action: number; documentation: number; communication: number };
  maxScore: { assessment: number; action: number; documentation: number; communication: number };
  history: SimHistoryEntry[];
  startTime: number;
  elapsedSeconds: number;
  stepsTaken: number;
  totalSteps: number;
  patientAlive: boolean;
  gameOver: boolean;
  timeLeft: number;
}

export interface SimHistoryEntry {
  stageTitle: string;
  chosenText: string;
  correct: boolean;
  score: Record<string, number>;
  feedback: string;
  timestamp: number;
}

export interface SimulatorResult {
  totalScore: number;
  maxTotalScore: number;
  percent: number;
  resultType: 'excellent' | 'good' | 'needs-work' | 'death';
  categoryScores: {
    assessment: { value: number; max: number; percent: number };
    action: { value: number; max: number; percent: number };
    documentation: { value: number; max: number; percent: number };
    communication: { value: number; max: number; percent: number };
  };
  history: SimHistoryEntry[];
  elapsedSeconds: number;
  learningOutcomes: string[];
}
