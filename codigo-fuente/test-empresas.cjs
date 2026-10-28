const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(90); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const texto = () => d.body.textContent;
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const escribe = async (id, v) => { const el = d.getElementById(id); Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new w.Event('input', { bubbles: true })); await espera(40); };
  const vista = async () => { await click(boton('Vista del documento')); const dl = [...d.querySelectorAll('[role=dialog]')].pop(); const t = dl.textContent; const imgs = dl.querySelectorAll('img').length; await click(boton('Cerrar')); return { t, imgs }; };
  // RRHH no ve Configuración
  await click(boton('Gerente de RRHH')); await espera(200);
  ok(![...d.querySelectorAll('aside nav button')].some((b) => b.textContent.includes('Configuración')), 'RRHH no tiene acceso a la configuración de empresas');
  await click(boton('Salir')); await click(boton('Administrador')); await espera(200);
  await click([...d.querySelectorAll('aside nav button')].find((b) => b.textContent.includes('Configuración')));
  await click([...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.trim() === 'Empresas'));
  ok(texto().includes('Balú: razón social única') && texto().includes('Planeta: razón social única') && d.getElementById('emp-PLANETA-razon').value === 'COMERCIALIZADORA CLOCK WORK, C.A.' && d.getElementById('emp-PLANETA-ivss').value === 'D25940758' && d.getElementById('emp-BALU-nil').value === '3488977237', 'Pestaña Empresas con Balú y Planeta (Clock Work) y sus datos fiscales');
  await escribe('emp-BALU-razon', 'BALU NUEVA, C.A.'); await escribe('emp-BALU-rif', 'J-11111111-1');
  await escribe('emp-PLANETA-razon', 'PLANETA SPORTS, C.A.'); await escribe('emp-PLANETA-rif', 'J-22222222-2');
  await click(boton('Guardar'));
  const e = db().config.entidades;
  ok(e && e.BALU.razonSocial === 'BALU NUEVA, C.A.' && e.PLANETA.rif === 'J-22222222-2', 'Razón social y RIF guardados por empresa');
  await click([...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith('Documentos')));
  const fases = [...d.querySelectorAll('main button[aria-pressed]')];
  for (const fase of ['Ingreso', 'Período de prueba y contrato', 'Traslados y promociones']) {
    const bf = [...d.querySelectorAll('main button[aria-pressed]')].find((b) => b.textContent.includes(fase)); if (!bf) continue; await click(bf);
    const filas = [...d.querySelectorAll('main tbody tr')].slice(0, 3);
    for (const f of filas) { const ver = [...f.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Ver'); if (!ver) continue; await click(ver); const r = await vista(); const marca = r.t.includes('BALU NUEVA') || r.t.includes('PLANETA SPORTS'); ok(!r.t.includes("REPRESENTACIONES ULAB 24") && r.imgs > 0, `Documento (${fase}) ${r.t.slice(0,60).replace(/\s+/g," ")} img=${r.imgs}  sin razón social anterior y con logo: ${marca ? 'nueva razón social' : 'sin razón social visible'}`); }
  }
  void fases;
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
