# Plan de sucesión administrativo (v1.27.0) — seguridad en la nube

El plan ya funciona en la aplicación. Para que la restricción también se cumpla en el servidor (aunque alguien consulte la base directamente):

1. Supabase › SQL Editor › pegar y ejecutar `20261016120000_sucesion_administrativa_seguridad.sql`. No crea tablas ni toca datos existentes; solo agrega cuatro políticas de seguridad restrictivas sobre los sucesores administrativos.
2. Resultado: leen el plan Administrador, RRHH, Gerencia General y Junta Directiva; lo modifican solo Administrador y RRHH. El Analista, Marca, Operaciones, Tienda, Visor y Consulta no ven estos registros.

Mientras no se aplique, la aplicación igualmente impide el acceso por pantalla (y bloquea la escritura de otros perfiles).
Después de aplicar: mover el SQL a `supabase/migraciones/` y regenerar `esquema-actual.sql` (pídaselo a Claude: «apliqué la migración»).
