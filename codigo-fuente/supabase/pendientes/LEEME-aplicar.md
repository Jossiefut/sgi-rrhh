# Restablecer la contraseña con preguntas de seguridad (v1.16.0) — pasos para activarlo

El sistema ya tiene las pantallas. Mientras no se haga lo siguiente en Supabase, la opción «¿Olvidó su contraseña?» avisa que aún no está activada y el primer ingreso sigue funcionando sin las preguntas.

1. **Base de datos.** En Supabase › SQL Editor, pegue y ejecute el contenido de `20261009120000_restablecer_clave_preguntas.sql`. Crea tres tablas (preguntas con respuestas cifradas, intentos y registro) y cuatro funciones. Ninguna tabla es legible desde el navegador; solo el Administrador ve el registro.
2. **Función de servidor.** En Supabase › Edge Functions › Create function, nombre `restablecer-clave`, pegue `functions/restablecer-clave/index.ts` y **desactive «Verify JWT»** (la usa quien olvidó su clave y no tiene sesión). No hace falta cargar ninguna clave: Supabase inyecta la clave de servicio por su cuenta.
3. **Después de aplicar:** mover el archivo SQL a `supabase/migraciones/` y regenerar `esquema-actual.sql` (pídaselo a Claude: «apliqué la migración»).

Funcionamiento: la persona define 3 preguntas y respuestas (primer ingreso o botón «Preguntas de seguridad»). Si olvida su clave, indica su correo, responde y crea una nueva. Tras 5 intentos fallidos se bloquea 30 minutos; todo queda en «Usuarios y accesos › Ver restablecimientos de clave». El correo desconocido recibe preguntas simuladas, para no revelar quién tiene cuenta.

Prueba local de la migración: `bash supabase/probar-restablecer.sh` (requiere PostgreSQL).
