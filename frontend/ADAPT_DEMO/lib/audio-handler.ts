export class AudioHandler {
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private scriptNode: ScriptProcessorNode | null = null;
    private nextPlayTime: number = 0;

    async startCapture(onAudioData: (base64: string) => void) {
        // Initialize AudioContext if needed
        if (!this.audioContext || this.audioContext.state === 'closed') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        }

        // Keep hardware microphone stream alive to avoid massive latency on subsequent clicks
        if (!this.mediaStream) {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    channelCount: 1, 
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
        }
        
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.scriptNode = this.audioContext.createScriptProcessor(1024, 1, 1);
        
        this.scriptNode.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
            }
            const uint8Array = new Uint8Array(pcmData.buffer);
            let binary = '';
            for (let i = 0; i < uint8Array.byteLength; i++) binary += String.fromCharCode(uint8Array[i]);
            onAudioData(btoa(binary));
        };

        source.connect(this.scriptNode);
        this.scriptNode.connect(this.audioContext.destination);
    }

    stopCapture() {
        if (this.scriptNode) {
            this.scriptNode.disconnect();
            this.scriptNode = null;
        }
        // WE DO NOT STOP THE MEDIA STREAM TRACKS HERE!
        // Stopping tracks tears down the hardware mic connection, 
        // causing a 1-second delay the next time the user tries to speak.
    }

    playChunk(base64Data: string) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            this.nextPlayTime = this.audioContext.currentTime;
        }

        const binaryStr = atob(base64Data);
        const pcmData = new Int16Array(binaryStr.length / 2);
        for (let i = 0; i < pcmData.length; i++) {
            pcmData[i] = binaryStr.charCodeAt(i * 2) + (binaryStr.charCodeAt(i * 2 + 1) << 8);
        }

        const audioBuffer = this.audioContext.createBuffer(1, pcmData.length, 24000);
        const floatData = audioBuffer.getChannelData(0);
        for (let i = 0; i < pcmData.length; i++) floatData[i] = pcmData[i] / 32768.0;

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);

        const startTime = Math.max(this.nextPlayTime, this.audioContext.currentTime);
        source.start(startTime);
        this.nextPlayTime = startTime + audioBuffer.duration;
    }
}
