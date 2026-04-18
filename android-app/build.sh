#!/bin/bash

# Script de construcción rápida para MultiCajas Android
# Uso: ./build.sh [debug|release]

set -e

echo "🚀 Construyendo MultiCajas para Android..."

# Verificar dependencias
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no está instalado"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "❌ Error: Java no está instalado"
    exit 1
fi

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paso 1: Instalar dependencias
echo -e "${BLUE}📦 Instalando dependencias...${NC}"
npm install

# Paso 2: Sincronizar con Capacitor
echo -e "${BLUE}🔄 Sincronizando con Capacitor...${NC}"
npx cap sync

# Paso 3: Determinar tipo de build
BUILD_TYPE="${1:-debug}"

if [ "$BUILD_TYPE" == "release" ]; then
    echo -e "${BLUE}🔐 Generando build de RELEASE...${NC}"
    echo -e "${RED}⚠️  Asegúrate de tener configurado el keystore en android/app/build.gradle${NC}"
    cd android && ./gradlew assembleRelease
    echo -e "${GREEN}✅ APK generado en: android/app/build/outputs/apk/release/app-release.apk${NC}"
else
    echo -e "${BLUE}🔧 Generando build de DEBUG...${NC}"
    cd android && ./gradlew assembleDebug
    echo -e "${GREEN}✅ APK generado en: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
fi

# Paso 4: Información del archivo
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ ¡Build completado exitosamente!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$BUILD_TYPE" == "debug" ]; then
    APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
else
    APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
fi

if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📱 APK: $APK_PATH"
    echo "📊 Tamaño: $APK_SIZE"
    echo ""
    echo "Para instalar en dispositivo conectado:"
    echo "  adb install $APK_PATH"
    echo ""
    echo "O abrir en Android Studio:"
    echo "  npx cap open android"
else
    echo -e "${RED}❌ Error: El APK no se generó${NC}"
    exit 1
fi
