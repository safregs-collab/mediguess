// ═══════════════════════════════════════════════════════════════
// cr-extractor — Clinical Recommendation → Case Generator
// ═══════════════════════════════════════════════════════════════

// Types (pure TypeScript, no runtime deps)
export type {
  ClinicalRecommendation,
  GeneratedCase,
  GeneratedPatient,
  ScenarioProfile,
  CaseGenerationParams,
  CrRegistry,
  CrRegistryItem,
  ComplaintTemplate,
  AnamnesisTemplate,
  PhysicalExamTemplate,
  LabTestTemplate,
  InstrumentalTemplate,
  DifferentialItem,
  TreatmentStep,
  ClinicalAlgorithm,
  EvidenceItem,
  Difficulty,
  CrStatus,
  Severity,
  Frequency,
  TimeUnit,
  DistributionType,
} from './types/crSchema';

// Zod schemas (runtime validation)
export {
  ClinicalRecommendationSchema,
  GeneratedCaseSchema,
  CrRegistrySchema,
  CaseGenerationParamsSchema,
  ScenarioProfileSchema,
} from './schemas/crZodSchema';

// Engine
export { SeededRng } from './engine/seededRng';
export { CaseGenerator } from './engine/CaseGenerator';

// Registry loader helper
export { loadCrRegistry, loadClinicalRecommendation, loadCrById } from './engine/registryLoader';

// Case adapter (GeneratedCase → canonical Case)
export { adaptGeneratedCase, adaptGeneratedCases } from './engine/crCaseAdapter';

// Simulation adapter (CR → SimulationCase)
export { adaptCrToSimulationCase } from './engine/crSimulationAdapter';
