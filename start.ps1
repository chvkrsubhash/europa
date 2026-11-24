Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host " Europa - AkashaVyom Labs Digital Notebook & AI Workspace" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Magenta

# Launch Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Europa Backend (FastAPI)...' -ForegroundColor Cyan; python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Launch Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Europa Frontend (Vite)...' -ForegroundColor Green; cd frontend; npm run dev"

Write-Host "Servers launched! Frontend: http://localhost:5173 | Backend: http://127.0.0.1:8001" -ForegroundColor Yellow

