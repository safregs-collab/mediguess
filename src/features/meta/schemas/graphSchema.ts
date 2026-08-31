import { z } from 'zod';

// ===== Primitive unions =====
export const MetaLayerSchema = z.enum(['raw', 'findings', 'hypotheses', 'differential', 'evidence']);

export const MetaNodeTypeSchema = z.enum([
  'lab', 'finding', 'symptom', 'sign', 'complication',
  'diagnosis', 'comparison', 'algorithm', 'category',
  'meta-analysis', 'rct', 'cohort', 'guideline', 'review',
]);

export const MetaLinkTypeSchema = z.enum([
  'causes', 'associated', 'suggests', 'supports',
  'complication_of', 'key_marker', 'discriminates',
  'compared_in', 'belongs_to', 'includes', 'treated_in',
  'covered_in', 'studied_in', 'described_in',
]);

export const PtpSchema = z.enum(['high', 'medium', 'low']);
export const GradeSchema = z.enum(['A', 'B', 'C']);
export const StatusSchema = z.enum(['complete', 'in_progress', 'planned']);

// ===== MetaNode =====
export const MetaNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  layer: MetaLayerSchema,
  type: MetaNodeTypeSchema,
  description: z.string().optional(),
  // raw
  unit: z.string().optional(),
  normal: z.string().optional(),
  value: z.number().optional(),
  group: z.string().optional(),
  // findings
  severity: z.string().optional(),
  // hypotheses
  prevalence: z.string().optional(),
  ptp: PtpSchema.optional(),
  // evidence
  grade: GradeSchema.optional(),
  year: z.number().optional(),
  n: z.number().optional(),
});

// ===== MetaLink =====
export const MetaLinkSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  type: MetaLinkTypeSchema,
  weight: z.number(),
});

// ===== MetaDiagnosisDetail =====
export const MetaDiagnosisDetailSchema = z.object({
  description: z.string(),
  criteria: z.array(z.string()),
  prevalence: z.string(),
  complications: z.array(z.string()),
  treatment: z.array(z.string()),
  followup: z.string(),
});

// ===== MetaComparison =====
export const MetaComparisonSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.record(z.string(), z.string())),
});

// ===== MetaEvidence =====
export const MetaEvidenceSchema = z.object({
  title: z.string(),
  authors: z.string(),
  journal: z.string(),
  year: z.number(),
  n: z.number().optional(),
  design: z.string(),
  grade: GradeSchema,
  key_findings: z.array(z.string()),
  quality: z.string(),
});

// ===== MetaTimelinePoint =====
export const MetaTimelinePointSchema = z
  .object({
    time: z.number(),
    event: z.string(),
  })
  .catchall(z.union([z.string(), z.number()]));

// ===== MetaGraph =====
export const MetaGraphSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  color: z.string(),
  nodes: z.array(MetaNodeSchema),
  links: z.array(MetaLinkSchema),
  details: z.record(z.string(), MetaDiagnosisDetailSchema),
  comparisons: z.record(z.string(), MetaComparisonSchema),
  evidence: z.record(z.string(), MetaEvidenceSchema),
  timelines: z.record(z.string(), z.array(MetaTimelinePointSchema)),
});

// ===== MetaNosologyIndex =====
export const MetaNosologyIndexItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
  file: z.string().nullable(),
  nodeCount: z.number(),
  linkCount: z.number(),
  status: StatusSchema,
});

export const MetaNosologyIndexSchema = z.object({
  version: z.string(),
  nosologies: z.array(MetaNosologyIndexItemSchema),
});

// ===== MetaCaseRef =====
export const MetaCaseRefSchema = z.object({
  nosoId: z.string(),
  hypothesisId: z.string(),
  layer1Ids: z.array(z.string()).optional(),
  layer2Ids: z.array(z.string()).optional(),
  diffId: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
  timelineId: z.string().optional(),
});

// Re-export inferred types for convenience
export type MetaGraphValidated = z.infer<typeof MetaGraphSchema>;
export type MetaNodeValidated = z.infer<typeof MetaNodeSchema>;
export type MetaLinkValidated = z.infer<typeof MetaLinkSchema>;
