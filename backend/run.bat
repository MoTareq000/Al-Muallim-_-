@echo off
title CodeCoach - Voice-Based AI Tutor
echo ===================================================
echo           CodeCoach - Voice AI Tutor
echo ===================================================
echo.

if not exist .env (
    echo [!] No .env file found. Creating one from .env.example...
    copy .env.example .env
)

echo [*] Checking Python dependencies...
python -m pip install -r requirements.txt --quiet

echo.
echo [*] Starting CodeCoach Server at http://localhost:8000 ...
echo [*] Press Ctrl+C in this window to stop the server.
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
