import type {
  ClinicalRecommendation,
  CaseGenerationParams,
  GeneratedCase,
  GeneratedPatient,
  ScenarioProfile,
  ComplaintTemplate,
} from '../types/crSchema';
import { SeededRng } from './seededRng';

// Occupation pool for patient generation
const OCCUPATIONS = [
  'водитель', 'менеджер', 'учитель', 'строитель', 'бухгалтер',
  'врач', 'инженер', 'продавец', 'пенсионер', 'военнослужащий',
  'студент', 'домохозяйка', 'электрик', 'офисный работник', 'фермер',
];

// Default scenario profiles per specialty (used when no explicit scenario is provided)
const DEFAULT_SCENARIOS_BY_SPECIALTY: Record<string, ScenarioProfile[]> = {
  cardiology: [
    { id: 'classic_stemi', label: 'Классический STEMI', demography: { ageRange: { min: 55, max: 75 }, gender: 'male' }, comorbidities: ['smoking', 'hypertension', 'hyperlipidemia'], severity: 'severe', typicality: 'typical', stage: 'acute', complications: [] },
    { id: 'atypical_nstemi', label: 'Атипичный NSTEMI (диабетическая маска)', demography: { ageRange: { min: 60, max: 80 }, gender: 'any' }, comorbidities: ['diabetes', 'hypertension', 'obesity'], severity: 'moderate', typicality: 'atypical', stage: 'acute', complications: [] },
    { id: 'young_smoker', label: 'ОКС у молодого курильщика', demography: { ageRange: { min: 35, max: 50 }, gender: 'male' }, comorbidities: ['smoking', 'sedentary'], severity: 'severe', typicality: 'typical', stage: 'early', complications: [] },
    { id: 'gerd_mask', label: 'Маскировка под ГЭРБ', demography: { ageRange: { min: 45, max: 65 }, gender: 'any' }, comorbidities: ['obesity', 'sedentary'], severity: 'moderate', typicality: 'masking', stage: 'early', complications: [] },
    { id: 'elderly_weakness', label: 'ОКС у пожилого с преобладанием слабости', demography: { ageRange: { min: 75, max: 90 }, gender: 'female' }, comorbidities: ['hypertension', 'diabetes', 'family_history'], severity: 'severe', typicality: 'atypical', stage: 'acute', complications: ['ef_reduced'] },
  ],
  pulmonology: [
    { id: 'classic_pneumonia', label: 'Классическая пневмония', demography: { ageRange: { min: 45, max: 70 }, gender: 'male' }, comorbidities: ['smoking_pulm', 'recent_uri'], severity: 'severe', typicality: 'typical', stage: 'acute', complications: [] },
    { id: 'aspiration_pneumonia', label: 'Аспирационная пневмония', demography: { ageRange: { min: 60, max: 85 }, gender: 'any' }, comorbidities: ['aspiration', 'alcohol', 'immunosuppression'], severity: 'severe', typicality: 'typical', stage: 'acute', complications: [] },
    { id: 'immunocompromised', label: 'Пневмония при иммуносупрессии', demography: { ageRange: { min: 40, max: 70 }, gender: 'any' }, comorbidities: ['immunosuppression', 'diabetes_pulm'], severity: 'moderate', typicality: 'atypical', stage: 'acute', complications: [] },
    { id: 'copd_exacerbation', label: 'Пневмония на фоне ХОБЛ', demography: { ageRange: { min: 55, max: 80 }, gender: 'male' }, comorbidities: ['copd', 'smoking_pulm'], severity: 'moderate', typicality: 'typical', stage: 'acute', complications: [] },
    { id: 'viral_pneumonia', label: 'Вирусная пневмония', demography: { ageRange: { min: 20, max: 60 }, gender: 'any' }, comorbidities: ['recent_uri'], severity: 'mild', typicality: 'typical', stage: 'early', complications: [] },
  ],
  gastroenterology: [
    { id: 'classic_ulcer', label: 'Классическая язвенная болезнь', demography: { ageRange: { min: 35, max: 60 }, gender: 'male' }, comorbidities: ['hpylori', 'nsaid_use', 'smoking_gastro'], severity: 'moderate', typicality: 'typical', stage: 'acute', complications: [] },
    { id: 'nsaid_ulcer', label: 'НПВС-язва', demography: { ageRange: { min: 50, max: 80 }, gender: 'female' }, comorbidities: ['nsaid_use', 'previous_ulcer'], severity: 'severe', typicality: 'typical', stage: 'acute', complications: [] },
    { id: 'bleeding_ulcer', label: 'Кровоточащая язва', demography: { ageRange: { min: 45, max: 75 }, gender: 'male' }, comorbidities: ['nsaid_use', 'anticoagulants', 'alcohol_gastro'], severity: 'severe', typicality: 'atypical', stage: 'acute', complications: [] },
    { id: 'stress_ulcer_scenario', label: 'Стрессовая язва', demography: { ageRange: { min: 30, max: 55 }, gender: 'any' }, comorbidities: ['stress_ulcer', 'nsaid_use'], severity: 'moderate', typicality: 'masking', stage: 'early', complications: [] },
    { id: 'gerd_like', label: 'Язва с преобладанием изжоги', demography: { ageRange: { min: 40, max: 65 }, gender: 'any' }, comorbidities: ['gerd_history', 'obesity'], severity: 'mild', typicality: 'masking', stage: 'early', complications: [] },
  ],
  default: [
    { id: 'typical', label: 'Типичное течение', demography: { ageRange: { min: 40, max: 70 }, gender: 'any' }, comorbidities: [], severity: 'moderate', typicality: 'typical', stage: 'acute', complications: [] },
    { id: 'atypical', label: 'Атипичное течение', demography: { ageRange: { min: 50, max: 80 }, gender: 'any' }, comorbidities: [], severity: 'moderate', typicality: 'atypical', stage: 'acute', complications: [] },
  ],
};

/**
 * Generates clinical cases from a ClinicalRecommendation (КР).
 * Uses a seeded RNG so the same (crId + seed + scenario) always yields
 * the identical case — deterministic and reproducible.
 */
export class CaseGenerator {
  private cr: ClinicalRecommendation;

  constructor(cr: ClinicalRecommendation) {
    this.cr = cr;
  }

  /**
   * Main entry point. Builds a complete GeneratedCase.
   */
  generate(params: CaseGenerationParams): GeneratedCase {
    const rng = new SeededRng(this.buildSeed(params));
    const scenario = params.scenarioProfile ?? this.pickRandomScenario(rng);
    const patient = this.generatePatient(scenario, rng);
    const clues = this.generateClues(scenario, rng, params.difficulty ?? 2);
    const diagnosis = this.generateDiagnosis();
    const differentialHints = this.generateDifferentialHints(scenario, rng);
    const metaRef = this.buildMetaRef(scenario);

    return {
      id: this.buildCaseId(params, scenario, rng),
      sourceCr: this.cr.id,
      scenario,
      patient,
      clues,
      diagnosis,
      explanation: this.buildExplanation(scenario),
      metaRef,
      differentialHints,
    };
  }

  // ── Seed & ID ──

  private buildSeed(params: CaseGenerationParams): string {
    const parts = [params.crId, params.seed ?? 'default'];
    if (params.scenarioProfile) {
      parts.push(params.scenarioProfile.id);
    }
    if (params.difficulty) {
      parts.push(String(params.difficulty));
    }
    return parts.join('|');
  }

  private buildCaseId(params: CaseGenerationParams, scenario: ScenarioProfile, rng: SeededRng): string {
    const suffix = String(rng.nextInt(1, 999)).padStart(3, '0');
    return `${params.crId}-${scenario.id}-${suffix}`;
  }

  // ── Scenario selection ──

  private pickRandomScenario(rng: SeededRng): ScenarioProfile {
    const scenarios = DEFAULT_SCENARIOS_BY_SPECIALTY[this.cr.specialty] ?? DEFAULT_SCENARIOS_BY_SPECIALTY['default'];
    return rng.pick(scenarios);
  }

  // ── Patient generation ──

  private generatePatient(scenario: ScenarioProfile, rng: SeededRng): GeneratedPatient {
    const gender =
      scenario.demography.gender === 'any'
        ? rng.chance(0.5) ? 'male' : 'female'
        : scenario.demography.gender;

    const age = rng.nextInt(scenario.demography.ageRange.min, scenario.demography.ageRange.max + 1);
    const occupation = rng.pick(OCCUPATIONS);

    // Risk factors from anamnesis
    const allAnamnesis = this.cr.clinicalPicture.anamnesis;
    const riskFactors: string[] = [];
    const comorbidities: string[] = [];

    for (const item of allAnamnesis) {
      const isSelected = scenario.comorbidities.includes(item.id);
      if (isSelected) {
        if (item.category === 'risk_factor' || item.category === 'lifestyle' || item.category === 'family') {
          riskFactors.push(item.label);
        } else {
          comorbidities.push(item.label);
        }
      } else if (rng.chance(item.weight * 0.3)) {
        // Small chance to include non-scenario items
        if (item.category === 'risk_factor' || item.category === 'lifestyle' || item.category === 'family') {
          riskFactors.push(item.label);
        } else {
          comorbidities.push(item.label);
        }
      }
    }

    return { age, gender, occupation, riskFactors, comorbidities };
  }

  // ── Clue generation (general → specific) ──

  private generateClues(scenario: ScenarioProfile, rng: SeededRng, difficulty: number): string[] {
    const clues: string[] = [];
    const anamnesis = this.cr.clinicalPicture.anamnesis;
    const physical = this.cr.clinicalPicture.physicalExam;

    // 1. Demography + chief complaint (always)
    const chiefComplaint = this.pickChiefComplaint(scenario, rng);
    clues.push(
      `${this.cr.title}. Пациент ${rng.pick(['обратился', 'поступил', 'прибыл'])} с жалобами на ${chiefComplaint.text.toLowerCase()}.`
    );

    // 2. Anamnesis / risk factors
    const selectedAnamnesis = anamnesis.filter((a) => scenario.comorbidities.includes(a.id));
    if (selectedAnamnesis.length > 0) {
      const items = rng.pickN(selectedAnamnesis, Math.min(3, selectedAnamnesis.length));
      clues.push(`Из анамнеза: ${items.map((i) => i.label.toLowerCase()).join(', ')}.`);
    }

    // 3. Physical exam (typical findings)
    const typicalFindings = physical.filter((p) => p.typical);
    if (typicalFindings.length > 0) {
      const findings = rng.pickN(typicalFindings, Math.min(2, typicalFindings.length));
      clues.push(`При осмотре: ${findings.map((f) => f.label.toLowerCase()).join(', ')}.`);
    }

    // 4. Lab (if difficulty >= 2)
    if (difficulty >= 2) {
      const labClue = this.generateLabClue(scenario, rng);
      if (labClue) clues.push(labClue);
    }

    // 5. Instrumental (if difficulty >= 2)
    if (difficulty >= 2) {
      const instClue = this.generateInstrumentalClue(scenario, rng);
      if (instClue) clues.push(instClue);
    }

    // 6. Differential hint (if difficulty === 3)
    if (difficulty === 3) {
      const diff = rng.pick(this.cr.differential);
      clues.push(`Дифференциальный диагноз: рассматривалось ${diff.label.toLowerCase()}.`);
    }

    return clues;
  }

  private pickChiefComplaint(scenario: ScenarioProfile, rng: SeededRng): ComplaintTemplate {
    const pool = this.cr.clinicalPicture.complaints;
    if (scenario.typicality === 'typical') {
      const typical = pool.filter((c) => c.typical);
      return rng.pick(typical.length > 0 ? typical : pool);
    }
    if (scenario.typicality === 'atypical') {
      const atypical = pool.filter((c) => !c.typical);
      return rng.pick(atypical.length > 0 ? atypical : pool);
    }
    return rng.pick(pool);
  }

  private generateLabClue(scenario: ScenarioProfile, rng: SeededRng): string | null {
    const labs = this.cr.diagnostics.lab;
    if (labs.length === 0) return null;
    const lab = rng.pick(labs);
    const scenarioId = this.mapSeverityToScenario(scenario.severity, scenario.stage);
    const valueScenario = lab.valueScenarios.find((vs) => vs.scenarioId === scenarioId) ?? rng.pick(lab.valueScenarios);
    if (!valueScenario) return null;

    let value: number;
    switch (valueScenario.valueDistribution.type) {
      case 'normal':
        value = rng.gaussian(valueScenario.valueDistribution.mean, valueScenario.valueDistribution.stdDev);
        break;
      case 'lognormal':
        value = rng.lognormal(valueScenario.valueDistribution.mean, valueScenario.valueDistribution.stdDev);
        break;
      case 'uniform':
      default:
        value = rng.uniform(valueScenario.valueDistribution.min, valueScenario.valueDistribution.max);
    }
    value = Math.max(valueScenario.valueDistribution.min, Math.min(valueScenario.valueDistribution.max, value));
    const rounded = Number(value.toFixed(2));

    const normalText = lab.normalRange.text ?? `${lab.normalRange.min}-${lab.normalRange.max}`;
    return `Лаборатория: ${lab.name} — ${rounded} ${lab.unit} (норма: ${normalText}).`;
  }

  private generateInstrumentalClue(_scenario: ScenarioProfile, rng: SeededRng): string | null {
    const insts = this.cr.diagnostics.instrumental;
    if (insts.length === 0) return null;
    const inst = rng.pick(insts);
    const pattern = rng.pick(inst.patterns);
    return `${inst.name}: ${pattern.label} — ${pattern.description}.`;
  }

  private mapSeverityToScenario(severity: string, stage: string): string {
    if (severity === 'severe') return 'peak';
    if (severity === 'mild') return 'mild';
    if (stage === 'early') return 'early';
    return 'peak';
  }

  // ── Diagnosis ──

  private generateDiagnosis(): string[] {
    const result = [this.cr.title];
    result.push(...this.cr.mkb10);
    // Add common abbreviations / synonyms by title keyword
    const title = this.cr.title.toLowerCase();
    const extra: string[] = [];
    if (title.includes('коронарный')) {
      extra.push('ОКС', 'острый инфаркт миокарда', 'ОИМ', 'инфаркт');
    }
    if (title.includes('пневмония')) {
      extra.push('пневмония', 'воспаление лёгких', 'внебольничная пневмония', 'ВБП');
    }
    if (title.includes('язвенная')) {
      extra.push('язва', 'язвенная болезнь', 'ЯБ', 'язва желудка', 'язва ДПК');
    }
    result.push(...extra);
    return [...new Set(result)];
  }

  // ── Explanation ──

  private buildExplanation(scenario: ScenarioProfile): string {
    const lines = [
      `Клиническая картина соответствует ${this.cr.title} (${this.cr.mkb10.join(', ')}).`,
      `Сценарий: ${scenario.label}.`,
      `Ключевые диагностические критерии:`,
    ];
    const required = this.cr.diagnostics.criteria.filter((c) => c.required);
    const weighted = this.cr.diagnostics.criteria
      .filter((c) => !c.required)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
    [...required, ...weighted].forEach((c) => {
      lines.push(`• ${c.label} — ${c.description}`);
    });
    lines.push(`Первоочередное лечение: ${this.cr.treatment.emergency.slice(0, 2).map((t) => t.label).join(', ')}.`);
    return lines.join('\n');
  }

  // ── Meta reference (links to meta graph) ──

  private buildMetaRef(scenario: ScenarioProfile) {
    // Map to existing meta-graph IDs (hard-coded bridge for КР 208)
    return {
      nosoId: `nosology-${this.cr.specialty}-${this.cr.number}`,
      hypothesisId: `hypo-${this.cr.id}-${scenario.id}`,
      layer1Ids: this.cr.clinicalPicture.complaints.map((c) => `l1-symptom-${c.id}`),
      layer2Ids: this.cr.diagnostics.lab.map((l) => `l2-lab-${l.id}`),
      diffId: this.cr.differential.length > 0 ? `diff-${this.cr.id}` : undefined,
      evidenceIds: this.cr.evidence.map((e) => `ev-${e.id}`),
    };
  }

  // ── Differential hints ──

  private generateDifferentialHints(_scenario: ScenarioProfile, rng: SeededRng): string[] {
    const hints: string[] = [];
    const diffs = this.cr.differential;
    if (diffs.length === 0) return hints;

    // Pick 2-3 most relevant differentials
    const count = rng.nextInt(2, 4);
    const selected = rng.pickN(diffs, Math.min(count, diffs.length));

    for (const diff of selected) {
      const keyDiff = rng.pick(diff.keyDifferences);
      hints.push(`${diff.label}: ${keyDiff}`);
    }
    return hints;
  }
}
