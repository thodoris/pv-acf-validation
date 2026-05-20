@echo off
REM Build the production bundle and open it in the default browser.
REM Double-click this file from Explorer, or run `view` from any cmd shell.
REM
REM For the dev server with hot-reload, use `start.bat` (or `npm start`).

setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies for the first time...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Building the production bundle...
call npm run view
if errorlevel 1 (
  echo Build or preview failed.
  pause
  exit /b 1
)
