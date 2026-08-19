import casesJson from './cases.json';
import type { Case } from '../../types';

export const cases: Case[] = casesJson as Case[];

export const specialties = Array.from(
  new Map(cases.map(c => [c.specialty, c.specialtyName]))
);

export function getCaseById(id: number): Case | undefined {
  return cases.find(c => c.id === id);
}

export function getCasesBySpecialty(specialty: string): Case[] {
  return cases.filter(c => c.specialty === specialty);
}

export function getDailyCaseIndex(casesLength: number): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return ((day % casesLength) + casesLength) % casesLength;
}

export function getDailyCase(): Case {
  return cases[getDailyCaseIndex(cases.length)];
}

export function getRandomCase(excludeIds: number[] = []): Case {
  const available = cases.filter(c => !excludeIds.includes(c.id));
  const pool = available.length > 0 ? available : cases;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getAllDiagnoses(): string[] {
  const set = new Set<string>();
  cases.forEach(c => c.diagnosis.forEach(d => set.add(d)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
}
