@echo off
:: Este ficheiro PRECISA ser executado como Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Executa este ficheiro como Administrador!
    echo Clica direito no ficheiro e escolhe "Executar como administrador"
    pause
    exit /b 1
)

echo A abrir portas no Firewall do Windows...

netsh advfirewall firewall delete rule name="GuideGrow Backend 4000" >nul 2>&1
netsh advfirewall firewall delete rule name="GuideGrow Proxy 3001" >nul 2>&1

netsh advfirewall firewall add rule name="GuideGrow Backend 4000" dir=in action=allow protocol=TCP localport=4000
netsh advfirewall firewall add rule name="GuideGrow Proxy 3001" dir=in action=allow protocol=TCP localport=3001

echo.
echo ============================================
echo  PORTAS ABERTAS COM SUCESSO!
echo  Porta 4000 (Backend API)   - OK
echo  Porta 3001 (Proxy IA)      - OK
echo ============================================
echo.
pause
