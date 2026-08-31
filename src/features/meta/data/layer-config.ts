import type { MetaLayer } from '../types';

export const LAYER_LABELS: Record<MetaLayer, { label: string; color: string; bg: string }> = {
  raw: { label: 'Сырые данные', color: '#3b82f6', bg: '#dbeafe' },
  findings: { label: 'Клинические находки', color: '#10b981', bg: '#d1fae5' },
  hypotheses: { label: 'Гипотеза', color: '#f59e0b', bg: '#fef3c7' },
  differential: { label: 'Дифференциал', color: '#ef4444', bg: '#fee2e2' },
  evidence: { label: 'Доказательства', color: '#8b5cf6', bg: '#ede9fe' },
};