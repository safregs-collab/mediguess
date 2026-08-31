import type { CrRegistry, ClinicalRecommendation } from '../types/crSchema';
import { CrRegistrySchema, ClinicalRecommendationSchema } from '../schemas/crZodSchema';

const DATA_BASE = '/data';

/**
 * Load the CR registry from /data/cr-registry.json.
 * Validates with Zod at runtime.
 */
export async function loadCrRegistry(): Promise<CrRegistry> {
  const res = await fetch(`${DATA_BASE}/cr-registry.json`);
  if (!res.ok) throw new Error(`Failed to load CR registry: ${res.status}`);
  const raw = await res.json();
  return CrRegistrySchema.parse(raw);
}

/**
 * Load a single ClinicalRecommendation by its filePath from the registry.
 * Validates with Zod at runtime.
 */
export async function loadClinicalRecommendation(filePath: string): Promise<ClinicalRecommendation> {
  const res = await fetch(`${DATA_BASE}/${filePath}`);
  if (!res.ok) throw new Error(`Failed to load CR ${filePath}: ${res.status}`);
  const raw = await res.json();
  return ClinicalRecommendationSchema.parse(raw);
}

/**
 * Convenience: load a CR by its registry ID (e.g. "cr-208-v3").
 */
export async function loadCrById(id: string): Promise<ClinicalRecommendation> {
  const registry = await loadCrRegistry();
  const item = registry.items.find((i) => i.id === id);
  if (!item) throw new Error(`CR ${id} not found in registry`);
  return loadClinicalRecommendation(item.filePath);
}
