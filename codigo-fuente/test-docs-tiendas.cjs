/* Documentación de ingreso del personal de tiendas: 11 documentos oficiales de tienda (docstienda.js) con logo y razón social de Balú o Planeta (nunca Futura). El kit administrativo (13) conserva los originales; con marca, docsadm.js sigue admitiendo logo y razón social. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const abrir = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
const hoy = new Date().toISOString().slice(0, 10);
const sum = (iso, n) => new Date(new Date(iso + 'T12:00:00').getTime() + n * 86400000).toISOString().slice(0, 10);
(async () => {
  const M = await import('./docsadm.js');
  const L = await import('./logos.js');
  M.registrarLogosAdm({ BALU: { src: L.LOGO_BALU, ratio: 720 / 231, alt: 'Balú' }, PLANETA: { src: L.LOGO_PLANETA, ratio: 720 / 147, alt: 'Planeta Sports' } });
  const ent = { BALU: { razonSocial: 'REPRESENTACIONES ULAB 24, C.A.', rif: 'J-50505660-3', domicilio: 'Sambil, Caracas' }, PLANETA: { razonSocial: 'COMERCIALIZADORA CLOCK WORK, C.A.', rif: 'J-31012003-0', domicilio: 'Sambil, Caracas' } };
  const base = { nombres: 'Ana', apellidos: 'Prueba', cedula: 'V-12345678', cargo: 'Asesor de Ventas', fecha: '2026-10-14' };
  const vA = M.variablesDocsAdm(base);
  const vB = M.variablesDocsAdm({ ...base, marca: 'BALU', entidad: ent.BALU, firmante: { nombre: 'Josselyn Tovar', cargo: 'Gerente de Talento Humano' } });
  const vP = M.variablesDocsAdm({ ...base, marca: 'PLANETA', entidad: ent.PLANETA, firmante: { nombre: 'Josselyn Tovar', cargo: 'Gerente de Talento Humano' } });
  const todo = (v) => M.DOCS_ADM.map((d) => M.htmlDocAdm(d.clave, v)).join('');
  const hA = todo(vA); const hB = todo(vB); const hP = todo(vP);
  ok(!/data-logo/.test(hA), 'Administrativos: los originales de Futura no se alteran (sin logo superpuesto)');
  ok(hB.includes('data-logo="BALU"') && !hB.includes('data-logo="PLANETA"') && hP.includes('data-logo="PLANETA"') && !hP.includes('data-logo="BALU"'), 'Tiendas: cada marca lleva su propio logo');
  ok(hB.includes('REPRESENTACIONES ULAB 24, C.A.') && hB.includes('J-50505660-3') && hP.includes('COMERCIALIZADORA CLOCK WORK, C.A.') && hP.includes('J-31012003-0'), 'Razón social y RIF de cada empresa en los documentos');
  ok(!/futura|daniela|502141219/i.test(hB + hP), 'En tiendas no aparece texto de Futura, su representante ni su RIF');
  ok(hB.includes('Josselyn Tovar') && hB.includes('Gerente de Talento Humano'), 'El reglamento lleva el firmante configurado por la empresa');
  /* --- aplicación --- */
  let dom = abrir(); await espera(300);
  let w = dom.window, d = w.document;
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(80); };
  const boton = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  await click(boton('Administrador')); await espera(200);
  const st = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const esAdm = (x) => String(x.cargoId).startsWith('ADM');
  const tBalu = st.tiendas.find((t) => t.marca === 'BALU' && !t.administrativa);
  const tPla = st.tiendas.find((t) => t.marca === 'PLANETA' && !t.administrativa);
  const activos = st.trabajadores.filter((x) => x.estatus === 'ACTIVO' && !esAdm(x) && !x.esPrueba);
  const [a, b] = activos;
  Object.assign(a, { tiendaId: tBalu.id, marca: 'BALU', nombres: 'Lucía', apellidos: 'Tienda Balu', docsAdm: { desde: sum(hoy, -1) } });
  Object.assign(b, { tiendaId: tPla.id, marca: 'PLANETA', nombres: 'Pedro', apellidos: 'Tienda Planeta', docsAdm: { desde: sum(hoy, -1) } });
  dom.window.close();
  dom = abrir(JSON.stringify(st)); await espera(300); w = dom.window; d = w.document;
  const click2 = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(80); };
  const boton2 = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  const texto = () => d.body.textContent;
  await click2(boton2('Gerente de RRHH')); await espera(200);
  await click2([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Documentos')));
  const bf = [...d.querySelectorAll('main button[aria-pressed]')].find((x) => x.textContent.includes('Documentos de ingreso'));
  if (bf) await click2(bf);
  const filas = [...d.querySelectorAll('main tbody tr')];
  ok(filas.filter((r) => r.textContent.includes('Tienda Balu')).length === 11, 'Personal de tienda Balú: 11 documentos oficiales de ingreso');
  ok(filas.filter((r) => r.textContent.includes('Tienda Planeta')).length === 11, 'Personal de tienda Planeta: 11 documentos oficiales de ingreso');
  for (const [ap, marca, razon] of [['Tienda Balu', 'Balú', 'REPRESENTACIONES ULAB 24'], ['Tienda Planeta', 'Planeta Sports', 'COMERCIALIZADORA CLOCK WORK']]) {
    const fila = [...d.querySelectorAll('main tbody tr')].find((r) => r.textContent.includes(ap) && r.textContent.includes('Acuse de recibo'));
    const ver = fila && [...fila.querySelectorAll('button')].find((x) => x.textContent.includes('Ver'));
    if (!ver) { ok(false, 'Se puede abrir el acuse de ' + ap); continue; }
    await click2(ver); await espera(300);
    const vd = boton2('Vista del documento'); if (vd) await click2(vd);
    const dlg = [...d.querySelectorAll('[role=dialog]')].pop();
    const t = dlg ? dlg.innerHTML : '';
    ok(t.includes(`alt="${marca}"`) && t.includes(razon) && !/futura/i.test(t), `Acuse de ${ap}: logo ${marca}, razón social y sin Futura`);
    const cerrar = boton2('Cerrar'); if (cerrar) await click2(cerrar);
  }
  /* el control de RRHH es solo de RRHH y Administrador */
  await click2([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Directorio')));
  const inp = d.getElementById('dir-busqueda');
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inp), 'value').set.call(inp, 'Tienda Balu'); inp.dispatchEvent(new w.Event('input', { bubbles: true })); await espera(200);
  const fe = [...d.querySelectorAll('tbody tr')].find((r) => r.textContent.includes('Tienda Balu')); if (fe) await click2(fe);
  const bd = [...d.querySelectorAll('main button')].find((x) => x.textContent.trim().startsWith('Documentos')); if (bd) await click2(bd);
  ok(texto().includes('Documentación de ingreso (Balú)') && Boolean(boton2('Marcar como entregada y firmada')), 'El expediente de tienda muestra la documentación de ingreso de Balú');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
