/* Accesos a las pruebas para todo el personal de la organización: tiendas, oficinas administrativas y cargos corporativos */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const crear = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/',
  beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = () => {}; if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
const espera = (ms = 30) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const d1 = crear(); await espera(300);
  const estado = JSON.parse(d1.window.localStorage.getItem('talento-balu-v2')); d1.window.close();
  const dom = crear(JSON.stringify(estado)); await espera(300);
  const w = dom.window, d = w.document; const texto = () => d.getElementById('root').textContent;
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(); for (let k = 0; k < 4; k++) { const ps = [...w.document.querySelectorAll('[data-plegado="1"]')]; if (!ps.length) break; ps.forEach((b) => b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))); await espera(); } };
  const boton = (t, i = 0) => { const b = [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t)); if (!b[i]) throw new Error('No hay botón: ' + t); return b[i]; };
  const pestana = (t) => [...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.trim().startsWith(t));
  const setValor = (el, v) => { const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
  const set = (id, v) => setValor(d.getElementById(id), v);
  const enviar = async (form) => { form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await espera(150); };
  const oficina = estado.tiendas.find((t) => t.administrativa);
  ok(!!oficina, 'Existe al menos una oficina administrativa');
  await click(boton('Gerente de RRHH', 0)); await click(boton('Evaluaciones')); await click(pestana('Prueba IPV'));
  const selT = d.getElementById('ci-tienda'); const selC = d.getElementById('ci-cargo');
  ok([...selT.options].some((o) => o.value === oficina.id), 'Candidato a ingreso: se puede elegir una oficina administrativa');
  const perfil = [...selC.options].find((o) => /^ADM:[^:]+:.+/.test(o.value));
  ok(!!perfil && [...selC.options].some((o) => /^ADM:[^:]+$/.test(o.value)), 'Candidato a ingreso: se pueden elegir cargos administrativos (familia y cargo)');
  set('ci-cedula', '19888777'); set('ci-nombres', 'Ana María'); set('ci-apellidos', 'Del Valle Pérez'); set('ci-tienda', oficina.id); set('ci-cargo', perfil.value); await espera();
  await enviar(d.getElementById('ci-cedula').closest('form'));
  const ac = db().accesosPrueba.find((a) => a.cedula === '19888777');
  ok(ac && ac.tipo === 'INGRESO' && ac.tiendaId === oficina.id && ac.cargoDestinoId === perfil.value && ac.bateria.length >= 1 && !!ac.expira, 'Acceso de ingreso administrativo creado (oficina, cargo ADM, batería y vencimiento)');
  ok(texto().includes('DELVALLE'), 'Clave del apellido compuesto: DELVALLE');
  const nomPerfil = perfil.textContent.replace(/\s*\(.*\)$/, '').trim();
  ok(texto().includes('Acceso creado para Ana María Del Valle Pérez'), 'Panel de acceso creado');
  // Entra al portal con la clave tal como la escribiría la persona
  await click(boton('Salir')); { const ip = [...d.querySelectorAll('button')].find((b) => b.textContent.includes('Ir al portal')); if (ip) await click(ip); }
  set('pt-cedula', '19.888.777'); set('pt-clave', 'del valle'); await enviar(d.querySelector('form'));
  ok(texto().includes('Estas son las pruebas de su proceso de ingreso') && texto().includes(nomPerfil), 'Portal: entra con «del valle» y ve el cargo administrativo «' + nomPerfil + '»');
  // Clave incorrecta
  await click(boton('Salir').constructor ? [...d.querySelectorAll('button')].find((b) => /Salir|Cerrar/.test(b.textContent)) || boton('Salir') : boton('Salir'));
  const ipb = [...d.querySelectorAll('button')].find((b) => b.textContent.includes('Ir al portal')); if (ipb) await click(ipb);
  set('pt-cedula', '19888777'); set('pt-clave', 'perez'); await enviar(d.querySelector('form'));
  ok(!texto().includes('Estas son las pruebas de su proceso'), 'Portal: con «Pérez» (no es la clave) no entra');
})();
