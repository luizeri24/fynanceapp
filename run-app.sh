#!/bin/bash

# Script para rodar o FynanceApp corretamente
echo "🚀 Iniciando FynanceApp..."

# Navegar para o diretório correto
cd "$(dirname "$0")/FynanceApp"

echo "📁 Diretório atual: $(pwd)"

# Parar processos conflitantes
echo "🛑 Parando processos Metro conflitantes..."
pkill -f metro 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Aguardar um pouco
sleep 2

echo "🔄 Iniciando Metro bundler..."
npx react-native start --reset-cache &

# Aguardar o Metro iniciar
sleep 5

echo "📱 Executando app no Android..."
npx react-native run-android

echo "✅ App iniciado! Pressione Ctrl+C para parar."




