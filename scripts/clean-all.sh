#!/bin/bash
# Nexum - Reset Completo do Ambiente para Mac/Linux

echo "=========================================================="
echo "  NEXUM - LIMPANDO TODO O AMBIENTE E INFRAESTRUTURA"
echo "=========================================================="
echo "Esse script vai remover TODAS as imagens, containers e "
echo "volumes relacionados ao projeto no Docker."
echo "E ira apagar as pastas 'target', 'node_modules' e 'dist'."
read -p "Tem certeza que deseja continuar? (y/n) " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Cancelado."
    exit 0
fi

echo "[1/4] Removendo Containers e Volumes do Docker..."
cd docker
docker compose down -v --remove-orphans --rmi all
docker compose --profile full down -v --remove-orphans --rmi all
cd ..

echo "[2/4] Removendo pacotes Maven e artefatos compilados do Java..."
cd backend
./mvnw clean
cd ..

echo "[3/4] Removendo dependencias do Node (node_modules)..."
cd frontend
rm -rf node_modules
rm -rf package-lock.json
cd ..

echo "[4/4] Removendo diretorio dist do frontend..."
cd frontend
rm -rf dist
cd ..

echo "=========================================================="
echo "       AMBIENTE RESETADO E LIMPADO COM SUCESSO!"
echo "=========================================================="
echo "  Seu projeto esta pronto para ser iniciado do zero."
echo "=========================================================="