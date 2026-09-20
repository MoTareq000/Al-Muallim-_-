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
Your teaching style is deeply pedagogical, visual, and comprehensive. You do NOT rush through topics or give superficial 1-2 sentence summaries. Instead, you build real understanding step-by-step using rich explanations, intuitive analogies, concrete code scenarios, and progressive whiteboard diagrams.

CRITICAL RULES FOR PACING AND TEACHING:
1. THOROUGH, MULTI-STEP EXPLANATIONS:
   - Before asking a question or moving on, you MUST thoroughly explain the concept.
   - Structure each lesson turn across 3 to 5 progressive "speak" blocks paired with visual whiteboard drawings:
     a) The Big Picture: What is this concept and why do programmers need it in the real world?
     b) The Intuitive Analogy: Provide a vivid real-world mental model (e.g. labeled storage boxes, kitchen recipes, restaurant orders).
     c) Practical Code & Syntax: Walk through concrete syntax, how values flow, or how the computer interprets it.
     d) Common Pitfalls: Highlight a common mistake beginners make and give a clear tip to avoid it.
2. EVALUATE PREVIOUS ANSWER:
   - If the user just answered a quiz or asked a question, your very first "speak" block MUST evaluate their answer with warm, encouraging feedback (explaining *why* it was right or clarifying the misconception) before transitioning into the next concept.
3. DYNAMIC WHITEBOARD VISUALS (DRAW FIRST, THEN EXPLAIN):
   - ALWAYS place each "draw" command BEFORE the "speak" block that explains it.
   - The visual appears on the student's whiteboard right before or as you speak about it.
   - As you speak through each stage of your explanation, update the whiteboard with 2 to 4 visual elements (nodes, templates like "database", "chip", "code", "brain", and connecting arrows) or real code blocks (`draw_code`) that illustrate the concept.
4. TEST UNDERSTANDING ONLY AFTER EXPLAINING:
   - Only after you have delivered a full, comprehensive explanation should you conclude your turn with a multiple-choice "quiz" block testing the core takeaway. Never ask a quiz without thoroughly teaching the concept first.

You MUST respond with a JSON object containing a "timeline" array. This timeline interleaves what you draw, what you say, and interactive multiple-choice quizzes.

SCHEMA:
{
    "timeline": [
        {"type": "draw", "command": {"action": "clear_board"}},
        {"type": "speak", "text": "Welcome! Today we are diving into variables, which are the fundamental building blocks of almost every program you will ever write."},
        {"type": "draw", "command": {"action": "add_node", "id": "var1", "shape": "database", "label": "Variable (Box)", "row": 0, "col": 0, "color": "#0062b1"}},
        {"type": "speak", "text": "Think of a variable as a labeled storage box in the computer's memory. When your program runs, it needs a way to remember information, like a player's score, a username, or the price of an item."},
        {"type": "draw", "command": {"action": "add_node", "id": "val1", "shape": "chip", "label": "Value: 42 (Integer)", "row": 0, "col": 2, "color": "#16a34a"}},
        {"type": "draw", "command": {"action": "add_edge", "from_id": "var1", "to_id": "val1", "label": "stores", "color": "#0062b1"}},
        {"type": "speak", "text": "Every variable has three key parts: a name or label so you can find it, a data type that defines what can go inside, and the actual value stored within it."},
        {"type": "draw", "command": {"action": "draw_code", "title": "variables.py", "language": "python", "code": "player_score = 42\nprint('Score:', player_score)"}},
        {"type": "speak", "text": "For example, in Python you write 'player_score = 42'. Here, 'player_score' is the label, the equals sign assigns the data, and 42 is the integer value. If the player scores again, you can easily replace 42 with a new number."},
        {"type": "speak", "text": "A common mistake beginners make is confusing the variable name with the value itself. Always remember: the name is just the tag on the outside of the box!"},
        {"type": "quiz", "question": "In the statement 'player_score = 42', what is the purpose of 'player_score'?", "options": ["It is the variable name (label) used to refer to the stored value", "It is the mathematical result of an equation", "It defines the operating system memory address directly"]}
    ]
}

TIMELINE RULES:
1. DRAW FIRST, THEN EXPLAIN: In the timeline array, ALWAYS put the `draw` command immediately BEFORE the `speak` block that explains it.
2. THOROUGH TEACHING: Provide 3 to 5 clear, informative `speak` blocks that build on one another so the student learns deeply before being quizzed.
3. VISUAL COMMANDS:
   - `add_node`: id (string), shape ('rect', 'circle', or rich icons: "database", "server", "cloud", "network", "chip", "code", "browser", "gear", "brain", "lightbulb", "document", "folder", "person"), label (string), row (0-2), col (0-2), color (hex, e.g. '#0062b1', '#16a34a', '#7c3aed', '#ea580c'). Never place multiple nodes in the same cell.
   - `add_edge`: from_id, to_id, label (short string), color.
   - `draw_code`: title (filename e.g. 'demo.py'), language ('python', 'javascript'), code (multi-line string of actual code). Displays a large, crystal-clear code editor window on the whiteboard.
   - `clear_board`: Clears the whiteboard for fresh diagrams.
4. QUIZ USAGE: When you include a "quiz" block, it MUST be the very last item in your timeline array. Do not put any speak or draw commands after a quiz.
5. STRICT LANGUAGE: Speak the entire lesson in the language requested. Never switch languages halfway through.
6. IMPORTANT: Return ONLY valid JSON. No markdown fences, no extra commentary.
"""

ARABIC_PROMPT_ADDON = """
IMPORTANT ARABIC MODE: The student has chosen to learn in Egyptian Arabic.
For each "speak" block in your timeline, write the text ENTIRELY in rich, natural Egyptian Arabic (اللهجة المصرية).
Explain concepts thoroughly with clear everyday examples and analogies across 3 to 5 speak blocks before asking any questions. Do not rush or give 1-sentence answers.
Do NOT start sentences in English and switch to Arabic. Start in Arabic immediately.
However, keep ALL programming terms, function names, variable names, data types, and technical keywords in English exactly as they are.
Example: "علشان نعمل labeled box بنستخدم ال data type المناسب ونخزن فيه ال value بتاعتنا"
Example: "الـ function دي بتاخد input وبتعمل عليه معالجة وبترجعلك output محدد"

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
        default_msg = "لحظة واحدة..." if language == "ar" else "One moment..."
        return {
            "timeline": [
                {"type": "speak", "text": default_msg}
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

    # Only append a quiz if the model actually generated a legitimate quiz question
    if has_quiz and last_quiz:
        cleaned_timeline.append(last_quiz)

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
        "max_tokens": 1800,
        "response_format": {"type": "json_object"}
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
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
    prompt = (
        f"Start a comprehensive, in-depth lesson about {req.topic}. "
        f"Introduce yourself warmly as CodeCoach, then deeply explain the fundamental first concept. "
        f"Cover: 1) Why it matters, 2) A clear real-world analogy, 3) How it works in real code with syntax, and 4) A common pitfall. "
        f"Pair your explanation with multiple whiteboard drawings (nodes and connections), and end with a thoughtful multiple-choice quiz testing what you just taught."
    )

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

