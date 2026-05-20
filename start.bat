@echo off
REM Start the Vite dev server with hot-reload and open the browser.
REM Double-click this file from Explorer, or run `start` from any cmd shell.
REM
REM For the production-built bundle, use `view.bat` (or `npm run view`).

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

echo Starting Vite dev server at http://localhost:5173 ...
call npm start
