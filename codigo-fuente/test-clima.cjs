const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/app', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { const _e = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entendido'); if (_e && _e !== el) { _e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); }  if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(150); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const texto = () => d.body.textContent;
  const setValor = (el, v) => { const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
  const tab = (t) => [...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.trim().startsWith(t));
  const estado = () => { const e = JSON.parse(w.localStorage.getItem('talento-balu-v2')); return e.datos || e; };
  const irHash = async (h) => { w.location.hash = h; w.dispatchEvent(new w.HashChangeEvent('hashchange')); await espera(250); };

  await click(boton('Gerente de RRHH', 0)); await espera(200);
  ok(Boolean(nav('Clima laboral')), 'RRHH ve el módulo Clima laboral');
  await click(nav('Clima laboral'));
  ok(texto().includes('Empiece por crear una encuesta de clima'), 'Sin encuestas, el resumen invita a crear la primera');

  // --- ciclo anterior (histórico)
  await click(tab('Encuestas'));
  await click(boton('Cargar un ciclo anterior'));
  await click(boton('Guardar ciclo'));
  ok(texto().includes('Indique el nombre de la encuesta'), 'El ciclo anterior exige nombre');
  setValor(d.getElementById('ch-nombre'), 'Clima 2.º semestre 2025'); setValor(d.getElementById('ch-periodo'), '2025-S2');
  setValor(d.getElementById('ch-part'), '50'); setValor(d.getElementById('ch-univ'), '80');
  setValor(d.getElementById('ch-d-LID'), '70'); setValor(d.getElementById('ch-d-COM'), '60'); await espera();
  await click(boton('Guardar ciclo'));
  ok(texto().includes('Clima 2.º semestre 2025') && texto().includes('Ciclo anterior'), 'El ciclo anterior queda cargado');

  // --- nueva encuesta con la propuesta base
  await click(boton('Nueva encuesta de clima'));
  ok(d.querySelectorAll('li input[aria-label^="Texto de la pregunta"]').length === 22, 'La propuesta base trae 22 preguntas editables');
  await click(boton('Guardar'));
  ok(texto().includes('Indique el nombre'), 'Exige nombre');
  setValor(d.getElementById('cl-nombre'), 'Clima 1.er semestre 2026'); setValor(d.getElementById('cl-periodo'), '2026-S1'); setValor(d.getElementById('cl-fin'), '2099-12-31'); await espera();
  await click(boton('Guardar'));
  ok(texto().includes('Clima 1.er semestre 2026') && texto().includes('Borrador'), 'La encuesta queda en borrador');
  await click(boton('Activar'));
  await click([...d.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.trim() === 'Confirmar') || boton('Confirmar'));
  const ciclo = estado().climaCiclos.find((c) => c.nombre === 'Clima 1.er semestre 2026');
  ok(ciclo && ciclo.estado === 'ABIERTO' && ciclo.fechaInicio, 'Activada: queda abierta');
  const enlaceTxt = d.getElementById(`cl-enlace-${ciclo.id}`);
  ok(enlaceTxt && enlaceTxt.textContent.endsWith(`#clima=${ciclo.id}`), 'Se genera el enlace con el id del ciclo');
  const wa = [...d.querySelectorAll('a')].find((a) => a.textContent.includes('WhatsApp'));
  ok(wa && wa.href.startsWith('https://wa.me/?text=') && decodeURIComponent(wa.href).includes(`#clima=${ciclo.id}`), 'Botón de WhatsApp con el enlace y el mensaje');

  // --- portal público
  const trabs = estado().trabajadores.filter((t) => t.estatus === 'ACTIVO' && !t.esPrueba);
  const trabA = trabs[0];
  await irHash(`clima=${ciclo.id}`);
  ok(texto().includes('Encuesta de clima laboral') && d.getElementById('pc-cedula'), 'El enlace abre el portal de la encuesta');
  setValor(d.getElementById('pc-cedula'), '99999999'); await espera();
  await click(boton('Continuar'));
  ok(texto().includes('No encontramos esa cédula'), 'Una cédula inexistente no entra');
  const ced = String(trabA.cedula).replace(/\D/g, '');
  setValor(d.getElementById('pc-cedula'), ced); await espera();
  await click(boton('Continuar'));
  ok(texto().includes('Hola,') && d.querySelectorAll('[role=radio]').length === 22 * 5 + 11, 'Con su cédula ve las 22 preguntas con escala 1 a 5 y la pregunta eNPS de 0 a 10');
  await click(boton('Enviar mis respuestas'));
  ok(texto().includes('Faltan 23 preguntas'), 'No deja enviar incompleta');
  const grupos = [...d.querySelectorAll('[role=radiogroup]')];
  for (const gr of grupos) { const rs = gr.querySelectorAll('[role=radio]'); await click(rs.length === 11 ? rs[10] : rs[3]); } // 4 = de acuerdo; eNPS = 10
  ok(texto().includes('23 de 23 respondidas'), 'El contador marca 23 de 23');
  setValor(d.getElementById('pc-com'), 'Todo bien en general'); await espera();
  await click(boton('Enviar mis respuestas'));
  ok(texto().includes('Gracias por responder'), 'Respuesta enviada');
  ok(estado().climaRespuestas.length === 1 && estado().climaRespuestas[0].cedula === trabA.cedula && estado().climaRespuestas[0].tiendaId === trabA.tiendaId && estado().climaRespuestas[0].nps === 10, 'Queda guardada con cédula, tienda y respuesta eNPS');
  await click(boton('Salir'));
  ok(!w.location.hash.includes('clima'), 'Al salir se limpia el enlace');
  // segunda respuesta de la misma persona
  await irHash(`clima=${ciclo.id}`);
  setValor(d.getElementById('pc-cedula'), ced); await espera(); await click(boton('Continuar'));
  ok(texto().includes('Ya respondió esta encuesta'), 'No permite responder dos veces');
  await click(boton('Salir'));
  // Enlace de borrador / inexistente
  await irHash('clima=NO-EXISTE');
  ok(texto().includes('Enlace no disponible'), 'Enlace inexistente muestra aviso');
  await irHash('');

  // --- resultados
  await espera(200);
  ok(Boolean(nav('Clima laboral')), 'La sesión de RRHH sigue activa tras el portal');
  await click(nav('Clima laboral'));
  await click(tab('Resultados'));
  ok(texto().includes('Resultados por dimensión') && texto().includes('100,0%') || texto().includes('100%'), 'Resultados con la respuesta 4 en todo = 100 % favorable');
  ok(texto().includes('Participación') && texto().includes('1 de'), 'Muestra la participación');
  ok(texto().includes('Reservado') || texto().includes('menos de 5'), 'Los grupos pequeños quedan reservados');
  ok(texto().includes('Evolución entre ciclos') && texto().includes('Clima 2.º semestre 2025'), 'Compara con el ciclo anterior cargado a mano');
  ok(texto().includes('vs. ciclo anterior'), 'Muestra variación contra el ciclo anterior');

  // --- buzón
  await click(tab('Buzón de sugerencias'));
  await click(boton('Nueva campaña del buzón'));
  setValor(d.getElementById('cl-nombre'), 'Ideas para las tiendas 2026'); await espera();
  await click(boton('Guardar'));
  await click(boton('Activar'));
  await click([...d.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.trim() === 'Confirmar') || boton('Confirmar'));
  const camp = estado().climaCiclos.find((c) => c.tipo === 'SUGERENCIAS');
  ok(camp && camp.estado === 'ABIERTO' && camp.categorias.length >= 5, 'Campaña del buzón activa con sus temas');
  await irHash(`clima=${camp.id}`);
  ok(texto().includes('Buzón de sugerencias'), 'El portal del buzón abre');
  setValor(d.getElementById('pc-cedula'), ced); await espera(); await click(boton('Continuar'));
  await click(boton('Enviar idea'));
  ok(texto().includes('Cuéntenos su idea'), 'Pide una idea con detalle');
  setValor(d.getElementById('pc-cat'), 'OPER'); setValor(d.getElementById('pc-idea'), 'Crear un cuaderno digital de relevo de turno entre cajeros.'); await espera();
  await click(boton('Enviar idea'));
  ok(texto().includes('Gracias por su idea'), 'Idea enviada');
  await click(boton('Enviar otra idea'));
  setValor(d.getElementById('pc-cat'), 'VENTA'); setValor(d.getElementById('pc-idea'), 'Ofrecer combos de temporada en la entrada de la tienda.'); await espera();
  await click(boton('Enviar idea'));
  ok(estado().climaRespuestas.filter((r) => r.tipo === 'SUGERENCIA').length === 2, 'Una persona puede enviar más de una idea');
  await click(boton('Salir'));
  await irHash('');
  await click(nav('Clima laboral'));
  await click(tab('Buzón de sugerencias'));
  await click(tab('Tablero'));
  ok(texto().includes('Ideas recibidas') && texto().includes('Ideas por tema') && texto().includes('Operación de la tienda'), 'Tablero del buzón con ideas por tema');
  await click(tab('Informe de ideas'));
  ok(texto().includes('cuaderno digital') && texto().includes(trabA.cedula) && texto().includes('2 ideas'), 'El informe lista las ideas con la cédula del autor');
  await click(boton('Gestionar', 0));
  setValor(d.getElementById('bz-e-estado'), 'IMPLEMENTADA'); setValor(d.getElementById('bz-e-nota'), 'Se aplicó en abril'); await espera();
  await click(boton('Guardar'));
  ok(estado().climaRespuestas.some((r) => r.estadoIdea === 'IMPLEMENTADA' && r.notaRRHH === 'Se aplicó en abril'), 'RRHH cambia el estado de la idea y deja nota');
  setValor(d.getElementById('bz-estado'), 'IMPLEMENTADA'); await espera();
  ok(texto().includes('1 idea') && texto().includes('Se aplicó en abril'), 'Filtro por estado');
  await click(boton('Informe (PDF)'));
  await espera(300);
  ok(texto().includes('Informe de ideas'), 'Abre el informe de ideas');
  console.log('fin'); process.exit(process.exitCode || 0);
})();
