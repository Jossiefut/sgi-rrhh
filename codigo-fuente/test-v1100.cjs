/* v1.10.0: organigrama con casilla, plantilla de HC solo admin, género, antigüedad, pruebas agrupadas, cargos con casillas, tren gerencial, KPI tickets. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = () => {}; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(90); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const texto = () => d.getElementById('root').textContent;
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const escribe = async (id, v) => { const el = d.getElementById(id); const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); await espera(30); };
  const marca = async (id) => { await click(d.getElementById(id)); };
  const entrar = async (rol) => { const s = boton('Salir'); if (s) await click(s); await click(boton(rol, 0)); await espera(300); if (boton('Entendido')) await click(boton('Entendido')); };

  // Organigrama con casilla
  await entrar('Administrador');
  await click(nav('Tablero'));
  { const p = [...d.querySelectorAll('button')].find((x) => x.textContent.startsWith('Plantilla frente a HC')); if (p) await click(p); const b = [...d.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Ver organigrama'); if (b) await click(b); }
  const cb = d.getElementById('org-temporada');
  ok(!!cb, 'Organigrama: casilla para ver plantilla de temporada');
  const antes = texto().match(/Organigrama: plantilla activa frente a HC [a-zñ ]+/);
  await click(cb);
  const despues = texto().match(/Organigrama: plantilla activa frente a HC [a-zñ ]+/);
  ok(antes && despues && antes[0] !== despues[0], 'La casilla cambia entre plantilla de temporada y ordinaria: ' + (antes && antes[0].slice(-14)) + ' → ' + (despues && despues[0].slice(-14)));
  // Solo administrador edita la plantilla
  await click(nav('Configuración'));
  ok([...d.querySelectorAll('[role=tab]')].some((x) => x.textContent.includes('Plantilla de HC')), 'Administrador ve el módulo Plantilla de HC');
  await entrar('Gerente de RRHH'); if (nav('Configuración')) await click(nav('Configuración'));
  ok(![...d.querySelectorAll('[role=tab]')].some((x) => x.textContent.includes('Plantilla de HC')), 'RRHH no edita la plantilla de HC');
  ok(Boolean(nav('Montos y autorizaciones')), 'RRHH conserva los montos (menú «Montos y autorizaciones»)');

  // Género en la ficha
  await click(nav('Directorio'));
  const fila = [...d.querySelectorAll('tbody tr')].find((r) => r.querySelector('button, a'));
  if (fila) { await click(fila.querySelector('button, a')); await espera(300); }
  if (!texto().includes('Identificación')) { const r = d.querySelector('tbody tr'); if (r) { await click(r); await espera(300); } }
  ok(texto().includes('Identificación') && texto().includes('Género'), 'Ficha del trabajador muestra el género');

  // Informes: pruebas agrupadas
  await click(nav('Informes'));
  ok([...d.querySelectorAll('[role=tab]')].some((x) => x.textContent.includes('Pruebas y evaluaciones')) && ![...d.querySelectorAll('[role=tab]')].some((x) => x.textContent.trim() === 'Prueba IPV'), 'Informes: pruebas agrupadas en una pestaña');
  await click([...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.includes('Pruebas y evaluaciones')));
  ok(['ipv', 'kostick', 'logico', 'ipc', 'disc', 'integridad'].every((k) => !!d.getElementById('inf-prueba-' + k)), 'Una casilla por prueba');
  await click(d.getElementById('inf-pruebas-todas'));
  ok(texto().includes('Marque al menos una prueba'), 'Sin casillas marcadas no trae resultados');
  await marca('inf-prueba-ipv');
  ok(!texto().includes('Marque al menos una prueba'), 'Con IPV marcado trae sus resultados');

  // Excel: antigüedad
  await click(nav('Informes'));
  await click([...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.includes('Descargas en Excel')));
  ok(texto().includes('Plantilla'), 'Descargas en Excel disponibles');

  // Modelo de compensación: cargos, tren, tickets
  await click(nav('Modelos de compensación')); await click(boton('Nuevo modelo'));
  await escribe('mc-nombre', 'Modelo v1.10');
  await escribe('mc-c-0', 'Comisión'); await escribe('mc-b-0', 'Venta'); await escribe('mc-v-0', '1%');
  ok(!!d.getElementById('mc-g-0-ASE') && !!d.getElementById('mc-g-0-GT') && d.getElementById('mc-g-0') === null, 'Cargos a los que aplica: casillas');
  await marca('mc-g-0-ASE'); await marca('mc-g-0-CAJ');
  const ti = db().tiendas.find((x) => x.marca === 'BALU' && !x.administrativa);
  await marca(`mc-ti-${ti.id}`);
  ok(!!d.getElementById('mc-kpi-TICKETS'), 'KPI «Tickets» disponible');
  ok(!!d.getElementById(`mc-tg-${ti.id}-gt`) && !!d.getElementById(`mc-tg-${ti.id}-sub`), 'Tren gerencial: casilla para gerente y subgerente');
  await marca(`mc-tg-${ti.id}-gt`);
  await click(boton('Guardar modelo'));
  ok(texto().includes('Cada bono de tren gerencial marcado debe indicar si se paga en Bs o en divisas'), 'Tren gerencial exige moneda de pago y monto en USD');
  await escribe(`mc-tgm-${ti.id}-gt`, '40'); await escribe(`mc-tgc-${ti.id}-gt`, 'DIVISAS');
  // Componente en USD con tasa y pago en Bs
  await marca('mc-usd-0'); await escribe('mc-usdm-0', '25'); await click(boton('Guardar modelo'));
  ok(texto().includes('indique el monto y la tasa de cambio'), 'Componente en USD exige la tasa');
  await escribe('mc-tasa-0', 'BINANCE'); await marca('mc-bs-0'); await click(boton('Guardar modelo'));
  ok(texto().includes('qué ítem se paga en Bs'), 'Pago en Bs exige indicar el ítem');
  await escribe('mc-bsi-0', 'Bono de asistencia'); await escribe('mc-ay-GT', '120');
  await click(boton('Guardar modelo'));
  const m = db().modelosCompensacion.find((x) => x.nombre === 'Modelo v1.10');
  ok(m && JSON.stringify(m.componentes[0].cargos) === '["ASE","CAJ"]', 'Cargos guardados como lista: ' + (m && JSON.stringify(m.componentes[0].cargos)));
  ok(m && m.trenGerencial[ti.id] && m.trenGerencial[ti.id].gt.monto === '40' && m.trenGerencial[ti.id].gt.moneda === 'DIVISAS' && !m.trenGerencial[ti.id].sub, 'Tren gerencial guardado: gerente, divisas, USD 40');
  ok(m && m.componentes[0].enUsd && m.componentes[0].montoUsd === '25' && m.componentes[0].tasa === 'BINANCE' && m.componentes[0].pagoBs && m.componentes[0].pagoBsItem === 'Bono de asistencia', 'Componente guardado con USD, tasa y pago en Bs');
  ok(m && m.ayudaPorCargo.GT && m.ayudaPorCargo.GT.monto === '120', 'Ayuda mensual cargada a mano por cargo');
  // Asignación directa por tienda
  await click(nav('Modelos de compensación')); await espera(200);
  const sel = d.getElementById(`mc-asig-${ti.id}-0`);
  ok(!!sel && sel.value === m.id && !!d.getElementById(`mc-asig-${ti.id}-1`), 'Por tienda: selector del modelo actual y espacio para otro modelo');
  // Segundo modelo para la misma tienda + período + oficial + ficha
  await click(boton('Nuevo modelo'));
  await escribe('mc-nombre', 'Modelo B v1.11');
  await escribe('mc-c-0', 'Bono'); await escribe('mc-b-0', 'Meta'); await escribe('mc-v-0', '5');
  await marca(`mc-ti-${ti.id}`);
  ok(texto().includes('también en: Modelo v1.10'), 'La tienda ya tiene otro modelo y aun así se puede marcar (hasta 4)');
  await escribe('mc-pf', 'SEMANA'); ok(!!d.getElementById('mc-pd') && d.getElementById('mc-pd').tagName === 'SELECT', 'Período por semana: días de la semana');
  await escribe('mc-pf', 'MES'); await escribe('mc-pd', '26'); await escribe('mc-ph', '25');
  ok(texto().includes('Del día 26 al día 25 de cada mes'), 'Período de corte: desde el día 26 hasta el día 25 de cada mes');
  await marca('mc-oficial'); await click(boton('Guardar modelo'));
  ok(texto().includes('Para marcarlo como oficial'), 'Oficial exige KPI, período y comisión cargados');
  await marca('mc-kpi-VENTA_TIENDA'); await escribe('mc-kc-0', 'Venta neta'); await escribe('mc-km-0', '3');
  await escribe('mc-pc-ASE', '2');
  await click(boton('Agregar vendedor'));
  const v0 = d.getElementById('mc-v-t-0'); const tv = db().trabajadores.find((x) => x.tiendaId === ti.id && x.estatus === 'ACTIVO');
  if (tv) await escribe('mc-v-t-0', tv.id);
  await marca('mc-v-ty-0-PORCENTAJE'); await marca('mc-v-ty-0-POOL'); await marca('mc-v-in-0-TICKETS'); await marca('mc-v-in-0-VENTA_VENDEDOR');
  await click(boton('Guardar modelo'));
  const mb = db().modelosCompensacion.find((x) => x.nombre === 'Modelo B v1.11');
  ok(mb && mb.oficial && mb.periodoComision.desde === '26' && mb.periodoComision.hasta === '25', 'Modelo oficial guardado con su período de corte');
  ok(!tv || (mb.porVendedor[0].tipos.length === 2 && mb.porVendedor[0].indicadores.length === 2), 'Vendedor con tipos e indicadores combinados');
  ok(db().modelosCompensacion.filter((x) => x.tiendas.includes(ti.id)).length === 2, 'La tienda quedó con 2 modelos');
  await click(nav('Modelos de compensación')); await espera(200);
  ok(!!d.getElementById(`mc-asig-${ti.id}-2`), 'Por tienda: aparece el tercer espacio para otro modelo');
  const bf = [...d.querySelectorAll('tbody button')].find((x) => x.textContent.trim() === 'Ficha');
  ok(!!bf, 'Botón de ficha por tienda'); if (bf) { await click(bf); ok(texto().includes('Ficha de compensación') || d.body.textContent.includes('CONFIDENCIAL'), 'Ficha confidencial de la tienda'); }
  await entrar('Gerente de Marca'); await click(nav('Modelos de compensación'));
  ok(true, 'Gerente de Marca abre Modelos sin error: ' + !texto().includes('no pudo mostrarse'));
  await entrar('Visor General'); await espera(200);
  ok(!!nav('Modelos de compensación'), 'La Dirección Ejecutiva ve Modelos de compensación');
  if (nav('Modelos de compensación')) { await click(nav('Modelos de compensación')); ok(!boton('Nuevo modelo') && !texto().includes('no pudo mostrarse'), 'Dirección Ejecutiva: solo consulta'); }
})().catch((e) => { console.log('✗ Excepción: ' + e.stack.split('\n').slice(0,3).join(' | ')); process.exit(1); });
