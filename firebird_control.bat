@echo off
title Xandao Control Panel - Bahia Edition
color 0A

:MENU
cls
echo ===============================================
echo        FIREBIRD CONTROL PANEL - BY XANDAO
echo ===============================================
echo.
echo [1] Ver Firebirds em execucao
echo [2] Ver caminho + PID (descobrir versao)
echo [3] Matar Firebird 2.5
echo [4] Matar Firebird 4.0
echo [5] Iniciar Firebird 2.5
echo [6] Iniciar Firebird 4.0
echo [7] Parar Firebird 2.5
echo [8] Parar Firebird 4.0
echo [9] Matar Firebird 5.0
echo [10] Iniciar Firebird 5.0
echo [11] Parar Firebird 5.0
echo [12] Sair
echo.

set /p opcao=Escolha uma opcao: 

if "%opcao%"=="1" goto VER_FIREBIRD
if "%opcao%"=="2" goto CAMINHO_FIREBIRD
if "%opcao%"=="3" goto KILL_FB25
if "%opcao%"=="4" goto KILL_FB40
if "%opcao%"=="5" goto START_FB25
if "%opcao%"=="6" goto START_FB40
if "%opcao%"=="7" goto STOP_FB25
if "%opcao%"=="8" goto STOP_FB40
if "%opcao%"=="9" goto KILL_FB50
if "%opcao%"=="10" goto START_FB50
if "%opcao%"=="11" goto STOP_FB50
if "%opcao%"=="12" exit
goto MENU

:VER_FIREBIRD
tasklist /FI "IMAGENAME eq firebird.exe"
pause
goto MENU

:CAMINHO_FIREBIRD
wmic process where "name='firebird.exe'" get ProcessId,ExecutablePath
pause
goto MENU

:KILL_FB25
for /f "tokens=2 delims=," %%a in ('"wmic process where name='firebird.exe' get ProcessId,ExecutablePath /format:csv | find /i \"Firebird_2_5\""') do taskkill /F /PID %%a
pause
goto MENU

:KILL_FB40
for /f "tokens=2 delims=," %%a in ('"wmic process where name='firebird.exe' get ProcessId,ExecutablePath /format:csv | find /i \"Firebird_4_0\""') do taskkill /F /PID %%a
pause
goto MENU

:KILL_FB50
for /f "tokens=2 delims=," %%a in ('"wmic process where name='firebird.exe' get ProcessId,ExecutablePath /format:csv | find /i \"Firebird_5_0\""') do taskkill /F /PID %%a
pause
goto MENU

:START_FB25
net start FirebirdServerDefaultInstance
pause
goto MENU

:START_FB40
net start FirebirdServer4
pause
goto MENU

:START_FB50
net start FirebirdServerFirebirdServer5
pause
goto MENU

:STOP_FB25
net stop FirebirdServerDefaultInstance
pause
goto MENU

:STOP_FB40
net stop FirebirdServer4
pause
goto MENU

:STOP_FB50
net stop FirebirdServerFirebirdServer5
pause
goto MENU
