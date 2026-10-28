const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; } });
  await espera(400); const w = dom.window, d = w.document;
  const click = async (el) => { const e = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entendido'); if (e && e !== el) { e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); } if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(200); };
  const b = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const main = () => (d.querySelector('main') || d.body).textContent;
  const tarjetas = () => [...d.querySelectorAll('main button')].filter((x) => /Ver detalle/.test(x.textContent) && x.className.includes('rounded-lg') && x.className.includes('p-4'));
  const abrirMas = async () => { const m = b('Ver más indicadores'); if (m && m.getAttribute('aria-expanded') !== 'true') await click(m); };
  async function recorrer(rol, minimo) {
    await click(b(rol, 0)); await espera(300);
    if (b('Entendido')) await click(b('Entendido'));
    await abrirMas();
    const n0 = tarjetas().length;
    ok(n0 >= minimo, `${rol}: el Tablero tiene ${n0} tarjetas que se pueden pulsar (mínimo ${minimo})`);
    let bien = 0, sinVolver = [];
    for (let i = 0; i < n0; i++) {
      const t = tarjetas()[i]; if (!t) break;
      const titulo = t.textContent.slice(0, 30);
      await click(t);
      const volver = [...d.querySelectorAll('main button')].find((x) => /^Volver( a .+)?$/.test(x.textContent.trim()));
      if (!volver) { sinVolver.push(titulo); continue; }
      if (/NaN|undefined/.test(main())) { sinVolver.push('NaN en ' + titulo); }
      await click(volver); await abrirMas();
      if (tarjetas().length === n0) bien++; else sinVolver.push('no regresó ' + titulo);
    }
    ok(bien === n0 && !sinVolver.length, `${rol}: cada tarjeta lleva a su módulo con botón «Volver» y regresa al Tablero (${bien}/${n0}) ${sinVolver.join('; ')}`);
    await click(b('Salir'));
  }
  await recorrer('Gerente de RRHH', 6);
  await recorrer('Gerente General', 3);
  await recorrer('Gerente de Marca', 3);
  await recorrer('Gerente de Operaciones', 3);
  await recorrer('Administrador', 3);
  await recorrer('Consulta RRHH Futura', 1);
  // Gerente de Tienda (entra por el selector de tienda)
  { const sel = d.getElementById('login-tienda'); sel.value = sel.options[1].value; sel.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(100);
    await click(b('Entrar')); await espera(300); if (b('Entendido')) await click(b('Entendido'));
    await abrirMas(); const n = tarjetas().length; let k = 0;
    for (let i = 0; i < n; i++) { const t = tarjetas()[i]; if (!t) break; await click(t); const v = [...d.querySelectorAll('main button')].find((x) => /^Volver( a .+)?$/.test(x.textContent.trim())); if (v) { await click(v); await abrirMas(); if (tarjetas().length === n) k++; } }
    ok(n >= 3 && k === n, `Gerente de Tienda: ${k}/${n} tarjetas llevan a su módulo y regresan con «Volver»`);
    await click(b('Salir')); }
  // Indicadores de gestión para RRHH
  await click(b('Gerente de RRHH', 0)); await espera(300);
  if (b('Entendido')) await click(b('Entendido'));
  await click([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Indicadores')));
  for (const bt of [...d.querySelectorAll('main button')].filter((x) => x.getAttribute('aria-expanded') === 'false')) await click(bt);
  const n1 = tarjetas().length; let ok1 = 0;
  for (let i = 0; i < n1; i++) { const t = tarjetas()[i]; if (!t) break; await click(t); const v = [...d.querySelectorAll('main button')].find((x) => /^Volver a Indicadores/.test(x.textContent.trim())); if (v) { await click(v); for (const bt of [...d.querySelectorAll('main button')].filter((x) => x.getAttribute('aria-expanded') === 'false')) await click(bt); if (tarjetas().length === n1) ok1++; } }
  ok(n1 >= 10 && ok1 === n1, `Indicadores de gestión: ${ok1}/${n1} tarjetas llevan al módulo y regresan con «Volver a Indicadores de gestión»`);
  process.exit(process.exitCode || 0);
})();
