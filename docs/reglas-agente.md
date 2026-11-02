# Reglas para el agente

Las mismas de LINDI OS ([../../lindi-os/docs/reglas-agente.md](../../lindi-os/docs/reglas-agente.md)) en documentación viva, secretos, ahorro de tokens y forma de trabajar con la dueña. Aquí cambian o se agregan estas:

## Seguridad (lo primero)
1. **La web no toca LINDI OS.** Ni enlaces a su hoja, ni a su script, ni ids suyos en este repositorio ([ADR 0001](adr/0001-web-separada-de-lindi-os.md)).
2. `gas/Code.gs` pide solo `spreadsheets.currentonly`, `script.container.ui` y `script.scriptapp`. Agregar un permiso requiere un ADR aprobado por la dueña. `test/servidor.js` lo verifica.
3. Todo lo que manda el público se valida en el servidor: precios y nombres salen del catálogo, cantidades con tope, textos recortados y sin fórmulas (`clean_`).
4. El repositorio es **público** (GitHub Pages gratis): nada de secretos. El número de WhatsApp y el enlace /exec son públicos por naturaleza.

## Código
5. Un solo `site/index.html` (HTML + CSS + JS sin frameworks ni librerías por CDN; solo Google Fonts). La regla de las dos barras de LINDI OS **no** aplica: esta página no pasa por HtmlService.
6. Diseño: handoff de Claude Design ([ADR 0005](adr/0005-contenido-editable-en-la-hoja.md)). **Fondo crema** (el del manual), decisión final de la dueña el 2-nov-2026 tras probar blanco y mixto: "el blanco no me está gustando". El ajuste `fondo` de la hoja todavía permite blanco o mixto. Colores siempre por variable en `:root`.
6b. **Contenido nunca en el código**: precios, textos, fechas, fotos y productos salen de la hoja. Un texto nuevo editable se agrega a `SETTINGS` en Code.gs (con ayuda para la dueña) y a [editar-contenido.md](editar-contenido.md). Las frases fijas de marca (manifiesto, eslogan, filosofía) sí van en el código. Botones de 44 px mínimo. Primero el celular (llegan desde Instagram).
7. Diseño y textos según el Manual de Marca v4 (skill `marca-lindi`): sin «magia» fuera del manifiesto, sin «Montessori», «motricidad» ni «nuestro taller», Lindi nunca sobre su mismo color, sin fondo pastel con texto oscuro.

## Pruebas y publicación
8. `npm test` en verde y revisión visual antes de publicar. Cada cambio visible ajusta `test/flows/tienda.js`.
9. clasp se ejecuta en la terminal de la dueña. Una sola implementación del script de la tienda: nunca crear otra (cambiaría el enlace de la web).
