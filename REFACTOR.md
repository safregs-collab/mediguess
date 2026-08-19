# MediGuess Refactoring — DOC-0.0.1

## Что сделано

### 1. Вынесены данные из компонентов
- `src/data/cases/cases.json` — все стандартные кейсы
- `src/data/roleplay/roleplayCases.json` — 28 ролевых кейсов по 8 специальностям
- `src/data/simulator/scenarios.ts` — сценарии симулятора

### 2. Централизованные типы
- `src/types/index.ts` — единый источник правды для всех интерфейсов

### 3. Изолированная бизнес-логика
- `src/lib/normalize.ts` — нормализация строк (ё→е, стоп-слова)
- `src/lib/gameLogic.ts` — проверка диагнозов, обновление статистики, streak
- `src/lib/caseSelector.ts` — детерминированный выбор ежедневного кейса, случайный для бесконечного

### 4. Переписанный store
- `src/store/gameStore.ts` — Zustand + persist, чистые экшены, разделение UI и игрового состояния

### 5. Разделённые компоненты
```
components/
  ui/
    AttemptsGrid.tsx    — сетка попыток
    CluesList.tsx       — список подсказок
    DiagnosisInput.tsx  — input с autocomplete
    ResultPanel.tsx     — панель результата
    ToastContainer.tsx  — уведомления
  modes/
    DailyMode.tsx       — ежедневный режим
    EndlessMode.tsx     — бесконечный режим
    ArchiveMode.tsx     — архив с поиском
    RoleplayMode.tsx    — ролевой режим
    SimulatorMode.tsx   — симулятор приёма
```

### 6. Новые возможности
- **Поиск по архиву** — по симптомам и диагнозам
- **Autocomplete** диагнозов при вводе
- **Lazy loading** режимов через React.lazy
- **Чеклист анализов** в симуляторе вместо текстового ввода
- **Рейтинг приёма** 0–100 баллов с разбивкой

## Как мигрировать свои данные

1. Добавьте новые кейсы в `src/data/cases/cases.json`
2. Добавьте ролевые кейсы в `src/data/roleplay/roleplayCases.json`
3. Добавьте сценарии в `src/data/simulator/scenarios.ts`

Формат JSON строго типизирован — TypeScript подскажет, если что-то не так.

## Следующие шаги (рекомендации)

- [ ] Добавить `StatsModal` и `HowToModal` компоненты
- [ ] Подключить CSS/SCSS с переменными для тёмной темы
- [ ] Добавить PWA (service worker, manifest)
- [ ] Интеграция с бэкендом для синхронизации прогресса
- [ ] Система достижений и бейджей
- [ ] Duel mode (мультиплеер)
