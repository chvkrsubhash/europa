@echo off
echo ==========================================================
echo  Europa - AkashaVyom Labs Digital Notebook ^& AI Workspace
echo ==========================================================

start "Europa Backend API" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload"
timeout /t 2 /nobreak >nul
start "Europa Frontend Vite" cmd /k "cd frontend && npm run dev"

echo Europa servers started!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8001/docs

