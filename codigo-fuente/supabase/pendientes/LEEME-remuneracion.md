# KPI y remuneración + Junta Directiva (v1.18.0) — pasos para activarlo en la nube

La aplicación ya incluye las pantallas. Mientras no se haga lo siguiente, en la versión conectada el módulo «Remuneración del personal» no podrá guardar ni leer datos de la nube (no afecta el resto del sistema).

1. **Base de datos.** Supabase › SQL Editor: pegue y ejecute `20261013120000_remuneracion_kpi_junta.sql`. Crea la tabla protegida `remuneraciones` (sin permiso de borrado), agrega el rol `junta` y actualiza las reglas de lectura/escritura.
2. **Función de servidor.** Supabase › Edge Functions › `admin-usuarios`: pegue el contenido actualizado de `functions/admin-usuarios/index.ts` (solo cambia la lista de roles, que ahora incluye `junta`) y despliegue.
3. **Usuarios de la Junta.** Desde «Usuarios y accesos» cree o edite el usuario con el rol «Junta Directiva». Las cuentas las crea usted.
4. Después: mover el SQL a `supabase/migraciones/` y regenerar `esquema-actual.sql` (diga a Claude: «apliqué la migración de remuneración»).

Quién ve qué: RRHH, Administrador, Gerencia General y Junta Directiva ven y registran todo. Gerente de Operaciones, de Marca y de Tienda ven solo lo de su personal a cargo (según el «jefe directo» indicado en cada registro, dentro de su marca o tienda). Visor y Consulta nunca. Los montos no se escriben en la bitácora.

## eNPS en el clima laboral (v1.19.0)
Aplique también `20261013130000_nps_clima.sql` (SQL Editor). Actualiza las funciones `clima_ciclo` y `clima_enviar` para que la respuesta 0–10 de la encuesta de clima se guarde en la nube. La entrevista de salida no necesita cambios en la base de datos.
