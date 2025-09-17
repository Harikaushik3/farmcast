@echo off
echo Starting Farm Cast Backend Server...
echo.

cd /d "%~dp0backend"

echo Installing dependencies from requirements.txt...
pip install -r requirements.txt

echo.
echo Starting FastAPI server on http://127.0.0.1:8000 ...
uvicorn main:app --host 127.0.0.1 --port 8000

pause
