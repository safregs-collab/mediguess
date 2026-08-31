/**
 * Маппинг ID нод из unified-графа → ID файлов графов нозологий DOC-W
 */
export const UNIFIED_TO_GRAPH_ID: Record<string, string> = {
  // cardiovascular
  'acs': 'myocardial-infarction',
  'im': 'myocardial-infarction',
  'olzhn': 'acute-heart-failure',
  'tela': 'dvt-pe',
  'infarct-cerebellar': 'stroke',
  'aortic-rupture': 'aortic-dissection',
  // infectious
  'sepsis': 'sepsis',
  'infective-endocarditis': 'endocarditis',
  'meningitis-encephalitis': 'meningitis',
  'pneumonia': 'pneumonia',
  // neurological
  'stroke': 'stroke',
  'status-epilepticus': 'status-epilepticus',
  // endocrine
  'thyrotoxicosis': 'thyroid-storm',
  'dka-hnk': 'diabetic-ketoacidosis',
  'hypoglycemia': 'diabetic-ketoacidosis',
  // hematological
  'anemia': 'anemia',
  'dic': 'sepsis',
  // respiratory
  'ards': 'copd-exacerbation',
  // surgical
  'perforation-git': 'gastrointestinal-bleeding',
  'acute-pancreatitis': 'pancreatitis',
  'bowel-obstruction': 'appendicitis',
};

export function resolveGraphId(unifiedId: string): string {
  return UNIFIED_TO_GRAPH_ID[unifiedId] || unifiedId;
}
