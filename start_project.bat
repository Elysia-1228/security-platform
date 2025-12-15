@echo off
cd /d "%~dp0"
chcp 65001 >nul
title 御链天鉴 - 一键启动
color 0B

echo ==============================================================================
echo.
echo   ██╗   ██╗██╗   ██╗██╗     ██╗ █████╗ ███╗   ██╗    ██████╗  ██████╗ ██████╗ █████╗ 
echo   ╚██╗ ██╔╝██║   ██║██║     ██║██╔══██╗████╗  ██║    ╚════██╗██╔═████╗╚════██╗██╔══██╗
echo    ╚████╔╝ ██║   ██║██║     ██║███████║██╔██╗ ██║     █████╔╝██║██╔██║ █████╔╝███████║
echo     ╚██╔╝  ██║   ██║██║     ██║██╔══██║██║╚██╗██║    ██╔═══╝ ████╔╝██║██╔═══╝ ╚════██║
echo      ██║   ╚██████╔╝███████╗██║██║  ██║██║ ╚████║    ███████╗╚██████╔╝███████╗     ██║
echo      ╚═╝    ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝    ╚══════╝ ╚═════╝ ╚══════╝     ╚═╝
echo.
echo                      网络安全智能分析及溯源系统 v1.3.0
echo                           One-Click Deployment
echo.
echo ==============================================================================
echo.

:: ==============================================================================
:: 环境检查
:: ==============================================================================
echo [检查] 正在检查运行环境...
echo.

set JAVA_OK=0
set NPM_OK=0
set PYTHON_OK=0

where java >nul 2>nul
if %errorlevel% equ 0 (
    echo   [√] Java 已安装
    set JAVA_OK=1
) else (
    echo   [×] Java 未找到，后端无法启动
)

where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo   [√] Node.js/npm 已安装
    set NPM_OK=1
) else (
    echo   [×] npm 未找到，前端无法启动
)

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo   [√] Python 已安装
    set PYTHON_OK=1
) else (
    echo   [×] Python 未找到，IDS引擎无法启动
)

echo.
echo ==============================================================================
echo.

:: ==============================================================================
:: 1. 启动主后端 BackCode (Spring Boot - 端口 8081)
:: ==============================================================================
if %JAVA_OK%==1 (
    echo [1/4] 启动主后端服务 BackCode...
    echo       端口: 8081
    echo       路径: BackCode/
    
    :: 检查 mvn 是否在 PATH 中
    where mvn >nul 2>nul
    if %errorlevel% equ 0 (
        start "BackCode - 8081" /D "%~dp0BackCode" cmd /k "title 主后端服务 [8081] && mvn spring-boot:run"
    ) else (
        :: 使用 IntelliJ IDEA 自带的 Maven
        if exist "E:\IntelliJ IDEA 2024.2.4\plugins\maven\lib\maven3\bin\mvn.cmd" (
            start "BackCode - 8081" /D "%~dp0BackCode" cmd /k "title 主后端服务 [8081] && \"E:\IntelliJ IDEA 2024.2.4\plugins\maven\lib\maven3\bin\mvn.cmd\" spring-boot:run"
        ) else (
            echo   [!] 未找到 Maven，请手动启动后端
        )
    )
    timeout /t 3 >nul
) else (
    echo [1/4] 跳过后端 - Java 未安装
)

:: ==============================================================================
:: 2. 启动前端 (Vite - 端口 5173)
:: ==============================================================================
if %NPM_OK%==1 (
    echo [2/4] 启动前端服务...
    echo       端口: 5173
    echo       路径: FrontCode/
    start "Frontend - 5173" /D "%~dp0FrontCode" cmd /k "title 前端服务 [5173] && npm install && npm run dev"
    timeout /t 2 >nul
) else (
    echo [2/4] 跳过前端 - npm 未安装
)

:: ==============================================================================
:: 3. 启动 NIDS 引擎 (Python)
:: ==============================================================================
if %PYTHON_OK%==1 (
    echo [3/4] 启动 NIDS 网络入侵检测引擎...
    echo       路径: PythonIDS/anomaly_based_ids/
    start "NIDS Engine" /D "%~dp0" cmd /k "title NIDS引擎 && python PythonIDS/anomaly_based_ids/realtime_detection_fixed.py"
    timeout /t 1 >nul
) else (
    echo [3/4] 跳过 NIDS - Python 未安装
)

:: ==============================================================================
:: 4. 启动 HIDS 代理 (Python)
:: ==============================================================================
if %PYTHON_OK%==1 (
    echo [4/4] 启动 HIDS 主机监控代理...
    echo       路径: hids_agent.py
    start "HIDS Agent" /D "%~dp0" cmd /k "title HIDS代理 && python hids_agent.py"
) else (
    echo [4/4] 跳过 HIDS - Python 未安装
)

echo.
echo ==============================================================================
echo.
echo   启动完成！请等待各服务初始化...
echo.
echo   服务地址:
echo   ┌─────────────────────────────────────────────────────┐
echo   │  前端界面:   http://localhost:5173                 │
echo   │  后端API:    http://localhost:8081/api             │
echo   │  WebSocket:  ws://localhost:8081/ids/stream        │
echo   └─────────────────────────────────────────────────────┘
echo.
echo   默认账号: admin / admin123
echo.
echo   提示: 
echo   - 请在各终端窗口查看详细日志
echo   - 关闭此窗口不会停止已启动的服务
echo   - 停止服务请关闭对应的终端窗口
echo.
echo ==============================================================================
echo.
pause
