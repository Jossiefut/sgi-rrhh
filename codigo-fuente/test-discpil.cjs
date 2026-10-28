const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 30) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const D = await import('./disc.js'); const P = await import('./integridad.js'); const PO = await import('./ponderacion.js');
  ok(Object.keys(PO.FIT_CARGO_INICIAL).every((c) => Object.values(PO.FIT_CARGO_INICIAL[c]).reduce((a, b) => a + b, 0) === 100), 'Ajuste al cargo: cada cargo suma 100');
  ok(PO.aplicaPrueba(null, 'PIL', 'CAJ') && PO.aplicaPrueba(null, 'PIL', 'JALM') && !PO.aplicaPrueba(null, 'PIL', 'VM') && !PO.aplicaPrueba(null, 'DISC', 'GT') && PO.aplicaPrueba(null, 'IPC', 'GT') && PO.aplicaPrueba(null, 'KOSTICK', 'SUB'), 'Aplicabilidad por cargo destino (DISC solo opcional de desarrollo)');
  const crear = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = () => {}; if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
  const d0 = crear(); await espera(300);
  const est0 = JSON.parse(d0.window.localStorage.getItem('talento-balu-v2')); d0.window.close();
  const base0 = est0.datos || est0; base0.accesosPrueba = (base0.accesosPrueba || []).filter((a) => a.cedula !== '14952361');
  const dom = crear(JSON.stringify(est0)); await espera(300);
  const w = dom.window, d = w.document; const texto = () => d.getElementById('root').textContent;
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2')); const datos = () => db().datos || db();
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(60); };
  const boton = (t, i = 0) => { const b = [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t)); if (!b[i]) throw new Error('No hay botón: ' + t); return b[i]; };
  const pestana = (t) => [...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.trim().startsWith(t));
  const setValor = (el, v) => { const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
  const set = (id, v) => setValor(d.getElementById(id), v);
  const enviar = async (form) => { form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await espera(150); };
  // --- RRHH envía a quien decide
  await click(boton('Gerente de RRHH', 0)); await espera(300); await click(boton('Evaluaciones')); await click(pestana('IPC, DISC e Integridad'));
  ok(texto().includes('Enviar una prueba a quien usted decida') && texto().includes('Resultados de la prueba de integridad') && texto().includes('Resultados del perfil DISC') && texto().includes('perfil por cargo'), 'RRHH: pestaña con envío, resultados y configuración');
  await enviar(d.getElementById('dp-busq').closest('form'));
  ok(texto().includes('Seleccione al trabajador') && texto().includes('Seleccione el cargo de referencia'), 'Envío: valida los campos obligatorios');
  set('dp-busq', 'Tovar'); await espera(200);
  await click([...d.querySelectorAll('button')].find((b) => /Tovar/.test(b.textContent) && /14952361/.test(b.textContent)));
  set('dp-cargo', 'CAJ'); await espera(100);
  ok(texto().includes('La más útil para el cargo') && !d.getElementById('dp-p-DISC').checked && d.getElementById('dp-p-PIL').checked && d.getElementById('dp-p-IPC').checked && d.getElementById('dp-p-LOGICO').checked, 'Cajero: se preselecciona la batería del cargo (Lógico, Integridad, IPC) y el DISC queda como opcional de desarrollo');
  await click(d.getElementById('dp-p-LOGICO')); await click(d.getElementById('dp-p-IPC')); await click(d.getElementById('dp-p-DISC')); await espera(100);
  await enviar(d.getElementById('dp-busq').closest('form'));
  if (!datos().accesosPrueba.find((a) => a.tipo === 'DIRECTO')) console.log('DBG', texto().slice(texto().indexOf('Destinatario'), texto().indexOf('Destinatario') + 900));
  const ac = datos().accesosPrueba.find((a) => a.cedula === '14952361' && a.tipo === 'DIRECTO');
  ok(ac && [...ac.bateria].sort().join() === 'DISC,PIL' && ac.cargoDestinoId === 'CAJ' && ac.apellidos, 'Acceso directo creado con DISC e Integridad para la persona de prueba');
  // --- La persona de prueba responde
  await click(boton('Salir')); { const ip = [...d.querySelectorAll('button')].find((b) => b.textContent.includes('Ir al portal')); if (ip) await click(ip); }
  set('pt-cedula', '14952361'); set('pt-clave', 'Tovar'); await enviar(d.querySelector('form'));
  ok(texto().includes('Evaluación para Cajero') && texto().includes('Perfil de comportamiento DISC') && texto().includes('28 grupos') && texto().includes('46 afirmaciones'), 'Portal: lista DISC (28 grupos) e Integridad (46 afirmaciones)');
  ok(!/Estilo|Dominancia|Apego a normas|Rechazo a las justificaciones/.test(texto()), 'Portal: no muestra escalas ni resultados');
  await click(boton('Comenzar', 0)); set('pt-nivel', 'Bachiller'); await click(boton('Comenzar la prueba'));
  ok(texto().includes('Grupo 1 de 28'), 'DISC: un grupo por pantalla');
  for (let n = 1; n <= 28; n += 1) {
    const g = D.DISC_GRUPOS[n - 1]; const wd = g.find((x) => x[1] === 'D')[0]; const ws = g.find((x) => x[1] === 'S')[0];
    await click([...d.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === `Más me describe: ${wd}`));
    if (n === 1) { ok(boton('Siguiente').disabled, 'DISC: no avanza con una sola marca'); await click([...d.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === `Menos me describe: ${wd}`)); ok(boton('Siguiente').disabled, 'DISC: la misma palabra no sirve para Más y Menos'); await click([...d.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === `Más me describe: ${wd}`)); }
    await click([...d.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === `Menos me describe: ${ws}`));
    if (n < 28) await click(boton('Siguiente'));
  }
  await click(boton('Revisar y enviar')); await click(boton('Enviar la prueba')); await click(boton('Sí, enviar la prueba'));
  ok(texto().includes('Prueba enviada') && !/Dominador|Ejecutor|Match/.test(texto()), 'DISC enviado: la persona no ve su resultado');
  await click(boton('Ver mis pruebas pendientes'));
  await click(boton('Comenzar', 0));
  ok(texto().includes('confidenciales y solo las ve el personal autorizado') && texto().includes('He leído y acepto'), 'Integridad: aviso de confidencialidad y aceptación');
  await click(boton('Comenzar la prueba'));
  ok(texto().includes('Marque «He leído y acepto»'), 'Integridad: no comienza sin aceptar');
  await click(d.getElementById('pt-acepto')); await click(boton('Comenzar la prueba'));
  ok(texto().includes('Afirmación 1 de 46') && texto().includes('Totalmente en desacuerdo') && texto().includes('Totalmente de acuerdo'), 'Integridad: una afirmación por pantalla con escala de cinco opciones');
  for (let n = 1; n <= 46; n += 1) {
    const it = P.PIL_ITEMS[n - 1]; let v = it[2] === '+' ? 5 : it[2] === '-' ? 1 : 2; if (n === 32) v = 4; /* una respuesta crítica */
    d.getElementById(`pt-q${n}-${v}`).click(); await espera(5);
    if (n < 46) await click(boton('Siguiente'));
  }
  await click(boton('Revisar y enviar')); await click(boton('Enviar la prueba')); await click(boton('Sí, enviar la prueba'));
  const ac2 = datos().accesosPrueba.find((a) => a.id === ac.id);
  ok(ac2.estado === 'COMPLETADA' && ac2.ev.PIL.aceptacion && ac2.pil && ac2.pil.resumen.conclusion === 'Revisar en entrevista', 'Integridad enviada: aceptación con fecha y hora y resumen guardado');
  // --- RRHH revisa
  await click(boton('Salir')); await click(boton('Salir')); await click(boton('Gerente de RRHH', 0)); await espera(300); await click(boton('Evaluaciones')); await click(pestana('IPC, DISC e Integridad'));
  ok(texto().includes('Pendiente de entrevista de integridad') && texto().includes('Revisar en entrevista'), 'RRHH: estatus pendiente de entrevista');
  const fd = [...d.querySelectorAll('table')].find((t) => t.textContent.includes('Estilo')).querySelector('tbody tr');
  ok(/Tovar/.test(fd.textContent) && fd.textContent.includes('Ejecutor') && fd.textContent.includes('50%'), 'RRHH: DISC con perfil D, estilo Ejecutor y match');
  await click([...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Registrar entrevista'));
  await click(boton('Guardar entrevista'));
  ok(texto().includes('Escriba la justificación') && texto().includes('Seleccione la decisión final') && texto().includes('Escriba el comentario'), 'Entrevista: exige comentarios, decisión y justificación');
  set('pil-c-32', 'La persona explicó que se refería a un accesorio de cortesía.'); set('pil-dec', 'CONTINUA'); set('pil-just', 'Aclaró el criterio en la entrevista.');
  await click(boton('Guardar entrevista'));
  const ac3 = datos().accesosPrueba.find((a) => a.id === ac.id);
  ok(ac3.pil.entrevista && ac3.pil.entrevista.decision === 'CONTINUA' && ac3.pil.entrevista.usuarioId && ac3.pil.resumen.conclusion === 'Revisar en entrevista', 'Decisión guardada como anotación; el resultado calculado no cambia');
  ok(datos().bitacora.some((b) => /Entrevista de integridad/.test(b.detalle || b.descripcion || JSON.stringify(b))), 'Bitácora con la entrevista');
  ok(texto().includes('Continúa según entrevista'), 'Estatus: continúa según entrevista');
  // informe completo
  await click([...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Informe completo'));
  await click(boton('Vista del documento'));
  const inf = [...d.querySelectorAll('[role=dialog]')].pop().textContent;
  ok(inf.includes('Índice de integridad') && inf.includes('Actitud ante la apropiación indebida') && inf.includes('Respuestas críticas') && inf.includes('Decisión de RRHH: Continúa') && inf.includes('Ningún resultado descarta por sí solo a una persona'), 'Informe completo: índice, escalas, críticas, decisión y nota al pie');
  await click(boton('Cerrar'));
  // no suma en indicadores
  const tarjeta = (t) => [...d.querySelectorAll('div')].find((x) => x.textContent.startsWith(t) && x.textContent.length < 120);
  ok(/Integridadcompletadas00accesos/.test(texto().replace(/\s+/g, '')), 'La persona de prueba no suma en los indicadores');
  // --- Visibilidad
  const estado = db();
  const entrar = async (fn) => { const dm = crear(JSON.stringify(estado)); await espera(300); const x = dm.window, dd = x.document; const c = async (el) => { if (!el) throw new Error('falta'); el.dispatchEvent(new x.MouseEvent('click', { bubbles: true })); await espera(80); }; const bt = (t) => [...dd.querySelectorAll('button')].find((b) => b.textContent.trim().includes(t)); await fn({ x, dd, c, bt }); x.close(); };
  const abrirPestana = async ({ c, bt, dd }) => { await c(bt('Evaluaciones')); await c([...dd.querySelectorAll('[role=tab]')].find((t) => t.textContent.trim().startsWith('IPC, DISC e Integridad'))); };
  const verResumen = async ({ c, bt, dd }) => {
    const txt = () => dd.getElementById('root').textContent;
    ok(txt().includes('Resultados de la prueba de integridad (1)') && txt().includes('Continúa según entrevista') && txt().includes('Revisar en entrevista'), 'Gerente: ve índice, conclusión y decisión');
    ok(![...dd.querySelectorAll('button')].some((b) => /Registrar entrevista|Ver o corregir entrevista|Informe completo/.test(b.textContent)) && !dd.getElementById('dp-busq'), 'Gerente: sin entrevista, sin informe completo, sin envío');
    await c(bt('Informe resumen')); await c(bt('Vista del documento'));
    const inf = [...dd.querySelectorAll('[role=dialog]')].pop().textContent;
    ok(inf.includes('Índice de integridad') && inf.includes('Decisión de RRHH: Continúa') && !inf.includes('Actitud ante la apropiación indebida') && !inf.includes('Respuestas críticas') && !inf.includes('accesorio') && !inf.includes('Aclaró el criterio'), 'Gerente: el informe resumen no trae escalas, críticas ni comentarios');
    const bd = JSON.stringify(dd.defaultView.localStorage.getItem('talento-balu-v2') ? 1 : 0); void bd;
  };
  await entrar(async (k) => { const { x, dd, c, bt } = k; const sel = dd.getElementById('login-tienda'); x.Object.getOwnPropertyDescriptor(sel.tagName === 'SELECT' ? x.HTMLSelectElement.prototype : x.HTMLInputElement.prototype, 'value').set.call(sel, 'gerente.propatria'); sel.dispatchEvent(new x.Event(sel.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); await c(bt('Entrar')); await espera(300); await abrirPestana(k); await verResumen(k); });
  await entrar(async (k) => { const { c, bt } = k; await c(bt('Gerente de Marca')); await espera(300); await abrirPestana(k); await verResumen(k); });
  await entrar(async (k) => { const { x, dd, c, bt } = k; const sel = dd.getElementById('login-tienda'); const otro = (estado.datos || estado).tiendas.find((t) => !t.administrativa && t.id !== 'T-PROPATRIA'); void otro; x.Object.getOwnPropertyDescriptor(sel.tagName === 'SELECT' ? x.HTMLSelectElement.prototype : x.HTMLInputElement.prototype, 'value').set.call(sel, 'gerente.tienda06'); sel.dispatchEvent(new x.Event(sel.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); await c(bt('Entrar')); await espera(300); await abrirPestana(k); const t = dd.getElementById('root').textContent; ok(t.includes('Resultados de la prueba de integridad (0)') && !t.includes('Josselyn'), 'Gerente de otra tienda: no ve resultados de esa persona'); });
  console.log('OK discpil');
})();
