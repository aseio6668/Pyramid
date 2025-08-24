@echo off
echo Killing MasterCredits/AseioTech Pyramid server...

REM Kill all Node.js processes
taskkill /F /IM node.exe 2>nul

REM Kill any Java processes that might be spawned by the server
taskkill /F /IM java.exe 2>nul

REM Kill any processes using port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)

REM Kill any processes using port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    taskkill /F /PID %%a 2>nul
)

echo Server processes terminated.
echo You can now restart with: npm start
pause