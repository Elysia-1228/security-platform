# ============================================================================
# Zhilian2025 停止所有服务脚本
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Red
Write-Host "  正在停止所有服务..." -ForegroundColor Yellow
Write-Host "============================================================================" -ForegroundColor Red
Write-Host ""

# 停止前端 (Node.js / npm)
Write-Host "[1/3] 停止前端服务..." -ForegroundColor Blue
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        try {
            $proc | Stop-Process -Force
            Write-Host "  ✓ 已停止 Node.js 进程 (PID: $($proc.Id))" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ 无法停止进程 (PID: $($proc.Id))" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  - 未发现运行中的前端服务" -ForegroundColor Gray
}

# 停止后端 (Java / Maven)
Write-Host ""
Write-Host "[2/3] 停止后端服务..." -ForegroundColor Magenta
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    foreach ($proc in $javaProcesses) {
        try {
            $proc | Stop-Process -Force
            Write-Host "  ✓ 已停止 Java 进程 (PID: $($proc.Id))" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ 无法停止进程 (PID: $($proc.Id))" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  - 未发现运行中的后端服务" -ForegroundColor Gray
}

# 停止 IDS (Python)
Write-Host ""
Write-Host "[3/3] 停止 IDS 服务..." -ForegroundColor Green
$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    foreach ($proc in $pythonProcesses) {
        try {
            $proc | Stop-Process -Force
            Write-Host "  ✓ 已停止 Python 进程 (PID: $($proc.Id))" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ 无法停止进程 (PID: $($proc.Id))" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  - 未发现运行中的 IDS 服务" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Red
Write-Host "  所有服务已停止！" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Red
Write-Host ""
pause
