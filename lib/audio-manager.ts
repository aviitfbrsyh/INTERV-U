'use client';

/**
 * AudioManager — low-latency audio capture & playback via AudioWorklet.
 *
 * Public API is identical to the previous ScriptProcessorNode version so that
 * LiveInterview.tsx and CoachingLive.tsx require ZERO changes.
 *
 * Key improvements over ScriptProcessorNode:
 *   • Mic capture runs on a dedicated audio thread → zero main-thread glitches.
 *   • Smaller effective buffer (128 frames vs 2048) → ~16x lower input latency.
 *   • No GC pressure from onaudioprocess callbacks on the main thread.
 *   • Graceful fallback to ScriptProcessorNode for old browsers that lack
 *     AudioWorklet support (unlikely in 2026, but safety first).
 */
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;

  // AudioWorklet path
  private workletNode: AudioWorkletNode | null = null;

  // ScriptProcessor fallback path (only used if AudioWorklet is unsupported)
  private processor: ScriptProcessorNode | null = null;

  private source: MediaStreamAudioSourceNode | null = null;
  private isConnected: boolean = false;
  private playbackStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  // Track whether we've already loaded the worklet module.
  private workletReady: boolean = false;

  constructor(private sampleRate: number = 16000) {}

  async initialize() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.sampleRate,
    });

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Pre-load the AudioWorklet module so startMicrophone is instant.
    if (this.audioContext.audioWorklet) {
      try {
        await this.audioContext.audioWorklet.addModule('/audio-capture-processor.js');
        this.workletReady = true;
      } catch (err) {
        console.warn('[AudioManager] AudioWorklet module failed to load — will fallback to ScriptProcessor:', err);
        this.workletReady = false;
      }
    }
  }

  async startMicrophone(onAudioData: (base64Data: string) => void) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.sampleRate,
        },
      });

      if (!this.audioContext) await this.initialize();

      this.source = this.audioContext!.createMediaStreamSource(this.stream);

      if (this.workletReady && this.audioContext!.audioWorklet) {
        // ─── AudioWorklet path (preferred) ───
        this.workletNode = new AudioWorkletNode(this.audioContext!, 'audio-capture-processor');

        this.workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
          const base64Data = this.arrayBufferToBase64(e.data);
          onAudioData(base64Data);
        };

        this.source.connect(this.workletNode);
        // AudioWorkletNode must be connected to destination (even if silent)
        // so the audio graph keeps running.
        this.workletNode.connect(this.audioContext!.destination);
      } else {
        // ─── ScriptProcessor fallback ───
        console.warn('[AudioManager] Using ScriptProcessor fallback (AudioWorklet unavailable).');
        this.processor = this.audioContext!.createScriptProcessor(2048, 1, 1);

        this.processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = this.float32ToInt16(inputData);
          const base64Data = this.arrayBufferToBase64(pcmData.buffer);
          onAudioData(base64Data);
        };

        this.source.connect(this.processor);
        this.processor.connect(this.audioContext!.destination);
      }

      this.isConnected = true;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      throw err;
    }
  }

  stopMicrophone() {
    this.isConnected = false;

    // Worklet path cleanup
    if (this.workletNode) {
      try { this.workletNode.port.postMessage('stop'); } catch (_) {}
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    // ScriptProcessor fallback cleanup
    this.processor?.disconnect();
    this.processor = null;

    this.source?.disconnect();
    this.source = null;

    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
  }

  close() {
    this.stopMicrophone();
    this.stopAllPlayback();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
  }

  // Play PCM data received from the server
  playPCM(base64Data: string) {
    if (!this.audioContext) return;

    const arrayBuffer = this.base64ToArrayBuffer(base64Data);
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, this.sampleRate);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Add a clarity boost (High shelf filter)
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highshelf';
    filter.frequency.value = 3000;
    filter.gain.value = 4; // 4dB boost to high frequencies for sharper articulation

    source.connect(filter);
    filter.connect(this.audioContext.destination);

    source.onended = () => {
      this.activeSources.delete(source);
    };
    this.activeSources.add(source);

    // Schedule playback
    const currentTime = this.audioContext.currentTime;
    if (this.playbackStartTime < currentTime) {
      this.playbackStartTime = currentTime;
    }
    source.start(this.playbackStartTime);
    this.playbackStartTime += audioBuffer.duration;
  }

  /** Read-only — for UI visualizers. Does not affect playback. */
  isPlaybackActive(): boolean {
    if (!this.audioContext) return this.activeSources.size > 0;
    const t = this.audioContext.currentTime;
    return this.activeSources.size > 0 || this.playbackStartTime > t + 0.02;
  }

  stopAllPlayback() {
    // Stop all currently playing and scheduled sources
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might have already stopped
      }
    });
    this.activeSources.clear();
    // Reset playback schedule to stop current queue
    this.playbackStartTime = this.audioContext?.currentTime || 0;
  }

  private float32ToInt16(buffer: Float32Array): Int16Array {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      buf[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buf;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
