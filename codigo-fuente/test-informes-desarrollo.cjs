const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
async function sesion(fn) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(200); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const setValor = (el, v) => { const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
  await fn({ w, d, click, boton, setValor, texto: () => d.body.textContent });
  w.close();
}
(async () => {
  await sesion(async ({ d, click, boton, texto }) => {
    await click(boton('Gerente de RRHH', 0)); await espera(300);
    await click(boton('Informes')); await click([...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.trim() === 'Descargas en Excel'));
    const t = texto();
    ok(t.includes('Plan de sucesión') && t.includes('Formación') && t.includes('Trayectoria'), 'Excel: hojas Plan de sucesión, Formación y Trayectoria');
    await click(boton('Informes', 0));
  });
  await sesion(async ({ d, click, boton, texto }) => {
    await click(boton('Gerente de RRHH', 0)); await espera(300);
    await click([...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith('Informes') && !b.textContent.includes('Excel')));
    ok(texto().includes('Sucesión y formación'), 'Informe global: bloque «Sucesión y formación»');
  });
  await sesion(async ({ d, w, setValor, click, boton, texto }) => {
    setValor(d.getElementById('login-tienda'), 'gerente.propatria'); await espera(); await click(boton('Entrar')); await espera(300);
    const nav = [...d.querySelectorAll('aside nav button')].map((b) => b.textContent);
    ok(!nav.some((x) => x.includes('Plan de sucesión')), 'Gerente de Tienda: sin Plan de sucesión');
    await click([...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith('Informes'))); ok(![...d.querySelectorAll('[role=tab]')].some((b) => b.textContent.trim() === 'Descargas en Excel'), 'Gerente de Tienda: sin Excel');
    ok(!texto().includes('Sucesión y formación'), 'Gerente de Tienda: sin bloque de sucesión en el tablero');
  });
  await sesion(async ({ d, click, boton, texto }) => {
    const b = boton('Consulta') || boton('Gerente de RRHH Futura');
    if (!b) { console.log('(sin perfil consulta en login)'); return; }
    await click(b); await espera(300);
    const nav = [...d.querySelectorAll('aside nav button')].map((x) => x.textContent);
    ok(!nav.some((x) => x.includes('Plan de sucesión')), 'Consulta: sin Plan de sucesión');
  });
})();
