# 🤖 GitHub Actions para Build Android - MultiCajas

## 📋 Configuración del Workflow

El workflow está configurado en `.github/workflows/build-android.yml` y se ejecutará automáticamente cuando:

### Disparadores Automáticos:
- ✅ Push a las ramas `main` o `master` (solo cambios en `android-app/`)
- ✅ Pull requests a `main` o `master` (solo cambios en `android-app/`)

### Disparador Manual:
- ✅ Desde la pestaña **Actions** → **Build Android APK** → **Run workflow**
  - Puedes especificar una versión personalizada (ej: `1.0.0`)

---

## 🔐 Secrets Requeridos (Opcional para Release Firmado)

Para generar un APK firmado para producción, configura los siguientes secrets en tu repositorio:

### Cómo Configurar los Secrets:

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega cada uno de los siguientes:

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `ANDROID_KEYSTORE_BASE64` | Tu archivo keystore en formato base64 | `base64 release-key.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | Contraseña del keystore | `miPassword123` |
| `ANDROID_KEY_ALIAS` | Alias de la clave dentro del keystore | `multicajas-key` |
| `ANDROID_KEY_PASSWORD` | Contraseña de la clave específica | `miKeyPassword456` |

### Generar Keystore (si no tienes uno):

```bash
keytool -genkey -v -keystore release-key.keystore \
  -alias multicajas-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass miPassword123 \
  -keypass miKeyPassword456 \
  -dname "CN=MultiCajas, OU=Desarrollo, O=MiEmpresa, L=Ciudad, ST=Estado, C=CO"
```

### Convertir Keystore a Base64:

```bash
# Linux/Mac
base64 release-key.keystore > keystore.base64

# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release-key.keystore")) > keystore.base64
```

Luego copia el contenido del archivo `.base64` al secret `ANDROID_KEYSTORE_BASE64`.

---

## 🚀 Cómo Usar

### Build Automático (Push):

```bash
# Hacer cambios en android-app/
git add android-app/
git commit -m "feat: nueva funcionalidad"
git push origin main

# El workflow se ejecutará automáticamente
```

### Build Manual (Desde GitHub UI):

1. Ve a **Actions** en tu repositorio
2. Selecciona **Build Android APK**
3. Click en **Run workflow**
4. (Opcional) Ingresa una versión personalizada
5. Click en **Run workflow**

### Build con Tag (Release Automático):

```bash
# Crear tag de versión
git tag v1.0.0
git push origin v1.0.0

# El workflow creará un GitHub Release con los APKs adjuntos
```

---

## 📦 Outputs del Workflow

### Artifacts (Disponibles por 30 días):

- **Debug APK**: `MultiCajas-v{VERSION}-debug-{DATE}-{COMMIT}.apk`
  - Para testing y desarrollo
  - No requiere secrets
  
- **Release APK**: `MultiCajas-v{VERSION}-release-{DATE}-{COMMIT}.apk`
  - Para distribución en producción
  - Requiere secrets configurados

### GitHub Release (Solo en tags):

Si el push es un tag (`refs/tags/v*`), se creará automáticamente:
- Release en GitHub con nombre del tag
- APKs adjuntos como assets
- Descripción con información del build

---

## 📊 Ver el Progreso del Build

1. Ve a **Actions** en tu repositorio
2. Click en el workflow en ejecución
3. Verás el progreso paso a paso:
   - ✅ Checkout
   - ✅ Setup Node.js
   - ✅ Setup Java
   - ✅ Setup Android SDK
   - ✅ Install dependencies
   - ✅ Create Keystore
   - ✅ Configure Gradle
   - ✅ Build Debug APK
   - ✅ Build Release APK
   - ✅ Upload Artifacts

---

## ⚙️ Personalización

### Cambiar Versión de Android:

Edita `build-android.yml`:
```yaml
env:
  NODE_VERSION: '20.x'
  JAVA_VERSION: '17'
  # Cambiar SDK version
  packages: 'platform-tools platform-tools-common platforms/android-34 build-tools;34.0.0'
```

### Cambiar Retención de Artifacts:

```yaml
- name: Upload Debug APK Artifact
  uses: actions/upload-artifact@v4
  with:
    retention-days: 90  # Cambiar de 30 a 90 días
```

### Agregar Testing:

```yaml
- name: Run Tests
  working-directory: ${{ env.APP_DIR }}
  run: npm test
```

---

## 🛠️ Troubleshooting

### Error: "SDK not found"
- Verifica que `setup-android` esté usando la versión correcta
- Intenta limpiar caché: **Settings** → **Actions** → **Clear cache**

### Error: "Keystore not found"
- Verifica que los secrets estén configurados correctamente
- Asegúrate de que `ANDROID_KEYSTORE_BASE64` no tenga saltos de línea

### Error: "Build failed"
- Revisa los logs del workflow para detalles específicos
- Verifica compatibilidad de versiones (Node, Java, Android SDK)

### APK muy grande
- Considera usar Android App Bundle (.aab) en lugar de APK
- Habilita R8/ProGuard para ofuscación

---

## 📈 Mejoras Futuras Sugeridas

- [ ] Agregar tests automatizados antes del build
- [ ] Integrar con Firebase App Distribution
- [ ] Publicar automáticamente en Google Play Console
- [ ] Generar changelog automático desde commits
- [ ] Notificaciones a Slack/Discord al completar build
- [ ] Build matrix para múltiples versiones de Android

---

## 📞 Soporte

Para issues relacionados con el build:
1. Revisa los logs del workflow en GitHub Actions
2. Verifica que todos los secrets estén configurados
3. Asegúrate de tener la última versión de `android-app/`
4. Abre un issue en el repositorio con:
   - Link al workflow fallido
   - Error específico
   - Pasos para reproducir

---

**🎉 ¡Listo! Tu aplicación se compilará automáticamente en GitHub.**
