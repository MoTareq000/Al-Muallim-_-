// audio-processor.js — AudioWorkletProcessor
// Runs in an AudioWorklet (separate thread from main JS)

class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this._buffer = [];            // Accumulate samples
        this._bufferSize = 4096;      // Send a chunk every 4096 samples (~256ms at 16kHz)
        this._targetSampleRate = 16000;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input[0]) return true;

        const inputData = input[0]; // Float32Array, mono channel
        const sourceSampleRate = sampleRate; // Global in AudioWorklet scope (e.g. 48000, 44100)

        // ─── Downsample to 16kHz ───
        const ratio = sourceSampleRate / this._targetSampleRate;
        for (let i = 0; i < inputData.length; i += ratio) {
            const index = Math.floor(i);
            if (index < inputData.length) {
                this._buffer.push(inputData[index]);
            }
        }

        // ─── Flush when buffer is full ───
        while (this._buffer.length >= this._bufferSize) {
            // Convert Float32 [-1.0, 1.0] → Int16 [-32768, 32767]
            const int16 = new Int16Array(this._bufferSize);
            for (let i = 0; i < this._bufferSize; i++) {
                const s = Math.max(-1, Math.min(1, this._buffer[i]));
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            // Post the raw PCM bytes to the main thread
            this.port.postMessage({
                type: 'pcm_chunk',
                data: int16.buffer
            }, [int16.buffer]);  // Transfer ownership for zero-copy

            this._buffer = this._buffer.slice(this._bufferSize);
        }

        return true; // Keep the processor alive
    }
}

registerProcessor('pcm-processor', PCMProcessor);
