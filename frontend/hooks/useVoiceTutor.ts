/* eslint-disable */
import { useState, useRef, useEffect } from 'react';
import type { StoryboardScene } from '@/lib/types';

export function useVoiceTutor(topic: string = "Basic Programming", language: string = "en") {
    const [state, setState] = useState<'IDLE' | 'CONNECTING' | 'RECORDING' | 'THINKING' | 'AI_SPEAKING' | 'WAITING_FOR_QUIZ' | 'ERROR'>('IDLE');
    const [scenes, setScenes] = useState<StoryboardScene[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [elapsed, setElapsed] = useState<number>(0);
    const [transcript, setTranscript] = useState<string>('');
    const [activeQuiz, setActiveQuiz] = useState<{question: string, options: string[]} | null>(null);
    
    const recognitionRef = useRef<any>(null);
    const hasStartedRef = useRef<boolean>(false);
    const elapsedIntervalRef = useRef<any>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    
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

    const executeTimeline = async (timeline: any[]) => {
        setState('AI_SPEAKING');
        setActiveQuiz(null);
        
        // Start an interval clock to drive animations smoothly if not running
        if (!elapsedIntervalRef.current) {
            elapsedIntervalRef.current = setInterval(() => {
                setElapsed(prev => prev + 0.1);
            }, 100);
        }

        let currentElapsed = elapsed; // Resume from current elapsed time

        for (const step of timeline) {
            // Check if user interrupted the AI
            if (!hasStartedRef.current && state !== 'AI_SPEAKING') break;

            if (step.type === 'draw' && step.command) {
                let action = step.command.action;
                let payload: any = step.command.payload || {};

                if (action === 'clear_board') {
                    action = 'clear';
                    payload = {};
                    nodePositionsRef.current.clear();
                    drawnEdgesRef.current.clear();
                    setScenes([]); // Clear the actual SVG drawings!
                } 
                else if (action === 'add_node') {
                    const col = Math.max(0, Math.min(2, step.command.col || 0));
                    const row = Math.max(0, Math.min(2, step.command.row || 0));
                    // Updated math for 1000x600 canvas
                    const cx = 160 + col * 340;
                    const cy = 120 + row * 180;
                    
                    nodePositionsRef.current.set(step.command.id, { cx, cy });

                    const shape = step.command.shape || 'rect';
                    const richObjects = ["cell", "network", "blockchain", "cycle", "gear", "document", "checklist", "triangle", "leaf", "flask", "lightbulb", "target", "book", "dialogue", "layers", "compass", "person", "users", "database", "server", "cloud", "folder", "shield", "lock", "key", "check", "cross", "brain", "money", "building", "globe", "envelope", "chip", "flag", "star", "warning", "gauge", "rocket", "handshake", "chart_up", "pencil_edit", "cog_icon", "clock", "search"];
                    
                    if (richObjects.includes(shape)) {
                        action = 'draw_object';
                        const objWidth = 120;
                        const objHeight = 120;
                        payload = {
                            object_type: shape,
                            position: [cx - objWidth/2, cy - objHeight/2],
                            size: [objWidth, objHeight],
                            label: step.command.label,
                            accent: step.command.color
                        };
                    } else if (shape === 'circle') {
                        action = 'draw_circle';
                        payload = { center: [cx, cy], radius: 45, label: step.command.label, style: { stroke: step.command.color } };
                    } else {
                        action = 'draw_rect';
                        const width = 140;
                        const height = 60;
                        payload = { x: cx - width/2, y: cy - height/2, width, height, label: step.command.label, style: { stroke: step.command.color } };
                    }
                } 
                else if (action === 'add_edge') {
                    const edgeKey = `${step.command.from_id}->${step.command.to_id}`;
                    if (drawnEdgesRef.current.has(edgeKey)) {
                        continue;
                    }
                    drawnEdgesRef.current.add(edgeKey);

                    action = 'draw_arrow';
                    const fromNode = nodePositionsRef.current.get(step.command.from_id);
                    const toNode = nodePositionsRef.current.get(step.command.to_id);
                    if (fromNode && toNode) {
                         let dx = toNode.cx - fromNode.cx;
                         let dy = toNode.cy - fromNode.cy;
                         const len = Math.sqrt(dx*dx + dy*dy);
                         let startX = fromNode.cx; let startY = fromNode.cy;
                         let endX = toNode.cx; let endY = toNode.cy;
                         
                         if (len > 0) {
                             dx /= len; dy /= len;
                             startX = fromNode.cx + dx * 55;
                             startY = fromNode.cy + dy * 55;
                             endX = toNode.cx - dx * 55;
                             endY = toNode.cy - dy * 55;
                         }

                         payload = {
                             from: [startX, startY],
                             to: [endX, endY],
                             label: step.command.label,
                             style: { color: step.command.color || '#94a3b8', strokeWidth: 3 }
                         };
                    } else {
                        continue;
                    }
                }

                const scene: StoryboardScene = {
                    id: `scene-${Date.now()}-${Math.random()}`,
                    action_type: action,
                    time_offset: currentElapsed,
                    payload: payload
                };
                
                setScenes(prev => [...prev, scene]);
                currentElapsed += 0.5;
                await new Promise(r => setTimeout(r, 500));
            } else if (step.type === 'speak' && step.text) {
                await new Promise<void>(async (resolve) => {
                    try {
                        const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_KEY || "";
                        // Adam - strict but friendly educational voice
                        const voiceId = "pNInz6obpgDQGcFmaJgB";
                        // Use multilingual model for Arabic, turbo for English
                        const modelId = language === "ar" ? "eleven_multilingual_v2" : "eleven_turbo_v2_5";
                        
                        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                            method: "POST",
                            headers: {
                                "Accept": "audio/mpeg",
                                "Content-Type": "application/json",
                                "xi-api-key": apiKey
                            },
                            body: JSON.stringify({
                                text: step.text,
                                model_id: modelId,
                                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
                            })
                        });
                        
                        if (!res.ok) throw new Error("ElevenLabs API failed");
                        
                        const blob = await res.blob();
                        const audioUrl = URL.createObjectURL(blob);
                        const audio = new Audio(audioUrl);
                        currentAudioRef.current = audio;
                        
                        audio.onended = () => {
                            currentElapsed += 0.5;
                            resolve();
                        };
                        audio.onerror = () => resolve();
                        audio.play();
                    } catch (e) {
                        console.error("TTS Fallback", e);
                        // Fallback to browser TTS if ElevenLabs fails
                        const utterance = new SpeechSynthesisUtterance(step.text);
                        utterance.onend = () => resolve();
                        utterance.onerror = () => resolve();
                        window.speechSynthesis.speak(utterance);
                    }
                });
            } else if (step.type === 'quiz' && step.question && step.options) {
                setActiveQuiz({ question: step.question, options: step.options });
                setState('WAITING_FOR_QUIZ');
                return; // Stop timeline execution, wait for user input
            }
        }
        
        if (elapsedIntervalRef.current) {
            clearInterval(elapsedIntervalRef.current);
            elapsedIntervalRef.current = null;
        }
        
        // Only set IDLE if we didn't end on a quiz
        setState(prevState => prevState === 'AI_SPEAKING' ? 'IDLE' : prevState);
    };

    const getBaseUrl = () => {
        if (process.env.NEXT_PUBLIC_API_URL) {
            return process.env.NEXT_PUBLIC_API_URL;
        }
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return ''; // Use relative path on Vercel because of rewrites
        }
        return typeof window !== 'undefined' ? `http://${window.location.hostname}:8000` : 'http://localhost:8000';
    };

    async function startLesson(retryCount = 0) {
        setState('THINKING');
        try {
            const res = await fetch(`${getBaseUrl()}/api/start`, {
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
        setState('THINKING');
        setActiveQuiz(null);
        try {
            const res = await fetch(`${getBaseUrl()}/api/chat`, {
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
        if (state === 'AI_SPEAKING' || state === 'WAITING_FOR_QUIZ') {
            window.speechSynthesis.cancel();
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
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

    return { state, scenes, elapsed, toggleRecording, transcript, activeQuiz, submitQuiz };
}
