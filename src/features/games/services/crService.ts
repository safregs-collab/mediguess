import type { EvidenceLevel, RecommendationLevel } from '../../../types/simulation';

export interface CRRecommendation {
  id: string;
  text: string;
  udd: EvidenceLevel;
  uur: RecommendationLevel;
  source?: string;
}

export interface CRTable {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
}

export interface CRAlgorithm {
  id: string;
  title: string;
  steps: Array<{ id: string; text: string; type: 'start' | 'decision' | 'action' | 'end' }>;
}

export interface CRDocument {
  number: string;
  version: string;
  title: string;
  url: string;
  mkb: string;
  specialty: string;
  sections: Array<{
    id: string;
    title: string;
    content?: string;
    recommendations?: CRRecommendation[];
    tables?: CRTable[];
    algorithms?: CRAlgorithm[];
  }>;
}

export const CR_DATABASE: Record<string, CRDocument> = {
  '62': {
    number: '62',
    version: '3',
    title: 'Артериальная гипертензия у взрослых',
    url: 'https://cr.minzdrav.gov.ru/view-cr/62_3',
    mkb: 'I10-I15',
    specialty: 'Терапия / Кардиология',
    sections: [
      {
        id: 'sec1',
        title: 'I. Общие положения',
        content: 'Клиническая рекомендация разработана для врачей всех специальностей, участвующих в диагностике и лечении артериальной гипертензии.'
      },
      {
        id: 'sec2',
        title: 'II. Классификация АГ',
        tables: [
          {
            id: 'tab1',
            title: 'Классификация АГ по уровню АД',
            headers: ['Категория', 'САД, мм рт.ст.', 'ДАД, мм рт.ст.'],
            rows: [
              ['Оптимальное АД', '<120', '<80'],
              ['Нормальное АД', '120-129', '80-84'],
              ['Высокое нормальное', '130-139', '85-89'],
              ['АГ 1 степени', '140-159', '90-99'],
              ['АГ 2 степени', '160-179', '100-109'],
              ['АГ 3 степени', '≥180', '≥110'],
              ['Изолированная систолическая АГ', '≥140', '<90']
            ]
          },
          {
            id: 'tab2',
            title: 'Классификация по стадиям',
            headers: ['Стадия', 'Характеристика'],
            rows: [
              ['I', 'АГ без факторов риска и поражения органов-мишеней'],
              ['II', 'АГ с 1-2 факторами риска или поражением органов-мишеней'],
              ['III', 'АГ с СС-событиями в анамнезе или ХБП ≥G3']
            ]
          }
        ]
      },
      {
        id: 'sec3',
        title: 'III. Факторы риска СС-событий',
        recommendations: [
          { id: 'r1', text: 'Курение — модифицируемый фактор риска. Рекомендуется отказ от курения всем пациентам с АГ.', udd: 'udd1', uur: 'uurA', source: 'SPRINT, ACCORD' },
          { id: 'r2', text: 'Избыточная масса тела и ожирение — модифицируемые факторы. Целевой ИМТ <25 кг/м², ОТ <94 см (муж), <80 см (жен).', udd: 'udd1', uur: 'uurA', source: 'DASH, PREDIMED' },
          { id: 'r3', text: 'Физическая активность — рекомендуется ≥150 мин умеренной аэробной нагрузки в неделю.', udd: 'udd1', uur: 'uurA', source: 'ESC 2024' },
          { id: 'r4', text: 'Ограничение потребления соли — <5 г/сут (≈2 г натрия).', udd: 'udd1', uur: 'uurA', source: 'DASH-Sodium' },
          { id: 'r5', text: 'Ограничение алкоголя — ≤20 г этанола/сут (муж), ≤10 г (жен).', udd: 'udd2', uur: 'uurB', source: 'Meta-analysis 2018' }
        ]
      },
      {
        id: 'sec4',
        title: 'IV. Диагностика',
        recommendations: [
          { id: 'r6', text: 'ЭКГ (12 отведений) — обязательно всем пациентам с АГ для выявления ЛЖ гипертрофии, ишемии, аритмий.', udd: 'udd1', uur: 'uurA' },
          { id: 'r7', text: 'ЭхоКГ — при подозрении на структурные изменения сердца или для уточнения риска.', udd: 'udd2', uur: 'uurB' },
          { id: 'r8', text: 'Креатинин, СКФ, калий, натрий — обязательно всем пациентам с АГ.', udd: 'udd1', uur: 'uurA' },
          { id: 'r9', text: 'Липидный профиль — обязательно всем пациентам с АГ для оценки СС-риска.', udd: 'udd2', uur: 'uurA' },
          { id: 'r10', text: 'Глюкоза крови, HbA1c — обязательно для исключения СД.', udd: 'udd2', uur: 'uurA' },
          { id: 'r11', text: 'ТТГ — при наличии клинических признаков нарушения функции щитовидной железы.', udd: 'udd3', uur: 'uurB' },
          { id: 'r12', text: 'УЗИ почек — при подозрении на вторичную АГ или ХБП.', udd: 'udd3', uur: 'uurB' },
          { id: 'r13', text: 'МРТ/КТ головного мозга — только при неврологической симптоматике или подозрении на инсульт.', udd: 'udd3', uur: 'uurC' }
        ]
      },
      {
        id: 'sec5',
        title: 'V. Лечение. Выбор терапии',
        recommendations: [
          { id: 'r14', text: 'При АГ 2-3 степени или высоком/очень высоком СС-риске рекомендуется начинать комбинированную терапию с первых дней.', udd: 'udd1', uur: 'uurA', source: 'SPRINT, ACCORD, HOPE-3' },
          { id: 'r15', text: 'ИАПФ или БРА + БКК или тиазидоподобный диуретик — предпочтительные комбинации.', udd: 'udd1', uur: 'uurA', source: 'ACCOMPLISH, SPRINT' },
          { id: 'r16', text: 'β-блокаторы не рекомендуются как препараты первой линии при АГ без сопутствующей ИБС/аритмии.', udd: 'udd2', uur: 'uurB', source: 'LIFE, ASCOT' },
          { id: 'r17', text: 'При резистентной АГ (АД не контролируется на 3 препаратах) рекомендуется добавление спиронолактона.', udd: 'udd1', uur: 'uurA', source: 'PATHWAY-2' },
          { id: 'r18', text: 'Целевое АД для большинства пациентов <140/90 мм рт.ст.', udd: 'udd1', uur: 'uurA', source: 'SPRINT' },
          { id: 'r19', text: 'Целевое АД при СД или ХБП <130/80 мм рт.ст. (если переносится).', udd: 'udd1', uur: 'uurA', source: 'ACCORD-BP, KDIGO' }
        ]
      },
      {
        id: 'sec6',
        title: 'VI. Мониторинг',
        recommendations: [
          { id: 'r20', text: 'Первый контроль АД после начала терапии — через 1 месяц.', udd: 'udd2', uur: 'uurA' },
          { id: 'r21', text: 'При достижении целевого АД — контроль каждые 3-6 месяцев.', udd: 'udd2', uur: 'uurB' },
          { id: 'r22', text: 'Ежегодный мониторинг: ЭКГ, креатинин, СКФ, калий, липидный профиль.', udd: 'udd2', uur: 'uurA' }
        ]
      }
    ]
  },

  '102': {
    number: '102',
    version: '2',
    title: 'Сахарный диабет 2 типа у взрослых',
    url: 'https://cr.minzdrav.gov.ru/view-cr/102_2',
    mkb: 'E11',
    specialty: 'Эндокринология / Терапия',
    sections: [
      {
        id: 'sec1',
        title: 'I. Диагностика СД 2 типа',
        tables: [
          {
            id: 'tab1',
            title: 'Критерии диагноза СД',
            headers: ['Показатель', 'Значение'],
            rows: [
              ['Глюкоза плазмы натощак', '≥7.0 ммоль/л'],
              ['Глюкоза плазмы через 2 ч после НТТГ', '≥11.1 ммоль/л'],
              ['HbA1c', '≥6.5%'],
              ['Глюкоза плазмы в случайный момент', '≥11.1 ммоль/л + симптомы']
            ]
          }
        ],
        recommendations: [
          { id: 'r1', text: 'Диагноз СД 2 типа устанавливается при наличии одного из критериев, подтверждённого повторно.', udd: 'udd1', uur: 'uurA', source: 'ADA 2024' },
          { id: 'r2', text: 'HbA1c — предпочтительный метод диагностики при стабильных условиях.', udd: 'udd1', uur: 'uurA' }
        ]
      },
      {
        id: 'sec2',
        title: 'II. Осложнения. Скрининг',
        recommendations: [
          { id: 'r3', text: 'Офтальмологический осмотр при постановке диагноза и ежегодно.', udd: 'udd1', uur: 'uurA', source: 'DCCT, UKPDS' },
          { id: 'r4', text: 'Оценка функции почек (СКФ, АЛБ/Кр) при постановке диагноза и ежегодно.', udd: 'udd1', uur: 'uurA', source: 'KDIGO 2024' },
          { id: 'r5', text: 'Оценка полинейропатии (монофиламент 10 г) ежегодно.', udd: 'udd2', uur: 'uurA' },
          { id: 'r6', text: 'ЭКГ при постановке диагноза для оценки СС-риска.', udd: 'udd2', uur: 'uurA' }
        ]
      },
      {
        id: 'sec3',
        title: 'III. Лечение. Алгоритм назначения',
        recommendations: [
          { id: 'r7', text: 'Метформин — препарат первой линии для всех пациентов с СД 2 типа при отсутствии противопоказаний.', udd: 'udd1', uur: 'uurA', source: 'UKPDS, Cochrane 2020' },
          { id: 'r8', text: 'При HbA1c ≥7.5% на фоне метформина — добавление второго препарата.', udd: 'udd1', uur: 'uurA', source: 'ADA/EASD 2024' },
          { id: 'r9', text: 'При наличии АСКЗ или высоком СС-риске — приоритет ИППГЛТ2 или ГПП-1 агонистов.', udd: 'udd1', uur: 'uurA', source: 'CREDENCE, LEADER, SUSTAIN-6' },
          { id: 'r10', text: 'При ожирении (ИМТ ≥27) — предпочтительны ГПП-1 агонисты или ИППГЛТ2.', udd: 'udd1', uur: 'uurA', source: 'STEP, SURPASS' },
          { id: 'r11', text: 'При ХБП (СКФ <60) — предпочтительны ИППГЛТ2 или ГПП-1 агонисты.', udd: 'udd1', uur: 'uurA', source: 'DAPA-CKD, EMPA-KIDNEY' },
          { id: 'r12', text: 'Инсулинотерапия показана при HbA1c >10% или декомпенсации (кетоацидоз, гиперосмолярный синдром).', udd: 'udd1', uur: 'uurA', source: 'ADA 2024' }
        ]
      },
      {
        id: 'sec4',
        title: 'IV. Целевые показатели',
        tables: [
          {
            id: 'tab2',
            title: 'Целевые показатели гликемии',
            headers: ['Показатель', 'Цель'],
            rows: [
              ['HbA1c', '<7.0% (индивидуализируется)'],
              ['Глюкоза натощак', '4.4-7.0 ммоль/л'],
              ['Глюкоза после еды', '<10.0 ммоль/л']
            ]
          }
        ],
        recommendations: [
          { id: 'r13', text: 'Целевой HbA1c <7.0% для большинства пациентов.', udd: 'udd1', uur: 'uurA', source: 'DCCT, UKPDS' },
          { id: 'r14', text: 'Менее строгие цели (HbA1c <8.0%) — при тяжёлых коморбидностях, ограниченной продолжительности жизни.', udd: 'udd2', uur: 'uurB', source: 'ADA 2024' }
        ]
      }
    ]
  }
};

export function getCRByNumber(number: string): CRDocument | undefined {
  return CR_DATABASE[number];
}

export function getCRRecommendation(crNumber: string, recId: string): CRRecommendation | undefined {
  const cr = CR_DATABASE[crNumber];
  if (!cr) return undefined;
  for (const section of cr.sections) {
    const rec = section.recommendations?.find(r => r.id === recId);
    if (rec) return rec;
  }
  return undefined;
}

export function getCRSection(crNumber: string, sectionId: string) {
  const cr = CR_DATABASE[crNumber];
  return cr?.sections.find(s => s.id === sectionId);
}

export function getAllCRNumbers(): string[] {
  return Object.keys(CR_DATABASE);
}
