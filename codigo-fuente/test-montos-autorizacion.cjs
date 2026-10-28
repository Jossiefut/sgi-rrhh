/* Montos y autorizaciones (RRHH y Administrador): monto fijo, porcentaje del salario integral / base, o en blanco */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const abrir = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.__EXPONER_PRUEBAS__ = true; w.scrollTo = () => {}; w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })); if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
const casi = (a, b) => Math.abs(a - b) < 0.006;
(async () => {
  /* ---- Cálculo ---- */
  let dom = abrir(); await espera(300); let w = dom.window, d = w.document;
  const P = w.__pruebas;
  const rem = [{ id: 'R1', trabajadorId: 't1', vigenteDesde: '2026-01-01', salarioBase: 300, moneda: 'USD' }, { id: 'R2', trabajadorId: 't2', vigenteDesde: '2026-01-01', salarioBase: 600, moneda: 'USD' }];
  const dat = (modo, pct, extra = {}) => ({ config: { valorPernocta: 20, apoyoMensual: 50, diasTrabajoQuincena: 10, montoModos: { PERNOCTA: modo, APOYO: modo }, montoPct: { PERNOCTA: pct, APOYO: pct }, ...extra }, remuneraciones: rem });
  const sol = (dp) => ({ datosPropuestos: { fecha: '2026-10-20', participantes: ['t1', 't2'], ...dp } });
  /* sin regla guardada (solicitudes anteriores): sigue el valor fijo de la configuración */
  ok(P.montoPernocta(dat('FIJO', 0), sol({})) === 40, 'Solicitudes anteriores: 2 personas × USD 20 = 40');
  /* porcentaje del salario integral: 300 × 1,125 = 337,5; diario 11,25; 50 % = 5,625; t2: 11,25 */
  let d1 = dat('PCT_INTEGRAL', 50);
  ok(casi(P.montoPernocta(d1, sol({ montoRegla: P.reglaMonto(d1, 'PERNOCTA') })), 16.88), 'Pernocta: 50 % del salario integral diario de 2 personas = 16,88');
  let d2 = dat('PCT_BASE', 50);
  ok(P.montoPernocta(d2, sol({ montoRegla: P.reglaMonto(d2, 'PERNOCTA') })) === 15, 'Pernocta: 50 % del salario base diario (5 + 10) = 15');
  /* la regla queda guardada: cambiar la configuración después no altera lo solicitado */
  const reg = P.reglaMonto(d2, 'PERNOCTA');
  ok(P.montoPernocta(dat('FIJO', 0), sol({ montoRegla: reg })) === 15, 'Un cambio posterior de la configuración no altera la pernocta ya solicitada');
  /* en blanco */
  let d3 = dat('BLANCO', 0);
  ok(P.pernoctaMontoPendiente(d3, sol({ montoRegla: P.reglaMonto(d3, 'PERNOCTA') })) === true && P.montoPernocta(d3, sol({ montoRegla: P.reglaMonto(d3, 'PERNOCTA') })) === 0, 'En blanco sin monto escrito: queda «por definir»');
  ok(P.montoPernocta(d3, sol({ montoRegla: P.reglaMonto(d3, 'PERNOCTA'), montoPersona: 15 })) === 30 && P.pernoctaMontoPendiente(d3, sol({ montoRegla: P.reglaMonto(d3, 'PERNOCTA'), montoPersona: 15 })) === false, 'En blanco con USD 15 por persona: 2 × 15 = 30');
  /* sin salario registrado */
  ok(P.pernoctaMontoPendiente(d1, { datosPropuestos: { fecha: '2026-10-20', participantes: ['tX'], montoRegla: P.reglaMonto(d1, 'PERNOCTA') } }) === true, 'Porcentaje sin salario registrado: queda «por definir»');
  /* apoyo: 5 días de 10 → mitad de la quincena. Integral 337,5 × 10 % = 33,75 al mes; quincena 16,875; 5 días = 8,44 */
  const da = dat('PCT_INTEGRAL', 10);
  ok(casi(P.montoApoyoPredeterminado(da, 5, 't1', '2026-10-20'), 8.44), 'Apoyo: 10 % del salario integral, 5 días de la quincena = 8,44');
  ok(P.montoApoyoPredeterminado(dat('BLANCO', 0), 5, 't1', '2026-10-20') === null, 'Apoyo en blanco: sin monto predeterminado');
  ok(P.montoApoyoPredeterminado(dat('FIJO', 0), 10, 't1', '2026-10-20') === 25, 'Apoyo fijo de USD 50 al mes: USD 25 por quincena completa');
  ok(P.montoApoyo({ montoDistinto: false, montoIndicado: true, montoPropuesto: 12, montoPredeterminado: null }) === 12, 'Apoyo con monto indicado a mano en la solicitud');
  dom.window.close();

  /* ---- Pantalla ---- */
  dom = abrir(); await espera(300); w = dom.window; d = w.document;
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); };
  const b = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  const poner = (el, v, ev = 'input') => { const p = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v); el.dispatchEvent(new w.Event(ev, { bubbles: true })); };
  await click(b('Administrador')); await espera(200);
  await click([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Montos y autorizaciones')));
  const opts = [...d.getElementById('mo-PERNOCTA').options].map((o) => o.textContent);
  ok(opts.length === 4 && opts.some((t) => /integral/.test(t)) && opts.some((t) => /En blanco/.test(t)), 'Cada concepto ofrece: fijo, % del salario integral, % del salario base y en blanco');
  poner(d.getElementById('mo-PERNOCTA'), 'PCT_INTEGRAL', 'change'); await espera(80);
  ok(Boolean(d.getElementById('pct-PERNOCTA')), 'Al elegir porcentaje aparece el campo del porcentaje');
  poner(d.getElementById('pct-PERNOCTA'), '50');
  poner(d.getElementById('mo-APOYO'), 'BLANCO', 'change'); await espera(80);
  ok(!d.getElementById('pg-apoyoMensual') && /No hay monto predeterminado/.test(d.querySelector('main').textContent), 'En blanco: no pide monto y explica que se escribe en cada solicitud');
  await click(b('Guardar')); await espera(150);
  const st = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const cfg = (st.config || (st.datos && st.datos.config) || {});
  ok(cfg.montoModos && cfg.montoModos.PERNOCTA === 'PCT_INTEGRAL' && cfg.montoModos.APOYO === 'BLANCO' && cfg.montoPct.PERNOCTA === 50, 'Se guarda la forma de cada concepto');
  poner(d.getElementById('pct-PERNOCTA'), '0'); await click(b('Guardar')); await espera(100);
  ok(/Revise los valores/.test(d.body.textContent), 'No permite guardar un porcentaje de 0');
  dom.window.close();

  /* ---- Formulario de pernocta ---- */
  const sembrar = (modo) => { const c = JSON.parse(JSON.stringify(st)); const k = c.config || (c.datos && c.datos.config); k.montoModos.PERNOCTA = modo; return JSON.stringify(c); };
  for (const [modo, espera_] of [['PCT_INTEGRAL', false], ['BLANCO', true]]) {
    dom = abrir(sembrar(modo)); await espera(300); w = dom.window; d = w.document;
    const click2 = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); };
    const b2 = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
    await click2(b2('Administrador')); await espera(200);
    await click2([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Pernoctas')));
    ok(Boolean(d.getElementById('pn-tienda')), 'Se abre el formulario de pernocta');
    ok(Boolean(d.getElementById('pn-monto')) === espera_, espera_ ? 'Con monto en blanco, el formulario exige el monto por persona' : 'Con porcentaje, el formulario no pide monto (se calcula)');
    dom.window.close();
  }
  /* ---- Quién puede cambiarlos ---- */
  for (const [rol, ve] of [['Gerente de RRHH', true], ['Administrador', true], ['Analista de RRHH', false], ['Gerente de Marca', false], ['Gerente General', false]]) {
    dom = abrir(); await espera(300); w = dom.window; d = w.document;
    const bt = [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(rol));
    if (!bt) { ok(false, `No se encontró el acceso ${rol}`); dom.window.close(); continue; }
    bt.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(250);
    const item = [...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Montos y autorizaciones'));
    ok(Boolean(item) === ve, ve ? `${rol} puede cambiar los montos` : `${rol} no ve los montos`);
    if (rol === 'Gerente de RRHH') {
      item.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(150);
      const sel = d.getElementById('mo-PERNOCTA');
      ok(Boolean(sel), 'RRHH abre el panel de montos');
      const p = Object.getPrototypeOf(sel); Object.getOwnPropertyDescriptor(p, 'value').set.call(sel, 'BLANCO'); sel.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(80);
      [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes('Guardar')).dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(150);
      const st2 = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
      const c2 = st2.config || (st2.datos && st2.datos.config) || {};
      ok(c2.montoModos && c2.montoModos.PERNOCTA === 'BLANCO', 'RRHH guarda el cambio de monto');
    }
    dom.window.close();
  }
})().catch((e) => { console.log('FALLO', e.message, (e.stack || '').split('\n')[1]); process.exitCode = 1; });
