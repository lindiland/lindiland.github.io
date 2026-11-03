# Cómo editar la web (para la dueña)

Todo se edita en la hoja **"Lindi Tienda"** de tu Drive (la cuenta de Google de Lindi). No hace falta tocar GitHub ni código. Al guardar, la web cambia al recargarla. Si no cambia, en el menú **Lindi Tienda → Ver cambios en la web**.

## La forma fácil: el panel
En la computadora, abre la hoja → menú **Lindi Tienda → Abrir panel**. La primera vez Google pide permiso de nuevo: debe decir que solo usa **esta hoja**.
- **Arriba**: cuántos productos hay en la web, cuántos borradores y cuántos pedidos faltan cobrar.
- **Productos**: a la izquierda la lista; haz clic en uno y edítalo en casillas grandes. **+ Nuevo producto** crea uno (el id se pone solo con el nombre). **Duplicar** copia uno parecido para no escribir todo de nuevo. Pega el enlace de la foto y ves la vista previa. Siempre termina con **Guardar cambios**.
- **Portada**: el carrusel de colores de arriba. Eliges una diapositiva y ves cómo queda mientras escribes (color, textos, botones, sticker y foto). Los botones llevan a un producto, un ámbito o una sección que eliges de una lista.
- **Pedidos**: los que llegaron por la web. Cuando te pagan, **Ya pagó**; cuando lo entregas, **Entregado**.
- **Ajustes**: WhatsApp, envíos, avisos, Navidad (con calendario) y fotos de los bloques.
El panel escribe en las mismas pestañas de abajo; puedes usar uno u otro. En el celular la app de Hojas no abre el panel: ahí se edita la tabla directamente.

**Preparar hoja** no es para después de editar: se usa una vez cuando una versión nueva trae columnas o ajustes nuevos (te avisamos). Puedes correrla de nuevo sin miedo: no borra ni cambia lo que escribiste.

## Complementos y sugerencias
Cada producto puede tener complementos (mandil + gorro de chef, toppings extra, manteles con comandas y menú…).
1. Crea el complemento como un producto más (con precio y foto).
2. En el kit (por ejemplo la Pizzería), sección **Complementos y sugerencias**, marca los que van con él.
3. Si es un extra que no tiene sentido solo (toppings extra), marca **Solo como sugerencia**: no sale en la tienda, solo junto a su kit.

La web los muestra en la ficha del kit («Combínalo con») y en el pedido antes de enviar («¿Le sumas algo?»). También al revés: en la ficha del mandil sale la Pizzería. En el pedido además sugiere solo otro kit del mismo ámbito, primero los destacados.
En la tabla son las columnas **complementos** (los id separados por comas: `mandil-chef, toppings-extra`) y **solo_sugerencia** (casilla), al final de Catálogo.

## Pestaña Catálogo: un producto por fila
| Columna | Qué poner | Ejemplo |
|---|---|---|
| id | **Se pone solo** al escribir el nombre de una fila nueva. **No cambiarlo después** (lo usan los enlaces, los complementos y los pedidos). | `kit-pizzeria` |
| nombre | Como lo ve el cliente | Kit La Pizzería |
| ambito | Accesorios, Juego, Creatividad o Espacios (lista) | Juego |
| coleccion | Local de Lindiland, si tiene | La Pizzería |
| precio | Solo el número. **Vacío = "por confirmar"**: se puede pedir y lo cotizas en el chat | 139 |
| precio_texto | Opcional, reemplaza el precio en pantalla | desde S/25 |
| descripcion | Uno o dos renglones | 4 porciones con salsa y queso… |
| para_jugar | Sale como "Para jugar a …" | cocinar, servir porciones y tomar pedidos |
| edad / aviso | Recuadro de seguridad | Desde 3 años / Contiene piezas pequeñas… |
| material | Recuadro de material | Fieltro de poliéster · Limpiar con paño húmedo |
| personalizar | Lo que el cliente debe escribir (si está vacío, pide una nota opcional) | Los 3 toppings que eliges |
| sello | FAVORITO, NUEVO, PARA LA VITRINA, POCAS UNIDADES o PARA REGALO (lista) | FAVORITO |
| destacado | Casilla: sale en "Lo más pedido" | ☑ |
| foto | Enlace de Drive de la foto principal | |
| fotos_extra | Más fotos: un enlace por línea (hasta 6) | |
| publicado | Casilla: **solo sale en la web lo marcado** | ☑ |
| orden | Número para ordenar (1 sale primero) | 1 |
| complementos | id de lo que se sugiere con este producto, separados por comas | `mandil-chef, toppings-extra` |
| solo_sugerencia | Casilla: no sale en la tienda, solo junto a su kit y en el pedido | ☐ |

**Producto nuevo:** con el panel (**+ Nuevo producto**), o en la tabla: escribe el nombre en la primera fila vacía y el id aparece solo; llena el resto y marca publicado.
**Quitar un producto:** desmarca publicado (no borres la fila).

## Fotos
1. Súbelas a una carpeta de Drive (fotos tuyas, hechas con IA o renders, por ejemplo de muebles).
2. En Drive: clic derecho → **Compartir** → "Cualquier persona con el enlace" → Lector.
3. Copia el enlace y pégalo en la columna.
Fotos cuadradas para productos. Horizontales para la portada y los bloques. Si una foto no carga, la web pone las rayitas de color con Lindi; nunca queda un hueco.

## Pestaña Portada: el carrusel de arriba
Una fila por diapositiva (máximo 6). Columnas: orden, publicado, color (amarillo, azul, coral o verde), etiqueta, titulo, texto, boton, destino, boton2, destino2, foto, sticker, sticker_texto, accesorio de Lindi (chef, cereza, gorra…).
- **destino**: el id de un producto (`kit-pizzeria`), un ámbito (`juego`), `tienda`, `lindiland` o `whatsapp`.

## Pestaña Ajustes: textos y datos generales
Solo se edita la columna **valor**. La columna **ayuda** explica cada uno. Lo más importante:
- **whatsapp**: tu número con 51 (sin él no se pueden enviar pedidos).
- **fondo**: `crema` (el del manual, por defecto), `blanco` o `mixto` (página blanca con tarjetas crema).
- **navidad_fecha_limite**: escribe la fecha y aparecen la diapositiva, el aviso y el bloque de Navidad con la cuenta regresiva. Vacío = todo lo de Navidad se esconde.
- **envio_lima**, **envio_provincias**, **medios_pago**: salen en "Cómo pedir", en la ficha y en la barra de avisos.
- **aviso_1** a **aviso_3**: la barra oscura de arriba.
- Fotos de los bloques, de la historia y de redes.

**Regla general: si dejas un texto vacío, su sección no sale.** Para esconder algo, **vacía el valor, no borres la fila**: si borras la fila, "Preparar hoja" la vuelve a crear con el texto de ejemplo.

## Palabras que se reemplazan solas
En cualquier texto de Portada o Ajustes puedes escribir:
- `{precio:kit-pizzeria}` → el precio actual de ese producto (si cambias el precio, cambia en todos lados).
- `{dias_navidad}` → días que faltan para el 24 de diciembre.
- `{fecha_limite}` → la fecha de navidad_fecha_limite.
- `{envio_lima}`, `{medios_pago}` u otra clave de Ajustes → su valor.
Si una de esas palabras está vacía, esa diapositiva o aviso no sale (para que nunca se vea a medias).

## Pestaña Solicitudes: los pedidos que llegan
Cada pedido de la web llega aquí como `pendiente`, con un código al azar (por ejemplo `K7P2X`) que sale discreto al final del mensaje de WhatsApp como "Ref. K7P2X". Así encuentras la fila; el cliente no puede adivinar cuántos pedidos tienes. La web no pide nombre ni distrito (para no frenar la compra): los ves en el chat, y si quieres los anotas en la fila con el mismo código.
- Te pagan por Yape → cambia a `pagado` y recién ahí regístralo en LINDI OS.
- Lo entregas → `entregado`.
- Nadie paga en 7 días → pasa solo a `vencida`. No se borra nada.

## Ver otra opción de fondo sin cambiar nada
Agrega `?fondo=blanco`, `?fondo=mixto` o `?fondo=crema` al final del enlace de la web. Solo cambia en tu pantalla.
