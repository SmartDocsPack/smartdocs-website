@echo off
REM One-click generator for SmartDocsRadio.m3u
REM Edit the DOMAIN value if you change your site name
set DOMAIN=https://smartdocspack.netlify.app

powershell -ExecutionPolicy Bypass -File "%~dp0make-m3u.ps1" -Domain %DOMAIN%
echo.
echo Done. Press any key to close...
pause >nul
