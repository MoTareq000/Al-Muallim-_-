// audio-handler.js — Microphone capture & Web Audio API playback

class AudioHandler {
    constructor(onAudioChunk) {
        this.onAudioChunk = onAudioChunk;

        // Mic state
        this.micStream = null;
        this.micContext = null;
        this.micSource = null;
        this.workletNode = null;
        this.isMicReady = false;

        // Playback state
        this.playbackContext = null;
        this.nextPlayTime = 0;
        this.activeSources = [];
    }

    async initMic() {
        if (this.isMicReady) return;

        this.micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                sampleRate: { ideal: 16000 },
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.micContext = new AudioContextClass();
        await this.micContext.audioWorklet.addModule('/static/audio-processor.js');

        this.micSource = this.micContext.createMediaStreamSource(this.micStream);
        this.workletNode = new AudioWorkletNode(this.micContext, 'pcm-processor');

        this.workletNode.port.onmessage = (event) => {
            if (event.data && event.data.type === 'pcm_chunk') {
                const bytes = new Uint8Array(event.data.data);
                const base64 = this._arrayBufferToBase64(bytes);
                if (this.onAudioChunk) {
                    this.onAudioChunk(base64);
                }
            }
        };

        this.isMicReady = true;
    }

    async startCapture() {
        if (!this.isMicReady) {
            await this.initMic();
        }

        if (this.micContext && this.micContext.state === 'suspended') {
            await this.micContext.resume();
        }

        // Interrupt any playing AI audio when student starts talking
        this.stopPlayback();

        // Connect mic -> worklet
        try {
            this.micSource.connect(this.workletNode);
            this.workletNode.connect(this.micContext.destination);
        } catch (e) {
            console.warn('Capture connect notice:', e);
        }
    }

    stopCapture() {
        if (!this.micSource || !this.workletNode) return;
        try {
            this.micSource.disconnect(this.workletNode);
            this.workletNode.disconnect();
        } catch (e) {
            // Already disconnected
        }
    }

    _ensurePlaybackContext() {
        if (!this.playbackContext || this.playbackContext.state === 'closed') {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
            this.nextPlayTime = 0;
            this.activeSources = [];
        }
        if (this.playbackContext.state === 'suspended') {
            this.playbackContext.resume();
        }
        return this.playbackContext;
    }

    playChunk(base64) {
        if (!base64) return;
        const ctx = this._ensurePlaybackContext();

        // 1. Decode base64 -> ArrayBuffer -> Int16Array
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const int16 = new Int16Array(bytes.buffer);

        // 2. Convert Int16 [-32768, 32767] -> Float32 [-1.0, 1.0]
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
            float32[i] = int16[i] / 32768.0;
        }

        // 3. Create AudioBuffer (24kHz, 1 channel)
        const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
        audioBuffer.getChannelData(0).set(float32);

        // 4. Schedule seamless playback
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        const currentTime = ctx.currentTime;
        const startTime = Math.max(currentTime, this.nextPlayTime);
        source.start(startTime);
        this.nextPlayTime = startTime + audioBuffer.duration;

        this.activeSources.push(source);
        source.onended = () => {
            const idx = this.activeSources.indexOf(source);
            if (idx !== -1) {
                this.activeSources.splice(idx, 1);
            }
        };
    }

    stopPlayback() {
        for (const src of this.activeSources) {
            try {
                src.stop();
                src.disconnect();
            } catch (e) {}
        }
        this.activeSources = [];
        this.nextPlayTime = 0;
    }

    _arrayBufferToBase64(bytes) {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}
