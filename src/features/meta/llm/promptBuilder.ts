import type { MetaResolvedData } from '../types';

/**
 * Build a clinical prompt from graph data for LLM description generation.
 */
export function buildGraphPrompt(data: MetaResolvedData, lang: 'ru' | 'en' = 'ru'): string {
  const { hypothesis, hypothesisDetail, involvedNodes, evidenceList } = data;

  // Collect findings
  const findings = involvedNodes
    .filter((n) => n.layer === 'findings' || n.layer === 'raw')
    .map((n) => {
      let line = `- ${n.label}`;
      if (n.value !== undefined) line += `: ${n.value}${n.unit ? ' ' + n.unit : ''}`;
      if (n.normal) line += ` (норма: ${n.normal})`;
      if (n.description) line += ` — ${n.description}`;
      return line;
    });

  // Collect differential diagnoses
  const differentials = involvedNodes
    .filter((n) => n.layer === 'differential')
    .map((n) => `- ${n.label}${n.description ? ': ' + n.description : ''}`);

  // Build prompt
  const parts: string[] = [];
  parts.push(`Нозология: ${hypothesis.label}`);
  if (hypothesisDetail) {
    parts.push(`Описание: ${hypothesisDetail.description}`);
    parts.push(`Критерии диагностики:`);
    hypothesisDetail.criteria.forEach((c) => parts.push(`- ${c}`));
  }
  if (findings.length > 0) {
    parts.push(`Клинические находки и данные:`);
    parts.push(...findings);
  }
  if (differentials.length > 0) {
    parts.push(`Дифференциальный диагноз:`);
    parts.push(...differentials);
  }
  if (evidenceList.length > 0) {
    parts.push(`Доказательная база:`);
    evidenceList.slice(0, 3).forEach((ev) => {
      parts.push(`- ${ev.title} (${ev.year}, ${ev.grade})`);
    });
  }

  const basePrompt = parts.join('\n');

  if (lang === 'en') {
    return `Based on the following clinical data, generate a concise but comprehensive medical summary (2-3 paragraphs) covering: key findings, diagnostic reasoning, differential diagnosis considerations, and evidence-based treatment approach.\n\n${basePrompt}\n\nSummary:`;
  }
  return `На основе следующих клинических данных составь краткое, но ёмкое медицинское резюме (2-3 абзаца), охватывающее: ключевые находки, диагностическое рассуждение, дифференциально-диагностические соображения и доказательный подход к лечению.\n\n${basePrompt}\n\nРезюме:`;
}
