/* v1.17.0: perfiles de cargo administrativos y corporativos (editables), tiendas Planeta Sports, vínculo con la estructura. Solo datos ficticios. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const fuente = fs.readFileSync('perfiles-adm.js', 'utf8');
  ok(!/Talent Booth|Booth/.test(fuente) && !/Futura/.test(fuente), 'Los perfiles no contienen el nombre de terceros ni de la casa matriz');
  ok(!/\b(Edad|Género|_edad|_genero)\b/.test(fuente.replace(/La edad, el género[^"]*/g, '')), 'No se cargan requisitos de edad ni género');
  for (const id of ['lider-de-desarrollo-de-producto', 'desarrollador-de-producto-disenador-de-moda', 'analista-de-datos', 'administrador-de-almacen', 'jefe-de-almacen-logistica-y-operaciones']) {
    const m = fuente.match(new RegExp('"' + id + '": \\{[\\s\\S]*?"competenciasTecnicas": (\\[[^\\]]*\\])'));
    ok(m && m[1].length > 10 && !/"incompleto": true/.test(fuente.slice(fuente.indexOf('"' + id + '"'), fuente.indexOf('"' + id + '"') + 400000).split('"id":')[1] || ''), 'Perfil completo cargado: ' + id);
  }
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(90); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const pestana = (t) => [...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.includes(t));
  const texto = () => d.getElementById('root').textContent;
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const escribe = async (id, v) => { const el = d.getElementById(id); const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); await espera(60); };
  const entrar = async (rol) => { const s = boton('Salir'); if (s) await click(s); await click(boton(rol, 0)); await espera(300); if (boton('Entendido')) await click(boton('Entendido')); };

  await entrar('Gerente de RRHH');
  await click(nav('Perfiles de cargo')); await espera(150);
  ok(!!pestana('Cargos administrativos y corporativos'), 'Perfiles de cargo: pestaña de cargos administrativos y corporativos');
  await click(pestana('Cargos administrativos y corporativos')); await espera(150);
  const opciones = () => [...d.getElementById('pa-cargo').querySelectorAll('option')].filter((o) => o.value);
  ok(opciones().length >= 42, `Se listan los perfiles (${opciones().length})`);
  await escribe('pa-marca', 'PLANETA'); const nPl = opciones().length; await escribe('pa-marca', 'BALU'); const nBa = opciones().length;
  ok(nPl > 10 && nBa > 10 && nPl + nBa >= 42, `Filtro por marca (Balú ${nBa}, Planeta ${nPl})`);
  await escribe('pa-marca', 'TODAS');
  const adm = opciones().find((o) => o.value === 'administrador-balu'); ok(!!adm, 'Existe el perfil «Administrador»');
  await escribe('pa-cargo', 'administrador-balu');
  let v = d.getElementById('pa-vista').textContent;
  ok(v.includes('Objetivo del cargo') && v.includes('Funciones por proceso') && v.includes('Competencias técnicas') && v.includes('Competencias blandas') && v.includes('Perfil requerido'), 'El perfil muestra objetivo, funciones, competencias y requisitos');
  ok(v.includes('Qué se espera en ese nivel'), 'Las competencias traen lo que se espera según el diccionario');
  ok(v.includes('Exámenes del cargo') && v.includes('Nine-Box de este cargo'), 'Muestra las pruebas y la Nine-Box del cargo');
  ok(!v.includes('Futura') && !v.includes('Booth'), 'El documento no menciona a terceros');
  // edición
  await click(d.getElementById('pa-editar')); await espera(100);
  ok(!!d.getElementById('pa-objetivo') && !!d.getElementById('pa-procesos'), 'RRHH puede editar el perfil');
  await escribe('pa-objetivo', ''); await click(d.getElementById('pa-guardar'));
  ok(texto().includes('Escriba el objetivo'), 'No guarda sin objetivo');
  await escribe('pa-objetivo', 'Objetivo de prueba del administrador');
  await escribe('pa-tec', 'Sin nivel'); await click(d.getElementById('pa-guardar'));
  ok(texto().includes('nivel de 1 a 5'), 'Valida el formato de las competencias');
  await escribe('pa-tec', 'Conocimientos contables | 5\nManejo de Excel | 4');
  for (const id of ['IPC', 'KOSTICK', 'LOGICO', 'PIL']) { const c = d.getElementById('pa-pr-' + id); if (!c.checked) await click(c); }
  ok(d.querySelectorAll('input[id^=pa-pr-]:checked').length <= 3, 'Máximo 3 pruebas por cargo');
  await escribe('pa-kpiNineBox', 'Cierres contables en fecha'); await escribe('pa-nombre', 'Administrador Prueba');
  await click(d.getElementById('pa-guardar')); await espera(150);
  const g = db().config.perfilesAdm && db().config.perfilesAdm['administrador-balu'];
  ok(g && g.objetivo === 'Objetivo de prueba del administrador' && g.competenciasTecnicas.length === 2 && g.competenciasTecnicas[0].nivel === 5, 'La edición se guarda en la configuración');
  ok(g && Array.isArray(g.pruebas) && g.pruebas.length >= 1 && g.pruebas.length <= 3, 'La batería propia del cargo se guarda');
  v = d.getElementById('pa-vista').textContent;
  ok(v.includes('Objetivo de prueba del administrador') && v.includes('Conocimientos contables') && v.includes('Cierres contables en fecha') && v.includes('Batería propia'), 'El perfil editado se muestra con los cambios');
  ok(texto().includes('Editado por RRHH'), 'Se indica que fue editado');
  await click(d.getElementById('pa-restablecer')); await click(d.getElementById('pa-restablecer-ok')); await espera(150);
  ok(!(db().config.perfilesAdm || {})['administrador-balu'] && !d.getElementById('pa-vista').textContent.includes('Objetivo de prueba'), 'Restablecer vuelve al texto del documento');
  // permisos
  await entrar('Gerente de Marca'); await click(nav('Perfiles de cargo')); await click(pestana('Cargos administrativos y corporativos')); await espera(100);
  ok(!!d.getElementById('pa-vista') && !d.getElementById('pa-editar'), 'Gerencia de Marca consulta pero no edita los perfiles');
  // tiendas Planeta Sports
  await entrar('Gerente de RRHH'); await click(nav('Perfiles de cargo')); await espera(150);
  await escribe('pc-marca', 'PLANETA'); await escribe('pc-cargo', 'GT');
  ok(texto().includes('Planeta Sports (CCCT, Sambil Chacao y Sambil Candelaria)') && texto().includes('divisas'), 'Tiendas Planeta: descripción de cargo propia de Planeta Sports');
  await escribe('pc-marca', 'BALU');
  ok(!texto().includes('Verificar y conciliar las divisas') && texto().includes('Realizar revisión diaria de la tienda'), 'Tiendas Balú conservan su descripción');
  // estructura administrativa
  const FAKE = JSON.stringify({ version: 1, moneda: 'USD', periodicidad: 'MENSUAL', componentes: [{ id: 'sal', nombre: 'Salario base' }],
    areas: [{ id: 'ADM', nombre: 'Administración' }],
    posiciones: [{ id: 'A1', areaId: 'ADM', cargo: 'Dirección de Administración', nombre: 'Ficticio Uno', jefeId: '', vacante: false, comp: null, perfilId: 'administrador-balu' }, { id: 'A2', areaId: 'ADM', cargo: 'Analista Sin Perfil', nombre: 'Ficticio Dos', jefeId: 'A1', vacante: false, comp: null }], distribucion: [], notas: [] });
  await click(nav('Estructura administrativa')); await espera(150);
  await escribe('adm-json', FAKE); await click(d.getElementById('adm-cargar')); await espera(150);
  await click(pestana('Personal y cargos')); await espera(100);
  ok(d.getElementById('adm-perfil-A1').value === 'administrador-balu' && d.getElementById('adm-perfil-A2').value === '', 'Estructura: cada cargo muestra su perfil vinculado');
  await escribe('adm-perfil-A2', 'analista-administrativo-balu'); await espera(100);
  ok(JSON.parse(w.localStorage.getItem('sgi-estructura-admin-v1')).posiciones[1].perfilId === 'analista-administrativo-balu', 'Se puede vincular un perfil a un cargo');
  const inp = d.getElementById('adm-cargo-A1'); inp.value = 'Administrador'; inp.dispatchEvent(new w.Event('blur', { bubbles: true })); inp.dispatchEvent(new w.FocusEvent('focusout', { bubbles: true })); await espera(120);
  const e2 = JSON.parse(w.localStorage.getItem('sgi-estructura-admin-v1')).posiciones[0];
  ok(e2.cargo === 'Administrador' && e2.cargoAnterior === 'Dirección de Administración', 'Se puede renombrar el cargo y se conserva el nombre anterior');
  ok(!JSON.stringify(db()).includes('Ficticio Dos'), 'Los datos de la estructura siguen fuera de la base compartida');
  // pruebas por cargo en la asignación
  ok(html.includes('Administrativo \\xB7 por cargo') || html.includes('Administrativo · por cargo'), 'Asignación de pruebas: selector de cargos administrativos por perfil');
  // trabajador administrativo (si el directorio de demostración tiene)
  const st = db();
  const admT = st.trabajadores.filter((t) => t.estatus === 'ACTIVO' && (st.cargos.find((c) => c.id === t.cargoId) || {}).administrativo);
  if (admT.length) {
    await click(pestana('Pruebas y Nine-Box')); await espera(100);
    const sel = d.getElementById('adm-pf-' + admT[0].id); ok(!!sel, 'RRHH asigna el perfil de cargo al personal administrativo');
    await escribe('adm-pf-' + admT[0].id, 'contralor-balu'); await espera(100);
    const t2 = db().trabajadores.find((t) => t.id === admT[0].id);
    ok(t2.perfilAdmId === 'contralor-balu' && t2.familiaAdm === 'FIN', 'El perfil asignado fija también la familia (pruebas y Nine-Box)');
  } else ok(true, 'Sin personal administrativo en la demostración: asignación probada en la estructura');
  await click(pestana('Datos')); await espera(100);
  await click(d.getElementById('adm-quitar')); await click(boton('Sí, quitar')); await espera(100);
  console.log(process.exitCode ? 'CON FALLAS' : 'TODO BIEN');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error(e); process.exit(1); });
