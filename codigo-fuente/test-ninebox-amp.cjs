const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 30) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const crear = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
  const d0 = crear(); await espera(300);
  let est = JSON.parse(d0.window.localStorage.getItem('talento-balu-v2')); d0.window.close();
  const base = est.datos || est;
  const hoy = new Date().toISOString().slice(0, 10);
  const uPropatria = base.usuarios.find((u) => /propatria/.test(u.id));
  const tiendaP = uPropatria.tiendaId;
  const mk = (id, cargoId, tiendaId, nombres, extra = {}) => ({ ...base.trabajadores.find((t) => t.cargoId === 'CAJ') , id, cargoId, tiendaId, nombres, apellidos: 'Prueba' + id, cedula: String(20000000 + Math.floor(Math.random() * 99999)), fechaIngreso: '2024-01-10', estatus: 'ACTIVO', historial: [], contrato: { tipo: 'INDETERMINADO', fechaFijo: '2024-04-10', hitos: {} }, esPrueba: false, ...extra });
  const uOps = base.usuarios.find((u) => u.rol === 'operaciones'); const uMarca = base.usuarios.find((u) => u.rol === 'marca'); const uRrhh = base.usuarios.find((u) => u.rol === 'rrhh');
  console.log('usuarios', uOps.id, uMarca.id, uRrhh.id, uPropatria.id, tiendaP);
  const tiendaOf = base.tiendas.find((t) => t.id === tiendaP);
  const marcaT = tiendaOf.marca;
  const ofic = base.tiendas.find((t) => t.administrativa && t.marca === marcaT);
  const cajero = mk('W-NB-CAJ', 'CAJ', tiendaP, 'Carla');
  const adm = mk('W-NB-ADM', 'ADM', ofic.id, 'Adela', { supervisorId: uOps.id });
  base.trabajadores.push(cajero, adm);
  est = est.datos ? { ...est, datos: base } : base;
  let json = JSON.stringify(est);
  const sesion = async (quien, fn) => {
    const dm = crear(json); await espera(300); const x = dm.window, dd = x.document;
    const c = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new x.MouseEvent('click', { bubbles: true })); await espera(60); };
    const bt = (t, i = 0) => { const b = [...dd.querySelectorAll('button')].filter((y) => y.textContent.trim().includes(t)); if (!b[i]) throw new Error('No hay botón: ' + t); return b[i]; };
    const tab = (t) => [...dd.querySelectorAll('[role=tab]')].find((y) => y.textContent.trim().startsWith(t));
    const txt = () => dd.getElementById('root').textContent;
    const fijar = async (el, v) => { const proto = el.tagName === 'SELECT' ? x.HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? x.HTMLTextAreaElement.prototype : x.HTMLInputElement.prototype; x.Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new x.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); await espera(30); };
    if (quien.tienda) { await fijar(dd.getElementById('login-tienda'), quien.tienda); await c(bt('Entrar')); } else await c(bt(quien.rol));
    await espera(300);
    const lectura = () => { const r = JSON.parse(x.localStorage.getItem('talento-balu-v2')); return r.datos || r; };
    await fn({ x, dd, c, bt, tab, txt, fijar, lectura });
    json = x.localStorage.getItem('talento-balu-v2'); dm.window.close();
  };
  const D = () => { const r = JSON.parse(json); return r.datos || r; };
  const likert = async (k, valor) => { const grupos = [...k.dd.querySelectorAll('[role=radiogroup]')]; for (const g of grupos) { const b = [...g.querySelectorAll('button')].find((y) => y.textContent.trim() === String(valor)); await k.c(b); } };

  // 1. Cajero evaluado por el Gerente de Tienda
  await sesion({ tienda: uPropatria.id }, async (k) => {
    await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Pendientes'));
    const fila = [...k.dd.querySelectorAll('tr')].find((r) => r.textContent.includes('Prueba' + 'W-NB-CAJ'));
    ok(Boolean(fila), 'El Gerente de Tienda ve al Cajero como pendiente de Nine-Box');
    await k.c(fila.querySelector('button'));
    await likert(k, 4);
    await k.c(k.bt('Guardar evaluación')); await espera(200);
  });
  const ev1 = D().evaluaciones.find((e) => e.trabajadorId === 'W-NB-CAJ');
  ok(ev1 && ev1.calibracion && ev1.calibracion.slots.join() === 'marca,operaciones' && ev1.calibracion.estado === 'PENDIENTE', 'La evaluación nace con calibración pendiente (Marca + Operaciones)');
  const sol1 = D().solicitudes.find((s) => s.id === ev1.solicitudId);
  ok(sol1.pasos.map((p) => p.rol).join() === 'tienda,calibracion,rrhh' && !sol1.pasos.some((p) => p.rol === 'general'), 'Ruta del Cajero: tienda → calibración → RRHH, sin Gerencia General');
  ok(sol1.pasoActual === 1 && sol1.pasos[0].estado === 'APROBADO', 'El Gerente de Tienda queda aprobado y la solicitud espera la calibración');
  const caja0 = ev1.cajaNineBox;

  // 2. Marca confirma; no cierra con una sola confirmación
  await sesion({ rol: 'Gerente de Marca' }, async (k) => {
    await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Calibración Nine-Box'));
    ok(k.txt().includes('Prueba' + 'W-NB-CAJ'), 'Gerente de Marca ve al Cajero en la calibración');
    ok(!k.txt().includes('PruebaW-NB-ADM'), 'Gerente de Marca NO ve la Nine-Box del personal administrativo');
    await k.c(k.bt('Confirmar')); await k.c(k.dd.getElementById('cal-enviar'));
  });
  let ev2 = D().evaluaciones.find((e) => e.id === ev1.id);
  ok(ev2.calibracion.estado === 'PENDIENTE' && Object.keys(ev2.calibracion.confirmaciones).join() === 'marca', 'Con una sola confirmación la calibración NO se cierra');
  ok(D().solicitudes.find((s) => s.id === ev1.solicitudId).pasos[1].estado === 'PENDIENTE', 'La solicitud sigue esperando la calibración');

  // 3. Operaciones mueve la caja (justificación obligatoria) → se reinician confirmaciones
  const nueva = caja0 === 9 ? 8 : caja0 + 1;
  await sesion({ rol: 'Gerente de Operaciones' }, async (k) => {
    await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Calibración Nine-Box'));
    await k.c(k.bt('Mover')); await k.fijar(k.dd.getElementById('cal-caja'), String(nueva)); await k.fijar(k.dd.getElementById('cal-texto'), 'corto'); await k.c(k.dd.getElementById('cal-enviar'));
  });
  ok(D().evaluaciones.find((e) => e.id === ev1.id).calibracion.movimientos.length === 0, 'Sin justificación suficiente no se mueve la caja');
  await sesion({ rol: 'Gerente de Operaciones' }, async (k) => {
    await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Calibración Nine-Box'));
    await k.c(k.bt('Mover')); await k.fijar(k.dd.getElementById('cal-caja'), String(nueva)); await k.fijar(k.dd.getElementById('cal-texto'), 'Resultados de caja sostenidos en el semestre'); await k.c(k.dd.getElementById('cal-enviar'));
  });
  ev2 = D().evaluaciones.find((e) => e.id === ev1.id);
  ok(ev2.calibracion.movimientos.length === 1 && ev2.calibracion.cajaFinal === nueva && Object.keys(ev2.calibracion.confirmaciones).length === 0, 'Mover la caja con justificación reinicia las confirmaciones');
  await sesion({ rol: 'Gerente de Operaciones' }, async (k) => { await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Calibración Nine-Box')); await k.c(k.bt('Confirmar')); await k.c(k.dd.getElementById('cal-enviar')); });
  ok(D().evaluaciones.find((e) => e.id === ev1.id).calibracion.estado === 'PENDIENTE', 'Tras confirmar Operaciones sigue abierta (falta Marca)');
  await sesion({ rol: 'Gerente de Marca' }, async (k) => { await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Calibración Nine-Box')); await k.c(k.bt('Confirmar')); await k.c(k.dd.getElementById('cal-enviar')); });
  ev2 = D().evaluaciones.find((e) => e.id === ev1.id);
  ok(ev2.calibracion.estado === 'CERRADA' && ev2.cajaNineBox === nueva && ev2.calibracion.cajaOriginal === caja0, 'Con las dos confirmaciones se cierra y la caja calibrada queda vigente');
  const acta = D().documentos.find((d) => d.clave === 'acta-calibracion' && d.evaluacionId === ev1.id);
  ok(acta && acta.trabajadorId === 'W-NB-CAJ' && acta.html.includes('Resultados de caja sostenidos') && acta.html.includes('Caja original'), 'El acta queda en el expediente con la caja original, la calibrada y la justificación');
  const sol2 = D().solicitudes.find((s) => s.id === ev1.solicitudId);
  ok(sol2.pasos[1].estado === 'APROBADO' && sol2.pasoActual === 2, 'La solicitud avanza a la validación de RRHH');

  // 4. RRHH valida y la evaluación queda aprobada
  await sesion({ rol: 'Gerente de RRHH' }, async (k) => {
    await k.c(k.bt('Solicitudes'));
    const fila = [...k.dd.querySelectorAll('tr')].find((r) => r.textContent.includes(ev1.solicitudId)); ok(Boolean(fila), 'RRHH ve la solicitud pendiente de validar');
    await k.c(fila);
    await k.c(k.bt('Validar'));
    const ta = k.dd.querySelector('textarea'); if (ta) await k.fijar(ta, 'Validada por RRHH tras la calibración de las gerencias.');
    const conf = [...k.dd.querySelectorAll('[role=dialog] button')].reverse().find((b) => /Validar|Confirmar|Aprobar/.test(b.textContent)); await k.c(conf);
  });
  ok(D().evaluaciones.find((e) => e.id === ev1.id).estadoAprobacion === 'APROBADA', 'Tras la validación de RRHH la evaluación queda aprobada (sin firma de Gerencia General)');

  // 5. Personal administrativo: supervisor evalúa; calibran supervisor + RRHH
  await sesion({ tienda: uPropatria.id }, async (k) => { await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Pendientes')); ok(!k.txt().includes('PruebaW-NB-ADM'), 'El Gerente de Tienda no ve al personal administrativo'); });
  await sesion({ rol: 'Gerente de Operaciones' }, async (k) => {
    await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Pendientes'));
    const fila = [...k.dd.querySelectorAll('tr')].find((r) => r.textContent.includes('PruebaW-NB-ADM')); ok(Boolean(fila), 'El supervisor inmediato ve al administrativo pendiente');
    await k.c(fila.querySelector('button'));
    ok(k.txt().includes('Cumplimiento de objetivos del área') && k.txt().includes('Dominio técnico del cargo'), 'El formulario administrativo muestra sus preguntas');
    await likert(k, 3); await k.c(k.bt('Guardar evaluación')); await espera(200);
  });
  const evA = D().evaluaciones.find((e) => e.trabajadorId === 'W-NB-ADM');
  const solA = D().solicitudes.find((s) => s.id === evA.solicitudId);
  ok(evA.administrativo && evA.calibracion.slots.join() === 'supervisor,rrhh' && solA.pasos.map((p) => p.rol).join() === 'supervisor,calibracion,general', 'Ruta administrativa: supervisor → calibración (supervisor+RRHH) → Gerencia General');
  await sesion({ rol: 'Gerente de Marca' }, async (k) => { await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Historial')); ok(!k.txt().includes('PruebaW-NB-ADM'), 'Marca no ve la Nine-Box administrativa en el historial'); });
  await sesion({ rol: 'Gerente de Operaciones' }, async (k) => { await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Calibración Nine-Box')); await k.fijar(k.dd.getElementById('cal-grupo'), 'ADMIN'); await k.c(k.bt('Confirmar')); await k.c(k.dd.getElementById('cal-enviar')); });
  ok(D().evaluaciones.find((e) => e.id === evA.id).calibracion.estado === 'PENDIENTE', 'Administrativo: una confirmación no cierra');
  await sesion({ rol: 'Gerente de RRHH' }, async (k) => { await k.c(k.bt('Evaluaciones')); await k.c(k.tab('Calibración Nine-Box')); await k.fijar(k.dd.getElementById('cal-grupo'), 'ADMIN'); ok(k.txt().includes('PruebaW-NB-ADM'), 'RRHH ve la Nine-Box administrativa'); await k.c(k.bt('Confirmar')); await k.c(k.dd.getElementById('cal-enviar')); });
  const evA2 = D().evaluaciones.find((e) => e.id === evA.id);
  ok(evA2.calibracion.estado === 'CERRADA', 'Administrativo: cierra con supervisor + RRHH');
  console.log('OK ninebox ampliada');
})().catch((e) => { console.log('ERROR', e.message); process.exit(1); });
