@echo off
echo Starting CareerPath AI Backend Server...
cd /d "%~dp0backend"
if not exist ".venv" (
    echo Virtual environment not found. Please run: python -m venv .venv
    pause
    exit /b 1
)
call .venv\Scripts\activate.bat
python app.py
pause
