# Arquitectura

```
Celular del cliente ─ GitHub Pages: site/index.html (todo el diseño; pedido en localStorage)
        │ GET ?a=contenido        │ POST solicitud (text/plain, sin consulta CORS)
        ▼                         ▼
Apps Script "Lindi Tienda" (gas/Code.gs), ligado a su hoja, permiso spreadsheets.currentonly
        ▼
Hoja "Lindi Tienda": Catálogo · Portada · Ajustes · Solicitudes        ✗ sin vínculo con LINDI OS
```

GitHub guarda **el diseño** (cambia poco, lo cambia un agente). La hoja de Drive guarda **el contenido** (lo cambia la dueña: precios, textos, fotos, productos nuevos). Guía para la dueña: [editar-contenido.md](editar-contenido.md). Diseño: handoff de Claude Design "Inicio C · Tienda" ([ADR 0005](adr/0005-contenido-editable-en-la-hoja.md)).

## Servidor (`gas/Code.gs`)
- `doGet` → `{ok, items, slides, settings}` (`content_`), en caché 10 min (si pasa de 100 KB se sirve sin caché). `onEdit` en Catálogo, Portada o Ajustes y el menú "Ver cambios en la web" borran la caché.
- `doPost` → `createOrder_`: campo trampa `web` (para bots que llamen directo), nombre y distrito opcionales (la web no los pide), máx. 20 líneas y 10 unidades, productos y precios del catálogo (precio vacío = por confirmar, no suma), tope 30 por minuto y 200 por día, código de referencia al azar de 5 caracteres (`newCode_`, sin repetir; no correlativo para no revelar cuántos pedidos hay). El cliente solo lo ve como "Ref." al final del mensaje de WhatsApp. Devuelve `{ok, code, total, pending, items}`.
- `marcarVencidas` (activador diario 4 a. m.): `pendiente` > 7 días → `vencida`.
- Menú "Lindi Tienda": Preparar hoja (crea lo que falte y **agrega ajustes nuevos sin pisar los existentes**; repetible), Marcar vencidas ahora, Ver cambios en la web.

## Hoja "Lindi Tienda"
Los encabezados se leen sin tildes ni mayúsculas; las columnas se pueden mover.
- **Catálogo** → `items`: id, nombre, ambito, coleccion, precio, precio_texto, descripcion, para_jugar, edad, aviso, material, personalizar, sello, destacado, foto, fotos_extra, publicado, orden, complementos (→ `extras`, lista de ids), solo_sugerencia (→ `onlyExtra`: fuera de la tienda, solo en sugerencias). Solo sale lo publicado con id y nombre. Columnas nuevas siempre al final (`addColumns_`). Fila sin id → `onEdit` le pone uno sacado del nombre (`uniqueId_`).
- **Panel** (`gas/Panel.html`, menú Abrir panel): diálogo de la hoja que llama `panelDatos`, `panelGuardarProducto`, `panelGuardarDiapositiva` (Portada no tiene id: guarda por número de fila), `panelGuardarAjustes`, `panelEstadoSolicitud` por `google.script.run`. Solo lo abre quien edita la hoja; la web pública no puede llamarlas (doGet nunca sirve HTML). Nada de objetos Date en lo que devuelven.
- **Portada** → `slides` (máx. 6): orden, publicado, color, etiqueta, titulo, texto, boton, destino, boton2, destino2, foto, sticker, sticker_texto, accesorio.
- **Ajustes** → `settings`: clave/valor/ayuda. Solo salen las claves de `SETTINGS` en Code.gs (whatsapp, fondo, avisos, Navidad, envíos, pago, regalo, novedad, títulos y fotos de bloques, historia, redes). Fechas → "15 de diciembre"; fotos → miniatura; whatsapp → solo dígitos.
- **Solicitudes**: codigo, fecha, estado, nombre, distrito, para, productos, total, nota. Columnas del público en formato texto; `clean_` neutraliza fórmulas.

## Web (`site/index.html`)
- `CONFIG.api` (enlace /exec) es lo único fijo; el número de WhatsApp sale de Ajustes.
- Rutas: `#/` inicio · `#/tienda[/ámbito]` · `#/p/<id>` ficha · `#/lindiland` · `#/carta` (Lindiland con la carta abierta) · `#/como-pedir` · `#/pedido` · `#/listo`.
- Inicio: barra de avisos (rota con el carrusel) · carrusel (Portada) · bienvenida · bloques de los ámbitos con productos · lo más pedido (destacados) · Navidad (si hay fecha límite) + novedad · ¿Qué buscas hoy? · historia · ¿Es para regalo? · cómo pedir · redes.
- `fill()`: tokens `{precio:id}`, `{dias_navidad}`, `{fecha_limite}` y cualquier clave de Ajustes. **Un token vacío esconde la pieza** (diapositiva, aviso, novedad) para que nada salga a medias. Texto vacío = sección escondida.
- Sin foto o foto rota → rayitas del color con Lindi (`photoHtml`); Lindi nunca sobre su mismo color.
- Lindi (`charHtml`) es el componente LindiChar del handoff pasado a HTML/CSS: poses quieto, saluda, camina, salta, sentado, celebra; accesorios chef, cereza, gorra, sombrero, lazo, boina, gorrito.
- Fondo: ajuste `fondo` (crema por defecto, blanco o mixto); `?fondo=` en la URL solo cambia la vista de quien la abre.
- Pedido en `localStorage` (`lindi-web:pedido`, máx. 9 por producto y 20 productos), contenido en `lindi-web:contenido` para abrir rápido, último pedido en `lindi-web:ultimo`. **Sin formulario de datos** (la dueña, 2-nov-2026: frena la compra). Un toque envía desde la burbuja ("Enviar"), la ficha ("Pedir por WhatsApp") o `#/pedido` (revisar cantidades y la elección del producto, solo si tiene `personalizar`). El mensaje termina en "Mi distrito:" para completarlo en el chat. Al enviar: si la hoja rechaza por datos, se muestra el motivo; si no responde o responde `retry` (topes, ocupada), igual abre WhatsApp sin código.

## Flujo del pedido
1. Cliente toca Enviar → fila `pendiente` (sin nombre: se ve en el chat) + WhatsApp con la lista, total y código.
2. La dueña cobra por Yape → `pagado` → recién entonces lo registra en LINDI OS (a mano).
3. Lo no pagado pasa solo a `vencida` a los 7 días. Nada llega a LINDI OS sin pago.

## Vista previa local
`npm run serve` y abrir `http://localhost:8767/demo` (o `/demo?fondo=crema`): corre el mismo Code.gs sobre una hoja simulada con los borradores de "Preparar hoja" publicados.

## Por comprobar en la primera implementación real
- [x] GET anónimo con solo `spreadsheets.currentonly`: comprobado el 2-nov-2026 (implementación @1 devuelve el contenido).
- [ ] POST real desde la web publicada y `marcarVencidas` desde el activador diario.
