@echo off
title Nexum - Plataforma de Gestão
echo ==========================================================
echo   NEXUM - INICIANDO APLICACAO COMPLETA
echo ==========================================================
echo.
echo Selecione o modo de execucao:
echo [1] Modo Desenvolvimento (Servidores independentes - ideal para codar)
echo [2] Modo Unificado (Frontend embutido no Backend - ideal para testes)
echo.
choice /c 12 /n /m "Digite sua escolha (1 ou 2): "

if errorlevel 2 goto mode_unified
if errorlevel 1 goto mode_dev

:mode_dev
echo.
echo [1/3] Iniciando infraestrutura local (PostgreSQL, Redis, Kafka) no Docker...
docker rm -f nexum-kafka nexum-db nexum-cache nexum-api nexum-spa >nul 2>&1
cd docker
docker compose up -d
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao iniciar containers do Docker. Certifique-se de que o Docker Desktop esta aberto!
    pause
    exit /b %errorlevel%
)
cd ..
echo.

echo [1.5/3] Aguardando o banco de dados PostgreSQL estar pronto...
:wait_postgres_dev
docker exec nexum-db pg_isready -U nexum_user -d nexum_db >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 1 >nul
    goto wait_postgres_dev
)
echo Banco de dados pronto para conexoes!
echo.

echo [2/3] Iniciando API Backend (Spring Boot)...
start "Nexum API Backend (Porta 8080)" powershell -NoProfile -NoExit -Command "cd backend; $env:APP_BASE_URL='http://localhost:5173'; .\mvnw spring-boot:run"
echo.

echo [3/3] Iniciando SPA Frontend (Vite + React)...
start "Nexum SPA Frontend (Porta 5173)" powershell -NoProfile -NoExit -Command "cd frontend; npm run dev"
echo.

echo ==========================================================
echo   APLICACAO INICIADA COM SUCESSO EM MODO DESENVOLVIMENTO!
echo ==========================================================
echo.
echo   - Frontend UI: http://localhost:5173
echo   - Backend API: http://localhost:8080
echo   - Swagger UI:  http://localhost:8080/swagger-ui/index.html
echo.
echo   Credenciais de Teste do Carlos (Academia):
echo   - E-mail: teste@teste
echo   - Senha:  teste123
echo ==========================================================
pause
exit /b 0

:mode_unified
echo.
echo [1/4] Iniciando infraestrutura local (PostgreSQL, Redis, Kafka) no Docker...
docker rm -f nexum-kafka nexum-db nexum-cache nexum-api nexum-spa >nul 2>&1
cd docker
docker compose up -d
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao iniciar containers do Docker. Certifique-se de que o Docker Desktop esta aberto!
    pause
    exit /b %errorlevel%
)
cd ..
echo.

echo [1.5/4] Aguardando o banco de dados PostgreSQL estar pronto...
:wait_postgres_unified
docker exec nexum-db pg_isready -U nexum_user -d nexum_db >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 1 >nul
    goto wait_postgres_unified
)
echo Banco de dados pronto!
echo.

echo [2/4] Compilando e gerando arquivos estaticos do React...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao compilar o frontend.
    pause
    exit /b %errorlevel%
)
cd ..
echo.

echo [3/4] Copiando build do frontend para recursos estaticos do backend...
rmdir /s /q backend\src\main\resources\static >nul 2>&1
mkdir backend\src\main\resources\static
xcopy /s /e /y frontend\dist\* backend\src\main\resources\static\ >nul
echo Frontend copiado com sucesso!
echo.

echo [4/4] Iniciando Servidor Unificado (Spring Boot + React embutido)...
echo Isso compilara e iniciara o JAR auto-contido na porta 8080...
start "Nexum Servidor Unificado (Porta 8080)" powershell -NoProfile -NoExit -Command "cd backend; $env:APP_BASE_URL='http://localhost:8080'; .\mvnw spring-boot:run"
echo.

echo ==========================================================
echo   APLICACAO UNIFICADA INICIADA COM SUCESSO!
echo ==========================================================
echo.
echo   Todo o sistema (React + API) esta rodando de forma unificada!
echo.
echo   - Aplicacao Unificada (Frontend + API): http://localhost:8080
echo   - Swagger UI: http://localhost:8080/swagger-ui/index.html
echo.
echo   Credenciais de Teste do Carlos (Academia):
echo   - E-mail: teste@teste
echo   - Senha:  teste123
echo ==========================================================
pause
exit /b 0
