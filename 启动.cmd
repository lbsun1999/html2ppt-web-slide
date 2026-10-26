@echo off
setlocal
cd /d "%~dp0"
if not exist "scripts\start.mjs" goto missing_files
where.exe node >nul 2>nul
if errorlevel 1 goto missing_node
node "scripts\start.mjs" --open %*
set "START_EXIT=%ERRORLEVEL%"
goto finish
:missing_files
echo Please extract the complete ZIP before starting Web Slide.
set "START_EXIT=1"
goto finish
:missing_node
echo Please install Node.js 20.10 or newer, then reopen this window.
echo https://nodejs.org/
set "START_EXIT=1"
:finish
if not defined WEB_SLIDE_NO_PAUSE pause
exit /b %START_EXIT%
