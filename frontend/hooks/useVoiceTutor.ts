/* eslint-disable */
import { useState, useRef, useEffect } from 'react';
import type { StoryboardScene } from '@/lib/types';


let globalAudioElement: HTMLAudioElement | null = null;
function getGlobalAudio() {
    if (typeof window !== 'undefined') {
        if (!globalAudioElement) {
            globalAudioElement = new Audio();
            globalAudioElement.id = 'ai-global-audio';
            document.body.appendChild(globalAudioElement);
        }
        return globalAudioElement;
    }
    return null;
}

function unlockAudio() {
    const audio = getGlobalAudio();
    if (audio) {
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audio.play().catch(() => {});
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
    }
}

export function useVoiceTutor(topic: string = "Basic Programming", language: string = "en") {
    const [state, setState] = useState<'IDLE' | 'CONNECTING' | 'RECORDING' | 'THINKING' | 'AI_SPEAKING' | 'WAITING_FOR_QUIZ' | 'ERROR'>('IDLE');
    const [scenes, setScenes] = useState<StoryboardScene[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [elapsed, setElapsed] = useState<number>(0);
    const [transcript, setTranscript] = useState<string>('');
    const [currentAiText, setCurrentAiText] = useState<string>('');
    const [activeQuiz, setActiveQuiz] = useState<{question: string, options: string[]} | null>(null);
    
    const recognitionRef = useRef<any>(null);
    const hasStartedRef = useRef<boolean>(false);
    const elapsedIntervalRef = useRef<any>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const timelineAbortRef = useRef<number>(0);

    const stopCurrentAudio = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (currentAudioRef.current) {
            try {
                currentAudioRef.current.pause();
                currentAudioRef.current.currentTime = 0;
            } catch (_) {}
            currentAudioRef.current = null;
        }
        const globalAudio = getGlobalAudio();
        if (globalAudio) {
            try {
                globalAudio.pause();
                globalAudio.currentTime = 0;
            } catch (_) {}
        }
    };
    
    // Persist whiteboard state across AI turns
    const nodePositionsRef = useRef<Map<string, { cx: number, cy: number }>>(new Map());
    const drawnEdgesRef = useRef<Set<string>>(new Set());

    // Provide legacy interface for compatibility if needed elsewhere
    const whiteboardCommands = scenes;

    useEffect(() => {
        // Initialize Browser STT (SpeechRecognition)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            
            recognitionRef.current.onresult = (event: any) => {
                let current = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    current += event.results[i][0].transcript;
                }
                setTranscript(current);
                recognitionRef.current._internalTranscript = current;
            };

            recognitionRef.current.onerror = (e: any) => {
                console.error("Speech Recognition Error:", e);
                setState('IDLE');
            };

            recognitionRef.current.onend = () => {
                const finalTranscript = recognitionRef.current._internalTranscript;
                if (finalTranscript) {
                    sendToBackend(finalTranscript);
                    recognitionRef.current._internalTranscript = '';
                } else {
                    setState('IDLE');
                }
            };
        } else {
            console.error("Browser does not support SpeechRecognition.");
        }

        if (!hasStartedRef.current && topic !== "__WAIT__") {
            hasStartedRef.current = true;
            startLesson();
        }

        return () => {
            if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
        }
    }, [topic]);

    function parseDrawStep(cmd: any): StoryboardScene | null {
        if (!cmd) return null;
        let action = cmd.action;
        let payload: any = cmd.payload || {};

        if (action === 'clear_board' || action === 'clear') {
            nodePositionsRef.current.clear();
            drawnEdgesRef.current.clear();
            setScenes([]);
            return null;
        }

        if (action === 'draw_code' || action === 'draw_code_block' || cmd.code) {
            action = 'draw_code_block';
            const lang = cmd.language || 'python';
            payload = {
                code: cmd.code || '# Code snippet',
                language: lang,
                title: cmd.title || cmd.label || `lesson.${lang === 'python' ? 'py' : 'js'}`,
                position: [140, 90],
                width: 720,
                height: 380,
                highlight_lines: cmd.highlight_lines || [1, 2]
            };
        }
        else if (action === 'add_node') {
            const col = Math.max(0, Math.min(2, cmd.col || 0));
            const row = Math.max(0, Math.min(2, cmd.row || 0));
            // 1000x600 canvas
            const cx = 200 + col * 300;
            const cy = 130 + row * 170;
            
            nodePositionsRef.current.set(cmd.id, { cx, cy });

            const shape = cmd.shape || 'rect';
            const richObjects = ["cell", "network", "blockchain", "cycle", "gear", "document", "checklist", "triangle", "leaf", "flask", "lightbulb", "target", "book", "dialogue", "layers", "compass", "person", "users", "database", "server", "cloud", "folder", "shield", "lock", "key", "check", "cross", "brain", "money", "building", "globe", "envelope", "chip", "flag", "star", "warning", "gauge", "rocket", "handshake", "chart_up", "pencil_edit", "cog_icon", "clock", "search", "code"];
            
            if (richObjects.includes(shape)) {
                action = 'draw_object';
                const objWidth = 190;
                const objHeight = 160;
                payload = {
                    object_type: shape,
                    position: [cx - objWidth / 2, cy - objHeight / 2],
                    size: [objWidth, objHeight],
                    label: cmd.label || shape,
                    accent: cmd.color || '#0062b1'
                };
            } else if (shape === 'circle') {
                action = 'draw_circle';
                payload = {
                    center: [cx, cy],
                    radius: 65,
                    label: cmd.label,
                    style: { stroke: cmd.color || '#0062b1', strokeWidth: 3, fill: '#f8fafc' }
                };
            } else {
                action = 'draw_rect';
                const width = 260;
                const height = 95;
                payload = {
                    x: cx - width / 2,
                    y: cy - height / 2,
                    width,
                    height,
                    label: cmd.label,
                    style: { stroke: cmd.color || '#0062b1', strokeWidth: 2.5, rx: 16, fill: '#ffffff' }
                };
            }
        }
        else if (action === 'add_edge') {
            const edgeKey = `${cmd.from_id}->${cmd.to_id}`;
            if (drawnEdgesRef.current.has(edgeKey)) {
                return null;
            }
            drawnEdgesRef.current.add(edgeKey);

            action = 'draw_arrow';
            const fromNode = nodePositionsRef.current.get(cmd.from_id);
            const toNode = nodePositionsRef.current.get(cmd.to_id);
            if (fromNode && toNode) {
                 let dx = toNode.cx - fromNode.cx;
                 let dy = toNode.cy - fromNode.cy;
                 const len = Math.sqrt(dx*dx + dy*dy);
                 let startX = fromNode.cx; let startY = fromNode.cy;
                 let endX = toNode.cx; let endY = toNode.cy;
                 
                 if (len > 0) {
                     dx /= len; dy /= len;
                     startX = fromNode.cx + dx * 85;
                     startY = fromNode.cy + dy * 85;
                     endX = toNode.cx - dx * 85;
                     endY = toNode.cy - dy * 85;
                 }

                 payload = {
                     from: [startX, startY],
                     to: [endX, endY],
                     label: cmd.label,
                     style: { color: cmd.color || '#0062b1', strokeWidth: 3.5 }
                 };
            } else {
                return null;
            }
        }

        return {
            id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            action_type: action,
            time_offset: 0, // Instant zero-delay rendering in Whiteboard
            payload: payload
        };
    }

    const playSpeech = (text: string): Promise<void> => {
        return new Promise<void>(async (resolve) => {
            try {
                const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_KEY || "";
                const voiceId = "pNInz6obpgDQGcFmaJgB";
                const modelId = language === "ar" ? "eleven_multilingual_v2" : "eleven_turbo_v2_5";
                
                const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                    method: "POST",
                    headers: {
                        "Accept": "audio/mpeg",
                        "Content-Type": "application/json",
                        "xi-api-key": apiKey
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: modelId,
                        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
                    })
                });
                
                if (!res.ok) throw new Error("ElevenLabs API failed");
                
                const blob = await res.blob();
                const audioUrl = URL.createObjectURL(blob);
                const audio = getGlobalAudio() || new Audio(audioUrl);
                audio.src = audioUrl;
                currentAudioRef.current = audio;
                
                audio.onended = () => resolve();
                audio.onerror = () => resolve();
                audio.play().catch(e => {
                    console.error("Audio play failed:", e);
                    resolve();
                });
            } catch (e) {
                console.error("TTS Fallback", e);
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onend = () => resolve();
                utterance.onerror = () => resolve();
                window.speechSynthesis.speak(utterance);
                setTimeout(resolve, Math.max(2000, text.length * 50));
            }
        });
    };

    const executeTimeline = async (timeline: any[]) => {
        timelineAbortRef.current += 1;
        const currentRunId = timelineAbortRef.current;
        stopCurrentAudio();

        setState('AI_SPEAKING');
        setCurrentAiText('');
        setActiveQuiz(null);
        
        // Start an interval clock to drive animations smoothly if not running
        if (!elapsedIntervalRef.current) {
            elapsedIntervalRef.current = setInterval(() => {
                setElapsed(prev => prev + 0.1);
            }, 100);
        }

        // Group timeline steps into paired beats: [drawings to show] + [speech to hear] + [quiz if any]
        // This guarantees all visual elements appear BEFORE or in EXACT LOCKSTEP with the speech!
        const beats: { drawings: any[]; speakText: string | null; quiz: any | null }[] = [];
        let pendingDrawings: any[] = [];

        for (let i = 0; i < timeline.length; i++) {
            const step = timeline[i];
            if (step.type === 'draw' && step.command) {
                pendingDrawings.push(step.command);
            } else if (step.type === 'speak' && step.text) {
                // If the next immediate steps are also drawings, pull them into this beat
                // so they appear immediately before/during this explanation
                while (i + 1 < timeline.length && timeline[i + 1].type === 'draw' && timeline[i + 1].command) {
                    i++;
                    pendingDrawings.push(timeline[i].command);
                }
                beats.push({
                    drawings: pendingDrawings,
                    speakText: step.text,
                    quiz: null
                });
                pendingDrawings = [];
            } else if (step.type === 'quiz' && step.question && step.options) {
                beats.push({
                    drawings: pendingDrawings,
                    speakText: null,
                    quiz: { question: step.question, options: step.options }
                });
                pendingDrawings = [];
            }
        }

        if (pendingDrawings.length > 0) {
            beats.push({ drawings: pendingDrawings, speakText: null, quiz: null });
        }

        // Execute each beat in exact lockstep
        for (const beat of beats) {
            if (timelineAbortRef.current !== currentRunId) return;

            // 1. RENDER ALL DRAWINGS FIRST (so the visual is already on the board before speech starts!)
            if (beat.drawings.length > 0) {
                const newScenes: StoryboardScene[] = [];
                for (const cmd of beat.drawings) {
                    const scene = parseDrawStep(cmd);
                    if (scene) newScenes.push(scene);
                }
                if (newScenes.length > 0) {
                    setScenes(prev => [...prev, ...newScenes]);
                    // 150ms allows the drawing entrance animation to start popping on screen right as speech begins
                    await new Promise(r => setTimeout(r, 150));
                }
            }

            if (timelineAbortRef.current !== currentRunId) return;

            // 2. PLAY SPOKEN EXPLANATION (while the visual is already visible on the whiteboard!)
            if (beat.speakText) {
                setCurrentAiText(beat.speakText);
                await playSpeech(beat.speakText);
            }

            if (timelineAbortRef.current !== currentRunId) return;

            // 3. SHOW QUIZ (if this beat has one)
            if (beat.quiz) {
                setActiveQuiz(beat.quiz);
                setState('WAITING_FOR_QUIZ');
                return;
            }
        }

        if (elapsedIntervalRef.current) {
            clearInterval(elapsedIntervalRef.current);
            elapsedIntervalRef.current = null;
        }
        // Only set IDLE if we didn't end on a quiz
        setState(prevState => prevState === 'AI_SPEAKING' ? 'IDLE' : prevState);
    };

    
    async function startLesson(retryCount = 0) {
        unlockAudio();
        setState('THINKING');
        try {
            const res = await fetch(`/api/start`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ topic, language })
            });
            const data = await res.json();

            // If backend signals retry, wait and try again
            if (data.retry && retryCount < 3) {
                console.log(`Backend asked for retry, attempt ${retryCount + 1}/3...`);
                await new Promise(r => setTimeout(r, 2000));
                return startLesson(retryCount + 1);
            }

            if (data.timeline) {
                setHistory([{ role: 'model', text: JSON.stringify(data.timeline) }]);
                await executeTimeline(data.timeline);
            } else setState('IDLE');
        } catch (e) {
            console.error(`startLesson failed (attempt ${retryCount + 1}):`, e);
            if (retryCount < 3) {
                await new Promise(r => setTimeout(r, 2000));
                return startLesson(retryCount + 1);
            }
            setState('ERROR');
        }
    };

    async function sendToBackend(text: string, retryCount = 0) {
        unlockAudio();
        setState('THINKING');
        setActiveQuiz(null);
        try {
            const res = await fetch(`/api/chat`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: text, history, language })
            });
            const data = await res.json();

            // If backend signals retry, wait and try again
            if (data.retry && retryCount < 3) {
                console.log(`Backend asked for retry, attempt ${retryCount + 1}/3...`);
                await new Promise(r => setTimeout(r, 2000));
                return sendToBackend(text, retryCount + 1);
            }

            if (data.timeline) {
                setHistory(prev => [...prev, 
                    { role: 'user', text },
                    { role: 'model', text: JSON.stringify(data.timeline) }
                ]);
                await executeTimeline(data.timeline);
            } else setState('IDLE');
        } catch (e) {
            console.error(`sendToBackend failed (attempt ${retryCount + 1}):`, e);
            if (retryCount < 3) {
                await new Promise(r => setTimeout(r, 2000));
                return sendToBackend(text, retryCount + 1);
            }
            setState('ERROR');
        }
    }

    function submitQuiz(answer: string) {
        const questionText = activeQuiz ? activeQuiz.question : "Multiple Choice Question";
        sendToBackend(`Question: ${questionText}\nMy Answer: ${answer}`);
    };

    const toggleRecording = () => {
        timelineAbortRef.current += 1;
        stopCurrentAudio();

        if (state === 'AI_SPEAKING' || state === 'WAITING_FOR_QUIZ') {
            setState('IDLE');
        } else if (state === 'RECORDING') {
            recognitionRef.current?.stop();
        } else if (state === 'IDLE' || state === 'ERROR') {
            setTranscript('');
            if (recognitionRef.current) {
                recognitionRef.current._internalTranscript = '';
                recognitionRef.current.start();
                setState('RECORDING');
            }
        }
    };

    return { state, scenes, elapsed, toggleRecording, transcript, activeQuiz, submitQuiz, currentAiText, sendToBackend };
}
