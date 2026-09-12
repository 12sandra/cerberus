@echo off
title CyberSaarthi - Unified System Launcher
echo ==========================================================
echo  CyberSaarthi: Launching Module 1 (Backend) & Module 2 (UI)
echo ==========================================================

echo [1/2] Ensuring database has synthetic intelligence data...
call npm run seed

echo [2/2] Starting FastAPI Backend (Port 8000) & Vite Frontend (Port 5173)...
call npm run dev:all
pause
