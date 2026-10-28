const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = () => {}; } });
  await espera(300);
  const w = dom.window, d = w.document; const texto = () => d.getElementById('root').textContent;
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(80); for (let k = 0; k < 4; k++) { const ps = [...w.document.querySelectorAll('[data-plegado="1"]')]; if (!ps.length) break; ps.forEach((b) => b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))); await espera(); } };
  const boton = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  await click(boton('Administrador')); await click([...d.querySelectorAll('aside nav button')].find((b) => b.textContent.includes('Configuración')));
  await click([...d.querySelectorAll('aside nav button')].find((b) => b.textContent.includes('Montos y autorizaciones')));
  const v = (id) => d.getElementById(id) && d.getElementById(id).value;
  ok(v('pg-valorPernocta') === '20' && v('pg-apoyoMensual') === '50' && v('pg-diasTrabajoQuincena') === '10' && v('pg-diasDescansoQuincena') === '4', 'Configuración: pernocta USD 20, apoyo USD 50 al mes, 10 días trabajados + 4 de descanso');
  ok(texto().includes('USD 25,00 por quincena') && texto().includes('USD 2,50 por día trabajado'), 'Configuración: explica USD 25 por quincena y USD 2,50 por día');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
