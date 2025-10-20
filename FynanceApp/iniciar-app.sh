#!/bin/bash

echo "🚀 FynanceApp - Iniciando..."
echo "================================"

# Matar processos anteriores
echo "🧹 Limpando processos anteriores..."
lsof -ti:8081 | xargs kill -9 2>/dev/null
pkill -f metro 2>/dev/null
sleep 2

# Verificar emulador
echo ""
echo "📱 Verificando emulador..."
DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)

if [ "$DEVICES" -eq "0" ]; then
    echo ""
    echo "❌ NENHUM EMULADOR CONECTADO!"
    echo ""
    echo "Por favor, faça o seguinte:"
    echo "1. Abra o Android Studio"
    echo "2. Vá em Tools → Device Manager"
    echo "3. Clique no botão ▶️ Play em um emulador"
    echo "4. Aguarde o emulador iniciar completamente"
    echo "5. Execute este script novamente"
    echo ""
    exit 1
fi

echo "✅ Emulador conectado!"
adb devices

# Iniciar Metro Bundler
echo ""
echo "📦 Iniciando Metro Bundler..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5

# Configurar redirecionamento de porta
echo ""
echo "🔗 Configurando redirecionamento de porta..."
adb reverse tcp:8081 tcp:8081

# Instalar e rodar app
echo ""
echo "📱 Instalando app no emulador..."
npx react-native run-android

echo ""
echo "✅ App iniciado!"
echo "Metro Bundler rodando (PID: $METRO_PID)"
echo ""
echo "💡 Para recarregar o app:"
echo "   - Pressione R + R duas vezes no emulador"
echo "   - Ou pressione Cmd + M e escolha 'Reload'"
echo ""

