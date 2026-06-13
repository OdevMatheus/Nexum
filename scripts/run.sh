#!/bin/bash
# Nexum - Shell Script Wrapper para execução cross-platform

echo "=========================================================="
echo "          NEXUM - LOCAL ENVIRONMENT BOOTSTRAP             "
echo "=========================================================="
echo "Selecione o modo de execucao:"
echo "[1] Modo Desenvolvimento (Hot-Reloading: Frontend + Backend)"
echo "[2] Modo Unificado (Producao-Like: JAR Unificado)"
echo "=========================================================="
read -p "Digite 1 ou 2: " choice

cd docker
docker compose up -d
cd ..

if [ "$choice" == "1" ]; then
    echo ""
    echo "[MODO DEV] Iniciando servidores independentes..."
    echo ""
    echo ">> Iniciando Backend Spring Boot em background..."
    cd backend
    ./mvnw clean compile spring-boot:run &
    BACKEND_PID=$!
    cd ..
    
    echo ">> Iniciando Frontend React/Vite..."
    cd frontend
    npm run dev
    
    # Ao sair do processo do node (Ctrl+C), tentar matar o backend
    kill $BACKEND_PID
elif [ "$choice" == "2" ]; then
    echo ""
    echo "[MODO UNIFICADO] Empacotando Frontend e injetando no Spring Boot..."
    echo ""
    echo "[1/4] Limpando pacotes antigos..."
    cd backend
    ./mvnw clean
    cd ..
    
    echo "[2/4] Compilando e gerando arquivos estaticos do React..."
    cd frontend
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERRO] Falha ao compilar o frontend."
        exit 1
    fi
    cd ..
    
    echo "[3/4] Copiando arquivos gerados para o Backend..."
    mkdir -p backend/src/main/resources/static
    rm -rf backend/src/main/resources/static/*
    cp -R frontend/dist/* backend/src/main/resources/static/
    
    echo "[4/4] Subindo o Servidor Unificado..."
    cd backend
    ./mvnw clean compile spring-boot:run
else
    echo "Opcao invalida. Saindo."
    exit 1
fi