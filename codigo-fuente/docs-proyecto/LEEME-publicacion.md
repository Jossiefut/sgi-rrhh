# Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta)

## Contenido
- `sitio/index.html`: la aplicación completa (un solo archivo). Se conecta a la base de datos Supabase del proyecto `sgi-rrhh-marcas-propias`.
- `sitio/vercel.json`: encabezados de seguridad para Vercel.
- `codigo/`: código fuente para futuras modificaciones.
- `supabase/functions/recordatorios/`: función de envío de correos (ya publicada en Supabase).
- `supabase/functions/admin-usuarios/`: función de gestión de usuarios (ya publicada en Supabase).

## 1. Publicar en Vercel con GitHub
1. En GitHub, cree un repositorio **privado** (por ejemplo `sgi-rrhh-marcas-propias`).
2. Suba los dos archivos de la carpeta `sitio` (`index.html` y `vercel.json`) con **Add file → Upload files → Commit**.
3. En vercel.com, entre con su cuenta de GitHub y elija **Add New → Project**. Seleccione el repositorio, deje *Framework Preset* en **Other** y pulse **Deploy**.
4. Vercel le da un enlace como `sgi-rrhh-marcas-propias.vercel.app`. Si desea `sistema.futurarg.com`, agréguelo en **Settings → Domains** y pida a Sistemas el registro DNS que Vercel indique.

Cada vez que reemplace `index.html` en GitHub, Vercel publica la nueva versión sola.

## 2. Ajuste de seguridad en Supabase (una sola vez)
En supabase.com, abra el proyecto **sgi-rrhh-marcas-propias**, entre en **Authentication → Sign In / Providers → Email** y desactive **Allow new users to sign up**. Así solo el Administrador crea cuentas.

## 3. Primer acceso
1. Abra el sitio y pulse **Primer acceso del Administrador**.
2. Use **josselyn.tovar@futurarg.com** (es el único correo autorizado para esta activación) y cree su contraseña.
3. Al entrar por primera vez, el sistema crea las 28 tiendas reales, las 2 sedes de oficinas administrativas (Balú y Planeta), los cargos y la configuración.

## 4. Crear usuarios
Menú **Usuarios y accesos → Nuevo usuario**: nombre, correo, rol y, según el rol, marca o tienda. El sistema genera una contraseña temporal para entregar; al primer ingreso la persona crea la suya. Si alguien la olvida, use **Clave** para restablecerla.

| Rol | Ve |
|---|---|
| Gerente de Tienda | Solo su tienda |
| Gerente de Marca / Operaciones / Visor | Solo su marca |
| RRHH, Gerente General, Administrador | Balú y Planeta |
| Consulta RRHH Futura | Solo su marca. Ve informes, resultados y documentos; no ve rutas de aprobación, comentarios, bandejas ni la ficha personal, y no puede modificar nada |

Las fichas personales (familia, dirección, tallas) solo las ven RRHH, el Administrador y el Gerente de la tienda.

Para el personal de RRHH de Futura Retail cree el usuario con el rol **Consulta RRHH Futura** y asígnele la marca. La base de datos ya está ajustada: este rol solo lee los registros de su marca y no puede escribir.

### Cómo se organiza la aplicación
- **Menú por secciones:** Inicio (Tablero, Recordatorios, Informes, Documentos), Personal, Contratos y gestiones, Operación, Compensación y Administración.
- **Documentos:** reúne todos los documentos de todas las fases (ingreso, período de prueba y contrato, traslados y promociones, evaluaciones, apoyos y pernoctas, incentivos), con filtros por fase, tienda, fecha y trabajador. El expediente de cada trabajador muestra sus documentos ordenados por fase.
- **Informes:** resultados de cada módulo con su detalle y sus documentos, sin rutas de aprobación.
- **Perfiles gerenciales** (Gerencia General, Marca, Operaciones y Visor): el tablero muestra primero "Requiere su acción" y un resumen; cada solicitud abre con un "Resumen para decidir" y el detalle completo solo se abre si lo piden.

El correo de cada usuario es también la dirección donde recibe sus **recordatorios**.

## 4.1 Recordatorios por correo (contratos y evaluaciones)
Cada persona del flujo recibe un correo diario con sus pendientes: evaluaciones de contrato (Gerente de Tienda; si vence, también Gerencia de Marca), aprobaciones de evaluaciones (quien tenga el paso actual), cartas de culminación (RRHH activa y el Gerente de Tienda emite), período de prueba del personal administrativo (RRHH) y Nine-Box pendientes. El envío ocurre solo la primera vez que RRHH o el Administrador entra en el día. También se puede hacer en **Recordatorios → Envío por correo → Enviar ahora**.

Configuración, una sola vez:
1. Cree una cuenta gratuita en **resend.com**, verifique el dominio desde el que se enviarán los correos (por ejemplo `futurarg.com`; Sistemas debe agregar los registros DNS que indique Resend) y genere una **API Key**.
2. En supabase.com, proyecto **sgi-rrhh-marcas-propias** → **Edge Functions → Secrets**, agregue:
   - `RESEND_API_KEY` = la clave de Resend
   - `REMITENTE_CORREO` = por ejemplo `SGI RRHH <rrhh@futurarg.com>`
3. La función `recordatorios` ya está publicada en el proyecto. Cada envío queda registrado en la tabla `recordatorios_envios`.

## 4.2 Prueba IPV y portal de evaluación (Asesores, Subgerentes y Gerentes)
**Cómo funciona**
1. El Gerente de Tienda, el Gerente de Marca o RRHH registra una **Promoción** en **Solicitudes → Nueva solicitud**. El sistema crea solo el acceso del trabajador al portal.
2. En el detalle de la solicitud, el panel **Batería de pruebas** muestra el enlace, el usuario y la clave, con botones para **Copiar mensaje**, **WhatsApp** y **Correo**.
   - Usuario: la cédula, solo números.
   - Clave: el primer apellido, sin acentos (por ejemplo `TOVAR`). No distingue mayúsculas.
3. El trabajador entra por el enlace del portal (`…/#evaluacion`) o por **Ir al portal** en la pantalla de inicio. Allí ve:
   - La prueba **IPV** (87 preguntas, una por pantalla, se guarda sola).
   - Las pruebas del cargo destino (Forms).
4. Las aprobaciones de la promoción quedan bloqueadas hasta que la batería esté completa.
5. Los resultados se tabulan solos en **Evaluaciones → Prueba IPV** y en **Informes → IPV**. Cada promoción tiene su **Informe IPV**: perfil por escalas, nivel e interpretación, igual que el Nine-Box.

**Configuración (una sola vez) en Evaluaciones → Prueba IPV**
- **Cuadernillo:** cargue un Excel o CSV de 87 filas con las columnas `N.º`, `Pregunta`, `a`, `b`, `c`. Hay una plantilla para descargar. El texto de las preguntas no viene en el archivo de corrección, por eso debe cargarse desde el cuadernillo oficial. Mientras no se cargue, el portal indica que la prueba no está disponible.
- **Cargos que presentan IPV:** por defecto Asesor de Ventas, Subgerente y Gerente de Tienda.
- **Días de vigencia del acceso:** 15 por defecto. Al vencer, o al cerrar o anular la solicitud, el acceso deja de funcionar.
- **Dirección pública del portal:** la dirección de Vercel, por ejemplo `https://sistema.futurarg.com`. Se usa para armar el enlace que se envía.

**Seguridad**
- Las claves se guardan cifradas en la tabla `accesos_prueba`.
- Tras 5 intentos fallidos el acceso se bloquea 15 minutos.
- Desde el portal no se puede leer ningún otro dato del sistema.
- Estos objetos ya están creados en Supabase.

**Notas**
- RRHH puede crear promociones, pero no aprueba su propia solicitud: el paso de RRHH lo atiende el Administrador.
- La versión de prueba trae a **Josselyn Tovar (V-14952361)** como Asesora en cada tienda y una promoción de ejemplo. Ese registro no suma en los indicadores. Para probar el portal use el usuario `14952361` y la clave `Tovar`.

## 5. Cargar la data de trabajadores
1. En SharePoint, abra **Jornada de Actualización de datos Futura Retail.xlsx** → **Archivo → Guardar como → Descargar una copia**.
2. En el sistema: **Sincronización de datos → Cargar formulario** y elija el archivo. Revise la vista previa y pulse **Sincronizar fichas**. No se cargan cuentas bancarias ni datos de discapacidad.
3. Para crear los expedientes hace falta la **fecha de ingreso**: exporte desde BI un Excel o CSV con las columnas **Cédula** y **Fecha de ingreso** (opcional: Cargo, Tienda, Marca) y cárguelo en **Cargar fechas de ingreso (BI)**. También puede dar de alta a una persona a mano desde **Estado de las fichas → Dar de alta**.

## 6. Pendientes de datos
- **HC aprobado (plantilla mínima):** el sistema trae cargado el HC aprobado 2026 de Planeta (11 tiendas, 161 cupos, según el reporte de estructura). Para Balú no se ha definido mínimo: sus tiendas muestran solo la plantilla existente con "Sin HC aprobado" y no entran en la cobertura ni en las vacantes. Cuando exista el reporte aprobado de Balú, cárguelo en **Configuración › HC necesario** (mismo formato del reporte de Planeta) y el cumplimiento se calcula solo.
- **Plantilla existente:** para cargar los activos al 03/08 use **Sincronización de datos › Cargar fechas de ingreso (BI)** con las hojas de trabajadores del archivo HC (se leen Cédula, Cargo, Ubicación e Ingreso; Balú 383 y Planeta 147 filas). Planeta San Francisco Mall no aparece en el reporte de estructura y queda sin HC aprobado.
- Complete dirección, metraje y números patronales en **Información de tiendas** (la dirección aparece en la carta de culminación y en el rutagrama).
- Planeta tiene 9 tiendas creadas según el formulario; agregue las faltantes en Configuración.
- El personal de oficinas se asigna a las sedes administrativas con el cargo "Personal administrativo": período de prueba de 3 meses que solo RRHH puede prorrogar (fecha manual).

## Notas
- El plan gratuito de Supabase pausa el proyecto tras 7 días sin uso; se reactiva desde supabase.com. Para uso diario conviene el plan Pro.
- La clave pública incluida en `index.html` es pública por diseño; la seguridad la dan las reglas por rol de la base de datos.
