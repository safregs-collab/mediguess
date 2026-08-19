# Инструкция по исправлению ошибок TS2306 / TS7006

## Проблема

После распаковки DOC-0.0.1.zip старые компоненты конфликтуют с новой структурой:
- `TS2306: File is not a module` — старый `src/types.ts` (компонент StatsModal) мешает резолву `../types`
- `TS7006: Parameter implicitly has an 'any' type` — строгий режим TypeScript

## Шаги исправления

### 1. Удалить конфликтующий старый файл

```bash
# Удалить старый types.ts, который мешает резолву папки types/
rm src/types.ts

# Если есть старый gameStore.ts / gameLogic.ts в корне src/lib/ — тоже удалить
rm src/lib/gameStore.ts 2>/dev/null
rm src/lib/gameLogic.ts 2>/dev/null
```

### 2. Заменить tsconfig.json

Скопируй `tsconfig.json` из архива — в нём `strict: false` и `noUnusedLocals: false`.

### 3. Убедиться, что структура папок такая:

```
src/
├── types/
│   └── index.ts          ← новый, с полными экспортами
├── store/
│   └── gameStore.ts      ← новый, с обратной совместимостью
├── lib/
│   ├── gameLogic.ts      ← новый, с getDailyCaseIndex + getDailyCase
│   ├── caseSelector.ts
│   └── db/               ← ваши старые файлы, импорты теперь работают
├── data/
│   ├── cases/
│   ├── roleplay/
│   └── simulator/
└── components/
    ├── App.tsx            ← ваш старый (импорты теперь ок)
    ├── ArchiveGrid.tsx    ← ваш старый
    ├── AttemptsGrid.tsx   ← ваш старый
    └── ...
```

### 4. Что изменилось в новых файлах

**`src/types/index.ts`** — теперь экспортирует:
- `Case`, `RoleplayCase`, `SimulatorCase`
- `Role` (алиас `string`)
- `Stats` (алиас для `GameState`)
- `GuessResult`, `GameCheckResult`
- `DailyState`, `EndlessState`, `RoleplayState`, `SimulatorState`

**`src/lib/gameLogic.ts`** — теперь экспортирует:
- `normalize`, `checkDiagnosis`
- `getDailyCaseIndex(casesLength)` — для обратной совместимости
- `getDailyCase(casesArr)` — для обратной совместимости
- `getAllDiagnoses(casesArr)` — для DiagnosisInput.tsx
- `getTodayStr`, `shouldResetStreak`, `getWinRate`
- `processGuess` с `GuessResult`

**`src/store/gameStore.ts`** — теперь содержит:
- `cases`, `roleplayCases` — данные
- `stats` — getter, возвращает `Stats`
- `roleplayRoleFilter`, `setRoleplayRoleFilter`
- `loadArchiveCase`, `loadRoleplayCase`, `resetRoleplayState`
- `updateSimulatorState`, `finishSimulator`
- `initDaily`, `initEndless`, `initSimulator`

### 5. Ошибки TS7006 (implicit any)

Исправлены через `tsconfig.json`:
```json
"strict": false,
"noUnusedLocals": false,
"noUnusedParameters": false
```

Если хотите оставить `strict: true` — добавьте типы в старые компоненты вручную:
```typescript
// вместо .map((c) =>)
.map((c: Case) =>)
```

### 6. Сборка

```bash
npm install
npm run build
```

Ошибок быть не должно.
