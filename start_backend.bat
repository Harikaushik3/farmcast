@echo off
echo Starting Farm Cast Backend Server...
echo.

cd /d "%~dp0backend"

echo Installing dependencies...
pip install fastapi uvicorn pandas scikit-learn numpy joblib python-multipart pydantic python-dotenv

echo.
echo Starting server...
python main.py

pause
