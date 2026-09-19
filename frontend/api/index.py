import os
import json
import asyncio
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
1. EVALUATE PREVIOUS ANSWER: If the user just answered a quiz, your very first "speak" block MUST evaluate their answer with encouraging feedback (e.g., "Correct! Because..." or "Not quite, because...").
2. EXPLAIN FIRST, THEN ASK: Explain exactly ONE simple concept per turn. Use 2 to 4 sentences maximum. Never quiz before you have actually explained a concept.
3. USE THE WHITEBOARD: Always pair your spoken explanation with 1-2 drawings on the 3x3 grid whiteboard.
4. ALWAYS END WITH A QUIZ: The absolute LAST item in your timeline array MUST be a single multiple-choice "quiz" block with 3 clear options to check understanding. Never omit the quiz block.

You MUST respond with a JSON object containing a "timeline" array. This timeline interleaves what you say, what you draw, and interactive multiple-choice quizzes.

SCHEMA:
{
    "timeline": [
        {"type": "draw", "command": {"action": "clear_board"}},
        {"type": "speak", "text": "Let's learn about variables. Think of a variable as a labeled box where you can store data."},
        {"type": "draw", "command": {"action": "add_node", "id": "var1", "shape": "database", "label": "Variable (Box)", "row": 0, "col": 1, "color": "#0062b1"}},
        {"type": "speak", "text": "You can put different things in this box, like numbers or text."},
        {"type": "quiz", "question": "What is the best analogy for a variable?", "options": ["A labeled box", "A complex machine", "A type of network"]}
    ]
}

TIMELINE RULES:
1. EXPLAIN FIRST: Break down concepts into small, digestible steps (2-4 sentences max per step).
2. For nodes, use row: 0-2 and col: 0-2. Never place multiple nodes in the same cell.
3. SHAPES: You can use 'rect', 'circle', or templates like "database", "server", "cloud", "network", "chip", "code", "browser", "gear", "brain", "lightbulb", "document", "folder", "person".
4. QUIZ IS MANDATORY: Exactly ONE "quiz" block must exist at the very end of your timeline.
5. STRICT LANGUAGE: Speak the entire lesson in the language requested. Never switch languages halfway through.
6. IMPORTANT: Return ONLY valid JSON. No markdown fences, no extra commentary.
"""

ARABIC_PROMPT_ADDON = """
IMPORTANT ARABIC MODE: The student has chosen to learn in Egyptian Arabic.
For each "speak" block in your timeline, write the text ENTIRELY in Egyptian Arabic (اللهجة المصرية).
Do NOT start sentences in English and switch to Arabic. Start in Arabic immediately.
However, keep ALL programming terms, function names, variable names, data types, and technical keywords in English exactly as they are.
Example: "علشان نعمل labeled box بنستخدم ال data type المناسب"
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


def sanitize_timeline(data: dict, language: str = "en") -> dict:
    """Validate and normalize LLM timeline output to guarantee client safety."""
    if not isinstance(data, dict) or "timeline" not in data or not isinstance(data["timeline"], list):
        default_msg = "جاهز نكمل؟" if language == "ar" else "Ready to continue?"
        return {
            "timeline": [
                {"type": "speak", "text": default_msg},
                {
                    "type": "quiz",
                    "question": "Ready to move to the next concept?" if language != "ar" else "جاهز للمفهوم اللي بعده؟",
                    "options": ["Yes, let's continue!", "Explain more"] if language != "ar" else ["يلا نكمل!", "ممكن شرح أكتر؟"]
                }
            ]
        }

    cleaned_timeline = []
    has_quiz = False
    last_quiz = None

    for item in data["timeline"]:
        if not isinstance(item, dict):
            continue
        item_type = item.get("type")
        if item_type == "speak" and item.get("text"):
            cleaned_timeline.append({"type": "speak", "text": str(item["text"]).strip()})
        elif item_type == "draw" and isinstance(item.get("command"), dict):
            cleaned_timeline.append({"type": "draw", "command": item["command"]})
        elif item_type == "quiz":
            question = item.get("question")
            options = item.get("options")
            if question and isinstance(options, list) and len(options) >= 2:
                has_quiz = True
                last_quiz = {
                    "type": "quiz",
                    "question": str(question).strip(),
                    "options": [str(opt).strip() for opt in options[:4]]
                }

    # Ensure there is always a valid quiz at the end
    if has_quiz and last_quiz:
        cleaned_timeline.append(last_quiz)
    else:
        continuation_quiz = {
            "type": "quiz",
            "question": "Ready to explore the next concept?" if language != "ar" else "جاهز للمفهوم اللي بعده؟",
            "options": ["Yes, let's continue!", "Can you explain more?"] if language != "ar" else ["تمام، يلا نكمل!", "ممكن توضيح أكتر؟"]
        }
        cleaned_timeline.append(continuation_quiz)

    return {"timeline": cleaned_timeline}


async def call_groq(messages: list, language: str = "en", max_retries: int = 2) -> dict:
    """Call Groq API asynchronously without blocking the event loop."""
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.5,
        "max_tokens": 1200,
        "response_format": {"type": "json_object"}
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        for attempt in range(max_retries):
            try:
                res = await client.post(GROQ_URL, headers=headers, json=payload)
                res.raise_for_status()
                result = res.json()
                content = result["choices"][0]["message"]["content"].strip()
                
                # Strip markdown json code fences if present
                if content.startswith("```json"):
                    content = content[7:]
                elif content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
                
                data = json.loads(content)
                return sanitize_timeline(data, language)
            except Exception as e:
                logger.warning(f"Groq API attempt {attempt + 1}/{max_retries} failed: {e}")
                if attempt < max_retries - 1:
                    wait_time = 1.5 * (attempt + 1)
                    logger.info(f"Retrying Groq API in {wait_time}s...")
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"All {max_retries} Groq API attempts failed: {e}")
                    raise e


@app.post("/api/start")
async def start_lesson(req: StartRequest):
    system = SYSTEM_PROMPT + (ARABIC_PROMPT_ADDON if req.language == "ar" else "")
    prompt = f"Start a lesson about {req.topic}. Introduce yourself, explain the first concept clearly with an analogy, draw a diagram on the whiteboard, and end with a quiz to check understanding."

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt}
    ]

    try:
        return await call_groq(messages, language=req.language)
    except Exception as e:
        logger.error(f"Groq API Error in /start: {e}")
        fallback_text = "لحظة واحدة برتب أفكاري..." if req.language == "ar" else "Hold on, let me gather my thoughts..."
        return {
            "timeline": [
                {"type": "speak", "text": fallback_text},
                {
                    "type": "quiz",
                    "question": "Ready to begin?" if req.language != "ar" else "جاهز نبدأ؟",
                    "options": ["Yes, let's go!" if req.language != "ar" else "يلا بينا!", "Give me a second" if req.language != "ar" else "ثانية واحدة"]
                }
            ],
            "retry": True
        }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    system = SYSTEM_PROMPT + (ARABIC_PROMPT_ADDON if req.language == "ar" else "")
    
    messages = [{"role": "system", "content": system}]

    for h in req.history[-6:]:
        role = "assistant" if h.get("role") == "model" else "user"
        messages.append({"role": role, "content": h.get("text", "")})

    messages.append({"role": "user", "content": req.message})

    logger.info(f"Generating response for: {req.message}")
    try:
        return await call_groq(messages, language=req.language)
    except Exception as e:
        logger.error(f"Groq API Error in /chat: {e}")
        fallback_text = "لحظة واحدة برتب أفكاري..." if req.language == "ar" else "Hold on, let me gather my thoughts..."
        return {
            "timeline": [
                {"type": "speak", "text": fallback_text},
                {
                    "type": "quiz",
                    "question": "Ready to continue?" if req.language != "ar" else "جاهز نكمل؟",
                    "options": ["Yes, continue" if req.language != "ar" else "تمام نكمل", "Explain again" if req.language != "ar" else "ممكن تعيد"]
                }
            ],
            "retry": True
        }

