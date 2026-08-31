// cr-extractor — TypeScript interfaces (pure types, no runtime deps)

export type CrStatus = 'active' | 'archived' | 'draft';
export type Severity = 'mild' | 'moderate' | 'severe' | 'variable';
export type Frequency = 'always' | 'often' | 'sometimes' | 'rare';
export type TimeUnit = 'min' | 'hour' | 'day';
export type DistributionType = 'normal' | 'lognormal' | 'uniform';
export type ScenarioId = string;
export type CrSpecialty = string;
export type Difficulty = 1 | 2 | 3;

export interface DurationRange { min: number; max: number; unit: TimeUnit; }
export interface NormalRange { min?: number; max?: number; text?: string; }

export interface ComplaintTemplate {
  id: string;
  text: string;
  severity: Severity;
  frequency: Frequency;
  variants: string[];
  location: string[];
  irradiation: string[];
  duration: DurationRange;
  triggers: string[];
  relievingFactors: string[];
  typical: boolean;
}

export interface AnamnesisTemplate {
  id: string;
  category: 'risk_factor' | 'comorbidity' | 'medication' | 'lifestyle' | 'family';
  label: string;
  description?: string;
  weight: number;
  correlatesWith?: string[];
}

export interface PhysicalExamTemplate {
  id: string;
  label: string;
  description?: string;
  typical: boolean;
  severity?: Severity;
}

export interface ValueDistribution {
  type: DistributionType;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
}

export interface ValueScenario {
  scenarioId: string;
  description: string;
  valueDistribution: ValueDistribution;
  probability: number;
  correlatesWith?: string[];
}

export interface LabTestTemplate {
  id: string;
  name: string;
  unit: string;
  normalRange: NormalRange;
  valueScenarios: ValueScenario[];
}

export interface InstrumentalPattern {
  id: string;
  label: string;
  description: string;
  probability: number;
  correlatesWith?: string[];
}

export interface InstrumentalTemplate {
  id: string;
  name: string;
  modality: string;
  patterns: InstrumentalPattern[];
}

export interface DiagnosticCriterion {
  id: string;
  label: string;
  description: string;
  required: boolean;
  weight: number;
}

export interface DifferentialItem {
  id: string;
  label: string;
  mkb10?: string[];
  keyDifferences: string[];
  discriminatingFindings: string[];
}

export interface TreatmentStep {
  id: string;
  stage: 'emergency' | 'therapy' | 'surgery';
  label: string;
  description: string;
  priority: number;
}

export interface AlgorithmNode {
  id: string;
  label: string;
  type: 'decision' | 'action' | 'terminal';
  condition?: string;
}

export interface AlgorithmEdge {
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

export interface ClinicalAlgorithm {
  id: string;
  label: string;
  nodes: AlgorithmNode[];
  edges: AlgorithmEdge[];
}

export interface EvidenceItem {
  id: string;
  source: string;
  url?: string;
  grade: 'A' | 'B' | 'C';
  recommendation: string;
}

export interface ClinicalPicture {
  complaints: ComplaintTemplate[];
  anamnesis: AnamnesisTemplate[];
  physicalExam: PhysicalExamTemplate[];
}

export interface Diagnostics {
  lab: LabTestTemplate[];
  instrumental: InstrumentalTemplate[];
  criteria: DiagnosticCriterion[];
}

export interface Treatment {
  emergency: TreatmentStep[];
  therapy: TreatmentStep[];
  surgery: TreatmentStep[];
}

export interface ScenarioProfile {
  id: string;
  label: string;
  demography: {
    ageRange: { min: number; max: number };
    gender: 'male' | 'female' | 'any';
  };
  comorbidities: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  typicality: 'typical' | 'atypical' | 'masking';
  stage: 'early' | 'acute' | 'subacute';
  complications: string[];
}

export interface GeneratedPatient {
  age: number;
  gender: 'male' | 'female';
  occupation: string;
  riskFactors: string[];
  comorbidities: string[];
}

export interface GeneratedCase {
  id: string;
  sourceCr: string;
  scenario: ScenarioProfile;
  patient: GeneratedPatient;
  clues: string[];
  diagnosis: string[];
  explanation: string;
  metaRef: {
    nosoId: string;
    hypothesisId: string;
    layer1Ids?: string[];
    layer2Ids?: string[];
    diffId?: string;
    evidenceIds?: string[];
  };
  differentialHints: string[];
}

export interface CaseGenerationParams {
  crId: string;
  scenarioProfile?: ScenarioProfile;
  seed?: string;
  difficulty?: Difficulty;
}

export interface ClinicalRecommendation {
  id: string;
  number: number;
  version: number;
  title: string;
  mkb10: string[];
  specialty: CrSpecialty;
  status: CrStatus;
  updatedAt: string;
  sourceUrl: string;
  clinicalPicture: ClinicalPicture;
  diagnostics: Diagnostics;
  differential: DifferentialItem[];
  treatment: Treatment;
  algorithms: ClinicalAlgorithm[];
  evidence: EvidenceItem[];
}

export interface CrRegistryItem {
  id: string;
  number: number;
  version: number;
  title: string;
  specialty: string;
  status: CrStatus;
  filePath: string;
  updatedAt: string;
}

export interface CrRegistry {
  version: string;
  lastUpdated: string;
  items: CrRegistryItem[];
}
