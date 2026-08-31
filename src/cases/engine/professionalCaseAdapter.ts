import type { ProfessionalCase, CaseGenerationConfig, GeneratedCaseSet } from '../types';
import type { ClinicalRecommendation, GeneratedCase, CaseGenerationParams } from '../../features/cr-extractor/types/crSchema';
import { CaseGenerator } from '../../features/cr-extractor/engine/CaseGenerator';
import { loadCrRegistry, loadClinicalRecommendation } from '../../features/cr-extractor/engine/registryLoader';
import type { Profession } from '../../types';

const SPECIALTY_NAMES: Record<string, string> = {
  cardiology: 'Кардиология',
  pulmonology: 'Пульмонология',
  gastroenterology: 'Гастроэнтерология',
  neurology: 'Неврология',
  endocrinology: 'Эндокринология',
  nephrology: 'Нефрология',
  dermatology: 'Дерматология',
  rheumatology: 'Ревматология',
  infections: 'Инфекционные болезни',
  pediatrics: 'Педиатрия',
  oncology: 'Онкология',
  emergency: 'Неотложная помощь',
  obstetrics: 'Акушерство',
  ophthalmology: 'Офтальмология',
  ent: 'ЛОР',
  hematology: 'Гематология',
};

function hashId(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return 'cr-' + (10000 + (Math.abs(h) % 90000));
}

function getTaskType(profession: Profession): 'recognize' | 'diagnose' | 'full-cycle' {
  if (profession === 'nurse') return 'recognize';
  if (profession === 'paramedic') return 'diagnose';
  return 'full-cycle';
}

export function adaptGeneratedCase(
  generated: GeneratedCase,
  cr: ClinicalRecommendation,
  profession: Profession
): ProfessionalCase {
  const specialty = cr.specialty as ProfessionalCase['specialty'];
  const specialtyName = SPECIALTY_NAMES[cr.specialty] || cr.specialty;

  return {
    id: hashId(generated.id),
    profession,
    specialty,
    specialtyName,
    difficulty: (generated.scenario?.severity === 'severe' ? 3 : generated.scenario?.severity === 'moderate' ? 2 : 1) as 1 | 2 | 3,
    title: generated.scenario?.label || generated.diagnosis[0] || 'Клинический кейс',
    diagnosis: generated.diagnosis,
    clues: generated.clues,
    explanation: generated.explanation,
    source: 'cr',
    crRef: {
      number: cr.number,
      version: cr.version,
      url: cr.sourceUrl,
      section: 'clinical_picture',
    },
    metaRef: generated.metaRef,
    patient: generated.patient ? {
      age: generated.patient.age,
      gender: generated.patient.gender,
      occupation: generated.patient.occupation,
    } : undefined,
    taskType: getTaskType(profession),
    answerType: 'single',
    hints: generated.differentialHints,
    skills: [cr.specialty],
    evidence: {
      udd: cr.evidence?.find((e) => e.grade === 'A')?.recommendation,
      uur: cr.evidence?.find((e) => e.grade === 'B')?.recommendation,
      crSection: `КР №${cr.number} v${cr.version}`,
    },
  };
}

export async function generateCasesForProfession(
  profession: Profession,
  config: CaseGenerationConfig
): Promise<ProfessionalCase[]> {
  const registry = await loadCrRegistry();
  const cases: ProfessionalCase[] = [];
  const crs = registry.items.filter((item) => item.status === 'active');

  if (crs.length === 0) return cases;

  const count = config.count || 10;
  const perCr = Math.max(1, Math.ceil(count / crs.length));

  for (const item of crs) {
    try {
      const cr = await loadClinicalRecommendation(item.filePath);
      const generator = new CaseGenerator(cr);

      for (let i = 0; i < perCr && cases.length < count; i++) {
        const params: CaseGenerationParams = {
          crId: cr.id,
          seed: `${profession}-${config.seed || 'default'}-${i}`,
          difficulty: config.difficulty || 2,
        };
        const generated = generator.generate(params);
        cases.push(adaptGeneratedCase(generated, cr, profession));
      }
    } catch (err) {
      console.warn(`[professionalCaseAdapter] Failed to generate cases for CR ${item.id}:`, err);
    }
  }

  return cases.slice(0, count);
}

export async function generateAllCases(config: CaseGenerationConfig): Promise<GeneratedCaseSet> {
  const professions: Profession[] = ['nurse', 'paramedic', 'doctor'];
  const result: GeneratedCaseSet = { nurse: [], paramedic: [], doctor: [] };

  for (const profession of professions) {
    if (!config.professions || config.professions.includes(profession)) {
      result[profession] = await generateCasesForProfession(profession, config);
    }
  }

  return result;
}
