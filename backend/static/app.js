// app.js — State Machine, WebSocket Client, and UI Controller

const STATE = {
    CONNECTING: 'connecting',
    AI_SPEAKING: 'ai_speaking',
    IDLE: 'idle',
    RECORDING: 'recording',
    PROCESSING: 'processing',
    ERROR: 'error'
};

let currentState = STATE.CONNECTING;
let ws = null;
let audioHandler = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
let processingTimeout = null;
const MAX_RECONNECT_ATTEMPTS = 5;
const PROCESSING_TIMEOUT_MS = 30000;

// DOM Elements
const DOM = {
    orbContainer: document.getElementById('orb-container'),
    orb: document.getElementById('orb'),
    pttButton: document.getElementById('ptt-button'),
    statusText: document.getElementById('status-text'),
    transcript: document.getElementById('transcript'),
    stateLabel: document.getElementById('state-label'),
    audioPrompt: document.getElementById('audio-prompt'),
    startAudioBtn: document.getElementById('start-audio-btn'),
    errorBanner: document.getElementById('error-banner'),
    errorMessage: document.getElementById('error-message'),
    closeErrorBtn: document.getElementById('close-error-btn'),
    curriculumItems: document.querySelectorAll('.curriculum-list li'),
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initAudioHandler();
    setupEventListeners();
    connectWebSocket();
});

function initAudioHandler() {
    audioHandler = new AudioHandler((base64Chunk) => {
        if (ws && ws.readyState === WebSocket.OPEN && currentState === STATE.RECORDING) {
            ws.send(JSON.stringify({
                type: 'audio',
                data: base64Chunk
            }));
        }
    });
}

function setupEventListeners() {
    // Push-to-Talk Mouse & Touch
    const ptt = DOM.pttButton;

    const onStart = (e) => {
        e.preventDefault();
        startRecording();
    };

    const onStop = (e) => {
        e.preventDefault();
        stopRecording();
    };

    ptt.addEventListener('mousedown', onStart);
    ptt.addEventListener('mouseup', onStop);
    ptt.addEventListener('mouseleave', () => {
        if (currentState === STATE.RECORDING) {
            stopRecording();
        }
    });

    ptt.addEventListener('touchstart', onStart, { passive: false });
    ptt.addEventListener('touchend', onStop, { passive: false });
    ptt.addEventListener('touchcancel', onStop, { passive: false });

    // Keyboard Push-to-Talk (Spacebar hold)
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat && document.activeElement.tagName !== 'INPUT') {
            if (currentState === STATE.IDLE) {
                e.preventDefault();
                startRecording();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space' && currentState === STATE.RECORDING) {
            e.preventDefault();
            stopRecording();
        }
    });

    // Start Audio / Interaction overlay for browser autoplay policy
    if (DOM.startAudioBtn) {
        DOM.startAudioBtn.addEventListener('click', async () => {
            try {
                await audioHandler.initMic();
                if (audioHandler.playbackContext && audioHandler.playbackContext.state === 'suspended') {
                    await audioHandler.playbackContext.resume();
                }
                DOM.audioPrompt.classList.add('hidden');
            } catch (err) {
                console.warn('Microphone permission request failed:', err);
                showError('Microphone access is required for voice interaction. Please grant mic permissions in your browser.');
            }
        });
    }

    if (DOM.closeErrorBtn) {
        DOM.closeErrorBtn.addEventListener('click', () => {
            DOM.errorBanner.classList.add('hidden');
        });
    }
}

function setState(newState) {
    currentState = newState;
    const container = DOM.orbContainer;

    // Clear any pending processing timeout
    if (processingTimeout) {
        clearTimeout(processingTimeout);
        processingTimeout = null;
    }

    // Safety net: if stuck in PROCESSING too long, fall back to IDLE
    if (newState === STATE.PROCESSING) {
        processingTimeout = setTimeout(() => {
            if (currentState === STATE.PROCESSING) {
                console.warn('Processing timeout — falling back to IDLE');
                setState(STATE.IDLE);
            }
        }, PROCESSING_TIMEOUT_MS);
    }

    // Reset and apply state classes
    container.className = 'orb-container';
    container.classList.add(`state-${newState}`);

    const statusMap = {
        [STATE.CONNECTING]:  '🔌 Connecting to CodeCoach...',
        [STATE.AI_SPEAKING]: '🗣️ CodeCoach is speaking...',
        [STATE.IDLE]:        '🎤 Hold the button or Space to speak',
        [STATE.RECORDING]:   '🔴 Listening to you... release to send',
        [STATE.PROCESSING]:  '⏳ Processing your question...',
        [STATE.ERROR]:       '⚠️ Connection or session error'
    };

    DOM.statusText.textContent = statusMap[newState] || '';

    // PTT button enabled only when idle or recording
    const isPttEnabled = (newState === STATE.IDLE || newState === STATE.RECORDING);
    DOM.pttButton.disabled = !isPttEnabled;

    if (newState === STATE.RECORDING) {
        DOM.pttButton.classList.add('active');
    } else {
        DOM.pttButton.classList.remove('active');
    }

    DOM.stateLabel.textContent = newState.replace('_', ' ').toUpperCase();
    DOM.stateLabel.className = `state-badge badge-${newState}`;
}

async function startRecording() {
    if (currentState !== STATE.IDLE) return;

    try {
        setState(STATE.RECORDING);
        await audioHandler.startCapture();
    } catch (err) {
        console.error('Error starting mic capture:', err);
        showError('Could not start microphone: ' + err.message);
        setState(STATE.IDLE);
    }
}

function stopRecording() {
    if (currentState !== STATE.RECORDING) return;

    audioHandler.stopCapture();
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'mic_stop' }));
    }
    setState(STATE.PROCESSING);
}

function connectWebSocket() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    setState(STATE.CONNECTING);
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${location.host}/ws/session`;

    try {
        ws = new WebSocket(wsUrl);
    } catch (e) {
        console.error('WebSocket instantiation error:', e);
        scheduleReconnect();
        return;
    }

    ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0;
        hideError();
        // Request session setup
        ws.send(JSON.stringify({ type: 'start_session' }));
    };

    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            handleServerMessage(msg);
        } catch (e) {
            console.error('Error parsing WS message:', e);
        }
    };

    ws.onclose = (event) => {
        console.warn('WebSocket closed:', event);
        if (currentState !== STATE.ERROR) {
            setState(STATE.CONNECTING);
        }
        scheduleReconnect();
    };

    ws.onerror = (e) => {
        console.error('WebSocket error:', e);
    };
}

function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        showError('Lost connection to server. Please check your terminal and refresh the page.');
        setState(STATE.ERROR);
        return;
    }

    reconnectAttempts++;
    const delay = Math.min(2000 * reconnectAttempts, 10000);
    DOM.statusText.textContent = `Retrying connection in ${delay / 1000}s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`;
    reconnectTimer = setTimeout(connectWebSocket, delay);
}

function handleServerMessage(msg) {
    switch (msg.type) {
        case 'session_ready':
            console.log('Session ready');
            setState(STATE.AI_SPEAKING);
            break;

        case 'ai_speaking_start':
            setState(STATE.AI_SPEAKING);
            break;

        case 'audio':
            if (currentState !== STATE.AI_SPEAKING) {
                setState(STATE.AI_SPEAKING);
            }
            if (audioHandler) {
                audioHandler.playChunk(msg.data);
            }
            break;

        case 'ai_speaking_stop':
            setState(STATE.IDLE);
            break;

        case 'transcript':
            appendTranscript(msg.role, msg.text);
            break;

        case 'show_visual':
            renderVisual(msg);
            break;

        case 'error':
            console.error('Server error message:', msg.message);
            showError(msg.message);
            setState(STATE.ERROR);
            break;

        default:
            console.log('Unhandled message type:', msg.type);
    }
}

function renderVisual(msg) {
    const container = document.getElementById('visual-container');
    if (!container) return;

    // Clear previous
    container.innerHTML = '';
    container.classList.remove('hidden');

    const header = document.createElement('div');
    header.className = 'visual-header';
    header.textContent = msg.title || 'Visual Aid';
    container.appendChild(header);

    try {
        const data = JSON.parse(msg.data);
        
        switch (msg.visual_type) {
            case 'comparison_table':
                if (Array.isArray(data) && data.length > 0) {
                    const table = document.createElement('table');
                    table.className = 'visual-table';
                    
                    const thead = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    const keys = Object.keys(data[0]);
                    keys.forEach(key => {
                        const th = document.createElement('th');
                        th.textContent = key;
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                    table.appendChild(thead);

                    const tbody = document.createElement('tbody');
                    data.forEach(item => {
                        const tr = document.createElement('tr');
                        keys.forEach(key => {
                            const td = document.createElement('td');
                            td.textContent = item[key] || '';
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                    container.appendChild(table);
                }
                break;

            case 'code_snippet':
                const pre = document.createElement('pre');
                pre.className = 'visual-code';
                const code = document.createElement('code');
                code.textContent = data.code || '';
                pre.appendChild(code);
                container.appendChild(pre);
                
                if (data.explanation) {
                    const exp = document.createElement('p');
                    exp.className = 'visual-explanation';
                    exp.textContent = data.explanation;
                    container.appendChild(exp);
                }
                break;

            case 'bullet_list':
                if (data.items && Array.isArray(data.items)) {
                    const ul = document.createElement('ul');
                    ul.className = 'visual-list';
                    data.items.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        ul.appendChild(li);
                    });
                    container.appendChild(ul);
                }
                break;

            case 'concept_card':
                const card = document.createElement('div');
                card.className = 'visual-card';
                
                const term = document.createElement('h3');
                term.textContent = data.term || '';
                card.appendChild(term);
                
                const def = document.createElement('p');
                def.className = 'card-def';
                def.textContent = data.definition || '';
                card.appendChild(def);
                
                if (data.analogy) {
                    const analogy = document.createElement('div');
                    analogy.className = 'card-analogy';
                    analogy.innerHTML = `<strong>Analogy:</strong> ${data.analogy}`;
                    card.appendChild(analogy);
                }
                container.appendChild(card);
                break;
        }
    } catch (e) {
        console.error('Failed to parse visual data:', e);
    }
}

function appendTranscript(role, text) {
    if (!text || !text.trim()) return;

    const entry = document.createElement('div');
    entry.className = `transcript-entry ${role}`;

    const header = document.createElement('div');
    header.className = 'transcript-header';

    const roleName = document.createElement('span');
    roleName.className = 'transcript-role';
    roleName.textContent = role === 'user' ? '👤 Student' : '🤖 CodeCoach';

    const time = document.createElement('span');
    time.className = 'transcript-time';
    const now = new Date();
    time.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    header.appendChild(roleName);
    header.appendChild(time);

    const body = document.createElement('div');
    body.className = 'transcript-body';
    body.textContent = text;

    entry.appendChild(header);
    entry.appendChild(body);

    DOM.transcript.appendChild(entry);
    DOM.transcript.scrollTop = DOM.transcript.scrollHeight;

    // Detect unit mention to highlight active unit in sidebar
    updateCurriculumHighlight(text);
}

function updateCurriculumHighlight(text) {
    const lower = text.toLowerCase();
    const unitMap = [
        "introduction to programming",
        "variables & data types",
        "operators & expressions",
        "control flow",
        "functions",
        "data structures",
        "working with strings",
        "file handling",
        "error handling",
        "mini-project"
    ];

    unitMap.forEach((unitName, idx) => {
        if (lower.includes(`unit ${idx + 1}`) || lower.includes(unitName.toLowerCase())) {
            DOM.curriculumItems.forEach((li, i) => {
                li.classList.toggle('active', i === idx);
            });
        }
    });
}

function showError(message) {
    if (DOM.errorMessage && DOM.errorBanner) {
        DOM.errorMessage.textContent = message;
        DOM.errorBanner.classList.remove('hidden');
    }
}

function hideError() {
    if (DOM.errorBanner) {
        DOM.errorBanner.classList.add('hidden');
    }
}
