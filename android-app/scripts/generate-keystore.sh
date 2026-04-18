#!/bin/bash

# 🔐 Script para generar Keystore - MultiCajas Android
# Uso: ./scripts/generate-keystore.sh

set -e

echo "🔐 Generador de Keystore para MultiCajas Android"
echo "================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si keytool está disponible
if ! command -v keytool &> /dev/null; then
    error "keytool no encontrado. Necesitas instalar Java JDK."
    echo ""
    echo "Instala Java JDK:"
    echo "  Ubuntu/Debian: sudo apt install openjdk-17-jdk"
    echo "  macOS: brew install openjdk@17"
    echo "  Windows: Descarga desde https://adoptium.net/"
    exit 1
fi

success "Java JDK detectado: $(java -version 2>&1 | head -n 1)"
echo ""

# Solicitar información al usuario
info "Ingresa la información para tu keystore:"
echo ""

read -p "📝 Contraseña del almacén (mínimo 6 caracteres): " -s STOREPASS
echo ""
if [ ${#STOREPASS} -lt 6 ]; then
    error "La contraseña debe tener al menos 6 caracteres"
    exit 1
fi

read -p "📝 Confirmar contraseña del almacén: " -s STOREPASS_CONFIRM
echo ""
if [ "$STOREPASS" != "$STOREPASS_CONFIRM" ]; then
    error "Las contraseñas no coinciden"
    exit 1
fi

read -p "📝 Contraseña de la clave (puede ser la misma, Enter para usar la misma): " -s KEYPASS
echo ""
if [ -z "$KEYPASS" ]; then
    KEYPASS=$STOREPASS
    info "Usando la misma contraseña para la clave"
fi

read -p "📝 Nombre de la organización (ej: MiEmpresa): " ORG
read -p "📝 Ciudad (ej: Bogotá): " CITY
read -p "📝 Estado/Departamento (ej: Cundinamarca): " STATE
read -p "📝 País (código de 2 letras, ej: CO): " COUNTRY

if [ -z "$ORG" ] || [ -z "$CITY" ] || [ -z "$STATE" ] || [ -z "$COUNTRY" ]; then
    error "Todos los campos son obligatorios"
    exit 1
fi

echo ""
info "Generando keystore..."
echo ""

# Definir variables
KEYSTORE_FILE="release-key.keystore"
ALIAS="multicajas-key"
VALIDITY=10000

# Generar el keystore
keytool -genkey -v \
  -keystore "$KEYSTORE_FILE" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY \
  -storepass "$STOREPASS" \
  -keypass "$KEYPASS" \
  -dname "CN=MultiCajas, OU=Desarrollo, O=$ORG, L=$CITY, ST=$STATE, C=$COUNTRY"

echo ""
success "¡Keystore generado exitosamente!"
echo ""

# Mostrar información del keystore
info "Información del keystore:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Archivo: $KEYSTORE_FILE"
echo "  Alias: $ALIAS"
echo "  Validez: $VALIDITY días (~$((VALIDITY/365)) años)"
echo "  Algoritmo: RSA 2048 bits"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generar huellas digitales
info "Huellas digitales:"
echo ""
SHA1=$(keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" -storepass "$STOREPASS" 2>/dev/null | grep "SHA1:" | awk '{print $2}')
SHA256=$(keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" -storepass "$STOREPASS" 2>/dev/null | grep "SHA256:" | awk '{print $2}')

echo "  SHA-1:   $SHA1"
echo "  SHA-256: $SHA256"
echo ""

# Convertir a base64
info "Convirtiendo a base64 para GitHub Secrets..."
BASE64_FILE="release-key.base64"

if command -v base64 &> /dev/null; then
    base64 "$KEYSTORE_FILE" > "$BASE64_FILE"
    success "Archivo base64 generado: $BASE64_FILE"
else
    warning "base64 no disponible. Usa PowerShell en Windows:"
    echo "  [Convert]::ToBase64String([IO.File]::ReadAllBytes(\"$KEYSTORE_FILE\")) | Out-File release-key.base64"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
success "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Copia el contenido de $BASE64_FILE:"
echo "   cat $BASE64_FILE"
echo ""
echo "2. Ve a GitHub → Settings → Secrets and variables → Actions"
echo ""
echo "3. Agrega estos secrets:"
echo "   ANDROID_KEYSTORE_BASE64  = (contenido de $BASE64_FILE)"
echo "   ANDROID_KEYSTORE_PASSWORD = $STOREPASS"
echo "   ANDROID_KEY_ALIAS        = $ALIAS"
echo "   ANDROID_KEY_PASSWORD     = $KEYPASS"
echo ""
warning "⚠️  IMPORTANTE:"
echo "   - NUNCA subas el archivo .keystore a Git"
echo "   - Haz backup seguro de este archivo y las contraseñas"
echo "   - Si pierdes el keystore, no podrás actualizar tu app"
echo ""
echo "4. Ejecuta el workflow en GitHub Actions para construir el APK"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Guardar instrucciones en un archivo
cat > KEYSTORE_INSTRUCTIONS.txt << EOF
🔐 INFORMACIÓN DEL KEYSTORE - MultiCajas
Generado: $(date)

ARCHIVOS:
  Keystore: $KEYSTORE_FILE
  Base64: $BASE64_FILE
  Alias: $ALIAS

CONTRASEÑAS:
  Almacén: $STOREPASS
  Clave: $KEYPASS

HUÉLLAS DIGITALES:
  SHA-1:   $SHA1
  SHA-256: $SHA256

PARA GITHUB SECRETS:
  ANDROID_KEYSTORE_BASE64  = (contenido de $BASE64_FILE)
  ANDROID_KEYSTORE_PASSWORD = $STOREPASS
  ANDROID_KEY_ALIAS        = $ALIAS
  ANDROID_KEY_PASSWORD     = $KEYPASS

⚠️  GUARDA ESTA INFORMACIÓN EN UN LUGAR SEGURO
⚠️  NUNCA COMPARTAS EL KEYSTORE O LAS CONTRASEÑAS
EOF

success "Instrucciones guardadas en: KEYSTORE_INSTRUCTIONS.txt"
echo ""
