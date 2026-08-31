/**
 * Типы для интеграции с Medical Meta Zone
 * Meta-книга как источник структурированных медицинских знаний
 */

// ===== Слои графа =====
export type MetaLayer = 'raw' | 'findings' | 'hypotheses' | 'differential' | 'evidence';

export type MetaNodeType =
  | 'lab'
  | 'finding'
  | 'symptom'
  | 'sign'
  | 'complication'
  | 'diagnosis'
  | 'comparison'
  | 'algorithm'
  | 'category'
  | 'meta-analysis'
  | 'rct'
  | 'cohort'
  | 'guideline'
  | 'review';

export type MetaLinkType =
  | 'causes'
  | 'associated'
  | 'suggests'
  | 'supports'
  | 'complication_of'
  | 'key_marker'
  | 'discriminates'
  | 'compared_in'
  | 'belongs_to'
  | 'includes'
  | 'treated_in'
  | 'covered_in'
  | 'studied_in'
  | 'described_in';

// ===== Ноды =====
export interface MetaNode {
  id: string;
  label: string;
  layer: MetaLayer;
  type: MetaNodeType;
  description?: string; // Краткое описание: что это, почему важно
  // raw
  unit?: string;
  normal?: string;
  value?: number;
  group?: string;
  // findings
  severity?: string;
  // hypotheses
  prevalence?: string;
  ptp?: 'high' | 'medium' | 'low';
  // evidence
  grade?: 'A' | 'B' | 'C';
  year?: number;
  n?: number;
}

// ===== Связи =====
export interface MetaLink {
  source: string;
  target: string;
  type: MetaLinkType;
  weight: number;
}

// ===== Детали диагноза =====
export interface MetaDiagnosisDetail {
  description: string;
  criteria: string[];
  prevalence: string;
  complications: string[];
  treatment: string[];
  followup: string;
}

// ===== Сравнительная таблица =====
export interface MetaComparison {
  headers: string[];
  rows: Record<string, string>[];
}

// ===== Доказательства =====
export interface MetaEvidence {
  title: string;
  authors: string;
  journal: string;
  year: number;
  n?: number;
  design: string;
  grade: 'A' | 'B' | 'C';
  key_findings: string[];
  quality: string;
}

// ===== Timeline =====
export interface MetaTimelinePoint {
  time: number;
  event: string;
  [key: string]: string | number;
}

// ===== Полный граф нозологии =====
export interface MetaGraph {
  id: string;
  label: string;
  color: string;
  nodes: MetaNode[];
  links: MetaLink[];
  details: Record<string, MetaDiagnosisDetail>;
  comparisons: Record<string, MetaComparison>;
  evidence: Record<string, MetaEvidence>;
  timelines: Record<string, MetaTimelinePoint[]>;
}

// ===== Индекс нозологий =====
export interface MetaNosologyIndexItem {
  id: string;
  label: string;
  color: string;
  file: string | null;
  nodeCount: number;
  linkCount: number;
  status: 'complete' | 'in_progress' | 'planned';
}

export interface MetaNosologyIndex {
  version: string;
  nosologies: MetaNosologyIndexItem[];
}

// ===== Ссылка из кейса DOC-W =====
export interface MetaCaseRef {
  nosoId: string;
  hypothesisId: string;
  layer1Ids?: string[];
  layer2Ids?: string[];
  diffId?: string;
  evidenceIds?: string[];
  timelineId?: string;
}

// ===== Разрешённые данные для UI =====
export interface MetaResolvedData {
  graph: MetaGraph;
  hypothesis: MetaNode;
  hypothesisDetail: MetaDiagnosisDetail | null;
  involvedNodes: MetaNode[];
  involvedLinks: MetaLink[];
  comparison: MetaComparison | null;
  evidenceList: MetaEvidence[];
  timeline: MetaTimelinePoint[] | null;
}

// ===== Конфиг адаптера =====
export interface MetaAdapterConfig {
  baseUrl: string;
  dataPath: string;
  cacheEnabled: boolean;
}
