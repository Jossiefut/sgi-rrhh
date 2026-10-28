// v1.16.0 · Restablecer la contraseña con preguntas de seguridad. Pública (sin sesión): la protección es el bloqueo
// por intentos y el hash de las respuestas en la base de datos. Usa SUPABASE_SERVICE_ROLE_KEY (la inyecta Supabase).
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (cuerpo: unknown, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ error: 'Solicitud no válida.' }, 400); }
  const correo = String(b.correo || '').trim().toLowerCase();
  const respuestas = Array.isArray(b.respuestas) ? b.respuestas.map((x) => String(x || '')) : [];
  const nueva = String(b.nueva || '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo) || respuestas.length !== 3) return json({ error: 'Complete el correo y las tres respuestas.' }, 400);
  if (nueva.length < 8 || !/[A-Za-z]/.test(nueva) || !/\d/.test(nueva)) return json({ error: 'La contraseña debe tener al menos 8 caracteres, con letras y números.' }, 400);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.rpc('verificar_respuestas_seguridad', { p_correo: correo, p_resp: respuestas });
  if (error) return json({ error: 'No se pudo verificar. Intente de nuevo.' }, 500);
  if (data && data.bloqueado) return json({ error: `Demasiados intentos. Espere ${data.minutos} minutos o pida al Administrador que restablezca su contraseña.` }, 429);
  if (!data || !data.ok) return json({ error: 'Las respuestas no coinciden.' }, 400);

  const { error: e2 } = await admin.auth.admin.updateUserById(String(data.user_id), { password: nueva });
  if (e2) return json({ error: e2.message.includes('different') ? 'La nueva contraseña debe ser distinta de la anterior.' : 'No se pudo cambiar la contraseña.' }, 400);
  await admin.from('perfiles').update({ debe_cambiar_clave: false }).eq('id', String(data.user_id));
  return json({ ok: true });
});
