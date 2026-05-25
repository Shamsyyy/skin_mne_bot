@echo off
cd /d "%~dp0.."
set "PATH=C:\Program Files\nodejs;%PATH%"
call "%~dp0stop-bot.cmd"
echo.
echo Checking Telegram API...
curl -s -m 8 https://api.telegram.org >nul 2>&1
if errorlevel 1 (
  echo WARNING: api.telegram.org may be blocked. Use VPN or TELEGRAM_PROXY in .env
)
echo.
echo Starting bot - wait for: Bot is running @...
call "%ProgramFiles%\nodejs\npm.cmd" run dev:bot
