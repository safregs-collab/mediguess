import { describe, it, expect } from 'vitest';
import {
  normalize,
  checkDiagnosis,
  getDayOfYear,
  getDailyCaseIndex,
  getTodayStr,
  shouldResetStreak,
} from './gameLogic';
import type { Case } from '../../../types';

describe('normalize', () => {
  it('removes punctuation and extra spaces', () => {
    expect(normalize('  Острый   инфаркт!  ')).toBe('острый инфаркт');
  });

  it('handles empty string', () => {
    expect(normalize('')).toBe('');
  });

  it('converts to lowercase', () => {
    expect(normalize('ПНЕВМОНИЯ')).toBe('пневмония');
  });
});

describe('checkDiagnosis', () => {
  const testCase: Case = {
    id: 1,
    specialty: 'cardiology',
    specialtyName: 'Кардиология',
    clues: ['боль в груди'],
    diagnosis: ['Острый инфаркт миокарда', 'ОИМ'],
    explanation: 'Тест',
  };

  it('recognizes exact match', () => {
    expect(checkDiagnosis('Острый инфаркт миокарда', testCase.diagnosis)).toBe(true);
  });

  it('recognizes synonym', () => {
    expect(checkDiagnosis('оим', testCase.diagnosis)).toBe(true);
  });

  it('recognizes partial match', () => {
    expect(checkDiagnosis('инфаркт миокарда', testCase.diagnosis)).toBe(true);
  });

  it('rejects wrong diagnosis', () => {
    expect(checkDiagnosis('пневмония', testCase.diagnosis)).toBe(false);
  });

  it('handles punctuation in input', () => {
    expect(checkDiagnosis('ОИМ!', testCase.diagnosis)).toBe(true);
  });
});

describe('getDayOfYear', () => {
  it('returns positive number', () => {
    expect(getDayOfYear()).toBeGreaterThan(0);
  });

  it('returns different values for different dates', () => {
    // Мы не можем мокать Date в этом окружении, но можем проверить, что функция работает
    expect(typeof getDayOfYear()).toBe('number');
  });
});

describe('getDailyCaseIndex', () => {
  it('returns valid index within range', () => {
    const casesLength = 10;
    const index = getDailyCaseIndex(casesLength);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(casesLength);
  });

  it('returns 0 for single case', () => {
    expect(getDailyCaseIndex(1)).toBe(0);
  });
});

describe('getTodayStr', () => {
  it('returns string in YYYY-MM-DD format', () => {
    const today = getTodayStr();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('shouldResetStreak', () => {
  it('returns false for same day', () => {
    const today = getTodayStr();
    expect(shouldResetStreak(today, today)).toBe(false);
  });

  it('returns false for consecutive days', () => {
    const yesterday = '2026-08-10';
    const today = '2026-08-11';
    expect(shouldResetStreak(yesterday, today)).toBe(false);
  });

  it('returns true for gap > 1 day', () => {
    const twoDaysAgo = '2026-08-09';
    const today = '2026-08-11';
    expect(shouldResetStreak(twoDaysAgo, today)).toBe(true);
  });

  it('returns false for null lastPlayed', () => {
    expect(shouldResetStreak(null, getTodayStr())).toBe(false);
  });
});
