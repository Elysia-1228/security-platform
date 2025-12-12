# ============================================================================
# Zhilian2025 快速启动脚本 (前端 + IDS)
# 后端请在 IntelliJ IDEA 中手动启动
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Zhilian2025 - 前端 + IDS 启动器" -ForegroundColor Green
Write-Host "  (后端请在 IntelliJ IDEA 中启动)" -ForegroundColor Yellow
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot

# 1. 启动前端
Write-Host "[1/2] 启动前端服务..." -ForegroundColor Blue
$FrontPath = Join-Path $ProjectRoot "FrontCode"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& {`
        `$Host.UI.RawUI.WindowTitle = '前端服务 - Zhilian2025';`
        `$Host.UI.RawUI.BackgroundColor = 'DarkBlue';`
        Clear-Host;`
        Write-Host '======================================' -ForegroundColor Cyan;`
        Write-Host '  前端服务 (Frontend)' -ForegroundColor Green;`
        Write-Host '======================================' -ForegroundColor Cyan;`
        cd '$FrontPath';`
        npm install;`
        npm run dev;`
    }"
)

Start-Sleep -Seconds 1

# 2. 启动 IDS
Write-Host "[2/2] 启动 IDS 异常检测..." -ForegroundColor Green
$IDSScript = Join-Path $ProjectRoot "PythonIDS\anomaly_based_ids\realtime_detection_fixed.py"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& {`
        `$Host.UI.RawUI.WindowTitle = 'IDS 异常检测 - Zhilian2025';`
        `$Host.UI.RawUI.BackgroundColor = 'DarkGreen';`
        Clear-Host;`
        Write-Host '======================================' -ForegroundColor Cyan;`
        Write-Host '  IDS 异常检测引擎' -ForegroundColor Green;`
        Write-Host '======================================' -ForegroundColor Cyan;`
        cd '$ProjectRoot';`
        python '$IDSScript';`
    }"
)

Write-Host ""
Write-Host "[完成] 前端和 IDS 已启动！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：" -ForegroundColor Yellow
Write-Host "  1. 在 IntelliJ IDEA 中打开 BackCode 项目" -ForegroundColor White
Write-Host "  2. 找到主类并运行（通常是 BackCodeApplication.java）" -ForegroundColor White
Write-Host ""
Write-Host "服务地址：" -ForegroundColor Cyan
Write-Host "  - 前端: http://localhost:5173" -ForegroundColor White
Write-Host "  - 后端: http://localhost:8080 (IDEA 启动后)" -ForegroundColor White
Write-Host ""
pause
