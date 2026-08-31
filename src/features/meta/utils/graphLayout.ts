export type Vec2 = { x: number; y: number };

export function normalize(v: Vec2): Vec2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y) || 1e-6;
  return { x: v.x / len, y: v.y / len };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function wrapLabel(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current) lines.push(current.trim());
  return lines.length ? lines : [text];
}

export function parseNormal(normal: string | undefined): { min?: number; max?: number } {
  if (!normal) return {};
  const m = normal.match(/([0-9.]+)[^0-9.]*([0-9.]+)/);
  if (m) return { min: parseFloat(m[1]), max: parseFloat(m[2]) };
  const single = normal.match(/<([0-9.]+)/);
  if (single) return { max: parseFloat(single[1]) };
  const single2 = normal.match(/>?=?\s*([0-9.]+)/);
  if (single2) return { min: parseFloat(single2[1]) };
  return {};
}

export function getValueStatus(
  value: number | undefined,
  normal: string | undefined
): 'low' | 'normal' | 'high' | 'critical' | 'unknown' {
  if (value === undefined || !normal) return 'unknown';
  const { min, max } = parseNormal(normal);
  if (min !== undefined && max !== undefined) {
    if (value < min * 0.5 || value > max * 3) return 'critical';
    if (value < min || value > max) return value < min ? 'low' : 'high';
    return 'normal';
  }
  if (max !== undefined && value > max) return value > max * 3 ? 'critical' : 'high';
  if (min !== undefined && value < min) return 'low';
  return 'normal';
}
