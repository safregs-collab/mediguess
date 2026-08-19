import type { RoleplayCase, RoleplayState, GameCheckResult } from '../../../types';
import { normalize } from './gameLogic';

// =============================================================================
// РОЛЕВОЙ РЕЖИМ — изолированная логика
// Не использует stats, streak, localStorage, daily/endless состояния
// =============================================================================

const RP_STOP_WORDS = new Set([
  'и','или','в','на','с','по','не','без','при','от','до','за','из','под','над',
  'о','об','про','для','к','у','во','со','ко','а','но','the','and','or','in','on',
  'at','to','of','for','with','without','a','an','как','это','что','где','когда'
]);

function getMeaningfulWords(str: string): string[] {
  return normalize(str)
    .split(/\s+/)
    .filter(w => w.length >= 3 && !RP_STOP_WORDS.has(w));
}

/**
 * Проверка диагноза в ролевом режиме
 * Логика строже: требуется совпадение по значимым словам или полное вхождение
 */
export function checkRoleplayDiagnosis(input: string, diagnoses: string[]): boolean {
  const normVal = normalize(input);
  if (!normVal || normVal.length < 2) return false;

  const inputWords = getMeaningfulWords(input);
  if (inputWords.length === 0) return false;

  return diagnoses.some((diag) => {
    const normDiag = normalize(diag);

    // 1. Полное совпадение строки
    if (normDiag === normVal) return true;

    // 2. Одна строка содержит другую целиком
    if (diag.toLowerCase().includes(normVal) || normVal.includes(normDiag)) return true;

    // 3. Пересечение по значимым словам (хотя бы 2 слова для ролевого — строже)
    const diagWords = getMeaningfulWords(diag);
    const matches = inputWords.filter(iw => diagWords.includes(iw));
    return matches.length >= 2 || (matches.length >= 1 && inputWords.length === 1);
  });
}

export function initRoleplayState(
  saved: RoleplayState | null,
  currentCase: RoleplayCase | null
): RoleplayState {
  if (saved && currentCase && saved.caseId === currentCase.id) {
    return saved;
  }
  if (!currentCase) {
    return {
      caseId: 0,
      role: null,
      attempts: 0,
      history: [],
      finished: false,
      won: false,
    };
  }
  return {
    caseId: currentCase.id,
    role: currentCase.role,
    attempts: 0,
    history: [],
    finished: false,
    won: false,
  };
}

export function processRoleplayGuess(
  input: string,
  currentCase: RoleplayCase,
  attempts: number,
  maxAttempts: number = 6
): GameCheckResult {
  const correct = checkRoleplayDiagnosis(input, currentCase.diagnosis);
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
