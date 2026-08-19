import type { Case, Stats, DailyState, GameCheckResult } from '../../../types';

const STOP_WORDS = new Set([
  'и','или','в','на','с','по','не','без','при','от','до','за','из','под','над',
  'о','об','про','для','к','у','во','со','ко','а','но','the','and','or','in','on',
  'at','to','of','for','with','without','a','an'
]);

function getMeaningfulWords(str: string): string[] {
  return normalize(str)
  .split(/\s+/)
  .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[ё]/g, 'е')
    .replace(/[^а-яa-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getDailyCaseIndex(casesLength: number): number {
  const day = getDayOfYear();
  return ((day % casesLength) + casesLength) % casesLength;
}

export function getDailyCase(cases: readonly Case[]): Case {
  return cases[getDailyCaseIndex(cases.length)];
}

export function getAllDiagnoses(cases: readonly Case[]): string[] {
  const set = new Set<string>();
  cases.forEach((c) => c.diagnosis.forEach((d) => set.add(d)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
}

export function checkDiagnosis(input: string, diagnoses: string[]): boolean {
  const normVal = normalize(input);
  if (!normVal || normVal.length < 2) return false;

  const inputWords = getMeaningfulWords(input);
  if (inputWords.length === 0) return false;

  return diagnoses.some((diag) => {
    const normDiag = normalize(diag);

    // 1. Полное совпадение строки
    if (normDiag === normVal) return true;

    // 2. Одна строка содержит другую целиком (для аббревиатур: ОИМ, ДКА, ТЭЛА)
    if (normDiag.includes(normVal) || normVal.includes(normDiag)) return true;

    // 3. Пересечение по значимым словам (хотя бы одно)
    const diagWords = getMeaningfulWords(diag);
    return inputWords.some(iw => diagWords.includes(iw));
  });
}

export function initDailyState(
  saved: DailyState | null,
  cases: readonly Case[]
): DailyState {
  const today = getTodayStr();
  if (saved && saved.date === today) {
    return saved;
  }
  const c = getDailyCase(cases);
  return {
    date: today,
    caseId: c.id,
    attempts: 0,
    history: [],
    finished: false,
    won: false,
  };
}

export function shouldResetStreak(lastPlayedDate: string | null, today: string): boolean {
  if (!lastPlayedDate) return false;
  const last = new Date(lastPlayedDate);
  const now = new Date(today);
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 1;
}

export function updateStats(
  stats: Stats,
  won: boolean,
  attempts: number,
  specialty: string
): Stats {
  const today = getTodayStr();
  const next: Stats = {
    ...stats,
    guessDistribution: [...stats.guessDistribution] as Stats['guessDistribution'],
    specialtyStats: { ...stats.specialtyStats },
  };

  // Сброс серии, если пропущен день
  if (shouldResetStreak(stats.lastPlayedDate, today)) {
    next.currentStreak = 0;
  }

  next.games += 1;

  if (won) {
    next.wins += 1;
    next.currentStreak += 1;
    next.guessDistribution[attempts - 1] += 1;
    if (next.currentStreak > next.maxStreak) {
      next.maxStreak = next.currentStreak;
    }
  } else {
    next.currentStreak = 0;
  }

  next.lastPlayedDate = today;

  if (!next.specialtyStats[specialty]) {
    next.specialtyStats[specialty] = { games: 0, wins: 0 };
  }
  next.specialtyStats[specialty].games += 1;
  if (won) {
    next.specialtyStats[specialty].wins += 1;
  }

  return next;
}

export function processGuess(
  input: string,
  currentCase: Case,
  attempts: number,
  maxAttempts: number = 6
): GameCheckResult {
  const correct = checkDiagnosis(input, currentCase.diagnosis);
  const newAttempts = attempts + 1;

  if (correct) {
    return {
      correct: true,
      finished: true,
      won: true,
      attempts: newAttempts,
      message: '✅ Верно!',
    };
  }

  if (newAttempts >= maxAttempts) {
    return {
      correct: false,
      finished: true,
      won: false,
      attempts: newAttempts,
      message: `❌ Поражение. Диагноз: ${currentCase.diagnosis[0]}`,
    };
  }

  return {
    correct: false,
    finished: false,
    won: false,
    attempts: newAttempts,
    message: '❌ Неверно. Следующая подсказка открыта!',
  };
}

export function getWinRate(stats: Stats): number {
  if (stats.games === 0) return 0;
  return Math.round((stats.wins / stats.games) * 100);
}

export function getSpecialtyWinRate(specStats: { games: number; wins: number }): number {
  if (specStats.games === 0) return 0;
  return Math.round((specStats.wins / specStats.games) * 100);
}
