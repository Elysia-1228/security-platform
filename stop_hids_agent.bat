@echo off
:: HIDS Agent 停止脚本
echo ========================================
echo    HIDS Agent - 停止服务
echo ========================================
echo.

taskkill /f /im python.exe /fi "WINDOWTITLE eq hids*" >nul 2>&1
taskkill /f /im pythonw.exe >nul 2>&1

:: 查找并终止运行 hids_agent.py 的进程
for /f "tokens=2" %%a in ('wmic process where "commandline like '%%hids_agent%%'" get processid 2^>nul ^| findstr /r "[0-9]"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [OK] HIDS Agent 已停止
pause
