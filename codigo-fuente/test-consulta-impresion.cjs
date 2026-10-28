const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const hay = (t) => [...d.querySelectorAll('button')].some((x) => x.textContent.trim().includes(t));
  const texto = () => d.body.textContent;
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  await click(boton('Consulta RRHH Futura', 0)); await espera(200);
  // Documentos: solo vista
  await click(nav('Documentos'));
  const ver = [...d.querySelectorAll('main tbody button')].find((b) => b.textContent.trim() === 'Ver'); await click(ver); await espera(150);
  const dl = [...d.querySelectorAll('[role=dialog]')].pop();
  ok(!!dl && !dl.textContent.includes('Descargar PDF') && !hay('Vista del documento') && dl.textContent.includes('solo puede visualizar los documentos'), 'Consulta: el documento se ve, sin descargar ni imprimir PDF');
  ok(dl.textContent.length > 300, 'Consulta: el contenido del documento sí es visible');
  await click(boton('Cerrar'));
  // Informes: imprimir tabla
  await click(nav('Informes'));
  ok(hay('Imprimir informe'), 'Consulta: puede imprimir los informes en tabla');
  await click(boton('Imprimir informe')); await espera(200);
  const dl2 = [...d.querySelectorAll('[role=dialog]')].pop();
  ok(!!dl2 && dl2.textContent.includes('Informe · Plantilla y HC') || (dl2 && dl2.textContent.includes('Descargar PDF')), 'Informe en tabla se abre con opción de PDF');
  ok(dl2 && dl2.textContent.includes('Descargar PDF') && !dl2.textContent.includes('solo puede visualizar'), 'Consulta: en el informe en tabla sí hay Descargar PDF');
  await click(boton('Vista del documento')); await espera(100);
  const vd = [...d.querySelectorAll('[role=dialog]')].pop(); const tv = vd.querySelectorAll('table').length;
  ok(tv > 0 && !/Ver detalle|Ver expediente|Ocultar/.test(vd.textContent) && vd.querySelectorAll('img').length > 0, `Informe imprimible: ${tv} tabla(s) de estatus con logo y sin botones`);
  await click(boton('Cerrar'));
  // Sin exportaciones
  await click(nav('Ingresos y egresos'));
  ok(!hay('Exportar ingresos') && !hay('Exportar egresos') && !hay('Exportar CSV'), 'Consulta: sin exportar ingresos/egresos');
  await click(nav('Directorio'));
  ok(!hay('Exportar CSV'), 'Consulta: sin exportar el directorio');
  // Entrevistas de salida (solo nombres) y estatus de solicitudes
  await click(nav('Informes')); await click(boton('Estatus de solicitudes'));
  const ths = [...d.querySelectorAll('main thead th')].map((t) => t.textContent.trim());
  ok(texto().includes('Estatus de solicitudes (') && ths.includes('Estatus') && !ths.includes('Flujo de aprobación'), 'Consulta: ve el estatus de las solicitudes');
  ok(![...d.querySelectorAll('main tbody button')].some((b) => /Aprobar|Rechazar|Devolver/.test(b.textContent)), 'Consulta: sin acciones de aprobación en las solicitudes');
  await click(boton('Egresos críticos (entrevistas'));
  const mt = d.querySelector('main').textContent;
  ok(mt.includes('Personal que respondió la entrevista de salida') && !/Cédula|Puntos|Causa del egreso|Aspecto negativo/.test(mt), 'Consulta: solo ve los nombres de quienes respondieron la entrevista de salida');
  await click(boton('Salir')); await click(boton('Gerente de RRHH', 0)); await espera(200);
  await click(nav('Directorio'));
  ok(hay('Exportar CSV'), 'RRHH conserva la exportación del directorio');
  await click(nav('Documentos'));
  const ver2 = [...d.querySelectorAll('main tbody button')].find((b) => b.textContent.trim() === 'Ver'); await click(ver2); await espera(150);
  const dl3 = [...d.querySelectorAll('[role=dialog]')].pop();
  ok(dl3.textContent.includes('Descargar PDF'), 'RRHH conserva la descarga de PDF');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
