# Publicar

Ids y enlaces reales en `.env` (no se sube). La web es pública: el enlace /exec va en `CONFIG.api` de `site/index.html`; el número de WhatsApp y todo el contenido se editan en la hoja ([editar-contenido.md](editar-contenido.md)).

## Primera vez (la dueña, un paso a la vez)
1. **Script y hoja** (sesión de clasp de la cuenta de Google de Lindi, `TIENDA_CUENTA` en `.env`), en PowerShell desde `lindi-web\gas`:
   ```
   clasp.cmd create --type sheets --title "Lindi Tienda" --rootDir .
   clasp.cmd push --force
   ```
   Crea la hoja "Lindi Tienda" en el Drive de Lindi con el script ligado. Si `create` reemplazó `appsscript.json`, restaurarlo antes del `push`: `npm test` falla si faltan los permisos limitados. Guardar el id del script en `.env` (`TIENDA_SCRIPT_ID`).
2. Abrir la hoja → recargar → menú **Lindi Tienda → Preparar hoja** → aceptar permisos (deben decir "solo esta hoja").
3. Implementar la web app: en el editor de Apps Script, **Implementar → Nueva implementación → Aplicación web**, ejecutar como "Yo", acceso "Cualquier usuario". Copiar el enlace `/exec` a `.env` (`TIENDA_EXEC_URL`, `TIENDA_DEPLOYMENT_ID`) y a `CONFIG.api`.
4. En la pestaña Ajustes: `whatsapp` (51 + 9 dígitos) y `fondo`.
5. **GitHub**: crear el repositorio público `lindi-web`, subir esta carpeta (`git init`, commit, push a `main`). En el repositorio: Settings → Pages → Source: **GitHub Actions**. La web queda en `https://<usuario>.github.io/lindi-web/`.
6. Llenar Catálogo, Portada y Ajustes, subir fotos al Drive (compartir: cualquiera con el enlace), marcar `publicado`.

## Estado (2-nov-2026)
- Hoja y script creados con `test/tools/crear-tienda.ps1` (se corre con `powershell -ExecutionPolicy Bypass -File`, porque Windows bloquea scripts). Implementación @1.
- GitHub: cuenta `lindiland`, repositorio público `lindiland/lindiland.github.io`, Pages con GitHub Actions. Web en **https://lindiland.github.io**.
- Git y GitHub CLI instalados con winget (`C:\Program Files\Git`, `C:\Program Files\GitHub CLI`). Sesión de `gh` con permiso `workflow` (`test/tools/login-github.cmd`, `test/tools/permiso-workflow.cmd`).

## Cambios después
- **Web**: `npm test` → commit y push a `main`; GitHub Actions la publica sola en 1–2 min.
- **Script**: `npm test` → desde `gas\`: `clasp.cmd push --force` y `clasp.cmd update-deployment <TIENDA_DEPLOYMENT_ID> -d "v0.N - tipo: resumen sin tildes"`. Nunca una implementación nueva.
- **Contenido** (Catálogo, Portada, Ajustes): se edita en la hoja; la web lo muestra al instante (onEdit borra la caché). Si una versión nueva agrega ajustes, correr **Lindi Tienda → Preparar hoja** (no pisa lo escrito).
- Actualizar [changelog.md](changelog.md) y [roadmap.md](roadmap.md).

## Problemas conocidos
- La web dice "No pudimos cargar el catálogo": revisar que la implementación tenga acceso "Cualquier usuario" y que `CONFIG.api` termine en `/exec`.
- Foto que no aparece: el archivo de Drive no está compartido como "cualquiera con el enlace". La web pone las rayitas en su lugar.
