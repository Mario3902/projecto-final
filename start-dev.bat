@echo off
title NZILA - Servidor de Desenvolvimento
color 0A
cls

echo.
echo  ███╗   ██╗███████╗██╗██╗      █████╗
echo  ████╗  ██║╚══███╔╝██║██║     ██╔══██╗
echo  ██╔██╗ ██║  ███╔╝ ██║██║     ███████║
echo  ██║╚██╗██║ ███╔╝  ██║██║     ██╔══██║
echo  ██║ ╚████║███████╗██║███████╗██║  ██║
echo  ╚═╝  ╚═══╝╚══════╝╚═╝╚══════╝╚═╝  ╚═╝
echo.
echo  Iniciando todos os servicos...
echo ================================================
echo.

:: Backend API (porta 4000)
echo  [1/3] Backend API (porta 4000)...
start "NZILA - Backend" cmd /k "title NZILA Backend && cd /d "%~dp0backend" && node server.js"
timeout /t 2 /nobreak >nul

:: Proxy IA (porta 3001)
echo  [2/3] Proxy IA Claude (porta 3001)...
start "NZILA - Proxy IA" cmd /k "title NZILA Proxy IA && cd /d "%~dp03D-ai-school-threejs\proxy-server" && node proxy.js"
timeout /t 2 /nobreak >nul

:: Frontend Vite (porta 8080)
echo  [3/3] Frontend Vite (porta 8080)...
start "NZILA - Frontend" cmd /k "title NZILA Frontend && cd /d "%~dp0" && npm run dev"
timeout /t 4 /nobreak >nul

cls
color 0A
echo.
echo  ================================================
echo   NZILA - TODOS OS SERVICOS ACTIVOS
echo  ================================================
echo.
echo   Backend API  ^>  http://192.168.100.5:4000
echo   Proxy IA     ^>  http://192.168.100.5:3001
echo   Frontend     ^>  http://192.168.100.5:8080
echo.
echo  ================================================
echo   COMO USAR NO ANDROID:
echo.
echo   1. Abre Android Studio
echo   2. Build ^> Rebuild Project
echo   3. Carrega Run (triangulo verde)
echo.
echo   OU no terminal:
echo   npx cap run android
echo  ================================================
echo.
echo  Para parar: fecha as 3 janelas abertas
echo.
pause
