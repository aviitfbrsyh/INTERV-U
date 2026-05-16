export interface CrossMatchData {
  match_score: number;
  matched_skills: string[];
  skill_gaps: string[];
  experience_verdict: string;
  focus_areas: string[];
  summary: string;
}

export async function crossMatch(cvText: string, jdText: string): Promise<CrossMatchData> {
  const res = await fetch('/api/cross-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvText, jdText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? `Cross-match failed (${res.status})`);
  }
  return res.json();
}
