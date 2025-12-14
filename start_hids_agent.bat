@echo off
:: HIDS Agent 启动脚本
:: 将此脚本的快捷方式放入 启动文件夹 可实现开机自启
:: 启动文件夹: Win+R 输入 shell:startup

cd /d "%~dp0"
echo ========================================
echo    HIDS Agent - 后台启动
echo ========================================
echo.
echo 正在启动 HIDS 监控代理...
echo 日志文件: %~dp0hids_agent.log
echo.

:: 使用 pythonw 后台运行（无窗口）
:: 如果没有 pythonw，使用 start /min 最小化运行
where pythonw >nul 2>&1
if %errorlevel%==0 (
    start "" pythonw "%~dp0hids_agent.py"
    echo [OK] Agent 已在后台启动 (pythonw)
) else (
    start /min python "%~dp0hids_agent.py"
    echo [OK] Agent 已在后台启动 (最小化窗口)
)

echo.
echo 提示: 可通过任务管理器查看 python 进程
echo 日志查看: type "%~dp0hids_agent.log"
timeout /t 3 >nul
