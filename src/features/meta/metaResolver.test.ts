import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadNosologyIndex,
  loadGraph,
  clearMetaCache,
  resolveMetaCase,
  findHypothesesByFindings,
  getEvidenceTrail,
  getDifferentialForHypothesis,
  getNodesByLayer,
  getNeighbors,
} from './metaResolver';
import type { MetaGraph, MetaCaseRef } from './types';

// Mock console methods to keep test output clean
const originalWarn = console.warn;
const originalLog = console.log;
beforeEach(() => {
  console.warn = vi.fn();
  console.log = vi.fn();
  clearMetaCache();
});
afterEach(() => {
  console.warn = originalWarn;
  console.log = originalLog;
});

const mockGraph: MetaGraph = {
  id: 'test-noso',
  label: 'Test Noso',
  color: '#3b82f6',
  nodes: [
    { id: 'raw_1', label: 'Raw 1', layer: 'raw', type: 'lab', unit: 'mmol/L', normal: '3.5-5.0' },
    { id: 'find_1', label: 'Finding 1', layer: 'findings', type: 'finding', severity: 'severe' },
    { id: 'hypo_1', label: 'Hypothesis 1', layer: 'hypotheses', type: 'diagnosis', prevalence: 'common', ptp: 'high' },
    { id: 'diff_1', label: 'Differential 1', layer: 'differential', type: 'comparison' },
    { id: 'meta_1', label: 'Evidence 1', layer: 'evidence', type: 'meta-analysis', grade: 'A', year: 2023 },
  ],
  links: [
    { source: 'raw_1', target: 'find_1', type: 'causes', weight: 1 },
    { source: 'find_1', target: 'hypo_1', type: 'suggests', weight: 2 },
    { source: 'hypo_1', target: 'diff_1', type: 'compared_in', weight: 1 },
    { source: 'hypo_1', target: 'meta_1', type: 'supports', weight: 1 },
  ],
  details: {
    hypo_1: { description: 'Detail for hypo 1', criteria: [], prevalence: '', complications: [], treatment: [], followup: '' },
  },
  comparisons: {
    diff_1: { headers: [], rows: [] },
  },
  evidence: {
    meta_1: { title: 'Test', authors: 'Test', journal: 'Test', year: 2023, design: 'RCT', grade: 'A', key_findings: [], quality: 'high' },
  },
  timelines: {},
};

describe('metaResolver', () => {
  describe('loadNosologyIndex', () => {
    it('returns index data', async () => {
      const index = await loadNosologyIndex();
      expect(index).toBeDefined();
      expect(Array.isArray(index.nosologies)).toBe(true);
    });

    it('caches index after first load', async () => {
      const first = await loadNosologyIndex();
      const second = await loadNosologyIndex();
      expect(second).toBe(first);
    });
  });

  describe('loadGraph', () => {
    it('returns null for unknown graph', async () => {
      const result = await loadGraph('unknown-id');
      expect(result).toBeNull();
    });

    it('caches graph after first load', async () => {
      const first = await loadGraph('sepsis');
      const second = await loadGraph('sepsis');
      expect(second).toBe(first);
    });
  });

  describe('clearMetaCache', () => {
    it('clears graph cache', async () => {
      await loadGraph('sepsis');
      clearMetaCache();
      const after = await loadGraph('sepsis');
      expect(after).toBeDefined();
    });
  });

  describe('resolveMetaCase', () => {
    it('returns null for unknown nosology', async () => {
      const ref: MetaCaseRef = { nosoId: 'unknown', hypothesisId: 'hypo_1' };
      const result = await resolveMetaCase(ref);
      expect(result).toBeNull();
    });

    it('returns null for unknown hypothesis', async () => {
      const ref: MetaCaseRef = { nosoId: 'sepsis', hypothesisId: 'unknown_hypo' };
      const result = await resolveMetaCase(ref);
      expect(result).toBeNull();
    });
  });

  describe('findHypothesesByFindings', () => {
    it('finds hypotheses connected to findings', () => {
      const result = findHypothesesByFindings(mockGraph, ['find_1']);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].node.id).toBe('hypo_1');
      expect(result[0].score).toBe(2);
    });

    it('returns empty array for unmatched findings', () => {
      const result = findHypothesesByFindings(mockGraph, ['nonexistent']);
      expect(result).toEqual([]);
    });
  });

  describe('getEvidenceTrail', () => {
    it('returns evidence nodes for hypothesis', () => {
      const result = getEvidenceTrail(mockGraph, 'hypo_1');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('meta_1');
    });

    it('returns empty array for hypothesis without evidence', () => {
      const result = getEvidenceTrail(mockGraph, 'raw_1');
      expect(result).toEqual([]);
    });
  });

  describe('getDifferentialForHypothesis', () => {
    it('returns differential comparisons', () => {
      const result = getDifferentialForHypothesis(mockGraph, 'hypo_1');
      expect(result.length).toBe(1);
      expect(result[0].comparisonId).toBe('diff_1');
    });

    it('returns empty array for hypothesis without differential', () => {
      const result = getDifferentialForHypothesis(mockGraph, 'raw_1');
      expect(result).toEqual([]);
    });
  });

  describe('getNodesByLayer', () => {
    it('filters nodes by layer', () => {
      const raw = getNodesByLayer(mockGraph, 'raw');
      expect(raw.length).toBe(1);
      expect(raw[0].id).toBe('raw_1');

      const hypotheses = getNodesByLayer(mockGraph, 'hypotheses');
      expect(hypotheses.length).toBe(1);
      expect(hypotheses[0].id).toBe('hypo_1');
    });

    it('returns empty array for layer with no nodes', () => {
      // Create empty graph with no nodes
      const emptyGraph: MetaGraph = {
        id: 'empty', label: 'Empty', color: '#000',
        nodes: [], links: [], details: {}, comparisons: {}, evidence: {}, timelines: {},
      };
      const result = getNodesByLayer(emptyGraph, 'raw');
      expect(result).toEqual([]);
    });
  });

  describe('getNeighbors', () => {
    it('returns neighbors of a node', () => {
      const result = getNeighbors(mockGraph, 'hypo_1');
      expect(result.length).toBe(3);
      const ids = result.map((r) => r.node.id).sort();
      expect(ids).toEqual(['diff_1', 'find_1', 'meta_1']);
    });

    it('returns empty array for isolated node', () => {
      const result = getNeighbors(mockGraph, 'nonexistent');
      expect(result).toEqual([]);
    });
  });
});

import { afterEach } from 'vitest';