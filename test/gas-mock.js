// Simulación mínima de los servicios de Apps Script que usa gas/Code.gs, en memoria.
// Uso: const gas = require('./gas-mock')(); gas.run('doGet', {...}); gas.sheet('Catálogo')
const vm = require('vm'), fs = require('fs'), path = require('path');

module.exports = function load() {
  const sheets = {};
  const cache = {};
  const props = {};
  const triggers = [];
  const log = { flushes: 0, menus: [] };
  let ctxDay = null;

  function Range(sh, r, c, nr, nc) {
    return {
      getValues() {
        const out = [];
        for (let i = 0; i < nr; i++) { const row = sh.data[r - 1 + i] || []; const o = []; for (let j = 0; j < nc; j++) o.push(row[c - 1 + j] === undefined ? '' : row[c - 1 + j]); out.push(o); }
        return out;
      },
      setValues(v) {
        if (v.length !== nr || v[0].length !== nc) throw new Error('Las dimensiones no coinciden');
        for (let i = 0; i < nr; i++) { sh.data[r - 1 + i] = sh.data[r - 1 + i] || []; for (let j = 0; j < nc; j++) sh.data[r - 1 + i][c - 1 + j] = v[i][j]; }
        return this;
      },
      setFontWeight() { return this; },
      setValue(v) { sh.data[r - 1] = sh.data[r - 1] || []; sh.data[r - 1][c - 1] = v; return this; },
      setNumberFormat(f) { sh.formats[c] = f; return this; },
      insertCheckboxes() { sh.checkboxes = c; return this; },
      setDataValidation(rule) { sh.validation[c] = rule.list; return this; },
      getSheet() { return sh.api; }
    };
  }
  function makeSheet(name) {
    const sh = { name, data: [], validation: {}, formats: {}, frozen: 0 };
    sh.api = {
      getName: () => name,
      getLastRow: () => sh.data.length,
      getLastColumn: () => sh.data.reduce((m, r) => Math.max(m, r.length), 0),
      getRange: (r, c, nr, nc) => Range(sh, r, c, nr || 1, nc || 1),
      appendRow(row) { sh.data.push(row.slice()); return sh.api; },
      setFrozenRows(n) { sh.frozen = n; }
    };
    sheets[name] = sh;
    return sh;
  }
  const ss = {
    getSheetByName: n => (sheets[n] ? sheets[n].api : null),
    insertSheet: n => makeSheet(n).api
  };
  const ctx = {
    console,
    Utilities: { formatDate: (d, tz, f) => (ctxDay || d.toISOString().slice(0, 10)) },
    SpreadsheetApp: {
      getActive: () => ss, getActiveSpreadsheet: () => ss, flush() { log.flushes++; },
      getUi: () => ({ createMenu: name => { const m = { name, items: [] }; log.menus.push(m); return { addItem(t, f) { m.items.push(f); return this; }, addToUi() { } }; } }),
      newDataValidation: () => ({ requireValueInList(list) { return { build: () => ({ list }) }; } })
    },
    CacheService: { getScriptCache: () => ({ get: k => (k in cache ? cache[k] : null), put: (k, v) => { cache[k] = String(v); }, remove: k => { delete cache[k]; } }) },
    LockService: { getScriptLock: () => ({ waitLock() { }, releaseLock() { } }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); } }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: s => ({ text: s, setMimeType() { return this; } })
    },
    ScriptApp: {
      getProjectTriggers: () => triggers.map(t => ({ getHandlerFunction: () => t })),
      newTrigger: fn => ({ timeBased: () => ({ everyDays: () => ({ atHour: () => ({ create() { triggers.push(fn); } }) }) }) })
    }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'gas', 'Code.gs'), 'utf8'), ctx, { filename: 'Code.gs' });

  return {
    ctx, sheets, cache, props, triggers, log,
    sheet: n => sheets[n],
    setDay: d => { ctxDay = d; },
    run: (fn, ...args) => ctx[fn](...args),
    // doGet/doPost devuelven ContentService; aquí se lee el JSON.
    get: params => JSON.parse(ctx.doGet({ parameter: params || {} }).text),
    post: body => JSON.parse(ctx.doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } }).text)
  };
};
