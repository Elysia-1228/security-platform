# Zhilian2025 - Stop All Services

Write-Host "Stopping all services..." -ForegroundColor Yellow

# Stop Frontend (Node.js)
Write-Host "[1/3] Stopping Frontend..." -ForegroundColor Blue
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "  Frontend stopped" -ForegroundColor Green
} else {
    Write-Host "  No frontend process found" -ForegroundColor Gray
}

# Stop Backend (Java)
Write-Host "[2/3] Stopping Backend..." -ForegroundColor Magenta
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    $javaProcesses | Stop-Process -Force
    Write-Host "  Backend stopped" -ForegroundColor Green
} else {
    Write-Host "  No backend process found" -ForegroundColor Gray
}

# Stop IDS (Python)
Write-Host "[3/3] Stopping IDS..." -ForegroundColor Cyan
$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    $pythonProcesses | Stop-Process -Force
    Write-Host "  IDS stopped" -ForegroundColor Green
} else {
    Write-Host "  No IDS process found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "All services stopped!" -ForegroundColor Green
Write-Host ""
