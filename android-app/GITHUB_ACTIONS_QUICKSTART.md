# 🚀 Quick Start - GitHub Actions para MultiCajas Android

## Configuración Rápida en 5 Minutos

### Paso 1: Verificar Archivos Existentes ✅

Ya tienes todo lo necesario en `android-app/`:
- `.github/workflows/build-android.yml` - Workflow configurado
- `scripts/generate-keystore.sh` - Script para keystore
- `GITHUB_ACTIONS_GUIDE.md` - Guía completa

### Paso 2: Generar Keystore (Solo para APK Firmado)

```bash
cd android-app
chmod +x scripts/generate-keystore.sh
./scripts/generate-keystore.sh
```

El script te pedirá:
- Contraseña del almacén (mínimo 6 caracteres)
- Información de tu organización
- Generará automáticamente los archivos necesarios

### Paso 3: Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega estos 4 secrets:

| Secret | Valor |
|--------|-------|
| `ANDROID_KEYSTORE_BASE64` | Contenido de `release-key.base64` |
| `ANDROID_KEYSTORE_PASSWORD` | Tu contraseña del almacén |
| `ANDROID_KEY_ALIAS` | `multicajas-key` (por defecto) |
| `ANDROID_KEY_PASSWORD` | Tu contraseña de la clave |

**Obtener el base64:**
```bash
cat release-key.base64
# Copia TODO el output (una línea larga)
```

### Paso 4: Hacer Push a GitHub

```bash
cd /workspace
git add android-app/
git commit -m "feat: agregar configuración GitHub Actions para Android"
git push origin main
```

### Paso 5: Ver el Build en Acción

1. Ve a **Actions** en tu repositorio GitHub
2. Verás el workflow **Build Android APK** ejecutándose
3. Espera ~5-10 minutos
4. Descarga el APK desde **Artifacts**

---

## Usos del Workflow

### Build Automático
Se ejecuta cuando:
- Haces push a `main` o `master`
- Creas un pull request
- Solo si hay cambios en `android-app/`

### Build Manual
1. Ve a **Actions** → **Build Android APK**
2. Click en **Run workflow**
3. (Opcional) Ingresa versión personalizada
4. Click **Run workflow**

### Release Automático (con tags)
```bash
git tag v1.0.0
git push origin v1.0.0
```

Esto creará:
- Un GitHub Release con el nombre del tag
- APKs adjuntos como assets descargables

---

## Outputs del Workflow

### Artifacts (disponibles 30 días):
- `MultiCajas-v1.0.0-debug-YYYYMMDD_HHMMSS-abc1234.apk`
- `MultiCajas-v1.0.0-release-YYYYMMDD_HHMMSS-abc1234.apk` (si hay keystore)

### GitHub Release (solo en tags):
- Release automático con APKs adjuntos
- Descripción con información del build

---

## Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Workflow no aparece | Habilita Actions en Settings |
| Build falla | Revisa logs en el workflow |
| No hay release APK | Verifica que los secrets estén correctos |
| Error de keystore | Asegúrate de copiar TODO el base64 sin saltos |

---

## ¡Listo! 🎉

Tu aplicación se compilará automáticamente en GitHub cada vez que hagas push.

**Para más detalles:** [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md)
