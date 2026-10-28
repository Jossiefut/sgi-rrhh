const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const crear = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/',
  beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = () => {}; if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
const espera = (ms = 30) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const L = await import('./logico.js'); const Q = await import('./logico-cuadernillo.js');
  // --- Corrección y mínimos
  const clave = L.LOGICO_CLAVE; const todas = {}; Object.keys(clave).forEach((n) => { todas[n] = clave[n]; });
  ok(L.LOGICO_TOTAL === 50 && Q.LOGICO_CUADERNILLO.length === 50 && Object.keys(clave).length === 50, 'Cuadernillo y clave con 50 preguntas');
  ok(L.corregirLogico(todas).correctas === 50 && L.corregirLogico({}).sinResponder === 50, 'Corrección: 50 correctas con la clave; vacío = 50 sin responder');
  ok(L.corregirLogico({ 13: 'b', 2: '156,0' }).correctas === 2 && L.corregirLogico({ 2: '155' }).incorrectas === 1, 'Corrección: letra en minúscula y número con decimales equivalentes');
  ok(L.evaluarMinimoLogico(40, 0).id === 'SIN_MINIMO' && L.evaluarMinimoLogico(39, 40).id === 'NO_CUMPLE' && L.evaluarMinimoLogico(40, 40).id === 'CUMPLE', 'Mínimo por cargo: sin definir, no cumple y cumple');
  ok(Q.LOGICO_CUADERNILLO.filter((q) => q.imagen).length === 7 && Q.LOGICO_CUADERNILLO.filter((q) => q.numero).length >= 10, 'Preguntas con figura (7) y con respuesta numérica');
  // --- Estado con mínimos definidos
  const d1 = crear(); await espera(300);
  const estado = JSON.parse(d1.window.localStorage.getItem('talento-balu-v2')); d1.window.close();
  estado.config.logicoMinimos = { CAJ: 40, GT: 40, CAJT: 40 };
  estado.config.versionBateria = 'DC-2026-04'; estado.config.bateriaCargo = { CAJ: ['LOGICO'], CAJT: ['LOGICO'] }; /* esta prueba aísla el Indicador Lógico del ingreso */
  const dom = crear(JSON.stringify(estado)); await espera(300);
  const w = dom.window, d = w.document; const texto = () => d.getElementById('root').textContent;
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(); for (let k = 0; k < 4; k++) { const ps = [...w.document.querySelectorAll('[data-plegado="1"]')]; if (!ps.length) break; ps.forEach((b) => b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))); await espera(); } };
  const boton = (t, i = 0) => { const b = [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t)); if (!b[i]) throw new Error('No hay botón: ' + t); return b[i]; };
  const pestana = (t) => [...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.trim().startsWith(t));
  const setValor = (el, v) => { const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const set = (id, v) => setValor(d.getElementById(id), v);
  const enviar = async (form) => { form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await espera(150); };
  // --- Alta de candidato a ingreso por RRHH
  await click(boton('Gerente de RRHH', 0)); await click(boton('Evaluaciones')); await click(pestana('Prueba IPV'));
  ok(texto().includes('Candidato a ingreso') && texto().includes('Resultados del Indicador Lógico I'), 'RRHH: pestaña con alta de candidatos y resultados del Indicador Lógico');
  await enviar(d.getElementById('ci-cedula').closest('form'));
  ok(texto().includes('Indique la cédula') && texto().includes('Seleccione el cargo al que aspira'), 'Alta de candidato: valida los campos obligatorios');
  const tienda = estado.tiendas.find((t) => !t.administrativa).id;
  const alta = async (ced, nom, ape) => { set('ci-cedula', ced); set('ci-nombres', nom); set('ci-apellidos', ape); set('ci-tienda', tienda); set('ci-cargo', 'CAJ'); await espera(); await enviar(d.getElementById('ci-cedula').closest('form')); };
  await alta('20111222', 'Mario Luis', 'Ñáñez Rojas');
  ok(texto().includes('Acceso creado para Mario Luis Ñáñez Rojas') && texto().includes('NANEZ'), 'Acceso de ingreso creado con la clave = primer apellido');
  const ac1 = db().accesosPrueba.find((a) => a.cedula === '20111222');
  ok(ac1 && ac1.tipo === 'INGRESO' && ac1.bateria.join() === 'LOGICO' && !ac1.trabajadorId && !ac1.solicitudId, 'Registro: tipo INGRESO, solo Lógico, sin trabajador ni solicitud');
  await alta('20111222', 'Mario Luis', 'Ñáñez Rojas');
  ok(texto().includes('Ya existe un acceso vigente'), 'No permite duplicar el acceso vigente del mismo cargo');
  await alta('20333444', 'Rosa', 'Prieto Gil');
  // --- El candidato presenta la prueba
  const presentar = async (ced, claveTxt, buenas) => {
    await click(boton('Salir')); { const ip = [...d.querySelectorAll('button')].find((b) => b.textContent.includes('Ir al portal')); if (ip) await click(ip); }
    set('pt-cedula', ced); set('pt-clave', claveTxt); await enviar(d.querySelector('form'));
    ok(texto().includes('Estas son las pruebas de su proceso de ingreso') && texto().includes('Ingreso como Cajero'), 'Portal ' + ced + ': proceso de ingreso como Cajero');
    await click(boton('Comenzar', 0)); set('pt-nivel', 'Bachiller'); await click(boton('Comenzar la prueba'));
    for (let i = 0; i < 50; i += 1) {
      const n = i + 1; const c = clave[n]; const num = d.querySelector('input[id^=pt-num-]');
      if (num) { setValor(num, buenas ? c : '9999'); await espera(3); num.dispatchEvent(new w.Event('focusout', { bubbles: true })); }
      else { const rs = [...d.querySelectorAll('input[type=radio]')]; const r = buenas ? rs.find((x) => x.value === c) : rs.find((x) => x.value !== c); r.click(); await espera(3); }
      if (i < 49) await click([...d.querySelectorAll('button')].find((b) => /^(Siguiente|Dejar sin responder y seguir)$/.test(b.textContent.trim())));
    }
    await click(boton('Revisar y enviar')); await click(boton('Enviar la prueba')); await click(boton('Sí, enviar la prueba'));
  };
  await presentar('20111222', 'ñañez', true);
  ok(db().accesosPrueba.find((a) => a.cedula === '20111222').estado === 'COMPLETADA', 'Candidato 1: prueba enviada');
  await presentar('20333444', 'PRIETO', false);
  // --- Resultados
  await click(boton('Salir')); await click(boton('Salir')); await click(boton('Gerente de RRHH', 0)); await click(boton('Evaluaciones')); await click(pestana('Prueba IPV'));
  const tabla = [...d.querySelectorAll('table')].find((t) => t.textContent.includes('Mínimo del cargo'));
  const f1 = [...tabla.querySelectorAll('tbody tr')].find((r) => r.textContent.includes('Ñáñez')); const f2 = [...tabla.querySelectorAll('tbody tr')].find((r) => r.textContent.includes('Prieto'));
  ok(f1.textContent.includes('50/50') && f1.textContent.includes('Cumple') && f1.textContent.includes('Ingreso'), 'Resultados: candidato 1 con 50/50 y cumple el mínimo');
  ok(f2.textContent.includes('Completada') && f2.textContent.includes('No alcanza'), 'Resultados: candidato 2 no alcanza el mínimo');
  const informe = async (fila) => { await click([...fila.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Informe')); await espera(150); await click(boton('Vista del documento')); const t = [...d.querySelectorAll('[role=dialog]')].pop().textContent; await click(boton('Cerrar')); return t; };
  const t1 = await informe(f1);
  ok(t1.includes('50 de 50') && t1.includes('Conclusión: Resultado favorable') && t1.includes('Pasos a seguir') && t1.includes('Ingreso') && !t1.includes('Respuesta correcta:'), 'Informe favorable: 50 de 50, conclusión y pasos a seguir');
  const t2 = await informe([...[...d.querySelectorAll('table')].find((t) => t.textContent.includes('Mínimo del cargo')).querySelectorAll('tbody tr')].find((r) => r.textContent.includes('Prieto')));
  ok(t2.includes('Conclusión: No alcanza la puntuación requerida') && t2.includes('60 días') && t2.includes('volver a presentar la prueba'), 'Informe no favorable: 60 días para volver a presentar');
  // --- Visibilidad: Gerente de Tienda de esa tienda y Consulta
  await click(boton('Salir'));
  ok(true, 'Fin');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
