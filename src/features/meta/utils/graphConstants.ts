import type { MetaLayer } from '../types';

export const LAYER_ORDER: MetaLayer[] = ['raw', 'findings', 'hypotheses', 'differential', 'evidence'];

export const LAYER_COLORS: Record<MetaLayer, string> = {
  raw: '#60a5fa',
  findings: '#34d399',
  hypotheses: '#fbbf24',
  differential: '#f87171',
  evidence: '#a78bfa',
};

export const LAYER_LABELS: Record<MetaLayer, string> = {
  raw: 'Сырые данные',
  findings: 'Клинические находки',
  hypotheses: 'Гипотезы',
  differential: 'Дифференциал',
  evidence: 'Доказательства',
};

export const LINK_TYPE_LABELS: Record<string, string> = {
  causes: 'Вызывает',
  associated: 'Ассоциировано',
  suggests: 'Намекает на',
  supports: 'Поддерживает',
  complication_of: 'Осложнение',
  key_marker: 'Ключевой маркер',
  discriminates: 'Дифференцирует',
  compared_in: 'Сравнивается в',
  belongs_to: 'Относится к',
  includes: 'Включает',
  treated_in: 'Лечение в',
  covered_in: 'Охвачено в',
  studied_in: 'Изучено в',
  described_in: 'Описано в',
  confirms: 'Подтверждает',
};

export const CAUSAL_LINK_TYPES = new Set([
  'causes',
  'associated',
  'suggests',
  'supports',
  'complication_of',
  'key_marker',
]);

export const STATUS_COLORS: Record<string, string> = {
  low: '#38bdf8',
  normal: '#34d399',
  high: '#fbbf24',
  critical: '#ef4444',
  unknown: '#94a3b8',
};

export const STATUS_ICONS: Record<string, string> = {
  low: '↓',
  normal: '●',
  high: '↑',
  critical: '⚠',
  unknown: '',
};
