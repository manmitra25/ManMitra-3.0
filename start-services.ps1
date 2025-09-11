# ManMitra 3.0 - Service Startup Script
# This script starts all required services for the ManMitra application

Write-Host "🚀 Starting ManMitra 3.0 Services..." -ForegroundColor Green

# Check if MongoDB is running
Write-Host "📊 Checking MongoDB connection..." -ForegroundColor Yellow
$mongoRunning = $false
try {
    # Try to connect to MongoDB
    $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "✅ MongoDB is already running" -ForegroundColor Green
        $mongoRunning = $true
    }
} catch {
    Write-Host "⚠️ MongoDB not running locally, using MongoDB Atlas" -ForegroundColor Yellow
    $mongoRunning = $true  # Assume Atlas is configured
}

if (-not $mongoRunning) {
    Write-Host "❌ MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
    Write-Host "   You can start MongoDB with: mongod" -ForegroundColor Red
    exit 1
}

# Function to start a service in a new PowerShell window
function Start-ServiceWindow {
    param(
        [string]$ServiceName,
        [string]$WorkingDirectory,
        [string]$Command,
        [string]$WindowTitle
    )
    
    Write-Host "🔄 Starting $ServiceName..." -ForegroundColor Yellow
    
    $scriptBlock = @"
Set-Location '$WorkingDirectory'
`$host.UI.RawUI.WindowTitle = '$WindowTitle'
Write-Host '🚀 Starting $ServiceName...' -ForegroundColor Green
Write-Host 'Working Directory: $WorkingDirectory' -ForegroundColor Cyan
Write-Host 'Command: $Command' -ForegroundColor Cyan
Write-Host '=================================' -ForegroundColor Cyan
$Command
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock
    Start-Sleep -Seconds 2  # Give time for the window to start
}

# Start FastAPI Service (AI Service)
Write-Host "🤖 Starting FastAPI AI Service..." -ForegroundColor Magenta
Start-ServiceWindow -ServiceName "FastAPI AI Service" -WorkingDirectory "S:\ManMitra 3.0\fast_api" -Command "python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0" -WindowTitle "ManMitra - FastAPI AI Service"

# Wait a bit for FastAPI to start
Start-Sleep -Seconds 3

# Start Node.js Backend
Write-Host "🔧 Starting Node.js Backend..." -ForegroundColor Blue
Start-ServiceWindow -ServiceName "Node.js Backend" -WorkingDirectory "S:\ManMitra 3.0\backend" -Command "npm run dev" -WindowTitle "ManMitra - Node.js Backend"

# Wait a bit for backend to start
Start-Sleep -Seconds 5

# Start Frontend (React with Vite)
Write-Host "🌐 Starting React Frontend..." -ForegroundColor Cyan
Start-ServiceWindow -ServiceName "React Frontend" -WorkingDirectory "S:\ManMitra 3.0\frontend" -Command "npm run dev" -WindowTitle "ManMitra - React Frontend"

# Wait for services to initialize
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎉 ManMitra 3.0 Services Started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Service Status:" -ForegroundColor White
Write-Host "   🤖 FastAPI AI Service:  http://localhost:8000" -ForegroundColor Magenta
Write-Host "   🔧 Node.js Backend:      http://localhost:5000" -ForegroundColor Blue
Write-Host "   🌐 React Frontend:       http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 API Documentation:" -ForegroundColor White
Write-Host "   FastAPI Docs:           http://localhost:8000/docs" -ForegroundColor Magenta
Write-Host "   Backend Health:         http://localhost:5000/health" -ForegroundColor Blue
Write-Host ""
Write-Host "🔍 To test the integration:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "   2. Try signing up as a student" -ForegroundColor White
Write-Host "   3. Test the Bestie chat feature" -ForegroundColor White
Write-Host "   4. Take a mood assessment" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: Make sure you have your Gemini API key configured in fast_api/.env" -ForegroundColor Yellow
Write-Host ""

# Keep this window open
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
