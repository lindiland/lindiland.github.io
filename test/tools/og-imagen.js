// Genera site/og.png: la tarjeta que muestran WhatsApp, Instagram y Facebook al compartir el enlace de la web.
// Usa el logo y el personaje de la propia web (logoHtml, charHtml), así siempre coinciden. Uso: node test/tools/og-imagen.js
// (si Playwright no está en este proyecto, con NODE_PATH apuntando al de ../lindi-os/node_modules, como test/run-all.js).
const { chromium } = require('playwright');
const path = require('path');
const { start, PORT } = require('./serve');

(async () => {
  let srv = null;
  try { srv = await start(); } catch (e) { if (e.code !== 'EADDRINUSE') throw e; }
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('http://localhost:' + PORT + '/demo');
  await p.waitForTimeout(800);
  // Manual de marca: logo a color sobre crema, nunca sobre las rayas; Lindi coral sobre rayitas amarillo pastel, sin accesorio.
  await p.evaluate(() => {
    document.body.innerHTML = '<div style="position:fixed;inset:0;background:#FFF8EC;display:grid;grid-template-columns:660px 540px;overflow:hidden">' +
      '<div style="display:flex;flex-direction:column;justify-content:center;gap:26px;padding-left:84px">' + logoHtml(150) +
      '<div style="font-family:Gluten,cursive;font-weight:800;font-size:54px;line-height:1.02;color:#4A3732">todo lo lindo<br>de la infancia</div>' +
      '<div style="font:900 17px Nunito,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#6B5A52">Accesorios · juego · creatividad · espacios</div></div>' +
      '<div style="position:relative;overflow:hidden"><span class="rayas" style="--rp:#F8E6B0;--rw:46px;--fondo:#FFF8EC"></span>' +
      '<span style="position:absolute;left:50%;bottom:-8px;transform:translateX(-50%)">' + charHtml('coral', 'saluda', '', 2.7) + '</span></div></div>';
  });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.resolve(__dirname, '..', '..', 'site', 'og.png') });
  await b.close();
  if (srv) srv.close();
  console.log('site/og.png lista');
})();
