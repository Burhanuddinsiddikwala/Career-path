@echo off
echo Starting CareerPath AI Frontend Dev Server...
cd /d "%~dp0frontend"
set "PATH=C:\Users\HP\nodejs;%PATH%"
npm run dev
pause
