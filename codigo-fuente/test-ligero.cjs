const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 60) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = () => {}; } });
  await espera(300);
  const w = dom.window, d = w.document; const texto = () => d.getElementById('root').textContent;
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(); };
  const boton = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  const menu = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.includes(t));
  const plegados = () => d.querySelectorAll('main [data-plegado="1"]').length;
  const fila = (t) => [...d.querySelectorAll('main [data-plegado]')].find((b) => b.textContent.includes(t));
  const entrar = async (rol) => { const s = boton('Salir'); if (s) await click(s); await click(boton(rol)); await espera(150); };

  for (const rol of ['Gerente de Marca', 'Gerente de Operaciones', 'Gerente General', 'Visor General', 'Gerente de RRHH', 'Administrador']) {
    await entrar(rol);
    ok(plegados() >= 5 && !d.querySelector('main table'), `${rol}: el tablero inicia resumido (${plegados()} filas plegadas, sin tablas a la vista)`);
  }
  await entrar('Gerente de Marca');
  const req = fila('Requiere su acción');
  ok(!!req && /\d+ (por aprobar|vencidos?|pendientes?)/.test(req.textContent), 'Marca: «Requiere su acción» muestra el conteo por tipo en una línea');
  const hc = fila('Plantilla frente a HC');
  ok(/% de cobertura · \d+ vacantes? · \d+ tiendas? en rojo/.test(hc.textContent), 'Marca: «Plantilla frente a HC» resume cobertura, vacantes y tiendas en rojo');
  await click(hc);
  ok(hc.getAttribute('aria-expanded') === 'true' && !!d.querySelector('main table') && !!boton('Ver por tienda'), 'Al pulsar la fila se abre el detalle (tabla y opciones)');
  await click(hc);
  ok(hc.getAttribute('aria-expanded') === 'false' && !d.querySelector('main table'), 'Al pulsar de nuevo se vuelve a plegar');

  await click(menu('Indicadores de gestión')); await espera(150);
  const secs = [...d.querySelectorAll('main section[aria-labelledby^="ind-"] > h2 > button')];
  const sec = (id) => d.querySelector(`main section[aria-labelledby="${id}"] > h2 > button`) || secs.find((b) => b.closest('section').getAttribute('aria-labelledby') === id);
  ok(secs.length >= 8 && sec('ind-dot').getAttribute('aria-expanded') === 'true' && secs.filter((b) => b !== sec('ind-dot')).every((b) => b.getAttribute('aria-expanded') === 'false'), 'Indicadores: «Dotación y rotación» abierta; las demás secciones resumidas en una fila');
  ok(/Antigüedad .* años/.test(sec('ind-pla').textContent) && /Nine-Box/.test(sec('ind-tal').textContent) && /solicitud/.test(sec('ind-ges').textContent), 'Cada sección resumida muestra sus cifras principales');
  ok(!texto().includes('Barras oscuras'), 'Los gráficos no se muestran hasta pedirlos');
  await click(fila('Ingresos y egresos, últimos 12 meses'));
  ok(texto().includes('Barras oscuras'), 'El gráfico se abre con un clic');
  await click(sec('ind-ges'));
  ok(texto().includes('Ciclo promedio') && texto().includes('Solicitudes abiertas'), 'La sección de gestión se abre con sus tarjetas');

  await entrar('Gerente de RRHH');
  const oculta = (t) => !texto().includes(t);
  ok(oculta('Rotación del mes') && oculta('Evaluaciones pendientes') && !oculta('Plantilla activa') && !!boton('Ver más indicadores (4)'), 'RRHH: 4 cifras clave; las demás a pedido');
  await click(boton('Ver más indicadores (4)'));
  ok(!oculta('Rotación del mes') && !oculta('Evaluaciones pendientes'), 'RRHH: «Ver más indicadores» muestra las otras 4');

  await click(boton('Salir'));
  const sel = d.getElementById('login-tienda'); const setter = Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set; setter.call(sel, 'gerente.propatria'); sel.dispatchEvent(new w.Event('change', { bubbles: true })); await espera();
  await click(boton('Entrar')); await espera(150);
  ok(plegados() === 0 && texto().includes('Rotación del mes'), 'Gerente de Tienda conserva su tablero completo, sin plegar');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
