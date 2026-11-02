// Corre todas las pruebas locales en un solo paso y muestra solo lo que falla.
// Uso: node test/run-all.js            (resumen)
//      node test/run-all.js --verbose  (salida completa de cada prueba)
const path = require('path'), fs = require('fs');
const { spawn, spawnSync, execSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const verbose = process.argv.includes('--verbose');

// Playwright: el del proyecto (npm install); si no, el de LINDI OS al lado; si no, el global.
const env = { ...process.env };
if (!fs.existsSync(path.join(root, 'node_modules', 'playwright'))) {
  const sibling = path.join(root, '..', 'lindi-os', 'node_modules');
  if (fs.existsSync(path.join(sibling, 'playwright'))) env.NODE_PATH = sibling;
  else { try { env.NODE_PATH = execSync('npm root -g', { encoding: 'utf8', shell: true }).trim() } catch (e) { } }
}

const TESTS = [
  ['servidor (Code.gs)', 'test', 'servidor.js'],
  ['web: catálogo y pedido', 'test/flows', 'tienda.js']
];
const badLine = l => /^(ERR|ERRORS):?\s/.test(l.trim()) && !/^(ERR|ERRORS):?(\s*\[\])+\s*$/.test(l.trim());

function run(file, cwd) {
  return spawnSync(process.execPath, [file], { cwd: path.join(root, cwd), env, encoding: 'utf8', timeout: 180000 });
}

(async () => {
  // El servidor va en otro proceso: las pruebas corren con spawnSync, que bloquea este.
  const srv = spawn(process.execPath, [path.join(__dirname, 'tools', 'serve.js')], { stdio: 'ignore' });
  await new Promise(ok => setTimeout(ok, 800));
  let fails = 0;
  for (const [name, cwd, file] of TESTS) {
    const r = run(file, cwd);
    const out = (r.stdout || '') + (r.stderr || '');
    const bad = r.status !== 0 || out.split('\n').some(badLine);
    if (bad) fails++;
    console.log(`${bad ? '✗' : '✓'} ${name}`);
    if (bad || verbose) console.log(out.trim().split('\n').map(l => '    ' + l).join('\n'));
  }
  srv.kill();
  console.log(fails ? `\n${fails} prueba(s) con problemas` : '\nTodo pasó');
  process.exit(fails ? 1 : 0);
})();
