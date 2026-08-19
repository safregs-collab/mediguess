# MediGuess — Рефакторинг DOC-0.0.1

## Что это

Рефакторинг исходного проекта **MediGuess** с целью выноса данных из компонентов в отдельные модули. Теперь добавление новых кейсов не требует изменения React-компонентов.

## Структура проекта

```
src/
├── types/
│   └── index.ts              # Все TypeScript-интерфейсы
├── data/
│   ├── cases/
│   │   ├── cases.json        # Обычные клинические кейсы
│   │   └── index.ts          # Утилиты: фильтрация, выбор, поиск
│   ├── roleplay/
│   │   ├── roleplayCases.json # Ролевые кейсы
│   │   └── index.ts          # Метаданные ролей + утилиты
│   └── simulator/
│       ├── scenarios.ts      # Сценарии симулятора
│       └── index.ts          # Логика оценки приёма
├── lib/
│   ├── caseSelector.ts       # Централизованный выбор кейсов
│   └── gameLogic.ts          # Нормализация, проверка диагнозов
├── store/
│   └── gameStore.ts          # Zustand-стор с persist
└── components/
    ├── modes/
    │   ├── DailyMode.tsx     # Ежедневный режим
    │   ├── EndlessMode.tsx   # Бесконечный режим
    │   ├── ArchiveMode.tsx   # Архив с поиском
    │   ├── RoleplayMode.tsx  # Ролевой режим
    │   └── SimulatorMode.tsx # Симулятор врачебного приёма
    └── ui/
        ├── Header.tsx        # Шапка с табами
        ├── StatsModal.tsx    # Модальное окно статистики
        └── ToastContainer.tsx # Уведомления
```

## Как добавить новый кейс

### Обычный кейс (Ежедневный / Бесконечный / Архив)

Отредактируй `src/data/cases/cases.json`:

```json
{
  "id": 999,
  "specialty": "cardiology",
  "specialtyName": "Кардиология",
  "clues": [
    "Пациент 55 лет, давящая боль за грудиной",
    "Боль иррадиирует в левую руку",
    "ЭКГ: подъём сегмента ST"
  ],
  "diagnosis": ["Острый инфаркт миокарда", "ОИМ"],
  "explanation": "Классическая картина ОИМ с типичной иррадиацией боли...",
  "ankiTag": "OIM-cardio-001"
}
```

### Ролевой кейс

Отредактируй `src/data/roleplay/roleplayCases.json`:

```json
{
  "id": 201,
  "role": "surgeon",
  "roleName": "Хирург",
  "difficulty": 4,
  "clues": ["..."],
  "diagnosis": ["Острый аппендицит"],
  "explanation": "...",
  "ankiTag": "appendicitis-surg-001"
}
```

### Сценарий симулятора

Отредактируй `src/data/simulator/scenarios.ts`:

```typescript
{
  id: 6,
  specialty: 'nephrology',
  specialtyName: 'Нефрология',
  title: 'Отёки и гипертензия',
  stages: {
    anamnesis: '...',
    tests: ['Анализ мочи', 'Креатинин', '...'],
    keyTests: ['Анализ мочи', 'Креатинин'],
    diagnosisOptions: ['...'],
    correctDiagnosis: '...',
    treatmentOptions: ['...'],
    correctTreatment: '...',
    explanation: '...'
  }
}
```

## Как мигрировать с оригинального проекта

1. Скопируй содержимое папки `src/` в свой проект
2. Убедись, что в `tsconfig.json` есть:
   ```json
   {
     "compilerOptions": {
       "resolveJsonModule": true,
       "esModuleInterop": true
     }
   }
   ```
3. Установи зависимости:
   ```bash
   npm install zustand
   ```
4. Замени `main.tsx` на новый из `src/main.tsx`
5. Удали старые компоненты `App.tsx`, `ArchiveGrid.tsx` и т.д.

## Что изменилось

| Было | Стало |
|------|-------|
| `cases.json` в корне без типов | `src/data/cases/index.ts` — типизированный модуль |
| Данные зашиты в компонентах | Чистое разделение: data → lib → store → components |
| `ArchiveGrid.tsx` — 182KB монолит | `ArchiveMode.tsx` — чистый компонент |
| Симулятор без типизации | Полная типизация `SimulatorCase` + `SimulatorState` |
| Роли дублируются в коде | Централизованный `roles[]` |
| Логика выбора кейсов размазана | `caseSelector.ts` — единая точка входа |
| Нет поиска по архиву | `ArchiveMode` с поиском по диагнозам/симптомам |
| Симулятор — input текстом | Чекбоксы анализов + кнопки диагнозов |

## Архитектура данных

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  cases.json     │────▶│  data/cases/    │────▶│  caseSelector   │
│  roleplayCases  │     │  data/roleplay/ │     │  lib/           │
│  scenarios.ts   │     │  data/simulator/│     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                       │
                              ┌────────────────────────┘
                              ▼
                       ┌──────────────┐
                       │  gameStore   │
                       │  (Zustand)   │
                       └──────┬───────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐    ┌──────────┐    ┌──────────┐
        │DailyMode│    │ArchiveMode│   │Simulator │
        │Endless  │    │Roleplay  │    │Mode      │
        └─────────┘    └──────────┘    └──────────┘
```

## Лицензия

Образовательный проект. Медицинский контент 🔞 16+.