# MultiCajas Android - Guía de Construcción

## 📱 Aplicación Android para Gestor de Efectivo Profesional

Este directorio contiene todos los archivos necesarios para generar la aplicación Android de MultiCajas usando **Capacitor**.

---

## 🚀 Requisitos Previos

1. **Node.js** (v16 o superior)
2. **Android Studio** (con Android SDK)
3. **Java JDK** (v11 o superior)

---

## 📦 Instalación

### 1. Instalar dependencias de Node.js

```bash
cd android-app
npm install
```

### 2. Sincronizar con Capacitor

```bash
npx cap sync
```

Esto creará el proyecto Android en `android-app/android/`

---

## 🔨 Construir APK

### Opción A: Desde Android Studio (Recomendado)

1. Abrir Android Studio
2. File → Open → Seleccionar `android-app/android`
3. Esperar que Gradle sincronice
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. El APK se generará en: `android-app/android/app/build/outputs/apk/debug/app-debug.apk`

### Opción B: Desde Línea de Comandos

```bash
# Debug APK
cd android-app/android
./gradlew assembleDebug

# Release APK (requiere configuración de firma)
./gradlew assembleRelease
```

---

## 📲 Instalar en Dispositivo

### Vía ADB (USB Debugging activado)

```bash
adb install android-app/android/app/build/outputs/apk/debug/app-debug.apk
```

### O desde Android Studio
- Click en "Run" (▶️) con dispositivo conectado/emulador

---

## ⚙️ Configuración Personalizada

### Cambiar nombre de la app
Editar `capacitor.config.json`:
```json
{
  "appName": "Tu Nombre Aquí"
}
```

### Cambiar package ID
Editar `capacitor.config.json`:
```json
{
  "appId": "com.tuempresa.app"
}
```

Luego ejecutar:
```bash
npx cap sync
```

### Colores y Splash Screen
Editar `capacitor.config.json` en la sección `plugins`:
```json
"plugins": {
  "SplashScreen": {
    "backgroundColor": "#1e293b",
    "showSpinner": true
  }
}
```

---

## 📁 Estructura del Proyecto

```
android-app/
├── .github/
│   └── workflows/
│       └── build-android.yml       # Workflow de GitHub Actions para build automático
├── www/                    # Web app (copiada desde src/)
│   ├── index.html          # Punto de entrada
│   ├── components/         # Componentes UI
│   ├── core/               # Lógica principal
│   ├── services/           # Servicios
│   ├── styles/             # CSS
│   ├── utils/              # Utilidades
│   └── tests/              # Tests unitarios
├── android/                # Proyecto Android (generado por Capacitor)
├── resources/              # Recursos personalizados
├── scripts/
│   └── generate-keystore.sh  # Script para generar keystore firmado
├── capacitor.config.json   # Configuración de Capacitor
├── package.json            # Dependencias Node.js
├── README.md               # Este archivo
├── QUICK_START.md          # Guía rápida de inicio
└── GITHUB_ACTIONS_GUIDE.md # Guía detallada de CI/CD
```

---

## 🔄 Actualizar la App Web

Si modificas archivos en `src/`:

```bash
# Copiar cambios a www/
cp -r src/* android-app/www/

# Sincronizar con Android
npx cap sync
```

---

## 🤖 GitHub Actions - Build Automático en la Nube

Puedes configurar GitHub Actions para construir automáticamente el APK cada vez que hagas push.

### Configurar Workflow

1. El archivo `.github/workflows/build-android.yml` ya está configurado
2. Ve a **Actions** en tu repositorio de GitHub
3. Habilita los workflows si es necesario

### Disparadores Automáticos

- ✅ Push a `main` o `master` (solo cambios en `android-app/`)
- ✅ Pull requests
- ✅ Manual desde la UI de GitHub Actions

### Secrets Requeridos (para APK firmado)

Configura estos secrets en **Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Tu keystore en base64 |
| `ANDROID_KEYSTORE_PASSWORD` | Contraseña del keystore |
| `ANDROID_KEY_ALIAS` | Alias de la clave |
| `ANDROID_KEY_PASSWORD` | Contraseña de la clave |

### Generar Keystore

Usa el script incluido:

```bash
cd android-app
chmod +x scripts/generate-keystore.sh
./scripts/generate-keystore.sh
```

El script te guiará paso a paso y generará:
- `release-key.keystore` - Archivo de firma
- `release-key.base64` - Para GitHub Secrets
- `KEYSTORE_INSTRUCTIONS.txt` - Instrucciones detalladas

📖 **Ver guía completa:** [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md)

---

## 🛠️ Comandos Útiles

```bash
# Abrir en Android Studio
npx cap open android

# Ver logs del dispositivo
adb logcat | grep -i multicajas

# Limpiar build
cd android && ./gradlew clean

# Forzar rebuild
npx cap sync --force
```

---

## 📊 Generar APK de Producción

### 1. Crear Keystore

```bash
keytool -genkey -v -keystore multicajas.keystore -alias multicajas -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurar `android/app/build.gradle`

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file("../multicajas.keystore")
            storePassword "TU_PASSWORD"
            keyAlias "multicajas"
            keyPassword "TU_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build Release

```bash
./gradlew assembleRelease
```

APK generado en: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🐛 Troubleshooting

### Error: "SDK not found"
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Error: "Gradle build failed"
```bash
cd android
./gradlew clean
./gradlew build
```

### App no actualiza cambios
```bash
npx cap sync --force
```

---

## 📞 Soporte

Para más información sobre Capacitor:
- Documentación oficial: https://capacitorjs.com/docs
- Comunidad Discord: https://discord.gg/UPYYRhtyzp

---

**© 2024 MultiCajas - Gestor de Efectivo Profesional**
