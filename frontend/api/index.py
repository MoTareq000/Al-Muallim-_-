import os
import json
import time
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-voice-tutor")

app = FastAPI(title="CodeCoach - Turn-Based Tutor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "openai/gpt-oss-120b"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are CodeCoach, an incredibly engaging, patient, and world-class programming tutor.
Your teaching style is highly visual, relying on analogies, step-by-step breakdowns, and interactive quizzes.

CRITICAL RULES FOR PACING AND TEACHING:
1. EXPLAIN FIRST, THEN ASK: NEVER ask a question or give a quiz before you have actually explained a concept.
2. ONE CONCEPT AT A TIME: Explain exactly ONE simple concept per turn. Use 2 to 4 sentences maximum.
3. USE THE WHITEBOARD: Always pair your spoken explanation with a drawing on the 3x3 grid whiteboard.
4. SMOOTH TRANSITIONS: When you finish explaining a concept, you MUST end your turn by either asking a spoken question to check their understanding OR giving them a multiple-choice "quiz". Do not just stop talking awkwardly.

You MUST respond with a JSON object containing a "timeline" array. This timeline interleaves what you say, what you draw, and interactive multiple-choice quizzes.

SCHEMA:
{
    "timeline": [
        {"type": "draw", "command": {"action": "clear_board"}},
        {"type": "speak", "text": "Let's learn about variables. Think of a variable as a labeled box where you can store data."},
        {"type": "draw", "command": {"action": "add_node", "id": "var1", "shape": "database", "label": "Variable (Box)", "row": 0, "col": 1, "color": "#0062b1"}},
        {"type": "speak", "text": "You can put different things in this box, like numbers or text. Does that make sense?"},
        {"type": "quiz", "question": "What is the best analogy for a variable?", "options": ["A labeled box", "A complex machine", "A type of network"]}
    ]
}

TIMELINE RULES:
1. EXPLAIN FIRST: You MUST break down concepts into small, digestible steps (2-4 sentences max per step).
2. SMOOTH TRANSITIONS: When you finish explaining a concept, you MUST end your turn by giving the student a multiple-choice "quiz" block. DO NOT STOP without a quiz!
3. QUIZ IS MANDATORY: You must ALWAYS include exactly ONE "quiz" block at the absolute end of your timeline array, no exceptions!
4. For nodes, use row: 0-2 and col: 0-2. NEVER overlap nodes.
5. SHAPES: You can use 'rect', 'circle', or templates like "database", "server", "cloud", "network", "chip", "code", "browser", "gear", "brain", "lightbulb", "document", "folder", "person".
6. IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no extra text.
"""

ARABIC_PROMPT_ADDON = """
IMPORTANT ARABIC MODE: The student has chosen to learn in Egyptian Arabic.
For each "speak" block in your timeline, you MUST write the text in Egyptian Arabic (عامية مصرية).
However, you MUST keep ALL programming terms, function names, variable names, data types, and technical keywords in English exactly as they are.
Example: "المتغير ده زي labeled box بنحط فيه الـ data بتاعتنا"
Example: "الـ function دي بتاخد input وبترجعلك output"

For "quiz" blocks: Write the question in Egyptian Arabic, but keep technical terms in English. Write the options in Egyptian Arabic too (with English technical terms preserved).

The "draw" commands MUST ALWAYS use English labels only — never Arabic in draw commands.
"""

class StartRequest(BaseModel):
    topic: str = "Introduction to Programming"
    language: str = "en"

class ChatRequest(BaseModel):
    message: str
    history: list = []
    language: str = "en"


def call_groq(messages, max_retries=3):
    """Call Groq API with automatic retry on failure."""
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "response_format": {"type": "json_object"}
    }

    for attempt in range(max_retries):
        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.post(GROQ_URL, headers=headers, json=payload)
                res.raise_for_status()
                result = res.json()
                content = result["choices"][0]["message"]["content"]
                
                # Strip markdown json blocks if the LLM wraps the response
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                elif content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
                
                data = json.loads(content)
                return data
        except Exception as e:
            logger.warning(f"Groq API attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                wait_time = 3 * (attempt + 1)
                logger.info(f"Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                logger.error(f"All {max_retries} attempts failed.")
                raise e


@app.post("/api/start")
async def start_lesson(req: StartRequest):
    system = SYSTEM_PROMPT + (ARABIC_PROMPT_ADDON if req.language == "ar" else "")
    prompt = f"Start a lesson about {req.topic}. Introduce yourself, explain the first concept, draw a diagram on the whiteboard, and ask if the student understands."

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt}
    ]

    try:
        return call_groq(messages)
    except Exception as e:
        logger.error(f"Groq API Error in /start: {e}")
        return {
            "timeline": [
                {"type": "speak", "text": "Hold on, let me gather my thoughts..."}
            ],
            "retry": True
        }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    system = SYSTEM_PROMPT + (ARABIC_PROMPT_ADDON if req.language == "ar" else "")
    
    messages = [{"role": "system", "content": system}]

    for h in req.history[-6:]:
        role = "assistant" if h.get("role") == "model" else "user"
        messages.append({"role": role, "content": h["text"]})

    messages.append({"role": "user", "content": req.message})

    logger.info(f"Generating response for: {req.message}")
    try:
        return call_groq(messages)
    except Exception as e:
        logger.error(f"Groq API Error in /chat: {e}")
        return {
            "timeline": [
                {"type": "speak", "text": "Hold on, let me gather my thoughts..."}
            ],
            "retry": True
        }
