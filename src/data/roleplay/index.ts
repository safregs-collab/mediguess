import roleplayJson from './roleplayCases.json';
import type { RoleplayCase, RoleInfo } from '../../types';

export const roleplayCases: RoleplayCase[] = roleplayJson as RoleplayCase[];

export const roles: RoleInfo[] = [
  { key: 'nurse', label: 'Медсестра', icon: '👩‍⚕️', desc: 'Экстренные ситуации в палате', difficulty: 1 },
  { key: 'intern', label: 'Интерн', icon: '🩺', desc: 'Первичный приём и диагностика', difficulty: 2 },
  { key: 'resident', label: 'Ординатор', icon: '📋', desc: 'Сложные случаи в стационаре', difficulty: 2 },
  { key: 'physician', label: 'Врач', icon: '👨‍⚕️', desc: 'Редкие и тяжёлые патологии', difficulty: 3 },
  { key: 'surgeon', label: 'Хирург', icon: '🔪', desc: 'Острые хирургические состояния', difficulty: 3 },
  { key: 'anesthesiologist', label: 'Анестезиолог', icon: '💉', desc: 'Периоперационные осложнения', difficulty: 3 },
  { key: 'therapist', label: 'Терапевт', icon: '🏥', desc: 'Хронические и острые заболевания', difficulty: 2 },
  { key: 'pediatrician', label: 'Педиатр', icon: '👶', desc: 'Детские патологии', difficulty: 2 },
];

export function getRoleplayCaseById(id: number): RoleplayCase | undefined {
  return roleplayCases.find(c => c.id === id);
}

export function getCasesByRole(role: string): RoleplayCase[] {
  return roleplayCases.filter(c => c.role === role);
}

export function getRandomRoleplayCase(role?: string, excludeIds: number[] = []): RoleplayCase {
  const pool = role
    ? roleplayCases.filter(c => c.role === role && !excludeIds.includes(c.id))
    : roleplayCases.filter(c => !excludeIds.includes(c.id));
  const finalPool = pool.length > 0 ? pool : roleplayCases;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export function getAllRoleplayDiagnoses(): string[] {
  const set = new Set<string>();
  roleplayCases.forEach(c => c.diagnosis.forEach(d => set.add(d)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
}
