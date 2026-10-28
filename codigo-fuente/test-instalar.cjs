/* v1.16.1: cuadro «Descargar la aplicación» en Ayuda › Manual de uso, solo para 4 perfiles. */
const { JSDOM } = require('jsdom'); const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(120); };
  const boton = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const texto = () => d.getElementById('root').textContent;
  const entrar = async (rol) => { const s = boton('Salir'); if (s) await click(s); await click(boton(rol)); await espera(300); if (boton('Entendido')) await click(boton('Entendido')); };
  for (const [rol, ve] of [['Gerente de RRHH', true], ['Gerente de Marca', true], ['Gerente de Operaciones', true], ['Gerente General', true], ['Administrador', false], ['Visor General', false]]) {
    await entrar(rol); await click(nav('Manual de uso')); await espera(300);
    ok(Boolean(d.getElementById('inst-tit')) === ve, `${rol}: ${ve ? 've' : 'no ve'} el cuadro de descarga de la aplicación`);
  }
  await entrar('Gerente de RRHH'); await click(nav('Manual de uso')); await espera(200);
  ok(texto().includes('sgi-rrhh.vercel.app'), 'En la demo remite al sitio oficial para instalar');
})().catch((e) => { console.log('✗ Excepción: ' + e.stack.split('\n').slice(0, 3).join(' | ')); process.exit(1); });
