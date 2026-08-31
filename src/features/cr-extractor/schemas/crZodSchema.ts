import { z } from 'zod';

// ===== Enums =====
export const CrStatusSchema = z.enum(['active', 'archived', 'draft']);
export const SeveritySchema = z.enum(['mild', 'moderate', 'severe', 'variable']);
export const FrequencySchema = z.enum(['always', 'often', 'sometimes', 'rare']);
export const TimeUnitSchema = z.enum(['min', 'hour', 'day']);
export const DistributionTypeSchema = z.enum(['normal', 'lognormal', 'uniform']);
export const DifficultySchema = z.enum(['1', '2', '3']).transform(Number).pipe(z.union([z.literal(1), z.literal(2), z.literal(3)]));

// ===== Primitives =====
export const DurationRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  unit: TimeUnitSchema,
});

export const NormalRangeSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  text: z.string().optional(),
});

// ===== Complaint =====
export const ComplaintTemplateSchema = z.object({
  id: z.string(),
  text: z.string(),
  severity: SeveritySchema,
  frequency: FrequencySchema,
  variants: z.array(z.string()),
  location: z.array(z.string()),
  irradiation: z.array(z.string()),
  duration: DurationRangeSchema,
  triggers: z.array(z.string()),
  relievingFactors: z.array(z.string()),
  typical: z.boolean(),
});

// ===== Anamnesis =====
export const AnamnesisTemplateSchema = z.object({
  id: z.string(),
  category: z.enum(['risk_factor', 'comorbidity', 'medication', 'lifestyle', 'family']),
  label: z.string(),
  description: z.string().optional(),
  weight: z.number().min(0).max(1),
  correlatesWith: z.array(z.string()).optional(),
});

// ===== Physical Exam =====
export const PhysicalExamTemplateSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  typical: z.boolean(),
  severity: SeveritySchema.optional(),
});

// ===== Lab =====
export const ValueDistributionSchema = z.object({
  type: DistributionTypeSchema,
  mean: z.number(),
  stdDev: z.number(),
  min: z.number(),
  max: z.number(),
});

export const ValueScenarioSchema = z.object({
  scenarioId: z.string(),
  description: z.string(),
  valueDistribution: ValueDistributionSchema,
  probability: z.number().min(0).max(1),
  correlatesWith: z.array(z.string()).optional(),
});

export const LabTestTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
  normalRange: NormalRangeSchema,
  valueScenarios: z.array(ValueScenarioSchema),
});

// ===== Instrumental =====
export const InstrumentalPatternSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  probability: z.number().min(0).max(1),
  correlatesWith: z.array(z.string()).optional(),
});

export const InstrumentalTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  modality: z.string(),
  patterns: z.array(InstrumentalPatternSchema),
});

// ===== Diagnostic Criterion =====
export const DiagnosticCriterionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  required: z.boolean(),
  weight: z.number().min(0).max(1),
});

// ===== Differential =====
export const DifferentialItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  mkb10: z.array(z.string()).optional(),
  keyDifferences: z.array(z.string()),
  discriminatingFindings: z.array(z.string()),
});

// ===== Treatment =====
export const TreatmentStepSchema = z.object({
  id: z.string(),
  stage: z.enum(['emergency', 'therapy', 'surgery']),
  label: z.string(),
  description: z.string(),
  priority: z.number().int().positive(),
});

// ===== Algorithm =====
export const AlgorithmNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['decision', 'action', 'terminal']),
  condition: z.string().optional(),
});

export const AlgorithmEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  condition: z.string().optional(),
});

export const ClinicalAlgorithmSchema = z.object({
  id: z.string(),
  label: z.string(),
  nodes: z.array(AlgorithmNodeSchema),
  edges: z.array(AlgorithmEdgeSchema),
});

// ===== Evidence =====
export const EvidenceItemSchema = z.object({
  id: z.string(),
  source: z.string(),
  url: z.string().optional(),
  grade: z.enum(['A', 'B', 'C']),
  recommendation: z.string(),
});

// ===== Clinical Picture =====
export const ClinicalPictureSchema = z.object({
  complaints: z.array(ComplaintTemplateSchema),
  anamnesis: z.array(AnamnesisTemplateSchema),
  physicalExam: z.array(PhysicalExamTemplateSchema),
});

// ===== Diagnostics =====
export const DiagnosticsSchema = z.object({
  lab: z.array(LabTestTemplateSchema),
  instrumental: z.array(InstrumentalTemplateSchema),
  criteria: z.array(DiagnosticCriterionSchema),
});

// ===== Treatment =====
export const TreatmentSchema = z.object({
  emergency: z.array(TreatmentStepSchema),
  therapy: z.array(TreatmentStepSchema),
  surgery: z.array(TreatmentStepSchema),
});

// ===== Clinical Recommendation (full) =====
export const ClinicalRecommendationSchema = z.object({
  id: z.string(),
  number: z.number().int(),
  version: z.number().int(),
  title: z.string(),
  mkb10: z.array(z.string()),
  specialty: z.string(),
  status: CrStatusSchema,
  updatedAt: z.string().datetime().or(z.string()),
  sourceUrl: z.string(),
  clinicalPicture: ClinicalPictureSchema,
  diagnostics: DiagnosticsSchema,
  differential: z.array(DifferentialItemSchema),
  treatment: TreatmentSchema,
  algorithms: z.array(ClinicalAlgorithmSchema),
  evidence: z.array(EvidenceItemSchema),
});

// ===== Case Generation =====
export const ScenarioProfileSchema = z.object({
  id: z.string(),
  label: z.string(),
  demography: z.object({
    ageRange: z.object({ min: z.number(), max: z.number() }),
    gender: z.enum(['male', 'female', 'any']),
  }),
  comorbidities: z.array(z.string()),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
  typicality: z.enum(['typical', 'atypical', 'masking']),
  stage: z.enum(['early', 'acute', 'subacute']),
  complications: z.array(z.string()),
});

export const GeneratedPatientSchema = z.object({
  age: z.number().int(),
  gender: z.enum(['male', 'female']),
  occupation: z.string(),
  riskFactors: z.array(z.string()),
  comorbidities: z.array(z.string()),
});

export const GeneratedCaseSchema = z.object({
  id: z.string(),
  sourceCr: z.string(),
  scenario: ScenarioProfileSchema,
  patient: GeneratedPatientSchema,
  clues: z.array(z.string()),
  diagnosis: z.array(z.string()),
  explanation: z.string(),
  metaRef: z.object({
    nosoId: z.string(),
    hypothesisId: z.string(),
    layer1Ids: z.array(z.string()).optional(),
    layer2Ids: z.array(z.string()).optional(),
    diffId: z.string().optional(),
    evidenceIds: z.array(z.string()).optional(),
  }),
  differentialHints: z.array(z.string()),
});

export const CaseGenerationParamsSchema = z.object({
  crId: z.string(),
  scenarioProfile: ScenarioProfileSchema.optional(),
  seed: z.string().optional(),
  difficulty: DifficultySchema.optional(),
});

// ===== Registry =====
export const CrRegistryItemSchema = z.object({
  id: z.string(),
  number: z.number().int(),
  version: z.number().int(),
  title: z.string(),
  specialty: z.string(),
  status: CrStatusSchema,
  filePath: z.string(),
  updatedAt: z.string().datetime().or(z.string()),
});

export const CrRegistrySchema = z.object({
  version: z.string(),
  lastUpdated: z.string().datetime().or(z.string()),
  items: z.array(CrRegistryItemSchema),
});

// ===== Re-export inferred types =====
export type ClinicalRecommendationValidated = z.infer<typeof ClinicalRecommendationSchema>;
export type GeneratedCaseValidated = z.infer<typeof GeneratedCaseSchema>;
export type CrRegistryValidated = z.infer<typeof CrRegistrySchema>;
