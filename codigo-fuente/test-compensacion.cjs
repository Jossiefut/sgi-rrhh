/* Modelos de compensación: KPI por tipo de tienda, métodos, comisión por cargo y vendedor, ayuda mensual, permisos y repositorios (hasta 30). */
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
  const entrar = async (rol) => { const s = boton('Salir'); if (s) await click(s); await click(boton(rol, 0)); await espera(200); };

  // Permisos de visibilidad
  await entrar('Gerente de RRHH');
  ok(!!nav('Modelos de compensación'), 'RRHH ve Modelos de compensación');
  await entrar('Gerente de Marca');
  ok(!!nav('Modelos de compensación'), 'Gerente de Marca ve Modelos de compensación');
  await click(nav('Modelos de compensación'));
  ok(!boton('Nuevo modelo'), 'Gerente de Marca no puede crear ni cambiar modelos');
  await entrar('Gerente General');
  await click(nav('Modelos de compensación'));
  ok(!!boton('Nuevo modelo'), 'Gerencia General puede cambiar los modelos');
  const s0 = boton('Salir'); await click(s0);
  await escribe('login-tienda', 'gerente.propatria'); await click(boton('Entrar')); await espera(250);
  ok(!nav('Modelos de compensación'), 'Gerente de Tienda no ve Modelos de compensación');
  await entrar('Gerente de RRHH');

  // Alta de un modelo completo
  await click(nav('Modelos de compensación')); await click(boton('Nuevo modelo'));
  await escribe('mc-nombre', 'Modelo ventas Tipo A');
  await escribe('mc-c-0', 'Comisión por venta'); await escribe('mc-b-0', 'Venta neta de la tienda'); await escribe('mc-v-0', '1%');
  const ti = db().tiendas.find((x) => x.marca === 'BALU' && !x.administrativa);
  await marca(`mc-ti-${ti.id}`);
  ok(texto().includes('Tipo de tienda') && !!d.getElementById('mc-kpi-VENTA_TIENDA'), 'KPI: se eligen según el tipo de tienda del modelo');
  await marca('mc-kpi-VENTA_TIENDA'); await marca('mc-kpi-VENTA_POOL');
  ok(!!d.getElementById('mc-kc-0') && !!d.getElementById('mc-km-0') && !!d.getElementById('mc-ka-0-PROMEDIO') && !!d.getElementById('mc-ka-0-MEDIANA') && !!d.getElementById('mc-ka-0-TOTAL'), 'Cada KPI pide cómo se calcula, meses de referencia y promedio/mediana/total');
  await click(boton('Agregar otra variable'));
  ok(!!d.getElementById('mc-kn-2'), 'Espacio libre para otra variable');
  await click(boton('Guardar modelo'));
  ok(texto().includes('debe indicar cómo se calcula'), 'No guarda un KPI sin su forma de cálculo');
  await escribe('mc-kc-0', 'Facturación neta del mes sin IVA'); await escribe('mc-km-0', '6'); await marca('mc-ka-0-MEDIANA');
  ok(d.getElementById('mc-ka-0-MEDIANA').checked && !d.getElementById('mc-ka-0-PROMEDIO').checked, 'Promedio, mediana o total: se marca una sola');
  await escribe('mc-kc-1', 'Venta del pool entre vendedores'); await escribe('mc-km-1', '3'); await marca('mc-ka-1-TOTAL');
  await escribe('mc-kn-2', 'Venta de calzado'); await escribe('mc-kc-2', 'Pares vendidos por facturación'); await escribe('mc-km-2', '2');
  await escribe('mc-kr-0', 'R1');
  ok(!!d.getElementById('mc-m5095') && !!d.getElementById('mc-m100') && texto().includes('Método 5%/95%') && !texto().includes('pasivo'), 'Métodos: 5%/95% y 100% de impacto de la comisión');
  ok(d.getElementById('mc-corte').value === '2026-07-01', 'Fecha de corte inicial: 1 de julio de 2026');
  await marca('mc-fc-PORCENTAJE'); await escribe('mc-dcom', 'Porcentaje de la venta neta mensual del vendedor');
  ok(!!d.getElementById('mc-ic-UPT') && !!d.getElementById('mc-ic-UNIDADES') && !!d.getElementById('mc-ic-PROD_ESPECIALES'), 'Indicadores de la comisión: UPT, Unidades totales y Productos especiales vendidos por promoción vendida');
  await marca('mc-ic-UPT'); await marca('mc-ic-UNIDADES');
  ok(!d.getElementById('mc-icm-UNIDADES'), 'Sin canon de referencia no pide meses');
  await click(d.getElementById('mc-ic-UNIDADES').closest('div').querySelector('button'));
  ok(!!d.getElementById('mc-icm-UNIDADES'), 'El botón «Canon de referencia» pide la cantidad de meses anteriores');
  await escribe('mc-icm-UNIDADES', '8');
  await escribe('mc-pc-ASE', '1.5'); await escribe('mc-pp-ASE', '0.8');
  await escribe('mc-ay-ASE', '50');
  await click(boton('Agregar vendedor'));
  await click(boton('Guardar modelo'));
  const mc = db().modelosCompensacion.find((m) => m.nombre === 'Modelo ventas Tipo A');
  const lista = mc && mc.kpis[ti.formato];
  ok(mc && lista && lista.length === 3 && lista[0].meses === 6 && lista[0].agregacion === 'MEDIANA' && lista[0].repositorioId === 'R1' && lista[1].agregacion === 'TOTAL' && lista[2].nombreLibre === 'Venta de calzado', 'Modelo guardado con sus KPI, meses, referencia y variable libre');
  ok(mc && mc.indicadoresComision.length === 2 && mc.indicadoresComision.find((i) => i.kpiId === 'UNIDADES').referencia === true && Number(mc.indicadoresComision.find((i) => i.kpiId === 'UNIDADES').meses) === 8 && mc.indicadoresComision.find((i) => i.kpiId === 'UPT').referencia === false, 'Guarda los indicadores de la comisión con su canon de referencia y los meses elegidos');
  ok(mc && mc.metodos.m5095 && mc.metodos.m100 && mc.fechaCorte === '2026-07-01' && mc.comisionCargos.some((c) => c.cargoId === 'ASE' && c.pctVenta === '1.5' && c.pctPool === '0.8') && mc.ayudaPorCargo.ASE.monto === '50' && mc.formasComision.includes('PORCENTAJE') && mc.porVendedor.length === 0, 'Modelo guardado con métodos, % por cargo y con pool, ayuda mensual y forma de comisión');
  // Lo ve Gerente de Marca con la ayuda mensual
  await entrar('Gerente de Marca'); await click(nav('Modelos de compensación')); await click([...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.trim().startsWith('Modelos')));
  ok(texto().includes('Ayuda mensual') && texto().includes('Venta de calzado') && texto().includes('Mediana'), 'Gerente de Marca ve el modelo con la ayuda mensual');

  // Repositorios: hasta 30 y módulos que los usan
  await entrar('Gerente de RRHH'); await click(nav('Sincronización'));
  await click([...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.trim().startsWith('Repositorios')));
  ok(texto().includes('Módulos que lo usan') && texto().includes('de 30'), 'Repositorios indican qué módulos los usan y el máximo de 30');
  for (let i = 0; i < 40; i += 1) { const b = boton('Agregar repositorio'); if (!b || b.disabled) break; await click(b); }
  ok([...d.querySelectorAll('li')].filter((l) => l.textContent.includes('Módulos que lo usan')).length === 30 && boton('Agregar repositorio').disabled, 'Admite hasta 30 repositorios');
  await marca('rep-R2-m-compensacion');
  await click(boton('Guardar'));
  const repos = db().config.repositorios;
  ok(repos.length === 30 && repos.find((r) => r.id === 'R2').modulos.includes('compensacion'), 'Repositorios guardados con los módulos que los usan');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
