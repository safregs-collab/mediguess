// =============================================================================
// ТИПЫ ДЛЯ ВЕТВЯЩЕГОСЯ (NODE-BASED) КЛИНИЧЕСКОГО СИМУЛЯТОРА
// DOC-W v0.1.1 — Экстренные сценарии для медсестер и врачей
// =============================================================================

// Роль пользователя в симуляции
export type SimRole = 'nurse' | 'doctor';

// Сложность сценария
export type SimDifficulty = 'easy' | 'medium' | 'hard';

// Статус пациента
export type PatientStatus = 'stable' | 'warning' | 'critical';

// Уровень сознания (0-4)
export type ConsciousnessLevel = 0 | 1 | 2 | 3 | 4;

// Категории оценки
export type ScoreCategory = 'diagnosis' | 'treatment' | 'docs' | 'comm';

// Результат сценария
export type ScenarioResult = 'good' | 'medium' | 'poor' | 'critical_good' | 'critical_poor' | 'death';

// =============================================================================
// ВИТАЛЬНЫЕ ПОКАЗАТЕЛИ ПАЦИЕНТА
// =============================================================================
export interface NodePatientVitals {
  bp_sys: number;
  bp_dia: number;
  pulse: number;
  spo2: number;
  rr: number;
  temp: number;
  pain: number;
}

export interface NodePatient {
  name: string;
  age: string;
  avatar: string;
  gender: 'male' | 'female';
  consciousness: ConsciousnessLevel;
  consciousnessText: string;
  vitals: NodePatientVitals;
  skin: string;
  status: PatientStatus;
}

// =============================================================================
// ЭФФЕКТЫ ВЫБОРА
// =============================================================================
export interface NodeOptionEffects {
  /** Изменения витальных показателей (дельты) */
  patient?: Partial<NodePatientVitals> & {
    consciousness?: number;
    consciousnessText?: string;
    status?: PatientStatus;
  };
  /** Начисление баллов по категориям */
  score?: Partial<Record<ScoreCategory, number>>;
  /** Затраченное время (секунд) */
  timeCost?: number;
  /** Следующий узел */
  nextNode: string;
  /** Запись в журнал */
  log?: string;
}

// =============================================================================
// ВАРИАНТ ОТВЕТА (опция)
// =============================================================================
export interface NodeOption {
  text: string;
  /** Правильный ли выбор */
  correct: boolean;
  /** Требуемые предметы из инвентаря */
  requires?: string[];
  /** Эффекты при выборе */
  effects: NodeOptionEffects;
  /** Обратная связь после выбора */
  feedback: string;
}

// =============================================================================
// УЗЕЛ СЦЕНАРИЯ
// =============================================================================
export interface SimulationNode {
  title: string;
  text: string;
  /** Подсказка (штраф -0.5 за использование) */
  hint?: string;
  /** Время на решение (секунд), 0 = без ограничения */
  timeLimit?: number;
  /** Варианты ответов */
  options: NodeOption[];
  /** Финальный узел? */
  final?: boolean;
  /** Результат финального узла */
  result?: ScenarioResult;
}

// =============================================================================
// СЦЕНАРИЙ
// =============================================================================
export interface NodeScenario {
  id: string;
  title: string;
  difficulty: SimDifficulty;
  /** Для кого предназначен (медсестра / врач / оба) */
  role: SimRole | 'both';
  description: string;
  tags: string[];
  /** Начальное состояние пациента */
  initialPatient: NodePatient;
  /** Доступный инвентарь */
  inventory: string[];
  /** Граф узлов: id → SimulationNode */
  nodes: Record<string, SimulationNode>;
  /** Начальный узел */
  startNode: string;
}

// =============================================================================
// СОСТОЯНИЕ СИМУЛЯЦИИ (runtime)
// =============================================================================
export interface NodeSimState {
  scenario: NodeScenario | null;
  currentNode: string;
  patient: NodePatient;
  inventory: string[];
  selectedItems: string[];
  score: Record<ScoreCategory, number>;
  maxScore: Record<ScoreCategory, number>;
  history: SimHistoryEntry[];
  startTime: number;
  globalTimer: number | null;
  stepTimer: number | null;
  stepTimeLeft: number;
  totalSteps: number;
  stepsTaken: number;
  patientAlive: boolean;
  gameOver: boolean;
  nextNode: string | null;
}

export interface SimHistoryEntry {
  nodeTitle: string;
  chosenText: string;
  correct: boolean;
  score: Partial<Record<ScoreCategory, number>>;
  feedback: string;
}

// =============================================================================
// ПРОГРЕСС СИМУЛЯТОРА (localStorage)
// =============================================================================
export interface NodeSimProgress {
  scenarioId: string;
  attempts: number;
  bestScore: number;
  bestResult: ScenarioResult;
  completed: boolean;
  lastPlayed: string;
}

// =============================================================================
// РЕЗУЛЬТАТ ПРОХОЖДЕНИЯ
// =============================================================================
export interface NodeSimResult {
  totalScore: number;
  maxTotalScore: number;
  percent: number;
  resultType: ScenarioResult;
  categoryScores: Record<ScoreCategory, { value: number; max: number; percent: number }>;
  history: SimHistoryEntry[];
  elapsedSeconds: number;
}
