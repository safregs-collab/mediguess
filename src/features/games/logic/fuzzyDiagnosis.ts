// ── String normalization (mirror of gameLogic.ts) ──────────────
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[ё]/g, 'е')
    .replace(/[^а-яa-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Levenshtein distance ─────────────────────────────────────────
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
    }
  }
  return matrix[b.length][a.length];
}

// ── Fuzzy check with word-level fallback ─────────────────────────
export interface FuzzyCheckResult {
  matched: boolean;
  closest: string;
  distance: number;
}

export function fuzzyCheckDiagnosis(input: string, diagnoses: string[]): FuzzyCheckResult {
  const normInput = normalize(input);
  if (!normInput || normInput.length < 2) {
    return { matched: false, closest: '', distance: Infinity };
  }

  let best = { diagnosis: '', distance: Infinity };

  for (const diag of diagnoses) {
    const normDiag = normalize(diag);

    // Full-string distance
    const dist = levenshtein(normInput, normDiag);
    if (dist < best.distance) {
      best = { diagnosis: diag, distance: dist };
    }

    // Word-level distance for multi-word terms
    const inputWords = normInput.split(/\s+/);
    const diagWords = normDiag.split(/\s+/);
    for (const iw of inputWords) {
      if (iw.length <= 3) continue;
      for (const dw of diagWords) {
        if (dw.length <= 3) continue;
        const wordDist = levenshtein(iw, dw);
        if (wordDist <= 1 && wordDist < best.distance) {
          best = { diagnosis: diag, distance: wordDist };
        }
      }
    }
  }

  // Threshold: <= 20% of input length, at least 1
  const threshold = Math.max(1, Math.floor(normInput.length * 0.2));
  return {
    matched: best.distance <= threshold,
    closest: best.diagnosis,
    distance: best.distance,
  };
}
