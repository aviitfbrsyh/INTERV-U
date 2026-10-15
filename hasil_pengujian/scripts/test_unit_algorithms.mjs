import fs from 'fs';
import path from 'path';

// 1. Re-implement detectFillers logic directly from lib/filler-words.ts for pure algorithmic test
const FILLERS = [
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

function detectFillers(text) {
  const found = [];
  let total = 0;
  for (const { word, pattern } of FILLERS) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      found.push({ word, count: matches.length });
      total += matches.length;
    }
  }
  found.sort((a, b) => b.count - a.count);
  const level = total === 0 ? 'clean' : total <= 2 ? 'minimal' : total <= 5 ? 'moderate' : 'heavy';
  return { total, found, level };
}

// 2. PCM to WAV header generator logic from lib/gemini-tts.ts
function generatePcmWavBuffer(pcmData, sampleRate = 24000, channels = 1, bitDepth = 16) {
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);
  const dataSize = pcmData.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitDepth, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(buffer, 44);

  return buffer;
}

// 3. String extraction helper from lib/generate-report.ts & app/page.tsx
function extractField(text, keys) {
  for (const key of keys) {
    const match = text.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'i'));
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return '';
}

// Execute Tests
const results = [];
function assert(testId, name, condition, details) {
  const status = condition ? 'LULUS' : 'GAGAL';
  results.push({ testId, name, status, details, timestamp: new Date().toISOString() });
  console.log(`[${status}] ${testId} - ${name}: ${details}`);
}

console.log('=== MEMULAI UNIT & ALGORITHMIC TESTING ===\n');

// TC-UNIT-01: Filler Words - Clean Level
const r1 = detectFillers("Saya mengimplementasikan Zustand untuk mengelola state aplikasi secara efisien.");
assert('TC-UNIT-01', 'Filler Words Clean Level', r1.total === 0 && r1.level === 'clean', `Total: ${r1.total}, Level: ${r1.level}`);

// TC-UNIT-02: Filler Words - Minimal Level (1-2)
const r2 = detectFillers("Saya kemarin eh mencoba mengoptimasi query database, ya kan?");
assert('TC-UNIT-02', 'Filler Words Minimal Level', r2.total === 2 && r2.level === 'minimal', `Total: ${r2.total}, Level: ${r2.level}`);

// TC-UNIT-03: Filler Words - Moderate Level (3-5)
const r3 = detectFillers("Jadi gini, waktu itu hmm saya kayak bingung, apa ya solusinya?");
assert('TC-UNIT-03', 'Filler Words Moderate Level', r3.total === 4 && r3.level === 'moderate', `Total: ${r3.total}, Level: ${r3.level}`);

// TC-UNIT-04: Filler Words - Heavy Level (>5)
const r4 = detectFillers("Eh jadi gini, um waktu itu anu... eee gimana ya, kayak semacam gitu loh!");
assert('TC-UNIT-04', 'Filler Words Heavy Level', r4.total >= 6 && r4.level === 'heavy', `Total: ${r4.total}, Level: ${r4.level}`);

// TC-UNIT-05: Filler Words - False Positive Resistance
const r5 = detectFillers("Saya minum teh hangat sambil membaca buku petunjuk manual bahasa pemrograman.");
assert('TC-UNIT-05', 'Filler Words False Positive Resistance', r5.total === 0 && r5.level === 'clean', `Total: ${r5.total} (Kata 'teh' & 'manual' tidak boleh memicu 'eh' atau 'anu')`);

// TC-UNIT-06: Filler Words - Case Insensitivity
const r6 = detectFillers("EH kemarin HMM saya coba KAYAK begini.");
assert('TC-UNIT-06', 'Filler Words Case Insensitivity', r6.total === 3, `Total: ${r6.total} (EH, HMM, KAYAK harus terdeteksi)`);

// TC-UNIT-07: Audio WAV Header - RIFF Format
const dummyPcm = Buffer.alloc(48000); // 1 detik 24kHz 16-bit mono
const wavBuf = generatePcmWavBuffer(dummyPcm, 24000, 1, 16);
const isRiff = wavBuf.toString('ascii', 0, 4) === 'RIFF';
const isWave = wavBuf.toString('ascii', 8, 12) === 'WAVE';
assert('TC-UNIT-07', 'Audio WAV RIFF & WAVE Identifiers', isRiff && isWave, `Header 0-4: ${wavBuf.toString('ascii', 0, 4)}, Header 8-12: ${wavBuf.toString('ascii', 8, 12)}`);

// TC-UNIT-08: Audio WAV Header - Format & Channel Specs
const formatTag = wavBuf.readUInt16LE(20);
const numChannels = wavBuf.readUInt16LE(22);
const sampleRate = wavBuf.readUInt32LE(24);
const bitsPerSample = wavBuf.readUInt16LE(34);
assert('TC-UNIT-08', 'Audio WAV Specs Verification', formatTag === 1 && numChannels === 1 && sampleRate === 24000 && bitsPerSample === 16,
  `FormatTag: ${formatTag} (PCM), Channels: ${numChannels}, SampleRate: ${sampleRate}Hz, BitDepth: ${bitsPerSample}bit`);

// TC-UNIT-09: Field Extraction Helper - JSON Matching
const mockJd = '{\n  "role": "Frontend Developer",\n  "requirements": ["React", "TypeScript"]\n}';
const extractedRole = extractField(mockJd, ['role', 'title', 'position']);
assert('TC-UNIT-09', 'JSON Field Extraction Helper', extractedRole === 'Frontend Developer', `Extracted: ${extractedRole}`);

// TC-UNIT-10: Field Extraction Helper - Fallback handling
const emptyInput = '';
const extractedEmpty = extractField(emptyInput, ['role', 'title']);
assert('TC-UNIT-10', 'Field Extraction Empty Fallback', extractedEmpty === '', `Extracted: '${extractedEmpty}'`);

// Write results to disk
const outPath = path.resolve('hasil_pengujian/raw_logs/unit_tests_result.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
console.log(`\nHasil disimpan di: ${outPath}`);
