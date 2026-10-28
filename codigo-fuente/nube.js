/* Capa de datos en la nube (Supabase): sesión, carga y guardado.
   Solo se incluye en la versión publicada como sitio web (entry-nube.jsx). */
import { createClient } from '@supabase/supabase-js';

const TAM_PAGINA = 1000;
const TAM_LOTE = 200;

export function accesoDesdeFila(f) {
  return { id: f.id, cedula: f.cedula, trabajadorId: f.trabajador_id, solicitudId: f.solicitud_id, tiendaId: f.tienda_id, nombre: f.nombre, cargoDestinoId: f.cargo_destino, bateria: f.bateria || [], estado: f.estado, respuestas: f.respuestas || {}, ev: f.ev || {}, tipo: f.tipo || 'PROMOCION', apellidos: f.apellidos || '', nivelEducativo: f.nivel_educativo || '', inicio: f.inicio || '', fin: f.fin || '', creado: f.creado, creadoPor: f.creado_por || '', expira: f.expira };
}
/* El servidor aún no tiene instalada la función (migración pendiente de aplicar) */
const noActivada = (e) => /schema cache|Could not find the function|does not exist|not found/i.test(String((e && (e.message || e.details)) || '')) || (e && e.code === 'PGRST202');
export function crearNube(url, clave) {
  const sb = createClient(url, clave, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'sgi-rrhh-sesion' } });

  async function todo(consulta) {
    const filas = [];
    for (let desde = 0; ; desde += TAM_PAGINA) {
      const { data, error } = await consulta().range(desde, desde + TAM_PAGINA - 1);
      if (error) throw error;
      filas.push(...data);
      if (data.length < TAM_PAGINA) break;
    }
    return filas;
  }
  async function enLotes(filas, fn) {
    for (let i = 0; i < filas.length; i += TAM_LOTE) {
      const { error } = await fn(filas.slice(i, i + TAM_LOTE));
      if (error) throw error;
    }
  }

  return {
    async sesion() { const { data } = await sb.auth.getSession(); return data.session; },
    alCambiarSesion(cb) { const { data } = sb.auth.onAuthStateChange((evento, sesion) => cb(evento, sesion)); return () => data.subscription.unsubscribe(); },
    async entrar(correo, claveUsuario) {
      const { error } = await sb.auth.signInWithPassword({ email: correo.trim().toLowerCase(), password: claveUsuario });
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message);
    },
    async salir() { await sb.auth.signOut(); },
    /* Recepcion automatica del formulario (Power Automate -> Supabase) */
    datosIntegracion() { return { url: `${url}/rest/v1/rpc/recibir_formulario`, apikey: clave }; },
    async generarClaveIntegracion() {
      const { data, error } = await sb.rpc('generar_clave_integracion');
      if (error) throw new Error(error.message);
      return data;
    },
    async formularioPendiente() {
      const filas = await todo(() => sb.from('formulario_recibido').select('id_formulario, cedula, data, recibido').eq('procesado', false).order('recibido'));
      return filas;
    },
    async formularioMarcar(ids) {
      for (let i = 0; i < ids.length; i += 100) {
        const { error } = await sb.from('formulario_recibido').update({ procesado: true, procesado_en: new Date().toISOString() }).in('id_formulario', ids.slice(i, i + 100));
        if (error) throw new Error(error.message);
      }
    },
    async cambiarClave(nueva) {
      const { error } = await sb.auth.updateUser({ password: nueva });
      if (error) throw new Error(error.message.includes('different') ? 'La nueva contraseña debe ser distinta de la anterior.' : error.message);
      const { error: e2 } = await sb.rpc('clave_cambiada');
      if (e2) throw e2;
    },
    /* Restablecer la contraseña con preguntas de seguridad (v1.16.0) */
    async preguntasDeCorreo(correo) {
      const { data, error } = await sb.rpc('preguntas_de_correo', { p_correo: correo });
      if (error) throw Object.assign(new Error(noActivada(error) ? 'El restablecimiento con preguntas de seguridad aún no está activado. Pida al Administrador que restablezca su contraseña.' : 'No se pudieron obtener las preguntas. Intente de nuevo.'), { noActivada: noActivada(error) });
      return data;
    },
    async tienePreguntas() { const { data, error } = await sb.rpc('tiene_preguntas_seguridad'); if (error) return false; return Boolean(data); },
    async guardarPreguntas(p) {
      const { error } = await sb.rpc('guardar_preguntas_seguridad', { p1: p[0].id, r1: p[0].respuesta, p2: p[1].id, r2: p[1].respuesta, p3: p[2].id, r3: p[2].respuesta });
      if (error) throw Object.assign(new Error(noActivada(error) ? 'Las preguntas de seguridad aún no están activadas en el servidor.' : error.message), { noActivada: noActivada(error) });
    },
    async restablecerClave(correo, respuestas, nueva) {
      const { data, error } = await sb.functions.invoke('restablecer-clave', { body: { correo, respuestas, nueva } });
      if (error) {
        let mensaje = error.message;
        try { const j = await error.context.json(); if (j && j.error) mensaje = j.error; } catch (e) { /* sin detalle */ }
        throw new Error(mensaje);
      }
      return data;
    },
    async registroRestablecimientos() {
      const { data, error } = await sb.from('restablecer_registro').select('id, correo, momento, resultado').order('id', { ascending: false }).limit(50);
      if (error) throw new Error(error.message);
      return data || [];
    },
    async gestionUsuarios(cuerpo) {
      const { data, error } = await sb.functions.invoke('admin-usuarios', { body: cuerpo });
      if (error) {
        let mensaje = error.message;
        try { const j = await error.context.json(); if (j && j.error) mensaje = j.error; } catch (e) { /* sin detalle */ }
        throw new Error(mensaje);
      }
      return data;
    },
    async enviarRecordatorios(mensajes) {
      const { data, error } = await sb.functions.invoke('recordatorios', { body: { mensajes } });
      if (error) {
        let mensaje = error.message;
        try { const j = await error.context.json(); if (j && j.error) mensaje = j.error; } catch (e) { /* sin detalle */ }
        throw new Error(mensaje);
      }
      return data;
    },
    /* Avisos por correo de solicitudes: decisión (al solicitante) y pendiente por aprobar (a los aprobadores). El servidor los valida y arma el texto. */
    async notificarSolicitudes(avisos) {
      const { data, error } = await sb.functions.invoke('notificar-solicitud', { body: { avisos } });
      if (error) {
        let mensaje = error.message;
        try { const j = await error.context.json(); if (j && j.error) mensaje = j.error; } catch (e) { /* sin detalle */ }
        throw new Error(mensaje);
      }
      return data;
    },
    /* Portal de evaluación: el trabajador entra con cédula y clave; el servidor valida y guarda */
    async portalIngresar(cedula, clave) {
      const { data, error } = await sb.rpc('portal_ingresar', { p_cedula: cedula, p_clave: clave });
      if (error) throw new Error(error.message);
      return { accesos: (data.accesos || []).map(accesoDesdeFila), preguntas: data.preguntas || [], pruebas: data.pruebas || [], minutos: data.minutos || {}, ahora: Number(data.ahora) || Date.now() };
    },
    /* Acción del trabajador sobre una prueba (iniciar, guardar, terminar). El servidor controla el tiempo y los intentos. */
    async portalAccion(cedula, clave, id, prueba, tipo, respuestas, nivelEducativo) {
      const { data, error } = await sb.rpc('portal_accion', { p_cedula: cedula, p_clave: clave, p_id: id, p_prueba: prueba, p_tipo: tipo, p_respuestas: respuestas || {}, p_nivel: nivelEducativo || '' });
      if (error) throw new Error(error.message);
      return { acceso: accesoDesdeFila(data.acceso), error: data.error || '', ahora: Number(data.ahora) || Date.now() };
    },
    /* RRHH o el Administrador autorizan un último intento */
    async autorizarReintento(id, prueba) {
      const { data, error } = await sb.rpc('autorizar_reintento', { p_id: id, p_prueba: prueba });
      if (error) throw new Error(error.message);
      return accesoDesdeFila(data);
    },
    async crearAccesoPrueba(a) {
      const { error } = await sb.rpc('crear_acceso_prueba', { p_id: a.id, p_cedula: a.cedula, p_clave: a.clave, p_trabajador_id: a.trabajadorId || null, p_solicitud_id: a.solicitudId || null, p_tipo: a.tipo || 'PROMOCION', p_apellidos: a.apellidos || '', p_tienda_id: a.tiendaId, p_nombre: a.nombre, p_cargo_destino: a.cargoDestinoId, p_bateria: a.bateria, p_expira: a.expira });
      if (error) throw new Error(error.message);
    },
    /* Clima laboral y buzón: funciones públicas (sin sesión) validadas en el servidor */
    async climaCiclo(id) {
      const { data, error } = await sb.rpc('clima_ciclo', { p_ciclo: id });
      if (error) throw new Error(error.message);
      return data;
    },
    async climaValidar(id, cedula) {
      const { data, error } = await sb.rpc('clima_validar', { p_ciclo: id, p_cedula: cedula });
      if (error) throw new Error(error.message);
      return data;
    },
    async climaEnviar(id, cedula, datos) {
      const { data, error } = await sb.rpc('clima_enviar', { p_ciclo: id, p_cedula: cedula, p_data: datos });
      if (error) throw new Error(error.message);
      return data;
    },
    /* Verificación pública de documentos autenticados (sin sesión): el servidor devuelve solo los datos de la emisión, nunca datos de trabajadores */
    async verificarDocumento(codigo) {
      const { data, error } = await sb.rpc('verificar_documento', { p_codigo: codigo });
      if (error) throw new Error(error.message);
      const r = data || {};
      return { estado: r.estado || 'NO_ENCONTRADO', codigo: r.codigo || codigo, nombre: r.nombre || '', tipo: r.tipo || '', fecha: r.fecha || '', emisorNombre: r.emisor_nombre || '', emisorRol: r.emisor_rol || '', marca: r.marca || '', huella8: r.huella8 || '', anuladoMotivo: r.anulado_motivo || '' };
    },
    async anularAccesoPrueba(id) {
      const { error } = await sb.from('accesos_prueba').update({ estado: 'ANULADA' }).eq('id', id);
      if (error) throw new Error(error.message);
    },
    async cargar(usuarioId) {
      const { data: perfil, error } = await sb.from('perfiles').select('*').eq('id', usuarioId).maybeSingle();
      if (error) throw error;
      if (!perfil) throw new Error('No se encontró el perfil del usuario.');
      if (perfil.rol === 'pendiente' || !perfil.activo) return { perfil };
      const [perfiles, registros, bitacora, ajustes, fichas, accesos, sensibles, remuneraciones, emitidos] = await Promise.all([
        todo(() => sb.from('perfiles').select('id, correo, nombre, rol, marca, tienda_id, activo, debe_cambiar_clave').order('correo')),
        todo(() => sb.from('registros').select('coleccion, id, data').neq('coleccion', 'bitacora').order('coleccion').order('id')),
        sb.from('registros').select('data').eq('coleccion', 'bitacora').order('actualizado', { ascending: false }).limit(2000).then((r) => { if (r.error) throw r.error; return r.data; }),
        todo(() => sb.from('ajustes').select('clave, data').order('clave')),
        todo(() => sb.from('fichas_personales').select('cedula, trabajador_id, tienda_id, data, fuente, actualizado').order('cedula')),
        todo(() => sb.from('accesos_prueba').select('id, cedula, trabajador_id, solicitud_id, tipo, apellidos, tienda_id, nombre, cargo_destino, bateria, estado, respuestas, ev, nivel_educativo, inicio, fin, creado, creado_por, expira').order('creado')),
        perfil.rol === 'rrhh' ? todo(() => sb.from('fichas_sensibles').select('cedula, data').order('cedula')) : Promise.resolve([]),
        /* tabla protegida: el servidor entrega solo lo que el rol puede ver; si aún no se creó, la app sigue funcionando sin ella */
        todo(() => sb.from('remuneraciones').select('id, data').order('id')).catch(() => []),
        /* registro de documentos autenticados: si aún no se creó la tabla, la app sigue funcionando sin ella */
        todo(() => sb.from('documentos_emitidos').select('codigo, data').order('codigo')).catch(() => []),
      ]);
      return { perfil, perfiles, registros, bitacora: bitacora.map((x) => x.data), ajustes, fichas, accesos, sensibles, remuneraciones, emitidos };
    },
    async guardar({ registros = [], borrados = [], ajustes = [], fichas = [], sensibles = [], remuneraciones = [], emisiones = [] }) {
      const orden = (c) => (c.coleccion === 'tiendas' ? 0 : c.coleccion === 'cargos' ? 1 : 2);
      const filas = [...registros].sort((a, b) => orden(a) - orden(b));
      const bit = filas.filter((x) => x.coleccion === 'bitacora');
      const resto = filas.filter((x) => x.coleccion !== 'bitacora');
      if (ajustes.length) { const { error } = await sb.from('ajustes').upsert(ajustes); if (error) throw error; }
      const tiendas = resto.filter((x) => x.coleccion === 'tiendas');
      await enLotes(tiendas, (l) => sb.from('registros').upsert(l));
      await enLotes(resto.filter((x) => x.coleccion !== 'tiendas'), (l) => sb.from('registros').upsert(l));
      await enLotes(fichas, (l) => sb.from('fichas_personales').upsert(l));
      await enLotes(sensibles, (l) => sb.from('fichas_sensibles').upsert(l));
      for (const b of borrados) {
        const { error } = await sb.from('registros').delete().eq('coleccion', b.coleccion).eq('id', b.id);
        if (error) throw error;
      }
      await enLotes(bit, (l) => sb.from('registros').upsert(l, { onConflict: 'coleccion,id', ignoreDuplicates: true }));
      /* Si la tabla de documentos emitidos aún no existe en el servidor (actualización pendiente), no se bloquea el guardado del resto */
      try { await enLotes(emisiones, (l) => sb.from('documentos_emitidos').upsert(l.map((x) => ({ ...x, actualizado: new Date().toISOString() })))); }
      catch (e) { if (!(e && (e.code === '42P01' || e.code === 'PGRST205' || /schema cache|does not exist/i.test(String(e.message || ''))))) throw e; }
      await enLotes(remuneraciones, (l) => sb.from('remuneraciones').upsert(l.map((x) => ({ ...x, actualizado: new Date().toISOString() }))));
    },
  };
}
