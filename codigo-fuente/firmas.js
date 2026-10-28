/* Firma digital por usuario (v1.24.0): imagen de la firma que se muestra en los documentos que la persona emite o aprueba.
 * - La pueden importar el Gerente de Marca y los perfiles superiores (Operaciones, RRHH, Gerencia General, Junta Directiva) y el Administrador.
 * - La imagen queda SOLO en el navegador de quien la importó (no va al repositorio ni al paquete). Al aprobar o firmar un paso, la imagen se copia
 *   al registro de ese paso para que el documento la muestre desde cualquier equipo. */

export const ROLES_FIRMA_DIGITAL = ['marca', 'operaciones', 'rrhh', 'general', 'junta', 'admin'];
export const MAX_BYTES_ARCHIVO_FIRMA = 3 * 1024 * 1024;
export const MAX_CHARS_FIRMA = 120000;
const ANCHO_MAX = 420;
const ALTO_MAX = 150;

export const puedeTenerFirma = (rol) => ROLES_FIRMA_DIGITAL.includes(rol);
export const claveFirma = (id) => `sgi-firma-v1-${id}`;

/* Solo imágenes PNG o JPEG en data URL, de tamaño razonable (la imagen se escribe dentro del HTML del documento) */
export function esImagenFirmaValida(img) {
  return typeof img === 'string' && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(img) && img.length <= MAX_CHARS_FIRMA;
}

export function leerFirma(id, almacen) {
  if (!id) return '';
  try {
    const a = almacen || (typeof window !== 'undefined' ? window.localStorage : null);
    const v = a ? a.getItem(claveFirma(id)) : '';
    return esImagenFirmaValida(v) ? v : '';
  } catch (e) { return ''; }
}
export function guardarFirma(id, img, almacen) {
  if (!id || !esImagenFirmaValida(img)) return false;
  try { (almacen || window.localStorage).setItem(claveFirma(id), img); return true; } catch (e) { return false; }
}
export function quitarFirma(id, almacen) {
  try { (almacen || window.localStorage).removeItem(claveFirma(id)); } catch (e) { /* sin acceso al almacenamiento */ }
}

/* Firma que debe quedar en un registro de aprobación: solo si la persona la tiene y su perfil puede usarla */
export function firmaParaRegistro(usuario, almacen) {
  if (!usuario || !puedeTenerFirma(usuario.rol)) return '';
  return leerFirma(usuario.id, almacen);
}

/* HTML de la imagen de la firma dentro de un documento */
export function htmlImagenFirma(img, nombre, alto = 46) {
  if (!esImagenFirmaValida(img)) return '';
  const alt = nombre ? `Firma digital de ${String(nombre).replace(/[<>&"]/g, '')}` : 'Firma digital';
  return `<img data-firma-digital="1" alt="${alt}" src="${img}" style="height:${alto}px;max-width:200px;object-fit:contain;display:inline-block;"/>`;
}

function leerComoDataUrl(archivo) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    r.readAsDataURL(archivo);
  });
}

/* Prepara la imagen: la reduce a un tamaño de firma y vuelve transparente el fondo claro (así se ve bien sobre el documento).
 * Devuelve { ok, img } o { ok:false, error }. Si el navegador no puede procesar imágenes, acepta el archivo tal cual cuando es pequeño. */
export async function prepararImagenFirma(archivo) {
  if (!archivo) return { ok: false, error: 'Seleccione una imagen.' };
  if (!/^image\/(png|jpeg)$/.test(archivo.type || '')) return { ok: false, error: 'La firma debe ser una imagen PNG o JPG.' };
  if (archivo.size > MAX_BYTES_ARCHIVO_FIRMA) return { ok: false, error: 'La imagen pesa más de 3 MB. Use una más liviana.' };
  let original;
  try { original = await leerComoDataUrl(archivo); } catch (e) { return { ok: false, error: e.message }; }
  const procesada = await new Promise((resolve) => {
    try {
      if (typeof document === 'undefined' || typeof Image === 'undefined') { resolve(''); return; }
      const im = new Image();
      im.onload = () => {
        try {
          const esc = Math.min(1, ANCHO_MAX / im.naturalWidth, ALTO_MAX / im.naturalHeight);
          const w = Math.max(1, Math.round(im.naturalWidth * esc)); const h = Math.max(1, Math.round(im.naturalHeight * esc));
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const x = c.getContext('2d');
          if (!x) { resolve(''); return; }
          x.drawImage(im, 0, 0, w, h);
          const d = x.getImageData(0, 0, w, h);
          for (let i = 0; i < d.data.length; i += 4) {
            const luz = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 3;
            if (luz > 235) d.data[i + 3] = 0; else if (luz > 190) d.data[i + 3] = Math.round(d.data[i + 3] * (235 - luz) / 45);
          }
          x.putImageData(d, 0, 0);
          resolve(c.toDataURL('image/png'));
        } catch (e) { resolve(''); }
      };
      im.onerror = () => resolve('');
      setTimeout(() => resolve(''), 4000); /* si el navegador nunca responde, se usa el archivo tal cual */
      im.src = original;
    } catch (e) { resolve(''); }
  });
  const img = procesada || original;
  if (!esImagenFirmaValida(img)) return { ok: false, error: 'La imagen es muy pesada o no es válida. Use una firma más pequeña (PNG o JPG).' };
  return { ok: true, img };
}
