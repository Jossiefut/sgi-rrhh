/* Plan de sucesión administrativo: lo proponen el Administrador y el Gerente de RRHH (sin aprobación); Gerencia General y Junta Directiva solo consultan */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const abrir = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })); if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
(async () => {
  let dom = abrir(); await espera(300);
  let w = dom.window, d = w.document;
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(80); };
  const boton = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  const entrar = async (rol) => { await click(boton(rol)); await espera(200); };
  const irSucesion = async () => {
    await click([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Plan de sucesión')));
    const tab = [...d.querySelectorAll('button, [role=tab]')].find((x) => x.textContent.trim().startsWith('Administrativa'));
    if (tab) await click(tab);
    return Boolean(tab);
  };
  await entrar('Administrador');
  const st = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const cargosAdm = st.cargos.filter((c) => c.administrativo).map((c) => c.id);
  if (cargosAdm.length < 2) { const base0 = st.cargos.find((c) => c.id === cargosAdm[0]); st.cargos.push({ ...base0, id: 'ADM-TEST-2', nombre: 'Coordinador administrativo de prueba', esGerencial: true }); cargosAdm.push('ADM-TEST-2'); }
  const libres = st.trabajadores.filter((x) => x.estatus === 'ACTIVO' && !x.esPrueba && !cargosAdm.includes(x.cargoId)).slice(0, 3);
  libres.forEach((x, i) => { x.cargoId = cargosAdm[i % 2]; x.nombres = 'Adm' + i; x.apellidos = 'Sucesion' + i; });
  const admins = libres;
  ok(admins.length >= 2, 'Hay al menos dos trabajadores administrativos activos (' + admins.length + ')');
  dom.window.close();
  /* Gerente de RRHH propone */
  dom = abrir(JSON.stringify(st)); await espera(300); w = dom.window; d = w.document;
  await entrar('Gerente de RRHH');
  ok(await irSucesion(), 'RRHH: ve la pestaña «Administrativa» en el plan de sucesión');
  ok(!d.body.textContent.includes('Por modelar'), 'Ya no aparece el aviso «Por modelar»');
  let btn = [...d.querySelectorAll('main button')].find((x) => x.textContent.includes('Proponer sucesor'));
  ok(Boolean(btn), 'RRHH: puede proponer sucesor');
  await click(btn);
  const dlg = () => [...d.querySelectorAll('[role=dialog]')].pop();
  let guardar = [...dlg().querySelectorAll('button')].find((x) => x.textContent.includes('Registrar sucesor'));
  await click(guardar);
  ok(/Seleccione al sucesor/.test(dlg() ? dlg().textContent : ''), 'Valida que se elija al sucesor');
  const sel = dlg().querySelector('select#sa-cand');
  const opcion = [...sel.options].find((o) => o.value);
  ok(Boolean(opcion), 'La lista ofrece personal administrativo como candidatos');
  const poner = (el, v) => { const p = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
  poner(sel, opcion.value); await espera(50);
  poner(dlg().querySelector('#sa-nota'), 'Buen desempeño y conocimiento del área'); await espera(50);
  guardar = [...dlg().querySelectorAll('button')].find((x) => x.textContent.includes('Registrar sucesor'));
  await click(guardar); await espera(150);
  const reg = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const nm = (reg.nominaciones || []).filter((n) => n.administrativo);
  ok(nm.length === 1 && nm[0].estado === 'REGISTRADO' && nm[0].candidatoId === opcion.value && nm[0].historial[0].accion === 'PROPONER', 'Queda registrado sin pasar por aprobación (estado REGISTRADO)');
  ok([...d.querySelectorAll('main button')].some((x) => x.textContent.trim() === 'Quitar'), 'El sucesor aparece en la tabla con opción «Quitar»');
  ok(d.querySelector('main').textContent.includes('Información confidencial'), 'Muestra el aviso de información confidencial');
  ok(!d.querySelector('main').textContent.includes('Aprobar'), 'No hay paso de aprobación');
  /* quitar */
  await click([...d.querySelectorAll('main button')].find((x) => x.textContent.trim() === 'Quitar')); await espera(150);
  const reg2 = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  ok((reg2.nominaciones || []).filter((n) => n.administrativo && n.estado === 'RETIRADO').length === 1, 'Quitar deja el sucesor como RETIRADO con historial');
  /* dejar uno registrado para los demás perfiles */
  const base = reg2; base.nominaciones.forEach((n) => { if (n.administrativo) n.estado = 'REGISTRADO'; });
  dom.window.close();
  for (const [rol, edita] of [['Administrador', true], ['Gerente General', false], ['Junta Directiva', false]]) {
    dom = abrir(JSON.stringify(base)); await espera(300); w = dom.window; d = w.document;
    await entrar(rol);
    const tiene = await irSucesion();
    ok(tiene, rol + ': ve la pestaña «Administrativa»');
    const puede = [...d.querySelectorAll('main button')].some((x) => x.textContent.includes('Proponer sucesor'));
    const verSucesor = d.querySelector('main').textContent.includes(admins[0].apellidos) || d.querySelector('main').textContent.includes('por ');
    ok(puede === edita, rol + (edita ? ': puede proponer sucesores' : ': solo consulta (sin botones de edición)'));
    ok(verSucesor, rol + ': ve los sucesores registrados');
    dom.window.close();
  }
  /* SQL de seguridad del servidor */
  const sql = fs.readFileSync('supabase/pendientes/20261016120000_sucesion_administrativa_seguridad.sql', 'utf8');
  ok((sql.match(/as RESTRICTIVE for (SELECT|INSERT|UPDATE|DELETE)/g) || []).length === 4, 'Migración: 4 políticas restrictivas (leer, crear, modificar, borrar)');
  ok(/for SELECT[\s\S]*'admin','rrhh','general','junta'/.test(sql) && !/for (INSERT|UPDATE|DELETE)[^;]*'general'/.test(sql), 'Migración: lee admin/rrhh/general/junta y escribe solo admin/rrhh');
  /* Tienda: el plan de tiendas no muestra las nominaciones administrativas */
  dom = abrir(JSON.stringify(base)); await espera(300); w = dom.window; d = w.document;
  await entrar('Administrador');
  await click([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Plan de sucesión')));
  ok(!/REGISTRADO/.test(d.querySelector('main').textContent), 'El plan de tiendas no mezcla las nominaciones administrativas');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
