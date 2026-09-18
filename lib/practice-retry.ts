export interface RetryResult {
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
  improvement_note: string;
  is_better: boolean;
}

export async function retryAnswer(
  question: string,
  originalAnswer: string,
  newAnswer: string
): Promise<RetryResult> {
  const res = await fetch('/api/coaching', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'practice',
      question,
      originalAnswer,
      newAnswer,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengevaluasi jawaban latihan.');
  }

  return await res.json();
}
