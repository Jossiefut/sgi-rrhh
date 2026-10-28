/* Firmantes de amonestaciones y representantes legales de las empresas (solo Administrador) */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const abrir = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })); w.HTMLElement.prototype.scrollIntoView = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
(async () => {
  let dom = abrir(); await espera(300); let w = dom.window, d = w.document;
  let click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); };
  let b = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  const poner = (el, v, ev = 'input') => { const p = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v); el.dispatchEvent(new w.Event(ev, { bubbles: true })); };
  const tab = (t) => [...d.querySelectorAll('[role=tab], button')].find((x) => x.textContent.trim() === t);
  /* RRHH no ve la configuración de firmantes */
  await click(b('Gerente de RRHH')); await espera(200);
  ok(![...d.querySelectorAll('aside nav button')].some((x) => x.textContent.trim().startsWith('Configuración')), 'RRHH no tiene acceso a Configuración');
  dom.window.close();
  dom = abrir(); await espera(300); w = dom.window; d = w.document;
  click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); };
  b = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  await click(b('Administrador')); await espera(200);
  await click([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Configuración')));
  /* Representante legal de Planeta */
  await click(tab('Empresas'));
  poner(d.getElementById('emp-PLANETA-rep-nombre'), 'maria prueba'); poner(d.getElementById('emp-PLANETA-rep-cedula'), 'V-11.111.111'); poner(d.getElementById('emp-PLANETA-rep-nacionalidad'), 'Venezolana');
  ok(d.getElementById('emp-BALU-rep-nombre').value === 'GENNIVIRG HERRERA', 'Balú ya trae su representante legal');
  await click(b('Guardar')); await espera(150);
  /* Firmantes */
  await click(tab('Firmantes de amonestaciones'));
  ok(d.getElementById('fa-rol-0').value === 'QUIEN AMONESTA' && d.getElementById('fa-rol-1').value === 'GERENTE DE RECURSOS HUMANOS', 'Parte de los firmantes por defecto');
  poner(d.getElementById('fa-nom-1'), 'Josselyn Tovar'); poner(d.getElementById('fa-cargo-1'), 'Gerente de Recursos Humanos');
  await click(b('Agregar representante legal'));
  ok(d.getElementById('fa-rol-3') && d.getElementById('fa-rol-3').value === 'REPRESENTANTE LEGAL', 'Agrega al representante legal como firmante');
  await click([...d.querySelectorAll('main button')].filter((x) => x.textContent.trim() === 'Guardar').pop()); await espera(200);
  const st = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const cfg = (st.datos ? st.datos.config : st.config);
  ok(Array.isArray(cfg.firmantesAmonestacion) && cfg.firmantesAmonestacion.length === 4 && cfg.firmantesAmonestacion[1].nombre === 'Josselyn Tovar', 'La configuración de firmantes queda guardada');
  ok(cfg.entidades && cfg.entidades.PLANETA.representante.nombre === 'MARIA PRUEBA', 'Queda guardado el representante legal de Planeta');
  /* Emitir como Administrador y revisar las firmas */
  await click([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Emitir amonestación')));
  const selT = d.getElementById('em-trab');
  poner(selT, [...selT.options].find((o) => o.value).value, 'change'); await espera(60);
  poner(d.getElementById('em-hechos'), 'No cumplió con la tarea asignada de reetiquetado.');
  await click(b('Vista previa')); await espera(300);
  const dlg = [...d.querySelectorAll('[role=dialog]')].find((x) => /Vista previa de la amonestación/.test(x.textContent));
  await click([...dlg.querySelectorAll('button, [role=tab]')].find((x) => x.textContent.includes('Vista del documento')));
  const t = dlg.textContent;
  ok(/Josselyn Tovar/.test(t) && /GERENTE DE RECURSOS HUMANOS/.test(t), 'El documento lleva al firmante de RRHH configurado');
  ok(/REPRESENTANTE LEGAL/.test(t) && /RECIBIDO POR EL TRABAJADOR/.test(t) && /QUIEN AMONESTA/.test(t), 'Lleva representante legal, quien amonesta y el trabajador');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message, (e.stack || '').split('\n')[1]); process.exitCode = 1; });
