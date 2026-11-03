# Changelog

## 0.3.0 · 2-nov-2026
- Panel en la hoja (menú Lindi Tienda → Abrir panel, `gas/Panel.html`): productos con vista previa de foto, nuevo y duplicar; portada con vista previa en vivo y destinos de lista; pedidos por cobrar con botones de estado; ajustes agrupados.
- Cómo pedir, paso 2: ya no dice "Solo agregas tu distrito" (la dueña lo pregunta en el chat). Sin permisos nuevos (`script.container.ui` ya cubría los diálogos).
- Complementos: columnas `complementos` y `solo_sugerencia` al final de Catálogo (Preparar hoja o el panel las agregan). La web sugiere en la ficha («Combínalo con», en ambos sentidos) y en el pedido («¿Le sumas algo?», complementos y otro kit).
- id automático a partir del nombre (al escribir en la hoja o al crear en el panel).
- Vista previa local del panel en `/panel` (test/tools/serve.js).

## 0.2.0 · 2-nov-2026 (sin publicar)
- Nuevo diseño a partir del handoff de Claude Design: barra de avisos, carrusel, bloques por ámbito, lo más pedido con sellos y stickers de precio, Navidad con cuenta regresiva, ¿Qué buscas hoy?, historia, regalo, cómo pedir, redes, página Lindiland con la carta a los papás, personaje Lindi en HTML/CSS, burbuja de pedido, menú para celular.
- Contenido editable en la hoja: pestañas Portada y Ajustes nuevas; Catálogo con precio por confirmar, para jugar, sello, destacado y fotos extra. El número de WhatsApp pasa a Ajustes.
- Fondo crema por defecto (elegido por la dueña tras probar blanco y mixto); el ajuste `fondo` admite crema, blanco o mixto (`?fondo=` para comparar).
- Código de pedido al azar ("Ref. K7P2X" al final del mensaje), ya no correlativo ni visible en la pantalla de gracias.
- Pedido sin formulario: un toque desde la burbuja, la ficha o Tu pedido abre WhatsApp; el mensaje termina en "Mi distrito:".
- Correcciones de la revisión independiente: topes de la hoja ya no bloquean WhatsApp, elecciones del mismo producto se suman, carrusel con pausa y sin robar el foco, Navidad se esconde sola al pasar la fecha.

## 0.1.0 · 1-nov-2026 (sin publicar)
- Primera versión: catálogo desde la hoja "Lindi Tienda", lista de compra, pedido por WhatsApp con código `LND-NNNN`, solicitudes que vencen a los 7 días.
