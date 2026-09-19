# 🎙️ CodeCoach — Voice-Based AI Programming Tutor

A real-time, bidirectional voice-based AI tutor that teaches a complete Grade 10 programming curriculum using the **Gemini Multimodal Live API**.

---

## 🚀 Quick Start

### 1. Add your Gemini API Key
Open `.env` in this directory and paste your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey):
```ini
GEMINI_API_KEY=AIzaSy...your_real_api_key_here
```

### 2. Run the Application
You can double-click **`run.bat`** or run from your terminal:

```bash
# 1. Install dependencies (if not already installed)
pip install -r requirements.txt

# 2. Start the FastAPI server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Open in Browser
Visit **`http://localhost:8000`** in Google Chrome or Microsoft Edge.
- Click **"Join Classroom"** to allow microphone access.
- CodeCoach will introduce itself and automatically start teaching Unit 1.
- Hold the **microphone button** or press and hold the **Spacebar** to speak and ask questions!

---

## 🛠️ Project Structure

```
ai-voice-tutor/
├── main.py                  # FastAPI server + Gemini Live bidirectional streaming
├── curriculum.py            # Grade 10 curriculum and pedagogical system instructions
├── requirements.txt         # Dependencies (google-genai, fastapi, uvicorn, python-dotenv)
├── .env                     # Your environment config (paste GEMINI_API_KEY here)
├── .env.example             # Environment template
├── run.bat                  # One-click Windows launcher
└── static/
    ├── index.html           # Dark-themed modern UI layout
    ├── style.css            # Glassmorphism, animated glowing orb, responsive styles
    ├── app.js               # State machine, WebSocket client, UI controller
    ├── audio-handler.js     # Web Audio API mic capture & gapless 24kHz playback
    └── audio-processor.js   # AudioWorklet downsampling to 16kHz PCM
```

---

## ⚙️ Configuration Options (`.env`)

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Your Gemini API Key (**Required**) | *(empty)* |
| `GEMINI_MODEL` | Live model identifier | `gemini-2.0-flash-live` |
| `GEMINI_VOICE` | Prebuilt voice (`Kore`, `Puck`, `Charon`, `Fenrir`, `Aoede`) | `Kore` |

---

## 📚 Curriculum Covered
1. **Unit 1**: Introduction to Programming (What is code? Why learn it?)
2. **Unit 2**: Variables & Data Types (Numbers, strings, booleans, input)
3. **Unit 3**: Operators & Expressions (Arithmetic, comparison, logical)
4. **Unit 4**: Control Flow (Conditionals & loops)
5. **Unit 5**: Functions (Definitions, parameters, scope)
6. **Unit 6**: Data Structures (Lists, tuples, dictionaries)
7. **Unit 7**: Working with Strings (Methods, f-strings, slicing)
8. **Unit 8**: File Handling (Reading/writing files, `with` statements)
9. **Unit 9**: Error Handling (Try/except, exceptions)
10. **Unit 10**: Mini-Project (Hands-on capstone)
