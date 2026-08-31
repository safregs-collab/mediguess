import type { ParsedCr } from './nlpParser';
import type { ClinicalRecommendation, CrStatus } from '../../src/features/cr-extractor/types/crSchema';

export function buildCrJson(
  number: number,
  version: number,
  title: string,
  mkb10: string[],
  specialty: string,
  parsed: ParsedCr,
  sourceUrl: string
): ClinicalRecommendation {
  const id = `cr-${number}-v${version}`;

  return {
    id,
    number,
    version,
    title,
    mkb10,
    specialty,
    status: 'active' as CrStatus,
    updatedAt: new Date().toISOString(),
    sourceUrl,
    clinicalPicture: {
      complaints: parsed.clinicalPicture.complaints.map((c, i) => ({
        id: `comp-${i}`,
        text: c.text,
        severity: c.severity,
        frequency: c.frequency,
        variants: [c.text],
        location: [],
        irradiation: [],
        duration: { min: 1, max: 24, unit: 'hour' },
        triggers: [],
        relievingFactors: [],
        typical: c.typical,
      })),
      anamnesis: parsed.clinicalPicture.anamnesis.map((a, i) => ({
        id: `anam-${i}`,
        category: a.category,
        label: a.label,
        weight: a.weight,
        correlatesWith: [],
      })),
      physicalExam: parsed.clinicalPicture.physicalExam.map((p, i) => ({
        id: `exam-${i}`,
        label: p.label,
        typical: p.typical,
        severity: p.severity,
      })),
    },
    diagnostics: {
      lab: parsed.diagnostics.lab.map((l, i) => ({
        id: `lab-${i}`,
        name: l.name,
        unit: l.unit,
        normalRange: l.normalRange,
        valueScenarios: [],
      })),
      instrumental: parsed.diagnostics.instrumental.map((inst, i) => ({
        id: `inst-${i}`,
        name: inst.name,
        modality: inst.modality,
        patterns: [],
      })),
      criteria: parsed.diagnostics.criteria.map((c, i) => ({
        id: `crit-${i}`,
        label: c.label,
        required: c.required,
        weight: c.weight,
      })),
    },
    differential: parsed.differential.map((d, i) => ({
      id: `diff-${i}`,
      label: d.label || `Дифференциал ${i + 1}`,
      mkb10: d.mkb10,
      keyDifferences: d.keyDifferences,
      discriminatingFindings: [],
    })),
    treatment: {
      emergency: parsed.treatment.emergency.map((t, i) => ({
        id: `em-${i}`,
        stage: 'emergency',
        label: t.label,
        description: t.description,
        priority: t.priority,
      })),
      therapy: parsed.treatment.therapy.map((t, i) => ({
        id: `th-${i}`,
        stage: 'therapy',
        label: t.label,
        description: t.description,
        priority: t.priority,
      })),
      surgery: parsed.treatment.surgery.map((t, i) => ({
        id: `sur-${i}`,
        stage: 'surgery',
        label: t.label,
        description: t.description,
        priority: t.priority,
      })),
    },
    algorithms: [],
    evidence: [],
  };
}
