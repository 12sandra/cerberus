Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CyberSaarthi: Launching Module 1 (Backend) & Module 2 (UI)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "[1/2] Ensuring database has synthetic intelligence data..." -ForegroundColor Yellow
npm run seed

Write-Host "[2/2] Starting FastAPI Backend (Port 8000) & Vite Frontend (Port 5173)..." -ForegroundColor Yellow
npm run dev:all
