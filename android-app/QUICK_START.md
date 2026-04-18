# 🚀 Inicio Rápido - MultiCajas Android

## Pasos para generar tu APK

### 1️⃣ Instalar dependencias (solo la primera vez)
```bash
cd android-app
npm install
```

### 2️⃣ Sincronizar con Capacitor
```bash
npx cap sync
```

### 3️⃣ Abrir en Android Studio
```bash
npx cap open android
```

### 4️⃣ Generar APK
En Android Studio:
- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**

¡Listo! Tu APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 Instalar en tu dispositivo

### Opción A: USB Debugging
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Opción B: Transferir manualmente
1. Copia el APK a tu teléfono
2. Abre el archivo desde un administrador de archivos
3. Permite instalación de fuentes desconocidas si es necesario

---

## 🛠️ Script automático

Usa el script incluido para build rápido:
```bash
./build.sh debug    # Para testing
./build.sh release  # Para producción (requiere keystore)
```

---

## ❓ Problemas comunes

| Problema | Solución |
|----------|----------|
| "SDK not found" | Configurar `ANDROID_HOME` |
| "Gradle sync failed" | File → Invalidate Caches → Restart |
| App no actualiza | `npx cap sync --force` |

---

## 📚 Más información

Ver [README.md](README.md) para documentación completa.
