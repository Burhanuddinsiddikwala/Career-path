@echo off
echo ========================================================
echo Running CareerPath AI Test Suites
echo ========================================================
cd /d "%~dp0backend"
call .venv\Scripts\activate.bat
echo [1/3] Running Unit and API Tests...
python test_backend.py
if errorlevel 1 goto error
echo.
echo [2/3] Running End-to-End User Journey Tests...
python test_e2e_journey.py
if errorlevel 1 goto error
echo.
echo [3/3] Running Career Matching Evaluation Harness...
python evaluate.py
if errorlevel 1 goto error
echo.
echo ========================================================
echo ALL BACKEND AND AI TESTS PASSED SUCCESSFULLY!
echo ========================================================
pause
exit /b 0

:error
echo.
echo [ERROR] Tests failed! Check the output above.
pause
exit /b 1
