/* Cumpleaños del día y del mes, y rangos de edad. Funciones puras. */
export const RANGOS_EDAD = [
  { id: 'R1', texto: 'Menos de 25 años', min: 0, max: 24 },
  { id: 'R2', texto: '25 a 34 años', min: 25, max: 34 },
  { id: 'R3', texto: '35 a 44 años', min: 35, max: 44 },
  { id: 'R4', texto: '45 a 54 años', min: 45, max: 54 },
  { id: 'R5', texto: '55 años o más', min: 55, max: 200 },
];
export function rangoDeEdad(edad) {
  if (edad === null || edad === undefined || !Number.isFinite(edad)) return null;
  return RANGOS_EDAD.find((r) => edad >= r.min && edad <= r.max) || null;
}
export function edadEn(fechaNac, ref) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fechaNac || ''));
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(ref || ''));
  if (!m || !r) return null;
  let e = Number(r[1]) - Number(m[1]);
  if (Number(r[2]) < Number(m[2]) || (Number(r[2]) === Number(m[2]) && Number(r[3]) < Number(m[3]))) e -= 1;
  return e >= 0 && e < 120 ? e : null;
}
const bisiesto = (a) => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
/* Día del cumpleaños en el año de referencia (el 29 de febrero se celebra el 28 en años no bisiestos) */
function diaCumple(fechaNac, anio) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fechaNac || ''));
  if (!m) return null;
  let mes = Number(m[2]); let dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  if (mes === 2 && dia === 29 && !bisiesto(anio)) dia = 28;
  return { mes, dia };
}
/* items: [{ id, fechaNacimiento, ...}]. Devuelve los que cumplen años hoy y los del mes, con la edad que cumplen. */
export function cumpleanosDelMes(items, hoy) {
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(hoy || ''));
  if (!r) return { hoy: [], mes: [] };
  const anio = Number(r[1]); const mesH = Number(r[2]); const diaH = Number(r[3]);
  const mes = [];
  (items || []).forEach((x) => {
    const c = diaCumple(x.fechaNacimiento, anio);
    if (!c || c.mes !== mesH) return;
    const nac = Number(String(x.fechaNacimiento).slice(0, 4));
    const cumple = anio - nac;
    if (cumple < 15 || cumple > 100) return;
    mes.push({ ...x, dia: c.dia, cumple, esHoy: c.dia === diaH, pasado: c.dia < diaH });
  });
  mes.sort((a, b) => a.dia - b.dia || String(a.nombre || '').localeCompare(String(b.nombre || '')));
  return { hoy: mes.filter((x) => x.esHoy), mes };
}
export function medianaDe(lista) {
  if (!lista.length) return null;
  const s = [...lista].sort((a, b) => a - b); const k = Math.floor(s.length / 2);
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
}

/* Cumpleaños de un mes cualquiera (1-12) del año dado. Si "hoy" cae en ese mes marca los de hoy y los ya pasados. */
export function cumpleanosDeMes(items, anio, mes, hoy) {
  const mm = String(mes).padStart(2, '0');
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(hoy || ''));
  const dd = r && Number(r[1]) === Number(anio) && Number(r[2]) === Number(mes) ? r[3] : '00';
  return cumpleanosDelMes(items, `${anio}-${mm}-${dd}`).mes;
}

/* Mensajes de felicitación por WhatsApp, en tono cercano y amable. Cada cargo tiene varias versiones y se elige una al azar
   (sin repetir la anterior), para que no sea siempre el mismo texto. Se reconoce el cargo por su código o por palabras de su nombre. */
const FAMILIAS_MENSAJE = [
  { id: 'subgerente', codigos: ['SUB'], palabras: ['subgerente', 'supervisor', 'coordinador', 'jefe de tienda'], textos: [
    (n) => `¡Feliz cumpleaños, ${n}! 🎂 Qué alegría tenerte en el equipo: eres un apoyo enorme en la tienda y se nota todos los días. Que hoy te mimen muchísimo.`,
    (n) => `${n}, ¡hoy es tu día! Gracias por acompañar al equipo con tanto compromiso y buena energía. Ojalá este año te traiga mucha salud y alegrías.`,
    (n) => `¡Un abrazo grande en tu cumpleaños, ${n}! Contar contigo hace que todo en la tienda funcione mejor. Disfruta tu día con los tuyos.`,
    (n) => `¡Felicidades, ${n}! Eres de esas personas que sostienen al equipo sin hacer ruido, y hoy queremos que el centro de atención seas tú. ¡Que lo disfrutes!`] },
  { id: 'gerente', codigos: ['GT'], palabras: ['gerente'], textos: [
    (n) => `¡Feliz cumpleaños, ${n}! 🎉 Gracias por liderar tu tienda con tanta entrega y cariño por tu gente. Que este nuevo año de vida venga lleno de salud y celebraciones.`,
    (n) => `${n}, hoy te toca a ti recibir los aplausos. Gracias por inspirar a tu equipo cada día. ¡Que tengas un cumpleaños precioso!`,
    (n) => `¡Muchas felicidades, ${n}! Tu forma de liderar se siente en toda la tienda. Que hoy descanses, celebres y te rodees de quienes más quieres.`,
    (n) => `¡Un abrazo en tu día, ${n}! Gracias por todo lo que das por tu tienda y por tu equipo. Te deseamos un año de muchos logros y mucha tranquilidad.`] },
  { id: 'caja', codigos: ['CAJT', 'CAJ'], palabras: ['cajer', 'caja'], textos: [
    (n) => `¡Feliz cumpleaños, ${n}! 🎂 Gracias por tu buena actitud y tu cuidado con cada cliente en caja. Que tengas un día muy especial junto a quienes más quieres.`,
    (n) => `${n}, ¡hoy es tu día! Tu amabilidad con cada cliente marca la diferencia. Que te llenen de cariño y de pastel.`,
    (n) => `¡Felicidades, ${n}! Gracias por tu paciencia y tu sonrisa en caja. Esperamos que hoy sea un día lleno de sorpresas lindas.`,
    (n) => `¡Un abrazo grande, ${n}, por tu cumpleaños! Qué bueno tenerte en el equipo. Disfruta mucho y que este año venga con todo lo bueno.`] },
  { id: 'ventas', codigos: ['ASE'], palabras: ['asesor', 'vendedor', 'ventas'], textos: [
    (n) => `¡Feliz cumpleaños, ${n}! 🎉 Gracias por tu energía y por darle a cada cliente una linda experiencia de compra. Que hoy la alegría sea para ti.`,
    (n) => `${n}, ¡hoy celebramos tu día! Tu sonrisa con cada cliente se nota y se agradece. Que este año te traiga muchos éxitos y muchos motivos para celebrar.`,
    (n) => `¡Muchas felicidades, ${n}! Gracias por poner el corazón en atender a cada cliente. Disfruta tu cumpleaños al máximo.`,
    (n) => `¡Un abrazo enorme en tu cumpleaños, ${n}! Contigo, cada cliente se va contento. Que tengas un día precioso y un año lleno de bendiciones.`] },
  { id: 'almacen', codigos: ['JALM', 'ALM'], palabras: ['almac', 'deposit', 'inventario', 'logíst', 'logist'], textos: [
    (n) => `¡Feliz cumpleaños, ${n}! 🎂 Gracias por tu orden y tu responsabilidad en el almacén: gracias a ti la tienda siempre está lista. ¡Disfruta tu día!`,
    (n) => `${n}, hoy es tu día. Tu trabajo en el almacén casi nunca se ve, pero se siente. Que hoy te lo reconozcan con mucho cariño.`,
    (n) => `¡Felicidades, ${n}! Gracias por tu esfuerzo y tu buena disposición. Que tengas un cumpleaños tranquilo, alegre y lleno de gente querida.`,
    (n) => `¡Un abrazo grande por tu cumpleaños, ${n}! Qué bueno contar contigo en el equipo. Que este nuevo año te llene de salud y buenas noticias.`] },
  { id: 'visual', codigos: ['VM'], palabras: ['visual', 'merchandis', 'vitrin'], textos: [
    (n) => `¡Feliz cumpleaños, ${n}! 🎨 Gracias por tu creatividad y por hacer que nuestras tiendas luzcan increíbles. Te deseamos un día lleno de color.`,
    (n) => `${n}, ¡hoy el protagonista eres tú! Cada vitrina que montas se nota. Que este año te traiga muchas ideas y muchas alegrías.`,
    (n) => `¡Muchas felicidades, ${n}! Gracias por poner tu talento y tu buen gusto al servicio del equipo. ¡Que lo pases genial!`,
    (n) => `¡Un abrazo en tu cumpleaños, ${n}! Qué suerte tener a alguien con tu ojo para los detalles. Disfruta tu día y celebra en grande.`] },
  { id: 'seguridad', codigos: ['SEG'], palabras: ['segur', 'vigilan'], textos: [
    (n) => `¡Feliz cumpleaños, ${n}! 🎂 Gracias por cuidar de nuestro equipo, de los clientes y de la tienda con tanta dedicación. Que tengas un día muy especial.`,
    (n) => `${n}, ¡hoy es tu día! Gracias por hacernos sentir tranquilos y acompañados. Que te celebren como te mereces.`,
    (n) => `¡Felicidades, ${n}! Tu compromiso y tu buen trato no pasan desapercibidos. Que tengas un cumpleaños lleno de cariño.`,
    (n) => `¡Un abrazo grande por tu cumpleaños, ${n}! Gracias por estar siempre pendiente de todos. Que este año te devuelva todo lo bueno que das.`] },
  { id: 'administrativo', codigos: ['ADM'], palabras: ['administrativ', 'analista', 'asistente', 'oficina', 'contab', 'nómina', 'nomina'], textos: [
    (n) => `¡Feliz cumpleaños, ${n}! 🎉 Gracias por tu trabajo y tu compromiso, que sostienen el día a día de toda la organización. Te deseamos un día lleno de alegría.`,
    (n) => `${n}, ¡hoy es tu día! Detrás de cada proceso que funciona hay alguien como tú. Que lo celebres con quienes más quieres.`,
    (n) => `¡Muchas felicidades, ${n}! Gracias por tu dedicación y tu buena onda en la oficina. Que este nuevo año venga cargado de cosas lindas.`,
    (n) => `¡Un abrazo en tu cumpleaños, ${n}! Qué bueno contar con tu apoyo todos los días. Disfruta y descansa, que te lo mereces.`] },
];
const MENSAJES_GENERALES = [
  (n) => `¡Feliz cumpleaños, ${n}! 🎂 Gracias por tu compromiso y por ser parte del equipo. Te deseamos un día lleno de alegría y un año de muchos éxitos.`,
  (n) => `${n}, ¡hoy es tu día! Qué bueno tenerte con nosotros. Que lo disfrutes muchísimo junto a quienes más quieres.`,
  (n) => `¡Muchas felicidades, ${n}! Gracias por todo lo que aportas al equipo. Que este nuevo año de vida te traiga salud, tranquilidad y buenas noticias.`,
  (n) => `¡Un abrazo grande en tu cumpleaños, ${n}! Contigo el equipo es mejor. ¡A celebrar!`,
];
const FIRMAS = [
  (m) => (m ? `Con cariño, el equipo de ${m}` : 'Con cariño, tu equipo de trabajo'),
  (m) => (m ? `Un abrazo de todo el equipo de ${m}` : 'Un abrazo de todo tu equipo'),
  (m) => (m ? `Tu familia ${m} te manda un abrazo` : 'Tu equipo te manda un abrazo'),
  (m) => (m ? `Con mucho aprecio, ${m}` : 'Con mucho aprecio, tu equipo'),
];
const FIRMA_MARCA = { BALU: 'Balú', PLANETA: 'Planeta' };
const sinTildes = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function familiaDeCargo(cargoId, cargoNombre) {
  const porCodigo = FAMILIAS_MENSAJE.find((f) => f.codigos.includes(String(cargoId || '').toUpperCase()));
  if (porCodigo) return porCodigo.id;
  const nom = sinTildes(cargoNombre);
  const porNombre = FAMILIAS_MENSAJE.find((f) => f.palabras.some((p) => nom.includes(sinTildes(p))));
  return porNombre ? porNombre.id : 'general';
}
export function variantesDeFamilia(id) { const f = FAMILIAS_MENSAJE.find((x) => x.id === id); return f ? f.textos : MENSAJES_GENERALES; }
let ultimoMensaje = -1;
/* azar: función que devuelve un número en [0,1) (por defecto Math.random); se inyecta para poder probar. */
export function mensajeCumpleanos({ primerNombre, cargoId, cargoNombre, marca }, azar = Math.random) {
  const n = String(primerNombre || '').trim() || 'amigo';
  const lista = variantesDeFamilia(familiaDeCargo(cargoId, cargoNombre));
  let k = Math.min(lista.length - 1, Math.floor(azar() * lista.length));
  if (lista.length > 1 && k === ultimoMensaje) k = (k + 1) % lista.length; /* no repite el mensaje anterior */
  ultimoMensaje = k;
  const firma = FIRMAS[Math.min(FIRMAS.length - 1, Math.floor(azar() * FIRMAS.length))](FIRMA_MARCA[marca]);
  return `${lista[k](n)}\n\n${firma} 🎉`;
}
/* Enlace de WhatsApp (teléfonos venezolanos 04xx se convierten al prefijo 58). Devuelve null si el número no sirve. */
export function enlaceWhatsApp(telefono, mensaje) {
  const n = String(telefono || '').replace(/\D/g, '');
  const num = n.length === 11 && n.startsWith('0') ? `58${n.slice(1)}` : n;
  if (num.length < 11) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
}
