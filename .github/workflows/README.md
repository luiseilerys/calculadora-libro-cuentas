# 🤖 GitHub Actions - Build Android APK

## Configuración del Workflow

El archivo `.github/workflows/build-android.yml` está configurado para generar automáticamente archivos APK cuando se hacen cambios en la carpeta `android-app/`.

### 🔧 Triggers (Disparadores)

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
| `RELEASE_KEYSTORE_BASE64` | Tu keystore en base64 | `$(base64 release.keystore)` |
| `RELEASE_KEYSTORE_PASSWORD` | Contraseña del keystore | `miPassword123` |
| `RELEASE_KEY_ALIAS` | Alias de la llave | `my-alias` |
| `RELEASE_KEY_PASSWORD` | Contraseña de la llave | `miKeyPassword` |

#### Generar Keystore Localmente:

```bash
keytool -genkey -v -keystore release.keystore -alias my-alias \
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
- ✅ Solucionado: Se usa `cache-dependency-path` específico para `package-lock.json`

**Error: "Keystore no encontrado"**
- Verifica que los secrets estén configurados correctamente
- Asegúrate de que `RELEASE_KEYSTORE_BASE64` no esté vacío

**Build falla en Gradle**
- Revisa los logs del step "Build Debug APK"
- Verifica que `android-app/android/` exista después de `cap sync`

### 📊 Estado del Build

El badge de estado se puede agregar al README:
```markdown
![Build Status](https://github.com/TU_USUARIO/TU_REPOSITORIO/actions/workflows/build-android.yml/badge.svg)
```

---

**Nota**: El Debug APK no requiere firma especial y es perfecto para testing. 
El Release APK requiere configuración de secrets para firma digital.
