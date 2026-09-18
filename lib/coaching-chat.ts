export interface ChatMessage {
  role: 'user' | 'siti';
  text: string;
}

export async function askSiti(
  userQuestion: string,
  evaluationContext: string,
  history: ChatMessage[]
): Promise<string> {
  const res = await fetch('/api/coaching', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'chat',
      userQuestion,
      evaluationContext,
      history,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal terhubung ke AI Coaching.');
  }

  const data = await res.json();
  return data.text || 'Maaf, saya tidak bisa menjawab saat ini. Coba ulangi pertanyaannya?';
}
