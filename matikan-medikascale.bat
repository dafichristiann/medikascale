@echo off
title Hentikan MedikaScale
echo Menghentikan proses di port 3000 dan 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000.*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173.*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo Server backend dan frontend telah dihentikan.
pause
