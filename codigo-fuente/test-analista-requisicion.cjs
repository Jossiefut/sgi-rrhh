/* v1.25.0 · Perfil «Analista de RRHH» (sin aprobación, con descarga) y requisición de personal automática por egreso.
   - La requisición se crea sola con la baja del trabajador o con la carta de egreso (una por egreso).
   - Avisa a todos los perfiles de RRHH (Gerente y Analista) con el nombre de la tienda.
   - La firma el Gerente o el Subgerente de la tienda, de manera indistinta. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
let dom, w, d;
const crear = (estado) => {
  dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w0) { w0.__EXPONER_PRUEBAS__ = true; w0.scrollTo = () => {}; w0.URL.createObjectURL = () => 'blob:x'; w0.URL.revokeObjectURL = () => {}; if (estado) w0.localStorage.setItem('talento-balu-v2', estado); } });
  w = dom.window; d = w.document;
};
const click = async (el, ms = 200) => { const e = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entendido'); if (e && e !== el) { e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); } if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(ms); };
const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
const botonExacto = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim() === t);
const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
const cierraAvisos = async () => { for (let i = 0; i < 3; i++) { const b = [...d.querySelectorAll('[role=dialog] button')].find((x) => /Entendido|Cerrar/.test(x.textContent)); if (b) await click(b); } };
const estado = () => { const est = JSON.parse(w.localStorage.getItem('talento-balu-v2')); return est.datos || est; };
const bruto = () => w.localStorage.getItem('talento-balu-v2');
const escribe = async (id, v) => { const el = d.getElementById(id); const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); await espera(80); };

(async () => {
  /* ---------- 1. Baja en el sistema (ejecutar la desincorporación) ---------- */
  crear(); await espera(400);
  const raw0 = JSON.parse(w.localStorage.getItem('talento-balu-v2')); const dd = raw0.datos || raw0; dom.window.close();
  const s3 = dd.solicitudes.find((s) => s.id === 'S003'); const tr = dd.trabajadores.find((x) => x.id === s3.trabajadorId);
  const tienda = dd.tiendas.find((t) => t.id === tr.tiendaId);
  const usrTienda = dd.usuarios.find((u) => u.rol === 'tienda' && u.tiendaId === tr.tiendaId);
  ok(Boolean(tr && tienda && usrTienda), `Datos de prueba: ${tr.nombres} ${tr.apellidos} · ${tienda.nombre} · ${usrTienda.id}`);
  ok(!(dd.requisiciones || []).length, 'Al comenzar no hay requisiciones');

  crear(bruto ? JSON.stringify(raw0) : undefined); await espera(400);
  await click(botonExacto('Gerente de RRHH') || boton('Gerente de RRHH')); await cierraAvisos();
  await click(boton('Pendientes de mi aprobación'));
  await click([...d.querySelectorAll('tr')].find((r) => r.textContent.includes('S003')));
  await click(boton('Ejecutar', 0)); await click([...d.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.trim() === 'Ejecutar'));
  let e = estado();
  ok(e.trabajadores.find((x) => x.id === tr.id).estatus === 'EGRESADO', 'La baja deja al trabajador EGRESADO');
  let req = (e.requisiciones || []).filter((r) => r.trabajadorId === tr.id);
  ok(req.length === 1, 'Se generó una sola requisición de manera automática');
  ok(req[0] && req[0].estado === 'PENDIENTE_FIRMA' && req[0].origen === 'BAJA', 'Queda por firmar y su origen es la baja en el sistema');
  ok(req[0] && req[0].tiendaNombre === tienda.nombre && req[0].cargoId === tr.cargoId, 'Lleva el nombre de la tienda y el cargo a reponer');
  ok(e.bitacora.some((b) => b.entidad === 'Requisición de personal' && b.accion === 'CREAR'), 'La creación queda en la bitácora');
  /* Recordatorio del Gerente de RRHH */
  await click(nav('Recordatorios'));
  ok(d.getElementById('root').textContent.includes(`Reponer personal en ${tienda.nombre}`), 'El Gerente de RRHH recibe el aviso con el nombre de la tienda');
  const rawTrasBaja = bruto(); dom.window.close();

  /* ---------- 2. Analista de RRHH ---------- */
  crear(rawTrasBaja); await espera(400);
  const btnAnalista = boton('Analista de RRHH');
  ok(Boolean(btnAnalista), 'El acceso muestra el perfil «Analista de RRHH»');
  await click(btnAnalista); await cierraAvisos();
  const menu = [...d.querySelectorAll('aside nav button')].map((b) => b.textContent.trim().replace(/\s*\d+$/, ''));
  ok(menu.includes('Documentos') && menu.includes('Directorio') && menu.includes('Informes'), 'El Analista ve Documentos, Directorio e Informes');
  ok(menu.includes('Requisiciones de personal') && menu.includes('Recordatorios'), 'El Analista ve Requisiciones de personal y Recordatorios');
  ok(!menu.includes('Nuevo ingreso') && !menu.includes('Configuración') && !menu.includes('Usuarios y accesos') && !menu.includes('Remuneración del personal') && !menu.includes('Modelos de compensación') && !menu.includes('Evaluaciones'), 'No ve ingreso, configuración, usuarios, remuneración, modelos ni evaluaciones');
  await click(nav('Recordatorios'));
  ok(d.getElementById('root').textContent.includes(`Reponer personal en ${tienda.nombre}`), 'El Analista también recibe el aviso de reposición');
  await click(nav('Requisiciones de personal'));
  ok(d.querySelector('main h1').textContent.includes('Requisiciones de personal'), 'Abre el módulo de requisiciones');
  ok(d.getElementById('root').textContent.includes(tienda.nombre) && d.getElementById('root').textContent.includes(`${tr.nombres} ${tr.apellidos}`), 'Ve la requisición con la tienda y el trabajador que egresó');
  ok(Boolean(boton('Ver / PDF')), 'Puede ver y descargar el documento');
  ok(!botonExacto('Firmar') && !boton('Vacante cubierta') && !botonExacto('Anular'), 'No puede firmar, cerrar ni anular');
  await click(nav('Solicitudes'));
  ok(d.querySelector('main').textContent.includes('No tiene solicitudes por aprobar'), 'No tiene solicitudes por aprobar (no aprueba)');
  await click(nav('Documentos'));
  ok(Boolean(boton('Exportar a Excel')), 'En Documentos puede exportar a Excel');
  ok(!boton('Firmar y aprobar') && !boton('Aprobar'), 'No hay botones de aprobación');
  dom.window.close();

  /* ---------- 3. Firma de la tienda (Gerente o Subgerente, indistinto) ---------- */
  crear(rawTrasBaja); await espera(400);
  await escribe('login-tienda', usrTienda.id); await click(botonExacto('Entrar'), 300); await cierraAvisos();
  await click(nav('Recordatorios'));
  ok(d.getElementById('root').textContent.includes('Firmar la requisición de personal'), 'La tienda recibe el aviso para firmar la requisición');
  await click(nav('Requisiciones de personal'));
  ok(Boolean(botonExacto('Firmar')), 'El Gerente de la tienda ve el botón Firmar');
  ok(!boton('Vacante cubierta'), 'La tienda no puede cerrar la vacante');
  await click(botonExacto('Firmar'));
  const sel = d.getElementById('rq-firmante'); const manual = d.getElementById('rq-nombre');
  if (sel) {
    const opcion = [...sel.options].find((o) => o.value);
    ok(Boolean(opcion), 'Ofrece al Gerente y Subgerente de la tienda como firmantes');
    await escribe('rq-firmante', opcion.value);
  } else { ok(Boolean(manual), 'Sin personal gerencial registrado: permite escribir el nombre'); await escribe('rq-nombre', 'Subgerente de Prueba'); await escribe('rq-cargo', 'Subgerente de Tienda'); }
  await click([...d.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.trim() === 'Firmar'));
  e = estado(); req = (e.requisiciones || []).find((r) => r.trabajadorId === tr.id);
  ok(req && req.estado === 'FIRMADA' && req.firma && req.firma.nombre && /Gerente|Subgerente/.test(req.firma.cargo), `Queda firmada por ${req && req.firma ? req.firma.nombre + ' (' + req.firma.cargo + ')' : '—'}`);
  ok(e.bitacora.some((b) => b.entidad === 'Requisición de personal' && b.accion === 'FIRMAR'), 'La firma queda en la bitácora');
  const rawFirmada = bruto(); dom.window.close();

  /* ---------- 4. RRHH cierra la requisición ---------- */
  crear(rawFirmada); await espera(400);
  await click(botonExacto('Gerente de RRHH') || boton('Gerente de RRHH')); await cierraAvisos();
  await click(nav('Requisiciones de personal'));
  await click(boton('Vacante cubierta'));
  await click([...d.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.trim() === 'Confirmar'));
  e = estado(); req = (e.requisiciones || []).find((r) => r.trabajadorId === tr.id);
  ok(req && req.estado === 'CUBIERTA', 'RRHH marca la vacante como cubierta');
  await click(nav('Recordatorios'));
  ok(!d.getElementById('root').textContent.includes(`Reponer personal en ${tienda.nombre}`), 'Cerrada la requisición, el aviso desaparece');
  dom.window.close();

  /* ---------- 5. Carta de egreso (reductor) ---------- */
  crear(); await espera(400);
  const { reducer } = w.__pruebas;
  const datos = JSON.parse(JSON.stringify(dd));
  const sol = datos.solicitudes.find((s) => ['EVAL_PRUEBA', 'EVAL_PROSECUCION', 'EVAL_FIJO'].includes(s.tipo) && s.trabajadorId !== tr.id) || datos.solicitudes.find((s) => s.id !== 'S003');
  const trCarta = datos.trabajadores.find((x) => x.id === sol.trabajadorId);
  sol.cartaCulminacion = { usuarioId: 'rrhh', fecha: '2026-10-14T09:00' };
  const antes = { datos, sesion: 'rrhh' };
  const t1 = reducer(antes, { type: 'FECHA_EGRESO_CARTA', payload: { solicitudId: sol.id, fechaEgreso: '2026-10-20', usuarioId: usrTienda.id, fecha: '2026-10-15T10:00', bitacora: { id: 'B-T', fecha: '2026-10-15T10:00', usuarioId: usrTienda.id, accion: 'EMITIR', entidad: 'Carta', entidadId: sol.id, detalle: 'x' } } });
  const rc = (t1.datos.requisiciones || []).filter((r) => r.trabajadorId === trCarta.id);
  const tiendaCarta = datos.tiendas.find((t) => t.id === trCarta.tiendaId);
  if (tiendaCarta && !tiendaCarta.administrativa && !trCarta.esPrueba) {
    ok(rc.length === 1 && rc[0].origen === 'CARTA' && rc[0].fechaEgreso === '2026-10-20', 'Al salir la carta de egreso se crea la requisición con la fecha de egreso');
    /* Si después se da de baja, no se duplica */
    const t2 = reducer(t1, { type: 'EDITAR_TRABAJADOR', payload: { id: trCarta.id, cambios: { estatus: 'EGRESADO', fechaEgreso: '2026-10-20', motivoEgreso: 'Término de contrato' }, bitacora: { id: 'B-T2', fecha: '2026-10-20T10:00', usuarioId: 'rrhh', accion: 'EDITAR', entidad: 'Trabajador', entidadId: trCarta.id, detalle: 'baja' } } });
    ok((t2.datos.requisiciones || []).filter((r) => r.trabajadorId === trCarta.id).length === 1, 'La baja posterior a la carta no duplica la requisición');
  } else ok(true, 'El trabajador de la carta es de prueba o administrativo: se omite');
  /* Egreso de personal administrativo (oficina): no genera requisición de tienda */
  const oficina = datos.tiendas.find((t) => t.administrativa);
  const trOfi = oficina ? datos.trabajadores.find((x) => x.tiendaId === oficina.id && x.estatus === 'ACTIVO') : null;
  if (trOfi) {
    const t3 = reducer({ datos, sesion: 'rrhh' }, { type: 'EDITAR_TRABAJADOR', payload: { id: trOfi.id, cambios: { estatus: 'EGRESADO', fechaEgreso: '2026-10-15', motivoEgreso: 'Renuncia voluntaria' }, bitacora: { id: 'B-T3', fecha: '2026-10-15T10:00', usuarioId: 'rrhh', accion: 'EDITAR', entidad: 'Trabajador', entidadId: trOfi.id, detalle: 'baja' } } });
    ok(!(t3.datos.requisiciones || []).some((r) => r.trabajadorId === trOfi.id), 'El egreso de personal de oficina no genera requisición de tienda');
  }
  /* Cargar datos de la nube (HIDRATAR) no genera requisiciones por los egresos antiguos */
  const t4 = reducer({ datos: { ...datos, trabajadores: datos.trabajadores.map((x) => ({ ...x, estatus: 'ACTIVO' })) }, sesion: 'rrhh' }, { type: 'HIDRATAR', payload: { datos, persistencia: true } });
  ok(!(t4.datos.requisiciones || []).length || t4.datos === datos, 'Cargar datos existentes no crea requisiciones');
  dom.window.close();
  process.exit(process.exitCode || 0);
})();
