/**
 * EvidenceBadge — визуальный индикатор уровня доказательности (GRADE)
 */

import type { MetaEvidence } from '../types';

interface EvidenceBadgeProps {
  grade: MetaEvidence['grade'];
  size?: 'sm' | 'md' | 'lg';
}

const GRADE_CONFIG: Record<string, { label: string; bg: string; color: string; desc: string }> = {
  A: { label: 'GRADE A', bg: '#dcfce7', color: '#166534', desc: 'Высокая уверенность' },
  B: { label: 'GRADE B', bg: '#fef9c3', color: '#854d0e', desc: 'Умеренная уверенность' },
  C: { label: 'GRADE C', bg: '#fee2e2', color: '#991b1b', desc: 'Низкая уверенность' },
};

export function EvidenceBadge({ grade, size = 'md' }: EvidenceBadgeProps) {
  const cfg = GRADE_CONFIG[grade] ?? GRADE_CONFIG.C;
  const sizeClass = `evidence-badge--${size}`;

  return (
    <span
      className={`evidence-badge ${sizeClass}`}
      style={{ background: cfg.bg, color: cfg.color }}
      title={cfg.desc}
    >
      {cfg.label}
    </span>
  );
}
