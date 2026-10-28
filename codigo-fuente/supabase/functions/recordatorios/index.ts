import { createClient } from 'npm:@supabase/supabase-js@2';

/* Envía por correo los recordatorios de contratos y evaluaciones a cada persona del flujo.
   El correo del destinatario se toma de la tabla perfiles (no del navegador).
   Requiere los secretos RESEND_API_KEY y REMITENTE_CORREO (ej.: "SGI RRHH <rrhh@sudominio.com>"). */
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (cuerpo: unknown, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });

  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  const { data: quien } = await admin.auth.getUser(token);
  if (!quien || !quien.user) return json({ error: 'Sesión no válida.' }, 401);
  const { data: yo } = await admin.from('perfiles').select('rol, activo').eq('id', quien.user.id).maybeSingle();
  if (!yo || !yo.activo || !['rrhh', 'admin'].includes(yo.rol)) return json({ error: 'Solo RRHH o el Administrador pueden enviar recordatorios.' }, 403);

  const clave = Deno.env.get('RESEND_API_KEY');
  const remitente = Deno.env.get('REMITENTE_CORREO');
  if (!clave || !remitente) return json({ error: 'Falta configurar el envío de correos (RESEND_API_KEY y REMITENTE_CORREO en Supabase).' }, 500);

  let b: { mensajes?: Array<Record<string, unknown>> };
  try { b = await req.json(); } catch { return json({ error: 'Solicitud no válida.' }, 400); }
  const mensajes = Array.isArray(b.mensajes) ? b.mensajes.slice(0, 300) : [];
  const ids = [...new Set(mensajes.map((m) => String(m.usuarioId || '')))].filter(Boolean);
  const { data: perfiles } = await admin.from('perfiles').select('id, correo, activo').in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
  const correoDe = new Map((perfiles || []).filter((p) => p.activo && p.correo).map((p) => [p.id, p.correo]));

  let enviados = 0;
  const fallidos: Array<{ usuarioId: string; motivo: string }> = [];
  const hoy = new Date().toISOString().slice(0, 10);
  for (const m of mensajes) {
    const usuarioId = String(m.usuarioId || '');
    const para = correoDe.get(usuarioId);
    if (!para) { fallidos.push({ usuarioId, motivo: 'Sin correo o usuario inactivo' }); continue; }
    const asunto = String(m.asunto || 'Recordatorios SGI RRHH').slice(0, 200);
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: remitente, to: [para], subject: asunto, text: String(m.texto || ''), html: String(m.html || '') }),
    });
    const ok = r.ok;
    if (ok) enviados += 1; else fallidos.push({ usuarioId, motivo: `Error ${r.status}` });
    await admin.from('recordatorios_envios').insert({ fecha: hoy, usuario_id: usuarioId, correo: para, asunto, estado: ok ? 'ENVIADO' : 'FALLIDO', enviado_por: quien.user.id });
  }
  return json({ ok: true, enviados, fallidos });
});
