const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(120); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  await click(boton('Gerente de RRHH', 0)); await espera(200);
  const grupos = [...d.querySelectorAll('aside nav p')].map((p) => p.textContent.trim());
  ok(grupos.includes('Formación') && grupos.includes('Desarrollo'), 'Menú con grupos Formación y Desarrollo');
  await click(nav('Formación')); ok(d.body.textContent.includes('Participación en formaciones'), 'Módulo Formación abre (Tienda)');
  await click([...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.trim().startsWith('Talleres'))); await click(boton('Administrativa')); ok(d.body.textContent.includes('Formación administrativa'), 'Formación pestaña Administrativa');
  await click(nav('Plan de sucesión')); ok(d.body.textContent.includes('Escala de cargos de tienda') && d.body.textContent.includes('Gerente de Tienda'), 'Plan de sucesión: escala de tienda');
  await click(boton('Administrativa')); ok(d.body.textContent.includes('Plan de sucesión administrativo'), 'Plan de sucesión: pestaña Administrativa');
  // Plan de sucesión administrativo: solo RRHH y Gerencia General
  const entrar = async (rol) => { await click(boton('Salir')); await click(boton(rol, 0)); await espera(200); };
  for (const [rol, ve] of [['Gerente de Marca', false], ['Gerente General', true], ['Gerente de RRHH', true], ['Gerente de Operaciones', false]]) {
    await entrar(rol);
    if (!nav('Plan de sucesión')) { ok(!ve, `${rol}: sin acceso al módulo`); continue; }
    await click(nav('Plan de sucesión'));
    ok([...d.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Administrativa') === ve, `${rol}: ${ve ? 've' : 'no ve'} la pestaña Administrativa del plan de sucesión`);
  }
  // Información de tiendas: ficha en PDF desde Gerente de Marca hacia arriba
  for (const [rol, ve] of [['Gerente de Marca', true], ['Gerente General', true], ['Gerente de RRHH', true]]) {
    await entrar(rol);
    await click(nav('Información de tiendas'));
    const fila = [...d.querySelectorAll('tbody tr, button')].find((x) => /Propatria|Lido|Cascada/.test(x.textContent) && x.textContent.length < 160);
    if (fila) await click(fila);
    ok([...d.querySelectorAll('button')].some((b) => b.textContent.includes('Ficha en PDF')) === ve, `${rol}: botón Ficha en PDF en Información de tiendas`);
  }
  process.exit(process.exitCode || 0);
})();
