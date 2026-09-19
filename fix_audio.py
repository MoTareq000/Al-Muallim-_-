
import re

with open('frontend/hooks/useVoiceTutor.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add global audio helper
helper = '''
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
'''

content = content.replace('export function useVoiceTutor', helper + '\nexport function useVoiceTutor')

# 2. Add unlockAudio to sendToBackend and startLesson
content = content.replace('async function startLesson(retryCount = 0) {', 'async function startLesson(retryCount = 0) {\n        unlockAudio();')
content = content.replace('async function sendToBackend(text: string, retryCount = 0) {', 'async function sendToBackend(text: string, retryCount = 0) {\n        unlockAudio();')

# 3. Replace new Audio with getGlobalAudio
content = content.replace('const audio = new Audio(audioUrl);', 'const audio = getGlobalAudio() || new Audio(audioUrl);\n                        audio.src = audioUrl;')

with open('frontend/hooks/useVoiceTutor.ts', 'w', encoding='utf-8') as f:
    f.write(content)

