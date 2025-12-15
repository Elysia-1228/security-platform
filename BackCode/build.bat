@echo off
setlocal

REM 检查Maven路径
set MAVEN_PATH=

REM 尝试常见Maven位置
if exist "C:\apache-maven-3.9.6\bin\mvn.cmd" set MAVEN_PATH=C:\apache-maven-3.9.6\bin\mvn.cmd
if exist "C:\Program Files\apache-maven-3.9.6\bin\mvn.cmd" set MAVEN_PATH=C:\Program Files\apache-maven-3.9.6\bin\mvn.cmd
if exist "%USERPROFILE%\apache-maven-3.9.6\bin\mvn.cmd" set MAVEN_PATH=%USERPROFILE%\apache-maven-3.9.6\bin\mvn.cmd

REM 如果找不到Maven，提示下载
if "%MAVEN_PATH%"=="" (
    echo Maven未找到！请先安装Maven:
    echo 1. 下载: https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip
    echo 2. 解压到 C:\apache-maven-3.9.6
    echo 3. 重新运行此脚本
    echo.
    echo 或者在IntelliJ IDEA中右键pom.xml选择"Maven" - "Reload Project"然后使用IDE的Maven工具打包
    pause
    exit /b 1
)

echo 使用Maven: %MAVEN_PATH%
echo 开始打包...

"%MAVEN_PATH%" clean package -DskipTests

if %errorlevel% equ 0 (
    echo.
    echo ===================================
    echo 打包成功！
    echo JAR文件位置: target\BackCode-0.0.1-SNAPSHOT.jar
    echo SQL文件已包含在JAR中: sql\net_safe-v2.sql
    echo ===================================
) else (
    echo 打包失败，请检查错误信息
)

pause
