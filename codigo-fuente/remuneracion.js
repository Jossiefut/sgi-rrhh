/* KPI y remuneración (v1.18.0). Funciones puras: catálogo de KPI, visibilidad por jefe directo, validación e importación desde Excel.
   Los montos NO se escriben nunca en la bitácora ni en tablas de lectura general: en la nube viajan a la tabla protegida «remuneraciones». */

/* Cadena de mando de menor a mayor. "Personal a cargo" = quienes tienen a ese nivel como jefe directo o por encima. */
export const CADENA_JEFES = ['tienda', 'marca', 'operaciones', 'general', 'junta'];
export const NOMBRE_JEFE = { tienda: 'Gerente de Tienda', marca: 'Gerente de Marca', operaciones: 'Gerente de Operaciones', general: 'Gerente General', junta: 'Junta Directiva' };
/* RRHH, Administrador, Gerencia General y Junta Directiva ven todo; los mismos registran y modifican */
export const ROLES_REM_GLOBAL = ['rrhh', 'admin', 'general', 'junta'];
export const ROLES_REM_EDITA = ['rrhh', 'admin', 'general', 'junta'];
export const MONEDAS_REM = ['USD', 'Bs'];

export function visiblePara(jefeRol) {
  const i = CADENA_JEFES.indexOf(jefeRol);
  return CADENA_JEFES.slice(i < 0 ? 0 : i);
}
export function puedeEditarRemuneracion(usuario) { return Boolean(usuario) && ROLES_REM_EDITA.includes(usuario.rol); }
export function puedeVerRemuneracion(usuario, r) {
  if (!usuario || !r) return false;
  if (ROLES_REM_GLOBAL.includes(usuario.rol)) return true;
  if (!CADENA_JEFES.includes(usuario.rol)) return false; /* visor, consulta, pendiente: nunca */
  if (!visiblePara(r.jefeRol).includes(usuario.rol)) return false;
  if (usuario.rol === 'tienda') return Boolean(usuario.tiendaId) && r.tiendaId === usuario.tiendaId;
  return Boolean(usuario.marca) && r.marca === usuario.marca;
}
/* ¿Puede el usuario abrir el módulo? RRHH hacia arriba siempre; los jefes de línea solo si tienen personal a cargo con registro */
export function veModuloRemuneracion(usuario) { return Boolean(usuario) && (ROLES_REM_GLOBAL.includes(usuario.rol) || ['tienda', 'marca', 'operaciones'].includes(usuario.rol)); }

export function jefeRolPorDefecto(cargoId, administrativo) {
  if (administrativo) return 'general';
  if (cargoId === 'GT') return 'marca';
  return 'tienda';
}

/* Historial de un trabajador, del más reciente al más antiguo; los anulados se conservan pero no cuentan como vigentes */
export function historialRemuneracion(lista, trabajadorId) {
  return (lista || []).filter((r) => r.trabajadorId === trabajadorId).sort((a, b) => (a.vigenteDesde < b.vigenteDesde ? 1 : a.vigenteDesde > b.vigenteDesde ? -1 : (a.fecha || '') < (b.fecha || '') ? 1 : -1));
}
export function remuneracionVigente(lista, trabajadorId, hoy) {
  return historialRemuneracion(lista, trabajadorId).find((r) => !r.anulado && r.vigenteDesde <= hoy) || null;
}
export function totalMensual(r) { return (Number(r.salarioBase) || 0) + (Number(r.bonoVariable) || 0) + (Number(r.otros) || 0); }
export const sumaPesos = (kpis) => Math.round((kpis || []).reduce((s, k) => s + (Number(k.peso) || 0), 0) * 100) / 100;

/* Catálogo de KPI según el cargo (tiendas) o la familia del cargo administrativo; además siempre se puede agregar uno propio */
export const KPI_POR_CARGO = {
  GT: ['Ventas vs. presupuesto de la tienda', 'Margen de la tienda', 'Cumplimiento de la dotación (HC)', 'Rotación de personal', 'Merma e inventario', 'Calidad de servicio'],
  SUB: ['Ventas vs. presupuesto de la tienda', 'Cumplimiento de la dotación (HC)', 'Ejecución de procesos de tienda', 'Calidad de servicio', 'Merma e inventario'],
  CAJT: ['Cuadre de caja', 'Ticket promedio', 'Calidad de servicio', 'Cumplimiento de procesos de caja'],
  CAJ: ['Cuadre de caja', 'Ticket promedio', 'Calidad de servicio'],
  ASE: ['Ventas vs. meta individual', 'Ticket promedio', 'Unidades por transacción', 'Calidad de servicio'],
  JALM: ['Exactitud de inventario', 'Merma e inventario', 'Tiempo de reposición', 'Cumplimiento de procesos de almacén'],
  ALM: ['Exactitud de inventario', 'Tiempo de reposición', 'Cumplimiento de procesos de almacén'],
  VM: ['Cumplimiento del calendario de montajes', 'Estándares visuales', 'Ventas de la zona exhibida'],
  SEG: ['Incidencias de seguridad', 'Cumplimiento de rondas y protocolos'],
};
export const KPI_POR_FAMILIA = {
  DIR: ['Cumplimiento de metas de la división', 'Rentabilidad (EBITDA)', 'Ventas vs. presupuesto', 'Ejecución de la expansión', 'Rotación de personal'],
  COM: ['Ventas vs. presupuesto', 'Margen bruto', 'Rotación de inventario', 'Cumplimiento del surtido'],
  VIS: ['Cumplimiento del calendario de montajes', 'Estándares visuales en tienda', 'Ejecución dentro del presupuesto'],
  MER: ['Cumplimiento del plan de mercadeo', 'Retorno de la inversión en campañas', 'Tráfico y conversión', 'Crecimiento de audiencia'],
  DIS: ['Entrega de colecciones en plazo', 'Aprobación de piezas a la primera', 'Adherencia a la identidad de marca'],
  CMP: ['Cumplimiento del presupuesto de compras', 'Entregas a tiempo del proveedor', 'Ahorro logrado en negociación', 'Fill rate'],
  FIN: ['Cierres contables en fecha', 'Conciliaciones al día', 'Cumplimiento de obligaciones fiscales', 'Control del gasto vs. presupuesto'],
  TH: ['Cumplimiento del plan de talento', 'Tiempo de cobertura de vacantes', 'Rotación de personal', 'Cumplimiento de capacitación', 'Clima organizacional'],
};
export const KPI_GENERALES = ['Cumplimiento de objetivos del cargo', 'Cumplimiento de la evaluación de desempeño', 'Asistencia y puntualidad'];
const slugKpi = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const kpiId = (nombre) => `kpi-${slugKpi(nombre)}`;
/* Devuelve [{nombre, medicion, frecuencia}]. Cargo administrativo con perfil: sus KPI de la guía; si no, los de la familia. kpisPerfil = KPIS_ADM[perfilId] */
export function catalogoKpi(cargoId, familiaId, administrativo, kpisPerfil) {
  const det = (n) => ({ nombre: n, medicion: '', frecuencia: '' });
  let base;
  if (administrativo && kpisPerfil && kpisPerfil.length) base = kpisPerfil.map((k) => ({ nombre: k.nombre, medicion: k.medicion || '', frecuencia: k.frecuencia || '' }));
  else base = (administrativo ? (KPI_POR_FAMILIA[familiaId] || []) : (KPI_POR_CARGO[cargoId] || [])).map(det);
  const vistos = new Set(); const res = [];
  [...base, ...KPI_GENERALES.map(det)].forEach((k) => { if (!vistos.has(k.nombre)) { vistos.add(k.nombre); res.push(k); } });
  return res;
}

/* ---------- Validación ---------- */
const FECHA_OK = /^\d{4}-\d{2}-\d{2}$/;
export function validarRemuneracion(r) {
  const e = [];
  if (!FECHA_OK.test(r.vigenteDesde || '') || Number.isNaN(Date.parse(r.vigenteDesde))) e.push('Indique la fecha desde la que rige (aaaa-mm-dd).');
  if (!MONEDAS_REM.includes(r.moneda)) e.push('La moneda debe ser USD o Bs.');
  ['salarioBase', 'bonoVariable', 'otros'].forEach((c) => { const n = Number(r[c]); if (r[c] !== '' && r[c] !== undefined && (!Number.isFinite(n) || n < 0)) e.push(`El campo «${c === 'salarioBase' ? 'Salario base' : c === 'bonoVariable' ? 'Bono variable' : 'Otros'}» debe ser un número igual o mayor que 0.`); });
  if (!CADENA_JEFES.includes(r.jefeRol)) e.push('Indique el nivel del jefe directo.');
  const ks = r.kpis || [];
  if (ks.some((k) => !String(k.nombre || '').trim())) e.push('Todos los KPI deben tener nombre.');
  if (new Set(ks.map((k) => k.id)).size !== ks.length) e.push('Hay un KPI repetido.');
  if (ks.some((k) => !(Number(k.peso) > 0) || Number(k.peso) > 100)) e.push('El peso de cada KPI debe estar entre 1 y 100.');
  if (ks.length && sumaPesos(ks) !== 100) e.push(`Los pesos de los KPI deben sumar 100 % (suman ${sumaPesos(ks)} %).`);
  return e;
}
export function armarRegistro(base, ahoraISO, usuarioId, idNuevo) {
  const kpis = (base.kpis || []).map((k) => ({ id: k.id || kpiId(k.nombre), nombre: String(k.nombre).trim(), peso: Number(k.peso) }));
  return {
    id: idNuevo, trabajadorId: base.trabajadorId, cedula: base.cedula || '', tiendaId: base.tiendaId || '', marca: base.marca || '',
    vigenteDesde: base.vigenteDesde, moneda: base.moneda, salarioBase: Number(base.salarioBase) || 0, bonoVariable: Number(base.bonoVariable) || 0, otros: Number(base.otros) || 0,
    kpis, jefeRol: base.jefeRol, visiblePara: visiblePara(base.jefeRol), nota: String(base.nota || '').trim(), origen: base.origen || 'MANUAL',
    registradoPor: usuarioId, fecha: ahoraISO, anulado: false,
  };
}

/* ---------- Plantilla e importación de Excel ---------- */
export const MAX_KPI_IMPORT = 6;
export const COLUMNAS_PLANTILLA = ['cedula', 'vigente_desde', 'moneda', 'salario_base', 'bono_variable', 'otros', 'jefe_directo', 'nota', ...Array.from({ length: MAX_KPI_IMPORT }, (_, i) => [`kpi_${i + 1}`, `peso_${i + 1}`]).flat()];
export const EJEMPLO_FILAS = [
  ['V-12345678', '2026-11-01', 'USD', 400, 100, 20, 'Gerente de Operaciones', 'Ajuste anual', 'Cumplimiento del presupuesto de ventas', 60, 'Cobertura del headcount aprobado', 40],
  ['V-87654321', '01/11/2026', 'USD', 250, 50, 0, 'Gerente de Tienda', 'Ingreso', 'Ventas vs. meta individual', 50, 'Calidad de servicio', 30, 'Ticket promedio', 20],
];
export const INSTRUCCIONES = [
  ['Cómo llenar el archivo de remuneración y KPI'],
  ['1. Use la hoja «Carga»: la primera fila son los encabezados y no se debe cambiar. Cada fila siguiente es una persona y un cambio.'],
  ['2. cedula y vigente_desde y salario_base son obligatorios. La cédula debe corresponder a un trabajador activo. Fecha: aaaa-mm-dd o dd/mm/aaaa.'],
  ['3. moneda: USD o Bs (vacío = USD). bono_variable y otros son opcionales (vacío = 0).'],
  ['4. jefe_directo: Gerente de Tienda, Gerente de Marca, Gerente de Operaciones, Gerente General o Junta Directiva. Define quién lo ve hacia arriba. Vacío = el último registrado o el predeterminado del cargo.'],
  ['5. KPI: hasta 6 pares kpi_n / peso_n. Escriba el nombre del KPI (vea «KPI por cargo») o uno propio. Los pesos de cada fila deben sumar 100.'],
  ['6. Cada fila crea un registro nuevo en el historial; no reemplaza los anteriores. Una fila idéntica a una ya cargada se omite.'],
  ['7. En «Ejemplo» hay filas completas de muestra. No las copie con esas cédulas: use las de su personal.'],
];
export function hojasPlantilla(catalogoPorCargo) {
  return {
    Carga: [COLUMNAS_PLANTILLA],
    Ejemplo: [COLUMNAS_PLANTILLA, ...EJEMPLO_FILAS],
    Instrucciones: INSTRUCCIONES,
    'KPI por cargo': [['Cargo', 'KPI sugerido', 'Cómo se mide', 'Frecuencia'], ...(catalogoPorCargo || [])],
  };
}
export const matrizPlantilla = () => [COLUMNAS_PLANTILLA, ...EJEMPLO_FILAS];
const norm = (s) => String(s === null || s === undefined ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const soloDig = (s) => String(s || '').replace(/\D/g, '');
export function fechaDesdeCelda(v) {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'number' && v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 86400) * 1000); return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10); }
  const t = String(v).trim();
  if (FECHA_OK.test(t.slice(0, 10)) && /^\d{4}-/.test(t)) return t.slice(0, 10);
  const m = t.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
}
const numero = (v) => { if (v === '' || v === null || v === undefined) return 0; const n = Number(String(v).replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return n; };
export function jefeDesdeTexto(t) {
  const n = norm(t);
  if (!n) return '';
  if (CADENA_JEFES.includes(n)) return n;
  if (/junta/.test(n)) return 'junta';
  if (/general|director general|direccion general/.test(n)) return 'general';
  if (/operacion/.test(n)) return 'operaciones';
  if (/marca/.test(n)) return 'marca';
  if (/tienda/.test(n)) return 'tienda';
  return '?';
}
/* matriz: filas de la hoja (la primera es el encabezado). ctx: { trabajadores, remuneraciones, ahoraISO, usuarioId, nuevoId(), esAdm(trab), cargoDe(trab) } */
export function registrosDesdeMatriz(matriz, ctx) {
  const errores = []; const registros = [];
  if (!matriz || matriz.length < 2) return { registros, errores: ['El archivo no tiene filas para cargar.'], leidas: 0 };
  const enc = matriz[0].map((c) => norm(c).replace(/\s+/g, '_'));
  const col = (n) => enc.indexOf(n);
  if (col('cedula') < 0 || col('vigente_desde') < 0 || col('salario_base') < 0) return { registros, errores: ['Faltan columnas obligatorias: cedula, vigente_desde y salario_base. Descargue la plantilla.'], leidas: 0 };
  const porCedula = new Map();
  (ctx.trabajadores || []).forEach((t) => { const k = soloDig(t.cedula); if (k && (!porCedula.has(k) || t.estatus === 'ACTIVO')) porCedula.set(k, t); });
  let leidas = 0; const vistos = new Set();
  matriz.slice(1).forEach((f, i) => {
    const linea = i + 2;
    const val = (n) => (col(n) < 0 ? '' : f[col(n)]);
    if (f.every((c) => c === '' || c === null || c === undefined)) return;
    if (!soloDig(val('cedula')) && String(f[0] || '').length > 30) return; /* fila de instrucciones */
    leidas += 1;
    const trab = porCedula.get(soloDig(val('cedula')));
    if (!trab) { errores.push(`Fila ${linea}: la cédula «${val('cedula')}» no corresponde a ningún trabajador activo.`); return; }
    const kpis = [];
    for (let k = 1; k <= MAX_KPI_IMPORT; k += 1) {
      const nombre = String(val(`kpi_${k}`) || '').trim(); const peso = val(`peso_${k}`);
      if (!nombre && (peso === '' || peso === null || peso === undefined)) continue;
      kpis.push({ id: kpiId(nombre), nombre, peso: numero(peso) });
    }
    const previa = (ctx.remuneraciones || []).filter((r) => r.trabajadorId === trab.id && !r.anulado).sort((a, b) => (a.vigenteDesde < b.vigenteDesde ? 1 : -1))[0];
    let jefe = jefeDesdeTexto(val('jefe_directo'));
    if (jefe === '?') { errores.push(`Fila ${linea}: «jefe_directo» no se reconoce (use Gerente de Tienda, de Marca, de Operaciones, General o Junta Directiva).`); return; }
    if (!jefe) jefe = previa ? previa.jefeRol : jefeRolPorDefecto(trab.cargoId, ctx.esAdm ? ctx.esAdm(trab) : false);
    const base = {
      trabajadorId: trab.id, cedula: trab.cedula, tiendaId: trab.tiendaId, marca: trab.marca,
      vigenteDesde: fechaDesdeCelda(val('vigente_desde')), moneda: String(val('moneda') || 'USD').trim().toUpperCase() === 'BS' ? 'Bs' : String(val('moneda') || 'USD').trim().toUpperCase(),
      salarioBase: numero(val('salario_base')), bonoVariable: numero(val('bono_variable')), otros: numero(val('otros')), jefeRol: jefe, kpis, nota: val('nota'), origen: 'EXCEL',
    };
    const errs = validarRemuneracion(base);
    if (errs.length) { errores.push(`Fila ${linea} (${trab.nombres} ${trab.apellidos}): ${errs[0]}`); return; }
    const clave = `${trab.id}|${base.vigenteDesde}|${base.salarioBase}|${base.bonoVariable}|${base.otros}|${JSON.stringify(kpis)}`;
    const igualPrevio = (ctx.remuneraciones || []).some((r) => !r.anulado && r.trabajadorId === trab.id && r.vigenteDesde === base.vigenteDesde && r.salarioBase === base.salarioBase && r.bonoVariable === base.bonoVariable && r.otros === base.otros && JSON.stringify((r.kpis || []).map((k) => [k.nombre, k.peso])) === JSON.stringify(kpis.map((k) => [k.nombre, k.peso])));
    if (vistos.has(clave) || igualPrevio) { errores.push(`Fila ${linea}: ya existe un registro idéntico de ${trab.nombres} ${trab.apellidos} con esa fecha; se omitió.`); return; }
    vistos.add(clave);
    registros.push(armarRegistro(base, ctx.ahoraISO, ctx.usuarioId, ctx.nuevoId()));
  });
  return { registros, errores, leidas };
}
