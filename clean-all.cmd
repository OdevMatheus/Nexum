@echo off
title Nexum - Reset Completo do Ambiente
echo ==========================================================
echo   NEXUM - LIMPANDO TODO O AMBIENTE E INFRAESTRUTURA
echo ==========================================================
echo.
echo [ATENCAO] Este script apagara permanentemente:
echo - Todos os containers do Docker relacionados ao Nexum
echo - Todos os volumes de dados persistidos (Banco de Dados, Cache e Kafka)
echo - As pastas de compilacao locais (target/ e dist/)
echo.
choice /m "Deseja continuar com a limpeza total?"
if %errorlevel% neq 1 (
    echo Operacao cancelada pelo usuario.
    pause
    exit /b 0
)

echo.
echo [1/4] Parando e removendo containers e volumes do Docker Compose...
cd docker
docker compose down -v --remove-orphans >nul 2>&1
cd ..
echo OK!
echo.

echo [2/4] Removendo containers independentes remanescentes...
docker rm -f nexum-app nexum-api nexum-spa nexum-db nexum-cache nexum-kafka >nul 2>&1
echo OK!
echo.

echo [3/4] Removendo volumes ocultos do Docker...
docker volume rm docker_nexum-pg-data docker_nexum-redis-data docker_nexum-kafka-data >nul 2>&1
echo OK!
echo.

echo [4/4] Limpando pastas de compilacao locais (target e dist)...
if exist backend\target (
    echo Removendo pasta backend/target...
    rmdir /s /q backend\target >nul 2>&1
)
if exist frontend\dist (
    echo Removendo pasta frontend/dist...
    rmdir /s /q frontend\dist >nul 2>&1
)
if exist backend\src\main\resources\static (
    echo Removendo recursos estaticos embutidos...
    rmdir /s /q backend\src\main\resources\static >nul 2>&1
)
echo OK!
echo.

echo ==========================================================
echo   AMBIENTE RESETADO E LIMPADO COM SUCESSO!
echo ==========================================================
echo   Seu projeto esta pronto para ser iniciado do absoluto zero.
echo ==========================================================
pause
