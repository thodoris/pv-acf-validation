@echo off
REM Build the production bundle and preview it in REVIEW MODE (?tweaks=1).
REM Skips required-field validation, bypasses the F1 phase gate, mounts the
REM jump-to-screen picker at bottom-right. Locked answers stay locked.
REM
REM For the production preview without review tools, use view.bat.

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

echo Building and previewing in review mode...
call npm run view:review
if errorlevel 1 (
  echo Build or preview failed.
  pause
  exit /b 1
)
