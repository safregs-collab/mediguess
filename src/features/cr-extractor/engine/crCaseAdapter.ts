import type { UnifiedCase as Case, Specialty } from '../../../types';
import type { GeneratedCase, ClinicalRecommendation } from '../types/crSchema';

// Specialty → display name mapping
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

/**
 * Convert a string id to a numeric hash that is deterministic and
 * unlikely to collide with existing static cases (ids 1–1000).
 * We offset by 10000 to keep CR-generated cases in a separate band.
 */
function hashId(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return 10000 + (Math.abs(h) % 90000);
}

/**
 * Adapts a GeneratedCase (from cr-extractor engine) to the canonical
 * Case shape used by the game store and UI.
 */
export function adaptGeneratedCase(
  generated: GeneratedCase,
  cr: ClinicalRecommendation,
  profession: Case['profession'] = 'doctor'
): Case {
  const specialty = cr.specialty as Specialty;
  const specialtyName = SPECIALTY_NAMES[cr.specialty] || cr.specialty;

  return {
    id: String(hashId(generated.id)),
    profession,
    specialty,
    specialtyName,
    difficulty: (generated.scenario?.severity === 'severe' ? 3 : generated.scenario?.severity === 'moderate' ? 2 : 1) as 1 | 2 | 3,
    diagnosis: generated.diagnosis,
    clues: generated.clues,
    explanation: generated.explanation,
    source: 'cr',
    metaRef: generated.metaRef,
  };
}

/**
 * Batch adapter: converts an array of GeneratedCases + their source CR
 * into an array of game-ready Case objects.
 */
export function adaptGeneratedCases(
  generatedCases: GeneratedCase[],
  cr: ClinicalRecommendation
): Case[] {
  return generatedCases.map((g) => adaptGeneratedCase(g, cr));
}
