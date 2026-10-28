import { createClient } from 'npm:@supabase/supabase-js@2';

/* Avisos por correo de las solicitudes (cualquier tipo). Dos clases de aviso, ambos con texto mínimo (solo el tipo de solicitud):
   - DECISION: al solicitante, cuando su solicitud fue APROBADA o RECHAZADA.
   - PENDIENTE: a quienes tienen la solicitud pendiente por aprobar.
   Lo llama la aplicación desde la sesión de quien actuó, justo después de guardar. El servidor NO confía en el navegador:
   lee la solicitud guardada, verifica su estado y que la última acción la haya hecho quien llama, arma el mensaje y toma los correos
   de la tabla perfiles. Requiere los secretos RESEND_API_KEY y REMITENTE_CORREO (los mismos de la función «recordatorios»). */
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (cuerpo: unknown, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const esc = (t: unknown) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const TIPOS: Record<string, string> = {
  TRASLADO: 'traslado', PROMOCION: 'promoción', DESINCORPORACION: 'desincorporación', EVAL_PRUEBA: 'evaluación de período de prueba',
  EVAL_PROSECUCION: 'prosecución de contrato', EVAL_FIJO: 'pase a fijo', NINEBOX: 'evaluación Nine-Box', APOYO: 'apoyo de personal', PERNOCTA: 'pernocta',
};
const FINALES = ['APROBADA', 'EJECUTADA', 'RECHAZADA'];
const ABIERTAS = ['PENDIENTE', 'EN_REVISION'];
const MAX_DESTINATARIOS = 12;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });

  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  const { data: quien } = await admin.auth.getUser(token);
  if (!quien || !quien.user) return json({ error: 'Sesión no válida.' }, 401);
  const { data: yo } = await admin.from('perfiles').select('activo').eq('id', quien.user.id).maybeSingle();
  if (!yo || !yo.activo) return json({ error: 'Usuario inactivo.' }, 403);

  const clave = Deno.env.get('RESEND_API_KEY');
  const remitente = Deno.env.get('REMITENTE_CORREO');
  if (!clave || !remitente) return json({ error: 'Falta configurar el envío de correos (RESEND_API_KEY y REMITENTE_CORREO en Supabase).' }, 500);

  let b: { avisos?: Array<Record<string, unknown>> };
  try { b = await req.json(); } catch { return json({ error: 'Solicitud no válida.' }, 400); }
  const avisos = (Array.isArray(b.avisos) ? b.avisos : []).slice(0, 20);

  let enviados = 0;
  const omitidos: Array<{ id: string; motivo: string }> = [];
  const hoy = new Date().toISOString().slice(0, 10);

  const enviar = async (para: string, usuarioId: string, asunto: string, linea: string, destacado: string, etiquetaRegistro: string) => {
    const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:520px">`
      + `<p>${linea.replace(destacado, `<b>${esc(destacado)}</b>`)}</p>`
      + `<p style="color:#667085;font-size:12px">Mensaje automático de SGI RRHH. Por favor no responda a este correo.</p></div>`;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: remitente, to: [para], subject: asunto, text: `${linea}\n\nMensaje automático de SGI RRHH. Por favor no responda a este correo.`, html }),
    });
    await admin.from('recordatorios_envios').insert({ fecha: hoy, usuario_id: usuarioId, correo: para, asunto: etiquetaRegistro, estado: r.ok ? 'ENVIADO' : 'FALLIDO', enviado_por: quien.user.id });
    return r.ok;
  };

  for (const a of avisos) {
    const id = String(a.solicitudId || '');
    const clase = String(a.clase || '');
    if (!id || !['DECISION', 'PENDIENTE'].includes(clase)) { omitidos.push({ id, motivo: 'Aviso no válido' }); continue; }
    const { data: fila } = await admin.from('registros').select('data').eq('coleccion', 'solicitudes').eq('id', id).maybeSingle();
    const s = fila && fila.data as Record<string, any>;
    if (!s) { omitidos.push({ id, motivo: 'No existe' }); continue; }
    const tipo = TIPOS[String(s.tipo)] || 'solicitud';
    const eventos = Array.isArray(s.eventos) ? s.eventos : [];
    const ultimo = eventos[eventos.length - 1] as Record<string, any> | undefined;

    if (clase === 'DECISION') {
      if (!FINALES.includes(s.estado) || s.cerradaPorEgreso) { omitidos.push({ id, motivo: 'No está aprobada ni rechazada' }); continue; }
      const ev = ultimo && FINALES.includes(ultimo.accion) ? ultimo : [...eventos].reverse().find((e: Record<string, any>) => FINALES.includes(e.accion));
      if (!ev || ev.usuarioId !== quien.user.id) { omitidos.push({ id, motivo: 'La decisión no la tomó quien llama' }); continue; }
      const destino = String(s.creadaPor || '');
      if (!destino || destino === quien.user.id) { omitidos.push({ id, motivo: 'Sin solicitante distinto de quien decide' }); continue; }
      const { data: p } = await admin.from('perfiles').select('correo, activo').eq('id', destino).maybeSingle();
      if (!p || !p.activo || !p.correo) { omitidos.push({ id, motivo: 'El solicitante no tiene correo o está inactivo' }); continue; }
      const resultado = s.estado === 'RECHAZADA' || ev.accion === 'RECHAZADA' ? 'rechazada' : 'aprobada';
      const asunto = `Solicitud de ${tipo} ${resultado}`;
      const registro = `${asunto} [${id}]`.slice(0, 200);
      const { data: previo } = await admin.from('recordatorios_envios').select('id').eq('usuario_id', destino).eq('asunto', registro).eq('fecha', hoy).eq('estado', 'ENVIADO').limit(1);
      if (previo && previo.length) { omitidos.push({ id, motivo: 'Ya se avisó hoy' }); continue; }
      if (await enviar(p.correo, destino, asunto, `Su solicitud de ${tipo} fue ${resultado.toUpperCase()}.`, resultado.toUpperCase(), registro)) enviados += 1;
      else omitidos.push({ id, motivo: 'Error de envío' });
    } else {
      if (!ABIERTAS.includes(s.estado)) { omitidos.push({ id, motivo: 'La solicitud ya no está pendiente' }); continue; }
      if (!ultimo || ultimo.usuarioId !== quien.user.id) { omitidos.push({ id, motivo: 'La última acción no la hizo quien llama' }); continue; }
      const ids = [...new Set((Array.isArray(a.destinatarios) ? a.destinatarios : []).map((x) => String(x || '')).filter((x) => x && x !== quien.user.id))].slice(0, MAX_DESTINATARIOS);
      if (!ids.length) { omitidos.push({ id, motivo: 'Sin destinatarios' }); continue; }
      const { data: perfiles } = await admin.from('perfiles').select('id, correo, activo').in('id', ids);
      const asunto = `Tiene una solicitud de ${tipo} pendiente por aprobar`;
      for (const p of (perfiles || [])) {
        if (!p.activo || !p.correo) { omitidos.push({ id, motivo: 'Destinatario sin correo o inactivo' }); continue; }
        if (await enviar(p.correo, p.id, asunto, `Tiene una solicitud de ${tipo} PENDIENTE por aprobar. Ingrese a SGI RRHH › Solicitudes.`, 'PENDIENTE', `${asunto} [${id}]`.slice(0, 200))) enviados += 1;
        else omitidos.push({ id, motivo: 'Error de envío' });
      }
    }
  }
  return json({ ok: true, enviados, omitidos });
});
