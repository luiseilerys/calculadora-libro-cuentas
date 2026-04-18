# 🚀 Configuración de GitHub Actions - MultiCajas Android

## ✅ Archivos Creados

Se ha configurado completamente GitHub Actions para generar APKs automáticamente:

### 📁 Estructura
```
.github/
└── workflows/
    ├── build-android.yml      # Workflow principal
    └── README.md              # Documentación detallada
```

## 🔧 Configuración del Workflow

### Triggers (Disparadores)
El build se ejecutará cuando:
- ✅ Push a `main` o `master` (solo cambios en `android-app/`)
- ✅ Pull requests a main/master
- ✅ Ejecución manual desde GitHub Actions
- ✅ Creación de un nuevo release

### Características Principales

1. **Cache Optimizado**
   - Usa `cache: 'npm'` con `cache-dependency-path` específico
   - Evita el error "Some specified paths were not resolved"
   - Cachea solo `package-lock.json` del directorio android-app

2. **Build Dual**
   - **Debug APK**: Siempre se genera (sin firma requerida)
   - **Release APK**: Solo si hay secrets configurados

3. **Artifacts**
   - Retención de 30 días
   - Nombres simples: `app-debug.apk`, `app-release.apk`
   - Disponibles directamente desde GitHub Actions

4. **Releases Automáticos**
   - Al crear un tag/release, los APKs se adjuntan automáticamente

## 📦 Secrets Opcionales (Para Release Firmado)

Configura en: `Settings → Secrets and variables → Actions`

| Secret | Descripción | Requerido |
|--------|-------------|-----------|
| `RELEASE_KEYSTORE_BASE64` | Keystore en base64 | Opcional |
| `RELEASE_KEYSTORE_PASSWORD` | Password del keystore | Si hay keystore |
| `RELEASE_KEY_ALIAS` | Alias de la llave | Si hay keystore |
| `RELEASE_KEY_PASSWORD` | Password de la llave | Si hay keystore |

### Generar Keystore

```bash
# 1. Crear keystore
keytool -genkey -v -keystore release.keystore \
  -alias multicajas \
  -keyalg RSA -keysize 2048 -validity 10000

# 2. Convertir a base64
base64 release.keystore | pbcopy  # macOS
# o
cat release.keystore | base64 | xclip -selection clipboard  # Linux
```

## 🚀 Cómo Usar

### Build Automático (Debug APK)

1. Haz push a la rama main:
```bash
git add .
git commit -m "feat: actualizar app"
git push origin main
```

2. Ve a GitHub → Actions → "Build Android APK"
3. Descarga el artifact `app-debug.apk`

### Build Manual

1. Ve a GitHub → Actions → "Build Android APK"
2. Click en "Run workflow"
3. Selecciona la rama
4. Click "Run workflow"
5. Espera a que termine y descarga el APK

### Release Automático

```bash
# Crear tag y release
git tag v1.0.0
git push origin v1.0.0

# Luego crea el release en GitHub UI
```

Los APKs se adjuntarán automáticamente al release.

## 📥 Descargar APKs

1. **Desde Actions:**
   - Ve a `Actions` tab
   - Selecciona el workflow run
   - Baja a la sección `Artifacts`
   - Click en `app-debug.apk` o `app-release.apk`

2. **Desde Releases:**
   - Ve a `Releases` tab
   - Selecciona el release
   - Descarga los APKs en `Assets`

## ⚙️ Personalización

### Cambiar Retención de Artifacts
Edita `.github/workflows/build-android.yml`:
```yaml
retention-days: 30  # Cambia a tu preferencia
```

### Agregar Tests
Agrega antes del build:
```yaml
- name: Run tests
  working-directory: android-app
  run: npm test
```

### Cambiar Versiones
- Node.js: `node-version: '20'`
- Java: `java-version: '17'`
- Android SDK: `uses: android-actions/setup-android@v3`

## 🐛 Troubleshooting

### Error: "Some specified paths were not resolved"
✅ **Solucionado**: El workflow usa `cache-dependency-path` específico

### Error: "Keystore no encontrado"
- Verifica que los secrets estén bien configurados
- Asegúrate de que `RELEASE_KEYSTORE_BASE64` no esté vacío
- Prueba decodificar localmente: `echo $BASE64 | base64 -d > test.keystore`

### Build falla en Gradle
- Revisa los logs del step "Build Debug APK"
- Verifica que `cap sync` se ejecutó correctamente
- Checa que existan los archivos en `android-app/android/`

### Timeout del Build
- El build puede tardar 5-10 minutos en la primera ejecución
- Las siguientes son más rápidas gracias al caché

## 📊 Badge de Estado

Agrega a tu README.md:
```markdown
![Build Status](https://github.com/TU_USUARIO/MultiCajas/actions/workflows/build-android.yml/badge.svg)
```

## 🎯 Flujo Recomendado

1. **Desarrollo**: Push frecuente → Debug APK automático
2. **Testing**: Descarga Debug APK y prueba en dispositivo
3. **Release**: 
   - Configura secrets con keystore
   - Crea tag versionado
   - Release APK firmado se genera automáticamente

## 📝 Notas Importantes

- ⚠️ **Debug APK**: No requiere firma, ideal para testing
- ⚠️ **Release APK**: Requiere keystore para Google Play
- ⚠️ **Primera ejecución**: Tarda más (descarga de Android SDK)
- ⚠️ **Límites**: GitHub Actions tiene límites mensuales según tu plan

## 🔗 Recursos

- [Documentación oficial de GitHub Actions](https://docs.github.com/es/actions)
- [Capacitor Android Deployment](https://capacitorjs.com/docs/android/deploying)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)

---

**¡Listo!** Tu aplicación ahora se compila automáticamente en GitHub cada vez que haces push. 🎉
