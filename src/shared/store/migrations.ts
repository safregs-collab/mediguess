import type { Stats } from '../../types';
export const CURRENT_SCHEMA_VERSION = 5;

function migrate_v4_to_v5(raw: any): any {
  const ps = { nurse: { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 }, paramedic: { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 }, doctor: { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 } };
  const cases: any[] = []; const sim: any[] = [];
  const oc = raw.completedCases || {};
  ['daily', 'endless', 'roleplay'].forEach((k) => { (oc[k] || []).forEach((e: any) => cases.push({ id: String(e.id), won: e.won, date: e.date || new Date().toISOString(), profession: 'doctor', mode: 'cases' })); });
  (oc.simulation || []).forEach((e: any) => sim.push({ id: String(e.id), won: e.won, date: e.date || new Date().toISOString(), profession: 'doctor', mode: 'simulator' }));
  return { ...raw, professionStats: ps, completedCases: { cases, simulator: sim }, _schemaVersion: 5 };
}

const MIGRATIONS: Record<number, (raw: any) => any> = { 4: migrate_v4_to_v5 };

export function runMigrations(raw: any): Stats {
  if (!raw || typeof raw !== 'object') return getDefaultStats();
  let v = raw._schemaVersion || 4;
  while (v < CURRENT_SCHEMA_VERSION) {
    const m = MIGRATIONS[v];
    if (!m) { console.warn(`[Migrations] No migrator for ${v}`); return getDefaultStats(); }
    raw = m(raw); v = raw._schemaVersion;
  }
  if (!raw.completedCases) raw.completedCases = { cases: [], simulator: [] };
  if (!Array.isArray(raw.completedCases.cases)) raw.completedCases.cases = [];
  if (!Array.isArray(raw.completedCases.simulator)) raw.completedCases.simulator = [];
  if (!raw.professionStats) raw.professionStats = { nurse: { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 }, paramedic: { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 }, doctor: { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 } };
  return raw as Stats;
}

export function getDefaultStats(): Stats {
  return {
    _schemaVersion: CURRENT_SCHEMA_VERSION, games: 0, wins: 0, currentStreak: 0, maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0], specialtyStats: {}, lastPlayedDate: null,
    professionStats: { nurse: { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 }, paramedic: { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 }, doctor: { games: 0, wins: 0, casesCompleted: 0, simCompleted: 0, bestStreak: 0 } },
    completedCases: { cases: [], simulator: [] }, xp: { totalXp: 0, level: 1 }, achievements: [],
    metaStats: { casesCompleted: 0, perfectCases: 0, evidenceEvaluated: 0, algorithmsCompleted: 0, scalesUsed: 0, specialistLevelCompleted: false },
  };
}
