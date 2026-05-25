@echo off
cd /d "%~dp0.."
set "PATH=C:\Program Files\nodejs;%PATH%"
set "NODE_ENV=production"

call "%~dp0stop-bot.cmd"

echo Building bot...
call "%ProgramFiles%\nodejs\npm.cmd" run build -w @skin-mne/bot
if errorlevel 1 (
  echo Build failed.
  exit /b 1
)

echo Starting bot (production)...
call "%ProgramFiles%\nodejs\npm.cmd" run start -w @skin-mne/bot
