/* Evaluación oficial de pase a tiempo indeterminado (solo tienda): factores, escala E/MB/B/D/MD, cualitativa, recomendación y formato */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const abrir = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })); if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
const hoy = new Date().toISOString().slice(0, 10);
const sum = (iso, n) => new Date(new Date(iso + 'T12:00:00').getTime() + n * 86400000).toISOString().slice(0, 10);
const plano = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
(async () => {
  const F = await import('./evalfijo.js');
  ok(F.ITEMS_FIJO_OFICIAL.length === 9 && F.ITEMS_FIJO_OFICIAL.filter((x) => x.seccion === F.SECCION_FIJO_1).length === 3, 'El formato oficial tiene 9 factores (3 del módulo 1 y 6 del módulo 2)');
  ok(F.ESCALA_FIJO.map((x) => x.sigla).join(',') === 'E,MB,B,D,MD' && F.siglaFijo(5) === 'E' && F.siglaFijo(1) === 'MD', 'Escala E, MB, B, D, MD equivalente a 5, 4, 3, 2, 1');
  ok(F.ITEMS_FIJO_OFICIAL[0].texto === 'Calidad de Trabajo' && F.ITEMS_FIJO_OFICIAL[8].texto === 'Imagen', 'Factores con los nombres de la planilla');
  let dom = abrir(); await espera(300);
  let w = dom.window, d = w.document;
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(80); };
  const boton = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  await click(boton('Administrador')); await espera(200);
  const st = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const esAdm = (c) => (st.cargos.find((x) => x.id === c) || {}).administrativo;
  const tr = st.trabajadores.find((x) => x.estatus === 'ACTIVO' && !x.esPrueba && x.cargoId === 'ASE' && !esAdm(x.cargoId) && !(x.contrato && x.contrato.tipo === 'INDETERMINADO'));
  const adm = st.trabajadores.find((x) => x.estatus === 'ACTIVO' && !x.esPrueba && esAdm(x.cargoId));
  Object.assign(tr, { nombres: 'Marisol', apellidos: 'Evaluada Fija', fechaIngreso: sum(hoy, -160), contrato: { tipo: 'DETERMINADO', fechaFijo: '', hitos: { PRUEBA: { estado: 'SUPERADO', fecha: sum(hoy, -130) }, PROSECUCION: { estado: 'SUPERADO', fecha: sum(hoy, -70) } } } });
  st.solicitudes = st.solicitudes.filter((x) => x.trabajadorId !== tr.id);
  if (adm) Object.assign(adm, { nombres: 'Oficina', apellidos: 'Sin Fijo', fechaIngreso: sum(hoy, -160) });
  dom.window.close();
  dom = abrir(JSON.stringify(st)); await espera(300); w = dom.window; d = w.document;
  const click2 = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(80); };
  const boton2 = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  const poner = (el, v) => { const p = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v); el.dispatchEvent(new w.Event('input', { bubbles: true })); };
  await click2(boton2('Administrador')); await espera(200);
  const nav = [...d.querySelectorAll('aside nav button')].find((x) => /Prueba y contratos/.test(x.textContent));
  if (!nav) { console.log([...d.querySelectorAll('aside nav button')].map((x) => x.textContent.trim()).join(' | ')); process.exit(1); } await click2(nav); await espera(100);
  const filaT = [...d.querySelectorAll('main tr')].find((r) => r.textContent.includes('Evaluada Fija'));
  ok(Boolean(filaT) && filaT.textContent.includes('Pase a fijo'), 'La alerta de pase a fijo aparece para el trabajador de tienda');
  ok(![...d.querySelectorAll('main tr')].some((r) => r.textContent.includes('Sin Fijo') && r.textContent.includes('Pase a fijo')), 'El personal administrativo no tiene la evaluación de pase a fijo');
  const ev = filaT && [...filaT.querySelectorAll('button')].find((b) => /Evaluar/.test(b.textContent));
  ok(Boolean(ev), 'Se puede iniciar la evaluación');
  await click2(ev); await espera(150);
  const main = () => d.querySelector('main').textContent;
  ok(main().includes('Calidad de Trabajo') && main().includes('Imagen') && main().includes('Resolución de Problemas') && main().includes('Módulo 1: Desempeño práctico y técnico') && main().includes('Módulo 2: Habilidades blandas'), 'El formulario muestra los 9 factores en sus 2 módulos');
  ok(main().includes('E = Excelente') && main().includes('MD = Muy Deficiente'), 'Se muestra la leyenda de la escala');
  ok(main().includes('Fortalezas destacadas') && main().includes('Áreas por mejorar') && main().includes('¿Recomienda al colaborador para realizarle el contrato a tiempo indeterminado?'), 'Incluye las preguntas cualitativas y la recomendación');
  const grupos = [...d.querySelectorAll('main [role=radiogroup]')].filter((g) => g.querySelectorAll('[role=radio]').length === 5);
  ok(grupos.length === 9 && [...grupos[0].querySelectorAll('[role=radio]')].map((b) => b.textContent.trim()).join(',') === 'E,MB,B,D,MD', 'Cada factor tiene los botones E, MB, B, D, MD');
  /* primero se intenta enviar incompleto */
  await click2(boton2('Enviar evaluación') || boton2('Enviar')); await espera(100);
  ok(!JSON.parse(w.localStorage.getItem('talento-balu-v2')).solicitudes.some((x) => x.trabajadorId === tr.id && x.tipo === 'EVAL_FIJO'), 'No se envía si faltan factores');
  const vals = ['E', 'MB', 'B', 'MB', 'E', 'MB', 'B', 'E', 'MB'];
  for (let i = 0; i < 9; i++) { const b = [...grupos[i].querySelectorAll('[role=radio]')].find((x) => x.textContent.trim() === vals[i]); await click2(b); }
  poner(d.getElementById('ec-fortalezas'), 'Excelente trato al cliente y puntualidad.'); poner(d.getElementById('ec-mejoras'), 'Reforzar el orden de las cajas y el cierre.'); await espera(60);
  const si = [...d.querySelectorAll('main [role=radio]')].find((b) => b.textContent.trim() === 'Sí');
  await click2(si);
  await click2(boton2('Enviar evaluación') || boton2('Enviar')); await espera(200);
  const reg = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const sol = reg.solicitudes.find((x) => x.trabajadorId === tr.id && x.tipo === 'EVAL_FIJO');
  ok(Boolean(sol), 'La evaluación se envía');
  if (sol) {
    const dp = sol.datosPropuestos;
    ok(dp.modelo === 'FIJO_OFICIAL' && dp.respuestas.join(',') === '5,4,3,4,5,4,3,5,4' && dp.items.length === 9, 'Guarda el modelo oficial y las respuestas equivalentes (E=5 … MD=1)');
    ok(dp.fortalezas.includes('puntualidad') && dp.mejoras.includes('cierre') && dp.decision === 'CONTINUA', 'Guarda fortalezas, áreas por mejorar y la recomendación «Sí»');
    ok(Math.abs(dp.puntaje - 8.22) < 0.01, 'Puntaje en escala 10 calculado (' + dp.puntaje + ')');
  }
  /* formato PDF oficial desde el centro de documentos */
  await click2([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Documentos'))); await espera(150);
  const fd = [...d.querySelectorAll('main tbody tr')].find((r) => r.textContent.includes('Formato de evaluación') && r.textContent.includes('Evaluada Fija'));
  ok(Boolean(fd), 'El formato de evaluación aparece en el centro de documentos');
  const ver = fd && [...fd.querySelectorAll('button')].find((x) => x.textContent.includes('Ver'));
  if (ver) {
    await click2(ver); await espera(300);
    const vd = boton2('Vista del documento'); if (vd) await click2(vd);
    const dlg = [...d.querySelectorAll('[role=dialog]')].pop();
    if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, dlg ? dlg.innerHTML : ''); const t = plano(dlg ? dlg.innerHTML : '');
    ok(t.includes('EVALUACIÓN DE COLABORADORES PARA CONTRATOS A TIEMPO INDETERMINADO'.toLowerCase()) || /Evaluación de colaboradores para contratos a tiempo indeterminado/i.test(t), 'El formato lleva el título oficial');
    ok(t.includes('Marisol Evaluada Fija') && t.includes('FORTALEZAS DESTACADAS') && t.includes('Calidad de Trabajo') && t.includes('Cédula de Identidad') && t.includes('FIRMA DEL EVALUADOR') && t.includes('FIRMA DEL TRABAJADOR'), 'El formato lleva el nombre del trabajador, los factores y las firmas del evaluador y del trabajador');
    ok(/Sí/.test(t) && /Departamento/.test(t), 'El formato muestra la recomendación y el departamento');
    const cerrar = boton2('Cerrar'); if (cerrar) await click2(cerrar);
  } else ok(false, 'Se puede abrir el formato');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message, e.stack.split('\n')[1]); process.exitCode = 1; });
