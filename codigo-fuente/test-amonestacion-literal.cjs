/* Amonestaciones por literal del artículo 79 LOTTT: modelos, emisión con literal y registro */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const abrir = () => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })); w.HTMLElement.prototype.scrollIntoView = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; } });
(async () => {
  const dom = abrir(); await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); };
  const b = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  const poner = (el, v, ev = 'input') => { const p = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v); el.dispatchEvent(new w.Event(ev, { bubbles: true })); };
  await click(b('Gerente de RRHH')); await espera(200);
  const nav = [...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Emitir amonestación'));
  ok(Boolean(nav), 'RRHH ve «Emitir amonestación» en el menú');
  await click(nav);
  /* Modelos: uno por literal (a–k) */
  await click([...d.querySelectorAll('[role=tab], button')].find((x) => x.textContent.trim() === 'Modelos por literal'));
  const titulos = [...d.querySelectorAll('main h2, main h3')].map((x) => x.textContent.trim()).filter((t) => /^Literal “[a-k]”$/.test(t));
  ok(titulos.length === 11, `Hay un modelo por cada literal: ${titulos.length} de 11`);
  ok(/Causal grave/.test(d.querySelector('main').textContent), 'Los literales graves llevan aviso');
  /* Vista previa de un modelo (literal i) */
  const verI = [...d.querySelectorAll('main button')].filter((x) => x.textContent.trim() === 'Ver modelo')[8];
  await click(verI); await espera(300);
  const dlg = [...d.querySelectorAll('[role=dialog]')].find((x) => /Modelo · literal/.test(x.textContent));
  ok(Boolean(dlg), 'Se abre el visor con el modelo');
  if (dlg) {
    await click([...dlg.querySelectorAll('button, [role=tab]')].find((x) => x.textContent.includes('Vista del documento')));
    const txt = dlg.textContent;
    ok(/artículo 79, literal “i”/.test(txt) && /Falta grave a las obligaciones que impone la relación de trabajo/.test(txt), 'El modelo cita el artículo 79, literal “i” y su descripción');
    ok(/RECIBIDO POR EL TRABAJADOR/.test(txt) && /GERENTE DE RECURSOS HUMANOS/.test(txt) && /QUIEN AMONESTA/.test(txt), 'Lleva las tres firmas');
    await click([...dlg.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Cerrar'));
  }
  /* Emitir */
  await click([...d.querySelectorAll('[role=tab], button')].find((x) => x.textContent.trim() === 'Emitir'));
  const selT = d.getElementById('em-trab');
  const trabId = [...selT.options].find((o) => o.value).value;
  poner(selT, trabId, 'change'); await espera(80);
  poner(d.getElementById('em-literal'), 'f', 'change'); await espera(80);
  poner(d.getElementById('em-literal'), 'j', 'change'); await espera(80);
  ok(Boolean(d.getElementById('em-aviso-grave')), 'El literal «j» (abandono) muestra el aviso de causal grave');
  poner(d.getElementById('em-literal'), 'i', 'change'); await espera(80);
  ok(!d.getElementById('em-aviso-grave'), 'El literal «i» no muestra el aviso grave');
  await click(b('Registrar y generar'));
  ok(/mínimo 15/.test(d.querySelector('main').textContent), 'Exige describir los hechos');
  poner(d.getElementById('em-hechos'), 'Llegó 31 minutos tarde a su jornada sin justificación.');
  await click(b('Registrar y generar')); await espera(400);
  const st = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const lista = (st.datos ? st.datos.amonestaciones : st.amonestaciones) || [];
  const a = lista.find((x) => x.literal === 'i' && x.generada);
  ok(Boolean(a) && a.trabajadorId === trabId && /31 minutos/.test(a.motivo), 'La amonestación queda registrada con su literal y los hechos');
  const dlg2 = [...d.querySelectorAll('[role=dialog]')].find((x) => /Amonestación emitida/.test(x.textContent));
  ok(Boolean(dlg2), 'Se abre el documento generado');
  if (dlg2) {
    await click([...dlg2.querySelectorAll('button, [role=tab]')].find((x) => x.textContent.includes('Vista del documento')));
    ok(/Llegó 31 minutos tarde/.test(dlg2.textContent) && /literal “i”/.test(dlg2.textContent), 'El documento trae los hechos escritos y el literal');
  }
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message, (e.stack || '').split('\n')[1]); process.exitCode = 1; });
