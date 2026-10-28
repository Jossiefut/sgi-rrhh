/* Ponderación del match de promoción y perfiles esperados del IPV.
   Funciones puras: se usan en la app y en las pruebas. */
import { matchKostick, veredictoMatch } from './kostick.js';

export const COMPONENTES = {
  IPV: 'Prueba IPV',
  KOSTICK: 'Inventario Kostick',
  LOGICO: 'Indicador Lógico I',
  DISC: 'Perfil DISC (comportamiento)',
  PIL: 'Integridad laboral (PIL)',
  IPC: 'Inventario de Personalidad Comercial (IPC)',
  NINEBOX: 'Evaluación Nine-Box',
  CONDUCTA: 'Conducta (amonestaciones)',
  BASICA: 'Evaluación básica (desempeño y cumplimiento de normas)',
  OTRA: 'Otra prueba (por definir)',
};
/* Esquema según el cargo actual del trabajador que será promovido (porcentajes; suman 100) */
export const PONDERACIONES_INICIALES = {
  ASE: { IPV: 50, BASICA: 50 },
  SUB: { IPV: 20, KOSTICK: 40, NINEBOX: 30, CONDUCTA: 10 },
  GT: { NINEBOX: 50, KOSTICK: 30, CONDUCTA: 10, OTRA: 10 },
};
/* Batería por cargo destino: máximo 3 pruebas del portal, escogidas por precisión (promociones e ingresos).
   Editable en Configuración › Batería por cargo. El DISC no forma parte de la batería: es una prueba opcional de desarrollo. */
export const MAX_PRUEBAS_CARGO = 3;
/* Versión DC-2026-04: clasificada según las descripciones de cargo de tienda Balú (14/04/2026).
   Cambios frente a la versión anterior: Visual pasa de IPV + IPC a IPC + Lógico (la descripción no pide persuasión comercial
   y exige atención al detalle 5); Subgerente pasa de Kostick + IPC + Lógico a Kostick + IPC + Integridad (custodia caja y divisas a diario). */
export const VERSION_BATERIA = 'DC-2026-04';
export const BATERIA_CARGO_INICIAL = {
  ASE: ['IPV', 'IPC'],
  CAJ: ['LOGICO', 'PIL', 'IPC'],
  CAJT: ['LOGICO', 'PIL', 'IPC'],
  ALM: ['PIL', 'IPC'],
  JALM: ['PIL', 'IPC', 'LOGICO'],
  VM: ['IPC', 'LOGICO'],
  SUB: ['KOSTICK', 'IPC', 'PIL'],
  GT: ['KOSTICK', 'IPC', 'LOGICO'],
};
/* Ajuste al cargo (fit): la evaluación de una promoción, o de una promoción con traslado, depende del cargo DESTINO.
   Solo pesan en el porcentaje los componentes con peso; la Integridad (PIL) y el Indicador Lógico son requisitos y no suman.
   Cada fila suma 100. Valores iniciales (editables en Configuración › Ajuste al cargo); SUB, JALM y ASE fueron confirmados por RRHH. */
export const FIT_CARGO_INICIAL = {
  ASE: { IPV: 25, IPC: 25, BASICA: 50 },
  VM: { IPC: 50, BASICA: 50 },
  CAJ: { IPC: 50, BASICA: 50 },
  CAJT: { IPC: 50, BASICA: 50 },
  ALM: { IPC: 50, BASICA: 50 },
  JALM: { IPC: 50, BASICA: 50 },
  SUB: { IPC: 20, KOSTICK: 40, NINEBOX: 30, CONDUCTA: 10 },
  GT: { IPC: 20, KOSTICK: 40, NINEBOX: 30, CONDUCTA: 10 },
};
export const FIT_POR_CONFIRMAR = []; // ASE, JALM y SUB confirmados por RRHH (07/10/2026)
/* Componentes que pueden tener peso en el match (los requisitos PIL y LOGICO no suman) */
export const COMPONENTES_CON_PESO = ['IPV', 'IPC', 'KOSTICK', 'NINEBOX', 'CONDUCTA', 'BASICA', 'OTRA'];
/* Prueba más útil para cada cargo destino (la primera de su batería) */
export const PRUEBA_PRIORITARIA = { ASE: 'IPV', VM: 'IPC', CAJ: 'PIL', CAJT: 'PIL', ALM: 'PIL', JALM: 'PIL', SUB: 'KOSTICK', GT: 'KOSTICK' };
/* Pruebas del portal que forman la batería de selección y promoción (el DISC es opcional de desarrollo) */
export const PRUEBAS_FIT = ['IPV', 'IPC', 'KOSTICK', 'LOGICO', 'PIL'];
export const MOTIVO_PRUEBA_CARGO = {
  ASE: 'La descripción pide asesorar y persuadir al cliente (persuasión comercial 4), manejar el estrés y adaptarse (5): el IPV mide la disposición comercial y el IPC la estabilidad y la forma de ser con el cliente.',
  VM: 'La descripción exige atención al detalle, proactividad y responsabilidad (5) y coordinar al equipo, sin persuasión comercial: el IPC describe orden, apertura y responsabilidad, y el Indicador Lógico (con figuras) la precisión y el razonamiento. Colorimetría, estilismo y visual merchandising se miden con la prueba técnica del cargo.',
  CAJ: 'Maneja efectivo y medios de pago (exactitud y habilidad numérica 4): el Indicador Lógico mide la precisión numérica, la Integridad (PIL) la honestidad y el IPC la estabilidad y el orden.',
  CAJT: 'Arquea y custodia el efectivo, emite el Reporte Z y forma cajeros (exactitud en efectivo y gestión de caja 5): Indicador Lógico, Integridad (PIL) e IPC.',
  ALM: 'Custodia y alarma la mercancía; la descripción incluye la competencia Honestidad: la Integridad (PIL) es la prueba más precisa y el IPC completa el perfil (organización de mercancía 5).',
  JALM: 'Dirige almacenistas, controla guías de despacho e inventarios (nivel 5 en todas las técnicas): Integridad (PIL), IPC e Indicador Lógico.',
  SUB: 'Coordina el equipo y custodia a diario la caja y el envío de divisas: Kostick (estilo de liderazgo), IPC y la Integridad (PIL) por el manejo de valores.',
  GT: 'Dirige la tienda, analiza indicadores y toma decisiones (liderazgo, supervisión y decisión 5): Kostick, IPC e Indicador Lógico; la Nine-Box pesa en el match.',
};
/* Batería configurada para un cargo destino */
export function bateriaCargo(config, cargoId) {
  /* La configuración guardada solo se usa si corresponde a la versión vigente de la batería */
  const b = (config && config.bateriaCargo && config.versionBateria === VERSION_BATERIA) ? config.bateriaCargo : BATERIA_CARGO_INICIAL;
  return Array.isArray(b[cargoId]) ? b[cargoId] : [];
}
/* Pesos de ajuste del cargo destino: los configurados o los iniciales */
export function pesosFit(config, cargoId) {
  const p = (config && config.fitCargo && config.versionBateria === VERSION_BATERIA) ? config.fitCargo : FIT_CARGO_INICIAL;
  const f = p[cargoId];
  if (!f) return null;
  /* Solo pesan los componentes con peso: la PIL y el Lógico son requisitos y el DISC no entra a la batería */
  const limpio = Object.fromEntries(Object.entries(f).filter(([k]) => COMPONENTES_CON_PESO.includes(k)));
  return Object.values(limpio).some((v) => Number(v) > 0) ? limpio : null;
}
export const aplicaPrueba = (config, prueba, cargoId) => bateriaCargo(config, cargoId).includes(prueba);

export const ESQUEMAS_TITULO = {
  ASE: 'Asesor de Ventas (a Visual, Cajero o Depositario)',
  SUB: 'Subgerente (a Gerente de Tienda)',
  GT: 'Gerente de Tienda',
};
/* Componentes cuya fuente aún no está definida: se muestran, pero no entran al cálculo hasta que RRHH los defina */
export const COMPONENTES_POR_DEFINIR = ['OTRA'];

/* Cargos destino para los que RRHH aplica IPV (Asesor → Visual, Cajero, Depositario; Subgerente → Gerente) */
export const IPV_DESTINOS_INICIALES = ['VM', 'CAJ', 'ALM', 'GT'];

/* Banda del puntaje típico del IPV (1 a 10): 1-3 bajo, 4-7 medio, 8-10 alto, igual que los textos del informe */
export function bandaIPV(pt) { return pt <= 3 ? 1 : pt <= 7 ? 2 : 3; }

/* Perfil esperado del IPV por cargo destino: { escala: [nivel 1-3, peso] }. Propuesta inicial, editable en Configuración. */
const base = (o) => o;
export const IPV_PERFILES_INICIALES = {
  VM: base({ DGV: [3, 1], I: [3, 1], II: [3, 2], III: [2, 1], IV: [2, 1], V: [2, 1], VI: [2, 1], VII: [2, 1], VIII: [3, 1], IX: [3, 2] }),
  CAJ: base({ DGV: [2, 1], I: [2, 1], II: [3, 2], III: [3, 2], IV: [3, 1], V: [1, 1], VI: [1, 1], VII: [2, 1], VIII: [2, 1], IX: [2, 1] }),
  ALM: base({ DGV: [1, 1], I: [2, 1], II: [3, 2], III: [3, 1], IV: [2, 1], V: [1, 1], VI: [1, 1], VII: [2, 1], VIII: [3, 2], IX: [1, 1] }),
  GT: base({ DGV: [3, 1], I: [3, 1], II: [3, 1], III: [3, 2], IV: [3, 2], V: [3, 1], VI: [3, 2], VII: [3, 2], VIII: [3, 1], IX: [2, 1] }),
  DEFECTO: base({ DGV: [3, 1], I: [2, 1], II: [3, 1], III: [3, 1], IV: [2, 1], V: [2, 1], VI: [2, 1], VII: [2, 1], VIII: [3, 1], IX: [3, 1] }),
};
/* Escalas del IPV que entran al match (R y A son compuestas de las demás y no se cuentan dos veces) */
export const IPV_ESCALAS_MATCH = ['DGV', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

/* Match del IPV frente al perfil del cargo (misma fórmula que el Kostick) */
export function matchIPV(resultado, perfil) {
  if (!resultado || !perfil) return null;
  const escalas = resultado.escalas.filter((e) => IPV_ESCALAS_MATCH.includes(e.id)).map((e) => ({ id: e.id, nombre: e.nombre, grupo: '', nivel: bandaIPV(e.pt), pt: e.pt }));
  return matchKostick({ escalas }, perfil);
}

/* Conducta: 100 sin amonestaciones; cada una resta lo mismo y con el máximo permitido + 1 llega a 0 */
export function puntajeConducta(cantidad, maximo) {
  const m = Math.max(0, Number(maximo) || 0);
  return Math.max(0, Math.round(100 - (Number(cantidad) || 0) * (100 / (m + 1))));
}

/* pesos: { IPV: 20, ... }  ·  valores: { IPV: { pct: 72 | null, detalle: '' }, ... }
   El total solo es definitivo cuando todos los componentes definidos tienen resultado; los "por definir" no entran al cálculo
   y el resto se reescala a 100. */
export function calcularPonderado(pesos, valores) {
  const ids = Object.keys(pesos || {}).filter((id) => Number(pesos[id]) > 0);
  const filas = ids.map((id) => {
    const v = (valores && valores[id]) || { pct: null };
    const porDefinir = COMPONENTES_POR_DEFINIR.includes(id);
    const pct = !porDefinir && v.pct !== null && v.pct !== undefined ? Number(v.pct) : null;
    return { id, nombre: COMPONENTES[id] || id, peso: Number(pesos[id]), pct, detalle: v.detalle || '', porDefinir, pendiente: !porDefinir && pct === null };
  });
  const activos = filas.filter((f) => !f.porDefinir);
  const conResultado = activos.filter((f) => f.pct !== null);
  const pesoBase = activos.reduce((s, f) => s + f.peso, 0);
  const pesoConResultado = conResultado.reduce((s, f) => s + f.peso, 0);
  const completo = activos.length > 0 && conResultado.length === activos.length;
  filas.forEach((f) => { f.pesoEfectivo = f.porDefinir || !pesoBase ? 0 : Math.round((f.peso / pesoBase) * 1000) / 10; f.aporte = f.pct === null ? null : Math.round(f.pct * f.pesoEfectivo) / 100; });
  const parcial = pesoConResultado ? Math.round(conResultado.reduce((s, f) => s + f.pct * f.peso, 0) / pesoConResultado) : null;
  const total = completo ? parcial : null;
  return { filas, completo, total, parcial, veredicto: parcial === null ? null : veredictoMatch(parcial), porDefinir: filas.filter((f) => f.porDefinir), pendientes: filas.filter((f) => f.pendiente), sumaPesos: filas.reduce((s, f) => s + f.peso, 0) };
}
