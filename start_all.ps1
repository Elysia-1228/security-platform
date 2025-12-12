# ============================================================================
# Zhilian2025 一键启动脚本 (PowerShell 版本)
# 功能：同时启动前端、后端、IDS 三个服务，每个服务在独立的终端窗口中运行
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "      ZZZZZZ  HH   HH  II  LL      II   AA    NN   NN   2222   0000   2222   55555" -ForegroundColor Green
Write-Host "         ZZ   HH   HH  II  LL      II  AAAA   NNN  NN  2    2 0    0 2    2  5    " -ForegroundColor Green
Write-Host "       ZZ     HHHHHHH  II  LL      II AA  AA  NN N NN      2  0    0     2   5555 " -ForegroundColor Green
Write-Host "      ZZ      HH   HH  II  LL      II AAAAAA  NN  NNN    2    0    0   2        5 " -ForegroundColor Green
Write-Host "      ZZZZZZ  HH   HH  II  LLLLLL  II AA  AA  NN   NN  22222   0000  22222  55555 " -ForegroundColor Green
Write-Host ""
Write-Host "                          Cyber Security Platform 2025" -ForegroundColor Yellow
Write-Host "                             One-Click Deployment" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# 获取项目根目录
$ProjectRoot = $PSScriptRoot

# 检查必要的工具
Write-Host "[检查] 正在检查环境依赖..." -ForegroundColor Yellow

# 检查 Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 未找到 Python，请先安装 Python 3.8+" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "[OK] Python 已安装" -ForegroundColor Green

# 检查 Maven（尝试多种方式）
$MavenCmd = $null

# 1. 检查系统 PATH 中的 Maven
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    $MavenCmd = "mvn"
    Write-Host "[OK] Maven 已安装 (系统 PATH)" -ForegroundColor Green
}
# 2. 尝试查找 IntelliJ IDEA 自带的 Maven
elseif (Test-Path "C:\Program Files\JetBrains\IntelliJ IDEA*\plugins\maven\lib\maven3\bin\mvn.cmd") {
    $IdeaMavenPath = Get-ChildItem "C:\Program Files\JetBrains\IntelliJ IDEA*\plugins\maven\lib\maven3\bin\mvn.cmd" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($IdeaMavenPath) {
        $MavenCmd = $IdeaMavenPath.FullName
        Write-Host "[OK] 找到 IntelliJ IDEA 自带的 Maven" -ForegroundColor Green
    }
}
# 3. 检查用户目录下的 IDEA Maven
elseif (Test-Path "$env:USERPROFILE\.m2") {
    Write-Host "[警告] 未找到 Maven 命令，但检测到 .m2 目录" -ForegroundColor Yellow
}

if (-not $MavenCmd) {
    Write-Host "[警告] 未找到 Maven，后端将尝试启动但可能失败" -ForegroundColor Yellow
    Write-Host "       建议：在 IntelliJ IDEA 中手动启动后端项目" -ForegroundColor Yellow
    $MavenCmd = "mvn"  # 仍然尝试，让用户看到错误信息
}

# 检查 Node.js
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 未找到 Node.js (npm)，请先安装 Node.js LTS" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "[OK] Node.js 已安装" -ForegroundColor Green

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "[启动] 正在启动所有服务..." -ForegroundColor Yellow
Write-Host ""

# 1. 启动前端 (新窗口)
Write-Host "[1/3] 启动前端服务 (Vite + React)..." -ForegroundColor Blue
$FrontPath = Join-Path $ProjectRoot "FrontCode"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& {`
        `$Host.UI.RawUI.WindowTitle = '前端服务 - Zhilian2025';`
        `$Host.UI.RawUI.BackgroundColor = 'DarkBlue';`
        `$Host.UI.RawUI.ForegroundColor = 'White';`
        Clear-Host;`
        Write-Host '========================================' -ForegroundColor Cyan;`
        Write-Host '  前端服务 (Frontend - Vite + React)' -ForegroundColor Green;`
        Write-Host '========================================' -ForegroundColor Cyan;`
        Write-Host '';`
        cd '$FrontPath';`
        Write-Host '[提示] 正在安装依赖...' -ForegroundColor Yellow;`
        npm install;`
        Write-Host '';`
        Write-Host '[提示] 正在启动开发服务器...' -ForegroundColor Yellow;`
        npm run dev;`
    }"
)

Start-Sleep -Seconds 1

# 2. 启动后端 (新窗口)
Write-Host "[2/3] 启动后端服务 (Spring Boot)..." -ForegroundColor Magenta
$BackPath = Join-Path $ProjectRoot "BackCode"

# 查找 Maven 命令
$MavenCommand = "mvn"
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    # 尝试使用 IntelliJ IDEA 自带的 Maven
    $IdeaMavenPath = "e:\IntelliJ IDEA 2024.2.4\plugins\maven\lib\maven3\bin\mvn.cmd"
    if (Test-Path $IdeaMavenPath) {
        $MavenCommand = "`"$IdeaMavenPath`""
        Write-Host "[OK] 使用 IntelliJ IDEA 自带的 Maven" -ForegroundColor Green
    }
}

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& {`
        `$Host.UI.RawUI.WindowTitle = '后端服务 - Zhilian2025';`
        `$Host.UI.RawUI.BackgroundColor = 'DarkMagenta';`
        `$Host.UI.RawUI.ForegroundColor = 'White';`
        Clear-Host;`
        Write-Host '========================================' -ForegroundColor Cyan;`
        Write-Host '  后端服务 (Backend - Spring Boot)' -ForegroundColor Green;`
        Write-Host '========================================' -ForegroundColor Cyan;`
        Write-Host '';`
        cd '$BackPath';`
        Write-Host '[提示] 正在启动 Spring Boot 应用...' -ForegroundColor Yellow;`
        Write-Host '';`
        `$mvnCmd = '$MavenCommand';`
        if (Get-Command mvn -ErrorAction SilentlyContinue) {`
            Write-Host '[OK] 使用系统 Maven' -ForegroundColor Green;`
            mvn spring-boot:run;`
        } elseif (Test-Path 'e:\IntelliJ IDEA 2024.2.4\plugins\maven\lib\maven3\bin\mvn.cmd') {`
            Write-Host '[OK] 使用 IntelliJ IDEA 自带的 Maven' -ForegroundColor Green;`
            & 'e:\IntelliJ IDEA 2024.2.4\plugins\maven\lib\maven3\bin\mvn.cmd' spring-boot:run;`
        } else {`
            Write-Host '[错误] Maven 未找到！' -ForegroundColor Red;`
            Write-Host '';`
            Write-Host '请选择以下方式之一启动后端：' -ForegroundColor Yellow;`
            Write-Host '1. 在 IntelliJ IDEA 中打开 BackCode 项目' -ForegroundColor White;`
            Write-Host '2. 找到主类 BackCodeApplication.java' -ForegroundColor White;`
            Write-Host '3. 点击运行按钮启动' -ForegroundColor White;`
            Write-Host '';`
            Write-Host '或者安装 Maven 到系统 PATH' -ForegroundColor Yellow;`
            pause;`
        }`
    }"
)

Start-Sleep -Seconds 1

# 3. 启动 IDS (新窗口)
Write-Host "[3/3] 启动 IDS 异常检测引擎 (Python)..." -ForegroundColor Green
$IDSPath = Join-Path $ProjectRoot "PythonIDS\anomaly_based_ids"
$IDSScript = Join-Path $IDSPath "realtime_detection_fixed.py"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& {`
        `$Host.UI.RawUI.WindowTitle = 'IDS 异常检测 - Zhilian2025';`
        `$Host.UI.RawUI.BackgroundColor = 'DarkGreen';`
        `$Host.UI.RawUI.ForegroundColor = 'White';`
        Clear-Host;`
        Write-Host '========================================' -ForegroundColor Cyan;`
        Write-Host '  IDS 异常检测引擎 (Anomaly Detection)' -ForegroundColor Green;`
        Write-Host '========================================' -ForegroundColor Cyan;`
        Write-Host '';`
        cd '$ProjectRoot';`
        Write-Host '[提示] 正在启动实时检测引擎...' -ForegroundColor Yellow;`
        Write-Host '[提示] 如需指定网卡，请设置环境变量: `$env:IDS_INTERFACE=''WLAN''' -ForegroundColor Yellow;`
        Write-Host '';`
        python '$IDSScript';`
    }"
)

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[成功] 所有服务已启动！" -ForegroundColor Green
Write-Host ""
Write-Host "服务访问地址：" -ForegroundColor Yellow
Write-Host "  - 前端:   http://localhost:5173" -ForegroundColor Cyan
Write-Host "  - 后端:   http://localhost:8081" -ForegroundColor Cyan
Write-Host "  - IDS:    实时监控中 (查看 IDS 窗口日志)" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示：" -ForegroundColor Yellow
Write-Host "  - 每个服务在独立的窗口中运行" -ForegroundColor White
Write-Host "  - 关闭窗口即可停止对应服务" -ForegroundColor White
Write-Host "  - 如需停止所有服务，请逐个关闭窗口" -ForegroundColor White
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键退出此启动器（不会影响已启动的服务）..." -ForegroundColor Gray
pause
