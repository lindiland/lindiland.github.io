// Comprobación mínima para las pruebas: si el valor no es el esperado, se anota en la lista de errores
// de la prueba (la línea "ERR …" deja de estar vacía y run-all.js la marca como fallida).
// Uso: const expect=require('../tools/expect')(errs); expect('nombre', valorObtenido, valorEsperado);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
module.exports = errs => (name, got, want) => {
  if (!same(got, want)) errs.push(`falla: ${name} → obtuve ${JSON.stringify(got)}, esperaba ${JSON.stringify(want)}`);
};
