# 0005 · Diseño de Claude Design y contenido editable en la hoja

Estado: Aceptado · Fecha: 2-nov-2026

## Contexto
La dueña aprobó el handoff de Claude Design ("Inicio C · Tienda": carrusel, sellos, burbuja de pedido, página Lindiland) y pidió poder editar precios, títulos, fechas y productos nuevos de forma sencilla, sin tocar código. El handoff recomendaba Next.js o Astro con React.

## Decisión
- Se recrea el diseño en el mismo `site/index.html` sin frameworks ([stack.md](../stack.md)): no hace falta compilar nada y GitHub Pages lo sirve tal cual.
- Todo el contenido vive en la hoja "Lindi Tienda": Catálogo, Portada y Ajustes (clave/valor con ayuda). La web lo lee en cada visita.
- Texto vacío = sección escondida; `{tokens}` vacíos esconden la pieza. Así lo pendiente (fecha de Navidad, envíos) nunca sale como "[fecha]".
- Decisiones de la dueña sobre el handoff: sellos, "Lo más pedido" y el texto de empaque se quedan como estrategia de venta; "Qué trabaja: motricidad…" pasa a "Para jugar a …" con palabras del manual; el precio de la hoja manda; fondo blanco o crema como ajuste.
- **Sin formulario de datos** (la dueña, 2-nov: pedir nombre y distrito frena la compra): un toque abre WhatsApp, el mensaje termina en "Mi distrito:". Se mantiene la fila en Solicitudes + código ([0003](0003-whatsapp-sin-pasarela.md), [0004](0004-solicitudes-fuera-de-lindi-os.md)), en lugar del enlace directo a WhatsApp del handoff.

## Consecuencias
- La dueña edita desde el celular; un agente solo interviene para cambiar el diseño.
- Ajustes nuevos en versiones futuras se agregan con "Preparar hoja" sin pisar lo escrito.
- Las fotos dependen de que el archivo de Drive esté compartido; si no, salen rayitas con Lindi.
