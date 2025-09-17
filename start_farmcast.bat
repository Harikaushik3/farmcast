@echo off
echo ========================================
echo    FarmCast Application Startup
echo ========================================
echo.

echo Starting FarmCast Backend on port 8000...
echo.
cd /d "%~dp0\backend"
start "FarmCast Backend" cmd /k "uvicorn main:app --host 127.0.0.1 --port 8000"

echo Waiting for backend health at http://127.0.0.1:8000/health ...
setlocal enabledelayedexpansion
set COUNTER=0
:waitloop
powershell -NoLogo -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %ERRORLEVEL% NEQ 0 (
  set /a COUNTER+=1
  if !COUNTER! GEQ 20 (
    echo Backend not healthy after 20 seconds. Continuing anyway...
    goto start_frontend
  )
  timeout /t 1 >nul
  goto waitloop
)

:start_frontend

echo Starting FarmCast Frontend on port 5173...
echo.
cd /d "%~dp0"
start "FarmCast Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    FarmCast is starting up!
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo Frontend UI: http://localhost:5173
echo.
echo Press any key to exit this window...
pause >nul
