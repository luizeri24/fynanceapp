#!/bin/bash

echo "🔍 FynanceApp - Diagnóstico Completo"
echo "======================================"
echo ""

# 1. Metro Bundler
echo "📦 Metro Bundler:"
METRO_STATUS=$(curl -s http://localhost:8081/status 2>/dev/null || echo "OFFLINE")
if [[ "$METRO_STATUS" == *"running"* ]]; then
    echo "✅ Metro está rodando na porta 8081"
else
    echo "❌ Metro NÃO está rodando"
fi
echo ""

# 2. Emulador/Dispositivo
echo "📱 Dispositivo:"
DEVICE_COUNT=$(adb devices | grep -v "List" | grep "device$" | wc -l | tr -d ' ')
if [ "$DEVICE_COUNT" -gt "0" ]; then
    echo "✅ Dispositivo conectado:"
    adb devices | grep "device$"
else
    echo "❌ Nenhum dispositivo conectado"
fi
echo ""

# 3. App instalado
echo "📲 App instalado:"
APP_INSTALLED=$(adb shell pm list packages 2>/dev/null | grep fynance)
if [[ -n "$APP_INSTALLED" ]]; then
    echo "✅ $APP_INSTALLED"
else
    echo "❌ App não instalado"
fi
echo ""

# 4. Redirecionamento de porta
echo "🔗 Redirecionamento de porta:"
adb reverse tcp:8081 tcp:8081 2>/dev/null && echo "✅ Porta 8081 redirecionada" || echo "❌ Falha no redirecionamento"
echo ""

# 5. Logs recentes do app
echo "📋 Últimos logs do React Native:"
adb logcat -d -s ReactNativeJS:I 2>/dev/null | tail -5 || echo "Nenhum log disponível"
echo ""

# 6. Status do app
echo "🎯 Status do app:"
if adb shell pidof com.fynanceapp > /dev/null 2>&1; then
    echo "✅ App está em execução"
else
    echo "❌ App não está rodando"
fi
echo ""

# Resumo
echo "=================================="
echo "📊 RESUMO:"
if [[ "$METRO_STATUS" == *"running"* ]] && [ "$DEVICE_COUNT" -gt "0" ] && [[ -n "$APP_INSTALLED" ]]; then
    echo "✅ Tudo configurado corretamente!"
    echo ""
    echo "💡 Se o app não abrir:"
    echo "   1. Abra o app manualmente no emulador"
    echo "   2. Ou execute: adb shell am start -n com.fynanceapp/.MainActivity"
else
    echo "⚠️  Há problemas na configuração. Verifique acima."
fi
echo ""

