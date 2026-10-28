import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const ROLES = ['admin', 'marca', 'operaciones', 'general', 'junta', 'rrhh', 'analista', 'tienda', 'visor', 'consulta', 'pendiente'];
const ROLES_CON_MARCA = ['marca', 'operaciones', 'visor', 'consulta'];
const MARCAS = ['BALU', 'PLANETA'];
const json = (cuerpo: unknown, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

function validarPerfil(b: Record<string, unknown>) {
  const rol = String(b.rol || '');
  if (!ROLES.includes(rol)) return 'Rol no válido.';
  if (ROLES_CON_MARCA.includes(rol) && !MARCAS.includes(String(b.marca || ''))) return 'Indique la marca.';
  if (rol === 'tienda' && !b.tiendaId) return 'Indique la tienda.';
  return '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ error: 'Solicitud no válida.' }, 400); }
  const accion = String(b.accion || '');
  const correo = String(b.correo || '').trim().toLowerCase();
  const clave = String(b.clave || '');

  // Activación del administrador inicial (solo correos autorizados y una sola vez)
  if (accion === 'admin_inicial') {
    if (clave.length < 8) return json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, 400);
    const { data: autorizado } = await admin.from('admins_iniciales').select('correo').eq('correo', correo).maybeSingle();
    if (!autorizado) return json({ error: 'Este correo no está autorizado como administrador inicial.' }, 403);
    const { data: existente } = await admin.from('perfiles').select('id').eq('correo', correo).maybeSingle();
    if (existente) return json({ error: 'La cuenta ya fue activada. Inicie sesión o pida a otro administrador que restablezca la contraseña.' }, 409);
    const { data, error } = await admin.auth.admin.createUser({ email: correo, password: clave, email_confirm: true, user_metadata: { nombre: String(b.nombre || '') } });
    if (error) return json({ error: error.message }, 400);
    await admin.from('perfiles').update({ nombre: String(b.nombre || ''), rol: 'admin', debe_cambiar_clave: false }).eq('id', data.user.id);
    return json({ ok: true });
  }

  // El resto de acciones exige un administrador activo
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  const { data: quien } = await admin.auth.getUser(token);
  if (!quien || !quien.user) return json({ error: 'Sesión no válida.' }, 401);
  const { data: yo } = await admin.from('perfiles').select('rol, activo').eq('id', quien.user.id).maybeSingle();
  if (!yo || yo.rol !== 'admin' || !yo.activo) return json({ error: 'Solo el Administrador puede gestionar usuarios.' }, 403);

  if (accion === 'crear') {
    const err = validarPerfil(b);
    if (err) return json({ error: err }, 400);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) return json({ error: 'Correo no válido.' }, 400);
    if (clave.length < 8) return json({ error: 'La contraseña temporal debe tener al menos 8 caracteres.' }, 400);
    const { data, error } = await admin.auth.admin.createUser({ email: correo, password: clave, email_confirm: true, user_metadata: { nombre: String(b.nombre || '') } });
    if (error) return json({ error: error.message.includes('already') ? 'Ya existe un usuario con ese correo.' : error.message }, 400);
    const { error: e2 } = await admin.from('perfiles').update({ nombre: String(b.nombre || ''), rol: b.rol, marca: b.marca || null, tienda_id: b.tiendaId || null, debe_cambiar_clave: true, activo: true }).eq('id', data.user.id);
    if (e2) return json({ error: e2.message }, 400);
    return json({ ok: true, id: data.user.id });
  }
  if (accion === 'actualizar') {
    const err = validarPerfil(b);
    if (err) return json({ error: err }, 400);
    if (b.id === quien.user.id && (b.rol !== 'admin' || b.activo === false)) return json({ error: 'No puede quitarse a sí mismo el rol de Administrador.' }, 400);
    const { error } = await admin.from('perfiles').update({ nombre: String(b.nombre || ''), rol: b.rol, marca: b.marca || null, tienda_id: b.tiendaId || null, activo: b.activo !== false }).eq('id', String(b.id));
    if (error) return json({ error: error.message }, 400);
    if (b.activo === false) await admin.auth.admin.updateUserById(String(b.id), { ban_duration: '876000h' });
    else await admin.auth.admin.updateUserById(String(b.id), { ban_duration: 'none' });
    return json({ ok: true });
  }
  if (accion === 'restablecer') {
    if (clave.length < 8) return json({ error: 'La contraseña temporal debe tener al menos 8 caracteres.' }, 400);
    const { error } = await admin.auth.admin.updateUserById(String(b.id), { password: clave });
    if (error) return json({ error: error.message }, 400);
    await admin.from('perfiles').update({ debe_cambiar_clave: true }).eq('id', String(b.id));
    return json({ ok: true });
  }
  return json({ error: 'Acción no válida.' }, 400);
});
