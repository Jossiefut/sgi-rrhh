/* Autenticación de documentos con código QR.
 * Todo documento que el sistema genera por sus flujos e información (informes, evaluaciones, planes, relaciones, etc.) sale con un
 * QR y un código de verificación; al descargarlo se registra la emisión (quién, cuándo, qué huella de contenido). Quien escanea el QR
 * abre la página pública de verificación, que confirma si el documento fue emitido por el sistema y si sigue vigente.
 * NO aplica a los documentos de los expedientes de personal (kit legal de ingreso, contratos, prórrogas, cartas, documentación
 * administrativa, ruta habitual, constancias): esos conservan su formato original. */
import qrcode from 'qrcode-generator';

export const URL_VERIFICACION_INICIAL = 'https://sgi-rrhh.vercel.app/';

/* ---- SHA-256 síncrono (UTF-8) ---- */
const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
function utf8(str) {
  const s = unescape(encodeURIComponent(String(str)));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) out[i] = s.charCodeAt(i);
  return out;
}
export function sha256Hex(texto) {
  const data = utf8(texto);
  const l = data.length;
  const n = (((l + 9 + 63) >> 6) << 6);
  const b = new Uint8Array(n);
  b.set(data); b[l] = 0x80;
  const dv = new DataView(b.buffer);
  dv.setUint32(n - 8, Math.floor((l * 8) / 4294967296), false); dv.setUint32(n - 4, (l * 8) >>> 0, false);
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);
  const rr = (x, c) => (x >>> c) | (x << (32 - c));
  for (let o = 0; o < n; o += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = dv.getUint32(o + i * 4, false);
    for (let i = 16; i < 64; i += 1) { const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3); const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0; }
    let [a, bb, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i += 1) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25); const ch = (e & f) ^ (~e & g); const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22); const mj = (a & bb) ^ (a & c) ^ (bb & c); const t2 = (S0 + mj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = bb; bb = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + bb) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0; H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return H.map((x) => x.toString(16).padStart(8, '0')).join('');
}

/* ---- Código de verificación: SGI-XXXX-XXXX-XXXX (alfabeto sin 0, O, 1, I) ---- */
const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export function codigoDeHash(hashHex) {
  let bits = ''; for (let i = 0; i < 16; i += 2) bits += parseInt(hashHex.slice(i, i + 2), 16).toString(2).padStart(8, '0');
  let s = ''; for (let i = 0; i + 5 <= 60; i += 5) s += ALFABETO[parseInt(bits.slice(i, i + 5), 2)];
  return `SGI-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}
export function normalizarCodigo(txt) {
  const s = String(txt || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = /^SGI([A-Z0-9]{12})$/.exec(s) || /^([A-Z0-9]{12})$/.exec(s);
  return m ? `SGI-${m[1].slice(0, 4)}-${m[1].slice(4, 8)}-${m[1].slice(8, 12)}` : '';
}
/* Huella del contenido (sin el bloque del QR) y código único de cada emisión */
export function huellaContenido(nombre, html) { return sha256Hex(`${nombre}\n${html}`); }
export function codigoEmision(huella, emisorId, fechaISO) { return codigoDeHash(sha256Hex(`${huella}|${emisorId}|${fechaISO}`)); }

export function urlVerificacion(codigo, base) {
  const b = String(base || URL_VERIFICACION_INICIAL).trim() || URL_VERIFICACION_INICIAL;
  return `${b.split('#')[0]}#verificar=${codigo}`;
}
export function codigoDeHashUrl(hash) { const m = /^#?verificar=([A-Za-z0-9-]+)/.exec(String(hash || '')); return m ? normalizarCodigo(m[1]) : ''; }

/* ---- QR (imagen GIF en data URI: la leen html2canvas y cualquier navegador) ---- */
export function qrDataUrl(texto, celda = 4, margen = 2) {
  const qr = qrcode(0, 'M');
  qr.addData(String(texto)); qr.make();
  return qr.createDataURL(celda, margen);
}

const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function fechaHoraTexto(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(iso || '')); return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : String(iso || ''); }

/* Bloque que se agrega al final de cada documento con QR */
export function bloqueQrHTML({ codigo, url, huella, emisor, fecha }) {
  return `<div class="bloque-qr" data-qr="${esc(codigo)}" style="margin-top:18px;padding-top:8px;border-top:1px solid #9b8fa3;page-break-inside:avoid;break-inside:avoid;">
    <table style="width:100%;border-collapse:collapse;border:0;"><tr>
      <td style="width:84px;border:0;padding:0;vertical-align:top;"><img src="${qrDataUrl(url)}" alt="Código QR de autenticación ${esc(codigo)}" style="width:78px;height:78px;image-rendering:pixelated;display:block;"/></td>
      <td style="border:0;padding:0 0 0 8px;vertical-align:middle;font-size:8pt;line-height:1.35;color:#333;">
        <b>Documento autenticado por el sistema</b><br/>
        Código de verificación: <b>${esc(codigo)}</b> · Huella: ${esc(String(huella).slice(0, 8).toUpperCase())}<br/>
        Emitido el ${esc(fechaHoraTexto(fecha))} por ${esc(emisor)}.<br/>
        Escanee el QR o ingrese el código en ${esc(url.split('#')[0])} (opción «Verificar un documento») para comprobar que es auténtico y está vigente.
      </td></tr></table>
  </div>`;
}

/* Documentos de expedientes de personal: no llevan QR */
export const CLAVES_SIN_QR = new Set(['contrato', 'responsabilidad', 'confidencialidad', 'cestaticket', 'rutahabitual', 'prorroga', 'ficha']);
export const CATEGORIAS_SIN_QR = new Set(['INGRESO', 'PRORROGA']);
export const FASES_SIN_QR = new Set(['INGRESO_ADM']);
export function esDocumentoDeExpediente(d) {
  if (!d) return false;
  if (d.sinQR === true || d.adm) return true;
  if (d.categoria && CATEGORIAS_SIN_QR.has(d.categoria)) return true;
  if (d.fase && FASES_SIN_QR.has(d.fase)) return true;
  const clave = String(d.clave || '');
  return CLAVES_SIN_QR.has(clave) || clave.startsWith('adm-');
}

/* Aplica el QR a un documento {clave, nombre, html}. emision: {usuario:{id,nombre,rol}, rolTexto, fecha, base}. Devuelve el documento con html ampliado y d.qr = registro de la emisión. */
export function conAutenticacion(d, emision) {
  if (!d || esDocumentoDeExpediente(d) || !emision) return d;
  const huella = huellaContenido(d.nombre || d.clave || '', d.html || '');
  const codigo = codigoEmision(huella, emision.usuario.id, emision.fecha);
  const url = urlVerificacion(codigo, emision.base);
  const emisor = `${emision.usuario.nombre}${emision.rolTexto ? ` (${emision.rolTexto})` : ''}`;
  return {
    ...d,
    html: `${d.html || ''}${bloqueQrHTML({ codigo, url, huella, emisor, fecha: emision.fecha })}`,
    qr: { codigo, huella, tipo: d.clave || '', nombre: d.nombre || '', fecha: emision.fecha, emisorId: emision.usuario.id, emisorNombre: emision.usuario.nombre, emisorRol: emision.rolTexto || '', marca: emision.marca || '', anulado: false },
  };
}

/* Verificación contra el registro local */
export function verificarEnRegistro(registros, codigoTexto) {
  const codigo = normalizarCodigo(codigoTexto);
  if (!codigo) return { estado: 'INVALIDO' };
  const r = (registros || []).find((x) => x.codigo === codigo);
  if (!r) return { estado: 'NO_ENCONTRADO', codigo };
  return { estado: r.anulado ? 'ANULADO' : 'VIGENTE', codigo, nombre: r.nombre, tipo: r.tipo, fecha: r.fecha, emisorNombre: r.emisorNombre, emisorRol: r.emisorRol, marca: r.marca || '', huella8: String(r.huella || '').slice(0, 8).toUpperCase(), anuladoMotivo: r.anuladoMotivo || '' };
}
