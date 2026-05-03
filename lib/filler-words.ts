export type FillerLevel = 'clean' | 'minimal' | 'moderate' | 'heavy';

export interface FillerResult {
  total: number;
  found: { word: string; count: number }[];
  level: FillerLevel;
}

// Each entry: human-readable label + regex
const FILLERS: { word: string; pattern: RegExp }[] = [
  { word: 'eh',        pattern: /\beh+\b/gi },
  { word: 'um',        pattern: /\bu+m+\b/gi },
  { word: 'hmm',       pattern: /\bh+m+\b/gi },
  { word: 'eee',       pattern: /\be{2,}\b/gi },
  { word: 'err',       pattern: /\be+r{2,}\b/gi },
  { word: 'anu',       pattern: /\banu\b/gi },
  { word: 'em',        pattern: /\bem+\b/gi },
  { word: 'apa ya',    pattern: /apa\s+ya\b/gi },
  { word: 'gimana ya', pattern: /gimana\s+ya\b/gi },
  { word: 'jadi gini', pattern: /jadi\s+gini\b/gi },
  { word: 'gitu loh',  pattern: /gitu\s+lo+h?\b/gi },
  { word: 'ya kan',    pattern: /ya\s+kan\b/gi },
  { word: 'ya gitu',   pattern: /ya\s+gitu\b/gi },
  { word: 'yaa',       pattern: /\bya{2,}\b/gi },
  { word: 'gitu deh',  pattern: /gitu\s+deh\b/gi },
  { word: 'semacam',   pattern: /\bsemacam\b/gi },
  { word: 'kayak',     pattern: /\bkayak\b/gi },
];

export function detectFillers(text: string): FillerResult {
  const found: { word: string; count: number }[] = [];
  let total = 0;

  for (const { word, pattern } of FILLERS) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      found.push({ word, count: matches.length });
      total += matches.length;
    }
  }

  found.sort((a, b) => b.count - a.count);

  const level: FillerLevel =
    total === 0 ? 'clean' :
    total <= 2  ? 'minimal' :
    total <= 5  ? 'moderate' : 'heavy';

  return { total, found, level };
}

export const fillerLevelMeta: Record<FillerLevel, { label: string; color: string; bg: string; border: string; text: string }> = {
  clean:    { label: 'Bersih',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'Tidak ada filler word terdeteksi — komunikasi sangat bersih.' },
  minimal:  { label: 'Minimal',  color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  text: 'Sedikit filler — masih sangat oke, cukup wajar dalam percakapan.' },
  moderate: { label: 'Cukup',    color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  text: 'Filler mulai terasa — latih kesadaran diri saat menjawab.' },
  heavy:    { label: 'Banyak',   color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'Terlalu banyak filler — HR akan menilai kurang percaya diri.' },
};
