@echo off
REM MedikaScale Backend - Quick Start Script (Windows)
REM Run this script to start the backend server

echo ========================================
echo   MedikaScale Backend - Quick Start
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

REM Check PostgreSQL (optional, will fail gracefully if not running)
echo.
echo [INFO] Checking PostgreSQL connection...
psql -U postgres -d medikal_scale -c "SELECT 1" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] PostgreSQL connected to medikal_scale
) else (
    echo [WARN] Cannot connect to PostgreSQL
    echo        Make sure PostgreSQL is running and database exists
    echo        Run: psql -U postgres -c "CREATE DATABASE medikal_scale;"
)

echo.
echo ========================================
echo   Starting Setup Process...
echo ========================================
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo [STEP 1/4] Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [SKIP] Dependencies already installed
)

REM Build TypeScript
echo [STEP 2/4] Building TypeScript...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

REM Run migrations
echo [STEP 3/4] Running database migrations...
call npm run db:migrate
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Migrations may have failed (database might not exist)
    echo        This is OK if tables already exist
)

REM Seed data
echo [STEP 4/4] Seeding demo data...
call npm run db:seed
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Seeding may have failed (data might already exist)
    echo        This is OK if demo data already inserted
)

echo.
echo ========================================
echo   Starting Server...
echo ========================================
echo.

REM Start server
call npm run dev

pause
