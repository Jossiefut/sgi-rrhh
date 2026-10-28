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
  const hay = (t) => [...d.querySelectorAll('button')].some((x) => x.textContent.trim().includes(t));
  const texto = () => d.body.textContent;
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2')).datos || JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  await click(boton('Gerente de RRHH', 0)); await espera(200);
  const tr = db().trabajadores.find((x) => x.estatus === 'ACTIVO' && x.tiendaId === 'T08');
  await click(nav('Sincronización'));
  await click(boton('Entrevistas de salida'));
  const enc = ['Id', 'Hora de finalización', 'Total de puntos', 'Nombres y Apellidos', 'Puntos: Nombres y Apellidos', 'Cédula de Identidad', 'Marca', 'Seleccione el lugar de la incidencia', 'Seleccione el lugar de la incidencia1', 'Cargo', 'Motivo de la salida', '¿En su opinión cual es el aspecto que más considera como negativo en la empresa ?', '¿Consideras que tuviste apoyo o guía de tu supervisor directo?', 'Puntos: ¿Consideras que tuviste apoyo o guía de tu supervisor directo?', '¿En su opinión cual tema considera ud que la empresa deba mejorar? '];
  const fila = (id, pts, nom, ced, marca, lugar, motivo, neg, apoyo, ptsA, mejorar) => [id, '05/10/2026 10:00', pts, nom, 0, ced, marca, lugar, '', 'Asesor de Ventas', motivo, neg, apoyo, ptsA, mejorar].join(';');
  const csv = [enc.join(';'), fila(11, 6, 'Persona Ficticia Uno', '90000001', 'Balú Moda', 'C.C. Propatria', 'Mejoras salariales', 'Ambiente laboral', 'No', 1, 'Remuneración'),
    fila(12, 2, 'Persona Ficticia Dos', '90000002', 'Planeta Sports', 'Orinokia', 'Estudios', 'Horarios', 'Si', 0, 'Horarios'),
    fila(13, 5, 'Persona Ficticia Tres', '90000003', 'Balú Moda', 'Lugar Desconocido', 'Mejoras salariales', 'Ambiente laboral', 'No', 1, 'Remuneración'),
    fila(14, 4, 'Persona Ficticia Cuatro', '90000004', 'Balú Moda', 'Sabana Grande', 'Otro empleo', 'Ambiente laboral', 'No', 1, 'Remuneración'),
    fila(15, 7, 'Persona Ficticia Cinco', tr ? tr.cedula : '90000005', 'Balú Moda', 'C.C. Propatria', 'Otro empleo', 'Comunicación', 'No', 1, 'Comunicación')].join('\n');
  const inp = d.getElementById('sd-salidas');
  Object.defineProperty(inp, 'files', { value: [new w.File([csv], 'salidas.csv', { type: 'text/csv' })] }); inp.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(400);
  ok(texto().includes('Entrevistas en el archivo5') && texto().includes('Críticas (más de 4 puntos)3') && texto().includes('Sin tienda reconocida1'), 'Vista previa: 5 entrevistas, 3 críticas (>4), 1 sin tienda');
  await click(boton('Importar entrevistas'));
  const es = db().entrevistasSalida;
  ok(es && es.length === 5, 'Se guardaron 5 entrevistas');
  ok(es.find((x) => x.id === 'ES-11').tiendaId === 'T01' && es.find((x) => x.id === 'ES-12').tiendaId === 'P01' && es.find((x) => x.id === 'ES-13').tiendaId === '', 'Clasificación por tienda: Propatria, Orinokia Planeta, desconocida sin clasificar');
  if (tr) ok(es.find((x) => x.id === 'ES-15').tiendaId === 'T08' && es.find((x) => x.id === 'ES-15').trabajadorId === tr.id, 'Con cédula en el sistema se toma la tienda del expediente');
  // reimportar no duplica
  await click(boton('Entrevistas de salida'));
  const inp2 = d.getElementById('sd-salidas');
  Object.defineProperty(inp2, 'files', { value: [new w.File([csv], 'salidas.csv', { type: 'text/csv' })] }); inp2.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(400);
  await click(boton('Importar entrevistas'));
  ok(db().entrevistasSalida.length === 5, 'Volver a cargar el mismo archivo no duplica');
  // Informe
  await click(nav('Informes'));
  ok(hay('Egresos críticos (entrevistas'), 'Informes tiene el módulo de egresos críticos');
  await click(boton('Egresos críticos (entrevistas'));
  const t = texto();
  ok(/Egresos críticos3/.test(t.replace(/\s+/g, '')) || t.includes('Más de 4 puntos'), 'KPI de egresos críticos visible');
  ok(t.includes('Egresos críticos (3)') && t.includes('Persona Ficticia Uno') && !t.includes('Persona Ficticia Cuatro'), 'Tabla de críticos: 3 (solo >4), con nombre para RRHH, el de 4 puntos no');
  ok(t.includes('Mejoras salariales') && t.includes('Sin apoyo ni guía del supervisor'), 'Causas del egreso: motivo y factores');
  ok(t.includes('Sin clasificar'), 'Muestra entrevistas sin clasificar');
  const asig = [...d.querySelectorAll('select')].find((s) => /Asignar tienda/.test(s.getAttribute('aria-label') || ''));
  asig.value = 'T02'; asig.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(200);
  ok(db().entrevistasSalida.find((x) => x.id === 'ES-13').tiendaId === 'T02', 'RRHH asigna la tienda a una entrevista sin clasificar');
  // Panel
  await click(boton('Salir')); await click(boton('Gerente General', 0)); await espera(200);
  await click(nav('Tablero'));
  ok(texto().includes('Egresos críticos (entrevistas de salida)') && /3 críticos de 5 entrevistas/.test(texto()), 'Tablero gerencial muestra egresos críticos');
  await click(nav('Informes'));
  await click(boton('Egresos críticos (entrevistas'));
  ok(!texto().includes('Persona Ficticia Uno') && texto().includes('Los nombres solo los ve RRHH'), 'Gerente General no ve nombres');
  // Tienda y consulta no lo ven
  await click(boton('Salir')); await click(boton('Consulta RRHH Futura', 0)); await espera(200);
  await click(nav('Informes'));
  await click(boton('Egresos críticos (entrevistas'));
  { const mt = d.querySelector('main').textContent;
    ok(mt.includes('Persona Ficticia Uno') && !/90000001|Mejoras salariales|Puntos|Causa del egreso/.test(mt), 'Consulta ve solo los nombres de quienes respondieron la entrevista'); }
  console.log(process.exitCode ? 'CON FALLAS' : 'TODO OK');
})().catch((e) => { console.error('ERROR', e); process.exit(1); });
