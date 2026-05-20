@echo off
REM Start the Vite dev server in REVIEW MODE (?tweaks=1).
REM Skips required-field validation, bypasses the F1 phase gate, mounts the
REM jump-to-screen picker at bottom-right. Locked answers stay locked.
REM
REM For normal dev (with validation + gate), use start.bat.

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

echo Starting Vite dev server in review mode at http://localhost:5173/?tweaks=1 ...
call npm run start:review
