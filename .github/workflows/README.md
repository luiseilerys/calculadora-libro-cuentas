# 🚀 GitHub Actions - Build Android APK

## ✅ Workflow Actualizado

El archivo `.github/workflows/build-android.yml` ha sido corregido para solucionar el error de caché de npm.

### 🔧 Configuración del Workflow

El workflow está configurado para generar automáticamente archivos APK cuando se hacen cambios en la carpeta `android-app/`.

### 🔧 Cambios Realizados (Fix Error de Caché):

1. **Cache dependency path**: Cambiado de `package-lock.json` a `package.json`
2. **npm install**: Usando `--legacy-peer-deps` en lugar de `npm ci`
3. **Android SDK**: Especificación explícita de paquetes requeridos
4. **Gradle flags**: Agregados `--no-daemon --stacktrace` para mejor debugging
5. **Release build**: Mejorado con output variable para condicionar upload

### 🎯 Triggers (Disparadores)

El build se ejecutará automáticamente cuando:

1. **Push a main/master**: Solo si hay cambios en `android-app/**` o en el workflow mismo
2. **Pull Request**: A las ramas main/master con cambios en android-app
3. **Ejecución Manual**: Desde la pestaña Actions en GitHub
4. **Release**: Cuando se crea un nuevo release

### 📦 Secrets Requeridos (Opcional para Release Firmado)

Para generar un **APK de Release firmado**, configura los siguientes secrets en tu repositorio:

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `ANDROID_KEYSTORE_BASE64` | Tu keystore en base64 | `$(base64 release.keystore)` |
| `ANDROID_KEYSTORE_PASSWORD` | Contraseña del keystore | `miPassword123` |
| `ANDROID_KEY_ALIAS` | Alias de la llave | `my-alias` |
| `ANDROID_KEY_PASSWORD` | Contraseña de la llave | `miKeyPassword` |

#### Generar Keystore Localmente:

```bash
keytool -genkey -v -keystore release.keystore -alias multicajas \
  -keyalg RSA -keysize 2048 -validity 10000

# Convertir a base64 para GitHub Secrets
base64 release.keystore | pbcopy  # macOS
# o
cat release.keystore | base64     # Linux
```

### 🚀 Cómo Usar

#### Debug APK (Automático):
Cada push a main generará un Debug APK disponible en:
```
Actions → Build Android APK → Artifacts → app-debug.apk
```

#### Release APK (Con secrets):
Si configuras los secrets, también se generará:
```
Actions → Build Android APK → Artifacts → app-release.apk
```

### 📥 Descargar APKs

1. Ve a la pestaña **Actions** en tu repositorio
2. Selecciona el workflow run más reciente
3. En la sección **Artifacts**, haz clic en `app-debug.apk` o `app-release.apk`
4. El archivo se descargará (disponible por 30 días)

### 🏷️ Releases Automáticos

Cuando crees un release en GitHub:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Los APKs se adjuntarán automáticamente al release.

### ⚙️ Personalización

#### Cambiar versión de Android SDK:
Edita `android-actions/setup-android@v3` en el workflow.

#### Cambiar retención de artifacts:
Modifica `retention-days: 30` a tu preferencia.

#### Agregar tests:
Agrega un step antes del build:
```yaml
- name: Run tests
  working-directory: android-app
  run: npm test
```

### 🐛 Solución de Problemas

**Error: "Some specified paths were not resolved"**
- ✅ **SOLUCIONADO**: Ahora usa `package.json` en lugar de `package-lock.json`

**Error: "Keystore no encontrado"**
- Verifica que los secrets estén configurados correctamente
- Asegúrate de que `ANDROID_KEYSTORE_BASE64` no esté vacío

**Build falla en Gradle**
- Revisa los logs del step "Build Debug APK"
- Verifica que `android-app/android/` exista después de `cap sync`
- Los logs incluyen `--stacktrace` para debugging detallado

### 📊 Estado del Build

El badge de estado se puede agregar al README:
```markdown
![Build Status](https://github.com/TU_USUARIO/TU_REPOSITORIO/actions/workflows/build-android.yml/badge.svg)
```

---

**Última actualización**: 2025
**Estado**: ✅ Funcional y probado

**Nota**: El Debug APK no requiere firma especial y es perfecto para testing.
El Release APK requiere configuración de secrets para firma digital.
