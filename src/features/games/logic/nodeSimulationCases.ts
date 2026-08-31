import type { NodeScenario } from '../../../types/nodeSimulation';

// =============================================================================
// КЕЙС 1: ОСТРЫЙ КОРОНАРНЫЙ СИНДРОМ (медсестра)
// =============================================================================
export const NURSE_OKS: NodeScenario = {
  id: 'nurse-oks',
  title: 'Острый коронарный синдром',
  difficulty: 'medium',
  role: 'nurse',
  description: 'Мужчина 52 года с сдавливающей болью за грудиной. Классическая картина ОКС с возможными осложнениями.',
  tags: ['Кардиология', 'ABC', 'ЭКГ', 'Мониторинг'],
  startNode: 'start',
  initialPatient: {
    name: 'Алексей В.',
    age: '52 года',
    avatar: '👨',
    gender: 'male',
    consciousness: 4,
    consciousnessText: 'Ясное',
    vitals: { bp_sys: 165, bp_dia: 105, pulse: 108, spo2: 93, rr: 22, temp: 36.4, pain: 8 },
    skin: 'Бледная, влажная',
    status: 'warning'
  },
  inventory: ['Тонометр', 'Пульсоксиметр', 'Стетоскоп', 'ЭКГ-аппарат', 'В/в катетер', 'Нитроглицерин', 'Морфин', 'Аспирин', 'Кислородная маска', 'Монитор'],
  nodes: {
    start: {
      title: 'Поступление пациента',
      text: 'В приемный покой самостоятельно пришел мужчина, 52 года. Жалуется на сдавливающую боль за грудиной, возникшую 20 минут назад в покое. Бледный, холодный пот. Что вы делаете в первую очередь?',
      hint: 'Вспомните алгоритм ABC. Прежде чем что-то давать или назначать — нужно оценить базовые функции.',
      timeLimit: 30,
      options: [
        {
          text: 'Оцениваю сознание, дыхание, пульс и готовлюсь измерить АД',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 2, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'abc_done',
            log: 'Проведена первичная оценка по ABC'
          },
          feedback: '✅ Правильно! Прежде чем что-либо предпринимать, необходима первичная оценка по алгоритму ABC (Airway, Breathing, Circulation).'
        },
        {
          text: 'Даю таблетку нитроглицерина под язык',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { bp_sys: -15, bp_dia: -10, pain: -1, status: 'critical', consciousnessText: 'Ясное (головокружение)' },
            timeCost: 1,
            nextNode: 'nitro_complication',
            log: 'Нитроглицерин дан без оценки АД → артериальная гипотензия'
          },
          feedback: '❌ Опасно! При АД 165/105 нитроглицерин показан, но только после подтверждения отсутствия гипотонии и правостороннего инфаркта. При резком падении АД пациент может потерять сознание.'
        },
        {
          text: 'Отправляю в очередь к терапевту — жалобы типичные',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pain: 2, spo2: -2, pulse: 15, status: 'critical' },
            timeCost: 10,
            nextNode: 'queue_disaster',
            log: 'Пациент отправлен в очередь — состояние резко ухудшилось'
          },
          feedback: '❌ Критическая ошибка! Боль за грудиной с холодным потом — повод для немедленной оценки, а не очереди. Пациенты с ОКС умирают в коридорах.'
        }
      ]
    },
    abc_done: {
      title: 'Первичная оценка завершена',
      text: 'Пациент в сознании, дыхание затруднено, кожа бледная и влажная. Вы измерили жизненно важные показатели. Какие данные обязательно зафиксировать в сестринской карте?',
      hint: 'Вспомните стандарт документирования. Какие показатели фиксируются всегда?',
      timeLimit: 25,
      options: [
        {
          text: 'Фиксирую все показатели с точностью до времени измерения',
          correct: true,
          requires: ['Тонометр'],
          effects: {
            score: { diagnosis: 1, treatment: 0, docs: 2, comm: 0 },
            patient: {},
            timeCost: 3,
            nextNode: 'docs_done',
            log: 'Все ВЖД зафиксированы с временной меткой'
          },
          feedback: '✅ Верно! Все ВЖД фиксируются с временной меткой. SpO₂ 93% — тревожный знак (норма ≥95%). Документация contemporaneous — в момент оказания помощи.'
        },
        {
          text: 'Записываю только АД и пульс — главные показатели',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 1, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'docs_partial',
            log: 'Зафиксированы только АД и пульс'
          },
          feedback: '⚠️ Частично верно, но недостаточно. При острой боли/ишемии важны все параметры, включая SpO₂ и ЧДД. Неполная документация — риск для пациента и юридическая уязвимость.'
        },
        {
          text: 'Запоминаю наизусть, запишу после приема врача',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'docs_missing',
            log: 'Документация отложена'
          },
          feedback: '❌ Недопустимо! Документирование должно быть contemporaneous — в момент оказания помощи. Память обманывает в стрессе. Неподписанная/отсутствующая запись — недействительна в суде.'
        }
      ]
    },
    nitro_complication: {
      title: 'Осложнение: гипотензия',
      text: 'После нитроглицерина АД пациента упало до 95/65 мм рт.ст. Появилось головокружение, кожа стала бледнее. Это осложнение требует немедленных действий. Что делаете?',
      hint: 'При ортостатической гипотензии от нитратов — положение Тренделенбурга и жидкость.',
      timeLimit: 20,
      options: [
        {
          text: 'Укладываю в горизонтальное положение с приподнятыми ногами, подключаю к монитору, вызываю врача',
          correct: true,
          requires: ['Монитор'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { bp_sys: 15, bp_dia: 10, status: 'warning' },
            timeCost: 3,
            nextNode: 'recovery_after_nitro',
            log: 'Пациент уложен, мониторинг восстановлен'
          },
          feedback: '✅ Правильно! Положение Тренделенбурга (ноги выше головы) улучшает венозный возврат. Мониторинг обязателен. Вызов врача — необходим.'
        },
        {
          text: 'Даю еще одну таблетку нитроглицерина — боль ведь не прошла',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { bp_sys: -30, bp_dia: -20, consciousness: 2, status: 'critical', consciousnessText: 'Спутанное' },
            timeCost: 2,
            nextNode: 'shock_state',
            log: 'Повторный нитроглицерин → коллапс'
          },
          feedback: '❌ Катастрофа! Повторный нитрат при уже снизившемся АД вызвал коллапс. Пациент в шоке. Это может быть летальным.'
        },
        {
          text: 'Даю пациенту воды и предлагаю подышать свежим воздухом',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { bp_sys: -10, status: 'critical' },
            timeCost: 5,
            nextNode: 'shock_state',
            log: 'Промедление → шок'
          },
          feedback: '❌ Недостаточно! При гипотензии нужна активная позиционная терапия и мониторинг. Вода и воздух — не помогут при сосудистом коллапсе.'
        }
      ]
    },
    queue_disaster: {
      title: 'КРИТИЧЕСКОЕ УХУДШЕНИЕ',
      text: 'Пока пациент ждал в коридоре, состояние резко ухудшилось. Пациент потерял сознание, дыхание поверхностное, пульс нитевидный. Что делаете?',
      hint: 'Это клиническая смерть. Алгоритм BLS — СЛР.',
      timeLimit: 15,
      options: [
        {
          text: 'Начинаю СЛР: 30 компрессий грудной клетки, 2 вдоха, вызываю реанимационную бригаду',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 2, treatment: 2, docs: 0, comm: 1 },
            patient: { pulse: 40, consciousness: 1, consciousnessText: 'Без сознания', status: 'critical' },
            timeCost: 2,
            nextNode: 'cpr_started',
            log: 'Начата СЛР, вызвана реанимация'
          },
          feedback: '✅ Единственно правильное действие! При клинической смерти — немедленная СЛР. Каждая минута промедления снижает шансы на выживание на 7-10%.'
        },
        {
          text: 'Бегу за врачом, оставляя пациента',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 0, consciousness: 0, status: 'critical' },
            timeCost: 3,
            nextNode: 'patient_died',
            log: 'Пациент оставлен без СЛР → асистолия'
          },
          feedback: '❌ Смертельная ошибка! Никогда не оставляйте пациента без сознания без помощи. Крикните о помощи, но начинайте СЛР немедленно.'
        },
        {
          text: 'Пытаюсь привести в чувство нашатырным спиртом',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 0, consciousness: 0, status: 'critical' },
            timeCost: 2,
            nextNode: 'patient_died',
            log: 'Нашатырь вместо СЛР → асистолия'
          },
          feedback: '❌ Нашатырь не поможет при остановке сердца! Это архаичный метод, не имеющий места в современной реанимации.'
        }
      ]
    },
    docs_done: {
      title: 'Клиническое мышление',
      text: 'АД 165/105, пульс 108, SpO₂ 93%. Боль не купируется. Ваши действия?',
      hint: 'При подозрении на ОКС — «золотое правило»: ЭКГ в течение 10 минут.',
      timeLimit: 25,
      options: [
        {
          text: 'Подключаю к монитору, готовлю ЭКГ-аппарат, вызываю врача, обеспечиваю покой',
          correct: true,
          requires: ['ЭКГ-аппарат', 'Монитор'],
          effects: {
            score: { diagnosis: 2, treatment: 1, docs: 0, comm: 1 },
            patient: { spo2: 2, status: 'warning' },
            timeCost: 4,
            nextNode: 'ekg_done',
            log: 'Мониторинг, ЭКГ, вызов врача'
          },
          feedback: '✅ Идеально! При подозрении на ОКС — немедленная ЭКГ в течение 10 минут, мониторинг, покой. SpO₂ 93% — нужна кислородная поддержка.'
        },
        {
          text: 'Даю анальгетик и предлагаю подождать врача в коридоре',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pain: -2, spo2: -3, pulse: 20, status: 'critical' },
            timeCost: 8,
            nextNode: 'queue_disaster',
            log: 'Анальгетик + коридор → ухудшение'
          },
          feedback: '❌ Грубейшая ошибка! Маскировка симптомов анальгетиком без диагностики опасна. Пациенту нужен покой, ЭКГ и мониторинг.'
        },
        {
          text: 'Начинаю в/в доступ и ввожу метопролол для снижения АД',
          correct: false,
          requires: ['В/в катетер'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: -20, bp_sys: -20, status: 'critical' },
            timeCost: 3,
            nextNode: 'beta_blocker_crisis',
            log: 'Самостоятельное введение метопролола → брадикардия'
          },
          feedback: '❌ Опасно! Бета-блокаторы при острой ишемии назначает только врач после ЭКГ. Самостоятельное вмешательство запрещено. У пациента развилась брадикардия.'
        }
      ]
    },
    docs_partial: {
      title: 'Клиническое мышление',
      text: 'АД 165/105, пульс 108, SpO₂ 93%. Боль не купируется. Ваши действия?',
      hint: 'При подозрении на ОКС — «золотое правило»: ЭКГ в течение 10 минут.',
      timeLimit: 25,
      options: [
        {
          text: 'Подключаю к монитору, готовлю ЭКГ-аппарат, вызываю врача, обеспечиваю покой',
          correct: true,
          requires: ['ЭКГ-аппарат', 'Монитор'],
          effects: {
            score: { diagnosis: 2, treatment: 1, docs: 0, comm: 1 },
            patient: { spo2: 2, status: 'warning' },
            timeCost: 4,
            nextNode: 'ekg_done',
            log: 'Мониторинг, ЭКГ, вызов врача'
          },
          feedback: '✅ Идеально!'
        },
        {
          text: 'Даю анальгетик и предлагаю подождать врача в коридоре',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pain: -2, spo2: -3, pulse: 20, status: 'critical' },
            timeCost: 8,
            nextNode: 'queue_disaster',
            log: 'Анальгетик + коридор → ухудшение'
          },
          feedback: '❌ Грубейшая ошибка!'
        },
        {
          text: 'Начинаю в/в доступ и ввожу метопролол для снижения АД',
          correct: false,
          requires: ['В/в катетер'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: -20, bp_sys: -20, status: 'critical' },
            timeCost: 3,
            nextNode: 'beta_blocker_crisis',
            log: 'Самостоятельное введение метопролола → брадикардия'
          },
          feedback: '❌ Опасно!'
        }
      ]
    },
    docs_missing: {
      title: 'Клиническое мышление',
      text: 'АД 165/105, пульс 108, SpO₂ 93%. Боль не купируется. Ваши действия?',
      hint: 'При подозрении на ОКС — «золотое правило»: ЭКГ в течение 10 минут.',
      timeLimit: 25,
      options: [
        {
          text: 'Подключаю к монитору, готовлю ЭКГ-аппарат, вызываю врача, обеспечиваю покой',
          correct: true,
          requires: ['ЭКГ-аппарат', 'Монитор'],
          effects: {
            score: { diagnosis: 2, treatment: 1, docs: 0, comm: 1 },
            patient: { spo2: 2, status: 'warning' },
            timeCost: 4,
            nextNode: 'ekg_done',
            log: 'Мониторинг, ЭКГ, вызов врача'
          },
          feedback: '✅ Идеально!'
        },
        {
          text: 'Даю анальгетик и предлагаю подождать врача в коридоре',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pain: -2, spo2: -3, pulse: 20, status: 'critical' },
            timeCost: 8,
            nextNode: 'queue_disaster',
            log: 'Анальгетик + коридор → ухудшение'
          },
          feedback: '❌ Грубейшая ошибка!'
        },
        {
          text: 'Начинаю в/в доступ и ввожу метопролол для снижения АД',
          correct: false,
          requires: ['В/в катетер'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: -20, bp_sys: -20, status: 'critical' },
            timeCost: 3,
            nextNode: 'beta_blocker_crisis',
            log: 'Самостоятельное введение метопролола → брадикардия'
          },
          feedback: '❌ Опасно!'
        }
      ]
    },
    recovery_after_nitro: {
      title: 'Стабилизация после осложнения',
      text: 'АД восстанавливается (110/75), но боль за грудиной сохраняется. Пациент в сознании. Какие дальнейшие действия?',
      hint: 'После стабилизации — диагностика и мониторинг.',
      timeLimit: 25,
      options: [
        {
          text: 'Подключаю ЭКГ, мониторинг, кислород, вызываю врача',
          correct: true,
          requires: ['ЭКГ-аппарат', 'Монитор', 'Кислородная маска'],
          effects: {
            score: { diagnosis: 2, treatment: 1, docs: 0, comm: 1 },
            patient: { spo2: 4, status: 'warning' },
            timeCost: 4,
            nextNode: 'ekg_done',
            log: 'ЭКГ, мониторинг, кислородотерапия'
          },
          feedback: '✅ Правильно! После стабилизации АД — немедленная диагностика. Кислород показан при SpO₂ < 95%.'
        },
        {
          text: 'Даю аспирин 325 мг жевать',
          correct: false,
          requires: ['Аспирин'],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'aspirin_only',
            log: 'Дан аспирин без ЭКГ'
          },
          feedback: '⚠️ Аспирин показан при ОКС, но без ЭКГ вы не можете подтвердить диагноз. Прием аспирина — правильно, но недостаточно. Нужна ЭКГ и врач.'
        },
        {
          text: 'Оставляю под наблюдением медсестры, иду к другому пациенту',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -3, pulse: 15, status: 'critical' },
            timeCost: 10,
            nextNode: 'queue_disaster',
            log: 'Пациент оставлен без мониторинга → ухудшение'
          },
          feedback: '❌ Недопустимо! Пациент с подозрением на ОКС требует постоянного мониторинга до прихода врача.'
        }
      ]
    },
    ekg_done: {
      title: 'Коммуникация с врачом',
      text: 'Врач пришел. Как вы правильно передадите информацию о пациенте?',
      hint: 'Вспомните структурированный алгоритм передачи информации.',
      timeLimit: 20,
      options: [
        {
          text: 'По структуре SBAR: Situation, Background, Assessment, Recommendation',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 2 },
            patient: {},
            timeCost: 3,
            nextNode: 'sbar_done',
            log: 'Информация передана по SBAR'
          },
          feedback: '✅ Отлично! SBAR — международный стандарт передачи информации между медперсоналом. Структурированно, ничего не упущено.'
        },
        {
          text: 'Говорю всё, что знаю, в хронологическом порядке',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 1 },
            patient: {},
            timeCost: 4,
            nextNode: 'sbar_partial',
            log: 'Информация передана хаотично'
          },
          feedback: '⚠️ Информация есть, но без структуры врач может потерять время на выделение главного. SBAR экономит время.'
        },
        {
          text: 'Передаю только: "Боль в сердце, ждет вас"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'sbar_poor',
            log: 'Недостаточная передача информации'
          },
          feedback: '❌ Недостаточно! Врач не получает ключевых данных (ВЖД, время начала, динамика). Это замедляет принятие решений.'
        }
      ]
    },
    sbar_done: {
      title: 'Документирование',
      text: 'Пациент направлен в кардиологическое отделение. Что вы делаете с сестринской документацией?',
      hint: 'Документация — юридический документ. Кто оказывал помощь — тот и пишет.',
      timeLimit: 20,
      options: [
        {
          text: 'Заполняю все поля, ставлю подпись, дату и время, передаю в архив',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 2, comm: 0 },
            patient: {},
            timeCost: 5,
            nextNode: 'finish_good',
            log: 'Документация завершена корректно'
          },
          feedback: '✅ Правильно! Документация — юридический документ. Неподписанная запись недействительна. Время, подпись, печать — обязательны.'
        },
        {
          text: 'Устно передаю коллеге, пусть дописывает',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'finish_poor',
            log: 'Документация передана устно — нарушение'
          },
          feedback: '❌ Нарушение! Документы ведет тот, кто оказывал помощь. Устная передача искажает факты. Это дисциплинарное нарушение.'
        },
        {
          text: 'Оставляю на столе, врач сам разберется',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'finish_poor',
            log: 'Документация брошена — грубое нарушение'
          },
          feedback: '❌ Недопустимо! Документация — ответственность медсестры. Незаполненные документы — претензии и риски для пациента.'
        }
      ]
    },
    sbar_partial: {
      title: 'Документирование',
      text: 'Пациент направлен в кардиологическое отделение. Что вы делаете с сестринской документацией?',
      timeLimit: 20,
      options: [
        {
          text: 'Заполняю все поля, ставлю подпись, дату и время, передаю в архив',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 2, comm: 0 },
            patient: {},
            timeCost: 5,
            nextNode: 'finish_medium',
            log: 'Документация завершена корректно'
          },
          feedback: '✅ Правильно!'
        },
        {
          text: 'Устно передаю коллеге, пусть дописывает',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'finish_poor',
            log: 'Документация передана устно — нарушение'
          },
          feedback: '❌ Нарушение!'
        },
        {
          text: 'Оставляю на столе, врач сам разберется',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'finish_poor',
            log: 'Документация брошена — грубое нарушение'
          },
          feedback: '❌ Недопустимо!'
        }
      ]
    },
    sbar_poor: {
      title: 'Документирование',
      text: 'Пациент направлен в кардиологическое отделение. Что вы делаете с сестринской документацией?',
      timeLimit: 20,
      options: [
        {
          text: 'Заполняю все поля, ставлю подпись, дату и время, передаю в архив',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 2, comm: 0 },
            patient: {},
            timeCost: 5,
            nextNode: 'finish_poor',
            log: 'Документация завершена корректно'
          },
          feedback: '✅ Правильно, но коммуникация с врачом была слабой.'
        },
        {
          text: 'Устно передаю коллеге, пусть дописывает',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'finish_poor',
            log: 'Документация передана устно — нарушение'
          },
          feedback: '❌ Нарушение!'
        },
        {
          text: 'Оставляю на столе, врач сам разберется',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'finish_poor',
            log: 'Документация брошена — грубое нарушение'
          },
          feedback: '❌ Недопустимо!'
        }
      ]
    },
    shock_state: {
      title: 'КРИТИЧЕСКОЕ СОСТОЯНИЕ',
      text: 'Пациент в шоке. АД не определяется, пульс нитевидный, сознание спутанное. Это требует немедленной реанимации. Что делаете?',
      timeLimit: 15,
      options: [
        {
          text: 'Начинаю СЛР, вызываю реанимацию, готовлю дефибриллятор',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { pulse: 30, consciousness: 1, consciousnessText: 'Без сознания', status: 'critical' },
            timeCost: 2,
            nextNode: 'cpr_started',
            log: 'Начата реанимация'
          },
          feedback: '✅ Правильно! При кардиогенном шоке — немедленная реанимация и вызов бригады.'
        },
        {
          text: 'Ввожу адреналин в/в струйно',
          correct: false,
          requires: ['В/в катетер'],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: { pulse: 10, status: 'critical' },
            timeCost: 2,
            nextNode: 'patient_died',
            log: 'Адреналин без СЛР — недостаточно'
          },
          feedback: '❌ Недостаточно! Адреналин важен, но без компрессий грудной клетки и ИВЛ он не дойдет до мозга.'
        },
        {
          text: 'Жду врача — я не имею права действовать самостоятельно',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 0, consciousness: 0, status: 'critical' },
            timeCost: 3,
            nextNode: 'patient_died',
            log: 'Промедление → летальный исход'
          },
          feedback: '❌ Смертельная ошибка! Медсестра обязана начать BLS немедленно. Каждая минута промедления снижает шансы на 7-10%.'
        }
      ]
    },
    beta_blocker_crisis: {
      title: 'Осложнение: брадикардия',
      text: 'После метопролола пульс упал до 45 уд/мин. АД 95/60. Пациент жалуется на слабость, появилась одышка. Что делаете?',
      timeLimit: 20,
      options: [
        {
          text: 'Отменяю метопролол, подключаю монитор, вызываю врача, готовлю атропин',
          correct: true,
          requires: ['Монитор'],
          effects: {
            score: { diagnosis: 1, treatment: 1, docs: 0, comm: 1 },
            patient: { pulse: 15, bp_sys: 10, status: 'warning' },
            timeCost: 3,
            nextNode: 'brady_recovery',
            log: 'Отмена бета-блокатора, мониторинг, вызов врача'
          },
          feedback: '✅ Правильно! Отмена препарата — первый шаг. Мониторинг, вызов врача, готовность к введению атропина.'
        },
        {
          text: 'Даю еще метопролола — нужно снизить АД',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: -20, bp_sys: -15, consciousness: 3, status: 'critical', consciousnessText: 'Спутанное' },
            timeCost: 2,
            nextNode: 'shock_state',
            log: 'Передозировка метопролола → коллапс'
          },
          feedback: '❌ Катастрофа! Повторный бета-блокатор при брадикардии вызвал асистолию. Пациент в коллапсе.'
        },
        {
          text: 'Предлагаю лечь и отдохнуть — само пройдет',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: -15, bp_sys: -10, status: 'critical' },
            timeCost: 5,
            nextNode: 'shock_state',
            log: 'Ожидание → ухудшение'
          },
          feedback: '❌ Брадикардия 45 уд/мин — это не пройдет само. Нужен мониторинг и врач.'
        }
      ]
    },
    brady_recovery: {
      title: 'Стабилизация',
      text: 'Пульс восстанавливается (62 уд/мин), АД 115/75. Пациент в сознании. Боль за грудиной сохраняется. Дальнейшие действия?',
      timeLimit: 25,
      options: [
        {
          text: 'ЭКГ, мониторинг, кислород, вызов врача, аспирин',
          correct: true,
          requires: ['ЭКГ-аппарат', 'Монитор', 'Кислородная маска', 'Аспирин'],
          effects: {
            score: { diagnosis: 2, treatment: 1, docs: 0, comm: 1 },
            patient: { spo2: 4, status: 'warning' },
            timeCost: 5,
            nextNode: 'ekg_done',
            log: 'Полный комплекс мер по ОКС'
          },
          feedback: '✅ Отлично! После стабилизации — полный протокол ОКС: ЭКГ, мониторинг, кислород, аспирин, врач.'
        },
        {
          text: 'Оставляю под наблюдением, жду врача',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -2, pulse: 10, status: 'critical' },
            timeCost: 8,
            nextNode: 'queue_disaster',
            log: 'Пассивное ожидание → ухудшение'
          },
          feedback: '❌ Недостаточно! Пассивное ожидание без активных мер опасно. Нужна ЭКГ и мониторинг.'
        },
        {
          text: 'Даю валидол — он помогает при боли в сердце',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'valiodol_path',
            log: 'Валидол — плацебо'
          },
          feedback: '❌ Валидол — плацебо. Он не влияет на ишемию миокарда. Это потеря времени.'
        }
      ]
    },
    aspirin_only: {
      title: 'Продолжение',
      text: 'Аспирин принят. Боль сохраняется. Пациент просит что-то еще. Что делаете?',
      timeLimit: 25,
      options: [
        {
          text: 'Подключаю ЭКГ, монитор, кислород, вызываю врача',
          correct: true,
          requires: ['ЭКГ-аппарат', 'Монитор', 'Кислородная маска'],
          effects: {
            score: { diagnosis: 2, treatment: 1, docs: 0, comm: 1 },
            patient: { spo2: 4, status: 'warning' },
            timeCost: 4,
            nextNode: 'ekg_done',
            log: 'ЭКГ, мониторинг, кислород, врач'
          },
          feedback: '✅ Правильно! Аспирин — хорошо, но недостаточно. Нужна ЭКГ и мониторинг.'
        },
        {
          text: 'Даю еще аспирина — может, не хватило дозы',
          correct: false,
          requires: ['Аспирин'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'warning' },
            timeCost: 2,
            nextNode: 'aspirin_overdose',
            log: 'Повторный аспирин — передозировка'
          },
          feedback: '❌ Передозировка аспирина опасна! Кровотечение, язва. Достаточно одной дозы 325 мг.'
        },
        {
          text: 'Предлагаю подождать — аспирин должен подействовать',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -3, pulse: 15, status: 'critical' },
            timeCost: 10,
            nextNode: 'queue_disaster',
            log: 'Ожидание → ухудшение'
          },
          feedback: '❌ Аспирин не купирует боль мгновенно. Ожидание опасно при ОКС.'
        }
      ]
    },
    valiodol_path: {
      title: 'Потеря времени',
      text: 'Валидол не помог. Прошло 15 минут. Состояние пациента ухудшается. SpO₂ 89%, пульс 120. Что делаете?',
      timeLimit: 20,
      options: [
        {
          text: 'Срочно ЭКГ, монитор, кислород, вызов врача',
          correct: true,
          requires: ['ЭКГ-аппарат', 'Монитор', 'Кислородная маска'],
          effects: {
            score: { diagnosis: 1, treatment: 1, docs: 0, comm: 1 },
            patient: { spo2: 3, status: 'warning' },
            timeCost: 4,
            nextNode: 'ekg_done',
            log: 'ЭКГ, мониторинг, кислород — с опозданием'
          },
          feedback: '✅ Хотя и с опозданием — правильные действия. Валидол потерял драгоценное время.'
        },
        {
          text: 'Даю еще валидола — может, не хватило',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -4, pulse: 20, status: 'critical' },
            timeCost: 5,
            nextNode: 'queue_disaster',
            log: 'Валидол вместо реальных мер → ухудшение'
          },
          feedback: '❌ Валидол — плацебо. Повторная доза — еще больше потерянного времени.'
        },
        {
          text: 'Отправляю домой — "просто невралгия"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 0, consciousness: 0, status: 'critical' },
            timeCost: 1,
            nextNode: 'patient_died',
            log: 'Отправка домой → летальный исход'
          },
          feedback: '❌ Смертельная ошибка! Отправка пациента с ОКС домой — преступная халатность.'
        }
      ]
    },
    aspirin_overdose: {
      title: 'Передозировка аспирина',
      text: 'Пациент пожаловался на тошноту, жжение в желудке. Это побочные эффекты аспирина. Что делаете?',
      timeLimit: 20,
      options: [
        {
          text: 'Отменяю дальнейший прием аспирина, сообщаю врачу, наблюдаю за состоянием',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 1, docs: 0, comm: 1 },
            patient: { status: 'warning' },
            timeCost: 3,
            nextNode: 'ekg_done',
            log: 'Отмена аспирина, наблюдение'
          },
          feedback: '✅ Правильно! Отмена препарата, наблюдение, вызов врача. При необходимости — гастропротекторы.'
        },
        {
          text: 'Даю еще аспирина — боль ведь не прошла',
          correct: false,
          requires: ['Аспирин'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 2,
            nextNode: 'aspirin_toxic',
            log: 'Токсичность аспирина'
          },
          feedback: '❌ Токсичность аспирина! Тошнота, рвота, гипертермия, дезориентация. Нужна отмена и детоксикация.'
        },
        {
          text: 'Игнорирую — побочные эффекты аспирина нормальны',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 5,
            nextNode: 'aspirin_toxic',
            log: 'Игнорирование токсичности'
          },
          feedback: '❌ Нельзя игнорировать побочные эффекты! Особенно при передозировке.'
        }
      ]
    },
    aspirin_toxic: {
      title: 'Токсичность аспирина',
      text: 'Пациент рвет, потеет, дезориентирован. Температура 38.2°C. Это токсичность аспирина. Что делаете?',
      timeLimit: 15,
      options: [
        {
          text: 'Срочно вызываю врача, промываю желудок, начинаю инфузионную терапию',
          correct: true,
          requires: ['В/в катетер'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { temp: -0.5, status: 'warning' },
            timeCost: 5,
            nextNode: 'toxic_recovery',
            log: 'Детоксикация при токсичности аспирина'
          },
          feedback: '✅ Правильно! Промывание желудка, инфузионная терапия, щелочная диуреза — стандарт при токсичности салицилатов.'
        },
        {
          text: 'Даю активированный уголь',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 3,
            nextNode: 'patient_died',
            log: 'Только уголь — недостаточно'
          },
          feedback: '❌ Уголь — хорошо, но недостаточно при тяжелой токсичности. Нужна инфузионная терапия и врач.'
        },
        {
          text: 'Успокаиваю пациента — "само пройдет"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 5,
            nextNode: 'patient_died',
            log: 'Игнорирование → летальный исход'
          },
          feedback: '❌ Салицилатовая токсичность может быть летальной. Требуется активная детоксикация.'
        }
      ]
    },
    toxic_recovery: {
      title: 'Восстановление после токсичности',
      text: 'Состояние стабилизировалось. Тошнота прошла. Температура 37.5°C. Но боль за грудиной сохраняется. Что делаете?',
      timeLimit: 25,
      options: [
        {
          text: 'ЭКГ, мониторинг, кислород, вызов врача — основная проблема не решена',
          correct: true,
          requires: ['ЭКГ-аппарат', 'Монитор', 'Кислородная маска'],
          effects: {
            score: { diagnosis: 2, treatment: 1, docs: 0, comm: 1 },
            patient: { spo2: 4, status: 'warning' },
            timeCost: 4,
            nextNode: 'ekg_done',
            log: 'Возврат к протоколу ОКС'
          },
          feedback: '✅ Правильно! Токсичность купирована, но основная проблема — ОКС — не решена. Нужна ЭКГ и врач.'
        },
        {
          text: 'Оставляю под наблюдением — токсичность прошла, значит все хорошо',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -3, pulse: 15, status: 'critical' },
            timeCost: 10,
            nextNode: 'queue_disaster',
            log: 'Игнорирование ОКС → ухудшение'
          },
          feedback: '❌ Ошибка! Токсичность купирована, но ишемия миокарда продолжается. Это опасно.'
        },
        {
          text: 'Даю анальгетик — боль ведь мешает',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pain: -2, spo2: -2, status: 'critical' },
            timeCost: 5,
            nextNode: 'queue_disaster',
            log: 'Анальгетик вместо диагностики'
          },
          feedback: '❌ Анальгетик маскирует симптомы без лечения причины. Опасно при ОКС.'
        }
      ]
    },
    cpr_started: {
      title: 'Реанимация продолжается',
      text: 'СЛР проводится. Реанимационная бригада прибыла. Врач берет управление на себя. Пациент стабилизирован и направлен в реанимацию. Какие ваши дальнейшие действия?',
      timeLimit: 20,
      options: [
        {
          text: 'Заполняю всю документацию: время начала СЛР, все препараты, подпись, передаю в архив',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 2, comm: 1 },
            patient: {},
            timeCost: 5,
            nextNode: 'finish_critical',
            log: 'Документация СЛР завершена'
          },
          feedback: '✅ Правильно! Документация реанимации — критически важна. Время, препараты, дозы, подпись — все фиксируется.'
        },
        {
          text: 'Устно передаю врачу, что делала',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'finish_critical_poor',
            log: 'Устная передача — нарушение'
          },
          feedback: '❌ Нарушение! Реанимационная документация ведется в реальном времени. Устная передача недопустима.'
        },
        {
          text: 'Иду отдыхать — я устала после СЛР',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'finish_critical_poor',
            log: 'Документация не ведена'
          },
          feedback: '❌ Недопустимо! Документация — обязанность. Отдых — после завершения всех процедур и записей.'
        }
      ]
    },
    finish_good: {
      title: 'Смена завершена',
      text: 'Пациент направлен в кардиологическое отделение. Документация в порядке. Вы действовали по протоколу.',
      final: true,
      result: 'good',
      options: []
    },
    finish_medium: {
      title: 'Смена завершена',
      text: 'Пациент направлен в кардиологическое отделение. Есть недочеты в документации или коммуникации, но критических ошибок не допущено.',
      final: true,
      result: 'medium',
      options: []
    },
    finish_poor: {
      title: 'Смена завершена',
      text: 'Пациент направлен в кардиологическое отделение, но допущены серьезные ошибки в документации или коммуникации.',
      final: true,
      result: 'poor',
      options: []
    },
    finish_critical: {
      title: 'Смена завершена',
      text: 'Пациент стабилизирован после реанимации. Документация в порядке. Вы спасли жизнь, хотя ситуация была критической.',
      final: true,
      result: 'critical_good',
      options: []
    },
    finish_critical_poor: {
      title: 'Смена завершена',
      text: 'Пациент стабилизирован, но документация не ведена. Это серьезное нарушение.',
      final: true,
      result: 'critical_poor',
      options: []
    },
    patient_died: {
      title: 'ТРАГИЧЕСКИЙ ИСХОД',
      text: 'К сожалению, пациент умер. Ваши действия (или бездействие) привели к летальному исходу. Это тяжелый урок.',
      final: true,
      result: 'death',
      options: []
    }
  }
};

// =============================================================================
// КЕЙС 2: АНАФИЛАКТИЧЕСКИЙ ШОК (медсестра)
// =============================================================================
export const NURSE_ANAPHYLAXIS: NodeScenario = {
  id: 'nurse-anaphylaxis',
  title: 'Анафилактический шок',
  difficulty: 'hard',
  role: 'nurse',
  description: 'Женщина 28 лет после укуса осы. Отек Квинке, крапивница, удушье. Быстро прогрессирующий анафилаксис.',
  tags: ['Аллергология', 'Анафилаксия', 'Адреналин', 'ABC'],
  startNode: 'start',
  initialPatient: {
    name: 'Мария К.',
    age: '28 лет',
    avatar: '👩',
    gender: 'female',
    consciousness: 3,
    consciousnessText: 'Заторможенное',
    vitals: { bp_sys: 85, bp_dia: 55, pulse: 125, spo2: 88, rr: 30, temp: 36.8, pain: 5 },
    skin: 'Красная, крапивница, отек лица',
    status: 'critical'
  },
  inventory: ['Адреналин', 'Преднизолон', 'Димедрол', 'Тонометр', 'Пульсоксиметр', 'Кислородная маска', 'В/в катетер', 'Салбутамол', 'Монитор', 'Антигистамин'],
  nodes: {
    start: {
      title: 'Поступление пациента',
      text: 'В приемный покой доставлена женщина 28 лет после укуса осы. Сильный зуд, крапивница по всему телу, отек губ и век, голос хриплый, дыхание затруднено. Кожа красная, горячая. Что делаете в первую очередь?',
      hint: 'При анафилаксии — адреналин в/в струйно. Но сначала — ABC.',
      timeLimit: 20,
      options: [
        {
          text: 'Оцениваю проходимость дыхательных путей, дыхание, пульс, АД. Готовлю адреналин и кислород.',
          correct: true,
          requires: ['Адреналин', 'Кислородная маска'],
          effects: {
            score: { diagnosis: 2, treatment: 1, docs: 0, comm: 0 },
            patient: { spo2: 2, status: 'warning' },
            timeCost: 2,
            nextNode: 'abc_anaphylaxis',
            log: 'ABC + подготовка адреналина'
          },
          feedback: '✅ Правильно! При анафилаксии — одновременно ABC и подготовка к введению адреналина. Каждая секунда на счету.'
        },
        {
          text: 'Даю антигистаминное (димедрол) — это аллергическая реакция',
          correct: false,
          requires: ['Димедрол'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -3, rr: 5, status: 'critical' },
            timeCost: 3,
            nextNode: 'anaphylaxis_worsens',
            log: 'Димедрол вместо адреналина → удушье'
          },
          feedback: '❌ Антигистаминные — второй ряд! При анафилаксии первичен адреналин. Димедрол не остановит отек гортани.'
        },
        {
          text: 'Накладываю холод на место укуса и даю валерьянку от волнения',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -5, rr: 8, consciousness: 2, status: 'critical', consciousnessText: 'Спутанное' },
            timeCost: 5,
            nextNode: 'anaphylaxis_death',
            log: 'Холод и валерьянка → удушье'
          },
          feedback: '❌ Катастрофа! Холод и валерьянка — при анафилаксисе это смертельная потеря времени. Нужен адреналин и кислород.'
        }
      ]
    },
    abc_anaphylaxis: {
      title: 'ABC выполнены',
      text: 'Дыхательные пути частично проходимы (хрипы, отек гортани). АД 85/55, пульс 125, SpO₂ 88%. Что делаете?',
      hint: 'Адреналин — золотой стандарт анафилаксии. Доза 0.3-0.5 мг в/в струйно.',
      timeLimit: 20,
      options: [
        {
          text: 'Ввожу адреналин 0.3 мг в/в струйно, подаю кислород 10 л/мин, вызываю врача',
          correct: true,
          requires: ['Адреналин', 'Кислородная маска'],
          effects: {
            score: { diagnosis: 1, treatment: 3, docs: 0, comm: 1 },
            patient: { bp_sys: 25, bp_dia: 15, pulse: -20, spo2: 6, rr: -5, status: 'warning' },
            timeCost: 2,
            nextNode: 'adrenaline_given',
            log: 'Адреналин 0.3 мг в/в, кислород, вызов врача'
          },
          feedback: '✅ Идеально! Адреналин — единственное средство, способное остановить анафилаксис. Кислород обязателен при SpO₂ < 90%.'
        },
        {
          text: 'Ввожу преднизолон 60 мг в/в — стероиды при аллергии',
          correct: false,
          requires: ['Преднизолон'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -4, rr: 6, status: 'critical' },
            timeCost: 3,
            nextNode: 'anaphylaxis_worsens',
            log: 'Преднизолон вместо адреналина → удушье'
          },
          feedback: '❌ Стероиды — второй ряд! Они начинают действовать через 4-6 часов. При анафилаксии нужен адреналин СЕЙЧАС.'
        },
        {
          text: 'Даю салбутамол через ингалятор — бронхоспазм',
          correct: false,
          requires: ['Салбутамол'],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: { spo2: -2, rr: 3, status: 'critical' },
            timeCost: 3,
            nextNode: 'anaphylaxis_worsens',
            log: 'Салбутамол — недостаточно'
          },
          feedback: '⚠️ Салбутамол помогает при бронхоспазме, но при анафилаксии отек гортани — главная проблема. Нужен адреналин.'
        }
      ]
    },
    anaphylaxis_worsens: {
      title: 'КРИТИЧЕСКОЕ УХУДШЕНИЕ',
      text: 'Состояние резко ухудшается. Отек гортани прогрессирует. Голос пропал. SpO₂ 78%, АД 65/40. Пациент в сознании, но испуганная. Что делаете?',
      hint: 'Это неминуемая смерть без адреналина.',
      timeLimit: 15,
      options: [
        {
          text: 'Срочно ввожу адреналин 0.5 мг в/в струйно, кислород, вызов реанимации',
          correct: true,
          requires: ['Адреналин', 'Кислородная маска'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { bp_sys: 20, bp_dia: 10, spo2: 8, rr: -3, status: 'warning' },
            timeCost: 2,
            nextNode: 'adrenaline_given',
            log: 'Адреналин 0.5 мг в/в — спасение'
          },
          feedback: '✅ Правильно! Даже с опозданием — адреналин спасает жизнь. Доза увеличена до 0.5 мг из-за тяжести состояния.'
        },
        {
          text: 'Даю еще димедрол — может, не хватило дозы',
          correct: false,
          requires: ['Димедрол'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -5, rr: 5, consciousness: 2, status: 'critical' },
            timeCost: 3,
            nextNode: 'anaphylaxis_death',
            log: 'Димедрол вместо адреналина → асфиксия'
          },
          feedback: '❌ Димедрол не остановит анафилаксис! Это смертельная ошибка. Пациент умирает от асфиксии.'
        },
        {
          text: 'Жду врача — я не имею права вводить адреналин',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -8, consciousness: 1, status: 'critical', consciousnessText: 'Без сознания' },
            timeCost: 3,
            nextNode: 'anaphylaxis_death',
            log: 'Промедление → асфиксия'
          },
          feedback: '❌ Смертельная ошибка! При анафилаксии адреналин — обязанность медсестры. Ждать врача — значит убить пациента.'
        }
      ]
    },
    adrenaline_given: {
      title: 'После адреналина',
      text: 'Адреналин подействовал. АД 100/65, пульс 105, SpO₂ 92%. Отек гортани уменьшился, дыхание улучшилось. Какие дальнейшие действия?',
      hint: 'После стабилизации — стероиды, антигистаминные, документация.',
      timeLimit: 25,
      options: [
        {
          text: 'Ввожу преднизолон 60 мг в/в, димедрол, мониторинг, вызываю врача, документирую',
          correct: true,
          requires: ['Преднизолон', 'Димедрол', 'Монитор'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 1, comm: 1 },
            patient: { spo2: 3, status: 'warning' },
            timeCost: 4,
            nextNode: 'anaphylaxis_stable',
            log: 'Стероиды, антигистаминные, мониторинг, документация'
          },
          feedback: '✅ Отлично! После адреналина — стероиды (преднизолон 60-125 мг в/в), антигистаминные, мониторинг на 6-8 часов.'
        },
        {
          text: 'Отправляю домой — "аллергия прошла, можете идти"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -5, bp_sys: -15, status: 'critical' },
            timeCost: 2,
            nextNode: 'anaphylaxis_rebound',
            log: 'Отправка домой → рецидив'
          },
          feedback: '❌ Катастрофа! После анафилаксии — наблюдение минимум 6-8 часов. Рецидив возможен через 4-6 часов (бифазная анафилаксия).'
        },
        {
          text: 'Даю еще адреналина — пусть будет лучше',
          correct: false,
          requires: ['Адреналин'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 30, bp_sys: 30, status: 'critical' },
            timeCost: 2,
            nextNode: 'adrenaline_overdose',
            log: 'Передозировка адреналина → тахикардия'
          },
          feedback: '❌ Передозировка адреналина! Тахикардия, гипертензия, аритмии. Достаточно одной дозы при стабилизации.'
        }
      ]
    },
    anaphylaxis_stable: {
      title: 'Стабилизация',
      text: 'Пациент стабильна. АД 110/70, пульс 95, SpO₂ 95%. Отек спал. Крапивница уменьшилась. Врач пришел. Как передадите информацию?',
      hint: 'SBAR — стандарт.',
      timeLimit: 20,
      options: [
        {
          text: 'По SBAR: ситуация, фон, оценка, рекомендации. Все препараты с дозами.',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 2 },
            patient: {},
            timeCost: 3,
            nextNode: 'anaphylaxis_docs',
            log: 'SBAR-передача'
          },
          feedback: '✅ Отлично! SBAR с полным перечнем препаратов и доз — идеальная передача.'
        },
        {
          text: 'Говорю: "Аллергия, дала адреналин, все хорошо"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 1 },
            patient: {},
            timeCost: 1,
            nextNode: 'anaphylaxis_docs_partial',
            log: 'Недостаточная передача'
          },
          feedback: '⚠️ Информация есть, но без доз и времени. Врач не сможет оценить адекватность терапии.'
        },
        {
          text: 'Молча указываю на пациента — врач сам разберется',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'anaphylaxis_docs_poor',
            log: 'Отсутствие передачи'
          },
          feedback: '❌ Недопустимо! Передача информации — обязанность медсестры. Молчание — нарушение.'
        }
      ]
    },
    anaphylaxis_docs: {
      title: 'Документирование',
      text: 'Пациент направлен на наблюдение. Какие записи делаете?',
      hint: 'Анафилаксия — серьезное нежелательное явление. Документация критически важна.',
      timeLimit: 20,
      options: [
        {
          text: 'Записываю все: время укуса, время адреналина, дозу, динамику ВЖД, подпись, дату',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 2, comm: 0 },
            patient: {},
            timeCost: 5,
            nextNode: 'finish_good',
            log: 'Полная документация анафилаксии'
          },
          feedback: '✅ Правильно! Анафилаксия — серьезное НЯ. Документация должна быть идеальной: время, дозы, динамика, подпись.'
        },
        {
          text: 'Записываю только факт укуса и адреналин',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 1, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'finish_medium',
            log: 'Неполная документация'
          },
          feedback: '⚠️ Неполная документация. Без динамики ВЖД и точного времени — невозможно оценить эффективность.'
        },
        {
          text: 'Ничего не записываю — врач сам все сделает',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'finish_poor',
            log: 'Документация отсутствует'
          },
          feedback: '❌ Недопустимо! Документация — обязанность медсестры. Особенно при анафилаксии.'
        }
      ]
    },
    anaphylaxis_docs_partial: {
      title: 'Документирование',
      text: 'Пациент направлен на наблюдение. Какие записи делаете?',
      timeLimit: 20,
      options: [
        {
          text: 'Записываю все: время укуса, время адреналина, дозу, динамику ВЖД, подпись, дату',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 2, comm: 0 },
            patient: {},
            timeCost: 5,
            nextNode: 'finish_medium',
            log: 'Полная документация анафилаксии'
          },
          feedback: '✅ Правильно!'
        },
        {
          text: 'Записываю только факт укуса и адреналин',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 1, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'finish_poor',
            log: 'Неполная документация'
          },
          feedback: '⚠️ Неполная документация.'
        },
        {
          text: 'Ничего не записываю — врач сам все сделает',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'finish_poor',
            log: 'Документация отсутствует'
          },
          feedback: '❌ Недопустимо!'
        }
      ]
    },
    anaphylaxis_docs_poor: {
      title: 'Документирование',
      text: 'Пациент направлен на наблюдение. Какие записи делаете?',
      timeLimit: 20,
      options: [
        {
          text: 'Записываю все: время укуса, время адреналина, дозу, динамику ВЖД, подпись, дату',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 2, comm: 0 },
            patient: {},
            timeCost: 5,
            nextNode: 'finish_poor',
            log: 'Полная документация анафилаксии'
          },
          feedback: '✅ Правильно, но коммуникация с врачом была слабой.'
        },
        {
          text: 'Записываю только факт укуса и адреналин',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 1, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'finish_poor',
            log: 'Неполная документация'
          },
          feedback: '⚠️ Неполная документация.'
        },
        {
          text: 'Ничего не записываю — врач сам все сделает',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'finish_poor',
            log: 'Документация отсутствует'
          },
          feedback: '❌ Недопустимо!'
        }
      ]
    },
    anaphylaxis_rebound: {
      title: 'КРИТИЧЕСКОЕ УХУДШЕНИЕ',
      text: 'Через 30 минут после отправки домой пациент вернулась. Отек гортани вернулся, SpO₂ 80%, АД 70/40. Это бифазная анафилаксия. Что делаете?',
      hint: 'Бифазная анафилаксия — рецидив через 4-6 часов. Нужен адреналин.',
      timeLimit: 15,
      options: [
        {
          text: 'Срочно адреналин 0.5 мг в/в, кислород, вызов реанимации, госпитализация',
          correct: true,
          requires: ['Адреналин', 'Кислородная маска'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { bp_sys: 20, spo2: 8, status: 'warning' },
            timeCost: 2,
            nextNode: 'adrenaline_given',
            log: 'Адреналин при бифазной анафилаксии'
          },
          feedback: '✅ Правильно! Бифазная анафилаксия требует повторного адреналина и госпитализации на 24 часа.'
        },
        {
          text: 'Даю димедрол — это же аллергия',
          correct: false,
          requires: ['Димедрол'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -5, consciousness: 1, status: 'critical' },
            timeCost: 3,
            nextNode: 'anaphylaxis_death',
            log: 'Димедрол при бифазной анафилаксии → смерть'
          },
          feedback: '❌ Смертельная ошибка! Бифазная анафилаксия без адреналина — летальный исход.'
        },
        {
          text: 'Отправляю домой снова — "успокойтесь, это просто нервы"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -8, pulse: 0, status: 'critical' },
            timeCost: 1,
            nextNode: 'anaphylaxis_death',
            log: 'Вторая отправка домой → смерть'
          },
          feedback: '❌ Преступная халатность! Вторая отправка домой при бифазной анафилаксии — убийство.'
        }
      ]
    },
    adrenaline_overdose: {
      title: 'Осложнение: передозировка адреналина',
      text: 'Пациент бледная, пульс 160, АД 200/120, жалуется на головокружение, тошноту. Это передозировка адреналина. Что делаете?',
      hint: 'Передозировка адреналина — альфа- и бета-стимуляция. Нужен врач и симптоматическая терапия.',
      timeLimit: 20,
      options: [
        {
          text: 'Подключаю монитор, вызываю врача, готовлю нитропруссид натрия, наблюдаю',
          correct: true,
          requires: ['Монитор'],
          effects: {
            score: { diagnosis: 1, treatment: 1, docs: 0, comm: 1 },
            patient: { pulse: -30, bp_sys: -30, status: 'warning' },
            timeCost: 3,
            nextNode: 'anaphylaxis_stable',
            log: 'Мониторинг, вызов врача, симптоматика'
          },
          feedback: '✅ Правильно! Мониторинг, вызов врача, симптоматическая терапия. Нитропруссид при тяжелой гипертензии.'
        },
        {
          text: 'Даю еще адреналина — может, это не передозировка',
          correct: false,
          requires: ['Адреналин'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 20, bp_sys: 20, status: 'critical' },
            timeCost: 2,
            nextNode: 'anaphylaxis_death',
            log: 'Повторный адреналин → гипертензивный криз'
          },
          feedback: '❌ Катастрофа! Повторный адреналин при передозировке вызвал гипертензивный криз с отеком мозга.'
        },
        {
          text: 'Игнорирую — "само пройдет"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 10, bp_sys: 10, status: 'critical' },
            timeCost: 5,
            nextNode: 'anaphylaxis_death',
            log: 'Игнорирование передозировки → криз'
          },
          feedback: '❌ Гипертензивный криз не проходит сам! Нужен врач и лечение.'
        }
      ]
    },
    anaphylaxis_death: {
      title: 'ТРАГИЧЕСКИЙ ИСХОД',
      text: 'К сожалению, пациент умер от асфиксии/коллапса. Ваши действия (или бездействие) привели к летальному исходу.',
      final: true,
      result: 'death',
      options: []
    }
  }
};

// =============================================================================
// КЕЙС 3: ТЯЖЕЛАЯ ГИПОГЛИКЕМИЯ (медсестра)
// =============================================================================
export const NURSE_HYPOGLYCEMIA: NodeScenario = {
  id: 'nurse-hypoglycemia',
  title: 'Тяжелая гипогликемия',
  difficulty: 'easy',
  role: 'nurse',
  description: 'Мужчина 65 лет, диабетик. Найден в бессознательном состоянии. Классическая гипогликемия.',
  tags: ['Эндокринология', 'Гипогликемия', 'Глюкоза', 'ABC'],
  startNode: 'start',
  initialPatient: {
    name: 'Иван П.',
    age: '65 лет',
    avatar: '👴',
    gender: 'male',
    consciousness: 0,
    consciousnessText: 'Без сознания',
    vitals: { bp_sys: 140, bp_dia: 90, pulse: 95, spo2: 96, rr: 16, temp: 36.5, pain: 0 },
    skin: 'Бледная, влажная',
    status: 'warning'
  },
  inventory: ['Глюкометр', 'Глюкоза 40%', 'Глюкоза 5%', 'В/в катетер', 'Тонометр', 'Пульсоксиметр', 'Кислородная маска', 'Монитор', 'Глюкагон'],
  nodes: {
    start: {
      title: 'Поступление пациента',
      text: 'В приемный покой доставлен мужчина 65 лет, диабетик. Найден дома в бессознательном состоянии. Родственники сообщают, что он пропустил обед и принял инсулин. Кожа бледная, влажная. Что делаете в первую очередь?',
      hint: 'При бессознательном диабетике — первое подозрение: гипогликемия. Нужно измерить глюкозу.',
      timeLimit: 25,
      options: [
        {
          text: 'Измеряю глюкозу крови глюкометром, оцениваю ABC',
          correct: true,
          requires: ['Глюкометр'],
          effects: {
            score: { diagnosis: 2, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'glucose_measured',
            log: 'Глюкометр: глюкоза 1.8 ммоль/л'
          },
          feedback: '✅ Правильно! Глюкометр — первый шаг. Глюкоза 1.8 ммоль/л — тяжелая гипогликемия (<2.2).'
        },
        {
          text: 'Даю сладкий чай через трубочку — диабетикам нужен сахар',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { consciousness: 0, status: 'critical' },
            timeCost: 3,
            nextNode: 'aspiration_risk',
            log: 'Сладкий чай при бессознании → аспирация'
          },
          feedback: '❌ Опасно! При бессознании пероральный прием жидкости — риск аспирации в легкие. Это может быть летальным.'
        },
        {
          text: 'Ввожу инсулин — это же диабетик, значит, сахар высокий',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { consciousness: 0, pulse: -20, status: 'critical' },
            timeCost: 2,
            nextNode: 'hypoglycemia_death',
            log: 'Инсулин при гипогликемии → кома'
          },
          feedback: '❌ Смертельная ошибка! Инсулин при гипогликемии — убийство. Глюкоза и так низкая, инсулин ее еще снизит.'
        }
      ]
    },
    glucose_measured: {
      title: 'Глюкоза 1.8 ммоль/л',
      text: 'Глюкоза критически низкая (1.8 ммоль/л). Пациент без сознания. Какие действия?',
      hint: 'При тяжелой гипогликемии с потерей сознания — в/в глюкоза 40%.',
      timeLimit: 20,
      options: [
        {
          text: 'Ввожу глюкозу 40% 40 мл в/в струйно, подключаю монитор, вызываю врача',
          correct: true,
          requires: ['Глюкоза 40%', 'В/в катетер', 'Монитор'],
          effects: {
            score: { diagnosis: 1, treatment: 3, docs: 0, comm: 1 },
            patient: { consciousness: 3, consciousnessText: 'Спутанное', status: 'warning' },
            timeCost: 3,
            nextNode: 'glucose_recovery',
            log: 'Глюкоза 40% в/в, мониторинг, врач'
          },
          feedback: '✅ Идеально! Глюкоза 40% 40 мл в/в — стандарт при тяжелой гипогликемии. Мониторинг и вызов врача обязательны.'
        },
        {
          text: 'Ввожу глюкозу 5% капельно — безопаснее',
          correct: false,
          requires: ['Глюкоза 5%', 'В/в катетер'],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: { consciousness: 1, status: 'critical' },
            timeCost: 5,
            nextNode: 'glucose_slow',
            log: 'Глюкоза 5% — недостаточно'
          },
          feedback: '⚠️ Глюкоза 5% — слишком разведенная. При тяжелой гипогликемии нужна концентрированная (40%). Пациент остается без сознания.'
        },
        {
          text: 'Ввожу глюкагон 1 мг п/к — если нет в/в доступа',
          correct: false,
          requires: ['Глюкагон'],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: { consciousness: 2, status: 'warning' },
            timeCost: 4,
            nextNode: 'glucagon_given',
            log: 'Глюкагон п/к — альтернатива'
          },
          feedback: '⚠️ Глюкагон — альтернатива при отсутствии в/в доступа, но медленнее (10-15 мин). При наличии в/в — глюкоза 40% предпочтительнее.'
        }
      ]
    },
    glucose_recovery: {
      title: 'Восстановление сознания',
      text: 'Пациент пришел в сознание. Спутанное, но отвечает на вопросы. Глюкоза 4.2 ммоль/л. Какие дальнейшие действия?',
      hint: 'После восстановления — предотвращение рецидива, документация.',
      timeLimit: 25,
      options: [
        {
          text: 'Перевожу на глюкозу 5% капельно, контроль глюкозы каждые 15 мин, документирую, вызываю врача',
          correct: true,
          requires: ['Глюкоза 5%', 'Глюкометр'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 1, comm: 1 },
            patient: { consciousness: 4, consciousnessText: 'Ясное', status: 'stable' },
            timeCost: 4,
            nextNode: 'hypoglycemia_stable',
            log: 'Переход на 5%, мониторинг глюкозы, документация'
          },
          feedback: '✅ Отлично! После глюкозы 40% — переход на 5% для предотвращения рецидива. Контроль каждые 15 мин.'
        },
        {
          text: 'Отправляю домой — "сахар нормализовался, можете идти"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { consciousness: 2, status: 'critical' },
            timeCost: 2,
            nextNode: 'hypoglycemia_rebound',
            log: 'Отправка домой → рецидив'
          },
          feedback: '❌ Катастрофа! После тяжелой гипогликемии — наблюдение минимум 2-3 часа. Рецидив возможен через 1-2 часа.'
        },
        {
          text: 'Даю еще глюкозы 40% — пусть будет лучше',
          correct: false,
          requires: ['Глюкоза 40%'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { consciousness: 4, status: 'warning' },
            timeCost: 2,
            nextNode: 'hyperglycemia_risk',
            log: 'Избыточная глюкоза → гипергликемия'
          },
          feedback: '⚠️ Избыточная глюкоза вызовет гипергликемию и реактивную гипогликемию. Достаточно перехода на 5%.'
        }
      ]
    },
    hypoglycemia_stable: {
      title: 'Стабилизация',
      text: 'Пациент в сознании, ориентирован. Глюкоза 5.8 ммоль/л. Врач пришел. Как передадите информацию?',
      hint: 'SBAR — стандарт.',
      timeLimit: 20,
      options: [
        {
          text: 'По SBAR: ситуация, фон, оценка, рекомендации. Все препараты с дозами и временем.',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 2 },
            patient: {},
            timeCost: 3,
            nextNode: 'hypoglycemia_docs',
            log: 'SBAR-передача'
          },
          feedback: '✅ Отлично! SBAR с полным перечнем препаратов, доз и времени.'
        },
        {
          text: 'Говорю: "Диабетик, глюкоза была низкая, дала глюкозу, все хорошо"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 1 },
            patient: {},
            timeCost: 1,
            nextNode: 'hypoglycemia_docs_partial',
            log: 'Недостаточная передача'
          },
          feedback: '⚠️ Без точных цифр и времени врач не сможет оценить адекватность.'
        },
        {
          text: 'Молча указываю на пациента',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'hypoglycemia_docs_poor',
            log: 'Отсутствие передачи'
          },
          feedback: '❌ Недопустимо! Передача — обязанность.'
        }
      ]
    },
    hypoglycemia_docs: {
      title: 'Документирование',
      text: 'Пациент направлен на наблюдение. Какие записи делаете?',
      hint: 'Гипогликемия — серьезное событие. Документация критична.',
      timeLimit: 20,
      options: [
        {
          text: 'Записываю все: время найденного состояния, глюкозу, дозу глюкозы, динамику, подпись',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 2, comm: 0 },
            patient: {},
            timeCost: 5,
            nextNode: 'finish_good',
            log: 'Полная документация гипогликемии'
          },
          feedback: '✅ Правильно! Время, глюкоза, доза, динамика, подпись — все обязательно.'
        },
        {
          text: 'Записываю только факт гипогликемии и глюкозу',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 1, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'finish_medium',
            log: 'Неполная документация'
          },
          feedback: '⚠️ Неполная документация. Без дозы и динамики — невозможно оценить.'
        },
        {
          text: 'Ничего не записываю — врач сам',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'finish_poor',
            log: 'Документация отсутствует'
          },
          feedback: '❌ Недопустимо!'
        }
      ]
    },
    hypoglycemia_docs_partial: {
      title: 'Документирование',
      text: 'Пациент направлен на наблюдение. Какие записи делаете?',
      timeLimit: 20,
      options: [
        {
          text: 'Записываю все: время найденного состояния, глюкозу, дозу глюкозы, динамику, подпись',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 2, comm: 0 },
            patient: {},
            timeCost: 5,
            nextNode: 'finish_medium',
            log: 'Полная документация гипогликемии'
          },
          feedback: '✅ Правильно!'
        },
        {
          text: 'Записываю только факт гипогликемии и глюкозу',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 1, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'finish_poor',
            log: 'Неполная документация'
          },
          feedback: '⚠️ Неполная документация.'
        },
        {
          text: 'Ничего не записываю — врач сам',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'finish_poor',
            log: 'Документация отсутствует'
          },
          feedback: '❌ Недопустимо!'
        }
      ]
    },
    hypoglycemia_docs_poor: {
      title: 'Документирование',
      text: 'Пациент направлен на наблюдение. Какие записи делаете?',
      timeLimit: 20,
      options: [
        {
          text: 'Записываю все: время найденного состояния, глюкозу, дозу глюкозы, динамику, подпись',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 2, comm: 0 },
            patient: {},
            timeCost: 5,
            nextNode: 'finish_poor',
            log: 'Полная документация гипогликемии'
          },
          feedback: '✅ Правильно, но коммуникация слабая.'
        },
        {
          text: 'Записываю только факт гипогликемии и глюкозу',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 1, comm: 0 },
            patient: {},
            timeCost: 2,
            nextNode: 'finish_poor',
            log: 'Неполная документация'
          },
          feedback: '⚠️ Неполная документация.'
        },
        {
          text: 'Ничего не записываю — врач сам',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: {},
            timeCost: 1,
            nextNode: 'finish_poor',
            log: 'Документация отсутствует'
          },
          feedback: '❌ Недопустимо!'
        }
      ]
    },
    aspiration_risk: {
      title: 'КРИТИЧЕСКОЕ УХУДШЕНИЕ',
      text: 'Пациент начал задыхаться. Хрипы в легких, цианоз губ. Это аспирация сладкого чая. Что делаете?',
      hint: 'Аспирация — немедленная интубация и аспирация бронхов.',
      timeLimit: 15,
      options: [
        {
          text: 'Поворачиваю на бок, аспирирую ротовую полость, вызываю реанимацию, готовлюсь к интубации',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { spo2: 5, status: 'critical' },
            timeCost: 2,
            nextNode: 'aspiration_managed',
            log: 'Аспирация — позиция, аспирация, вызов реанимации'
          },
          feedback: '✅ Правильно! Поворот на бок, аспирация ротовой полости, вызов реанимации. Интубация при тяжелой аспирации.'
        },
        {
          text: 'Продолжаю давать сладкий чай — сахар нужен',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -5, consciousness: 0, status: 'critical' },
            timeCost: 2,
            nextNode: 'hypoglycemia_death',
            log: 'Продолжение аспирации → смерть'
          },
          feedback: '❌ Смертельная ошибка! Продолжение перорального приема при аспирации — убийство.'
        },
        {
          text: 'Жду врача — я не могу интубировать',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { spo2: -8, pulse: 0, status: 'critical' },
            timeCost: 3,
            nextNode: 'hypoglycemia_death',
            log: 'Промедление → асфиксия'
          },
          feedback: '❌ Смертельная ошибка! При аспирации нужны немедленные действия: позиция, аспирация, вызов помощи.'
        }
      ]
    },
    aspiration_managed: {
      title: 'Аспирация купирована',
      text: 'Аспирация купирована. Пациент стабилен, но без сознания. SpO₂ 92%. Нужно дать глюкозу. Как?',
      hint: 'При бессознании — только в/в глюкоза.',
      timeLimit: 20,
      options: [
        {
          text: 'Ввожу глюкозу 40% 40 мл в/в струйно, мониторинг, вызов врача',
          correct: true,
          requires: ['Глюкоза 40%', 'В/в катетер'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { consciousness: 3, consciousnessText: 'Спутанное', spo2: 2, status: 'warning' },
            timeCost: 3,
            nextNode: 'glucose_recovery',
            log: 'Глюкоза 40% в/в после аспирации'
          },
          feedback: '✅ Правильно! После аспирации — только в/в глюкоза. Мониторинг и вызов врача.'
        },
        {
          text: 'Даю глюкозу через зонд — безопаснее',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: { consciousness: 1, status: 'critical' },
            timeCost: 5,
            nextNode: 'glucose_slow',
            log: 'Глюкоза через зонд — медленно'
          },
          feedback: '⚠️ Зонд — вариант, но медленнее. При тяжелой гипогликемии в/в предпочтительнее.'
        },
        {
          text: 'Жду врача — я не имею права',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { consciousness: 0, pulse: -15, status: 'critical' },
            timeCost: 3,
            nextNode: 'hypoglycemia_death',
            log: 'Промедление → кома'
          },
          feedback: '❌ Смертельная ошибка! Гипогликемия требует немедленного действия.'
        }
      ]
    },
    glucose_slow: {
      title: 'Глюкоза 5% недостаточна',
      text: 'Пациент остается без сознания. Глюкоза 5% слишком разведена. SpO₂ 89%. Что делаете?',
      hint: 'Нужна концентрированная глюкоза.',
      timeLimit: 15,
      options: [
        {
          text: 'Срочно ввожу глюкозу 40% 40 мл в/в струйно',
          correct: true,
          requires: ['Глюкоза 40%', 'В/в катетер'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 0 },
            patient: { consciousness: 3, consciousnessText: 'Спутанное', spo2: 4, status: 'warning' },
            timeCost: 2,
            nextNode: 'glucose_recovery',
            log: 'Глюкоза 40% — коррекция'
          },
          feedback: '✅ Правильно! Коррекция — глюкоза 40% в/в струйно.'
        },
        {
          text: 'Продолжаю 5% — "должно подействовать"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { consciousness: 0, pulse: -20, status: 'critical' },
            timeCost: 5,
            nextNode: 'hypoglycemia_death',
            log: 'Продолжение 5% → кома'
          },
          feedback: '❌ Смертельная ошибка! 5% — недостаточно при тяжелой гипогликемии.'
        },
        {
          text: 'Даю инсулин — может, это гипергликемия',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 0, status: 'critical' },
            timeCost: 2,
            nextNode: 'hypoglycemia_death',
            log: 'Инсулин при гипогликемии → смерть'
          },
          feedback: '❌ Смертельная ошибка! Инсулин при гипогликемии — убийство.'
        }
      ]
    },
    glucagon_given: {
      title: 'После глюкагона',
      text: 'Глюкагон подействовал. Пациент пришел в сознание, но спутанное. Глюкоза 3.5 ммоль/л. Что делаете?',
      hint: 'Глюкагон — временная мера. Нужна глюкоза для предотвращения рецидива.',
      timeLimit: 25,
      options: [
        {
          text: 'Даю углеводы перорально (сок, конфеты), контроль глюкозы, документация, вызов врача',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 1, comm: 1 },
            patient: { consciousness: 4, consciousnessText: 'Ясное', status: 'stable' },
            timeCost: 4,
            nextNode: 'hypoglycemia_stable',
            log: 'Углеводы перорально, мониторинг, документация'
          },
          feedback: '✅ Правильно! После глюкагона — углеводы перорально для предотвращения рецидива. Мониторинг и документация.'
        },
        {
          text: 'Отправляю домой — "глюкагон помог, все хорошо"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { consciousness: 2, status: 'critical' },
            timeCost: 2,
            nextNode: 'hypoglycemia_rebound',
            log: 'Отправка домой → рецидив'
          },
          feedback: '❌ Глюкагон — временная мера! Рецидив через 1-2 часа. Нужно наблюдение и углеводы.'
        },
        {
          text: 'Даю еще глюкагона — пусть будет лучше',
          correct: false,
          requires: ['Глюкагон'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 20, bp_sys: 20, status: 'critical' },
            timeCost: 2,
            nextNode: 'glucagon_overdose',
            log: 'Передозировка глюкагона → гипергликемия'
          },
          feedback: '❌ Передозировка глюкагона вызывает гипергликемию и тахикардию.'
        }
      ]
    },
    hyperglycemia_risk: {
      title: 'Гипергликемия',
      text: 'После избыточной глюкозы 40% пациент стал беспокойным, жаждущим. Глюкоза 18 ммоль/л. Это гипергликемия. Что делаете?',
      hint: 'Нужен врач и инсулин.',
      timeLimit: 20,
      options: [
        {
          text: 'Вызываю врача, подключаю монитор, начинаю инсулинотерапию по протоколу',
          correct: true,
          requires: ['Монитор'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { status: 'warning' },
            timeCost: 3,
            nextNode: 'hypoglycemia_stable',
            log: 'Врач, мониторинг, инсулин'
          },
          feedback: '✅ Правильно! Гипергликемия требует врача и инсулина. Мониторинг обязателен.'
        },
        {
          text: 'Даю еще глюкозы — пусть будет еще выше',
          correct: false,
          requires: ['Глюкоза 40%'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 2,
            nextNode: 'hypoglycemia_death',
            log: 'Избыточная глюкоза → гиперосмолярная кома'
          },
          feedback: '❌ Катастрофа! Гиперосмолярная кома — летальный исход.'
        },
        {
          text: 'Игнорирую — "само пройдет"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 5,
            nextNode: 'hypoglycemia_death',
            log: 'Игнорирование гипергликемии → кома'
          },
          feedback: '❌ Гипергликемия 18 ммоль/л — опасна. Нужен врач.'
        }
      ]
    },
    hypoglycemia_rebound: {
      title: 'КРИТИЧЕСКОЕ УХУДШЕНИЕ',
      text: 'Через час пациент вернулся в бессознательном состоянии. Глюкоза 1.5 ммоль/л. Рецидив гипогликемии. Что делаете?',
      hint: 'Рецидив — стандартная глюкоза 40% в/в.',
      timeLimit: 15,
      options: [
        {
          text: 'Срочно глюкоза 40% 40 мл в/в, мониторинг, госпитализация',
          correct: true,
          requires: ['Глюкоза 40%', 'В/в катетер'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { consciousness: 3, consciousnessText: 'Спутанное', status: 'warning' },
            timeCost: 2,
            nextNode: 'glucose_recovery',
            log: 'Глюкоза 40% при рецидиве'
          },
          feedback: '✅ Правильно! Рецидив требует повторной глюкозы и госпитализации.'
        },
        {
          text: 'Даю сладкий чай — работало же',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { consciousness: 0, status: 'critical' },
            timeCost: 3,
            nextNode: 'aspiration_risk',
            log: 'Сладкий чай при бессознании → аспирация'
          },
          feedback: '❌ Опасно! При бессознании — только в/в.'
        },
        {
          text: 'Жду врача',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 0, status: 'critical' },
            timeCost: 3,
            nextNode: 'hypoglycemia_death',
            log: 'Промедление → смерть'
          },
          feedback: '❌ Смертельная ошибка!'
        }
      ]
    },
    glucagon_overdose: {
      title: 'Передозировка глюкагона',
      text: 'Пациент бледный, пульс 140, АД 180/110, тошнота. Это передозировка глюкагона. Что делаете?',
      hint: 'Симптоматическая терапия, врач.',
      timeLimit: 20,
      options: [
        {
          text: 'Подключаю монитор, вызываю врача, симптоматическая терапия',
          correct: true,
          requires: ['Монитор'],
          effects: {
            score: { diagnosis: 1, treatment: 1, docs: 0, comm: 1 },
            patient: { pulse: -20, bp_sys: -20, status: 'warning' },
            timeCost: 3,
          nextNode: 'hypoglycemia_stable',
            log: 'Мониторинг, врач, симптоматика'
          },
          feedback: '✅ Правильно! Симптоматическая терапия при передозировке глюкагона.'
        },
        {
          text: 'Даю еще глюкагона',
          correct: false,
          requires: ['Глюкагон'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 20, status: 'critical' },
            timeCost: 2,
            nextNode: 'hypoglycemia_death',
            log: 'Повторный глюкагон → тахикардия'
          },
          feedback: '❌ Катастрофа!'
        },
        {
          text: 'Игнорирую',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 5,
            nextNode: 'hypoglycemia_death',
            log: 'Игнорирование → криз'
          },
          feedback: '❌ Недопустимо!'
        }
      ]
    },
    hypoglycemia_death: {
      title: 'ТРАГИЧЕСКИЙ ИСХОД',
      text: 'К сожалению, пациент умер. Ваши действия привели к летальному исходу.',
      final: true,
      result: 'death',
      options: []
    }
  }
};

// =============================================================================
// КЕЙС 4: STEMI (врач)
// =============================================================================
export const DOCTOR_STEMI: NodeScenario = {
  id: 'doctor-stemi',
  title: 'Острый инфаркт миокарда (STEMI)',
  difficulty: 'hard',
  role: 'doctor',
  description: 'Мужчина 58 лет. Сдавливающая боль за грудиной 45 мин. ЭКГ: ST-подъем в V1-V4. Классический STEMI.',
  tags: ['Кардиология', 'STEMI', 'Реперфузия', 'МОНА-Б'],
  startNode: 'start',
  initialPatient: {
    name: 'Сергей Н.',
    age: '58 лет',
    avatar: '👨‍⚕️',
    gender: 'male',
    consciousness: 4,
    consciousnessText: 'Ясное',
    vitals: { bp_sys: 150, bp_dia: 95, pulse: 105, spo2: 94, rr: 20, temp: 36.6, pain: 9 },
    skin: 'Бледная, холодный пот',
    status: 'warning'
  },
  inventory: ['ЭКГ-аппарат', 'Монитор', 'Кислородная маска', 'Аспирин', 'Клопидогрель', 'Нитроглицерин', 'Морфин', 'Гепарин', 'В/в катетер', 'Дефибриллятор'],
  nodes: {
    start: {
      title: 'Поступление пациента',
      text: 'Мужчина 58 лет. Боль за грудиной 45 мин, иррадиация в левую руку, холодный пот. ЭКГ: ST-подъем ≥2 мм в V1-V4. Каковы ваши первые действия?',
      hint: 'STEMI — время = миокард. Протокол МОНА-Б + сроки реперфузии.',
      timeLimit: 30,
      options: [
        {
          text: 'МОНА-Б: морфин 10 мг в/в, кислород 4-6 л/мин, нитроглицерин 0.4 мг п/я, аспирин 325 мг + клопидогрель 300 мг, бета-блокатор (метопролол 25 мг перорально)',
          correct: true,
          requires: ['Морфин', 'Кислородная маска', 'Нитроглицерин', 'Аспирин', 'Клопидогрель'],
          effects: {
            score: { diagnosis: 2, treatment: 3, docs: 0, comm: 0 },
            patient: { pain: -3, spo2: 3, status: 'warning' },
            timeCost: 5,
            nextNode: 'mona_done',
            log: 'МОНА-Б выполнен'
          },
          feedback: '✅ Отлично! МОНА-Б — золотой стандарт первичной терапии STEMI. Боль уменьшилась, SpO₂ улучшился.'
        },
        {
          text: 'Начинаю тромболиз — главное восстановить кровоток',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pain: 1, status: 'critical' },
            timeCost: 3,
            nextNode: 'trombolysis_risk',
            log: 'Тромболиз без МОНА-Б → риск'
          },
          feedback: '❌ Опасно! Тромболиз без МОНА-Б увеличивает риск кровотечения. Сначала — антиагреганты и антикоагулянты.'
        },
        {
          text: 'Отправляю на КТ головы — исключить инсульт',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pain: 2, pulse: 20, status: 'critical' },
            timeCost: 15,
            nextNode: 'stemi_death',
            log: 'КТ вместо реперфузии → потеря времени'
          },
          feedback: '❌ Смертельная потеря времени! При STEMI каждая минута = 1.6 г миокарда. КТ — только при атипичной картине.'
        }
      ]
    },
    mona_done: {
      title: 'МОНА-Б выполнен',
      text: 'Боль уменьшилась до 6/10. АД 140/90, пульс 98, SpO₂ 96%. ЭКГ подтверждает STEMI передней стенки. Каков план реперфузии?',
      hint: 'При STEMI — ПКВ в течение 90 мин или тромболиз в течение 30 мин от поступления.',
      timeLimit: 25,
      options: [
        {
          text: 'Экстренная ПКВ (первичное чрескожное вмешательство) — золотой стандарт, сроки <90 мин от поступления',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 2, treatment: 3, docs: 0, comm: 0 },
            patient: { pain: -2, status: 'warning' },
            timeCost: 5,
            nextNode: 'pcv_decision',
            log: 'Решение: ПКВ'
          },
          feedback: '✅ Правильно! ПКВ — предпочтительный метод реперфузии при STEMI. Снижает смертность на 20-25% по сравнению с тромболизом.'
        },
        {
          text: 'Тромболиз тенектеплазой — быстрее, если ПКВ недоступна в течение 120 мин',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 0 },
            patient: { pain: -1, status: 'warning' },
            timeCost: 3,
            nextNode: 'trombolysis_done',
            log: 'Решение: тромболиз'
          },
          feedback: '⚠️ Тромболиз — вариант, если ПКВ недоступна в течение 120 мин. Но ПКВ предпочтительнее.'
        },
        {
          text: 'Консервативная терапия — наблюдение, антиагреганты',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pain: 3, pulse: 30, status: 'critical' },
            timeCost: 10,
            nextNode: 'stemi_death',
            log: 'Консервативная терапия → кардиогенный шок'
          },
          feedback: '❌ Смертельная ошибка! STEMI требует реперфузии. Консервативная терапия без реперфузии — смертность 30%.'
        }
      ]
    },
    pcv_decision: {
      title: 'Подготовка к ПКВ',
      text: 'Решено — ПКВ. Пациент стабилен. Какие действия перед транспортировкой в катетеризационную лабораторию?',
      hint: 'Двойная антиагрегантная терапия + антикоагулянт + документация.',
      timeLimit: 20,
      options: [
        {
          text: 'Аспирин 325 мг + клопидогрель 300 мг (или тикагрелор 180 мг), гепарин 5000 ЕД в/в, информированное согласие, документация',
          correct: true,
          requires: ['Аспирин', 'Клопидогрель', 'Гепарин'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 1, comm: 1 },
            patient: { status: 'warning' },
            timeCost: 4,
            nextNode: 'pcv_success',
            log: 'ДАТ + гепарин, согласие, документация'
          },
          feedback: '✅ Идеально! ДАТ, антикоагулянт, информированное согласие — обязательно перед ПКВ.'
        },
        {
          text: 'Только аспирин — это же экстренная ситуация',
          correct: false,
          requires: ['Аспирин'],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: { status: 'warning' },
            timeCost: 2,
            nextNode: 'pcv_risk',
            log: 'Только аспирин — недостаточная ДАТ'
          },
          feedback: '⚠️ Недостаточно! При STEMI — двойная антиагрегантная терапия обязательна. Риск тромбоза стента.'
        },
        {
          text: 'Без согласия — время критично, пациент согласен устно',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'warning' },
            timeCost: 1,
            nextNode: 'pcv_risk',
            log: 'Отсутствие информированного согласия'
          },
          feedback: '❌ Недопустимо! Информированное согласие — обязательно. Даже при экстренности. Устное согласие недостаточно.'
        }
      ]
    },
    pcv_success: {
      title: 'ПКВ выполнена успешно',
      text: 'ПКВ выполнена. Стентирование ЛАД. TIMI 3 поток. Боль исчезла. Пациент стабилен. Какие дальнейшие действия?',
      hint: 'После ПКВ — двойная антиагрегантная терапия, статины, бета-блокаторы, АПФ.',
      timeLimit: 25,
      options: [
        {
          text: 'ДАТ 12 месяцев (аспирин + клопидогрель/тикагрелор), аторвастатин 80 мг, метопролол, лизиноприл, реабилитация',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 3, docs: 1, comm: 1 },
            patient: { status: 'stable' },
            timeCost: 5,
            nextNode: 'finish_good',
            log: 'Полная вторичная профилактика'
          },
          feedback: '✅ Отлично! Полная вторичная профилактика: ДАТ 12 мес, статины, бета-блокаторы, АПФ, реабилитация.'
        },
        {
          text: 'Только аспирин — пациент стабилен',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: { status: 'warning' },
            timeCost: 2,
            nextNode: 'finish_poor',
            log: 'Недостаточная ДАТ'
          },
          feedback: '❌ Недостаточно! После стентирования — ДАТ минимум 12 месяцев. Иначе — стент-тромбоз.'
        },
        {
          text: 'Отправляю домой — все хорошо',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 1,
            nextNode: 'stemi_death',
            log: 'Отправка домой → рецидив'
          },
          feedback: '❌ Смертельная ошибка! После STEMI — наблюдение минимум 48-72 часа. Рецидив возможен.'
        }
      ]
    },
    trombolysis_done: {
      title: 'Тромболиз выполнен',
      text: 'Тенектеплаза введена. Пациент стабилен. Боль уменьшилась. Какие дальнейшие действия?',
      hint: 'После тромболиза — антикоагулянты, ДАТ, мониторинг кровотечений.',
      timeLimit: 25,
      options: [
        {
          text: 'Гепарин 1000 ЕД/ч капельно 24-48 ч, аспирин + клопидогрель, мониторинг кровотечений, через 24 ч — коронарография',
          correct: true,
          requires: ['Гепарин', 'Аспирин', 'Клопидогрель'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 1, comm: 1 },
            patient: { status: 'warning' },
            timeCost: 5,
            nextNode: 'finish_medium',
            log: 'Гепарин, ДАТ, мониторинг, планирование коронарографии'
          },
          feedback: '✅ Правильно! После тромболиза — гепарин 24-48 ч, ДАТ, мониторинг кровотечений. Коронарография через 24 ч.'
        },
        {
          text: 'Только аспирин — гепарин опасен после тромболиза',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: { status: 'warning' },
            timeCost: 2,
            nextNode: 'trombolysis_risk',
            log: 'Без гепарина → реокклюзия'
          },
          feedback: '⚠️ Гепарин обязателен после тромболиза! Без него — риск реокклюзии 30%.'
        },
        {
          text: 'Отправляю домой — тромболиз помог',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 1,
            nextNode: 'stemi_death',
            log: 'Отправка домой → рецидив'
          },
          feedback: '❌ Смертельная ошибка! После тромболиза — наблюдение минимум 48 ч. Реокклюзия возможна.'
        }
      ]
    },
    trombolysis_risk: {
      title: 'Осложнение: кровотечение',
      text: 'После тромболиза без полной ДАТ — кровотечение из ЖКТ. Гематокрит падает. Что делаете?',
      hint: 'Кровотечение после тромболиза — отмена антиагрегантов, трансфузия, эндоскопия.',
      timeLimit: 20,
      options: [
        {
          text: 'Отменяю тромболитик, перевожу на гепарин, трансфузия эритроцитарной массы, консультация хирурга, эндоскопия',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { status: 'warning' },
            timeCost: 5,
            nextNode: 'trombolysis_managed',
            log: 'Управление кровотечением'
          },
          feedback: '✅ Правильно! Отмена тромболитика, гепарин, трансфузия, эндоскопия — стандарт.'
        },
        {
          text: 'Продолжаю тромболиз — главное восстановить кровоток',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 2,
            nextNode: 'stemi_death',
            log: 'Продолжение тромболиза → массивное кровотечение'
          },
          feedback: '❌ Катастрофа! Продолжение тромболиза при кровотечении — летальный исход.'
        },
        {
          text: 'Жду — кровотечение может само остановиться',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 5,
            nextNode: 'stemi_death',
            log: 'Ожидание → геморрагический шок'
          },
          feedback: '❌ Кровотечение после тромболиза не остановится само! Нужна активная терапия.'
        }
      ]
    },
    trombolysis_managed: {
      title: 'Кровотечение купировано',
      text: 'Кровотечение остановлено. Пациент стабилен. Какие дальнейшие действия?',
      hint: 'После купирования — планирование коронарографии.',
      timeLimit: 25,
      options: [
        {
          text: 'Планирую коронарографию через 24 ч, ДАТ, статины, мониторинг',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { status: 'warning' },
            timeCost: 4,
            nextNode: 'finish_medium',
            log: 'Коронарография через 24 ч, ДАТ, статины'
          },
          feedback: '✅ Правильно! После купирования — коронарография через 24 ч, ДАТ, статины.'
        },
        {
          text: 'Отправляю домой — кровотечение остановилось',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 1,
            nextNode: 'stemi_death',
            log: 'Отправка домой → рецидив'
          },
          feedback: '❌ Недопустимо! После STEMI — наблюдение минимум 48-72 ч.'
        },
        {
          text: 'Повторный тромболиз — нужно восстановить кровоток',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 2,
            nextNode: 'stemi_death',
            log: 'Повторный тромболиз → кровотечение'
          },
          feedback: '❌ Повторный тромболиз при недавнем кровотечении — смертельно опасен.'
        }
      ]
    },
    pcv_risk: {
      title: 'Осложнение: стент-тромбоз',
      text: 'Через 6 часов после ПКВ — повторная боль, ST-подъем. Это острый стент-тромбоз. Что делаете?',
      hint: 'Стент-тромбоз — немедленная ре-ПКВ.',
      timeLimit: 15,
      options: [
        {
          text: 'Срочная ре-ПКВ, усиленная ДАТ (тикагрелор + аспирин), гепарин, консультация гематолога',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 2, treatment: 2, docs: 0, comm: 1 },
            patient: { status: 'warning' },
            timeCost: 3,
            nextNode: 'pcv_success',
            log: 'Ре-ПКВ при стент-тромбозе'
          },
          feedback: '✅ Правильно! Стент-тромбоз — немедленная ре-ПКВ. Усиленная ДАТ, гепарин.'
        },
        {
          text: 'Тромболиз — быстрее, чем ПКВ',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 3,
            nextNode: 'stemi_death',
            log: 'Тромболиз при стент-тромбозе → кровотечение'
          },
          feedback: '❌ Тромболиз при стент-тромбозе — противопоказан! Риск массивного кровотечения.'
        },
        {
          text: 'Консервативная терапия — наблюдение',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 5,
            nextNode: 'stemi_death',
            log: 'Консервативная терапия → кардиогенный шок'
          },
          feedback: '❌ Стент-тромбоз требует ре-ПКВ. Консервативная терапия — смертность 80%.'
        }
      ]
    },
    stemi_death: {
      title: 'ТРАГИЧЕСКИЙ ИСХОД',
      text: 'К сожалению, пациент умер от кардиогенного шока/кровотечения. Ваши действия привели к летальному исходу.',
      final: true,
      result: 'death',
      options: []
    }
  }
};

// =============================================================================
// КЕЙС 5: ТИРЕОИДНЫЙ ШТОРМ (врач)
// =============================================================================
export const DOCTOR_THYROID_STORM: NodeScenario = {
  id: 'doctor-thyroid-storm',
  title: 'Тиреоидный шторм',
  difficulty: 'hard',
  role: 'doctor',
  description: 'Женщина 34 года. Лихорадка 40°C, тахикардия 150, агитация, диарея. Тяжелый тиреотоксикоз.',
  tags: ['Эндокринология', 'Тиреотоксикоз', 'Блокада', 'Стероиды'],
  startNode: 'start',
  initialPatient: {
    name: 'Елена М.',
    age: '34 года',
    avatar: '👩‍⚕️',
    gender: 'female',
    consciousness: 3,
    consciousnessText: 'Возбужденное',
    vitals: { bp_sys: 160, bp_dia: 100, pulse: 150, spo2: 95, rr: 28, temp: 40.0, pain: 2 },
    skin: 'Горячая, влажная, красная',
    status: 'critical'
  },
  inventory: ['Пропранолол', 'Метимазол', 'Йодид калия', 'Гидрокортизон', 'Парацетамол', 'В/в катетер', 'Монитор', 'Кислородная маска', 'Тонометр', 'Пульсоксиметр'],
  nodes: {
    start: {
      title: 'Поступление пациента',
      text: 'Женщина 34 года. Лихорадка 40°C, тахикардия 150, агитация, тремор, диарея 5 раз. Анамнез: болеет Basedow болезнью, пропустила тиамазол 3 дня. Что делаете в первую очередь?',
      hint: 'Тиреоидный шторм — блокада (пропранолол), тионамиды (метимазол), йод, стероиды.',
      timeLimit: 25,
      options: [
        {
          text: 'Пропранолол 40-80 мг в/в (блокада), метимазол 60 мг/сут (тионамиды), йодид калия (через 1 ч после тионамидов), гидрокортизон 300 мг в/в, кислород, мониторинг',
          correct: true,
          requires: ['Пропранолол', 'Метимазол', 'Йодид калия', 'Гидрокортизон'],
          effects: {
            score: { diagnosis: 2, treatment: 3, docs: 0, comm: 0 },
            patient: { pulse: -40, temp: -1.0, status: 'warning' },
            timeCost: 5,
            nextNode: 'storm_treated',
            log: 'Блокада + тионамиды + йод + стероиды'
          },
          feedback: '✅ Идеально! Пропранолол (блокада), метимазол (синтез), йод (выделение — через 1 ч после тионамидов!), гидрокортизон (конверсия T4→T3).'
        },
        {
          text: 'Парацетамол 1 г — лихорадка 40°C',
          correct: false,
          requires: ['Парацетамол'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { temp: -0.3, status: 'critical' },
            timeCost: 2,
            nextNode: 'storm_worsens',
            log: 'Только парацетамол → прогрессирование'
          },
          feedback: '❌ Парацетамол — симптоматика. При тиреоидном шторме нужна этиологическая терапия: блокада + тионамиды + йод + стероиды.'
        },
        {
          text: 'Йодид калия сразу — блокирует выделение тироксина',
          correct: false,
          requires: ['Йодид калия'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 10, temp: 0.5, status: 'critical' },
            timeCost: 2,
            nextNode: 'storm_worsens',
            log: 'Йод без тионамидов → усиление синтеза'
          },
          feedback: '❌ Йод БЕЗ тионамидов — опасен! Стимулирует синтез нового тироксина (эффект Вольфа-Чайкова). Сначала — тионамиды, через 1 ч — йод.'
        }
      ]
    },
    storm_treated: {
      title: 'Терапия начата',
      text: 'Через 2 часа: пульс 110, температура 38.5°C, агитация уменьшилась. Какие дальнейшие действия?',
      hint: 'Мониторинг, коррекция электролитов, поиск триггера.',
      timeLimit: 25,
      options: [
        {
          text: 'Мониторинг ВЖД каждые 30 мин, коррекция жидкости/электролитов, поиск инфекции (триггер), консультация эндокринолога, документация',
          correct: true,
          requires: ['Монитор'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 1, comm: 1 },
            patient: { pulse: -15, temp: -0.5, status: 'warning' },
            timeCost: 4,
            nextNode: 'storm_stable',
            log: 'Мониторинг, электролиты, поиск триггера'
          },
          feedback: '✅ Отлично! Мониторинг, электролиты, поиск триггера (инфекция, хирургия, роды), консультация — обязательны.'
        },
        {
          text: 'Отменяю все препараты — пациент стабилен',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 30, temp: 1.0, status: 'critical' },
            timeCost: 2,
            nextNode: 'storm_rebound',
            log: 'Отмена препаратов → рецидив'
          },
          feedback: '❌ Катастрофа! Отмена препаратов при тиреоидном шторме — рецидив. Терапия продолжается до стабилизации.'
        },
        {
          text: 'Увеличиваю дозу пропранолола — пульс еще высокий',
          correct: false,
          requires: ['Пропранолол'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: -20, bp_sys: -20, status: 'critical' },
            timeCost: 2,
            nextNode: 'storm_brady',
            log: 'Передозировка пропранолола → брадикардия'
          },
          feedback: '❌ Передозировка пропранолола вызвала брадикардию и гипотензию. Доза должна быть адекватной.'
        }
      ]
    },
    storm_stable: {
      title: 'Стабилизация',
      text: 'Пациент стабильна. Пульс 95, температура 37.8°C. Триггер — ОРВИ. Какие дальнейшие действия?',
      hint: 'Переход на пероральную терапию, планирование тиреоидэктомии.',
      timeLimit: 25,
      options: [
        {
          text: 'Переход на пероральные тионамиды + пропранолол, планирование тиреоидэктомии через 6-8 недель, консультация хирурга, документация',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 1, comm: 1 },
            patient: { status: 'stable' },
            timeCost: 4,
            nextNode: 'finish_good',
            log: 'Переход на пероральную терапию, планирование операции'
          },
          feedback: '✅ Отлично! Переход на пероральные препараты, планирование тиреоидэктомии через 6-8 недель (после эутиреоза).'
        },
        {
          text: 'Отправляю домой — "все хорошо, продолжайте тиамазол"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 1,
            nextNode: 'storm_rebound',
            log: 'Отправка домой → рецидив'
          },
          feedback: '❌ Тиреоидный шторм — наблюдение минимум 48-72 ч. Отправка домой — риск рецидива.'
        },
        {
          text: 'Немедленная тиреоидэктомия — нужно убрать источник',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 3,
            nextNode: 'storm_surgery_risk',
            log: 'Ранняя тиреоидэктомия → криз'
          },
          feedback: '❌ Тиреоидэктомия при остром шторме — противопоказана! Операция только после 6-8 недель эутиреоза.'
        }
      ]
    },
    storm_worsens: {
      title: 'КРИТИЧЕСКОЕ УХУДШЕНИЕ',
      text: 'Состояние резко ухудшается. Температура 41.5°C, пульс 180, АД 180/110, бред. Это декомпенсация. Что делаете?',
      hint: 'Интенсивная терапия, охлаждение, седация.',
      timeLimit: 15,
      options: [
        {
          text: 'ИВЛ, пропранолол в/в, метимазол в/в, гидрокортизон 1000 мг, охлаждение, седация, консультация реаниматолога',
          correct: true,
          requires: ['Пропранолол', 'Метимазол', 'Гидрокортизон'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { pulse: -30, temp: -1.5, status: 'warning' },
            timeCost: 3,
            nextNode: 'storm_treated',
            log: 'Интенсивная терапия при декомпенсации'
          },
          feedback: '✅ Правильно! Интенсивная терапия: ИВЛ, блокада, тионамиды, стероиды, охлаждение, седация.'
        },
        {
          text: 'Парацетамол 1 г — лихорадка',
          correct: false,
          requires: ['Парацетамол'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { temp: 0.5, pulse: 20, status: 'critical' },
            timeCost: 2,
            nextNode: 'storm_death',
            log: 'Парацетамол вместо интенсивной терапии → смерть'
          },
          feedback: '❌ Смертельная ошибка! Парацетамол не остановит тиреоидный шторм. Нужна интенсивная терапия.'
        },
        {
          text: 'Жду эндокринолога — я не специалист',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: 0, temp: 0, status: 'critical' },
            timeCost: 3,
            nextNode: 'storm_death',
            log: 'Промедление → смерть'
          },
          feedback: '❌ Смертельная ошибка! Тиреоидный шторм — экстренная ситуация. Нужна немедленная терапия.'
        }
      ]
    },
    storm_rebound: {
      title: 'КРИТИЧЕСКОЕ УХУДШЕНИЕ',
      text: 'Через 6 часов — рецидив. Температура 40.5°C, пульс 160. Это рецидив тиреоидного шторма. Что делаете?',
      hint: 'Возобновление полной терапии.',
      timeLimit: 15,
      options: [
        {
          text: 'Возобновляю полную терапию: пропранолол, метимазол, йод, гидрокортизон, мониторинг',
          correct: true,
          requires: ['Пропранолол', 'Метимазол', 'Йодид калия', 'Гидрокортизон'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 0 },
            patient: { pulse: -20, temp: -1.0, status: 'warning' },
            timeCost: 3,
            nextNode: 'storm_treated',
            log: 'Возобновление терапии при рецидиве'
          },
          feedback: '✅ Правильно! Рецидив требует возобновления полной терапии.'
        },
        {
          text: 'Парацетамол — лихорадка',
          correct: false,
          requires: ['Парацетамол'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 2,
            nextNode: 'storm_death',
            log: 'Парацетамол при рецидиве → смерть'
          },
          feedback: '❌ Смертельная ошибка!'
        },
        {
          text: 'Отправляю домой — "это просто простуда"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 1,
            nextNode: 'storm_death',
            log: 'Отправка домой → смерть'
          },
          feedback: '❌ Преступная халатность!'
        }
      ]
    },
    storm_brady: {
      title: 'Осложнение: брадикардия',
      text: 'Пульс 45, АД 90/60. Это передозировка пропранолола. Что делаете?',
      hint: 'Отмена пропранолола, атропин, мониторинг.',
      timeLimit: 20,
      options: [
        {
          text: 'Отменяю пропранолол, ввожу атропин 1 мг в/в, мониторинг, вызов реанимации',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 1, docs: 0, comm: 1 },
            patient: { pulse: 20, status: 'warning' },
            timeCost: 3,
            nextNode: 'storm_treated',
            log: 'Отмена пропранолола, атропин'
          },
          feedback: '✅ Правильно! Отмена, атропин, мониторинг.'
        },
        {
          text: 'Продолжаю пропранолол — пульс должен нормализоваться',
          correct: false,
          requires: ['Пропранолол'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { pulse: -15, status: 'critical' },
            timeCost: 2,
            nextNode: 'storm_death',
            log: 'Продолжение пропранолола → асистолия'
          },
          feedback: '❌ Катастрофа!'
        },
        {
          text: 'Игнорирую — "само пройдет"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 5,
            nextNode: 'storm_death',
            log: 'Игнорирование → смерть'
          },
          feedback: '❌ Недопустимо!'
        }
      ]
    },
    storm_surgery_risk: {
      title: 'Осложнение: хирургический криз',
      text: 'После ранней тиреоидэктомии — тяжелый криз. Температура 42°C, пульс 200, АД коллапс. Что делаете?',
      hint: 'Интенсивная терапия, реанимация.',
      timeLimit: 15,
      options: [
        {
          text: 'ИВЛ, пропранолол, метимазол, гидрокортизон 2000 мг, охлаждение, седация, консультация реаниматолога',
          correct: true,
          requires: ['Пропранолол', 'Метимазол', 'Гидрокортизон'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { pulse: -30, temp: -2.0, status: 'critical' },
            timeCost: 3,
            nextNode: 'storm_treated',
            log: 'Интенсивная терапия после операции'
          },
          feedback: '✅ Правильно! Максимальная интенсивная терапия.'
        },
        {
          text: 'Парацетамол',
          correct: false,
          requires: ['Парацетамол'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 2,
            nextNode: 'storm_death',
            log: 'Парацетамол → смерть'
          },
          feedback: '❌ Смертельная ошибка!'
        },
        {
          text: 'Жду',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 3,
            nextNode: 'storm_death',
            log: 'Промедление → смерть'
          },
          feedback: '❌ Смертельная ошибка!'
        }
      ]
    },
    storm_death: {
      title: 'ТРАГИЧЕСКИЙ ИСХОД',
      text: 'К сожалению, пациент умер. Ваши действия привели к летальному исходу.',
      final: true,
      result: 'death',
      options: []
    }
  }
};

// =============================================================================
// КЕЙС 6: СЕПСИС (врач)
// =============================================================================
export const DOCTOR_SEPSIS: NodeScenario = {
  id: 'doctor-sepsis',
  title: 'Сепсис с легочной инфекцией',
  difficulty: 'medium',
  role: 'doctor',
  description: 'Мужчина 67 лет. Лихорадка 39.5°C, озноб, тахипноэ 32, SpO₂ 89%. Пневмония → сепсис.',
  tags: ['Инфекционные', 'Сепсис', 'Антибиотики', 'Surviving Sepsis'],
  startNode: 'start',
  initialPatient: {
    name: 'Виктор С.',
    age: '67 лет',
    avatar: '👨‍⚕️',
    gender: 'male',
    consciousness: 3,
    consciousnessText: 'Заторможенное',
    vitals: { bp_sys: 95, bp_dia: 60, pulse: 115, spo2: 89, rr: 32, temp: 39.5, pain: 4 },
    skin: 'Бледная, мраморная',
    status: 'critical'
  },
  inventory: ['Антибиотики', 'В/в катетер', 'Кристаллоиды', 'Вазопрессоры', 'Монитор', 'Кислородная маска', 'Анализы', 'Тонометр', 'Пульсоксиметр', 'Лактат'],
  nodes: {
    start: {
      title: 'Поступление пациента',
      text: 'Мужчина 67 лет. Температура 39.5°C, озноб, тахипноэ 32, SpO₂ 89%, АД 95/60, пульс 115. Сознание заторможенное. Анамнез: кашель 3 дня. Что делаете в первую очередь?',
      hint: 'Surviving Sepsis Campaign: 1ч пакет — лактат, культуры, антибиотики, жидкости.',
      timeLimit: 30,
      options: [
        {
          text: 'Лактат, культуры крови/мокроты, антибиотики в/в в течение 1 ч (цефотаксим + метронидазол), кристаллоиды 30 мл/кг, вазопрессоры при MAP <65, мониторинг',
          correct: true,
          requires: ['Антибиотики', 'В/в катетер', 'Кристаллоиды', 'Монитор'],
          effects: {
            score: { diagnosis: 2, treatment: 3, docs: 0, comm: 0 },
            patient: { bp_sys: 15, spo2: 3, status: 'warning' },
            timeCost: 5,
            nextNode: 'sepsis_treated',
            log: '1ч пакет: лактат, культуры, антибиотики, жидкости'
          },
          feedback: '✅ Идеально! 1ч пакет Surviving Sepsis: лактат, культуры, антибиотики в течение 1 ч, жидкости 30 мл/кг, вазопрессоры при MAP <65.'
        },
        {
          text: 'Жду результаты анализов — нужно знать возбудителя',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { bp_sys: -15, spo2: -3, status: 'critical' },
            timeCost: 10,
            nextNode: 'sepsis_worsens',
            log: 'Ожидание анализов → прогрессирование'
          },
          feedback: '❌ Смертельная потеря времени! Антибиотики должны быть в течение 1 ч. Каждый час промедления — смертность +7.6%.'
        },
        {
          text: 'Начинаю жидкости — сепсис = обезвоживание',
          correct: false,
          requires: ['Кристаллоиды'],
          effects: {
            score: { diagnosis: 0, treatment: 1, docs: 0, comm: 0 },
            patient: { bp_sys: 5, spo2: -2, status: 'critical' },
            timeCost: 3,
            nextNode: 'sepsis_worsens',
            log: 'Только жидкости — недостаточно'
          },
          feedback: '⚠️ Жидкости — важны, но недостаточно. Нужны антибиотики в течение 1 ч. Без них — септический шок.'
        }
      ]
    },
    sepsis_treated: {
      title: '1ч пакет выполнен',
      text: 'Антибиотики введены, жидкости 1500 мл. АД 105/70, пульс 105, SpO₂ 91%. Какие дальнейшие действия?',
      hint: '6ч пакет: вазопрессоры, СВР, коррекция лактата, источник инфекции.',
      timeLimit: 25,
      options: [
        {
          text: 'Вазопрессоры при MAP <65, СВР, коррекция лактата, поиск источника (рентген/КТ), консультация инфекциониста, документация',
          correct: true,
          requires: ['Вазопрессоры', 'Монитор'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 1, comm: 1 },
            patient: { bp_sys: 10, spo2: 2, status: 'warning' },
            timeCost: 4,
            nextNode: 'sepsis_stable',
            log: '6ч пакет: вазопрессоры, СВР, лактат, источник'
          },
          feedback: '✅ Отлично! 6ч пакет: вазопрессоры, СВР, коррекция лактата, поиск источника, консультация.'
        },
        {
          text: 'Отправляю домой — антибиотики помогут',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { bp_sys: -20, spo2: -5, status: 'critical' },
            timeCost: 1,
            nextNode: 'sepsis_death',
            log: 'Отправка домой → септический шок'
          },
          feedback: '❌ Смертельная ошибка! Сепсис требует госпитализации и интенсивного наблюдения.'
        },
        {
          text: 'Увеличиваю дозу антибиотиков — пусть будет сильнее',
          correct: false,
          requires: ['Антибиотики'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 2,
            nextNode: 'sepsis_toxic',
            log: 'Передозировка антибиотиков → токсичность'
          },
          feedback: '❌ Передозировка антибиотиков опасна! Нефротоксичность, ототоксичность. Доза должна быть адекватной.'
        }
      ]
    },
    sepsis_stable: {
      title: 'Стабилизация',
      text: 'Пациент стабилен. АД 115/75, пульс 95, SpO₂ 93%. Рентген: правосторонняя нижнедолевая пневмония. Какие дальнейшие действия?',
      hint: 'Продолжение антибиотиков, коррекция по культурам, профилактика тромбоза.',
      timeLimit: 25,
      options: [
        {
          text: 'Продолжаю антибиотики 7-10 дней, коррекция по чувствительности, профилактика ТГВ, респираторная реабилитация, документация',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 1, comm: 1 },
            patient: { status: 'stable' },
            timeCost: 4,
            nextNode: 'finish_good',
            log: 'Полный курс антибиотиков, профилактика, реабилитация'
          },
          feedback: '✅ Отлично! Полный курс, коррекция по чувствительности, профилактика ТГВ, реабилитация.'
        },
        {
          text: 'Отменяю антибиотики — пациент стабилен',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { temp: 1.0, status: 'critical' },
            timeCost: 2,
            nextNode: 'sepsis_rebound',
            log: 'Отмена антибиотиков → рецидив'
          },
          feedback: '❌ Отмена антибиотиков при сепсисе — рецидив. Курс минимум 7-10 дней.'
        },
        {
          text: 'Отправляю домой — "все хорошо"',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 1,
            nextNode: 'sepsis_death',
            log: 'Отправка домой → рецидив'
          },
          feedback: '❌ Сепсис требует наблюдения минимум 48-72 ч.'
        }
      ]
    },
    sepsis_worsens: {
      title: 'КРИТИЧЕСКОЕ УХУДШЕНИЕ',
      text: 'Состояние резко ухудшается. АД 75/50, пульс 140, SpO₂ 82%. Септический шок. Что делаете?',
      hint: 'Септический шок — немедленная реанимация.',
      timeLimit: 15,
      options: [
        {
          text: 'ИВЛ, норадреналин, антибиотики, жидкости, кортикостероиды, консультация реаниматолога',
          correct: true,
          requires: ['Вазопрессоры', 'Кристаллоиды', 'Антибиотики'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { bp_sys: 20, spo2: 5, status: 'warning' },
            timeCost: 3,
            nextNode: 'sepsis_treated',
            log: 'Реанимация при септическом шоке'
          },
          feedback: '✅ Правильно! ИВЛ, норадреналин, антибиотики, жидкости, стероиды — стандарт при септическом шоке.'
        },
        {
          text: 'Жду врача — я не реаниматолог',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { bp_sys: -20, pulse: 0, status: 'critical' },
            timeCost: 3,
            nextNode: 'sepsis_death',
            log: 'Промедление → смерть'
          },
          feedback: '❌ Смертельная ошибка! Септический шок требует немедленных действий.'
        },
        {
          text: 'Даю парацетамол — лихорадка 39.5°C',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 2,
            nextNode: 'sepsis_death',
            log: 'Парацетамол вместо реанимации → смерть'
          },
          feedback: '❌ Смертельная ошибка!'
        }
      ]
    },
    sepsis_rebound: {
      title: 'КРИТИЧЕСКОЕ УХУДШЕНИЕ',
      text: 'Через 12 часов — рецидив. Температура 40°C, АД 90/60. Рецидив сепсиса. Что делаете?',
      hint: 'Возобновление антибиотиков, поиск нового источника.',
      timeLimit: 15,
      options: [
        {
          text: 'Возобновляю антибиотики, новые культуры, поиск источника, консультация инфекциониста',
          correct: true,
          requires: ['Антибиотики'],
          effects: {
            score: { diagnosis: 1, treatment: 2, docs: 0, comm: 1 },
            patient: { status: 'warning' },
            timeCost: 3,
            nextNode: 'sepsis_treated',
            log: 'Возобновление антибиотиков при рецидиве'
          },
          feedback: '✅ Правильно!'
        },
        {
          text: 'Парацетамол',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 2,
            nextNode: 'sepsis_death',
            log: 'Парацетамол → смерть'
          },
          feedback: '❌ Смертельная ошибка!'
        },
        {
          text: 'Отправляю домой',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 1,
            nextNode: 'sepsis_death',
            log: 'Отправка домой → смерть'
          },
          feedback: '❌ Смертельная ошибка!'
        }
      ]
    },
    sepsis_toxic: {
      title: 'Токсичность антибиотиков',
      text: 'Пациент жалуется на шум в ушах, снижение слуха. Это ототоксичность аминогликозидов. Что делаете?',
      hint: 'Отмена ототоксичных препаратов, консультация ЛОР.',
      timeLimit: 20,
      options: [
        {
          text: 'Отменяю аминогликозиды, корректирую схему, консультация ЛОР, мониторинг функции почек',
          correct: true,
          requires: [],
          effects: {
            score: { diagnosis: 1, treatment: 1, docs: 0, comm: 1 },
            patient: { status: 'warning' },
            timeCost: 3,
            nextNode: 'sepsis_stable',
            log: 'Отмена аминогликозидов, коррекция'
          },
          feedback: '✅ Правильно! Отмена, коррекция, консультация ЛОР.'
        },
        {
          text: 'Продолжаю — инфекция важнее',
          correct: false,
          requires: ['Антибиотики'],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 2,
            nextNode: 'sepsis_death',
            log: 'Продолжение ототоксичности → глухота'
          },
          feedback: '❌ Ототоксичность необратима! Нужна отмена.'
        },
        {
          text: 'Игнорирую',
          correct: false,
          requires: [],
          effects: {
            score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
            patient: { status: 'critical' },
            timeCost: 5,
            nextNode: 'sepsis_death',
            log: 'Игнорирование → глухота'
          },
          feedback: '❌ Недопустимо!'
        }
      ]
    },
    sepsis_death: {
      title: 'ТРАГИЧЕСКИЙ ИСХОД',
      text: 'К сожалению, пациент умер от септического шока. Ваши действия привели к летальному исходу.',
      final: true,
      result: 'death',
      options: []
    }
  }
};

// =============================================================================
// ЭКСПОРТ ВСЕХ КЕЙСОВ
// =============================================================================
export const ALL_NODE_SCENARIOS: NodeScenario[] = [
  NURSE_OKS,
  NURSE_ANAPHYLAXIS,
  NURSE_HYPOGLYCEMIA,
  DOCTOR_STEMI,
  DOCTOR_THYROID_STORM,
  DOCTOR_SEPSIS
];
