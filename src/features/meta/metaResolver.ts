/**
 * Meta Resolver — адаптер для загрузки и разрешения данных Medical Meta Zone
 *
 * Архитектура:
 *   1. Графы загружаются динамически через import.meta.glob (code-splitting)
 *   2. Индекс встроен в бандл для мгновенного доступа
 *   3. Работает при любом base path и в offline (после первой загрузки)
 */

import type {
  MetaGraph,
  MetaNosologyIndex,
  MetaCaseRef,
  MetaResolvedData,
  MetaNode,
  MetaLink,
  MetaLayer,
} from './types';
import { MetaGraphSchema, MetaNosologyIndexSchema } from './schemas/graphSchema';

// Index всегда в бандле (маленький файл)
import indexData from './data/index.json';

// Dynamic imports для всех графов — каждый в отдельном чанке
const graphModules = import.meta.glob<{ default: MetaGraph }>('./data/graph-*.json');

// ===== Кэш =====
const graphCache = new Map<string, MetaGraph>();
let indexCache: MetaNosologyIndex | null = null;

function getGraphPath(nosoId: string): string | null {
  const path = `./data/graph-${nosoId}.json`;
  return graphModules[path] ? path : null;
}

// ===== Загрузка индекса =====
export async function loadNosologyIndex(): Promise<MetaNosologyIndex> {
  if (indexCache) return indexCache;

  const result = MetaNosologyIndexSchema.safeParse(indexData);
  if (!result.success) {
    // silent: indexCache = indexData as MetaNosologyIndex;
    indexCache = indexData as MetaNosologyIndex;
  } else {
    indexCache = result.data;
  }
  return indexCache;
}

// ===== Загрузка графа нозологии =====
export async function loadGraph(nosoId: string): Promise<MetaGraph | null> {
  if (graphCache.has(nosoId)) return graphCache.get(nosoId)!;

  const path = getGraphPath(nosoId);
  if (!path) {
    return null;
  }

  try {
    const module = await graphModules[path]();
    const data = module.default;

    const result = MetaGraphSchema.safeParse(data);
    if (!result.success) {
      graphCache.set(nosoId, data);
      return data;
    }

    graphCache.set(nosoId, result.data);
    return result.data;
  } catch (err) {
    return null;
  }
}

// ===== Предзагрузка всех графов =====
export async function preloadAllGraphs(): Promise<void> {
  const index = await loadNosologyIndex();
  const ready = index.nosologies.filter((n) => n.status === 'complete' && getGraphPath(n.id));
  await Promise.all(ready.map((n) => loadGraph(n.id)));
}

// ===== Очистка кэша =====
export function clearMetaCache(): void {
  graphCache.clear();
  indexCache = null;
}

// ===== Разрешение MetaCaseRef → MetaResolvedData =====
export async function resolveMetaCase(
  ref: MetaCaseRef
): Promise<MetaResolvedData | null> {
  const graph = await loadGraph(ref.nosoId);
  if (!graph) return null;

  // 1. Находим гипотезу (L3)
  const hypothesis = graph.nodes.find((n) => n.id === ref.hypothesisId);
  if (!hypothesis) {
    return null;
  }

  // 2. Детали диагноза
  const hypothesisDetail = graph.details[ref.hypothesisId] ?? null;

  // 3. Собираем вовлечённые ноды
  const involvedNodeIds = new Set<string>([ref.hypothesisId]);

  // L1 (сырые данные)
  ref.layer1Ids?.forEach((id) => involvedNodeIds.add(id));

  // L2 (клинические находки)
  ref.layer2Ids?.forEach((id) => involvedNodeIds.add(id));

  // L4 (дифференциал)
  if (ref.diffId) involvedNodeIds.add(ref.diffId);

  // L5 (доказательства)
  ref.evidenceIds?.forEach((id) => involvedNodeIds.add(id));

  // Timeline
  if (ref.timelineId) involvedNodeIds.add(ref.timelineId);

  // Добавляем ноды, связанные с гипотезой напрямую (соседи 1-го порядка)
  graph.links.forEach((link) => {
    if (link.source === ref.hypothesisId) involvedNodeIds.add(link.target);
    if (link.target === ref.hypothesisId) involvedNodeIds.add(link.source);
  });

  const involvedNodes = graph.nodes.filter((n) => involvedNodeIds.has(n.id));

  // 4. Собираем связи между вовлечёнными нодами
  const involvedNodeIdSet = new Set(involvedNodes.map((n) => n.id));
  const involvedLinks = graph.links.filter(
    (l) => involvedNodeIdSet.has(l.source) && involvedNodeIdSet.has(l.target)
  );

  // 5. Сравнительная таблица
  const comparison = ref.diffId ? (graph.comparisons[ref.diffId] ?? null) : null;

  // 6. Доказательства
  const evidenceList =
    ref.evidenceIds
      ?.map((id) => graph.evidence[id])
      .filter(Boolean) ?? [];

  // 7. Timeline
  const timeline = ref.timelineId
    ? (graph.timelines[ref.timelineId] ?? null)
    : null;

  return {
    graph,
    hypothesis,
    hypothesisDetail,
    involvedNodes,
    involvedLinks,
    comparison,
    evidenceList,
    timeline,
  };
}

// ===== Утилиты для поиска =====

/** Найти все гипотезы (L3) для заданных находок (L2) */
export function findHypothesesByFindings(
  graph: MetaGraph,
  findingIds: string[]
): Array<{ node: MetaNode; score: number }> {
  const scores = new Map<string, number>();

  graph.links.forEach((link) => {
    if (
      findingIds.includes(link.source) &&
      link.target.startsWith('diff_') === false &&
      link.target.startsWith('meta_') === false
    ) {
      const targetNode = graph.nodes.find((n) => n.id === link.target);
      if (targetNode?.layer === 'hypotheses') {
        scores.set(link.target, (scores.get(link.target) || 0) + link.weight);
      }
    }
  });

  return Array.from(scores.entries())
    .map(([id, score]) => ({
      node: graph.nodes.find((n) => n.id === id)!,
      score,
    }))
    .filter((x) => x.node)
    .sort((a, b) => b.score - a.score);
}

/** Получить цепочку доказательств для гипотезы */
export function getEvidenceTrail(
  graph: MetaGraph,
  hypothesisId: string
): MetaNode[] {
  const evidenceIds = new Set<string>();

  graph.links.forEach((link) => {
    if (link.source === hypothesisId && link.target.startsWith('meta_')) {
      evidenceIds.add(link.target);
    }
  });

  return graph.nodes.filter((n) => evidenceIds.has(n.id));
}

/** Получить дифференциал для гипотезы */
export function getDifferentialForHypothesis(
  graph: MetaGraph,
  hypothesisId: string
): Array<{ comparisonId: string; label: string }> {
  const result: Array<{ comparisonId: string; label: string }> = [];

  graph.links.forEach((link) => {
    if (link.source === hypothesisId && link.type === 'compared_in') {
      const compNode = graph.nodes.find((n) => n.id === link.target);
      if (compNode) {
        result.push({ comparisonId: compNode.id, label: compNode.label });
      }
    }
  });

  return result;
}

/** Получить все ноды заданного слоя */
export function getNodesByLayer(
  graph: MetaGraph,
  layer: MetaLayer
): MetaNode[] {
  return graph.nodes.filter((n) => n.layer === layer);
}

/** Получить соседей ноды */
export function getNeighbors(
  graph: MetaGraph,
  nodeId: string
): Array<{ node: MetaNode; link: MetaLink }> {
  const result: Array<{ node: MetaNode; link: MetaLink }> = [];

  graph.links.forEach((link) => {
    if (link.source === nodeId) {
      const node = graph.nodes.find((n) => n.id === link.target);
      if (node) result.push({ node, link });
    } else if (link.target === nodeId) {
      const node = graph.nodes.find((n) => n.id === link.source);
      if (node) result.push({ node, link });
    }
  });

  return result;
}
