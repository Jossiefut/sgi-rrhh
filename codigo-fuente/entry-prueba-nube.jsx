import React from 'react';
import { createRoot } from 'react-dom/client';
import { accionPrueba } from './intentos.js';
/* Nube simulada en memoria para pruebas (misma interfaz que nube.js) */
const db = { usuarios: [], perfiles: [], registros: new Map(), ajustes: new Map(), fichas: new Map(), admins: ['josselyn.tovar@futurarg.com'], guardados: [], correos: [], accesos: [], preguntas: {}, intentosRest: {}, registroRest: [] };
let sesion = null; const oyentes = [];
const emitir = (ev) => oyentes.forEach((cb) => cb(ev, sesion));
const nuevoPerfil = (correo, nombre) => ({ id: `u-${db.perfiles.length + 1}`, correo, nombre, rol: 'pendiente', marca: null, tienda_id: null, activo: true, debe_cambiar_clave: true });
const desdeFila = (f) => ({ id: f.id, cedula: f.cedula, trabajadorId: f.trabajador_id, solicitudId: f.solicitud_id, tiendaId: f.tienda_id, nombre: f.nombre, cargoDestinoId: f.cargo_destino, bateria: f.bateria, estado: f.estado, respuestas: f.respuestas || {}, ev: f.ev || {}, tipo: f.tipo || 'PROMOCION', apellidos: f.apellidos || '', nivelEducativo: f.nivel_educativo || '', inicio: f.inicio || '', fin: f.fin || '', expira: f.expira });
window.__DB__ = db; window.__EXPONER_PRUEBAS__ = true;
window.__NUBE__ = {
  async sesion() { return sesion; },
  alCambiarSesion(cb) { oyentes.push(cb); return () => {}; },
  async entrar(correo, clave) { const u = db.usuarios.find((x) => x.correo === correo.trim().toLowerCase() && x.clave === clave); if (!u) throw new Error('Correo o contraseña incorrectos.'); sesion = { user: { id: u.id } }; setTimeout(() => emitir('SIGNED_IN'), 0); },
  async salir() { sesion = null; setTimeout(() => emitir('SIGNED_OUT'), 0); },
  async cambiarClave(nueva) { const u = db.usuarios.find((x) => x.id === sesion.user.id); u.clave = nueva; db.perfiles.find((p) => p.id === u.id).debe_cambiar_clave = false; },
  async preguntasDeCorreo(correo) { const u = db.usuarios.find((x) => x.correo === correo.trim().toLowerCase()); const q = u && db.preguntas[u.id]; return q ? q.map((x) => x.id) : ['q09', 'q02', 'q05']; },
  async tienePreguntas() { return Boolean(db.preguntas[sesion.user.id]); },
  async guardarPreguntas(p) {
    const ids = p.map((x) => x.id); if (new Set(ids).size !== 3) throw new Error('Elija tres preguntas distintas.');
    db.preguntas[sesion.user.id] = p.map((x) => ({ id: x.id, resp: x.respuesta.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '') }));
  },
  async restablecerClave(correo, resp, nueva) {
    const c = correo.trim().toLowerCase(); const t = db.intentosRest[c] || (db.intentosRest[c] = { n: 0, hasta: 0 });
    if (t.hasta > Date.now()) { db.registroRest.push({ correo: c, resultado: 'BLOQUEADO' }); throw new Error('Demasiados intentos. Espere 30 minutos o pida al Administrador que restablezca su contraseña.'); }
    const u = db.usuarios.find((x) => x.correo === c); const q = u && db.preguntas[u.id];
    const bien = q && resp.every((r, i) => r.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '') === q[i].resp);
    if (!bien) { t.n += 1; if (t.n >= 5) { t.n = 0; t.hasta = Date.now() + 1800000; db.registroRest.push({ correo: c, resultado: 'BLOQUEO_30_MIN' }); throw new Error('Demasiados intentos. Espere 30 minutos o pida al Administrador que restablezca su contraseña.'); } db.registroRest.push({ correo: c, resultado: 'FALLIDO' }); throw new Error('Las respuestas no coinciden.'); }
    t.n = 0; u.clave = nueva; db.registroRest.push({ correo: c, resultado: 'OK' }); return { ok: true };
  },
  async registroRestablecimientos() { return db.registroRest.map((r, i) => ({ id: i + 1, correo: r.correo, momento: new Date().toISOString(), resultado: r.resultado })).reverse(); },
  async gestionUsuarios(b) {
    if (b.accion === 'admin_inicial') {
      if (!db.admins.includes(b.correo.toLowerCase())) throw new Error('Este correo no está autorizado como administrador inicial.');
      if (db.perfiles.some((p) => p.correo === b.correo.toLowerCase())) throw new Error('La cuenta ya fue activada.');
      const p = nuevoPerfil(b.correo.toLowerCase(), b.nombre); p.rol = 'admin'; p.debe_cambiar_clave = false; db.perfiles.push(p); db.usuarios.push({ id: p.id, correo: p.correo, clave: b.clave }); return { ok: true };
    }
    const yo = db.perfiles.find((p) => p.id === sesion.user.id); if (!yo || yo.rol !== 'admin') throw new Error('Solo el Administrador puede gestionar usuarios.');
    if (b.accion === 'crear') { if (db.perfiles.some((p) => p.correo === b.correo.toLowerCase())) throw new Error('Ya existe un usuario con ese correo.'); const p = nuevoPerfil(b.correo.toLowerCase(), b.nombre); Object.assign(p, { rol: b.rol, marca: b.marca, tienda_id: b.tiendaId }); db.perfiles.push(p); db.usuarios.push({ id: p.id, correo: p.correo, clave: b.clave }); return { ok: true, id: p.id }; }
    if (b.accion === 'actualizar') { Object.assign(db.perfiles.find((p) => p.id === b.id), { nombre: b.nombre, rol: b.rol, marca: b.marca, tienda_id: b.tiendaId, activo: b.activo !== false }); return { ok: true }; }
    if (b.accion === 'restablecer') { db.usuarios.find((u) => u.id === b.id).clave = b.clave; db.perfiles.find((p) => p.id === b.id).debe_cambiar_clave = true; return { ok: true }; }
    throw new Error('Acción no válida.');
  },
  async enviarRecordatorios(mensajes) {
    const yo = db.perfiles.find((p) => p.id === sesion.user.id); if (!yo || !['rrhh', 'admin'].includes(yo.rol)) throw new Error('Solo RRHH o el Administrador pueden enviar recordatorios.');
    let enviados = 0; const fallidos = [];
    mensajes.forEach((m) => { const p = db.perfiles.find((x) => x.id === m.usuarioId && x.activo); if (p) { db.correos.push({ para: p.correo, asunto: m.asunto }); enviados += 1; } else fallidos.push({ usuarioId: m.usuarioId }); });
    return { ok: true, enviados, fallidos };
  },
  async crearAccesoPrueba(a) { db.accesos.push({ id: a.id, cedula: a.cedula, clave: String(a.clave).toUpperCase(), trabajador_id: a.trabajadorId || null, solicitud_id: a.solicitudId || null, tipo: a.tipo || 'PROMOCION', apellidos: a.apellidos || '', tienda_id: a.tiendaId, nombre: a.nombre, cargo_destino: a.cargoDestinoId, bateria: a.bateria, estado: 'PENDIENTE', respuestas: {}, ev: {}, nivel_educativo: '', creado: new Date().toISOString(), expira: a.expira }); },
  async anularAccesoPrueba(id) { const a = db.accesos.find((x) => x.id === id); if (a) a.estado = 'ANULADA'; },
  async portalIngresar(ced, clave) {
    const lista = db.accesos.filter((a) => a.cedula === ced && a.clave === clave && ['PENDIENTE', 'EN_CURSO'].includes(a.estado));
    const cfg = (db.ajustes.get('config') || {}).minutosPrueba || {};
    return { accesos: lista.map(desdeFila), preguntas: db.ajustes.get('ipvPreguntas') || [], pruebas: [], minutos: { IPV: cfg.IPV || 40, KOSTICK: cfg.KOSTICK || 40, LOGICO: cfg.LOGICO || 15 }, ahora: Date.now() + (window.__DESFASE__ || 0) };
  },
  /* Misma regla que portal_accion de la base de datos (intentos.js) */
  async portalAccion(ced, clave, id, prueba, tipo, respuestas, nivel) {
    const a = db.accesos.find((x) => x.id === id && x.cedula === ced && x.clave === clave && ['PENDIENTE', 'EN_CURSO'].includes(x.estado)); if (!a) throw new Error('El acceso no es válido o ya fue enviado.');
    const ahora = Date.now() + (window.__DESFASE__ || 0);
    const r = accionPrueba(desdeFila(a), prueba, tipo, { respuestas, nivelEducativo: nivel }, ahora, db.ajustes.get('config') || {});
    Object.assign(a, { ev: r.acceso.ev, nivel_educativo: r.acceso.nivelEducativo || a.nivel_educativo, estado: r.acceso.estado, inicio: r.acceso.inicio, fin: r.acceso.fin, expira: r.acceso.expira });
    return { acceso: desdeFila(a), error: r.error, ahora };
  },
  async autorizarReintento(id, prueba) {
    const yo = db.perfiles.find((p) => p.id === sesion.user.id); if (!yo || !['rrhh', 'admin'].includes(yo.rol)) throw new Error('Solo RRHH o el Administrador pueden autorizar un reintento.');
    const a = db.accesos.find((x) => x.id === id);
    const r = accionPrueba(desdeFila(a), prueba, 'autorizar', {}, Date.now() + (window.__DESFASE__ || 0), db.ajustes.get('config') || {});
    if (r.error) throw new Error(r.error);
    Object.assign(a, { ev: r.acceso.ev, estado: r.acceso.estado, fin: r.acceso.fin, expira: r.acceso.expira });
    return desdeFila(a);
  },
  async cargar(uid) {
    const perfil = db.perfiles.find((p) => p.id === uid);
    if (perfil.rol === 'pendiente' || !perfil.activo) return { perfil: { ...perfil } };
    const regs = Array.from(db.registros.values());
    return { accesos: db.accesos.map((a) => ({ ...a, clave: undefined })), perfil: { ...perfil }, perfiles: db.perfiles.map((p) => ({ ...p })), registros: regs.filter((r) => r.coleccion !== 'bitacora').map((r) => ({ coleccion: r.coleccion, id: r.id, data: JSON.parse(JSON.stringify(r.data)) })), bitacora: regs.filter((r) => r.coleccion === 'bitacora').map((r) => r.data), ajustes: Array.from(db.ajustes.entries()).map(([clave, data]) => ({ clave, data: JSON.parse(JSON.stringify(data)) })), fichas: Array.from(db.fichas.values()) };
  },
  async guardar(c) {
    db.guardados.push({ registros: (c.registros || []).map((r) => `${r.coleccion}:${r.id}:${r.tienda_id}`), borrados: (c.borrados || []).length, ajustes: (c.ajustes || []).map((a) => a.clave), fichas: (c.fichas || []).length });
    (c.ajustes || []).forEach((a) => db.ajustes.set(a.clave, JSON.parse(JSON.stringify(a.data))));
    (c.registros || []).forEach((r) => db.registros.set(`${r.coleccion}|${r.id}`, JSON.parse(JSON.stringify(r))));
    (c.borrados || []).forEach((b) => db.registros.delete(`${b.coleccion}|${b.id}`));
    (c.fichas || []).forEach((f) => db.fichas.set(f.cedula, JSON.parse(JSON.stringify(f))));
  },
};
import('./App.jsx').then(({ default: App }) => { createRoot(document.getElementById('root')).render(<App />); });
