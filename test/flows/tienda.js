// Web: contenido desde la hoja, portada, tienda, ficha, pedido por WhatsApp (con y sin respuesta de la hoja),
// errores, fondo y marca. El Apps Script y wa.me se simulan con page.route; solo salen las fuentes de Google.
const { chromium } = require('playwright');
const path = require('path'), os = require('os');
const API = 'https://script.google.com/macros/s/TEST/exec';
const WA = '51999888777';
const base = { scope: 'Juego', collection: '', priceText: '', description: '', play: '', age: '', warning: '', material: '', customize: '', badge: '', featured: true, photo: '', photos: [] };
const ITEMS = [
  Object.assign({}, base, { id: 'kit-pizzeria', name: 'Kit La Pizzería', collection: 'La Pizzería', price: 139, description: '4 porciones.', play: 'cocinar y servir', age: 'Desde 3 años', warning: 'Contiene piezas pequeñas.', material: 'Fieltro', customize: 'Los 3 toppings que eliges', badge: 'FAVORITO', photo: 'https://img.test/pizza.jpg', photos: ['https://img.test/2.jpg'] }),
  Object.assign({}, base, { id: 'kit-sushi', name: 'Kit El Sushi bar', collection: 'El Sushi bar', price: 89, badge: 'NUEVO' }),
  Object.assign({}, base, { id: 'lazos', name: 'Lazos', scope: 'Accesorios', price: 0, featured: false })
];
const SLIDES = [
  { color: 'amarillo', kicker: 'JUEGO · LA PIZZERÍA', title: 'Hoy abre la Pizzería.', text: 'Tu hijo amasa.', cta: 'Pedir la Pizzería · {precio:kit-pizzeria}', to: 'kit-pizzeria', cta2: 'Ver todo Juego', to2: 'juego', photo: '', sticker: '{precio:kit-pizzeria}', stickerText: 'DESDE 3 AÑOS', accessory: 'chef' },
  { color: 'azul', kicker: 'NAVIDAD', title: 'Para ti es un juego.', text: 'Pide hasta el {fecha_limite}.', cta: 'Ver regalos', to: 'juego', cta2: '', to2: '', photo: '', sticker: '{dias_navidad}', stickerText: 'DÍAS', accessory: '' }
];
const SETTINGS = { whatsapp: WA, fondo: 'blanco', aviso_1: 'Envíos en Lima: {envio_lima}', aviso_2: 'Pides por WhatsApp y pagas al confirmar', aviso_3: '', navidad_fecha_limite: '', medios_pago: 'Yape', entrega_texto: 'Llega en su caja.', regalo_texto: 'Lo escribimos a mano.', instagram: 'lindi.pe', tiktok: '', envio_lima: '', fotos_redes: [] };

(async () => {
  const b = await chromium.launch(); const errs = []; const expect = require('../tools/expect')(errs);
  const shots = os.tmpdir();

  async function open(opts) {
    opts = opts || {};
    const ctx = await b.newContext({ viewport: opts.viewport || { width: 1200, height: 900 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(cfg => { window.LINDI_TEST_CONFIG = cfg; }, opts.config || { api: API });
    const posts = [];
    await p.route('https://img.test/**', r => r.abort());
    await p.route(API + '**', async r => {
      if (r.request().method() === 'GET') {
        if (opts.getFail) return r.abort();
        return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, items: opts.items || ITEMS, slides: opts.slides || SLIDES, settings: Object.assign({}, SETTINGS, opts.settings || {}) }) });
      }
      posts.push({ type: r.request().headers()['content-type'], body: JSON.parse(r.request().postData()) });
      if (opts.postFail) return r.abort();
      if (opts.postReply) return r.fulfill({ contentType: 'application/json', body: JSON.stringify(opts.postReply) });
      const body = posts[posts.length - 1].body;
      const items = body.items.map(i => { const c = ITEMS.find(x => x.id === i.id); return { id: c.id, name: c.name, qty: i.qty, price: c.price }; });
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, code: 'K7P2X', total: items.reduce((s, i) => s + i.qty * i.price, 0), pending: items.some(i => !i.price), items }) });
    });
    await p.route('https://wa.me/**', r => r.fulfill({ contentType: 'text/html', body: '<p>wa</p>' }));
    await p.goto('http://localhost:8767/' + (opts.query || '') + (opts.hash || ''));
    await p.waitForTimeout(600);
    return { p, ctx, posts };
  }
  const waText = url => decodeURIComponent(new URL(url).searchParams.get('text') || '');

  // --- Portada en celular y computadora ---
  for (const [w, h, tag] of [[1200, 900, 'pc'], [375, 812, 'cel']]) {
    const { p, ctx } = await open({ viewport: { width: w, height: h } });
    expect(tag + ': sin desborde', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
    expect(tag + ': portada con precio de la hoja', await p.textContent('#hero .cta1'), 'Pedir la Pizzería · S/139');
    expect(tag + ': diapositiva con token vacío no sale', await p.$$eval('#hero [data-act="slide"]', xs => xs.length), 0);
    expect(tag + ': aviso con token vacío no sale', await p.textContent('#ann'), 'Pides por WhatsApp y pagas al confirmar');
    expect(tag + ': lo más pedido = destacados', await p.$$eval('.grid .card h3', xs => xs.map(x => x.textContent)), ['Kit La Pizzería', 'Kit El Sushi bar']);
    expect(tag + ': sellos', await p.$$eval('.grid .badge', xs => xs.map(x => x.textContent)), ['FAVORITO', 'NUEVO']);
    expect(tag + ': bloques solo de ámbitos con productos', await p.$$eval('.block .kicker', xs => xs.map(x => x.textContent)), ['Accesorios', 'Juego']);
    expect(tag + ': estado de ámbitos', await p.$$eval('.amb small', xs => xs.map(x => x.textContent)), ['1 PRODUCTO', '2 PRODUCTOS', 'PRONTO', 'PRONTO']);
    expect(tag + ': sin Navidad sin fecha', await p.$$eval('.ed.blue', xs => xs.length), 0);
    expect(tag + ': regalo', await p.isVisible('.band'), true);
    expect(tag + ': botones de 44 px', await p.$$eval('button, .btn, .tab, .add', xs => xs.filter(x => x.offsetParent && x.getBoundingClientRect().height < 44 && !x.closest('.dots') && !x.closest('.ann')).map(x => x.textContent.trim())), []);
    if (tag === 'cel') {
      expect('cel: menú cerrado', await p.isVisible('#links'), false);
      await p.click('#menu-btn');
      expect('cel: menú abierto', await p.isVisible('#links a[href="#/tienda"]'), true);
      await p.click('#links a[href="#/tienda"]'); await p.waitForTimeout(300);
      expect('cel: menú se cierra al elegir', await p.isVisible('#links'), false);
      expect('cel: tienda sin desborde', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
    }
    await p.screenshot({ path: path.join(shots, 'lindi-web-' + tag + '.png'), fullPage: true });
    await ctx.close();
  }

  // --- Con fecha de Navidad: diapositiva, cuenta regresiva y aviso aparecen ---
  {
    const { p, ctx } = await open({ settings: { navidad_fecha_limite: '15 de diciembre', navidad_texto: 'Con caja.', envio_lima: '2 días' } });
    expect('navidad: 2 diapositivas', await p.$$eval('#hero [data-act="slide"]', xs => xs.length), 2);
    expect('navidad: bloque azul', await p.isVisible('.ed.blue'), true);
    expect('aviso con envío', await p.textContent('#ann span'), 'Envíos en Lima: 2 días');
    await p.click('#hero [data-act="slide"][data-i="1"]');
    expect('navidad: texto con fecha', await p.textContent('#hero .sub'), 'Pide hasta el 15 de diciembre.');
    expect('navidad: sticker con días', /^\d+$/.test(await p.textContent('#hero .sticker b')), true);
    await ctx.close();
  }

  // --- Sin productos publicados: el bloque de color de arriba igual sale (portada de respaldo) ---
  {
    const { p, ctx } = await open({ items: [], settings: { novedad_titulo: 'Los dulces', novedad_destino: 'dulces-pasteleria' } });
    expect('respaldo: bloque de color', await p.textContent('#hero h1'), 'Bienvenidos a Lindiland.');
    expect('respaldo: sin bienvenida repetida', await p.$$eval('.welcome', xs => xs.length), 0);
    expect('novedad de producto sin publicar no sale', await p.$$eval('.ed.news', xs => xs.length), 0);
    await ctx.close();
  }

  // --- Fondo: ajuste de la hoja y vista previa por URL ---
  {
    let o = await open({ settings: { fondo: 'crema' } });
    expect('fondo crema desde la hoja', await o.p.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(255, 248, 236)');
    await o.ctx.close();
    o = await open({ query: '?fondo=blanco', settings: { fondo: 'crema' } });
    expect('vista previa ?fondo=blanco', await o.p.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(255, 255, 255)');
    await o.ctx.close();
    o = await open({ settings: { fondo: '' } });
    expect('sin ajuste: crema por defecto', await o.p.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(255, 248, 236)');
    await o.ctx.close();
  }

  // --- Marca: frases fijas, palabras prohibidas ausentes (manual, reglas 3 y 7) ---
  {
    const { p, ctx } = await open({ hash: '#/carta' });
    await p.waitForTimeout(300);
    const text = await p.evaluate(() => document.body.innerText);
    expect('carta abierta desde #/carta', await p.$eval('.letter .body', x => x.classList.contains('open')), true);
    expect('manifiesto completo', text.includes('Así que, si te sirven una pizza de fieltro, pruébala despacio.'), true);
    await p.goto('http://localhost:8767/#/'); await p.waitForTimeout(400);
    const home = await p.evaluate(() => document.body.innerText);
    expect('eslogan', home.includes('todo lo lindo de la infancia'), true);
    expect('filosofía', home.includes('Diseñamos las pequeñas cosas que hacen grande su mundo.'), true);
    expect('sin palabras prohibidas', ['magia', 'mágic', 'Montessori', 'pedagógico', 'estimulación', 'motricidad', 'nuestro taller', 'Lindi Kids', 'premium', '[fecha]', 'foto real'].filter(w => (home + text).toLowerCase().includes(w.toLowerCase())), []);
    await ctx.close();
  }

  // --- Tienda y ámbito vacío ---
  {
    const { p, ctx } = await open({ hash: '#/tienda/accesorios' });
    expect('filtro por ámbito', await p.$$eval('.card h3', xs => xs.map(x => x.textContent)), ['Lazos']);
    expect('sin precio: sticker', await p.textContent('.card .sticker'), 'Por confirmar');
    await p.goto('http://localhost:8767/#/tienda/espacios'); await p.waitForTimeout(300);
    expect('ámbito vacío', await p.textContent('.empty-amb b'), 'Este rincón todavía se está armando.');
    await ctx.close();
  }

  // --- Pedido completo sin formulario: tarjeta, cantidades, elección, persistencia, un toque a WhatsApp ---
  {
    const { p, ctx, posts } = await open();
    await p.click('.card:has-text("Kit El Sushi bar") [data-act="add"]');
    await p.click('.card:has-text("Kit El Sushi bar") [data-act="add"]');
    expect('botón confirma', await p.textContent('.card:has-text("Kit El Sushi bar") [data-act="add"]'), '✓ En tu pedido · 2');
    expect('burbuja con total', await p.textContent('#bubble .sum b'), 'S/178');
    await p.goto('http://localhost:8767/#/p/kit-pizzeria'); await p.waitForTimeout(300);
    expect('ficha', await p.textContent('.info h1'), 'Kit La Pizzería');
    expect('foto rota → rayitas', await p.$$eval('.gallery .main img', xs => xs.length), 0);
    expect('para jugar', await p.textContent('.playbox'), 'Para jugar a cocinar y servir.');
    await p.click('[data-act="pdPlus"]');
    expect('total en el botón', await p.textContent('#pd-total'), 'S/278');
    await p.fill('#pd-note', 'piña, jamón y champiñón');
    await p.click('[data-act="pdAdd"]');
    await p.click('#bubble .sum'); await p.waitForTimeout(300);
    expect('Tu pedido', await p.evaluate(() => location.hash), '#/pedido');
    expect('sin formulario de datos', await p.$$eval('input[name="name"], input[name="district"], form', xs => xs.length), 0);
    expect('burbuja oculta en Tu pedido', await p.isHidden('#bubble'), true);
    expect('total del pedido', await p.textContent('#order-total'), 'S/456');
    await p.click('.line[data-id="kit-sushi"] [data-act="minus"]');
    expect('quita una unidad', await p.textContent('#order-total'), 'S/367');
    expect('solo pide elección donde hace falta', await p.$$eval('[data-choice]', xs => xs.map(x => x.dataset.choice)), ['kit-pizzeria']);
    await p.reload(); await p.waitForTimeout(600);
    expect('el pedido sobrevive a recargar', await p.inputValue('[data-choice="kit-pizzeria"]'), 'piña, jamón y champiñón');
    await Promise.all([p.waitForURL('https://wa.me/**'), p.click('#send-btn')]);
    expect('una solicitud', posts.length, 1);
    expect('texto plano (sin consulta CORS)', posts[0].type, 'text/plain;charset=utf-8');
    expect('lo que se envía (sin datos personales)', posts[0].body, { items: [{ id: 'kit-sushi', qty: 1, choice: '' }, { id: 'kit-pizzeria', qty: 2, choice: 'piña, jamón y champiñón' }] });
    expect('número de WhatsApp de la hoja', new URL(p.url()).pathname, '/' + WA);
    expect('mensaje de WhatsApp', waText(p.url()), [
      '¡Hola, Lindi! Quiero hacer este pedido:', '',
      '• 1 × Kit El Sushi bar · S/89',
      '• 2 × Kit La Pizzería · S/278', '   piña, jamón y champiñón', '',
      'Total: S/367', 'Ref. K7P2X', '', 'Mi distrito: '
    ].join('\n'));
    await p.goBack(); await p.waitForTimeout(600);
    expect('gracias sin código a la vista', [await p.isVisible('.done h1'), (await p.textContent('.done')).includes('K7P2X')], [true, false]);
    expect('pedido vacío tras enviar', await p.evaluate(() => JSON.parse(localStorage.getItem('lindi-web:pedido') || '[]').length), 0);
    expect('volver a abrir WhatsApp', (await p.getAttribute('#wa-again', 'href')).indexOf('https://wa.me/' + WA), 0);
    await ctx.close();
  }

  // --- Un toque desde la burbuja y desde la ficha ---
  {
    const { p, ctx, posts } = await open();
    await p.click('.card:has-text("Kit El Sushi bar") [data-act="add"]');
    await Promise.all([p.waitForURL('https://wa.me/**'), p.click('#bubble [data-act="send"]')]);
    expect('burbuja: envía directo', [posts.length, waText(p.url()).includes('• 1 × Kit El Sushi bar · S/89')], [1, true]);
    await ctx.close();
    const o = await open({ hash: '#/p/kit-pizzeria' });
    await Promise.all([o.p.waitForURL('https://wa.me/**'), o.p.click('[data-act="pdBuy"]')]);
    expect('ficha: Pedir por WhatsApp envía directo', waText(o.p.url()).includes('• 1 × Kit La Pizzería · S/139'), true);
    await o.ctx.close();
  }

  // --- Precio por confirmar y hoja que no responde: igual se abre WhatsApp, sin código ---
  {
    const { p, ctx } = await open({ postFail: true, hash: '#/tienda/accesorios' });
    await p.click('.card:has-text("Lazos") [data-act="add"]');
    expect('burbuja por confirmar', await p.textContent('#bubble .sum b'), 'Por confirmar');
    await p.goto('http://localhost:8767/#/pedido'); await p.waitForTimeout(400);
    await Promise.all([p.waitForURL('https://wa.me/**'), p.click('#send-btn')]);
    const t = waText(p.url());
    expect('sin hoja: línea por confirmar', t.includes('• 1 × Lazos · precio por confirmar'), true);
    expect('sin hoja: total por confirmar', t.includes('Total: por confirmar'), true);
    expect('sin hoja: sin código', t.includes('Ref.'), false);
    await ctx.close();
  }

  // --- La hoja no pudo anotarlo (topes, ocupada): igual se abre WhatsApp, sin código ---
  {
    const { p, ctx } = await open({ postReply: { ok: false, retry: true, error: 'Hoy ya no se anotan más pedidos por la web.' } });
    await p.click('.card:has-text("Kit El Sushi bar") [data-act="add"]');
    await p.goto('http://localhost:8767/#/pedido'); await p.waitForTimeout(400);
    await Promise.all([p.waitForURL('https://wa.me/**'), p.click('#send-btn')]);
    const t = waText(p.url());
    expect('topes: WhatsApp igual', [t.includes('• 1 × Kit El Sushi bar · S/89'), t.includes('Ref.')], [true, false]);
    await ctx.close();
  }

  // --- Dos elecciones del mismo producto se suman; tope de 9 avisa ---
  {
    const { p, ctx } = await open({ hash: '#/p/kit-pizzeria' });
    await p.fill('#pd-note', 'piña'); await p.click('[data-act="pdAdd"]');
    await p.fill('#pd-note', 'jamón'); await p.click('[data-act="pdAdd"]');
    expect('elecciones sumadas', await p.evaluate(() => JSON.parse(localStorage.getItem('lindi-web:pedido'))[0]), { id: 'kit-pizzeria', qty: 2, choice: 'piña + 1: jamón' });
    await p.goto('http://localhost:8767/#/tienda'); await p.waitForTimeout(300);
    for (let i = 0; i < 10; i++) await p.click('.card:has-text("Kit El Sushi bar") [data-act="add"]');
    expect('tope de 9: aviso', (await p.textContent('.notice')).includes('hasta 9'), true);
    await p.goto('http://localhost:8767/#/p/%E0'); await p.waitForTimeout(300);
    expect('enlace roto no rompe la página', (await p.textContent('#main')).includes('ya no está disponible'), true);
    await ctx.close();
  }

  // --- Carrusel: pausa ---
  {
    const { p, ctx } = await open({ settings: { navidad_fecha_limite: '15 de diciembre', navidad_texto: 'Con caja.' } });
    await p.click('#hero [data-act="pause"]');
    expect('pausa', await p.getAttribute('#hero [data-act="pause"]', 'aria-label'), 'Reanudar el carrusel');
    expect('foco vuelve al botón', await p.evaluate(() => document.activeElement.dataset.act), 'pause');
    await ctx.close();
  }

  // --- La hoja rechaza: se avisa y no se abre WhatsApp ---
  {
    const { p, ctx } = await open({ postReply: { ok: false, error: 'Un producto de tu pedido ya no está disponible. Recarga la página.' } });
    await p.click('.card:has-text("Kit El Sushi bar") [data-act="add"]');
    await p.goto('http://localhost:8767/#/pedido'); await p.waitForTimeout(400);
    await p.click('#send-btn'); await p.waitForTimeout(400);
    expect('rechazo: mensaje', await p.textContent('#form-err'), 'Un producto de tu pedido ya no está disponible. Recarga la página.');
    expect('rechazo: sigue en la web', p.url().startsWith('http://localhost'), true);
    expect('rechazo: botón activo', await p.isEnabled('#send-btn'), true);
    await ctx.close();
  }

  // --- Producto despublicado sale del pedido; sin WhatsApp no se puede pedir ---
  {
    const { p, ctx } = await open({ items: ITEMS.slice(0, 2), hash: '#/tienda' });
    await p.evaluate(() => { localStorage.setItem('lindi-web:pedido', JSON.stringify([{ id: 'lazos', qty: 1, choice: '' }])); });
    await p.reload(); await p.waitForTimeout(600);
    expect('despublicado sale del pedido', await p.evaluate(() => JSON.parse(localStorage.getItem('lindi-web:pedido')).length), 0);
    expect('aviso', (await p.textContent('#main')).includes('Quitamos de tu pedido lo que ya no está disponible.'), true);
    await ctx.close();
    const o = await open({ settings: { whatsapp: '' } });
    expect('sin número: no hay botón Escríbenos', await o.p.isVisible('#nav-wa'), false);
    expect('sin número: no hay burbuja', await o.p.isVisible('#bubble'), false);
    await o.ctx.close();
  }

  // --- Sin conexión y sin configurar ---
  {
    const { p, ctx } = await open({ getFail: true });
    expect('sin conexión: reintento', await p.isVisible('[data-act="retry"]'), true);
    await ctx.close();
    const off = await open({ config: { api: '' } });
    expect('sin configurar', (await off.p.textContent('#main')).includes('La tienda está en preparación.'), true);
    await off.ctx.close();
  }

  console.log('ERR', errs); await b.close();
  process.exit(errs.length ? 1 : 0);
})();