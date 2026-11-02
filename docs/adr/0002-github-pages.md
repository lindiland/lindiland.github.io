# 0002 · Página en GitHub Pages

Estado: Aceptado · Fecha: 1-nov-2026

## Contexto
Sin pagar dominio. Una web app de Apps Script sirve, pero el enlace es largo, carga lento y Google muestra arriba un aviso de "creada por un usuario de Apps Script".

## Decisión
`site/` se publica en GitHub Pages con GitHub Actions; Apps Script queda solo como servidor de datos. Elegido por la dueña el 1-nov-2026.

## Consecuencias
- Enlace `https://lindiland.github.io` (repositorio `lindiland/lindiland.github.io`), rápido y que Google puede indexar. Más adelante se le puede poner un dominio propio sin rehacer nada.
- El repositorio debe ser público: no lleva secretos.
- La página no pasa por HtmlService, así que la regla de las dos barras de LINDI OS no aplica.
