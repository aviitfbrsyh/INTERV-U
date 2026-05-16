import { CrossMatchData } from '@/lib/cross-match';

export interface QAAnalysis {
  question: string;
  answer: string;
  star: {
    situation: { present: boolean; evidence: string };
    task: { present: boolean; evidence: string };
    action: { present: boolean; evidence: string };
    result: { present: boolean; evidence: string };
    score: number;
  };
  concise: {
    consistency: { score: number; note: string };
    clarity: { score: number; note: string };
    information: { score: number; note: string };
    structure: { score: number; note: string };
    effectiveness: { score: number; note: string };
    total: number;
  };
  rating: number;
  suggestion: string;
  hack: string;
  better_answer_example: string;
}

export interface CandidateArchetype {
  type: string;
  label: string;
  description: string;
  warning_level: string;
  key_evidence: string[];
  hr_perspective: string;
}

export interface EvaluationData {
  overall_score: number;
  overall_summary: string;
  candidate_archetype: CandidateArchetype;
  qa_analysis: QAAnalysis[];
  cv_jd_match: {
    score: number;
    matched_skills_in_interview: string[];
    skill_gaps_addressed: string[];
    skill_gaps_unaddressed: string[];
    assessment: string;
  };
  strengths: string[];
  weaknesses: string[];
  final_recommendation: string;
  recommendation_verdict: string;
}

export async function runEvaluation(
  history: string,
  cvText: string,
  jdText: string,
  crossMatchData?: CrossMatchData | null,
): Promise<EvaluationData> {
  const res = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, cvText, jdText, crossMatchData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? `Evaluation failed (${res.status})`);
  }
  return res.json();
}
