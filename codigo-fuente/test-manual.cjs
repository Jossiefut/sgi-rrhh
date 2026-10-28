/* Manual de uso dentro del sistema: cada perfil ve solo el suyo (Ayuda › Manual de uso) */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const PERFILES = [['admin', 'Administrador'], ['rrhh', 'Gerente de RRHH'], ['analista', 'Analista de RRHH'], ['general', 'Gerente General'], ['marca', 'Gerente de Marca'], ['operaciones', 'Gerente de Operaciones'], ['tienda', null], ['visor', 'Visor General'], ['consulta', 'Consulta RRHH Futura']];
const TITULO = { admin: 'Administrador', rrhh: 'Gerente de RRHH', analista: 'Analista de RRHH', general: 'Gerente General', marca: 'Gerente de Marca', operaciones: 'Gerente de Operaciones', tienda: 'Gerente de Tienda', visor: 'Visor General', consulta: 'Consulta RRHH Futura' };
(async () => {
  for (const [rol, boton] of PERFILES) {
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; } });
    await espera(300);
    const w = dom.window, d = w.document;
    const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(200); };
    if (!boton) {
      const sel = d.getElementById('login-tienda');
      Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set.call(sel, sel.options[1].value);
      sel.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(80);
      await click([...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entrar'));
    } else await click([...d.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(boton)));
    const nav = [...d.querySelectorAll('aside nav')].pop();
    const item = [...nav.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Manual de uso');
    const grupo = [...nav.querySelectorAll('p')].map((p) => p.textContent.trim());
    ok(Boolean(item) && grupo.includes('Ayuda'), `${TITULO[rol]}: ve «Ayuda › Manual de uso» en el menú`);
    await click(item);
    const art = d.querySelector('article.manual-sgi');
    const h1 = art && art.querySelector('h1');
    ok(h1 && h1.textContent.includes(`Manual de uso · ${TITULO[rol]}`), `${TITULO[rol]}: abre su propio manual`);
    const otros = Object.entries(TITULO).filter(([r]) => r !== rol && !(rol === 'tienda' && r === 'tienda')).map(([, t]) => `Manual de uso · ${t}`);
    ok(!otros.some((t) => art.textContent.includes(t)), `${TITULO[rol]}: no ve el manual de otro perfil`);
    const descargar = [...d.querySelectorAll('button')].some((b) => b.textContent.includes('Descargar PDF'));
    ok(rol === 'consulta' ? !descargar : descargar, `${TITULO[rol]}: ${rol === 'consulta' ? 'sin' : 'con'} «Descargar PDF»`);
    if (rol === 'rrhh') {
      const buscar = d.querySelector('input[aria-label="Buscar en el manual"]');
      Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set.call(buscar, 'trazabilidad');
      buscar.dispatchEvent(new w.Event('input', { bubbles: true })); await espera(150);
      ok(d.querySelectorAll('.manual-hallado').length === 1 && /de \d+/.test(d.body.textContent), 'El buscador encuentra y resalta coincidencias');
      ok(d.querySelector('select[aria-label="Ir a la sección"]').options.length > 20, 'Lista «Ir a la sección» con los módulos');
    }
    w.close();
  }
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error(e); process.exit(1); });
