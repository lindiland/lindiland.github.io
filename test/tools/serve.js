// Servidor estático mínimo de site/ en el puerto 8767. Uso: node test/tools/serve.js
// Vista previa: http://localhost:8767/demo muestra la web con la hoja de ejemplo. /demo-api corre el mismo
// gas/Code.gs sobre una hoja simulada (test/gas-mock.js) con los borradores de "Preparar hoja" publicados,
// así se ve exactamente lo que la dueña tendría tras llenar la hoja. Los pedidos de la demo no salen de aquí.
// Agregar ?fondo=crema a /demo muestra la otra opción de fondo. /panel muestra el panel de la hoja (gas/Panel.html)
// sobre esa misma hoja simulada.
const http = require('http'), fs = require('fs'), path = require('path');
const dir = path.resolve(__dirname, '..', '..', 'site');
const PHOTOS = path.resolve(__dirname, '..', '..', '..', '..', '..'); // Documents\Lindi
const PORT = 8767;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

function demoSheet() {
  const gas = require('../gas-mock')();
  gas.run('prepararHoja');
  const cat = gas.sheet('Catálogo');
  const pub = cat.data[0].indexOf('publicado');
  cat.data.slice(1).forEach(r => { r[pub] = true; });
  const set = (k, v) => { gas.sheet('Ajustes').data.find(r => r[0] === k)[1] = v; };
  set('whatsapp', '51999999999');
  set('navidad_fecha_limite', new Date(new Date().getFullYear(), 11, 15));
  set('envio_lima', '2 a 3 días hábiles');
  // Complementos de ejemplo (solo en la demo) para ver las sugerencias en la ficha y en el pedido.
  const head = cat.data[0];
  const row = o => head.map(h => (h in o ? o[h] : ''));
  cat.data.push(row({ id: 'mandil-chef', nombre: 'Mandil + gorro de chef', ambito: 'Juego', coleccion: 'La Pizzería', precio: 45, para_jugar: 'ser chef de verdad', publicado: true, orden: 6 }));
  cat.data.push(row({ id: 'toppings-extra', nombre: 'Toppings extra para la Pizzería', ambito: 'Juego', precio: 25, publicado: true, solo_sugerencia: true, orden: 7 }));
  cat.data.find(r => r[0] === 'kit-pizzeria')[head.indexOf('complementos')] = 'mandil-chef, toppings-extra';
  gas.run('refrescarCatalogo');
  return gas;
}
// Panel.html fuera de Google: google.script.run se reemplaza por llamadas a /demo-panel/<función>.
const PANEL_FNS = ['panelDatos', 'panelGuardarProducto', 'panelGuardarAjustes', 'panelEstadoSolicitud'];
const RUN_SHIM = '<script>window.google={script:{run:(function mk(ok,fail){return new Proxy({},{get:(t,k)=>k==="withSuccessHandler"?f=>mk(f,fail):k==="withFailureHandler"?f=>mk(ok,f):(...a)=>fetch("/demo-panel/"+k,{method:"POST",body:JSON.stringify(a)}).then(r=>r.json()).then(j=>j.error?fail&&fail({message:j.error}):ok&&ok(j.result))})})()}};</script>';
// Code.gs solo acepta fotos https; en la demo se pone a mano la foto local de la pizza corazón.
function withDemoPhotos(c) {
  const pizza = 'http://localhost:' + PORT + '/demo-fotos/Pizza%20corazon.png';
  const p = c.items.find(i => i.id === 'kit-pizzeria');
  if (p) p.photo = pizza;
  if (c.slides[0]) c.slides[0].photo = pizza;
  return c;
}

function start() {
  return new Promise((ok, fail) => {
    let gas = null;
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      if (url === '/demo-api') {
        gas = gas || demoSheet();
        if (req.method === 'GET') { res.writeHead(200, { 'Content-Type': types['.json'] }); return res.end(JSON.stringify(withDemoPhotos(gas.get()))); }
        let body = '';
        req.on('data', c => { body += c; });
        req.on('end', () => { res.writeHead(200, { 'Content-Type': types['.json'] }); res.end(JSON.stringify(gas.post(body))); });
        return;
      }
      if (url.indexOf('/demo-panel/') === 0) {
        gas = gas || demoSheet();
        const fn = url.slice('/demo-panel/'.length);
        let body = '';
        req.on('data', c => { body += c; });
        req.on('end', () => {
          let out;
          try { if (PANEL_FNS.indexOf(fn) < 0) throw new Error('función no permitida'); out = { result: gas.run(fn, ...JSON.parse(body || '[]')) }; }
          catch (e) { out = { error: e.message }; }
          res.writeHead(200, { 'Content-Type': types['.json'] }); res.end(JSON.stringify(out));
        });
        return;
      }
      if (url === '/panel') {
        return fs.readFile(path.resolve(__dirname, '..', '..', 'gas', 'Panel.html'), 'utf8', (e, html) => {
          res.writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' });
          res.end(html.replace('<head>', '<head>' + RUN_SHIM));
        });
      }
      if (url.indexOf('/demo-fotos/') === 0) {
        const f = path.join(PHOTOS, path.basename(url));
        if (path.extname(f) !== '.png') { res.writeHead(404); return res.end(); }
        return fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': 'image/png' }); res.end(b); });
      }
      if (url === '/demo') {
        return fs.readFile(path.join(dir, 'index.html'), 'utf8', (e, html) => {
          const cfg = '<script>window.LINDI_TEST_CONFIG={api:"http://localhost:' + PORT + '/demo-api"};</script>';
          res.writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' });
          res.end(html.replace('<head>', '<head>' + cfg));
        });
      }
      let p = path.join(dir, url);
      if (!p.startsWith(dir)) { res.writeHead(403); return res.end(); }
      if (p.endsWith(path.sep)) p = path.join(p, 'index.html');
      fs.readFile(p, (e, b) => {
        if (e) { res.writeHead(404); return res.end(); }
        res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(b);
      });
    });
    srv.on('error', fail);
    srv.listen(PORT, () => ok(srv));
  });
}
module.exports = { start, PORT };
if (require.main === module) start().then(() => console.log('sirviendo site/ en http://localhost:' + PORT + ' (vista previa: /demo, /demo?fondo=crema)'));
