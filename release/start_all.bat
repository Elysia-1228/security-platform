@echo off
chcp 65001 >nul
echo ========================================
echo   网络安全智能分析及溯源系统 - 启动脚本
echo ========================================
echo.

REM 启动Redis
echo [1/3] 启动Redis...
cd /d "%~dp0redis"
start "Redis Server" redis-server.exe
timeout /t 2 >nul

REM 启动后端服务
echo [2/3] 启动后端服务...
cd /d "%~dp0backend"
start "BackCode Server" cmd /c "java -jar BackCode-0.0.1-SNAPSHOT.jar"
timeout /t 5 >nul

start "Blockchain Gateway" cmd /c "java -jar backend-0.0.1-SNAPSHOT.jar"
timeout /t 3 >nul

echo [3/3] 后端服务已启动
echo.
echo ========================================
echo 前端访问: 请用浏览器打开 frontend\index.html
echo 或部署到nginx/apache服务器
echo ========================================
echo.
echo 数据库初始化SQL文件位于: sql\net_safe-v2.sql
echo.
pause
