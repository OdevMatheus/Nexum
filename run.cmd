@echo off
title Nexum - Plataforma de Gestao
echo ==========================================================
echo   NEXUM - INICIANDO APLICACAO COMPLETA
echo ==========================================================
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
:wait_postgres
docker exec nexum-db pg_isready -U nexum_user -d nexum_db >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 1 >nul
    goto wait_postgres
)
echo Banco de dados pronto para conexoes!
echo.

echo [2/3] Iniciando API Backend (Spring Boot)...
start "Nexum API Backend" powershell -NoProfile -NoExit -Command "cd backend; .\mvnw spring-boot:run"
echo.

echo [3/3] Iniciando SPA Frontend (Vite + React)...
start "Nexum SPA Frontend" powershell -NoProfile -NoExit -Command "cd frontend; npm run dev"
echo.

echo ==========================================================
echo   APLICACAO INICIADA COM SUCESSO!
echo ==========================================================
echo.
echo   - Frontend UI: http://localhost:5173
echo   - Backend API: http://localhost:8080
echo   - Swagger UI:  http://localhost:8080/swagger-ui/index.html
echo.
echo   Credenciais de Teste do Carlos (Academia):
echo   - E-mail: teste@teste
echo   - Senha:  teste123
echo.
echo ==========================================================
pause
