@echo off
echo Starting AseioTech Pyramid Platform Server...

REM Make sure we're in the right directory
cd /d "%~dp0"

REM Kill any existing processes first
call kill-server.bat

REM Wait a moment for processes to fully terminate
timeout /t 2 /nobreak >nul

REM Start the server
echo.
echo Starting server on port 3000...
npm start

pause