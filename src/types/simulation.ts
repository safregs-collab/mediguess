export interface SimulationCasePatientVitalSign {
  value: string;
  unit: string;
  alert?: boolean;
}

export interface SimulationCasePatientVitalSignsRecord {
  [key: string]: SimulationCasePatientVitalSign;
}

export interface SimulationCasePatientHistory {
  life: string;
  disease: string;
  allergy: string;
  heredity: string;
}

export interface SimulationCasePatientPhysicalExam {
  general: string;
  heart: string;
  lungs: string;
  abdomen: string;
  kidneys: string;
  vessels: string;
}

export interface SimulationCasePatient {
  name: string;
  age: number;
  gender: 'male' | 'female';
  occupation: string;
  complaints: string[];
  history: SimulationCasePatientHistory;
  vitals: SimulationCasePatientVitalSignsRecord;
  physicalExam?: SimulationCasePatientPhysicalExam;
}

export type EvidenceLevel = 'udd1' | 'udd2' | 'udd3' | 'udd4' | 'udd5';
export type RecommendationLevel = 'uurA' | 'uurB' | 'uurC';

export interface EvidenceTag {
  udd?: EvidenceLevel;
  uur?: RecommendationLevel;
  cr?: string;
  crUrl?: string;
}

export interface SimulationCaseOption {
  id: string;
  text: string;
  correct: boolean;
  required?: boolean;
  penalty?: boolean;
  explanation?: string;
  evidence?: EvidenceTag;
  category?: string;
}

export interface SimulationCaseStage {
  id: string;
  title: string;
  description: string;
  type: 'multiselect' | 'single' | 'freetext';
  options?: SimulationCaseOption[];
  evidence?: EvidenceTag;
  hint?: string;
  // === Поля для freetext-этапа ===
  expectedKeywords?: string[];
  correctAnswers?: string[];
  minKeywordsMatch?: number;
  keywordThreshold?: number; // процент от 0 до 1
  explanation?: string;
}

export interface SimulationCaseResult {
  minScore: number;
  title: string;
  text: string;
}

export interface SimulationCaseResults {
  excellent: SimulationCaseResult;
  good: SimulationCaseResult;
  needsWork: SimulationCaseResult;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type PlayerLevel = 'student' | 'resident' | 'specialist';

export interface SimulationCase {
  id: string;
  title: string;
  mkb: string;
  crNumber: string;
  crVersion: string;
  crUrl: string;
  difficulty: DifficultyLevel;
  specialty: string;
  patient: SimulationCasePatient;
  stages: SimulationCaseStage[];
  results: SimulationCaseResults;
  correctDiagnosis?: string[];
  correctTreatment?: { drugs: Array<{ name: string; synonyms?: string[] }> };
  availableTests?: Array<{
    id: string;
    name: string;
    category: string;
    result: string;
    normalRange?: string;
    abnormal?: boolean;
    image?: string;
  }>;
}

export interface AlgorithmStep {
  id: string;
  type: 'start' | 'decision' | 'action' | 'end';
  text: string;
}

export interface ClinicalAlgorithm {
  id: string;
  title: string;
  cr: string;
  crUrl: string;
  specialty: string;
  steps: AlgorithmStep[];
}

export interface SimulationProgress {
  attempts: number;
  bestScore: number;
  completed: boolean;
}

export type SimulationStage = 'patient' | 'vitals' | 'exam' | 'tests' | 'diagnosis' | 'treatment' | 'result';

export interface SimulationTestOrder {
  testId: string;
  orderedAtStage: number;
  resultReady: boolean;
}

export interface SimulationScore {
  diagnosisCorrect: boolean;
  treatmentCorrect: boolean;
  unnecessaryTests: number;
  missedKeyTests: number;
  total: number;
}

export interface SimulationState {
  caseId: string;
  stage: SimulationStage;
  askedQuestions: string[];
  revealedVitals: boolean;
  revealedExam: boolean;
  orderedTests: SimulationTestOrder[];
  diagnosis: string;
  treatmentInput: string;
  finished: boolean;
  won: boolean;
  score: SimulationScore;
}

export interface SimulationArchiveCase {
  id: string;
  title: string;
  specialty: string;
  difficulty: DifficultyLevel;
  mkb: string;
  crNumber: string;
  crVersion: string;
}
