/* Avisos por correo de solicitudes (cualquier tipo): decisión al solicitante y pendiente a quien debe aprobar */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 60) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.__EXPONER_PRUEBAS__ = true; w.scrollTo = () => {}; w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })); } });
  await espera(300);
  const { solicitudesDecididas: f, solicitudesPorAprobar: pa, aprobadoresPendientes: ap, avisosSolicitudes: av } = dom.window.__pruebas;
  ok(typeof f === 'function', 'Existe el detector de solicitudes aprobadas o rechazadas');
  const base = (id, estado, eventos = []) => ({ id, tipo: 'TRASLADO', estado, creadaPor: 'u1', eventos });
  const ev = (accion, usuarioId, extra = {}) => ({ accion, usuarioId, fecha: '2026-10-28', ...extra });
  const antes = { solicitudes: [base('S1', 'PENDIENTE'), base('S2', 'EN_REVISION'), base('S3', 'EN_REVISION'), base('S4', 'APROBADA', [ev('APROBADA', 'g1')]), base('S5', 'PENDIENTE'), base('S6', 'PENDIENTE')] };
  const despues = { solicitudes: [
    base('S1', 'RECHAZADA', [ev('RECHAZADA', 'g1')]),                       /* rechazo */
    base('S2', 'APROBADA', [ev('APROBADA', 'g1')]),                          /* aprobación final */
    base('S3', 'EN_REVISION', [ev('APROBADA', 'g1')]),                       /* aprobación intermedia: no avisa */
    base('S4', 'EJECUTADA', [ev('APROBADA', 'g1'), ev('EJECUTADA', 'g1')]),  /* ejecutar después de aprobada: no repite */
    { ...base('S5', 'RECHAZADA', [ev('RECHAZADA', 'g1')]), cerradaPorEgreso: true }, /* cierre automático por egreso */
    base('S6', 'APROBADA', [ev('APROBADA', 'otro')]),                        /* la decisión la tomó otra persona */
    base('S7', 'PENDIENTE'),
  ] };
  const r = f(antes, despues, 'g1');
  ok(r.includes('S1') && r.includes('S2'), 'Avisa al rechazar y al aprobar (aprobación final)');
  ok(!r.includes('S3'), 'No avisa en una aprobación intermedia (la solicitud sigue en revisión)');
  ok(!r.includes('S4'), 'No repite el aviso al ejecutar una solicitud ya aprobada');
  ok(!r.includes('S5'), 'No avisa el cierre automático por egreso del trabajador');
  ok(!r.includes('S6') && !r.includes('S7'), 'Solo avisa decisiones de quien está en sesión y no las solicitudes nuevas');
  ok(r.length === 2, 'Total de avisos: 2');
  ok(f(antes, antes, 'g1').length === 0 && f(null, despues, 'g1').length === 0, 'Sin cambios no hay avisos');
  /* Pendientes por aprobar */
  const usuarios = [
    { id: 'tienda1', rol: 'tienda', tiendaId: 'T1' }, { id: 'tienda2', rol: 'tienda', tiendaId: 'T2' },
    { id: 'marcaB', rol: 'marca', marca: 'BALU' }, { id: 'marcaP', rol: 'marca', marca: 'PLANETA' },
    { id: 'oper', rol: 'operaciones', marca: 'BALU' }, { id: 'rrhh1', rol: 'rrhh' }, { id: 'gen', rol: 'general' },
    { id: 'adm', rol: 'admin' }, { id: 'baja', rol: 'marca', marca: 'BALU', activo: false },
  ];
  const tiendas = [{ id: 'T1', marca: 'BALU' }, { id: 'T2', marca: 'PLANETA' }];
  const paso = (rol, extra = {}) => ({ rol, estado: 'PENDIENTE', ...extra });
  const sec = { ...base('P1', 'PENDIENTE'), creadaPor: 'tienda1', tiendaId: 'T1', pasoActual: 0, pasos: [paso('marca'), paso('operaciones'), paso('rrhh')], eventos: [ev('CREADA', 'tienda1')] };
  const dat = (...solicitudes) => ({ usuarios, tiendas, trabajadores: [], solicitudes });
  ok(JSON.stringify(ap(dat(sec), sec)) === JSON.stringify(['marcaB']), 'Paso de Gerencia de Marca: avisa solo al gerente de esa marca (no a la otra marca, ni al Administrador, ni a un usuario inactivo)');
  const sec2 = { ...sec, estado: 'EN_REVISION', pasoActual: 2 };
  ok(JSON.stringify(ap(dat(sec2), sec2)) === JSON.stringify(['rrhh1']), 'En el paso de RRHH avisa a RRHH');
  const quorum = { ...sec, id: 'Q1', modo: 'QUORUM', pasos: [paso('marca', { grupo: 'PARALELO' }), paso('operaciones', { grupo: 'PARALELO' }), paso('rrhh', { grupo: 'PARALELO' }), paso('general', { grupo: 'FINAL' })] };
  ok(JSON.stringify(ap(dat(quorum), quorum).sort()) === JSON.stringify(['marcaB', 'oper', 'rrhh1']), 'Solicitud por quórum: avisa a cada aprobador pendiente');
  ok(JSON.stringify(ap(dat({ ...quorum, faseFinal: true }), { ...quorum, faseFinal: true })) === JSON.stringify(['gen']), 'Al pasar a la fase final avisa a Gerencia General');
  ok(ap(dat(sec), { ...sec, estado: 'RECHAZADA' }).length === 0, 'Una solicitud cerrada no genera aviso de pendiente');
  /* Detección de pendientes */
  const nueva = { ...sec, id: 'N1' };
  ok(pa({ solicitudes: [] }, { solicitudes: [nueva] }, 'tienda1').includes('N1'), 'Una solicitud nueva avisa a quien debe aprobarla');
  ok(pa({ solicitudes: [sec] }, { solicitudes: [{ ...sec, estado: 'EN_REVISION', pasoActual: 1, eventos: [ev('APROBADA', 'marcaB')] }] }, 'marcaB').length === 1, 'Al aprobar un paso intermedio avisa al siguiente aprobador');
  ok(pa({ solicitudes: [quorum] }, { solicitudes: [{ ...quorum, estado: 'EN_REVISION', eventos: [ev('APROBADA', 'marcaB')] }] }, 'marcaB').length === 0, 'En un quórum, la aprobación de uno no vuelve a avisar a los demás');
  ok(pa({ solicitudes: [{ ...quorum, estado: 'EN_REVISION' }] }, { solicitudes: [{ ...quorum, estado: 'EN_REVISION', faseFinal: true, eventos: [ev('APROBADA', 'rrhh1')] }] }, 'rrhh1').length === 1, 'En un quórum, al pasar a la fase final avisa a Gerencia General');
  ok(pa({ solicitudes: [] }, { solicitudes: [nueva] }, 'otro').length === 0, 'Solo avisa lo que hizo la persona en sesión');
  const a2 = av(dat(sec), dat({ ...sec, estado: 'EN_REVISION', pasoActual: 1, eventos: [ev('APROBADA', 'marcaB')] }), 'marcaB');
  ok(a2.length === 1 && a2[0].clase === 'PENDIENTE' && JSON.stringify(a2[0].destinatarios) === JSON.stringify(['oper']), 'Resultado completo: aviso PENDIENTE solo al aprobador de Operaciones');
  const a3 = av(dat(sec), dat({ ...sec, estado: 'RECHAZADA', eventos: [ev('RECHAZADA', 'marcaB')] }), 'marcaB');
  ok(a3.length === 1 && a3[0].clase === 'DECISION', 'Un rechazo genera el aviso de decisión para el solicitante');
  /* Servidor */
  const fn = fs.readFileSync('supabase/functions/notificar-solicitud/index.ts', 'utf8');
  ok(/FINALES\.includes\(s\.estado\)/.test(fn) && /ev\.usuarioId !== quien\.user\.id/.test(fn), 'El servidor valida estado final y que decidió quien llama');
  ok(/ultimo\.usuarioId !== quien\.user\.id/.test(fn) && /MAX_DESTINATARIOS/.test(fn), 'Para los pendientes valida quién actuó y limita los destinatarios');
  ok(/from\('perfiles'\)\.select\('correo, activo'\)/.test(fn) && /\.in\('id', ids\)/.test(fn), 'Los correos se toman de perfiles, no del navegador');
  ok(/Ya se avisó hoy/.test(fn), 'El servidor evita enviar dos veces el mismo aviso de decisión');
  ok(!/comentario|usuarioNombre|trabajador/i.test(fn.replace(/trabajadorId/g, '')), 'El correo no incluye motivo, nombres ni datos de la solicitud: solo el tipo y el resultado');
  ok(/notificarSolicitudes/.test(fs.readFileSync('nube.js', 'utf8')), 'nube.js invoca la función notificar-solicitud');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message, (e.stack || '').split('\n')[1]); process.exitCode = 1; });
