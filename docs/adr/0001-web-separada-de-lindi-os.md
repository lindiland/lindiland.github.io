# 0001 · Web separada de LINDI OS

Estado: Aceptado · Fecha: 1-nov-2026

## Contexto
La dueña no quiere que alguien desde la web pública pueda romper algo o entrar a LINDI OS.

## Decisión
Proyecto aparte: hoja "Lindi Tienda" con su propio Apps Script ligado (`clasp create --type sheets`). El script declara `@OnlyCurrentDoc` y solo los permisos `spreadsheets.currentonly`, `script.container.ui` y `script.scriptapp`: Google no le deja abrir ningún otro archivo. La web solo expone leer el catálogo publicado y anotar una solicitud validada. LINDI OS sigue con acceso "Solo yo".

## Consecuencias
- En el peor caso, alguien llena Solicitudes de basura (frenado por trampa, topes y límite por minuto).
- El catálogo se mantiene a mano en otra hoja: precios duplicados con LINDI OS. Se acepta por seguridad.
- `test/servidor.js` falla si aparece `openById`, `DriveApp`, `UrlFetchApp` u otro permiso.
