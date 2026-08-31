import type { ClinicalRecommendation, GeneratedCase } from '../types/crSchema';
import { CaseGenerator } from './CaseGenerator';
import type {
  SimulationCase,
  SimulationCasePatient,
  SimulationCaseStage,
  SimulationCaseOption,
  SimulationCaseResults,
} from '../../../types/simulation';

function buildPatient(generated: GeneratedCase): SimulationCasePatient {
  const p = generated.patient;
  return {
    name: `${p.gender === 'male' ? 'Пациент' : 'Пациентка'} ${p.age} лет`,
    age: p.age,
    gender: p.gender,
    occupation: p.occupation,
    complaints: generated.clues.slice(0, 2),
    history: {
      life: p.riskFactors.join(', ') || 'Нет значимых факторов риска',
      disease: p.comorbidities.join(', ') || 'Нет сопутствующих заболеваний',
      allergy: 'Не указано',
      heredity: 'Не указано',
    },
    vitals: {
      ad: { value: '120/80', unit: 'мм рт.ст.', alert: false },
      hr: { value: '80', unit: 'уд/мин', alert: false },
      rr: { value: '16', unit: 'вд/мин', alert: false },
      temp: { value: '36.6', unit: '°C', alert: false },
    },
  };
}

function buildDiagnosisStage(cr: ClinicalRecommendation, generated: GeneratedCase): SimulationCaseStage {
  const options: SimulationCaseOption[] = cr.differential.map((d) => ({
    id: d.id,
    text: d.label,
    correct: false,
    explanation: `Ключевые отличия: ${d.keyDifferences.join('; ')}`,
  }));

  options.unshift({
    id: 'correct',
    text: cr.title,
    correct: true,
    explanation: generated.explanation.split('\n').slice(0, 2).join('. '),
  });

  return {
    id: 'diagnosis',
    title: 'Диагноз',
    description: 'На основании представленных данных поставьте диагноз.',
    type: 'single',
    options,
    evidence: { cr: `КР №${cr.number} v.${cr.version}`, crUrl: cr.sourceUrl },
  };
}

function buildExaminationStage(cr: ClinicalRecommendation): SimulationCaseStage {
  const options: SimulationCaseOption[] = [
    ...cr.diagnostics.lab.map((l) => ({
      id: `lab-${l.id}`,
      text: `${l.name} (норма: ${l.normalRange.text || `${l.normalRange.min}-${l.normalRange.max}`})`,
      correct: true,
      required: true,
      evidence: { cr: `КР №${cr.number} v.${cr.version}` },
    })),
    ...cr.diagnostics.instrumental.map((i) => ({
      id: `inst-${i.id}`,
      text: i.name,
      correct: true,
      required: false,
      evidence: { cr: `КР №${cr.number} v.${cr.version}` },
    })),
  ];

  return {
    id: 'examination',
    title: 'Обследование',
    description: 'Выберите необходимые исследования согласно КР.',
    type: 'multiselect',
    options,
    evidence: { cr: `КР №${cr.number} v.${cr.version}, раздел «Диагностика»` },
  };
}

function buildTherapyStage(cr: ClinicalRecommendation): SimulationCaseStage {
  const options: SimulationCaseOption[] = [
    ...cr.treatment.emergency.slice(0, 2).map((t) => ({
      id: `em-${t.id}`,
      text: t.label,
      correct: true,
      explanation: t.description,
      evidence: { cr: `КР №${cr.number} v.${cr.version}` },
    })),
    ...cr.treatment.therapy.slice(0, 2).map((t) => ({
      id: `th-${t.id}`,
      text: t.label,
      correct: true,
      explanation: t.description,
      evidence: { cr: `КР №${cr.number} v.${cr.version}` },
    })),
  ];

  return {
    id: 'therapy',
    title: 'Терапия',
    description: 'Выберите первоочередное лечение.',
    type: 'multiselect',
    options,
    evidence: { cr: `КР №${cr.number} v.${cr.version}, раздел «Лечение»` },
  };
}

function buildResults(): SimulationCaseResults {
  return {
    excellent: { minScore: 90, title: 'Отлично!', text: 'Вы продемонстрировали высокий уровень клинического мышления.' },
    good: { minScore: 70, title: 'Хорошо', text: 'Есть небольшие пробелы. Рекомендуем повторить КР.' },
    needsWork: { minScore: 0, title: 'Требуется доработка', text: 'Рекомендуем изучить соответствующую КР Минздрава РФ.' },
  };
}

export function adaptCrToSimulationCase(
  cr: ClinicalRecommendation,
  generated?: GeneratedCase
): SimulationCase {
  const gen = generated || new CaseGenerator(cr).generate({ crId: cr.id, difficulty: 2 });

  return {
    id: `cr-sim-${cr.id}`,
    title: cr.title,
    mkb: cr.mkb10.join(', '),
    crNumber: String(cr.number),
    crVersion: String(cr.version),
    crUrl: cr.sourceUrl,
    difficulty: 'medium',
    specialty: cr.specialty,
    patient: buildPatient(gen),
    stages: [
      buildDiagnosisStage(cr, gen),
      buildExaminationStage(cr),
      buildTherapyStage(cr),
    ],
    results: buildResults(),
    correctDiagnosis: [cr.title, ...cr.mkb10],
  };
}
