@echo off
title iPod Classic Virtual (Servidor Local + YouTube)
cd /d "%~dp0"
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo Iniciando iPod Classic Virtual em http://localhost:3456 para suporte total ao YouTube...
  node server.js --open
) else (
  start "" "%~dp0index.html"
)
