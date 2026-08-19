import { cases, getDailyCase, getRandomCase } from '../data/cases';
import { getRandomRoleplayCase } from '../data/roleplay';
import { getRandomSimulatorCase } from '../data/simulator';
import type { Case, RoleplayCase, SimulatorCase } from '../types';

const STORAGE_KEY = 'mediguess_played_cases';

function getPlayedCases(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function markCasePlayed(id: number) {
  const played = new Set(getPlayedCases());
  played.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...played]));
}

export function selectDailyCase(): Case {
  return getDailyCase();
}

export function selectEndlessCase(): Case {
  const played = getPlayedCases();
  const unplayed = cases.filter(c => !played.includes(c.id));
  const pool = unplayed.length > 0 ? unplayed : cases;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  markCasePlayed(selected.id);
  return selected;
}

export function selectRoleplayCase(role?: string): RoleplayCase {
  return getRandomRoleplayCase(role, getPlayedCases());
}

export function selectSimulatorCase(): SimulatorCase {
  return getRandomSimulatorCase();
}
