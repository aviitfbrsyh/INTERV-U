/**
 * AudioWorklet processor for capturing microphone PCM data.
 * Runs on a dedicated audio thread — never blocks the main thread.
 *
 * Receives Float32 audio frames (128 samples each) from the browser's
 * audio graph and converts them to Int16 PCM, then posts the raw bytes
 * back to the main thread via MessagePort.
 */
class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._active = true;
    this._bufferSize = 2048; // ~85ms at 24kHz, optimal chunk size for Gemini Live API
    this._buffer = new Int16Array(this._bufferSize);
    this._bytesWritten = 0;

    // Allow the main thread to tell us to stop cleanly.
    this.port.onmessage = (e) => {
      if (e.data === 'stop') {
        this._active = false;
      }
    };
  }

  /**
   * Receives Float32 audio frames (128 samples each).
   * Accumulates frames up to _bufferSize (2048 samples, ~85ms) before posting
   * to avoid flooding the WebSocket with 180+ tiny messages per second.
   */
  process(inputs) {
    if (!this._active) return false;

    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;

    const float32 = input[0];
    const len = float32.length;

    for (let i = 0; i < len; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      this._buffer[this._bytesWritten++] = s < 0 ? s * 0x8000 : s * 0x7fff;

      if (this._bytesWritten >= this._bufferSize) {
        // Send filled buffer
        this.port.postMessage(this._buffer.buffer, [this._buffer.buffer]);
        this._buffer = new Int16Array(this._bufferSize);
        this._bytesWritten = 0;
      }
    }

    return true;
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
