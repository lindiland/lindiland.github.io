/**
 * @OnlyCurrentDoc
 */
// Lindi Tienda: todo el contenido editable de la web y las solicitudes de pedido (docs/arquitectura.md).
// Va ligado a su propia hoja "Lindi Tienda" y pide solo el permiso spreadsheets.currentonly:
// Google no le deja abrir ningún otro archivo, así que no puede llegar a LINDI OS (ADR 0001).
// Prohibido usar aquí openById, openByUrl, DriveApp o UrlFetchApp: lo revisa test/servidor.js.

const CATALOG_SHEET = 'Catálogo';
const SLIDES_SHEET = 'Portada';
const SETTINGS_SHEET = 'Ajustes';
const ORDERS_SHEET = 'Solicitudes';
// Columnas nuevas van al final: así no se corren las letras de las que la dueña ya conoce.
const CATALOG_HEAD = ['id', 'nombre', 'ambito', 'coleccion', 'precio', 'precio_texto', 'descripcion', 'para_jugar', 'edad', 'aviso', 'material', 'personalizar', 'sello', 'destacado', 'foto', 'fotos_extra', 'publicado', 'orden', 'complementos', 'solo_sugerencia'];
const CATALOG_CHECKS = ['publicado', 'destacado', 'solo_sugerencia'];
const WEB_URL = 'https://lindiland.github.io';
const SLIDES_HEAD = ['orden', 'publicado', 'color', 'etiqueta', 'titulo', 'texto', 'boton', 'destino', 'boton2', 'destino2', 'foto', 'sticker', 'sticker_texto', 'accesorio'];
const ORDERS_HEAD = ['codigo', 'fecha', 'estado', 'nombre', 'distrito', 'para', 'productos', 'total', 'nota'];
const ORDER_STATES = ['pendiente', 'pagado', 'entregado', 'vencida', 'cancelado'];
const SCOPES = ['Accesorios', 'Juego', 'Creatividad', 'Espacios'];
const COLORS = ['amarillo', 'azul', 'coral', 'verde'];
const ACCESSORIES = ['ninguno', 'chef', 'cereza', 'gorra', 'sombrero', 'lazo', 'boina', 'gorrito'];
const BADGES = ['FAVORITO', 'NUEVO', 'PARA LA VITRINA', 'POCAS UNIDADES', 'PARA REGALO'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Ajustes: lo único que la web lee de esta pestaña. [clave, valor inicial, ayuda que ve la dueña]
// Un texto vacío esconde su sección; {tokens} se reemplazan en la web (ver docs/arquitectura.md).
const SETTINGS = [
  ['whatsapp', '', 'Número con 51 y sin espacios. Ej.: 51987654321. Sin número no se pueden enviar pedidos.'],
  ['fondo', 'crema', 'Color de fondo de la web: crema (el del manual), blanco o mixto (página blanca con tarjetas crema).'],
  ['aviso_1', 'Pedidos para Navidad hasta el {fecha_limite} · faltan {dias_navidad} días', 'Barra de arriba (rota). Vacío = no sale.'],
  ['aviso_2', 'Envíos en Lima: {envio_lima}', 'Barra de arriba.'],
  ['aviso_3', 'Pides por WhatsApp y pagas al confirmar', 'Barra de arriba.'],
  ['navidad_fecha_limite', '', 'Último día para pedir regalos de Navidad (escribe la fecha). Vacío = se esconde todo lo de Navidad.'],
  ['navidad_texto', 'Llegan con su caja, papel de seda y tarjeta de bienvenida. Listos para poner bajo el árbol.', 'Bloque azul de Navidad.'],
  ['envio_lima', '', 'Ej.: 2 a 3 días hábiles'],
  ['envio_provincias', '', 'Ej.: por Shalom, 3 a 5 días. Vacío = no se menciona.'],
  ['medios_pago', 'Yape', 'Cómo te pagan. Ej.: Yape o Plin'],
  ['entrega_texto', 'Llega en su caja, con papel de seda y su tarjeta de bienvenida.', 'Paso 4 de "Cómo pedir".'],
  ['regalo_texto', 'Cuéntanos en el pedido el nombre de quien lo recibe y lo escribimos a mano en su tarjeta.', 'Banda "¿Es para regalo?". Vacío = no sale.'],
  ['novedad_etiqueta', 'JUEGO · LA PASTELERÍA', 'Tarjeta de novedad junto a Navidad.'],
  ['novedad_titulo', 'Los dulces ya salieron del horno', 'Vacío = no sale la tarjeta.'],
  ['novedad_texto', 'La Pastelería abre completa en abril de 2027. Los dulces ya se pueden pedir, sueltos o en grupo.', ''],
  ['novedad_boton', 'Ver dulces · {precio:dulces-pasteleria}', ''],
  ['novedad_destino', 'dulces-pasteleria', 'id de un producto, un ámbito (juego…), tienda, lindiland o whatsapp.'],
  ['titulo_accesorios', 'Lazos', 'Nombre del bloque grande de cada ámbito (sale si el ámbito tiene productos).'],
  ['titulo_juego', 'Kits de comida', ''],
  ['titulo_creatividad', 'Kits para crear', ''],
  ['titulo_espacios', 'Su rincón', ''],
  ['foto_accesorios', '', 'Enlace de Drive (compartido: cualquiera con el enlace).'],
  ['foto_juego', '', ''],
  ['foto_creatividad', '', ''],
  ['foto_espacios', '', ''],
  ['foto_historia_1', '', 'Mosaico "Un mundo pensado a su altura" (foto grande).'],
  ['foto_historia_2', '', ''],
  ['foto_historia_3', '', ''],
  ['foto_quienes_somos', '', 'Página Lindiland.'],
  ['fotos_redes', '', 'Varias fotos para "Lo que pasa en Lindiland": un enlace por línea. Vacío = solo los botones de redes.'],
  ['instagram', 'lindi.pe', 'Usuario sin @.'],
  ['tiktok', 'lindi.pe', 'Usuario sin @. Vacío = no sale.']
];
const SETTING_KEYS = SETTINGS.map(s => s[0]);

// Topes para que una visita (o un bot) no llene la hoja de basura.
// El tope diario evita que un bot llene la hoja (Apps Script no da la IP, así que no hay tope por persona).
const LIMITS = { lines: 20, qty: 10, name: 60, district: 60, when: 40, note: 300, choice: 200, perMinute: 30, perDay: 200 };
const EXPIRE_DAYS = 7;
const CACHE_KEY = 'contenido';
const CACHE_SECONDS = 600;

// ---------- Web (lo único que ve el público) ----------

function doGet(e) {
  const action = (e && e.parameter && e.parameter.a) || 'contenido';
  if (action !== 'contenido' && action !== 'catalogo') return json_({ ok: false, error: 'Acción desconocida.' });
  const c = content_();
  return json_({ ok: true, items: c.items, slides: c.slides, settings: c.settings });
}

// La web envía el cuerpo como text/plain para evitar la consulta previa de CORS, que Apps Script no responde.
function doPost(e) {
  let body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return json_({ ok: false, error: 'Pedido con formato inválido.' }); }
  // retry:true = la hoja no pudo anotarlo (ocupada, topes): la web igual abre WhatsApp, sin código.
  try { return json_(createOrder_(body || {})); }
  catch (err) { return json_({ ok: false, retry: true, error: 'No se pudo registrar el pedido.' }); }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Contenido ----------

function content_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get(CACHE_KEY);
  if (hit) return JSON.parse(hit);
  const c = { items: catalog_(), slides: slides_(), settings: settings_() };
  // La caché no acepta más de 100 KB: con mucho contenido se sirve sin caché en vez de fallar.
  try { cache.put(CACHE_KEY, JSON.stringify(c), CACHE_SECONDS); } catch (err) { }
  return c;
}

function catalog_() {
  return readRows_(CATALOG_SHEET)
    .filter(r => isYes_(r.publicado) && text_(r.id) && text_(r.nombre))
    .map(r => {
      const price = Number(r.precio);
      return {
        id: text_(r.id),
        name: text_(r.nombre),
        scope: SCOPES.find(s => plain_(s) === plain_(r.ambito)) || 'Juego',
        collection: text_(r.coleccion),
        // Sin precio = "por confirmar": se puede pedir, pero no suma al total.
        price: price > 0 ? Math.round(price * 100) / 100 : 0,
        priceText: text_(r.precio_texto),
        description: text_(r.descripcion),
        play: text_(r.para_jugar),
        age: text_(r.edad),
        warning: text_(r.aviso),
        material: text_(r.material),
        customize: text_(r.personalizar),
        badge: text_(r.sello).toUpperCase(),
        featured: isYes_(r.destacado),
        photo: photoUrl_(r.foto),
        photos: splitLinks_(r.fotos_extra).map(photoUrl_).filter(Boolean).slice(0, 6),
        // ids de lo que se sugiere junto a este producto; la web ignora los que no estén publicados.
        extras: splitLinks_(r.complementos).slice(0, 12),
        onlyExtra: isYes_(r.solo_sugerencia),
        order: Number(r.orden) || 999
      };
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'es'));
}

function slides_() {
  return readRows_(SLIDES_SHEET)
    .filter(r => isYes_(r.publicado) && text_(r.titulo))
    .map(r => ({
      color: COLORS.indexOf(plain_(r.color)) >= 0 ? plain_(r.color) : 'amarillo',
      kicker: text_(r.etiqueta), title: text_(r.titulo), text: text_(r.texto),
      cta: text_(r.boton), to: text_(r.destino), cta2: text_(r.boton2), to2: text_(r.destino2),
      photo: photoUrl_(r.foto), sticker: text_(r.sticker), stickerText: text_(r.sticker_texto),
      accessory: ACCESSORIES.indexOf(plain_(r.accesorio)) > 0 ? plain_(r.accesorio) : '',
      order: Number(r.orden) || 999
    }))
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);
}

function settings_() {
  const out = {};
  readRows_(SETTINGS_SHEET).forEach(r => {
    const key = plain_(r.clave);
    if (SETTING_KEYS.indexOf(key) < 0) return;
    let v = r.valor;
    // Una fecha sale escrita ("15 de diciembre") y además en ISO, para que la web sepa cuándo ya pasó.
    if (v && typeof v.getTime === 'function') {
      out[key + '_iso'] = v.getFullYear() + '-' + String(v.getMonth() + 1).padStart(2, '0') + '-' + String(v.getDate()).padStart(2, '0');
      v = v.getDate() + ' de ' + MONTHS[v.getMonth()];
    }
    v = text_(v);
    if (key.indexOf('foto_') === 0) v = photoUrl_(v);
    if (key === 'fotos_redes') v = splitLinks_(v).map(photoUrl_).filter(Boolean).slice(0, 12);
    if (key === 'whatsapp') v = v.replace(/\D/g, '');
    if (key === 'instagram' || key === 'tiktok') v = v.replace(/^@/, '').replace(/[^\w.]/g, '');
    out[key] = v;
  });
  return out;
}

// Lee una pestaña como objetos usando los encabezados (sin tildes ni mayúsculas), así la dueña
// puede escribir "Colección" o mover columnas sin romper nada.
function readRows_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const rows = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  const head = rows.shift().map(h => plain_(h).replace(/\s+/g, '_'));
  return rows.map(r => {
    const o = {};
    head.forEach((h, i) => { if (h) o[h] = r[i]; });
    return o;
  });
}

function splitLinks_(v) {
  return text_(v).split(/[\s,]+/).filter(Boolean);
}

// Enlace de Drive ("compartir": cualquiera con el enlace) o id suelto → miniatura pública; otro https se deja tal cual.
function photoUrl_(v) {
  const s = text_(v);
  if (!s) return '';
  const m = s.match(/\/d\/([\w-]{20,})/) || s.match(/[?&]id=([\w-]{20,})/) || s.match(/^([\w-]{20,})$/);
  if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1200';
  return /^https:\/\//.test(s) ? s : '';
}

// ---------- Solicitudes ----------

function createOrder_(body) {
  // Campo trampa: invisible para personas; si viene lleno lo envió un bot. Se responde "ok" sin guardar.
  if (text_(body.web)) return { ok: true, code: '' };
  const name = clean_(body.name, LIMITS.name);
  const district = clean_(body.district, LIMITS.district);
  const when = clean_(body.when, LIMITS.when);
  const note = clean_(body.note, LIMITS.note);
  // Nombre y distrito son opcionales: la web ya no los pide (frenan la compra); llegan por el chat.
  const lines = Array.isArray(body.items) ? body.items : [];
  if (!lines.length) return { ok: false, error: 'Tu pedido está vacío.' };
  if (lines.length > LIMITS.lines) return { ok: false, error: 'Máximo ' + LIMITS.lines + ' productos por pedido.' };

  // Precios y nombres salen del catálogo, nunca de lo que mande el navegador.
  // Sin prototipo: un id como "constructor" o "__proto__" no debe encontrar nada.
  const byId = Object.create(null);
  content_().items.forEach(p => { byId[p.id] = p; });
  const items = [];
  for (const l of lines) {
    const p = byId[text_(l && l.id)];
    if (!p) return { ok: false, error: 'Un producto de tu pedido ya no está disponible. Recarga la página.' };
    const qty = Number(l.qty);
    if (!(qty >= 1 && qty <= LIMITS.qty && Math.floor(qty) === qty)) return { ok: false, error: 'Cantidad no válida en ' + p.name + '.' };
    items.push({ id: p.id, name: p.name, qty: qty, price: p.price, choice: clean_(l.choice, LIMITS.choice) });
  }
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const pending = items.some(i => !i.price);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const cache = CacheService.getScriptCache();
    const rateKey = 'rate:' + Math.floor(Date.now() / 60000);
    const sent = Number(cache.get(rateKey) || 0);
    // Topes alcanzados: no se anota, pero el cliente real igual llega a WhatsApp (un bot no bloquea las ventas).
    if (sent >= LIMITS.perMinute) return { ok: false, retry: true, error: 'Hay muchos pedidos en este momento.' };
    const props = PropertiesService.getScriptProperties();
    const today = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd');
    const daily = props.getProperty('day') === today ? Number(props.getProperty('dayCount') || 0) : 0;
    if (daily >= LIMITS.perDay) return { ok: false, retry: true, error: 'Hoy ya no se anotan más pedidos por la web.' };
    cache.put(rateKey, String(sent + 1), 120);
    props.setProperty('day', today);
    props.setProperty('dayCount', String(daily + 1));

    const code = newCode_();

    const detail = items.map(i => i.qty + ' × ' + i.name + (i.price ? '' : ' (precio por confirmar)') + (i.choice ? ' (' + i.choice + ')' : '')).join('\n');
    ordersSheet_().appendRow([code, new Date(), 'pendiente', name, district, when, detail, pending ? total + ' + por confirmar' : total, note]);
    SpreadsheetApp.flush();
    return { ok: true, code: code, total: total, pending: pending, items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })) };
  } finally {
    lock.releaseLock();
  }
}

// Código de referencia al azar (no correlativo: el cliente no debe adivinar cuántos pedidos hay).
// 5 caracteres sin letras que se confunden (0/O, 1/I/L); se revisa que no esté ya en Solicitudes.
function newCode_() {
  const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const used = {};
  const sh = SpreadsheetApp.getActive().getSheetByName(ORDERS_SHEET);
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(r => { used[r[0]] = true; });
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 5; i++) code += ABC.charAt(Math.floor(Math.random() * ABC.length));
  } while (used[code]);
  return code;
}

function ordersSheet_() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(ORDERS_SHEET) || setupOrders_(ss);
}

// ---------- Mantenimiento (menú de la hoja y activador) ----------

// Activador diario: lo que sigue "pendiente" después de 7 días pasa a "vencida". No borra nada
// y solo escribe la columna estado, para no pisar lo que la dueña esté editando en otras columnas.
function marcarVencidas() {
  const sh = SpreadsheetApp.getActive().getSheetByName(ORDERS_SHEET);
  if (!sh || sh.getLastRow() < 2) return 0;
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  const limit = Date.now() - EXPIRE_DAYS * 86400000;
  let changed = 0;
  // Celda por celda: así no se pisa un estado que la dueña cambie en ese mismo momento en otra fila.
  rows.forEach((r, i) => {
    if (plain_(r[2]) === 'pendiente' && r[1] && typeof r[1].getTime === 'function' && r[1].getTime() < limit) {
      sh.getRange(i + 2, 3).setValue('vencida');
      changed++;
    }
  });
  return changed;
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Lindi Tienda')
    .addItem('Abrir panel', 'abrirPanel')
    .addItem('Preparar hoja', 'prepararHoja')
    .addItem('Marcar vencidas ahora', 'marcarVencidas')
    .addItem('Ver cambios en la web', 'refrescarCatalogo')
    .addToUi();
}

// Al editar contenido se borra la copia guardada, para que la web muestre el cambio de inmediato.
function onEdit(e) {
  const name = e && e.range && e.range.getSheet().getName();
  if (name === CATALOG_SHEET) fillIds_();
  if (name === CATALOG_SHEET || name === SLIDES_SHEET || name === SETTINGS_SHEET) refrescarCatalogo();
}

// Un producto nuevo escrito a mano en la hoja recibe su id solo, a partir del nombre ("Mandil chef" → mandil-chef).
function fillIds_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(CATALOG_SHEET);
  if (!sh || sh.getLastRow() < 2) return;
  const rows = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  const head = rows.shift().map(h => plain_(h).replace(/\s+/g, '_'));
  const iId = head.indexOf('id'), iName = head.indexOf('nombre');
  if (iId < 0 || iName < 0) return;
  const taken = rows.map(r => text_(r[iId]));
  rows.forEach((r, i) => {
    if (taken[i] || !text_(r[iName])) return;
    taken[i] = uniqueId_(r[iName], taken);
    sh.getRange(i + 2, iId + 1).setValue(taken[i]);
  });
}

function uniqueId_(name, taken) {
  const base = plain_(name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'producto';
  let id = base;
  for (let n = 2; taken.indexOf(id) >= 0; n++) id = base + '-' + n;
  return id;
}

function refrescarCatalogo() {
  CacheService.getScriptCache().remove(CACHE_KEY);
}

// Crea lo que falte (pestañas, ajustes nuevos, activador). Se puede repetir sin duplicar ni pisar nada.
function prepararHoja() {
  const ss = SpreadsheetApp.getActive();
  if (!ss.getSheetByName(CATALOG_SHEET)) setupCatalog_(ss);
  else addColumns_(ss.getSheetByName(CATALOG_SHEET), CATALOG_HEAD);
  if (!ss.getSheetByName(SLIDES_SHEET)) setupSlides_(ss);
  setupSettings_(ss);
  if (!ss.getSheetByName(ORDERS_SHEET)) setupOrders_(ss);
  const has = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'marcarVencidas');
  if (!has) ScriptApp.newTrigger('marcarVencidas').timeBased().everyDays(1).atHour(4).create();
  refrescarCatalogo();
}

function setupCatalog_(ss) {
  const sh = ss.insertSheet(CATALOG_SHEET);
  const felt = 'Fieltro de poliéster · Limpiar con paño húmedo';
  const small = 'Contiene piezas pequeñas. No apto para menores de 3 años.';
  // Borradores sin publicar: no salen en la web hasta que la dueña marque "publicado".
  const rows = [
    ['kit-pizzeria', 'Kit La Pizzería', 'Juego', 'La Pizzería', 139, '', '4 porciones con salsa y queso, y 3 toppings que eliges tú. Fieltro cosido a mano.', 'cocinar, servir porciones y tomar pedidos', 'Desde 3 años', small, felt, 'Los 3 toppings que eliges', 'FAVORITO', true, '', '', false, 1, '', false],
    ['kit-sangucheria', 'Kit La Sanguchería', 'Juego', 'La Sanguchería', 99, '', 'Sánguches de fieltro para armar capa por capa y servir. Fieltro cosido a mano.', 'armar capa por capa, atender y servir', 'Desde 3 años', small, felt, '', '', true, '', '', false, 2, '', false],
    ['kit-sushi', 'Kit El Sushi bar', 'Juego', 'El Sushi bar', 89, '', 'Piezas de sushi de fieltro para preparar, servir y compartir. Fieltro cosido a mano.', 'preparar, servir y compartir', 'Desde 3 años', small, felt, '', 'NUEVO', true, '', '', false, 3, '', false],
    ['dulces-pasteleria', 'Dulces La Pastelería', 'Juego', 'La Pastelería', '', 'desde S/25', 'Dulces de fieltro para la vitrina de casa. Se piden sueltos o en grupo. Fieltro cosido a mano.', 'hornear, armar la vitrina y vender', 'Desde 3 años', small, felt, 'Qué dulces quieres', 'PARA LA VITRINA', true, '', '', false, 4, '', false],
    ['lazos', 'Lazos', 'Accesorios', '', '', '', 'Lazos de tela con gancho, en colores para combinar.', 'elegir, combinar colores y arreglarse solos', '', '', 'Tela y gancho metálico', 'Colores que prefieres', 'POCAS UNIDADES', true, '', '', false, 5, '', false]
  ];
  sh.getRange(1, 1, 1, CATALOG_HEAD.length).setValues([CATALOG_HEAD]).setFontWeight('bold');
  sh.getRange(2, 1, rows.length, CATALOG_HEAD.length).setValues(rows);
  CATALOG_CHECKS.forEach(h => sh.getRange(2, CATALOG_HEAD.indexOf(h) + 1, 200, 1).insertCheckboxes());
  listColumn_(sh, CATALOG_HEAD, 'ambito', SCOPES);
  listColumn_(sh, CATALOG_HEAD, 'sello', BADGES);
  sh.setFrozenRows(1);
  return sh;
}

function setupSlides_(ss) {
  const sh = ss.insertSheet(SLIDES_SHEET);
  const rows = [
    [1, true, 'amarillo', 'JUEGO · LA PIZZERÍA', 'Hoy abre la Pizzería.', 'Tu hijo amasa, elige los toppings y te pregunta qué vas a pedir.', 'Pedir la Pizzería · {precio:kit-pizzeria}', 'kit-pizzeria', 'Ver todo Juego', 'juego', '', '{precio:kit-pizzeria}', 'DESDE 3 AÑOS', 'chef'],
    [2, true, 'azul', 'NAVIDAD 2026', 'Para ti es un juego. Para ellos, es un mundo entero.', 'Pide hasta el {fecha_limite} y llega a Lima antes del 24, con su caja, papel de seda y tarjeta.', 'Ver regalos de Navidad', 'juego', 'Escríbenos', 'whatsapp', '', '{dias_navidad}', 'DÍAS PARA NAVIDAD', 'ninguno'],
    [3, true, 'coral', 'JUEGO · LA SANGUCHERÍA', '¿Qué se le ofrece?', 'Sánguches de fieltro para armar capa por capa y servir.', 'Pedir la Sanguchería · {precio:kit-sangucheria}', 'kit-sangucheria', 'Ver la tienda', 'tienda', '', '{precio:kit-sangucheria}', 'DESDE 3 AÑOS', 'ninguno']
  ];
  sh.getRange(1, 1, 1, SLIDES_HEAD.length).setValues([SLIDES_HEAD]).setFontWeight('bold');
  sh.getRange(2, 1, rows.length, SLIDES_HEAD.length).setValues(rows);
  sh.getRange(2, SLIDES_HEAD.indexOf('publicado') + 1, 50, 1).insertCheckboxes();
  listColumn_(sh, SLIDES_HEAD, 'color', COLORS);
  listColumn_(sh, SLIDES_HEAD, 'accesorio', ACCESSORIES);
  sh.setFrozenRows(1);
  return sh;
}

// Agrega solo las claves que falten, así una versión nueva suma ajustes sin tocar lo que la dueña ya escribió.
function setupSettings_(ss) {
  const sh = ss.getSheetByName(SETTINGS_SHEET) || ss.insertSheet(SETTINGS_SHEET);
  if (sh.getLastRow() < 1) {
    sh.getRange(1, 1, 1, 3).setValues([['clave', 'valor', 'ayuda']]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  const have = readRows_(SETTINGS_SHEET).map(r => plain_(r.clave));
  const missing = SETTINGS.filter(s => have.indexOf(s[0]) < 0);
  if (missing.length) sh.getRange(sh.getLastRow() + 1, 1, missing.length, 3).setValues(missing);
  return sh;
}

function setupOrders_(ss) {
  const sh = ss.insertSheet(ORDERS_SHEET);
  sh.getRange(1, 1, 1, ORDERS_HEAD.length).setValues([ORDERS_HEAD]).setFontWeight('bold');
  // Lo que escribe el público queda como texto: "15/11" no se vuelve fecha ni "1e5" número.
  ['nombre', 'distrito', 'para', 'productos', 'nota'].forEach(h =>
    sh.getRange(2, ORDERS_HEAD.indexOf(h) + 1, 2000, 1).setNumberFormat('@'));
  listColumn_(sh, ORDERS_HEAD, 'estado', ORDER_STATES, 2000);
  sh.setFrozenRows(1);
  return sh;
}

// Una hoja hecha con una versión anterior recibe al final las columnas que le falten (con sus casillas).
function addColumns_(sh, head) {
  const have = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(h => plain_(h).replace(/\s+/g, '_'));
  head.filter(h => have.indexOf(h) < 0).forEach(h => {
    const col = sh.getLastColumn() + 1;
    sh.getRange(1, col).setValue(h).setFontWeight('bold');
    if (CATALOG_CHECKS.indexOf(h) >= 0) sh.getRange(2, col, 200, 1).insertCheckboxes();
  });
}

// ---------- Panel (menú Lindi Tienda → Abrir panel) ----------
// Solo lo llama Panel.html dentro de la hoja (google.script.run), con la cuenta de Lindi.
// La web pública no puede llamarlas: doGet responde JSON y nunca sirve el panel.

function abrirPanel() {
  const html = HtmlService.createHtmlOutputFromFile('Panel').setWidth(1180).setHeight(760);
  SpreadsheetApp.getUi().showModelessDialog(html, 'Panel Lindi');
}

// Todo lo que el panel muestra. Sin fechas sueltas: google.script.run no puede devolver objetos Date.
function panelDatos() {
  const products = readRows_(CATALOG_SHEET).filter(r => text_(r.id) || text_(r.nombre)).map(r => {
    const p = {};
    CATALOG_HEAD.forEach(h => { p[h] = CATALOG_CHECKS.indexOf(h) >= 0 ? isYes_(r[h]) : text_(r[h]); });
    p.complementos = splitLinks_(r.complementos);
    p.vista = photoUrl_(r.foto);
    return p;
  });
  const values = {};
  readRows_(SETTINGS_SHEET).forEach(r => {
    const v = r.valor;
    values[plain_(r.clave)] = v && typeof v.getTime === 'function' ? Utilities.formatDate(v, 'America/Lima', 'yyyy-MM-dd') : text_(v);
  });
  const settings = SETTINGS.map(s => ({ clave: s[0], ayuda: s[2], valor: s[0] in values ? values[s[0]] : '' }));
  const orders = readRows_(ORDERS_SHEET).filter(r => text_(r.codigo)).map(r => ({
    codigo: text_(r.codigo),
    fecha: r.fecha && typeof r.fecha.getTime === 'function' ? Utilities.formatDate(r.fecha, 'America/Lima', 'dd/MM HH:mm') : text_(r.fecha),
    orden: r.fecha && typeof r.fecha.getTime === 'function' ? r.fecha.getTime() : 0,
    estado: plain_(r.estado), productos: text_(r.productos), total: text_(r.total), nota: text_(r.nota), nombre: text_(r.nombre), distrito: text_(r.distrito)
  })).sort((a, b) => b.orden - a.orden).slice(0, 60);
  return { products, settings, orders, scopes: SCOPES, badges: BADGES, states: ORDER_STATES, web: WEB_URL };
}

// Guarda un producto del panel. Sin id = producto nuevo (id sacado del nombre). Solo escribe esa fila
// y respeta las columnas que el panel no conoce.
function panelGuardarProducto(p) {
  const name = text_(p && p.nombre);
  if (!name) throw new Error('Escribe el nombre del producto.');
  const sh = SpreadsheetApp.getActive().getSheetByName(CATALOG_SHEET);
  addColumns_(sh, CATALOG_HEAD);
  const rows = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  const head = rows[0].map(h => plain_(h).replace(/\s+/g, '_'));
  const ids = rows.slice(1).map(r => text_(r[head.indexOf('id')]));
  let id = text_(p.id);
  let at = id ? ids.indexOf(id) + 2 : 0;
  if (at < 2) { id = uniqueId_(name, ids); at = rows.length + 1; }
  const price = Number(String(p.precio || '').replace(',', '.').replace(/[^\d.]/g, ''));
  const vals = { id: id, nombre: name, precio: price > 0 ? price : '', orden: Number(p.orden) || '' };
  ['ambito', 'coleccion', 'precio_texto', 'descripcion', 'para_jugar', 'edad', 'aviso', 'material', 'personalizar', 'sello', 'foto', 'fotos_extra']
    .forEach(h => { vals[h] = text_(p[h]); });
  CATALOG_CHECKS.forEach(h => { vals[h] = !!p[h]; });
  vals.complementos = (Array.isArray(p.complementos) ? p.complementos : []).map(text_).filter(x => x && x !== id).join(', ');
  const row = at <= rows.length ? rows[at - 1].slice() : head.map(() => '');
  head.forEach((h, i) => { if (h in vals) row[i] = vals[h]; });
  sh.getRange(at, 1, 1, head.length).setValues([row]);
  refrescarCatalogo();
  return { id: id, datos: panelDatos() };
}

function panelGuardarAjustes(map) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SETTINGS_SHEET);
  const rows = sh.getRange(1, 1, sh.getLastRow(), 2).getValues();
  rows.forEach((r, i) => {
    const key = plain_(r[0]);
    if (!i || SETTING_KEYS.indexOf(key) < 0 || !map || !(key in map)) return;
    let v = text_(map[key]);
    const d = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (d) v = new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]));
    const old = r[1] && typeof r[1].getTime === 'function' ? Utilities.formatDate(r[1], 'America/Lima', 'yyyy-MM-dd') : text_(r[1]);
    if (old !== text_(map[key])) sh.getRange(i + 1, 2).setValue(v);
  });
  refrescarCatalogo();
  return panelDatos();
}

function panelEstadoSolicitud(code, state) {
  if (ORDER_STATES.indexOf(state) < 0) throw new Error('Estado no válido.');
  const sh = SpreadsheetApp.getActive().getSheetByName(ORDERS_SHEET);
  const codes = sh.getRange(2, 1, Math.max(1, sh.getLastRow() - 1), 1).getValues().map(r => text_(r[0]));
  const i = codes.indexOf(text_(code));
  if (i < 0) throw new Error('No encontré esa solicitud.');
  sh.getRange(i + 2, ORDERS_HEAD.indexOf('estado') + 1).setValue(state);
  return panelDatos();
}

function listColumn_(sh, head, name, values, rows) {
  sh.getRange(2, head.indexOf(name) + 1, rows || 200, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(values, true).build());
}

// ---------- Utilidades ----------

function text_(v) {
  return v == null ? '' : String(v).trim();
}

// Sin tildes ni mayúsculas, para comparar encabezados y valores que la dueña escribe a mano.
function plain_(v) {
  return text_(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function isYes_(v) {
  return v === true || ['si', 'x', 'true', '1'].indexOf(plain_(v)) >= 0;
}

// Texto del público antes de guardarlo: una sola línea, con tope, y sin que la hoja lo lea como fórmula.
function clean_(v, max) {
  const s = text_(v).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
