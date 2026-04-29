'use client';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isConnected: boolean = false;
  private playbackStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  constructor(private sampleRate: number = 16000) {}

  async initialize() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.sampleRate,
    });
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async startMicrophone(onAudioData: (base64Data: string) => void) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.sampleRate
        } 
      });

      if (!this.audioContext) await this.initialize();
      
      this.source = this.audioContext!.createMediaStreamSource(this.stream);
      // ScriptProcessor is deprecated but often easier for raw PCM than AudioWorklets in a quick prototype.
      // However, for high-quality near-zero delay, AudioWorklet is better.
      // But let's use ScriptProcessor for simplicity if permitted, or just implement the buffer conversion.
      this.processor = this.audioContext!.createScriptProcessor(2048, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = this.float32ToInt16(inputData);
        const base64Data = this.arrayBufferToBase64(pcmData.buffer);
        onAudioData(base64Data);
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext!.destination);
      this.isConnected = true;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      throw err;
    }
  }

  stopMicrophone() {
    this.isConnected = false;
    this.processor?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach(track => track.stop());
    this.processor = null;
    this.source = null;
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
