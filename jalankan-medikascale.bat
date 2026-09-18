@echo off
title MedikaScale Starter
echo =======================================================
echo          Menjalankan MedikaScale (Fullstack)
echo =======================================================
echo.

echo [1/2] Menjalankan Backend (NestJS) di port 3000...
start "MedikaScale - Backend (3000)" cmd /k "cd /d "%~dp0backend" && npm run start:prod"

timeout /t 3 /nobreak >nul

echo [2/2] Menjalankan Frontend (React Vite) di port 5173...
start "MedikaScale - Frontend (5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =======================================================
echo  Aplikasi Berhasil Dijalankan!
echo  - Frontend Web: http://localhost:5173
echo  - Backend API : http://localhost:3000/api
echo  - Swagger Docs: http://localhost:3000/docs
echo =======================================================
echo.
pause
