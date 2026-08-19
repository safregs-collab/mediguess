const STOP_WORDS = new Set([
  'и','или','в','на','с','по','не','без','при','от','до','за','из','под','над',
  'о','об','про','для','к','у','во','со','ко','а','но','the','and','or','in','on',
  'at','to','of','for','with','without','a','an',
]);

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[ё]/g, 'е')
    .replace(/[^а-яa-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getMeaningfulWords(str: string): string[] {
  return normalize(str)
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}
