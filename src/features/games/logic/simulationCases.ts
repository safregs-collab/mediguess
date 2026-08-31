import type { SimulationCase, ClinicalAlgorithm } from '../../../types/simulation';
import { normalize } from './gameLogic';

export const SIMULATION_CASES: SimulationCase[] = [
  {
    id: 'hypertension',
    title: 'Артериальная гипертензия',
    mkb: 'I10-I15',
    crNumber: '62',
    crVersion: '3',
    crUrl: 'https://cr.minzdrav.gov.ru/view-cr/62_3',
    difficulty: 'medium',
    specialty: 'Терапия / Кардиология',
    patient: {
      name: 'Козлов Петр Иванович',
      age: 54,
      gender: 'male',
      occupation: 'Менеджер (сидячая работа)',
      complaints: [
        'Головная боль в затылочной области (3 мес)',
        'Шум в ушах',
        'Сверления в грудине при физической нагрузке'
      ],
      history: {
        life: 'Курит 20 лет (1 пачка/день). Отец — ИБС, мать — АГ.',
        disease: 'Обращался к терапевту 2 года назад, АД 150/90 — рекомендовано снизить вес, отказался от терапии.',
        allergy: 'Нет',
        heredity: 'ИБС (отец), АГ (мать)'
      },
      vitals: {
        ad: { value: '168/104', unit: 'мм рт.ст.', alert: true },
        hr: { value: '88', unit: 'уд/мин', alert: false },
        rr: { value: '16', unit: 'вд/мин', alert: false },
        temp: { value: '36.6', unit: '°C', alert: false },
        height: { value: '178', unit: 'см', alert: false },
        weight: { value: '84', unit: 'кг', alert: false },
        bmi: { value: '26.5', unit: 'кг/м²', alert: true },
        waist: { value: '102', unit: 'см', alert: true }
      },
      physicalExam: {
        general: 'Состояние удовлетворительное. Кожные покровы бледные. Отеков нет.',
        heart: 'Тоны сердца приглушены, акцент II тона над аортой. Шумов нет. ЧСС 88 уд/мин, ритмичный.',
        lungs: 'Дыхание везикулярное, хрипов нет.',
        abdomen: 'Мягкий, безболезненный. Печень по краю реберной дуги.',
        kidneys: 'Поколачивание по поясничной области безболезненно с обеих сторон.',
        vessels: 'Пульсация на периферических артериях симметричная. АД на обеих руках одинаковое.'
      }
    },
    stages: [
      {
        id: 'anamnesis',
        title: 'Анамнез',
        description: 'Соберите полный анамнез. Отметьте все значимые факторы риска.',
        type: 'multiselect',
        options: [
          { id: 'smoking', text: 'Курение (20 лет, 1 пачка/день)', correct: true, category: 'modifiable' },
          { id: 'family', text: 'Семейный анамнез (ИБС отец, АГ мать)', correct: true, category: 'non-modifiable' },
          { id: 'sedentary', text: 'Сидячий образ жизни', correct: true, category: 'modifiable' },
          { id: 'diet', text: 'Избыточное потребление соли', correct: true, category: 'modifiable' },
          { id: 'alcohol', text: 'Злоупотребление алкоголем', correct: false, category: 'distractor' },
          { id: 'stress', text: 'Хронический стресс', correct: true, category: 'modifiable' }
        ],
        evidence: { cr: 'КР №62 v.3, раздел IV «Факторы риска»', udd: 'udd2', uur: 'uurA' },
        hint: 'Обратите внимание на модифицируемые и немодифицируемые факторы. Пациент не упоминал алкоголь.'
      },
      {
        id: 'diagnosis',
        title: 'Диагноз',
        description: 'На основании собранных данных поставьте предварительный диагноз.',
        type: 'single',
        options: [
          {
            id: 'essential',
            text: 'Эссенциальная (первичная) АГ, 2 стадии, 3 степени, высокий СС-риск',
            correct: true,
            explanation: 'Верно! АД 168/104 = 3 степень. Наличие 3+ факторов риска + поражение органов-мишеней (ЛЖ гипертрофия по ЭКГ) = высокий СС-риск.',
            evidence: { cr: 'КР №62 v.3, таблица 2 — классификация АГ', udd: 'udd1', uur: 'uurA' }
          },
          {
            id: 'secondary',
            text: 'Симптоматическая АГ (гипертоническая нефропатия)',
            correct: false,
            explanation: 'Нет данных для вторичной АГ: нет протеинурии, нарушений мочеиспускания, шумов над почками.',
            evidence: { cr: 'КР №62 v.3, раздел V «Дифференциальная диагностика»', udd: 'udd2', uur: 'uurB' }
          },
          {
            id: 'crisis',
            text: 'Гипертонический криз',
            correct: false,
            explanation: 'Гипертонический криз — АД >180/120 с острым поражением органов-мишеней. Здесь АД 168/104 без острого поражения.',
            evidence: { cr: 'КР №62 v.3, раздел VIII «Неотложная помощь»', udd: 'udd1', uur: 'uurA' }
          }
        ]
      },
      {
        id: 'examination',
        title: 'Обследование',
        description: 'Выберите минимальный необходимый объём обследования согласно КР Минздрава РФ.',
        type: 'multiselect',
        options: [
          { id: 'ecg', text: 'ЭКГ (12 отведений)', correct: true, required: true, evidence: { udd: 'udd1' } },
          { id: 'echo', text: 'ЭхоКГ', correct: true, required: false, evidence: { udd: 'udd2' } },
          { id: 'creatinine', text: 'Креатинин, СКФ', correct: true, required: true, evidence: { udd: 'udd1' } },
          { id: 'potassium', text: 'Калий, натрий', correct: true, required: true, evidence: { udd: 'udd1' } },
          { id: 'lipids', text: 'Липидный профиль', correct: true, required: true, evidence: { udd: 'udd2' } },
          { id: 'glucose', text: 'Глюкоза крови, HbA1c', correct: true, required: true, evidence: { udd: 'udd2' } },
          { id: 'tsh', text: 'ТТГ', correct: false, required: false, evidence: { udd: 'udd3' } },
          { id: 'renal_us', text: 'УЗИ почек', correct: false, required: false, evidence: { udd: 'udd3' } },
          { id: 'mri_brain', text: 'МРТ головного мозга', correct: false, required: false, penalty: true, evidence: { udd: 'udd3' } },
          { id: 'coronary_ct', text: 'КТ коронарных артерий', correct: false, required: false, penalty: true, evidence: { udd: 'udd3' } }
        ],
        evidence: { cr: 'КР №62 v.3, раздел VI «Диагностика»', udd: 'udd1', uur: 'uurA' },
        hint: 'Обязательные исследования для всех пациентов с АГ: ЭКГ, креатинин/СКФ, электролиты, липиды, глюкоза.'
      },
      {
        id: 'therapy',
        title: 'Терапия',
        description: 'Пациент: 54 года, АГ 3 ст., ИМТ 26.5, курит, СКФ >60, К+ норма. Нет ИБС, ХСН, СД.',
        type: 'single',
        options: [
          {
            id: 'acei_thiazide',
            text: 'ИАПФ (лизиноприл 10 мг) + тиазидоподобный диуретик (индапамид 1.5 мг)',
            correct: true,
            explanation: 'Оптимально! Согласно КР №62 v.3: при АГ с высоким СС-риском и ИМТ >25 рекомендуется комбинация ИАПФ + тиазидоподобный диуретик (УУР A, УДД 1).',
            evidence: { cr: 'КР №62 v.3, раздел VII «Лечение», таблица 8', udd: 'udd1', uur: 'uurA' }
          },
          {
            id: 'ccb_bra',
            text: 'БКК (амлодипин 5 мг) + БРА (валсартан 80 мг)',
            correct: false,
            explanation: 'Допустимо, но не оптимально. БКК+БРА — рабочая схема, но у курящего пациента с ожирением ИАПФ предпочтительнее для защиты сердца.',
            evidence: { cr: 'КР №62 v.3, таблица 8', udd: 'udd2', uur: 'uurB' }
          },
          {
            id: 'bb_mono',
            text: 'β-блокатор (бисопролол 5 мг) — монотерапия',
            correct: false,
            explanation: 'Монотерапия β-блокатором не рекомендуется как первая линия при АГ без сопутствующей ИБС/аритмии (УУР B, УДД 2).',
            evidence: { cr: 'КР №62 v.3, раздел VII.2.1', udd: 'udd2', uur: 'uurB' }
          },
          {
            id: 'arb_mono',
            text: 'БРА (лозартан 50 мг) — монотерапия',
            correct: false,
            explanation: 'Монотерапия при АГ 3 степени маловероятно достигнет целевого АД (<140/90). Согласно КР, при АГ >160/100 рекомендуется начинать с комбинации.',
            evidence: { cr: 'КР №62 v.3, раздел VII.2.2', udd: 'udd2', uur: 'uurB' }
          }
        ]
      },
      {
        id: 'monitoring',
        title: 'Наблюдение',
        description: 'Какую тактику ведения пациента выберете?',
        type: 'single',
        options: [
          {
            id: 'month_control',
            text: 'Контроль АД через 1 месяц, коррекция терапии при необходимости',
            correct: true,
            explanation: 'Верно! Согласно КР, первый контроль — через 1 месяц. Целевое АД <140/90. Если не достигнуто — усиление терапии.',
            evidence: { cr: 'КР №62 v.3, раздел VII.4 «Мониторинг»', udd: 'udd2', uur: 'uurA' }
          },
          {
            id: 'week_control',
            text: 'Контроль АД через 1 неделю',
            correct: false,
            explanation: 'Слишком рано. ИАПФ достигает стабильного эффекта через 2-4 недели. Ранний контроль создаёт ненужную нагрузку.',
            evidence: { cr: 'КР №62 v.3, раздел VII.4', udd: 'udd3', uur: 'uurB' }
          },
          {
            id: 'quarter_control',
            text: 'Контроль АД через 3 месяца',
            correct: false,
            explanation: 'Слишком поздно. При АГ 3 степени пациенту нужен более частый контроль. Задержка коррекции повышает риск СС-событий.',
            evidence: { cr: 'КР №62 v.3, раздел VII.4', udd: 'udd2', uur: 'uurA' }
          }
        ]
      }
    ],
    results: {
      excellent: { minScore: 90, title: 'Отличный результат!', text: 'Вы продемонстрировали высокий уровень клинического мышления. Все решения соответствуют КР Минздрава РФ.' },
      good: { minScore: 70, title: 'Хороший результат', text: 'Вы владеете основами, но есть пробелы. Рекомендуем повторить разделы с ошибками.' },
      needsWork: { minScore: 0, title: 'Требуется доработка', text: 'Рекомендуем изучить КР №62 v.3 и повторить кейс. Обратите внимание на классификацию АГ и выбор терапии.' }
    }
  },

  {
    id: 'diabetes2',
    title: 'Сахарный диабет 2 типа',
    mkb: 'E11',
    crNumber: '102',
    crVersion: '2',
    crUrl: 'https://cr.minzdrav.gov.ru/view-cr/102_2',
    difficulty: 'hard',
    specialty: 'Эндокринология / Терапия',
    patient: {
      name: 'Смирнова Елена Викторовна',
      age: 62,
      gender: 'female',
      occupation: 'Учитель',
      complaints: [
        'Сухость во рту, жажда (6 мес)',
        'Частое мочеиспускание, никтурия',
        'Снижение зрения (пелена перед глазами)',
        'Зуд кожи нижних конечностей'
      ],
      history: {
        life: 'Ожирение 2 степени (ИМТ 33). Малоподвижный образ жизни.',
        disease: 'Гипертоническая болезнь 10 лет (АД 145/90 на терапии).',
        allergy: 'Нет',
        heredity: 'Мать — СД 2 типа, отец — ИБС'
      },
      vitals: {
        ad: { value: '145/92', unit: 'мм рт.ст.', alert: true },
        hr: { value: '78', unit: 'уд/мин', alert: false },
        bmi: { value: '33.2', unit: 'кг/м²', alert: true },
        glucose: { value: '12.4', unit: 'ммоль/л', alert: true },
        hba1c: { value: '9.8', unit: '%', alert: true }
      }
    },
    stages: [
      {
        id: 'diagnosis_dm',
        title: 'Диагностика СД',
        description: 'Какие критерии подтверждают диагноз СД 2 типа?',
        type: 'multiselect',
        options: [
          { id: 'glucose_124', text: 'Глюкоза натощак 12.4 ммоль/л (≥7.0)', correct: true },
          { id: 'hba1c_98', text: 'HbA1c 9.8% (≥6.5%)', correct: true },
          { id: 'symptoms', text: 'Классические симптомы (полиурия, полидипсия)', correct: true },
          { id: 'glucose_55', text: 'Глюкоза натощак 5.5 ммоль/л', correct: false },
          { id: 'random_78', text: 'Глюкоза случайная 7.8 ммоль/л', correct: false }
        ],
        evidence: { cr: 'КР №102 v.2, раздел VI «Диагностика»', udd: 'udd1', uur: 'uurA' },
        hint: 'Диагноз СД подтверждается при глюкозе натощак ≥7.0 ммоль/л или HbA1c ≥6.5% на фоне классических симптомов.'
      },
      {
        id: 'complications',
        title: 'Осложнения',
        description: 'Какие осложнения необходимо исключить при первичном обращении?',
        type: 'multiselect',
        options: [
          { id: 'retinopathy', text: 'Диабетическая ретинопатия (осмотр офтальмолога)', correct: true, required: true },
          { id: 'nephropathy', text: 'Диабетическая нефропатия (АЛБ, креатинин, СКФ)', correct: true, required: true },
          { id: 'neuropathy', text: 'Диабетическая полинейропатия (монофиламент)', correct: true, required: true },
          { id: 'cvd', text: 'Сердечно-сосудистые заболевания (ЭКГ, ЭхоКГ)', correct: true, required: true },
          { id: 'stroke', text: 'МРТ головного мозга (скрининг)', correct: false, penalty: true },
          { id: 'thyroid', text: 'УЗИ щитовидной железы', correct: false }
        ],
        evidence: { cr: 'КР №102 v.2, раздел VII «Осложнения»', udd: 'udd1', uur: 'uurA' },
        hint: 'При первичной диагностике СД обязательно исключить микро- и макро-сосудистые осложнения.'
      },
      {
        id: 'therapy_dm',
        title: 'Назначение терапии',
        description: 'Женщина 62 года, СД 2 типа, HbA1c 9.8%, ИМТ 33.2, АГ. СКФ >60.',
        type: 'single',
        options: [
          {
            id: 'metformin_glp1',
            text: 'Метформин + ГПП-1 агонист (семаглутид)',
            correct: true,
            explanation: 'Оптимально! При HbA1c >9% и ожирении рекомендуется комбинация метформина с ГПП-1 агонистом (УУР A, УДД 1). ГПП-1 агонисты способствуют снижению веса и СС-риска.',
            evidence: { cr: 'КР №102 v.2, раздел VIII, алгоритм 3', udd: 'udd1', uur: 'uurA' }
          },
          {
            id: 'metformin_su',
            text: 'Метформин + сульфанилмочевина (глибенкламид)',
            correct: false,
            explanation: 'Сульфанилмочевины повышают риск гипогликемии и способствуют набору веса. При ожирении предпочтительны препараты без риска гипогликемии.',
            evidence: { cr: 'КР №102 v.2, таблица 9', udd: 'udd2', uur: 'uurB' }
          },
          {
            id: 'insulin',
            text: 'Базальный инсулин (гларгин) — монотерапия',
            correct: false,
            explanation: 'Инсулинотерапия показана при HbA1c >10% или декомпенсации. При HbA1c 9.8% начинают с пероральных препаратов/инкретинов.',
            evidence: { cr: 'КР №102 v.2, раздел VIII.3', udd: 'udd2', uur: 'uurB' }
          }
        ]
      }
    ],
    results: {
      excellent: { minScore: 90, title: 'Отлично!', text: 'Вы владеете современными подходами к ведению СД 2 типа.' },
      good: { minScore: 70, title: 'Хорошо', text: 'Есть небольшие пробелы в знаниях. Обратите внимание на алгоритмы назначения терапии.' },
      needsWork: { minScore: 0, title: 'Требуется изучение', text: 'Рекомендуем изучить КР №102 v.2 по СД 2 типа.' }
    }
  },

  // ===== КЕЙС С FREETEXT-ЭТАПАМИ (для специалиста) =====
  {
    id: 'acs-freetext',
    title: 'Острый коронарный синдром (свободный ответ)',
    mkb: 'I21-I22',
    crNumber: '187',
    crVersion: '2',
    crUrl: 'https://cr.minzdrav.gov.ru/view-cr/187_2',
    difficulty: 'hard',
    specialty: 'Кардиология / Реаниматология',
    patient: {
      name: 'Николаев Сергей Петрович',
      age: 58,
      gender: 'male',
      occupation: 'Водитель',
      complaints: [
        'Сжимающая боль за грудиной (1 час)',
        'Боль иррадирует в левую руку, нижнюю челюсть',
        'Страх смерти, обильный пот'
      ],
      history: {
        life: 'Курит 30 лет (1.5 пачки/день). Гипертония 10 лет. Отец — ИБС, инфаркт в 55 лет.',
        disease: 'Обращался к кардиологу 3 мес назад, АД 150/95, ХСН ФК II.',
        allergy: 'Нет',
        heredity: 'ИБС (отец), АГ (мать)'
      },
      vitals: {
        ad: { value: '90/60', unit: 'мм рт.ст.', alert: true },
        hr: { value: '105', unit: 'уд/мин', alert: true },
        rr: { value: '22', unit: 'вд/мин', alert: true },
        temp: { value: '36.4', unit: '°C', alert: false },
        spo2: { value: '92', unit: '%', alert: true }
      },
      physicalExam: {
        general: 'Бледный, влажный, холодный пот. Тревожен.',
        heart: 'Тоны приглушены, ритм нерегулярный, тахикардия. Шум систолический на верхушке.',
        lungs: 'Дыхание везикулярное, хрипов нет. Влажные хрипы в нижних отделах слева.',
        abdomen: 'Мягкий, безболезненный.',
        kidneys: 'Поколачивание поясничной области безболезненно.',
        vessels: 'Пульс на периферии слабый, АД на руках симметричное.'
      }
    },
    stages: [
      {
        id: 'diagnosis_free',
        title: 'Диагноз',
        description: 'На основании клинической картины сформулируйте предварительный диагноз.',
        type: 'freetext',
        expectedKeywords: ['острый', 'коронарный', 'синдром', 'инфаркт', 'миокарда', 'стенокардия', 'нестабильная'],
        correctAnswers: ['ОКС с подъемом ST', 'Острый инфаркт миокарда', 'Нестабильная стенокардия'],
        keywordThreshold: 0.4,
        explanation: 'ОКС с элевацией сегмента ST (STEMI) — переднеперегородочный инфаркт миокарда. Классическая триада: боль за грудиной, иррадиация, вегетативные симптомы.',
        evidence: { cr: 'КР №187 v.2, раздел IV «Диагностика»', udd: 'udd1', uur: 'uurA' }
      },
      {
        id: 'emergency_free',
        title: 'Неотложная помощь',
        description: 'Опишите первоочередные действия в приёмном покое.',
        type: 'freetext',
        expectedKeywords: ['аспирин', 'кислород', 'нитроглицерин', 'морфин', 'гепарин', 'тикагрелор', 'клопидогрел', 'ЭКГ', '12 отведений'],
        correctAnswers: ['Аспирин 325 мг + кислород + нитроглицерин', 'Двойная антиагрегантная терапия, ЭКГ 12 отведений'],
        keywordThreshold: 0.35,
        explanation: 'МОНА-Б: Morphine (при боли), Oxygen (SpO2 < 90%), Nitrates (при АД > 90/60), Aspirin 325 мг. ДАТ: тикагрелор/клопидогрел + аспирин. ЭКГ 12 отведений в течение 10 мин.',
        evidence: { cr: 'КР №187 v.2, раздел V «Неотложная помощь»', udd: 'udd1', uur: 'uurA' }
      },
      {
        id: 'revascularization_free',
        title: 'Реваскуляризация',
        description: 'Какую тактику реваскуляризации выберете? Обоснуйте.',
        type: 'freetext',
        expectedKeywords: ['ПКВ', 'стентирование', 'коронарография', 'реперфузия', '90 минут', 'первичное', 'ангиопластика'],
        correctAnswers: ['Первичное ПКВ в течение 90 мин', 'Экстренная коронарография с ПКВ'],
        keywordThreshold: 0.3,
        explanation: 'При STEMI с элевацией ST — первичное чрескожное коронарное вмешательство (ПКВ) в течение 90 минут от первого контакта с медицинской системой. Альтернатива — тромболиз, если ПКВ невозможен в течение 120 мин.',
        evidence: { cr: 'КР №187 v.2, раздел VI «Реваскуляризация»', udd: 'udd1', uur: 'uurA' }
      }
    ],
    results: {
      excellent: { minScore: 90, title: 'Высший уровень!', text: 'Вы продемонстрировали глубокое понимание алгоритма ведения ОКС. Все решения соответствуют КР Минздрава РФ и ESC guidelines.' },
      good: { minScore: 70, title: 'Хороший результат', text: 'Вы владеете основами, но есть пробелы. Обратите внимание на сроки реваскуляризации и показания к тромболизу.' },
      needsWork: { minScore: 0, title: 'Требуется доработка', text: 'Рекомендуем изучить КР №187 v.2 по ОКС и повторить кейс. Обратите внимание на алгоритм МОНА-Б и сроки ПКВ.' }
    }
  }
];

export const CLINICAL_ALGORITHMS: ClinicalAlgorithm[] = [
  {
    id: 'ag_diagnosis',
    title: 'Алгоритм диагностики АГ',
    cr: 'КР №62 v.3, Приложение Б',
    crUrl: 'https://cr.minzdrav.gov.ru/view-cr/62_3',
    specialty: 'Кардиология',
    steps: [
      { id: 'start', type: 'start', text: 'Пациент с подозрением на АГ' },
      { id: 'measure', type: 'decision', text: 'Измерение АД ≥2 раза с интервалом 1-2 мин' },
      { id: 'check_high', type: 'decision', text: 'АД ≥140/90 мм рт.ст.?' },
      { id: 'repeat', type: 'action', text: 'Повторное измерение через 1-4 недели' },
      { id: 'confirm', type: 'decision', text: 'АД ≥140/90 при повторных визитах (≥2)?' },
      { id: 'abpm', type: 'action', text: 'Суточное мониторирование АД (СМАД)' },
      { id: 'exclude', type: 'action', text: 'Исключение вторичной АГ (анамнез, ОАК, креатинин, УЗИ почек)' },
      { id: 'risk', type: 'action', text: 'Оценка СС-риска (SCORE2/SCORE2-OP)' },
      { id: 'organs', type: 'action', text: 'Оценка поражения органов-мишеней (ЭКГ, ЭхоКГ, СКФ, АЛБ)' },
      { id: 'diagnosis', type: 'end', text: 'Диагноз: АГ [степень], [стадия], [СС-риск]' }
    ]
  },
  {
    id: 'ag_therapy',
    title: 'Алгоритм выбора терапии АГ',
    cr: 'КР №62 v.3, Приложение Б',
    crUrl: 'https://cr.minzdrav.gov.ru/view-cr/62_3',
    specialty: 'Кардиология',
    steps: [
      { id: 'start', type: 'start', text: 'Подтверждённая АГ' },
      { id: 'lifestyle', type: 'action', text: 'Модификация образа жизни (все пациенты)' },
      { id: 'stage1', type: 'decision', text: 'АГ 1 ст. без СС-риска?' },
      { id: 'mono', type: 'action', text: 'Монотерапия (ИАПФ/БРА/БКК/тиазид)' },
      { id: 'stage2_3', type: 'decision', text: 'АГ 2-3 ст. или высокий/очень высокий СС-риск?' },
      { id: 'combo', type: 'action', text: 'Комбинация с первых дней (ИАПФ+БКК или ИАПФ+тиазид)' },
      { id: 'target', type: 'decision', text: 'Достигнуто целевое АД (<140/90)?' },
      { id: 'triple', type: 'action', text: 'Тройная комбинация (ИАПФ+БКК+тиазид)' },
      { id: 'spirono', type: 'action', text: 'Спиронолактон (при резистентной АГ)' },
      { id: 'end', type: 'end', text: 'Достижение целевого АД, длительное наблюдение' }
    ]
  }
];

export function getCaseById(id: string): SimulationCase | undefined {
  return SIMULATION_CASES.find(c => c.id === id);
}

export function getAlgorithmById(id: string): ClinicalAlgorithm | undefined {
  return CLINICAL_ALGORITHMS.find(a => a.id === id);
}

// Alias for backward compatibility with importers expecting camelCase
export { SIMULATION_CASES as simulationCases };

export const getRandomSimulationCase = (): SimulationCase | null => {
  if (SIMULATION_CASES.length === 0) return null;
  return SIMULATION_CASES[Math.floor(Math.random() * SIMULATION_CASES.length)];
};

// =============================================================================
// ПРОВЕРКА СВОБОДНЫХ ОТВЕТОВ (freetext)
// =============================================================================

const FT_STOP_WORDS = new Set([
  'и','или','в','на','с','по','не','без','при','от','до','за','из','под','над',
  'о','об','про','для','к','у','во','со','ко','а','но','the','and','or','in','on',
  'at','to','of','for','with','without','a','an','как','это','что','где','когда',
  'при','при','также','тоже','ещё','еще','очень','более','менее','примерно'
]);

function getMeaningfulWords(str: string): string[] {
  return normalize(str)
    .split(/\s+/)
    .filter(w => w.length >= 3 && !FT_STOP_WORDS.has(w));
}

/**
 * Проверка свободного текстового ответа.
 * Ищет ключевые слова в вводе пользователя.
 * Возвращает score (0-100) и список найденных/пропущенных ключевых слов.
 */
export function checkFreeTextAnswer(
  input: string,
  expectedKeywords: string[],
  correctAnswers?: string[],
  keywordThreshold?: number
): { score: number; found: string[]; missed: string[]; matchedAnswer: boolean } {
  const normInput = normalize(input);
  if (!normInput || normInput.length < 2) {
    return { score: 0, found: [], missed: expectedKeywords, matchedAnswer: false };
  }

  const inputWords = getMeaningfulWords(input);
  const found: string[] = [];
  const missed: string[] = [];

  for (const kw of expectedKeywords) {
    const normKw = normalize(kw);
    // Проверяем полное вхождение или совпадение по словам
    const kwWords = getMeaningfulWords(kw);
    const hasFullMatch = normInput.includes(normKw);
    const hasWordMatch = kwWords.length > 0 && kwWords.some(w => inputWords.includes(w));
    if (hasFullMatch || hasWordMatch) {
      found.push(kw);
    } else {
      missed.push(kw);
    }
  }

  // Проверка полного совпадения с одним из correctAnswers
  let matchedAnswer = false;
  if (correctAnswers && correctAnswers.length > 0) {
    matchedAnswer = correctAnswers.some(ans => {
      const normAns = normalize(ans);
      return normAns === normInput || normInput.includes(normAns) || normAns.includes(normInput);
    });
  }

  const threshold = keywordThreshold ?? 0.5;
  const ratio = expectedKeywords.length > 0 ? found.length / expectedKeywords.length : 0;
  const score = matchedAnswer ? 100 : Math.round(Math.min(100, ratio * 100));

  // Если ratio >= threshold — считаем проходным (score >= 70)
  const finalScore = matchedAnswer || ratio >= threshold ? Math.max(score, 70) : score;

  return { score: finalScore, found, missed, matchedAnswer };
}
