export interface Patient {
  name: string;
  age: number;
  gender: 'male' | 'female';
  photo?: string;
  occupation: string;
}

export interface HistoryQuestion {
  id: string;
  question: string;
  answer: string;
  isClinicallySignificant: boolean;
}

export interface VitalSigns {
  temperature: number;
  heartRate: number;
  bloodPressure: string;
  respiratoryRate: number;
  spo2: number;
  height: number;
  weight: number;
}

export interface PhysicalFinding {
  region: 'general' | 'head' | 'chest' | 'abdomen' | 'skin' | 'neuro' | 'extremities' | 'back';
  finding: string;
  isAbnormal: boolean;
}

export interface AvailableTest {
  id: string;
  name: string;
  category: 'lab' | 'imaging' | 'ecg' | 'other';
  synonyms: string[]; // для распознавания ввода
  turnaroundTime: number; // ходов до результата
  results: TestResult[];
  image?: string;
}

export interface TestResult {
  parameter: string;
  value: string;
  normalRange: string;
  isAbnormal: boolean;
  interpretation: string;
}

export interface TreatmentProtocol {
  drugs: { name: string; dose: string; route: string; duration: string; synonyms?: string[] }[];
  procedures?: string[];
  regimen: 'bed' | 'general' | 'semi-bed';
  diet?: string;
  contraindications?: string[]; // что НЕЛЬЗЯ назначать
}

export interface SimulationCase {
  id: number;
  patient: Patient;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  historyQuestions: HistoryQuestion[];
  vitals: VitalSigns;
  physicalExam: PhysicalFinding[];
  availableTests: AvailableTest[];
  correctDiagnosis: string[];
  correctTreatment: TreatmentProtocol;
  explanation: string;
  complications?: string[]; // при неправильном лечении
}

export interface OrderedTest {
  testId: string;
  orderedAtStage: number;
  resultReady: boolean;
}

export interface SimulationState {
  caseId: number | null;
  stage: 'patient' | 'vitals' | 'exam' | 'tests' | 'diagnosis' | 'treatment' | 'result';
  askedQuestions: string[];
  revealedVitals: boolean;
  revealedExam: boolean;
  orderedTests: OrderedTest[];
  diagnosis: string;
  treatmentInput: string;
  finished: boolean;
  won: boolean;
  score: {
    diagnosisCorrect: boolean;
    treatmentCorrect: boolean;
    unnecessaryTests: number;
    missedKeyTests: number;
    total: number; // 0-100
  };
}
