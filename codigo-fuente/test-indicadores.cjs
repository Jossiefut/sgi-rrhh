const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 30) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const roles = [['Gerente de Marca', true], ['Gerente de Operaciones', true], ['Gerente General', true], ['Gerente de RRHH', true], ['Gerente de Tienda', false]];
  for (const [rol, ve] of roles) {
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = (...a) => { console.log('ERR', a.join(' ').slice(0, 200)); }; } });
    await espera(300);
    const w = dom.window, d = w.document; const texto = () => d.getElementById('root').textContent;
    const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(60); for (let k = 0; k < 4; k++) { const ps = [...w.document.querySelectorAll('[data-plegado="1"]')]; if (!ps.length) break; ps.forEach((b) => b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))); await espera(); } };
    const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
    if (rol === 'Gerente de Tienda') { const el = d.getElementById('login-tienda'); Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set.call(el, 'gerente.propatria'); el.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(); await click(boton('Entrar')); } else await click(boton(rol, 0));
    const item = boton('Indicadores de gestión');
    if (!ve) { ok(!item, rol + ': no ve Indicadores de gestión'); dom.window.close(); continue; }
    ok(!!item, rol + ': ve Indicadores de gestión en el menú');
    await click(item);
    const t = texto();
    ok(['Dotación y rotación', 'Perfil de la plantilla', 'Talento, desarrollo y pruebas', 'Gestión y cumplimiento', 'Rotación 12 meses', 'Cobertura del HC', 'Antigüedad promedio', 'Cobertura Nine-Box', 'Avance del onboarding'].every((x) => t.includes(x)), rol + ': muestra las cuatro secciones y sus indicadores');
    ok(!t.includes('NaN') && !t.includes('undefined') && !t.includes('Infinity'), rol + ': sin valores NaN ni indefinidos');
    if (rol === 'Gerente General') { const sel = d.getElementById('ind-marca'); ok(!!sel, 'Gerencia General: selector de marca'); }
    dom.window.close();
  }
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
