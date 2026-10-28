# Autenticación de documentos con QR (v1.20.0) — pasos para activarla en la nube

Los PDF y Excel que genera el sistema (informes, evaluaciones, relaciones de pago, planes, certificados, etc.) salen con un código de verificación `SGI-XXXX-XXXX-XXXX` y un QR. **No llevan QR** los documentos de expedientes de personal: kit legal de ingreso, contratos y prórrogas, cartas de culminación y de pase a fijo, ruta habitual de traslado, ficha del trabajador y la documentación administrativa del día 2.

1. **Base de datos.** Supabase › SQL Editor: pegue y ejecute `20261013140000_documentos_emitidos.sql`. Crea la tabla protegida `documentos_emitidos` (sin permiso de borrado) y la función pública `verificar_documento`, que la página «Verificar un documento» usa sin iniciar sesión.
2. Sin ese paso el sistema funciona y los documentos salen con QR, pero la verificación solo reconoce los documentos emitidos desde el mismo equipo.
3. **Dirección de verificación.** El QR apunta a `https://sgi-rrhh.vercel.app/#verificar=CÓDIGO`. Si el sistema cambia de dirección, indíquelo para ajustar el parámetro `urlVerificacion` de la configuración.
4. Después: mover el SQL a `supabase/migraciones/` y regenerar `esquema-actual.sql` (diga a Claude: «apliqué la migración de documentos emitidos»).

Qué ve la página de verificación: nombre del documento, fecha y hora de emisión, quién lo emitió (nombre y cargo), marca y los primeros 8 caracteres de la huella. Nunca muestra datos de trabajadores. Quién ve el registro completo: RRHH, Administrador, Gerencia General y Junta (en Documentos › «Documentos autenticados emitidos»); RRHH y Administrador pueden anular.
