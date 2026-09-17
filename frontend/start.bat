@echo off
REM MedikaScale Frontend - Quick Start Script (Windows)
REM Run this script to start the frontend development server

echo ========================================
echo   MedikaScale Frontend - Quick Start
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js installed:
node --version

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)
echo [OK] npm installed:
npm --version

echo.
echo [INFO] Checking environment...
if not exist ".env" (
    echo [INFO] Creating .env file...
    echo VITE_API_URL=http://localhost:3000/api > .env
    echo VITE_SOCKET_URL=http://localhost:3000 >> .env
) else (
    echo [OK] .env file exists
)

echo.
echo [INFO] Installing dependencies if needed...
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [SKIP] Dependencies already installed
)

echo.
echo ========================================
echo   Starting Frontend Dev Server...
echo ========================================
echo.
echo [INFO] Server will start at: http://localhost:5173
echo [INFO] Make sure backend is running at: http://localhost:3000
echo.
echo [INFO] Demo credentials:
echo        Username: dokter
echo        Password: dokter123
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
