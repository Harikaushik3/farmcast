@echo off
echo ========================================
echo    FarmCast Application Startup
echo ========================================
echo.

echo Starting FarmCast Backend on port 8001...
echo.
cd /d "%~dp0\backend"
start "FarmCast Backend" cmd /k "python main.py"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting FarmCast Frontend on port 5173...
echo.
cd /d "%~dp0"
start "FarmCast Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    FarmCast is starting up!
echo ========================================
echo.
echo Backend API: http://localhost:8001
echo Frontend UI: http://localhost:5173
echo.
echo Press any key to exit this window...
pause >nul
