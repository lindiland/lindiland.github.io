// Servidor (gas/Code.gs) sin Google: contenido editable, solicitudes, topes, antispam, vencidas y aislamiento de LINDI OS.
const fs = require('fs'), path = require('path');
const errs = []; const expect = require('./tools/expect')(errs);
const load = require('./gas-mock');
const root = path.resolve(__dirname, '..');
const DRIVE_ID = '1AbCdEfGhIjKlMnOpQrStUvWxYz012345';
const col = (sh, name) => sh.data[0].indexOf(name);
const setCell = (sh, id, name, v) => { sh.data.find(r => r[0] === id)[col(sh, name)] = v; };
const setSetting = (gas, key, v) => { gas.sheet('Ajustes').data.find(r => r[0] === key)[1] = v; };
const publishAll = gas => { const sh = gas.sheet('Catálogo'); sh.data.slice(1).forEach(r => { r[col(sh, 'publicado')] = true; }); gas.run('refrescarCatalogo'); };

// --- Aislamiento: el código no puede abrir otros archivos y pide solo el permiso de su hoja ---
const code = fs.readFileSync(path.join(root, 'gas', 'Code.gs'), 'utf8');
const live = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const banned = ['openById', 'openByUrl', 'DriveApp', 'UrlFetchApp', 'DocumentApp', 'GmailApp', 'MailApp'].filter(w => live.includes(w));
expect('Code.gs sin servicios que salgan de su hoja', banned, []);
expect('Code.gs con @OnlyCurrentDoc', /@OnlyCurrentDoc/.test(code), true);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'gas', 'appsscript.json'), 'utf8'));
expect('permisos exactos', manifest.oauthScopes.slice().sort(), [
  'https://www.googleapis.com/auth/script.container.ui',
  'https://www.googleapis.com/auth/script.scriptapp',
  'https://www.googleapis.com/auth/spreadsheets.currentonly'
]);
expect('web pública, ejecuta como Lindi', [manifest.webapp.access, manifest.webapp.executeAs], ['ANYONE_ANONYMOUS', 'USER_DEPLOYING']);

// --- Preparar hoja: pestañas, borradores sin publicar, activador una sola vez, ajustes sin pisar ---
let gas = load();
gas.run('prepararHoja');
setSetting(gas, 'medios_pago', 'Yape o Plin');
gas.sheet('Ajustes').data.splice(gas.sheet('Ajustes').data.findIndex(r => r[0] === 'tiktok'), 1);
gas.run('prepararHoja');
const cat = gas.sheet('Catálogo');
expect('pestañas', Object.keys(gas.sheets).sort(), ['Ajustes', 'Catálogo', 'Portada', 'Solicitudes']);
expect('5 borradores', cat.data.length - 1, 5);
expect('activador diario una sola vez', gas.triggers, ['marcarVencidas']);
expect('repetir no pisa ajustes', gas.sheet('Ajustes').data.find(r => r[0] === 'medios_pago')[1], 'Yape o Plin');
expect('repetir agrega el ajuste que faltaba', gas.sheet('Ajustes').data.filter(r => r[0] === 'tiktok').length, 1);
expect('ajustes sin duplicar', gas.sheet('Ajustes').data.length - 1, new Set(gas.sheet('Ajustes').data.slice(1).map(r => r[0])).size);
expect('estados como lista', gas.sheet('Solicitudes').validation[3], ['pendiente', 'pagado', 'entregado', 'vencida', 'cancelado']);
let c = gas.get();
expect('sin publicar no sale nada', c.items, []);
expect('portada de ejemplo', c.slides.map(s => s.title), ['Hoy abre la Pizzería.', 'Para ti es un juego. Para ellos, es un mundo entero.', '¿Qué se le ofrece?']);
expect('ajustes: solo claves conocidas', Object.keys(c.settings).every(k => /^[a-z_0-9]+$/.test(k)), true);
expect('acción desconocida', gas.get({ a: 'borrar' }).ok, false);

// --- Publicar y editar: lo que la dueña cambia en la hoja sale en la web ---
cat.data[0][col(cat, 'coleccion')] = 'Colección';
publishAll(gas);
setCell(cat, 'kit-pizzeria', 'foto', 'https://drive.google.com/file/d/' + DRIVE_ID + '/view?usp=sharing');
setCell(cat, 'kit-pizzeria', 'fotos_extra', DRIVE_ID + '\nhttps://drive.google.com/open?id=' + DRIVE_ID + ' javascript:alert(1)');
setCell(cat, 'kit-sushi', 'ambito', 'juego ');
setCell(cat, 'kit-sushi', 'orden', 0.5);
setCell(cat, 'lazos', 'foto', 'javascript:alert(1)');
setCell(cat, 'kit-pizzeria', 'precio', 149);
gas.run('onEdit', { range: { getSheet: () => ({ getName: () => 'Catálogo' }) } });
c = gas.get();
const pz = c.items.find(i => i.id === 'kit-pizzeria');
expect('publicados en orden', c.items.map(i => i.id), ['kit-sushi', 'kit-pizzeria', 'kit-sangucheria', 'dulces-pasteleria', 'lazos']);
expect('precio editado', pz.price, 149);
expect('colección con tilde en el encabezado', pz.collection, 'La Pizzería');
expect('foto de Drive a miniatura', pz.photo, 'https://drive.google.com/thumbnail?id=' + DRIVE_ID + '&sz=w1200');
expect('fotos extra (sin enlaces raros)', pz.photos.length, 2);
expect('enlace no https descartado', c.items.find(i => i.id === 'lazos').photo, '');
expect('sin precio = por confirmar', [c.items.find(i => i.id === 'lazos').price, c.items.find(i => i.id === 'dulces-pasteleria').priceText], [0, 'desde S/25']);
expect('campos de la ficha', [pz.play, pz.age, pz.badge, pz.featured, pz.customize], ['cocinar, servir porciones y tomar pedidos', 'Desde 3 años', 'FAVORITO', true, 'Los 3 toppings que eliges']);
expect('ámbito normalizado', c.items[0].scope, 'Juego');
expect('contenido en caché', !!gas.cache.contenido, true);
setCell(cat, 'kit-sushi', 'nombre', 'Kit El Sushi bar 2');
expect('sin onEdit sigue la caché', gas.get().items[0].name, 'Kit El Sushi bar');
gas.run('onEdit', { range: { getSheet: () => ({ getName: () => 'Ajustes' }) } });
expect('editar Ajustes también refresca', gas.get().items[0].name, 'Kit El Sushi bar 2');

// Ajustes: número limpio, fechas en español, fotos convertidas, usuario sin @.
setSetting(gas, 'whatsapp', '+51 987 654 321');
setSetting(gas, 'navidad_fecha_limite', new Date(2026, 11, 15));
setSetting(gas, 'fotos_redes', DRIVE_ID + '\n' + DRIVE_ID);
setSetting(gas, 'instagram', '@lindi.pe');
gas.sheet('Ajustes').data.push(['clave_secreta', 'no sale', '']);
gas.run('refrescarCatalogo');
const st = gas.get().settings;
expect('número sin espacios', st.whatsapp, '51987654321');
expect('fecha en español', st.navidad_fecha_limite, '15 de diciembre');
expect('fecha ISO para saber si pasó', st.navidad_fecha_limite_iso, '2026-12-15');
expect('fotos de redes', st.fotos_redes.length, 2);
expect('usuario sin @', st.instagram, 'lindi.pe');
expect('claves desconocidas no salen', 'clave_secreta' in st, false);

// Portada: color y accesorio de lista, sin título no sale.
const sl = gas.sheet('Portada');
sl.data[1][col(sl, 'color')] = 'Morado'; sl.data[3][col(sl, 'titulo')] = '';
gas.run('refrescarCatalogo');
const slides = gas.get().slides;
expect('portada: color desconocido → amarillo', slides[0].color, 'amarillo');
expect('portada: sin título no sale', slides.length, 2);
expect('portada: accesorio', slides[0].accessory, 'chef');

// --- Solicitudes ---
const good = { name: 'Ana', district: 'Miraflores', when: '15 nov', note: 'Para regalo', items: [{ id: 'kit-pizzeria', qty: 2, choice: 'piña, jamón, champiñón', price: 1 }, { id: 'kit-sangucheria', qty: 1 }] };
let r = gas.post(good);
expect('pedido válido', [r.ok, /^[A-HJ-NP-Z2-9]{5}$/.test(r.code), r.total, r.pending], [true, true, 2 * 149 + 99, false]);
expect('precios del catálogo, no del navegador', r.items.map(i => i.price), [149, 99]);
const ord = gas.sheet('Solicitudes');
const row = ord.data[1];
expect('fila guardada', [row[0], row[2], row[3], row[4], row[5], row[7], row[8]], [r.code, 'pendiente', 'Ana', 'Miraflores', '15 nov', 397, 'Para regalo']);
expect('detalle con elección', row[6], '2 × Kit La Pizzería (piña, jamón, champiñón)\n1 × Kit La Sanguchería');
expect('fecha guardada', typeof row[1].getTime, 'function');
r = gas.post(Object.assign({}, good, { items: [{ id: 'lazos', qty: 3 }, { id: 'kit-sangucheria', qty: 1 }] }));
expect('precio por confirmar', [r.total, r.pending], [99, true]);
expect('fila con por confirmar', [ord.data[2][6], ord.data[2][7]], ['3 × Lazos (precio por confirmar)\n1 × Kit La Sanguchería', '99 + por confirmar']);

const before = ord.data.length;
expect('trampa: responde ok', gas.post(Object.assign({}, good, { web: 'http://spam' })), { ok: true, code: '' });
expect('trampa: no guarda', ord.data.length, before);
const bad = [
  ['pedido vacío', Object.assign({}, good, { items: [] })],
  ['producto inexistente', Object.assign({}, good, { items: [{ id: 'kit-falso', qty: 1 }] })],
  ['producto sin publicar', (() => { setCell(cat, 'kit-sushi', 'publicado', false); gas.run('refrescarCatalogo'); return Object.assign({}, good, { items: [{ id: 'kit-sushi', qty: 1 }] }); })()],
  ['cantidad 0', Object.assign({}, good, { items: [{ id: 'kit-sangucheria', qty: 0 }] })],
  ['cantidad 11', Object.assign({}, good, { items: [{ id: 'kit-sangucheria', qty: 11 }] })],
  ['cantidad decimal', Object.assign({}, good, { items: [{ id: 'kit-sangucheria', qty: 1.5 }] })],
  ['21 líneas', Object.assign({}, good, { items: Array.from({ length: 21 }, () => ({ id: 'kit-sangucheria', qty: 1 })) })]
];
bad.forEach(([name, body]) => expect('rechaza ' + name, gas.post(body).ok, false));
['constructor', '__proto__', 'toString'].forEach(id =>
  expect('rechaza id ' + id, gas.post(Object.assign({}, good, { items: [{ id, qty: 1 }] })).ok, false));
expect('JSON roto', gas.post('{no es json').ok, false);
expect('rechazos no guardan', ord.data.length, before);

// La web ya no pide nombre ni distrito: un pedido solo con productos se anota.
const bare = gas.post({ items: [{ id: 'kit-sangucheria', qty: 1 }] });
expect('sin datos personales se anota', [bare.ok, ord.data[ord.data.length - 1][3], ord.data[ord.data.length - 1][4]], [true, '', '']);
// Texto que la hoja leería como fórmula se guarda como texto.
gas.post(Object.assign({}, good, { name: '=HYPERLINK("http://x","clic")', note: 'línea1\nlínea2' }));
const last = ord.data[ord.data.length - 1];
expect('fórmula neutralizada', last[3].charAt(0), "'");
expect('nota en una línea', last[8], 'línea1 línea2');
gas.post(Object.assign({}, good, { name: 'x'.repeat(500) }));
expect('nombre recortado', ord.data[ord.data.length - 1][3].length, 60);
expect('columnas del público como texto', Object.keys(ord.formats).map(Number).sort((a, b) => a - b), [4, 5, 6, 7, 9]);

// Códigos al azar y sin repetir (no revelan cuántos pedidos hay).
{
  const g = load(); g.run('prepararHoja'); publishAll(g);
  const codes = [];
  for (let i = 0; i < 25; i++) codes.push(g.post({ items: [{ id: 'kit-pizzeria', qty: 1 }] }).code);
  expect('códigos distintos', new Set(codes).size, 25);
  expect('códigos sin LND ni números seguidos', codes.some(c => /LND|^0+\d$/.test(c)), false);
}

// Topes por minuto y por día.
gas = load(); gas.run('prepararHoja'); publishAll(gas);
const one = { name: 'B', district: 'Lince', items: [{ id: 'kit-pizzeria', qty: 1 }] };
let oks = 0;
for (let i = 0; i < 31; i++) if (gas.post(one).ok) oks++;
expect('máximo 30 por minuto', oks, 30);
expect('tope: la web igual abre WhatsApp', gas.post(one).retry, true);
expect('dato mal: sin retry', !!gas.post(Object.assign({}, one, { items: [] })).retry, false);
gas = load(); gas.run('prepararHoja'); publishAll(gas);
gas.setDay('2026-11-01');
oks = 0;
for (let i = 0; i < 201; i++) { Object.keys(gas.cache).filter(k => k.indexOf('rate:') === 0).forEach(k => delete gas.cache[k]); if (gas.post(one).ok) oks++; }
expect('máximo 200 por día', oks, 200);
gas.setDay('2026-11-02');
expect('al día siguiente se reinicia', gas.post(one).ok, true);

// Contenido que no cabe en la caché se sirve igual.
const put = gas.ctx.CacheService.getScriptCache;
gas.ctx.CacheService.getScriptCache = () => Object.assign(put(), { put() { throw new Error('Argument too large'); } });
gas.run('refrescarCatalogo');
expect('contenido sin caché', gas.get().items.length, 5);
gas.ctx.CacheService.getScriptCache = put;

// --- Vencidas: solo "pendiente" con más de 7 días; solo toca la columna estado ---
const sol = gas.sheet('Solicitudes');
const day = 86400000;
sol.data.length = 1;
sol.data.push(['LND-1', new Date(Date.now() - 8 * day), 'pendiente', 'A']);
sol.data.push(['LND-2', new Date(Date.now() - 2 * day), 'pendiente', 'B']);
sol.data.push(['LND-3', new Date(Date.now() - 10 * day), 'pagado', 'C']);
sol.data.push(['LND-4', new Date(Date.now() - 9 * day), 'Pendiente', 'D']);
expect('marca 2 vencidas', gas.run('marcarVencidas'), 2);
expect('estados', sol.data.slice(1).map(r => r[2]), ['vencida', 'pendiente', 'pagado', 'vencida']);
expect('no toca otras columnas', sol.data[1][3], 'A');

// --- Hoja de una versión anterior: Preparar hoja agrega las columnas nuevas al final, sin mover las otras ---
{
  const g = load(); g.run('prepararHoja');
  const sh = g.sheet('Catálogo');
  sh.data.forEach(r => { r.length = 18; });
  g.run('prepararHoja');
  expect('columnas nuevas al final', sh.data[0].slice(16), ['publicado', 'orden', 'complementos', 'solo_sugerencia']);
  g.run('prepararHoja');
  expect('sin columnas duplicadas', sh.data[0].length, 20);
}

// --- Complementos y "solo como sugerencia" ---
{
  const g = load(); g.run('prepararHoja'); publishAll(g);
  const sh = g.sheet('Catálogo');
  setCell(sh, 'kit-pizzeria', 'complementos', 'lazos, kit-sushi\nkit-falso');
  setCell(sh, 'lazos', 'solo_sugerencia', true);
  g.run('refrescarCatalogo');
  const items = g.get().items;
  expect('complementos como lista', items.find(i => i.id === 'kit-pizzeria').extras, ['lazos', 'kit-sushi', 'kit-falso']);
  expect('solo como sugerencia', [items.find(i => i.id === 'lazos').onlyExtra, items.find(i => i.id === 'kit-sushi').onlyExtra], [true, false]);
  expect('un complemento se puede pedir', g.post({ items: [{ id: 'lazos', qty: 1 }] }).ok, true);
}

// --- id automático: un producto escrito a mano recibe su id con el nombre ---
{
  const g = load(); g.run('prepararHoja');
  const sh = g.sheet('Catálogo');
  const blank = () => sh.data[0].map(() => '');
  const a = blank(); a[1] = 'Mandil + gorro de Chef'; sh.data.push(a);
  const b = blank(); b[1] = 'Kit La Pizzería'; sh.data.push(b);
  const c2 = blank(); c2[1] = 'Kit La Pizzería'; sh.data.push(c2);
  g.run('onEdit', { range: { getSheet: () => ({ getName: () => 'Catálogo' }) } });
  expect('id con el nombre', a[0], 'mandil-gorro-de-chef');
  expect('id sin repetir', [b[0], c2[0]], ['kit-la-pizzeria', 'kit-la-pizzeria-2']);
}

// --- Panel: leer, crear, editar, ajustes y estado de solicitudes ---
{
  const g = load(); g.run('prepararHoja');
  const sh = g.sheet('Catálogo');
  let d = g.run('panelDatos');
  expect('panel: productos (borradores también)', d.products.length, 5);
  expect('panel: casillas como sí/no', [d.products[0].publicado, d.products[0].destacado], [false, true]);
  // google.script.run no puede devolver objetos Date: el panel no recibiría nada.
  const hasDate = v => v && typeof v === 'object' && (typeof v.getTime === 'function' || Object.values(v).some(hasDate));
  publishAll(g); g.post({ items: [{ id: 'lazos', qty: 1 }] });
  g.sheet('Ajustes').data.find(x => x[0] === 'navidad_fecha_limite')[1] = new Date(2026, 11, 15);
  d = g.run('panelDatos');
  expect('panel: sin objetos Date', hasDate(d), false);
  expect('panel: fecha para el calendario', d.settings.find(s => s.clave === 'navidad_fecha_limite').valor.length, 10);
  sh.data.slice(1).forEach(x => { x[col(sh, 'publicado')] = false; });
  const neu = { nombre: 'Toppings extra', precio: '25', ambito: 'Juego', publicado: true, solo_sugerencia: true, complementos: [] };
  let r = g.run('panelGuardarProducto', neu);
  expect('panel: nuevo con id del nombre', r.id, 'toppings-extra');
  expect('panel: fila nueva', sh.data.length - 1, 6);
  const pz = r.datos.products.find(p => p.id === 'kit-pizzeria');
  pz.precio = '149'; pz.publicado = true; pz.complementos = ['toppings-extra', 'kit-pizzeria'];
  sh.data[1].push('columna que el panel no conoce');
  r = g.run('panelGuardarProducto', pz);
  expect('panel: edita la misma fila', [sh.data.length - 1, r.id], [6, 'kit-pizzeria']);
  expect('panel: guarda precio, casilla y complementos (sin sí mismo)', [sh.data[1][col(sh, 'precio')], sh.data[1][col(sh, 'publicado')], sh.data[1][col(sh, 'complementos')]], [149, true, 'toppings-extra']);
  expect('panel: no borra lo que no conoce', sh.data[1][sh.data[1].length - 1], 'columna que el panel no conoce');
  expect('panel: la web ve el cambio', g.get().items.map(i => i.id), ['kit-pizzeria', 'toppings-extra']);
  r = g.run('panelGuardarProducto', Object.assign({}, neu));
  expect('panel: mismo nombre, otro id', r.id, 'toppings-extra-2');
  let threw = false; try { g.run('panelGuardarProducto', { nombre: '  ' }); } catch (e) { threw = true; }
  expect('panel: sin nombre no guarda', threw, true);

  d = g.run('panelGuardarAjustes', { whatsapp: '51911222333', navidad_fecha_limite: '2026-12-15', clave_rara: 'x' });
  const aj = g.sheet('Ajustes').data;
  expect('panel: ajuste guardado', aj.find(x => x[0] === 'whatsapp')[1], '51911222333');
  expect('panel: fecha como fecha', typeof aj.find(x => x[0] === 'navidad_fecha_limite')[1].getTime, 'function');
  expect('panel: claves desconocidas no se escriben', aj.some(x => x[0] === 'clave_rara'), false);

  // Portada desde el panel: edita su misma fila, crea al final, valida color y accesorio.
  const sl = g.sheet('Portada');
  d = g.run('panelDatos');
  expect('panel: diapositivas con su fila', d.slides.map(s => s.fila), [2, 3, 4]);
  const first = Object.assign({}, d.slides[0], { titulo: 'Hoy abre la Pastelería.', color: 'Morado', accesorio: 'corona', publicado: false });
  r = g.run('panelGuardarDiapositiva', first);
  expect('panel: diapositiva editada en su fila', [r.fila, sl.data.length - 1, sl.data[1][col(sl, 'titulo')]], [2, 3, 'Hoy abre la Pastelería.']);
  expect('panel: color y accesorio de lista', [sl.data[1][col(sl, 'color')], sl.data[1][col(sl, 'accesorio')], sl.data[1][col(sl, 'publicado')]], ['amarillo', 'ninguno', false]);
  r = g.run('panelGuardarDiapositiva', { titulo: 'Nueva', color: 'verde', publicado: true, orden: '4', boton: 'Ver', destino: 'tienda' });
  expect('panel: diapositiva nueva al final', [r.fila, sl.data.length - 1], [5, 4]);
  expect('panel: la web ve la portada', g.get().slides.map(s => s.title), ['Para ti es un juego. Para ellos, es un mundo entero.', '¿Qué se le ofrece?', 'Nueva']);
  threw = false; try { g.run('panelGuardarDiapositiva', { titulo: '' }); } catch (e) { threw = true; }
  expect('panel: diapositiva sin título no', threw, true);

  const code = g.post({ items: [{ id: 'kit-pizzeria', qty: 1 }] }).code;
  const find = x => x.orders.find(o => o.codigo === code);
  d = g.run('panelDatos');
  expect('panel: pedido visible', find(d).estado, 'pendiente');
  d = g.run('panelEstadoSolicitud', code, 'pagado');
  expect('panel: marca pagado', find(d).estado, 'pagado');
  threw = false; try { g.run('panelEstadoSolicitud', code, 'borrado'); } catch (e) { threw = true; }
  expect('panel: estado inventado no', threw, true);
}

// --- Menú ---
gas.run('onOpen');
expect('menú de la hoja', gas.log.menus[0].items, ['abrirPanel', 'prepararHoja', 'marcarVencidas', 'refrescarCatalogo']);

console.log('ERR', errs);
process.exit(errs.length ? 1 : 0);
