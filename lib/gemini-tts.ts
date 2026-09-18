function pcmToWav(pcmData: Uint8Array, sampleRate = 24000, channels = 1, bitDepth = 16): Blob {
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  write(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  write(36, 'data');
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

export async function generateSitiHighlight(
  question: string,
  userAnswer: string,
  suggestion: string,
  hack: string
): Promise<string> {
  const res = await fetch('/api/coaching', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'highlight',
      question,
      userAnswer,
      suggestion,
      hack,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal menghasilkan highlight.');
  }

  const data = await res.json();
  return (data.text || '').trim();
}

export async function generateSitiSpeech(text: string): Promise<string> {
  const res = await fetch('/api/coaching', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'speech',
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal menghasilkan suara Siti.');
  }

  const { audioData, mimeType } = await res.json();
  if (!audioData) throw new Error('Tidak ada data audio yang diterima dari server.');

  const audioBytes = atob(audioData);
  const audioArray = new Uint8Array(audioBytes.length);
  for (let i = 0; i < audioBytes.length; i++) {
    audioArray[i] = audioBytes.charCodeAt(i);
  }

  let blob: Blob;
  if (mimeType.includes('L16') || mimeType.includes('pcm')) {
    const rateMatch = mimeType.match(/rate=(\d+)/);
    const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000;
    blob = pcmToWav(audioArray, sampleRate);
  } else {
    blob = new Blob([audioArray], { type: mimeType });
  }

  return URL.createObjectURL(blob);
}
