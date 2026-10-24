@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo 请先安装 Node.js 20.10 或更新版本，再重新启动。
 pause
 exit /b 1
)
if not exist node_modules (
 call npm.cmd ci --no-fund --no-audit
 if errorlevel 1 (
  echo 依赖安装失败，请检查网络后重试。
  pause
  exit /b 1
 )
)
node server.mjs --open
pause
