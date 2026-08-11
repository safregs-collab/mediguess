import type { SimulationCase } from '../types/simulation';

export const simulationCases: SimulationCase[] = [
  {
    id: 1,
    patient: {
      name: 'Иванов Сергей Петрович',
      age: 58,
      gender: 'male',
      occupation: 'Водитель',
    },
    chiefComplaint: 'Сжимающая боль за грудиной, возникающая при ходьбе и отдающая в левую руку',
    historyOfPresentIllness:
      'Боли впервые появились 2 недели назад при подъёме на 3-й этаж. Сейчас возникают при ходьбе более 100 м. Продолжительность 3–5 мин, проходят после отдыха. Сопровождаются одышкой, потливостью.',
    historyQuestions: [
      { id: 'q1', question: 'Курите?', answer: 'Да, 30 лет по 1 пачке в день', isClinicallySignificant: true },
      { id: 'q2', question: 'Алкоголь?', answer: 'Пиво по выходным', isClinicallySignificant: false },
      { id: 'q3', question: 'Наследственность?', answer: 'Отец умер от инфаркта в 62 года', isClinicallySignificant: true },
      { id: 'q4', question: 'Давление?', answer: 'Последние 5 лет гипертония, принимает эналаприл нерегулярно', isClinicallySignificant: true },
      { id: 'q5', question: 'Диабет?', answer: 'Нет, сахар в норме', isClinicallySignificant: false },
      { id: 'q6', question: 'Холестерин?', answer: 'Не знает, давно не проверял', isClinicallySignificant: true },
      { id: 'q7', question: 'Предыдущие боли?', answer: 'Никогда не было, это первый раз', isClinicallySignificant: true },
      { id: 'q8', question: 'Приём аспирина?', answer: 'Нет, не пьёт', isClinicallySignificant: true },
    ],
    vitals: {
      temperature: 36.6,
      heartRate: 88,
      bloodPressure: '165/95',
      respiratoryRate: 18,
      spo2: 96,
      height: 175,
      weight: 92,
    },
    physicalExam: [
      { region: 'general', finding: 'Состояние удовлетворительное, бледность кожных покровов', isAbnormal: true },
      { region: 'chest', finding: 'Тоны сердца приглушены, акцент II тона над лёгочной артерией', isAbnormal: true },
      { region: 'chest', finding: 'В лёгких дыхание везикулярное, хрипов нет', isAbnormal: false },
      { region: 'abdomen', finding: 'Мягкий, безболезненный, печень не увеличена', isAbnormal: false },
      { region: 'extremities', finding: 'Периферические пульсы симметричные, отёков нет', isAbnormal: false },
    ],
    availableTests: [
      {
        id: 'ecg',
        name: 'ЭКГ',
        category: 'ecg',
        synonyms: ['экг', 'электрокардиография', 'электрокардиограмма'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Ритм', value: 'Синусовый', normalRange: 'Синусовый', isAbnormal: false, interpretation: 'Ритм правильный' },
          { parameter: 'ЧСС', value: '88 уд/мин', normalRange: '60-100', isAbnormal: false, interpretation: 'В пределах нормы' },
          { parameter: 'ST', value: 'Депрессия 1 мм в V4-V6', normalRange: 'Изоэлектрическая', isAbnormal: true, interpretation: 'Признаки ишемии миокарда' },
          { parameter: 'T', value: 'Отрицательная в V4-V6', normalRange: 'Положительная', isAbnormal: true, interpretation: 'Признаки ишемии' },
        ],
      },
      {
        id: 'troponin',
        name: 'Тропонин I',
        category: 'lab',
        synonyms: ['тропонин', 'тропонины', 'тропонин и'],
        turnaroundTime: 1,
        results: [
          { parameter: 'Тропонин I', value: '0.04 нг/мл', normalRange: '<0.04', isAbnormal: false, interpretation: 'В пределах нормы, острый инфаркт исключён' },
        ],
      },
      {
        id: 'holter',
        name: 'Холтеровское мониторирование',
        category: 'ecg',
        synonyms: ['холтер', 'хмэкг', 'суточное экг'],
        turnaroundTime: 1,
        results: [
          { parameter: 'Эпизоды ишемии', value: '12 эпизодов', normalRange: '0', isAbnormal: true, interpretation: 'Молчаливая ишемия при физической нагрузке' },
          { parameter: 'Макс. ЧСС', value: '142 уд/мин', normalRange: '<150', isAbnormal: false, interpretation: 'Адекватная хронотропная реакция' },
        ],
      },
      {
        id: 'echo',
        name: 'ЭхоКГ',
        category: 'imaging',
        synonyms: ['эхокг', 'узи сердца', 'эхокардиография'],
        turnaroundTime: 1,
        results: [
          { parameter: 'ФВ ЛЖ', value: '52%', normalRange: '>55%', isAbnormal: true, interpretation: 'Незначительное снижение фракции выброса' },
          { parameter: 'Диастолическая функция', value: 'Нарушение типа I', normalRange: 'Норма', isAbnormal: true, interpretation: 'Признаки диастолической дисфункции' },
        ],
      },
      {
        id: 'lipids',
        name: 'Липидный профиль',
        category: 'lab',
        synonyms: ['холестерин', 'липиды', 'липидограмма'],
        turnaroundTime: 1,
        results: [
          { parameter: 'Общий холестерин', value: '6.8 ммоль/л', normalRange: '<5.2', isAbnormal: true, interpretation: 'Гиперхолестеринемия' },
          { parameter: 'ЛПНП', value: '4.2 ммоль/л', normalRange: '<3.0', isAbnormal: true, interpretation: 'Повышенный «плохой» холестерин' },
          { parameter: 'ЛПВП', value: '0.9 ммоль/л', normalRange: '>1.0', isAbnormal: true, interpretation: 'Сниженный «хороший» холестерин' },
        ],
      },
      {
        id: 'coronary_ct',
        name: 'КТ коронарных артерий',
        category: 'imaging',
        synonyms: ['кт коронарография', 'кт ка', 'коронарная кт'],
        turnaroundTime: 2,
        results: [
          { parameter: 'Стеноз ЛВА', value: '45%', normalRange: '<50%', isAbnormal: true, interpretation: 'Умеренный стеноз передней межжелудочковой артерии' },
          { parameter: 'Кальций', value: 'Agatston 320', normalRange: '<100', isAbnormal: true, interpretation: 'Высокая коронарная кальцификация' },
        ],
      },
      {
        id: 'stress_test',
        name: 'Проба с дозированной нагрузкой',
        category: 'other',
        synonyms: ['вэмин', 'тредмил', 'велоэргометрия'],
        turnaroundTime: 1,
        results: [
          { parameter: 'Метаболический эквивалент', value: '5.2 МЕТС', normalRange: '>7', isAbnormal: true, interpretation: 'Сниженная толерантность к нагрузке' },
          { parameter: 'ST', value: 'Депрессия 2 мм', normalRange: 'Изоэлектрическая', isAbnormal: true, interpretation: 'Ишемия при нагрузке' },
        ],
      },
    ],
    correctDiagnosis: ['Стенокардия напряжения', 'ИБС: стенокардия', 'Ишемическая болезнь сердца'],
    correctTreatment: {
      drugs: [
        { name: 'Аторвастатин', dose: '40 мг', route: 'перорально', duration: 'постоянно' },
        { name: 'Бисопролол', dose: '5 мг', route: 'перорально', duration: 'постоянно' },
        { name: 'Амлодипин', dose: '5 мг', route: 'перорально', duration: 'постоянно' },
        { name: 'Ацетилсалициловая кислота', dose: '75 мг', route: 'перорально', duration: 'постоянно' },
        { name: 'Нитроглицерин', dose: '0.5 мг', route: 'сублингвально', duration: 'при приступе' },
      ],
      regimen: 'general',
      diet: 'Гипохолестериновая диета, ограничение соли',
      contraindications: ['НПВС при острой боли', 'Симпатомиметики'],
    },
    explanation:
      'Классическая картина стенокардии напряжения: сжимающая боль за грудиной при физической нагрузке, отдающая в левую руку, проходящая в покое. Факторы риска: курение, гипертония, ожирение, мужской пол, возраст >55, отягощённая наследственность.',
    complications: ['Инфаркт миокарда', 'Нарушение ритма', 'Внезапная сердечная смерть'],
  },
  {
    id: 2,
    patient: {
      name: 'Петрова Анна Михайловна',
      age: 34,
      gender: 'female',
      occupation: 'Учитель',
    },
    chiefComplaint: 'Боли в правом подреберье после жирной пищи, тошнота',
    historyOfPresentIllness:
      'Боли впервые появились 6 месяцев назад после праздничного ужина. Сейчас возникают после каждого приёма жирной/жареной пищи. Продолжительность 30–60 мин, сопровождаются тошнотой, иногда рвотой жёлчью.',
    historyQuestions: [
      { id: 'q1', question: 'Беременности?', answer: '2 беременности, 2 роды', isClinicallySignificant: true },
      { id: 'q2', question: 'Приём гормональных контрацептивов?', answer: 'Да, последние 8 лет', isClinicallySignificant: true },
      { id: 'q3', question: 'Похудение?', answer: 'Пыталась сидеть на диете, но безуспешно', isClinicallySignificant: false },
      { id: 'q4', question: 'Желтуха?', answer: 'Нет, склеры белые', isClinicallySignificant: true },
      { id: 'q5', question: 'Стул?', answer: 'Окраска нормальная, запоров нет', isClinicallySignificant: false },
      { id: 'q6', question: 'Температура?', answer: 'Во время приступа может подниматься до 37.2°C', isClinicallySignificant: true },
      { id: 'q7', question: 'Аллергия на лекарства?', answer: 'Нет', isClinicallySignificant: false },
    ],
    vitals: {
      temperature: 36.8,
      heartRate: 76,
      bloodPressure: '120/80',
      respiratoryRate: 16,
      spo2: 98,
      height: 162,
      weight: 78,
    },
    physicalExam: [
      { region: 'general', finding: 'Состояние удовлетворительное, кожа чистая, склеры белые', isAbnormal: false },
      { region: 'abdomen', finding: 'Мягкий, болезненность в точке Кера (правое подреберье), симптом Ортнера положительный', isAbnormal: true },
      { region: 'abdomen', finding: 'Печень по краю ребёрной дуги, край закруглённый, плотный', isAbnormal: true },
      { region: 'skin', finding: 'Ксантелазмы на веках', isAbnormal: true },
    ],
    availableTests: [
      {
        id: 'usg_abdomen',
        name: 'УЗИ органов брюшной полости',
        category: 'imaging',
        synonyms: ['узи', 'узи желчного', 'узи брюшной полости'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Жёлчный пузырь', value: 'Камни 8-12 мм, утолщение стенки до 4 мм', normalRange: 'Стенка <3 мм, без камней', isAbnormal: true, interpretation: 'Калькулёзный холецистит' },
          { parameter: 'Печень', value: 'Увеличена, эхогенность повышена', normalRange: 'Норма', isAbnormal: true, interpretation: 'Жировой гепатоз' },
        ],
      },
      {
        id: 'bilirubin',
        name: 'Билирубин общий и прямой',
        category: 'lab',
        synonyms: ['билирубин', 'печеночные пробы'],
        turnaroundTime: 1,
        results: [
          { parameter: 'Общий билирубин', value: '18 мкмоль/л', normalRange: '<21', isAbnormal: false, interpretation: 'В пределах нормы' },
          { parameter: 'Прямой билирубин', value: '4 мкмоль/л', normalRange: '<5', isAbnormal: false, interpretation: 'В пределах нормы' },
        ],
      },
      {
        id: 'lipase',
        name: 'Липаза, амилаза',
        category: 'lab',
        synonyms: ['амилаза', 'панкреатические ферменты', 'панкреатит'],
        turnaroundTime: 1,
        results: [
          { parameter: 'Липаза', value: '32 Ед/л', normalRange: '<60', isAbnormal: false, interpretation: 'Панкреатит исключён' },
        ],
      },
      {
        id: 'fbc',
        name: 'Общий анализ крови',
        category: 'lab',
        synonyms: ['оак', 'кровь общий', 'лейкоциты'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Лейкоциты', value: '7.2 ×10⁹/л', normalRange: '4-9', isAbnormal: false, interpretation: 'В норме' },
          { parameter: 'СОЭ', value: '12 мм/ч', normalRange: '<15', isAbnormal: false, interpretation: 'В норме' },
        ],
      },
      {
        id: 'mrcp',
        name: 'МРТ желчных протоков (МРХП)',
        category: 'imaging',
        synonyms: ['мрхп', 'мрт желчных', 'мрт билиарная'],
        turnaroundTime: 2,
        results: [
          { parameter: 'Жёлчные протоки', value: 'Нормальный калибр', normalRange: '<8 мм', isAbnormal: false, interpretation: 'Механическая желтуха исключена' },
        ],
      },
    ],
    correctDiagnosis: ['Хронический калькулёзный холецистит', 'ЖКБ', 'Жёлчнокаменная болезнь'],
    correctTreatment: {
      drugs: [
        { name: 'Урсодезоксихолевая кислота', dose: '300 мг', route: 'перорально', duration: '3-6 месяцев' },
        { name: 'Дротаверин', dose: '40 мг', route: 'перорально', duration: 'при приступе' },
        { name: 'Омепразол', dose: '20 мг', route: 'перорально', duration: '14 дней' },
      ],
      regimen: 'general',
      diet: 'Стол №5 (щадящий), исключение жареного, жирного, острого',
      contraindications: ['Морфин при боли (спазм сфинктера Одди)', 'Жирная пища'],
    },
    explanation:
      'Характерная картина жёлчнокаменной болезни: постпрандиальные боли в правом подреберье после жирной пищи, положительный симптом Ортнера, ксантелазмы как маркер дислипидемии. Факторы риска: женский пол, возраст 40+, многородие, приём ОК, избыточный вес.',
    complications: ['Острый холецистит', 'Механическая желтуха', 'Панкреатит'],
  },
  {
    id: 3,
    patient: {
      name: 'Сидоров Дмитрий Алексеевич',
      age: 24,
      gender: 'male',
      occupation: 'Студент',
    },
    chiefComplaint: 'Внезапная одышка, боли в грудной клетке при вдохе, кашель с кровью',
    historyOfPresentIllness:
      'Состояние возникло внезапно после длительного перелёта (8 часов). Сначала покашливание, затем одышка, резкая боль в грудной клетке справа при вдохе, кашель с прожилками крови.',
    historyQuestions: [
      { id: 'q1', question: 'Перелёты?', answer: 'Да, вчера летел 8 часов из Москвы в Нью-Йорк', isClinicallySignificant: true },
      { id: 'q2', question: 'Травмы?', answer: 'Нет, не падал, не ударялся', isClinicallySignificant: true },
      { id: 'q3', question: 'Варикоз?', answer: 'Не замечал', isClinicallySignificant: true },
      { id: 'q4', question: 'Курение?', answer: 'Иногда, социально', isClinicallySignificant: false },
      { id: 'q5', question: 'Операции?', answer: 'Аппендэктомия в 16 лет', isClinicallySignificant: false },
      { id: 'q6', question: 'Приём контрацептивов?', answer: 'Не применимо', isClinicallySignificant: false },
      { id: 'q7', question: 'Рак в анамнезе?', answer: 'Нет', isClinicallySignificant: false },
      { id: 'q8', question: 'Температура?', answer: '37.0°C, субфебрильная', isClinicallySignificant: true },
    ],
    vitals: {
      temperature: 37.0,
      heartRate: 110,
      bloodPressure: '100/70',
      respiratoryRate: 26,
      spo2: 90,
      height: 182,
      weight: 75,
    },
    physicalExam: [
      { region: 'general', finding: 'Беспокойное состояние, цианоз губ, тахипноэ', isAbnormal: true },
      { region: 'chest', finding: 'Перкуссия: тимпанит справа внизу', isAbnormal: true },
      { region: 'chest', finding: 'Аускультация: ослабленное дыхание справа внизу, хрипов нет', isAbnormal: true },
      { region: 'extremities', finding: 'Отёк левой голени, болезненность при пальпации икроножной мышцы', isAbnormal: true },
      { region: 'extremities', finding: 'Периферические пульсы на ногах симметричные', isAbnormal: false },
    ],
    availableTests: [
      {
        id: 'd_dimer',
        name: 'D-димер',
        category: 'lab',
        synonyms: ['д димер', 'ддимер', 'фибрин деградации'],
        turnaroundTime: 0,
        results: [
          { parameter: 'D-димер', value: '1240 нг/мл', normalRange: '<500', isAbnormal: true, interpretation: 'Значительно повышен, высокая вероятность ТЭЛА' },
        ],
      },
      {
        id: 'ct_angio',
        name: 'СКТ-ангиография лёгочных артерий',
        category: 'imaging',
        synonyms: ['кт ангио', 'скт легких', 'кт ла', 'ангиография'],
        turnaroundTime: 1,
        results: [
          { parameter: 'Лёгочные артерии', value: 'Наполнительный дефект в сегментарных ветвях ЛПА', normalRange: 'Проходимость свободная', isAbnormal: true, interpretation: 'Тромбоэмболия сегментарных ветвей левой лёгочной артерии' },
        ],
      },
      {
        id: 'ecg_tela',
        name: 'ЭКГ',
        category: 'ecg',
        synonyms: ['экг', 'электрокардиография'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Ритм', value: 'Синусовый тахикардия', normalRange: '60-100', isAbnormal: true, interpretation: 'Тахикардия' },
          { parameter: 'S1Q3T3', value: 'Присутствует', normalRange: 'Отсутствует', isAbnormal: true, interpretation: 'Классический признак ТЭЛА' },
          { parameter: 'ST', value: 'Депрессия в III, aVF', normalRange: 'Изоэлектрическая', isAbnormal: true, interpretation: 'Правожелудочковая перегрузка' },
        ],
      },
      {
        id: 'usg_legs',
        name: 'УЗИ вен нижних конечностей',
        category: 'imaging',
        synonyms: ['узи вен', 'узи ног', 'двс'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Вены голени', value: 'Тромб в подкожной вене левой голени', normalRange: 'Проходимость свободная', isAbnormal: true, interpretation: 'Глубокий венозный тромбоз — источник эмболии' },
        ],
      },
      {
        id: 'troponin_tela',
        name: 'Тропонин',
        category: 'lab',
        synonyms: ['тропонин', 'тропонины'],
        turnaroundTime: 1,
        results: [
          { parameter: 'Тропонин I', value: '0.12 нг/мл', normalRange: '<0.04', isAbnormal: true, interpretation: 'Повышен, правожелудочковый инфаркт при массивной ТЭЛА' },
        ],
      },
      {
        id: 'blood_gas',
        name: 'Газы крови',
        category: 'lab',
        synonyms: ['газы', 'кровь газовый', 'рн крови'],
        turnaroundTime: 0,
        results: [
          { parameter: 'pO2', value: '58 мм рт.ст.', normalRange: '>80', isAbnormal: true, interpretation: 'Выраженная гипоксемия' },
          { parameter: 'pCO2', value: '32 мм рт.ст.', normalRange: '35-45', isAbnormal: true, interpretation: 'Гипокапния — гипервентиляция' },
          { parameter: 'pH', value: '7.48', normalRange: '7.35-7.45', isAbnormal: true, interpretation: 'Респираторный алкалоз' },
        ],
      },
    ],
    correctDiagnosis: ['Тромбоэмболия лёгочной артерии', 'ТЭЛА', 'Лёгочная эмболия'],
    correctTreatment: {
      drugs: [
        { name: 'Надрогепарин кальция', dose: '0.1 мл/10 кг', route: 'п/к', duration: '7-10 дней' },
        { name: 'Варфарин', dose: '5 мг', route: 'перорально', duration: '3-6 месяцев (МНО 2.0-3.0)' },
        { name: 'Кислород', dose: '4-6 л/мин', route: 'назальная канюля', duration: 'до нормализации SpO2' },
      ],
      regimen: 'bed',
      diet: 'Обычная, обильное питьё',
      contraindications: ['Аспирин как монотерапия', 'НПВС', 'Массаж голени'],
    },
    explanation:
      'ТЭЛА — классическая триада после длительного перелёта: внезапная одышка, боли в грудной клетке при вдохе, гемоптиз. Признаки глубокого венозного тромбоза (отёк голени, болезненность икроножной мышцы) подтверждают источник эмболии. Гипоксемия (SpO2 90%), тахикардия, гипотензия — признаки массивной ТЭЛА.',
    complications: ['Острая правожелудочковая недостаточность', 'Коллапс', 'Летальный исход'],
  },
  {
    id: 4,
    patient: {
      name: 'Козлов Артём Викторович',
      age: 19,
      gender: 'male',
      occupation: 'Студент',
    },
    chiefComplaint: 'Боль в животе, тошнота, рвота',
    historyOfPresentIllness:
      'Боль появилась вчера вечером в области пупка, носила тупой характер. Сегодня утром боль усилилась, перешла в правую подвздошную область, стала постоянной, усиливается при ходьбе и кашле. Тошнота, однократная рвота желудочным содержимым. Отказ от приёма пищи.',
    historyQuestions: [
      { id: 'q1', question: 'Аппетит?', answer: 'Полный отказ от еды с сегодняшнего утра', isClinicallySignificant: true },
      { id: 'q2', question: 'Стул?', answer: 'Вчера был нормальный, сегодня не ходил', isClinicallySignificant: true },
      { id: 'q3', question: 'Температура?', answer: '37.8°C с утра', isClinicallySignificant: true },
      { id: 'q4', question: 'Перенесённые ОРВИ?', answer: 'Неделю назад болел ангиной, принимал антибиотики', isClinicallySignificant: false },
      { id: 'q5', question: 'Аллергия?', answer: 'Нет', isClinicallySignificant: false },
      { id: 'q6', question: 'Похожие боли раньше?', answer: 'Никогда не было', isClinicallySignificant: true },
    ],
    vitals: {
      temperature: 37.8,
      heartRate: 96,
      bloodPressure: '120/80',
      respiratoryRate: 20,
      spo2: 97,
      height: 178,
      weight: 72,
    },
    physicalExam: [
      { region: 'general', finding: 'Состояние средней тяжести, бледность кожи, язык влажный, обложен белым налётом', isAbnormal: true },
      { region: 'abdomen', finding: 'Живот втянут, напряжение мышц передней брюшной стенки справа внизу', isAbnormal: true },
      { region: 'abdomen', finding: 'Резкая болезненность в точке Мак-Бёрни (правое подреберье — нет, правое подвздошное — да)', isAbnormal: true },
      { region: 'abdomen', finding: 'Симптом Щёткина-Блюмберга положительный справа', isAbnormal: true },
      { region: 'abdomen', finding: 'Симптом Ровзинга положительный', isAbnormal: true },
      { region: 'abdomen', finding: 'Перистальтика ослаблена', isAbnormal: true },
    ],
    availableTests: [
      {
        id: 'fbc_app',
        name: 'Общий анализ крови',
        category: 'lab',
        synonyms: ['оак', 'кровь общий', 'лейкоциты'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Лейкоциты', value: '13.5 ×10⁹/л', normalRange: '4-9', isAbnormal: true, interpretation: 'Лейкоцитоз — признак воспаления' },
          { parameter: 'Нейтрофилы', value: '82%', normalRange: '47-72', isAbnormal: true, interpretation: 'Нейтрофилоз' },
          { parameter: 'СОЭ', value: '28 мм/ч', normalRange: '<15', isAbnormal: true, interpretation: 'Ускорение СОЭ' },
        ],
      },
      {
        id: 'crp_app',
        name: 'СРБ',
        category: 'lab',
        synonyms: ['срб', 'с-реактивный белок'],
        turnaroundTime: 0,
        results: [
          { parameter: 'СРБ', value: '45 мг/л', normalRange: '<5', isAbnormal: true, interpretation: 'Выраженное воспаление' },
        ],
      },
      {
        id: 'usg_app',
        name: 'УЗИ органов брюшной полости',
        category: 'imaging',
        synonyms: ['узи', 'узи живота', 'узи брюшной полости'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Аппендикс', value: 'Диаметр 10 мм, утолщение стенки, гиперемия окружающей клетчатки', normalRange: '<6 мм', isAbnormal: true, interpretation: 'Признаки острого аппендицита' },
          { parameter: 'Свободная жидкость', value: 'Небольшое количество в правом подвздошном углу', normalRange: 'Отсутствует', isAbnormal: true, interpretation: 'Воспалительный экссудат' },
        ],
      },
      {
        id: 'urine_app',
        name: 'Общий анализ мочи',
        category: 'lab',
        synonyms: ['оам', 'моча общий'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Лейкоциты', value: '2-3 в п/зр', normalRange: '<5', isAbnormal: false, interpretation: 'В пределах нормы' },
        ],
      },
    ],
    correctDiagnosis: ['Острый аппендицит', 'Аппендицит'],
    correctTreatment: {
      drugs: [
        { name: 'Цефтриаксон', dose: '2 г', route: 'в/в', duration: 'периоперационно' },
        { name: 'Метронидазол', dose: '500 мг', route: 'в/в', duration: 'периоперационно' },
        { name: 'Кеторолак', dose: '30 мг', route: 'в/м', duration: 'при боли' },
      ],
      procedures: ['Лапароскопическая аппендэктомия'],
      regimen: 'bed',
      diet: 'Голодание до операции, затем щадящая диета',
      contraindications: ['Слабительные', 'Грелка на живот', 'НПВС до операции'],
    },
    explanation:
      'Острый аппендицит — классическая картина: боль вокруг пупка с миграцией в правую подвздошную область, лихорадка, лейкоцитоз, положительные симптомы раздражения брюшины. УЗИ подтверждает диагноз. Лечение — экстренная аппендэктомия, антибиотикопрофилактика.',
    complications: ['Перитонит', 'Абсцесс брюшной полости', 'Сепсис'],
  },
  {
    id: 5,
    patient: {
      name: 'Николаев Павел Сергеевич',
      age: 42,
      gender: 'male',
      occupation: 'Бухгалтер',
    },
    chiefComplaint: 'Интенсивная боль в верхней части живота, рвота',
    historyOfPresentIllness:
      'Вчера вечером на дне рождения употреблял алкоголь (водка ~300 мл) и жирную пищу. Ночью появилась тупая боль в эпигастрии. Утром боль усилилась, стала опоясывающей, отдаёт в спину. Многократная рвота желудочным содержимым, затем желчью — не приносит облегчения.',
    historyQuestions: [
      { id: 'q1', question: 'Алкоголь?', answer: 'Да, выпил много вчера, до этого не пил 2 недели', isClinicallySignificant: true },
      { id: 'q2', question: 'Жёлчные камни?', answer: '3 года назад УЗИ показало камни в ЖП, но не беспокоили', isClinicallySignificant: true },
      { id: 'q3', question: 'Панкреатит раньше?', answer: 'Нет, никогда', isClinicallySignificant: true },
      { id: 'q4', question: 'Стул?', answer: 'Сегодня не ходил', isClinicallySignificant: false },
      { id: 'q5', question: 'Приём лекарств?', answer: 'Нет', isClinicallySignificant: false },
      { id: 'q6', question: 'Наследственность?', answer: 'Отец — сахарный диабет 2 типа', isClinicallySignificant: false },
    ],
    vitals: {
      temperature: 37.5,
      heartRate: 110,
      bloodPressure: '100/70',
      respiratoryRate: 24,
      spo2: 95,
      height: 170,
      weight: 88,
    },
    physicalExam: [
      { region: 'general', finding: 'Состояние тяжёлое, бледность, холодный липкий пот, язык сухой, обложен серым налётом', isAbnormal: true },
      { region: 'abdomen', finding: 'Живот напряжён, резкая болезненность в эпигастрии и левом подреберье', isAbnormal: true },
      { region: 'abdomen', finding: 'Симптом Грея-Тёрнера отрицательный (нет геморрагий на боках)', isAbnormal: false },
      { region: 'abdomen', finding: 'Перистальтика отсутствует', isAbnormal: true },
      { region: 'skin', finding: 'Кожа бледная, влажная', isAbnormal: true },
    ],
    availableTests: [
      {
        id: 'amylase_panc',
        name: 'Амилаза, липаза крови',
        category: 'lab',
        synonyms: ['амилаза', 'липаза', 'панкреатические ферменты'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Амилаза', value: '420 Ед/л', normalRange: '<100', isAbnormal: true, interpretation: 'Повышена в 4 раза — острый панкреатит' },
          { parameter: 'Липаза', value: '850 Ед/л', normalRange: '<60', isAbnormal: true, interpretation: 'Повышена в 14 раз — высокая специфичность' },
        ],
      },
      {
        id: 'usg_panc',
        name: 'УЗИ органов брюшной полости',
        category: 'imaging',
        synonyms: ['узи', 'узи живота', 'узи брюшной полости'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Поджелудочная железа', value: 'Увеличена, неоднородная эхоструктура, жидкостные включения', normalRange: 'Норма', isAbnormal: true, interpretation: 'Отечная форма острого панкреатита' },
          { parameter: 'Жёлчный пузырь', value: 'Камни 3-5 мм', normalRange: 'Без камней', isAbnormal: true, interpretation: 'Калькулёзный холецистит — возможная причина' },
        ],
      },
      {
        id: 'fbc_panc',
        name: 'Общий анализ крови',
        category: 'lab',
        synonyms: ['оак', 'кровь общий'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Лейкоциты', value: '16 ×10⁹/л', normalRange: '4-9', isAbnormal: true, interpretation: 'Выраженный лейкоцитоз' },
          { parameter: 'Гематокрит', value: '48%', normalRange: '40-48', isAbnormal: true, interpretation: 'Гемоконцентрация' },
        ],
      },
      {
        id: 'glucose_panc',
        name: 'Глюкоза крови',
        category: 'lab',
        synonyms: ['сахар', 'глюкоза'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Глюкоза', value: '9.2 ммоль/л', normalRange: '<6.1', isAbnormal: true, interpretation: 'Гипергликемия — повреждение островков Лангерганса' },
        ],
      },
      {
        id: 'calcium_panc',
        name: 'Кальций крови',
        category: 'lab',
        synonyms: ['кальций', 'ca'],
        turnaroundTime: 1,
        results: [
          { parameter: 'Кальций ионизированный', value: '0.95 ммоль/л', normalRange: '1.15-1.30', isAbnormal: true, interpretation: 'Гипокальциемия — признак тяжести' },
        ],
      },
    ],
    correctDiagnosis: ['Острый панкреатит', 'Панкреатит'],
    correctTreatment: {
      drugs: [
        { name: 'Рингера лактат', dose: '2000-3000 мл', route: 'в/в', duration: 'инфузионная терапия' },
        { name: 'Трамадол', dose: '100 мг', route: 'в/м', duration: 'при боли' },
        { name: 'Омепразол', dose: '40 мг', route: 'в/в', duration: '2 р/день' },
        { name: 'Цефтриаксон', dose: '2 г', route: 'в/в', duration: '1 р/день' },
      ],
      regimen: 'bed',
      diet: 'Голодание, назогастральный зонд, парентеральное питание',
      contraindications: ['Пероральное питание', 'Морфин (спазм сфинктера Одди)', 'Атропин'],
    },
    explanation:
      'Острый панкреатит — классическая триада: обильный приём алкоголя + жирная пища, интенсивная опоясывающая боль в эпигастрии, многократная рвота. Амилаза и липаза повышены в 4-14 раз. УЗИ: отёчная железа. Лечение: инфузионная терапия, обезболивание, ингибиторы протонной помпы, антибиотики при инфицированном некрозе.',
    complications: ['Панкреонекроз', 'Инфицированный некроз', 'Сепсис', 'Дыхательная недостаточность'],
  },
  {
    id: 6,
    patient: {
      name: 'Волкова Елена Дмитриевна',
      age: 28,
      gender: 'female',
      occupation: 'Дизайнер',
    },
    chiefComplaint: 'Приступ удушья, кашель, свистящее дыхание',
    historyOfPresentIllness:
      'Бронхиальная астма с 12 лет. Обычно контролируется ингалятором (сальбутамол). Вчера на улице цвела амброзия, сегодня ночью проснулась от удушья. Одышка экспираторного характера, не может говорить полными фразами. Ингалятор салбутамола помог слабо, эффект длится менее 2 часов.',
    historyQuestions: [
      { id: 'q1', question: 'Триггеры?', answer: 'Амброзия, холодный воздух, физическая нагрузка', isClinicallySignificant: true },
      { id: 'q2', question: 'Приём базисной терапии?', answer: 'Нет, считает что ингалятор «по необходимости» достаточно', isClinicallySignificant: true },
      { id: 'q3', question: 'Госпитализации?', answer: '2 года назад — обострение, 3 дня в больнице', isClinicallySignificant: true },
      { id: 'q4', question: 'Курение?', answer: 'Нет, никогда', isClinicallySignificant: false },
      { id: 'q5', question: 'Аллергия?', answer: 'Пыльца амброзии, берёзы, кошки', isClinicallySignificant: true },
      { id: 'q6', question: 'Приём преднизолона?', answer: 'Нет, не принимала', isClinicallySignificant: true },
    ],
    vitals: {
      temperature: 36.7,
      heartRate: 118,
      bloodPressure: '130/85',
      respiratoryRate: 28,
      spo2: 89,
      height: 165,
      weight: 58,
    },
    physicalExam: [
      { region: 'general', finding: 'Беспокойное состояние, вынужденное положение сидя с упором на руки, цианоз ногтевых лож', isAbnormal: true },
      { region: 'chest', finding: 'Грудная клетка вздута, участвуют вспомогательные мышцы дыхания', isAbnormal: true },
      { region: 'chest', finding: 'Аускультация: рассеянные сухие свистящие хрипы по всем полям, вдох укорочен', isAbnormal: true },
      { region: 'chest', finding: 'Перкуссия: коробочный звук', isAbnormal: true },
      { region: 'skin', finding: 'Кожа бледная, влажная', isAbnormal: true },
    ],
    availableTests: [
      {
        id: 'spo2_asthma',
        name: 'Пульсоксиметрия',
        category: 'other',
        synonyms: ['spo2', 'пульсоксиметр', 'кислород'],
        turnaroundTime: 0,
        results: [
          { parameter: 'SpO2', value: '89%', normalRange: '>95', isAbnormal: true, interpretation: 'Гипоксемия — тяжёлое обострение' },
          { parameter: 'Пульс', value: '118 уд/мин', normalRange: '60-100', isAbnormal: true, interpretation: 'Тахикардия' },
        ],
      },
      {
        id: 'peak_flow',
        name: 'Пикфлоуметрия',
        category: 'other',
        synonyms: ['пикфлоу', 'пиковая скорость', 'дозированный аэрозоль'],
        turnaroundTime: 0,
        results: [
          { parameter: 'ПСВ', value: '180 л/мин', normalRange: '>400', isAbnormal: true, interpretation: 'Снижена более чем в 2 раза — тяжёлое обострение' },
        ],
      },
      {
        id: 'blood_gas_asthma',
        name: 'Газы крови',
        category: 'lab',
        synonyms: ['газы', 'кровь газовый'],
        turnaroundTime: 0,
        results: [
          { parameter: 'pO2', value: '62 мм рт.ст.', normalRange: '>80', isAbnormal: true, interpretation: 'Гипоксемия' },
          { parameter: 'pCO2', value: '48 мм рт.ст.', normalRange: '35-45', isAbnormal: true, interpretation: 'Гиперкапния — признак усталости дыхательных мышц' },
          { parameter: 'pH', value: '7.32', normalRange: '7.35-7.45', isAbnormal: true, interpretation: 'Респираторный ацидоз' },
        ],
      },
      {
        id: 'fbc_asthma',
        name: 'Общий анализ крови',
        category: 'lab',
        synonyms: ['оак', 'кровь общий'],
        turnaroundTime: 0,
        results: [
          { parameter: 'Лейкоциты', value: '9.5 ×10⁹/л', normalRange: '4-9', isAbnormal: false, interpretation: 'Незначительный лейкоцитоз' },
          { parameter: 'Эозинофилы', value: '8%', normalRange: '<5', isAbnormal: true, interpretation: 'Эозинофилия — аллергический компонент' },
        ],
      },
      {
        id: 'xray_asthma',
        name: 'Рентген грудной клетки',
        category: 'imaging',
        synonyms: ['рентген', 'рентген лёгких', 'флюорография'],
        turnaroundTime: 1,
        results: [
          { parameter: 'Лёгочные поля', value: 'Гиперинфляция, плоские купола диафрагмы', normalRange: 'Норма', isAbnormal: true, interpretation: 'Гиперинфляция — хроническое обструктивное изменение' },
        ],
      },
    ],
    correctDiagnosis: ['Обострение бронхиальной астмы', 'Бронхиальная астма', 'Астматический статус'],
    correctTreatment: {
      drugs: [
        { name: 'Кислород', dose: '4-6 л/мин', route: 'назальная канюля', duration: 'до нормализации SpO2' },
        { name: 'Сальбутамол', dose: '2.5 мг', route: 'ингаляционно через небулайзер', duration: 'каждые 20 мин' },
        { name: 'Ипратропий бромид', dose: '0.5 мг', route: 'ингаляционно', duration: 'каждые 20 мин' },
        { name: 'Преднизолон', dose: '60 мг', route: 'в/в', duration: '1 р/день, затем перорально' },
        { name: 'Магния сульфат', dose: '1.2-2 г', route: 'в/в', duration: 'однократно при тяжёлом течении' },
      ],
      regimen: 'bed',
      diet: 'Щадящая, исключение аллергенов',
      contraindications: ['Бета-блокаторы', 'Морфин', 'Седативные препараты'],
    },
    explanation:
      'Тяжёлое обострение бронхиальной астмы: экспираторная одышка, свистящие хрипы, гипоксемия (SpO2 89%), гиперкапния (pCO2 48) — признак усталости дыхательных мышц. Лечение: кислород, ингаляционные бронходилататоры (сальбутамол + ипратропий) каждые 20 мин, системные ГКС (преднизолон), магния сульфат при тяжёлом течении. Госпитализация в реанимацию.',
    complications: ['Астматический статус', 'Дыхательная недостаточность', 'Пневмоторакс'],
  },
];

export function getRandomSimulationCase(): SimulationCase {
  return simulationCases[Math.floor(Math.random() * simulationCases.length)];
}

export function getAllSimulationDiagnoses(): string[] {
  const set = new Set<string>();
  simulationCases.forEach((c) => c.correctDiagnosis.forEach((d) => set.add(d)));
  return Array.from(set).sort();
}
