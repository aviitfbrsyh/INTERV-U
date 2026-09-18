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

    // Allow the main thread to tell us to stop cleanly.
    this.port.onmessage = (e) => {
      if (e.data === 'stop') {
        this._active = false;
      }
    };
  }

  /**
   * Called by the browser ~375 times/sec (128 frames at 48 kHz).
   * We convert each chunk to Int16 and post it immediately.
   */
  process(inputs) {
    if (!this._active) return false; // returning false removes the node

    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;

    const float32 = input[0]; // mono channel 0
    const int16 = new Int16Array(float32.length);

    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // Transfer the underlying ArrayBuffer to avoid copying.
    this.port.postMessage(int16.buffer, [int16.buffer]);

    return true;
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
