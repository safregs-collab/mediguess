import type { Case, Stats, DailyState, GameCheckResult } from '../types';

const STOP_WORDS = new Set([
  'и','или','в','на','с','по','не','без','при','от','до','за','из','под','над',
  'о','об','про','для','к','у','во','со','ко','а','но','the','and','or','in','on',
  'at','to','of','for','with','without','a','an'
]);

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[ё]/g, 'е')
    .replace(/[^а-яa-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMeaningfulWords(str: string): string[] {
  return normalize(str)
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function checkDiagnosis(input: string, diagnoses: string[]): boolean {
  const normVal = normalize(input);
  if (!normVal || normVal.length < 2) return false;

  const inputWords = getMeaningfulWords(input);
  if (inputWords.length === 0) return false;

  return diagnoses.some((diag) => {
    const normDiag = normalize(diag);
    if (normDiag === normVal) return true;
    if (normDiag.includes(normVal) || normVal.includes(normDiag)) return true;
    const diagWords = getMeaningfulWords(diag);
    return inputWords.some(iw => diagWords.includes(iw));
  });
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
