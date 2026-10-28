# Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta)

## Contenido
- `sitio/index.html`: la aplicación completa (un solo archivo). Se conecta a la base de datos Supabase del proyecto `sgi-rrhh-marcas-propias`.
- `sitio/vercel.json`: encabezados de seguridad para Vercel.
- `codigo/`: código fuente para futuras modificaciones. Para reconstruir todo use `construir-todo.sh`. El texto del cuadernillo está en `ipv-cuadernillo.js`.
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
- **Indicadores de gestión (Gerente de Marca hacia arriba):** en Inicio. Dashboards de personal con cuatro bloques: dotación y rotación (personal activo, cobertura del HC, rotación a 12 meses, egresos tempranos, ingresos y egresos por mes, motivos de egreso, tiendas con mayor rotación y menor cobertura); perfil de la plantilla (antigüedad, edad, género, cargo, nivel de instrucción); talento y pruebas (cobertura Nine-Box, distribución por caja, promociones y su éxito, pruebas IPV, Kostick y Lógico); y gestión y cumplimiento (solicitudes abiertas y lentas, ciclo promedio, contratos vencidos, avance del onboarding, amonestaciones). Respetan el alcance del rol y la marca elegida; cada tarjeta muestra su fórmula al pasar el cursor. No lo ven el Gerente de Tienda ni Consulta RRHH.
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

## 4.2 Pruebas IPV, Kostick e Indicador Lógico, y portal de evaluación
**Cómo funciona**
1. El Gerente de Tienda, el Gerente de Marca o RRHH registra una **Promoción** en **Solicitudes → Nueva solicitud**. El sistema crea solo el acceso del trabajador al portal.
2. En el detalle de la solicitud, el panel **Batería de pruebas** muestra el enlace, el usuario y la clave, con botones para **Copiar mensaje**, **WhatsApp** y **Correo**.
   - Usuario: la cédula, solo números.
   - Clave: el primer apellido, sin acentos (por ejemplo `TOVAR`). No distingue mayúsculas.
3. El trabajador entra por el enlace del portal (`…/#evaluacion`) o por **Ir al portal** en la pantalla de inicio. Allí ve:
   - La prueba **IPV** (87 preguntas, una por pantalla, se guarda sola).
   - El **Inventario Kostick** (90 pares de frases, solo para promociones a Subgerente o Gerente de Tienda; no se usa en la evaluación regular de desempeño).
   - Cada prueba abre con una **introducción**: para qué sirve, cuánto dura y que no hay respuestas buenas o malas.
   - Las pruebas del cargo destino (Forms).
4. Las aprobaciones de la promoción quedan bloqueadas hasta que la batería esté completa.
5. **Quién ve los resultados:** el Gerente de Tienda, el Gerente de Marca, Operaciones, RRHH y el Administrador (ellos también reciben el acceso del trabajador). Gerencia General y Visor pueden consultar los resultados en **Informes**, sin ver claves de acceso. Consulta RRHH no los ve.
6. Los resultados se tabulan solos en **Evaluaciones → Prueba IPV** y en **Informes → IPV**. Cada promoción tiene su **Informe IPV**: perfil por escalas, nivel e interpretación, igual que el Nine-Box.

**Tiempo e intentos (IPV y Kostick)**
- Cada intento dura **40 minutos** (configurable). El reloj lo controla el servidor.
- Hay **2 intentos** por si hay corte de luz o de conexión; las respuestas guardadas se conservan.
- Si no la termina en 2 intentos, la prueba queda **bloqueada**. RRHH o el Administrador pueden **Autorizar último intento** (una sola vez). Ese intento es **definitivo**: si no se termina, se califica como incompleta.

**Kostick y match con el cargo**
- Se corrige solo (20 escalas, nivel Marcado/Intermedio/Bajo) y se compara con el perfil deseado del cargo propuesto (Subgerente o Gerente de Tienda). El match va de 0 a 100 %: 80 o más **Alto**, 65 a 79 **Medio**, menos de 65 **Bajo**. Las escalas críticas pesan el doble.
- Los perfiles deseados incluidos son una **propuesta inicial**; ajústelos en **Evaluaciones → Prueba IPV y Kostick → Perfil Kostick por cargo**.
- Desde el panel **Batería de pruebas** se descargan el **Informe IPV**, el **Informe Kostick** y la **Constancia de match con el puesto** (PDF).

**Ponderación y constancia de match (todas las promociones)**
La constancia consolida los resultados según el cargo actual del trabajador:
| Cargo actual | Componentes |
|---|---|
| Asesor de Ventas (a Visual, Cajero o Depositario) | IPV 50 % · Evaluación básica (pruebas de desempeño y cumplimiento de normas del cargo) 50 % |
| Subgerente (a Gerente de Tienda) | IPV 20 % · Kostick 40 % · Nine-Box 30 % · Conducta 10 % |
| Gerente de Tienda | Nine-Box 50 % · Kostick 30 % · Conducta 10 % · Otra prueba 10 % (por definir) |
- Cada componente se expresa de 0 a 100. IPV y Kostick: coincidencia de cada escala con el perfil esperado del cargo destino. Nine-Box: promedio de desempeño y potencial sobre 5. Conducta: 100 sin amonestaciones; cada una descuenta lo mismo y con el máximo permitido + 1 llega a 0. Evaluación básica: resultado ponderado de las pruebas de Forms del cargo.
- "Otra prueba" aún no está definida: no entra al cálculo y el resto se reescala a 100 %. Cuando se defina, se agrega como componente.
- La constancia es **preliminar** mientras falte algún componente y **definitiva** cuando todos tienen resultado; solo entonces la evaluación puede proseguir. Rangos: 80 % o más alto, 65 % a 79 % medio, menos de 65 % bajo.
- Los porcentajes y los perfiles esperados (IPV y Kostick por cargo) se editan en **Evaluaciones → Prueba IPV y Kostick** (Ponderación del match, Perfil esperado del Kostick, Perfil esperado del IPV). Los perfiles incluidos son una propuesta inicial.
- Asesor de Ventas a Subgerente no tiene ponderación definida: se promedian por igual las pruebas aplicadas (solo el Kostick).

**Formación académica**
- Al dar de alta desde la ficha del formulario se guardan el último título y la educación complementaria, y se deduce el nivel de instrucción.
- En el ingreso manual el nivel de instrucción es obligatorio, y el título y la educación complementaria son opcionales.
- Se ve en el expediente (Datos personales → Formación académica), se puede corregir con motivo, y aparece en el informe y la constancia de match.

**Indicador Lógico I (promoción e ingreso)**
- 50 preguntas en 15 minutos, con las mismas reglas de intentos (2 intentos y un último autorizado por RRHH). Se aplica cuando el cargo destino es **Gerente de Tienda, Cajero Principal o Cajero** (configurable). Algunas preguntas llevan figura y otras piden escribir un número; la pregunta 13 se responde con letra (A a E). Se pueden dejar preguntas sin responder y enviar.
- Se corrige solo con la clave entregada: cada respuesta correcta suma un punto. El resultado se compara con el **mínimo de respuestas correctas del cargo**, que RRHH define en Configuración (la hoja «Criterios» llegó vacía): mientras no esté definido se muestra «Sin mínimo definido».
- **En promociones** forma parte de la batería (la solicitud no se aprueba hasta que esté completa) y aparece en la constancia de match como requisito informativo; no entra en el porcentaje.
- **En ingresos:** en Evaluaciones → Prueba IPV, Kostick y Lógico → **Candidato a ingreso**, el Gerente de Tienda, el Gerente de Marca o RRHH registra cédula, nombres, apellidos, tienda y cargo. Se genera el acceso (usuario: cédula; clave: primer apellido) y el mensaje para copiar. Cuando la persona ingrese, su informe se une a su expediente por la cédula.
- Los resultados los ven el Gerente de Tienda y los niveles superiores.
- La clave marca para verificar contra el cuadernillo impreso las preguntas 3, 8, 12, 20, 28 y 50 (se listan en Configuración); las figuras se recortaron de un escaneo, revise su nitidez.

**Conclusión y pasos a seguir en todos los informes**
Cada informe (IPV, Kostick, Indicador Lógico) y la constancia de match terminan con una conclusión: favorable (continuar con el proceso), intermedia (continuar con plan de desarrollo y seguimiento) o no favorable (no alcanza la puntuación requerida: **60 días** para volver a presentar la prueba y mostrar mejoras en su actuación y desempeño, con retroalimentación, plan de mejora y seguimiento). Los días son configurables en Configuración («Días para volver a presentar»).

**Configuración (una sola vez) en Evaluaciones → Prueba IPV, Kostick y Lógico**
- **Cuadernillo:** ya viene cargado con las 87 preguntas del cuadernillo IPV (en las preguntas 14 y 78 solo existen las opciones a y b). Si necesita reemplazarlo, cargue un Excel o CSV de 87 filas con las columnas `N.º`, `Pregunta`, `a`, `b`, `c` (hay una plantilla para descargar).
- **Minutos por prueba, cargos que presentan Kostick e Indicador Lógico, mínimo de correctas por cargo y días para volver a presentar:** en la misma pantalla.
- **Cargos destino que aplican el IPV:** por defecto Visual, Cajero, Depositario y Gerente de Tienda (es decir, Asesor de Ventas que será promovido a esos cargos y Subgerente que será promovido a Gerente). El Kostick aplica cuando el cargo destino es Subgerente o Gerente de Tienda, sin importar la antigüedad del trabajador.
- **Días de vigencia del acceso:** 15 por defecto. Al vencer, o al cerrar o anular la solicitud, el acceso deja de funcionar.
- **Dirección pública del portal:** la dirección de Vercel, por ejemplo `https://sistema.futurarg.com`. Se usa para armar el enlace que se envía.

**Seguridad**
- Las claves se guardan cifradas en la tabla `accesos_prueba`.
- Tras 5 intentos fallidos el acceso se bloquea 15 minutos.
- Desde el portal no se puede leer ningún otro dato del sistema.
- Los objetos de IPV ya están creados en Supabase. Para que el control de 40 minutos, intentos y autorización de RRHH funcione también en el servidor, ejecute una vez `supabase/migracion-kostick-intentos.sql` (incluye el Indicador Lógico y los accesos de candidatos a ingreso) en el editor SQL de Supabase (aún no aplicada).

**Notas**
- RRHH puede crear promociones, pero no aprueba su propia solicitud: el paso de RRHH lo atiende el Administrador.
- La versión de prueba trae a **Josselyn Tovar (V-14952361)** como Asesora en cada tienda y una promoción de ejemplo. Ese registro no suma en los indicadores. Para probar el portal use el usuario `14952361` y la clave `Tovar`.

## 4.3 Valores de pernocta y apoyo de personal
- **Pernocta:** USD 20 por persona y por noche. La relación para nómina muestra el valor y el total (personas × 20), y los indicadores de pernoctas y el tablero de indicadores de gestión suman el monto aprobado.
- **Apoyo de personal:** USD 50 al mes para todos los cargos. Una **quincena** son 10 días trabajados más 4 de descanso, así que el apoyo paga **USD 25 por quincena** (USD 2,50 por día trabajado, hasta 10 días). Un apoyo de menos días se paga proporcional. Si un caso necesita otro monto, se registra como «monto distinto» con su justificación y pasa también por Gerencia General.
- Los valores se cambian en **Configuración → HC y apoyos** («Valores de pernocta y apoyo de personal»).

### 4.4 Ruta habitual de traslado (LOPCYMAT, art. 69 num. 3)
- PDF **idéntico al formato original** de FUTURA RETAIL, C.A. (una hoja carta, Calibri 12 pt, mismos textos, bordes y espacios para completar). Solo se prellenan fecha, dirección, teléfono, nombre y cédula; el resto lo completa y firma el trabajador.
- **Alta:** se genera con el kit de ingreso y se muestra de inmediato («Ruta habitual de traslado (PDF)»); no queda sujeto al bloqueo por permanencia.
- **Traslado de tienda o promoción con traslado:** disponible desde la solicitud (detalle, panel de la tienda destino y Centro de documentos). Consulta no la ve hasta que se ejecuta.

### 4.5 Onboarding: entrenamientos delegados
- En cada actividad del plan se puede marcar la casilla **«Delegado (no lo realizó el Gerente o Subgerente)»** e indicar el **nombre de quien dio ese entrenamiento**. Además, el evaluador/supervisor que firma el plan puede ser otra persona si se tilda «Otra persona evalúa este plan (delegado)» e indica su nombre. En ambos casos el nombre solo se habilita al tildar la casilla. Queda en bitácora y el PDF del plan muestra la columna «Responsable del entrenamiento» con ✓ Delegado y el nombre.

### 4.6 Interfaz ligera (todos los perfiles excepto Gerente de Tienda)
- **Tablero:** 4 cifras clave arriba y, debajo, una fila por tema con su cifra principal (requiere su acción, plantilla frente a HC, vencimientos de contrato, ingresos del mes, pernoctas, resultados de evaluaciones). Cada fila se abre con un clic para ver tablas, organigrama, mapa de calor o el listado de personas.
- **RRHH y Administrador:** las otras 4 cifras quedan en «Ver más indicadores (4)»; los avisos (onboarding, vencimientos, cartas, rutas de traslado, etc.) se muestran como filas con su conteo.
- **Indicadores de gestión:** «Dotación y rotación» abierta; Perfil, Talento y Gestión quedan resumidas en una fila con sus cifras principales. Los gráficos se abren a pedido.
- **Ingresos y egresos:** los gráficos se muestran resumidos; la tabla por tienda queda visible.
- El menú lateral no cambia. El Gerente de Tienda conserva su vista completa.

### 4.7 Indicador Lógico: figuras con calidad de prueba
- Las figuras de las preguntas 8, 12, 14, 21, 27, 32 y 41 se redibujaron en vectorial (SVG): trazo nítido a cualquier tamaño, sin manchas ni zonas desvaídas del escaneo. Se transcribieron del PDF original en alta resolución y se verificaron contra la clave (P8 = 3 pares idénticos, P12 = 1, P14 = 4, P21 = 5, P27 = 2, P32 = 3, P41 = 1).
- En el portal, la figura ocupa el ancho de la pregunta; en el teléfono mantiene un tamaño legible y se desliza hacia los lados.
- Pendiente de confirmar con el cuadernillo impreso: en la P12 el escaneo no permite distinguir la fila 5; se dibujó con una diferencia en el último símbolo para que solo la fila 2 sea idéntica, como indica la clave.
- Fuente editable de las figuras: codigo/figuras-logico/generar.py.

### 4.8 Logos de Balú y Planeta (se retira el nombre «Futura Retail» de la interfaz)
- Cada usuario ve el logo de su marca: Balú o Planeta Sports (barra lateral, cabecera y pantalla de inicio de sesión muestra ambos).
- Administrador, RRHH, Gerencia General y demás perfiles que ven las dos marcas tienen en la cabecera un selector con los logos: Balú, Planeta o «Ambas». La elección cambia el logo de la barra lateral y el alcance de los tableros e informes (misma marca en todas las pantallas).
- Los PDF de uso interno llevan el logo de la marca en el encabezado. Los textos legales (razón social, RIF, contratos y kit legal) no se modificaron.
- Archivos de imagen: codigo/logos.js (PNG recortado e incrustado, sin conexión).

### 4.9 Período de prueba con limitaciones, razón social por empresa y logo en documentos
- **Período de prueba:** si el puntaje no alcanza el mínimo y el Gerente de Tienda indica que el trabajador sí superó el período, el sistema exige la autorización de las tres instancias: Gerente de Marca, Gerente de Operaciones y RRHH (3 de 3). Si las tres aprueban, el resultado queda registrado como «Superado el período con limitaciones» (expediente, certificado, historial e informes). Si no se aprueba, no se cierra la evaluación.
- **Razón social:** Configuración › Empresas (solo Administrador). Balú y Planeta tienen cada una una sola razón social, RIF y domicilio fiscal. Al modificarlas cambian en todos los documentos nuevos o reabiertos: contratos del kit legal, cartas de bienvenida y culminación, ruta habitual, constancias, informes y encabezados. Quedó cargada la de Balú (REPRESENTACIONES ULAB 24, C.A., J-50505660-3); la de Planeta está pendiente y, hasta completarla, sus documentos muestran un aviso.
- **Logo en documentos:** todos los PDF llevan el logo de la marca del trabajador o de la tienda (kit legal, cartas, ruta habitual, constancias e informes).
- El texto de inscripción en el Registro Mercantil (fecha, número, tomo) se mantiene en las plantillas del kit legal; para Planeta debe ajustarse en Configuración › Plantillas.

### 4.10 RRHH Futura Retail (perfil Consulta): solo visualiza
- Los documentos se ven en pantalla, sin botones para imprimir ni descargar PDF; tampoco se pueden copiar ni imprimir desde el navegador.
- Se quitaron para este perfil las exportaciones CSV (directorio, ingresos y egresos, información de tiendas).
- Único permitido: en Informes, el botón «Imprimir informe» genera el PDF del resumen en tabla del módulo (solo estatus, sin botones ni documentos) con el logo y la razón social de la marca.
- En Informes también ve el **estatus de las solicitudes** (fecha, tipo, trabajador, tienda y estatus; sin ruta de aprobación ni comentarios) y, en «Egresos críticos», **solo los nombres** de quienes respondieron la entrevista de salida (sin cédula, puntos ni causas).
- Los demás perfiles (Administrador, RRHH, Gerencias) conservan impresión y descarga, y también pueden imprimir los informes en tabla.

### 4.11 Entrevistas de salida y egresos críticos
- **Fuente:** Excel «Entrevista de Salida» (Microsoft Forms, SharePoint). Se descarga una copia y se carga en **Sincronización de datos › Entrevistas de salida** (la app no lee SharePoint en vivo). Volver a cargar el mismo archivo no duplica: se actualiza por el Id de Forms.
- **Egreso crítico:** entrevista cuyo «Total de puntos» es **mayor a 4** (cada respuesta desfavorable suma un punto). El umbral se cambia en Configuración (`Egreso crítico: puntos mayores a`).
- **Clasificación por tienda:** primero por la cédula (si el trabajador está en el sistema se toma su tienda); si no, por el lugar indicado en la entrevista. Si no se reconoce queda «Sin clasificar» y RRHH le asigna la tienda en Informes.
- **Dónde se ve:** Informes › «Egresos críticos (entrevistas de salida)» (indicadores, egresos por tienda, causas más repetidas —motivo, factores que sumaron puntos, aspecto negativo, tema a mejorar— y tabla de críticos, imprimible) y una fila «Egresos críticos» en el Tablero gerencial.
- **Privacidad:** nombre y cédula solo los ve RRHH/Administrador; las gerencias ven tienda, cargo y causas. Tienda y Consulta no ven este módulo. Los datos reales se cargan solo en la versión con Supabase (colección `entrevistasSalida` en la tabla `registros`, sin cambios de esquema).

### 4.12 Nombre de tienda con la marca
- Todas las tiendas se muestran con la marca al inicio: «Balú Propatria», «Planeta Sambil Valencia», «Balú Oficinas administrativas». Aplica a tableros, informes, documentos y selectores, también a los datos ya guardados (se normaliza al mostrar). Si se crea o renombra una tienda, el prefijo se agrega solo.
- En Supabase los nombres guardados no se modificaron; para dejarlos así en la base se requiere una actualización (pendiente de su autorización).

### 4.13 Menú por subsistema de RRHH
Inicio · Reclutamiento e ingreso (Nuevo ingreso, Onboarding) · Administración de personal (Directorio, Ingresos y egresos, Solicitudes) · Contratación y relaciones laborales (Prueba y contratos) · Desempeño y desarrollo (Evaluaciones) · Información de tiendas · Operación de tiendas (Apoyos de personal, Pernoctas) · Compensación y beneficios (Incentivos de ventas, Modelos de compensación) · Administración del sistema (Sincronización, Usuarios, Configuración). Cada perfil ve solo las opciones que le corresponden.

### 4.14 Indicador Lógico I: tiempo y mínimos
- Duración: 25 minutos (antes 15). Mínimo de correctas: Cajero y Cajero Titular 8 de 50; Gerente de Tienda 12 de 50.
- Migración SQL de Supabase (`supabase/migracion-kostick-intentos.sql`): **aplicada** el 06/10/2026 (columnas ev, tipo, apellidos; funciones del portal con control de tiempo e intentos; se retiraron `portal_guardar` y la versión antigua de `crear_acceso_prueba`).

### 4.15 Formación y Plan de sucesión (estructura inicial)
- Menú: grupo **Formación** (módulo Formación, pestañas Tienda y Administrativa) y grupo **Desarrollo** (Plan de sucesión y carrera, pestañas Tienda y Administrativa). Visibles para todos los roles salvo Tienda y Consulta.
- Plan de sucesión (Tienda) ya muestra la escala de cargos con sus activos; el modelado de sucesores y rutas de carrera, y el contenido de Formación, se definen con RRHH.
- Entrevistas de salida: se leen de «Entrevista de Salida.xlsx» (OneDrive de RRHH); 'Puerto Cabello' reconoce la tienda P11.

### 4.16 Ficha del trabajador, exportación a Excel, ficha de tienda y ortografía
- **Ficha del trabajador (RRHH, Administrador y Tienda):** en el expediente, pestaña «Ficha del formulario», se muestran todos los datos precargados (personales, contacto, dirección, emergencia, cónyuge, padres, hijos, tallas, educación y datos laborales declarados) y el botón **Generar ficha en PDF**.
- **Exportar datos precargados (Excel):** solo el rol RRHH. En Sincronización de datos › Estado de las fichas. Una fila por persona con todos los campos sincronizados (incluye hijos 1 a 4, emergencia y vinculación con el expediente). No incluye datos bancarios ni de discapacidad.
- **Ficha de la tienda en PDF:** en Información de tiendas, botón «Ficha en PDF» para Gerente de Marca, Operaciones, Gerencia General, RRHH y Administrador (trámites administrativos).
- **Plan de sucesión administrativo:** solo lo ven RRHH y Gerencia General; el plan de tienda lo ven los demás perfiles con acceso al módulo.
- **Ortografía en las importaciones:** al cargar el formulario o las entrevistas de salida se corrigen espacios, signos, mayúsculas y tildes de palabras conocidas (cargos, educación, estados, tiendas). Nombres y apellidos no se tildan: se respeta el documento de identidad. No es un corrector ortográfico general.

### 4.17 Informe global e Informes en Excel (archivo plano)
- **Informes › Informe global** (primera pestaña): resumen ejecutivo de todos los subsistemas (plantilla y HC, ingresos y egresos con rotación, solicitudes abiertas, evaluaciones Nine-Box, onboarding, pruebas del portal, egresos críticos y amonestaciones), por marca y por tienda, con filtro de período y de marca.
- **Informes en Excel** (menú Inicio; solo RRHH, Gerencia General y Administrador): archivos .xlsx planos, una fila por registro y sin formato, listos para tablas dinámicas. Se descarga cada informe por separado o el **libro completo** con una hoja por informe: Resumen por tienda, Plantilla, Solicitudes, Apoyos, Pernoctas, Evaluaciones Nine-Box, Contratos y período de prueba, Onboarding, Pruebas del portal, Amonestaciones, Entrevistas de salida e Incentivos.
- Nombres y cédulas solo aparecen para el rol RRHH; Gerencia General y Administrador reciben únicamente códigos de trabajador.

### 4.18 Campos de la ficha y datos sensibles
- La importación del formulario lee todos los campos indicados por RRHH: identidad, nacionalidad (y detalle), RIF, nacimiento, vivienda, estado civil, cónyuge, padres, hijos (hasta 4, con «tiene hijos» y cantidad), contacto, dirección, entorno, unidad de negocio, cargo, estado donde labora, educación, emergencia 1 y 2 y tallas. No se importan cuentas bancarias.
- **Discapacidad y CONAPDIS:** se importan, pero solo el rol RRHH los ve (ficha, PDF y Excel). En Supabase se guardan en la tabla aparte `fichas_sensibles`, con acceso exclusivo de RRHH por RLS (migración aplicada el 06/10/2026); el Administrador y las tiendas no los reciben. Si otro rol carga el formulario, esos campos se descartan.

### 4.19 Cumplimiento legal (5 %) y archivos planos para BI
- **Cumplimiento legal:** el informe global (y el tablero de Gerencia General) muestra, por separado, personal con discapacidad (con cuántos están inscritos en el CONAPDIS) y aprendices INCES frente al 5 % de la plantilla activa (redondeo hacia arriba), por tienda, por marca y consolidado, con la brecha en personas. Lo ven RRHH, Gerencia General y Administrador.
- **Aprendices INCES:** RRHH los marca en el botón «Aprendices INCES» (campo `aprendizInces` del trabajador; queda en bitácora).
- **Discapacidad:** el dato individual sigue solo para RRHH; la sesión de RRHH publica únicamente el conteo por tienda en el ajuste `cumplimientoDiscapacidad` (tabla `ajustes`, sin identidades) para que Gerencia General y Administrador vean el indicador. No requiere migración.
- **Archivos planos (Informes en Excel):** nueva hoja «Cumplimiento legal 5 %» y nueva hoja «Histórico de actividad por trabajador» (una fila por trabajador con evaluaciones realizadas/aprobadas, plan de sucesión, amonestaciones, pernoctas aprobadas, incentivos, nacimiento, edad, nivel educativo, tallas, género y mes/año del reporte). Las hojas con ingreso y egreso traen mes (en letras) y año en columnas separadas. «Considerado en plan de sucesión» queda en «No» hasta que se defina el módulo.

### 4.20 Nueva solicitud con todos los tipos y alerta de aplicabilidad
- «Nueva solicitud» ofrece siempre los 9 tipos: traslado, promoción, desincorporación, evaluación de período de prueba, prosecución, pase a fijo, Nine-Box, apoyo de personal y pernocta.
- Al elegir trabajador y tipo, el sistema verifica si aplica según cargo, antigüedad, estatus, hito del contrato y rol. Si no aplica se abre una ventana de alerta con los motivos exactos (por ejemplo, días de antigüedad que faltan) y no se puede crear; el tipo no aplicable no queda seleccionado.
- Si aplica, los tipos con formulario propio (evaluaciones, Nine-Box, apoyo, pernocta) muestran «Continuar a…» y abren su formulario con el trabajador; traslado, promoción y desincorporación se crean en la misma pantalla.

### 4.21 Repositorios de datos, reingresos y talleres
- **Repositorios de datos madre** (Sincronización de datos › Repositorios de datos): dos registros. El 1 es «Jornada de Actualización de datos Futura Retail» (en uso); el 2 queda pendiente hasta que se tenga su enlace. «Leer del repositorio ahora» lee el archivo de SharePoint con el conector de Microsoft 365 (solo al abrir el sistema desde Claude); en cualquier otro caso se usa «Cargar formulario» con el archivo descargado.
- **Más de un registro por cédula:** al sincronizar se avisa cuántas personas tienen más de un registro y se pregunta, una por una o en bloque, si se actualiza con el más reciente (el segundo). Los datos quedan en `numRegistros` y `respuestasPrevias` de la ficha.
- **Nuevo ingreso:** la búsqueda por cédula ahora lee las fichas del repositorio (antes solo el listado precargado). Si hay dos registros pregunta si desea actualizar; la ficha completa se muestra en el formulario y queda unida al expediente al guardar.
- **Segunda vez con la empresa:** si hay un expediente anterior egresado (o dos registros en el repositorio) se indica «segunda vez», se cuentan los días desde el egreso anterior y, si son menos de 90, el ingreso no puede ser efectivo antes del día 91 (la fecha se propone sola y se valida). Si no consta la fecha de egreso se pide.
- **Procedencia del grupo:** casilla «Viene de otra empresa del grupo» con la lista editable en Configuración › Empresas; queda en el expediente como dato no editable (`procedenciaGrupo`).
- **Ficha del trabajador:** visible y descargable en PDF para RRHH, Administrador, Gerencia General, tienda y consulta (discapacidad y CONAPDIS solo para RRHH).
- **Formación (talleres):** colección `talleres`. La tienda marca la asistencia; RRHH indica las horas y la calificación (0 a 20, mínima 10); con asistencia y horas se genera el «Certificado de asistencia a taller» en PDF. Los talleres de varias tiendas (sin tienda) solo los ve RRHH, Gerencia General y el Administrador.

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

### 4.22 Lectura en vivo del repositorio y carga automática a la nube

- **Nuevo ingreso** consulta el repositorio «Jornada de Actualización de datos» en vivo (conector de Microsoft 365, al abrir el sistema desde Claude): al buscar la cédula llena el formulario, muestra la ficha completa y el botón **Ver y descargar ficha en PDF**; al guardar el ingreso, la ficha queda en el sistema y en la nube.
- **Carga automática:** cuando RRHH o el Administrador abren el sistema desde Claude, se leen el repositorio de fichas y «Entrevista de Salida.xlsx»; lo nuevo o modificado se guarda solo en Supabase. Con varios registros por cédula la decisión sigue siendo de RRHH (Sincronización de datos).
- **Encuesta de salida:** Sincronización de datos → Entrevistas de salida → «Leer resultados de la encuesta de salida ahora»; los resultados se ven en Informes → Egresos críticos.

### 4.23 Formación (catálogo y participaciones), tamaño de tienda, procedencia del grupo y carga de amonestaciones

- **Formación → Participaciones / Catálogo / Talleres.** RRHH administra el catálogo (tipo, modalidad, horas, facilitador, cargos, obligatoria, vigencia en meses). RRHH y el Gerente de Tienda (solo su tienda) registran participaciones; Marca y Operaciones consultan su marca. Vencida = pasó la fecha programada sin realizarse o caducó la vigencia. Los registros cerrados no se editan: se corrigen con una anotación (motivo, usuario y fecha). Los temas de onboarding completados cuentan como formación de inducción.
- **Información de tiendas → Tamaño (grande / pequeña),** editable por RRHH y Administrador; define si el cargo de caja se denomina Cajero Principal o Cajero.
- **Nuevo ingreso:** la ficha del trabajador y el botón «Ver y descargar ficha en PDF» siempre se ven; con la cédula en el repositorio se llenan con sus datos. Si viene de otra empresa del grupo se muestran, sin poder modificarse, la empresa, la fecha de ingreso, la de egreso y la duración total (tomadas del expediente anterior).
- **Contratación y relaciones laborales → Carga de amonestaciones** (ítem propio de la barra lateral): se carga la imagen (PNG/JPG) o el PDF de cada amonestación, hasta 1,5 MB; queda en el expediente y se puede descargar.

### 4.24 Plan de sucesión, trayectoria del trabajador, informes de desarrollo y ficha manual (Balú)

**Plan de sucesión (menú Desarrollo; no lo ven Gerente de Tienda ni Consulta).** Mapa por tienda con cinco posiciones clave (Gerente, Subgerente, Caja, Jefe de Almacén, Visual Merchandiser), riesgo del titular, posición crítica y hasta 3 sucesores por posición con su puntaje 0-100 y nivel (Listo ahora ≥ 80, 6 a 12 meses ≥ 65, 12 a 24 meses ≥ 50). Pestañas: Mapa, Banco de talento, Evolución mensual (foto automática cada mes), Planes de desarrollo (PDI, con acciones de formación que crean participaciones «Programadas»), Tamaño de tiendas y Rutas y parámetros. Nominación formal: propone el Gerente de Marca, aprueba RRHH; si el candidato es de otra marca requiere Gerencia General. Al ejecutarse la promoción la nominación pasa a «Promovido». Indicadores con la fórmula al pasar el cursor.

**Parámetros propuestos (todos editables en Configuración o en «Rutas y parámetros»):** pesos Desempeño 35, Pruebas 25, Formación 20, Conducta 10, Antigüedad 10; condiciones obligatorias: contrato fijo, sin plan de mejora, sin amonestación en 6 meses; riesgo medio con menos de 6 meses en el cargo; cajas Nine-Box de riesgo 1 y 4; tamaño de tienda grande desde 14 personas (propuesta por plantilla, no se guarda hasta pulsar «Guardar tamaños»). Rutas iniciales RT01 a RT09 editables. La descripción de cargo figura como «Pendiente» y no pesa.

**Trayectoria del trabajador.** Pestaña «Trayectoria» en el expediente y vista «Trayectoria del trabajador» en Evaluaciones (buscador por nombre o cédula; filtros de tienda, cargo y período). Línea de tiempo ordenada por la fecha real del evento (ingreso, contrato, evaluaciones, retroalimentación, pruebas, onboarding, formación, movimientos, amonestaciones, nominaciones). Botón «Generar informe de trayectoria (PDF)»: guarda un documento versionado en el expediente (fase Evaluación) con fecha de evento y fecha de registro. Consulta ve solo el estatus de cada evento, sin calificaciones, amonestaciones, nominaciones ni PDF. Los registros cerrados no se editan; las correcciones se anotan.

**Informes.** Informe global: bloque «Sucesión y formación». Excel: hojas «Plan de sucesión», «Formación» y «Trayectoria» (fecha del evento y de registro separadas; mes en letras y año aparte); «Considerado en plan de sucesión» = Sí solo con nominación aprobada o promovida. Nombres y cédulas solo para RRHH.

**Nuevo ingreso fuera del repositorio.** Si la cédula no aparece, el Gerente de Tienda completa a mano los mismos campos de la ficha del repositorio (datos personales, dirección completa, familia, emergencia, tallas, educación); quedan guardados como ficha («Completada a mano por la tienda»). La discapacidad la registra solo RRHH.

**Caso de prueba:** Josselyn Tovar (dos formaciones, una evaluación, una nominación); no suma en indicadores.

**Migración de Supabase (APLICADA el 07/10/2026, fusionada con las reglas de clima y de evaluaciones de oficinas):** `supabase/migracion-desarrollo-sucesion.sql` ajusta `app.puede_ver` y `app.puede_escribir` para las colecciones nuevas. Pendiente de decisión: mover rutas y parámetros a una colección propia para que la tienda no los lea por base de datos.

**Pendientes:** descripciones de cargo (componente «Pendiente»), plan administrativo, Planeta, lista de empresas del grupo y repositorio único del grupo.

### 4.25 Pruebas nuevas, batería por cargo, Nine-Box ampliada y calibración

**Integridad laboral (PIL, 46 afirmaciones, 15 min).** Es requisito, no suma puntos. Solo RRHH y el Administrador ven las respuestas y registran la entrevista de integridad; el resto ve únicamente el estatus. Vigencia configurable (24 meses). En el plan de sucesión, los candidatos a Caja, Almacén y Jefe de Almacén muestran si cumplen la integridad.

**IPC (54 afirmaciones, 20 min).** Pondera el match según el cargo destino (ver tabla) y aporta al contraste de potencial en la calibración.

**DISC (28 grupos, 20 min).** Prueba opcional de desarrollo: no forma parte de la batería ni pesa en el match. Su ponderación queda pendiente.

**Batería por cargo destino (máximo 3 pruebas de ajuste, más el DISC opcional).** Configuración › Batería por cargo.

| Cargo | Batería | Ponderación del match |
|---|---|---|
| ASE | IPV, IPC | IPV 25, IPC 25, Básica 50 |
| VM | IPV, IPC | IPV 25, IPC 25, Básica 50 |
| CAJ / CAJT | Lógico, PIL, IPC | IPC 50, Básica 50 |
| ALM | PIL, IPC | IPC 50, Básica 50 |
| JALM | PIL, IPC, Lógico | IPC 50, Básica 50 |
| SUB / GT | Kostick, IPC, Lógico | IPC 20, Kostick 40, Nine-Box 30, Conducta 10 |

PIL y Lógico son requisitos sin peso. ASE, JALM y SUB fueron confirmados por RRHH como valores iniciales y siguen editables.

**Validación del Indicador Lógico.** Panel solo para RRHH en Evaluaciones › Prueba IPV: mínimos de aciertos por cargo (CAJ/CAJT 8, GT 12, SUB 10, JALM 10), con opción de excluir las preguntas «por verificar». Las validaciones no cuentan como evaluación.

**Nine-Box ampliada y calibración.** Aplica a GT, SUB, CAJT, CAJ, JALM, VM y personal administrativo (editable en Configuración). Pestaña «Calibración Nine-Box» (ciclos abril y octubre): Marca y Operaciones calibran en tienda; el supervisor inmediato y RRHH, en oficinas. La caja se cierra solo cuando ambos confirman; el movimiento exige justificación y genera acta en el expediente. Distribución de referencia: máximo 15 % en caja 9 y 25 % en cajas 6+8+9 (solo advertencia). Rutas: Cajero, JALM y VM terminan en validación de RRHH; GT, SUB y administrativos terminan con firma de Gerencia General.
Personal administrativo: 5 preguntas de desempeño (objetivos del área, calidad y exactitud, dominio técnico, autonomía, cultura) y los 4 ítems de potencial. Su Nine-Box solo la ven RRHH, Gerencia General, Administrador y el supervisor inmediato (se asigna en el expediente).

**Migración de Supabase (APLICADA el 07/10/2026 y verificada):** `supabase/migracion-pruebas-nuevas-y-ninebox.sql`. Habilita PIL, IPC y DISC en el portal, los accesos DIRECTO y VALIDACION, la tabla privada de respuestas del PIL y la visibilidad de las evaluaciones de oficina. Requiere `migracion-kostick-intentos.sql` ya aplicada. Limitación: en base de datos Marca y Operaciones ven las evaluaciones de oficina de su marca; el filtro por supervisor lo aplica la pantalla. El portal en la nube atiende las seis pruebas (IPV, Kostick, Lógico, PIL, IPC y DISC).

**Pendientes:** descripciones de cargo; plan administrativo y Planeta; baremos locales; ponderación del DISC; mínimos definitivos del Indicador Lógico; probar de punta a punta el portal con PIL, IPC y DISC.

**Talleres: carga de asistentes sin escribir.** En Formación › Talleres, los asistentes se marcan con casillas (con búsqueda y «Seleccionar todos los que aparecen») o se importan desde un Excel/CSV con una columna de cédulas. El sistema avisa cuántos agregó, cuántos ya estaban y qué cédulas no corresponden al personal elegible del taller.

**Taller o Formación según la duración.** Una actividad con menos de 8 horas es un Taller; con 8 horas o más, es una Formación. El mínimo (8) se cambia en Configuración (clave «Horas desde las cuales una actividad es Formación»). El sistema clasifica solo y avisa sin bloquear: el Catálogo y las Participaciones muestran la clasificación, el formulario del catálogo la anticipa al escribir las horas, y un taller de 8 horas o más muestra el aviso «Corresponde a Formación». En la trayectoria, cada evento aparece como Taller o Formación; los informes separan «Talleres realizados» de «Formaciones completadas» y el Excel agrega la columna «Clasificación» y la hoja «Talleres». Además de Taller y Formación, se pueden registrar actividades como **Programa** o **Capacitación**: se eligen al crear la actividad en el Catálogo (campo «Modalidad de registro») o el evento en Talleres, sin depender de las horas. Los informes muestran un indicador por modalidad. En el plan de sucesión suman todas las modalidades.

### 4.26 Clima laboral y buzón de sugerencias

Módulo «Clima laboral» (menú Desarrollo), visible solo para RRHH y Administrador. Pestañas: Resumen, Encuestas, Resultados y Buzón de sugerencias.

**Ciclos de encuesta.** Se pueden registrar varios ciclos (uno por semestre o los que se necesiten). Cada ciclo nace en borrador, RRHH lo activa y desde ese momento se genera el enlace (`…#clima=ID`) con botones para copiar el enlace, copiar el mensaje y compartir por WhatsApp (con o sin número). El enlace deja de recibir respuestas al cerrar el ciclo o al pasar la fecha de cierre. Se puede dirigir a Balú, Planeta o ambas marcas.

**Preguntas.** Propuesta base de 22 preguntas en 8 dimensiones (liderazgo, comunicación, reconocimiento y remuneración, desarrollo, condiciones y seguridad, equipo y convivencia, compromiso, carga de trabajo), escala de 1 a 5. RRHH puede editar, quitar o agregar preguntas al crear el ciclo; con respuestas registradas ya no se modifican.

**Respondientes.** Entran con su cédula (solo personal activo). Una respuesta por persona y ciclo. Los resultados se agrupan por marca, tienda y cargo; los grupos con menos de 5 respuestas muestran «Reservado» y los comentarios se leen sin nombre y solo cuando hay al menos 5.

**Resultados.** % favorable (respuestas 4 y 5) global y por dimensión, promedio, participación por tienda, fortalezas y oportunidades, distribución por pregunta, mapa de calor tienda × dimensión, variación contra el ciclo anterior y evolución entre ciclos. Informe en PDF y Excel. Niveles: fortaleza desde 75 %, estable desde 60 %, requiere atención desde 45 %, crítico por debajo.

**Ciclo anterior.** «Cargar un ciclo anterior» permite registrar a mano los resultados ya consolidados (% favorable por dimensión, participantes y universo) para compararlos con los ciclos nuevos.

**Buzón de sugerencias.** Es una campaña con su propio enlace: cada colaborador (con cédula) aporta hasta 5 ideas con tema y beneficio esperado. Tablero (ideas por tema, estado, marca y tienda), informe de ideas con nombre, cédula, tienda y cargo del autor (PDF y Excel) y gestión de cada idea (Recibida, En revisión, Implementada, No viable, con nota de RRHH).

**Informes en Excel.** Se agregan las hojas «Clima laboral · ciclos», «Clima laboral · dimensiones» y «Buzón de sugerencias».

**Migración de Supabase (APLICADA el 07/10/2026):** `supabase/migracion-clima-sugerencias.sql`. Hace que solo RRHH y Administrador lean y escriban ciclos y respuestas, y crea tres funciones públicas para el enlace (`clima_ciclo`, `clima_validar`, `clima_enviar`) con las validaciones en el servidor. Con ella aplicada, el enlace público guarda las respuestas en la nube.

### 4.27 Edad en los indicadores y cumpleaños de RRHH

**Edad en Indicadores de gestión (Perfil de la plantilla).** Además de la edad promedio, ahora se muestran la edad mediana (con el mínimo y el máximo), la distribución por rangos (menos de 25, 25 a 34, 35 a 44, 45 a 54 y 55 o más), la edad promedio por cargo y la edad promedio por tienda. Se calculan con el personal activo que tiene fecha de nacimiento (la de la ficha si el trabajador no la tiene). La hoja «Plantilla» de Informes en Excel incluye las columnas «Edad» y «Rango de edad».

**Ventana de cumpleaños (solo perfil de RRHH).** Al abrir la aplicación aparece una ventana con los cumpleaños de hoy (con la edad que cumplen y un botón para felicitar por WhatsApp si el trabajador tiene teléfono) y la lista de los cumpleaños del mes, con los ya pasados en gris. Se cierra con «Entendido» y vuelve a aparecer al volver a abrir la aplicación. Los nacidos el 29 de febrero se celebran el 28 en años no bisiestos.

### 4.28 Informe de cumpleaños del mes y felicitación por WhatsApp

**Visible para todos los perfiles.** La ventana de cumpleaños (al abrir la aplicación) y el informe «Cumpleaños del mes» (dentro de Informes) los ven todos los perfiles. Cada uno ve solo a los colaboradores de su alcance: la tienda ve los de su tienda, la marca los de su marca y RRHH, Gerencia General y el Administrador ven todos. **La edad que cumple la ven solo RRHH y el Administrador**; los demás perfiles ven que la persona está de cumpleaños, sin la edad.

**Informe del mes.** Se elige el mes y el año (por defecto el actual) y se respeta el filtro de marca. Muestra el total de cumpleañeros, cuántos cumplen hoy y el desglose por marca, con la tabla completa (día, colaborador, cargo, tienda, marca y, para RRHH y Administrador, la edad). Se descarga en Excel o se imprime con «Imprimir informe». Avisa cuántos colaboradores activos no tienen fecha de nacimiento y por eso no aparecen. El 29 de febrero se celebra el 28 en los años no bisiestos. Se abre también desde el botón «Informe del mes» de la ventana.

**Felicitación por WhatsApp con mensaje predeterminado según el cargo.** En la ventana y en el informe hay un enlace «Felicitar por WhatsApp» (en los de hoy; «Mensaje» o «Felicitar tarde» en los demás de la lista). Abre WhatsApp con el mensaje ya escrito, que se puede editar antes de enviar. Hay un texto propio para: Gerente de Tienda, Subgerente, Cajero y Cajero Principal, Asesor de Ventas, Jefe de Almacén y Depositario, Visual Merchandiser, Auxiliar de Seguridad y Personal administrativo, y uno general para cualquier otro cargo. Los cargos nuevos se reconocen por palabras de su nombre (por ejemplo «vigilante» o «analista»). Todos incluyen el nombre de pila y la firma de la marca de la persona (Balú o Planeta). Si el colaborador no tiene teléfono válido, el enlace no aparece. Los textos están en `cumpleanos.js` (`mensajeCumpleanos`).

Funciones nuevas en `cumpleanos.js`: `cumpleanosDeMes`, `mensajeCumpleanos`, `familiaDeCargo` y `enlaceWhatsApp`. Pruebas: `test-informe-cumpleanos.cjs`, `test-cumpleanos.cjs` y `test-cumpleanos.mjs`.

### 4.29 Tarjetas de indicadores que llevan al módulo, con botón «Volver»

Las tarjetas de indicadores del **Tablero** (todos los perfiles, incluido Gerente de Tienda y Consulta) y de **Indicadores de gestión** ahora se pueden pulsar y llevan al módulo donde está el detalle. Cada tarjeta pulsable muestra «Ver detalle ›». Al llegar al módulo aparece arriba el botón **«Volver a …»** (por ejemplo «Volver a Tablero» o «Volver a Indicadores de gestión»), que regresa a la página anterior. Si se entra desde el menú lateral no aparece, porque no hay página anterior.

Destinos principales: Plantilla activa y los indicadores de edad, antigüedad y nivel de instrucción → Directorio (Mi Tienda en el perfil de tienda); Ingresos del mes y Egresos tempranos → Ingresos y egresos; Cobertura de HC → Informes, Plantilla y HC; Rotación → Indicadores de gestión (o Informes si el perfil no tiene ese módulo); Pendientes de mi aprobación → Solicitudes, pendientes; Evaluaciones y Cobertura Nine-Box → Evaluaciones; Contratos en alerta → Prueba y contratos; Documentos del mes → Documentos; Pernoctas y apoyos → Pernoctas; Avance del onboarding → Onboarding; Lógico → Informes, Indicador Lógico. Si el perfil no tiene acceso al módulo de destino, la tarjeta lleva al informe equivalente; si tampoco existe, queda sin enlace.

Aplica a 31 tarjetas del Tablero y de Indicadores de gestión. Las tarjetas de resumen dentro de cada módulo y de Informes no se tocaron. Prueba nueva: `test-tarjetas.cjs`.

### 4.30 Publicación en Vercel (08/10/2026)
- Sitio publicado: https://sgi-rrhh.vercel.app (equipo `jossie-fut`, proyecto `sgi-rrhh`, preset «Other», sin comando de compilación).
- Código fuente del sitio: repositorio público `Jossiefut/sgi-rrhh` (rama `main`, archivos `index.html` y `vercel.json`). Cada `push` a `main` republica automáticamente.
- Corrección de compilación: `construir-todo.sh` ahora define la URL y la clave pública (anon) de Supabase al compilar `entry-nube.jsx`. Sin esto la pantalla quedaba en blanco («process is not defined»).
- Verificado: pantalla de acceso con correo, contraseña, «Primer acceso del Administrador» y portal de evaluación para trabajadores.

### 4.31 Permiso de columnas en accesos_prueba (08/10/2026)
- Al entrar por primera vez, el Administrador veía «permission denied for table accesos_prueba». Se concedió SELECT solo en `tipo`, `apellidos` y `ev` (APLICADA). Archivo: `supabase/migracion-accesos-prueba-columnas.sql`.
- Verificado con el rol del Administrador: las 8 consultas de carga de la aplicación responden sin error.

### 4.32 Registros repetidos del formulario: gana siempre el último (08/10/2026)
- `fichasDesdeFormulario` compara ahora fecha **y hora** de «Hora de finalización» (nueva función `marcaDeTiempo`); antes solo comparaba el día. Si hay dos respuestas de una cédula, se conserva la más reciente, sin importar el orden de las filas; en empate, la que aparece después. Se informa cuántos registros había y qué campos cambiaron.
- Probado: mismo día con orden invertido, días distintos, tres registros desordenados, fecha serial de Excel con hora y formato a. m./p. m.
- La lectura directa de SharePoint solo funciona al abrir el sistema desde Claude. En el sitio publicado se actualiza cargando el archivo en «Sincronización de datos › Cargar formulario».

### 4.33 Recepción automática del formulario (Power Automate → Supabase) (08/10/2026)
- Nueva pestaña **Sincronización de datos › Recepción automática** (solo en el sitio publicado): genera la clave de integración, muestra la dirección y la `apikey` para TI, cuenta lo recibido y permite **revisar y aplicar** con el mismo flujo de «Cargar formulario» (gana siempre la respuesta más reciente; no se pisa una ficha más nueva con una más vieja).
- Supabase (APLICADA): tablas `integracion_clave` y `formulario_recibido`, funciones `generar_clave_integracion()` y `recibir_formulario()`. Probado con rol anónimo y de Administrador en transacciones deshechas: clave inválida rechazada, bancos descartados, la tabla no se lee sin sesión, reenvío sin cambios no queda pendiente.
- Instrucciones para TI: `INSTRUCCIONES-TI-PowerAutomate.md`. Archivo: `supabase/migracion-recepcion-formulario.sql`.

### 4.34 Reporte de egresos (Administración de personal › Reporte de egresos)
- Nuevo módulo para reportar la salida de un trabajador: motivo (renuncia voluntaria, abandono de trabajo, término de contrato, despido justificado, mutuo acuerdo, otro), fecha de egreso, observaciones y documento de soporte (PDF/PNG/JPG hasta 1,5 MB).
- **Renuncia voluntaria:** la carta de renuncia es obligatoria.
- **Abandono de trabajo:** lo declara el Gerente o Subgerente de la tienda (también RRHH o el Administrador). Pide el último día que se presentó y una declaración expresa de que el trabajador nunca regresó; muestra los días sin asistir y avisa si son menos de 3.
- Al enviar se crea una solicitud de desincorporación, que sigue la ruta de aprobación vigente (Marca → Operaciones → Gerente General si es Gerente de Tienda → ejecución de RRHH). Al ejecutarla el trabajador queda EGRESADO.
- El detalle de la solicitud muestra el último día trabajado, quién declaró el abandono y permite descargar el documento. Los botones «Iniciar desincorporación» y el aviso de abandono del expediente ahora llevan a este módulo.
- Prueba: `test-egresos.cjs` (13 verificaciones). Respaldo: `App.backup-preEgresos.jsx`.

### 4.35 Trazabilidad: quién aprobó cada flujo (Administración del sistema › Trazabilidad)
- Nuevo módulo para RRHH, Gerencia General y el Administrador, con dos pestañas:
  - **Aprobaciones por flujo:** una fila por cada acción de cada flujo (traslado, promoción, desincorporación/egreso, evaluaciones de contrato, Nine-Box, apoyos, pernoctas e incentivos de ventas): quién, con qué rol, en qué paso, qué hizo (creó, aprobó, rechazó, devolvió, ejecutó), fecha y hora, comentario y estado actual del flujo. Incluye las decisiones pendientes y quién las debe tomar. Filtros por flujo, responsable, acción, estado y fechas; exporta a CSV.
  - **Bitácora general:** todo lo que se hace en el sistema, con filtros y exportación a CSV.
- **Los usuarios no se reutilizan:** cada acción guarda el nombre y el rol del usuario *al momento de actuar* (en eventos, pasos de aprobación, incentivos y bitácora). Aunque la cuenta se desactive, el historial sigue mostrando quién actuó. En «Usuarios y accesos», un usuario existente ya no puede cambiar de persona, rol, marca ni tienda: se crea un usuario nuevo y se desactiva el anterior. (Las cuentas «Pendiente de activación» sí se pueden asignar la primera vez.)
- Cada decisión sobre una solicitud queda en la bitácora con el trabajador, el paso y el resultado (aprobada, rechazada, devuelta, ejecutada). También quedan registradas las actividades de onboarding marcadas y quién anuló una amonestación y cuándo.
- **Promoción y traslado:** al firmar Gerencia General (último paso) el sistema actualiza el cargo y/o la tienda del trabajador, agrega el movimiento a su historial, genera el plan de onboarding de la promoción y la ruta habitual si cambia de tienda.
- Prueba: `test-trazabilidad.cjs` (12 verificaciones). Respaldos: `App.backup-preTrazabilidad.jsx`, `App.backup-preAprobaciones.jsx`.

### 4.36 Informes con responsables y versión del sistema
- **Quién y dónde:** los documentos (PDF) llevan al pie «Emitido por: nombre · cargo · ubicación». Las rutas de aprobación impresas muestran «Aprobado por / Rechazado por / Devuelto por / Ejecutado por» con nombre, cargo y ubicación. El cargo es el rol del usuario y la ubicación es su tienda, su marca o la oficina administrativa.
- **Pantallas e informes:** las listas de solicitudes, evaluaciones de contrato y movimientos tienen la columna «Solicitado y decidido por»; los documentos subidos (amonestaciones, cartas de renuncia) muestran «Subido por».
- **Excel:** los conjuntos de Solicitudes, Amonestaciones, Entrevistas de salida, Evaluaciones Nine-Box e Incentivos de ventas incluyen columnas con quién solicitó, aprobó, rechazó, devolvió, ejecutó o subió cada registro (nombre · cargo · ubicación).
- **Versión:** se muestra en la pantalla de acceso y en la cabecera («Versión 1.5.0 · fecha y hora de compilación»). Al pulsarla se ve el historial. La versión vive en `versiones.js`.
- **Publicación inmediata:** `publicar.sh "descripción"` compila, prueba, actualiza el paquete y sube a GitHub; Vercel republica solo.


### 4.37 Comando «exportar»: paquete para el programador y manuales por perfil (v1.6.0)
- `bash exportar.sh` genera `exportacion/SGI-RRHH-v<versión>-exportacion.zip` y `…-manuales-de-uso.zip`. Antes de empaquetar compila, ejecuta **todas** las pruebas automáticas (`probar-todo.sh`) y verifica la base de datos; si algo falla, no exporta.
- **Contenido:** código fuente completo; **todas las librerías** (caché de npm con las 177 dependencias exactas para instalar sin Internet en Windows, macOS o Linux; SheetJS y html2pdf.js; fuentes con licencias); base de datos (`supabase/esquema-actual.sql`, foto exacta del servidor, y las migraciones en orden, incluidas `20261007120000_pruebas_nuevas_y_ninebox.sql` y `20261008200000_retirar_funciones_antiguas.sql`, que no figuraban en el historial de Supabase); Edge Functions; sitio compilado; resultados de pruebas; documentación técnica (`ARQUITECTURA.md`, `INVENTARIO-LIBRERIAS.md`, historial de versiones, documentos de diseño del proyecto) y los manuales de uso.
- **Base de datos verificada:** `supabase/probar-esquema.sh` crea la base desde cero en un PostgreSQL local por los dos caminos (esquema y migraciones) y confirma que dan las mismas tablas, columnas, políticas y código de funciones.
- **Manuales por perfil:** `manuales/extraer-menu.cjs` entra a la versión compilada con cada perfil y toma su menú, pestañas y textos de pantalla; `manuales/generar-manuales.cjs` los combina con las explicaciones de `manuales/contenido.cjs` y produce PDF, HTML y Markdown. Si un módulo nuevo no tiene explicación, la exportación se detiene: ningún manual sale incompleto.
- `documentar.cjs` genera la documentación técnica desde el código (roles y permisos, acciones del reductor, tablas, funciones y menú por perfil).

### 4.38 Manual de uso dentro del sistema (Ayuda › Manual de uso) (v1.7.0)
- Nueva sección **Ayuda** al final del menú con **Manual de uso**. Cada perfil ve **solo su propio manual** (Administrador, Gerente de RRHH, Gerente General, Gerente de Marca, Gerente de Operaciones, Gerente de Tienda, Visor General y Consulta RRHH Futura).
- El manual trae «Ir a la sección», buscador con resaltado («Siguiente» para recorrer las coincidencias) y **Descargar PDF**. Consulta RRHH Futura solo lo lee en pantalla, como el resto de sus documentos.
- **Se actualiza en cada cambio:** `publicar.sh` y `exportar.sh` llaman a `actualizar-manuales.sh`, que entra a la versión compilada con cada perfil, regenera `manuales-app.js` y vuelve a compilar. Así el menú, las pestañas y las novedades del manual coinciden siempre con la versión publicada.
- Prueba: `test-manual.cjs` (34 verificaciones: cada perfil ve la opción, abre su manual, no ve el de otro perfil, descarga según su perfil, buscador e índice). Respaldo: `App.backup-preManual.jsx`.

### 4.39 Perfiles de cargo, exámenes por cargo y políticas de RRHH (v1.8.0)
- **Fuente:** descripciones de cargo de tienda Balú (14/04/2026) y manual de procesos de tienda. Las funciones son iguales en todas las tiendas; cambia la línea de reporte según el tamaño (grande: Cajero Titular y Jefe de Almacén; pequeña: cajero y almacenista reportan al Subgerente). Planeta usa las mismas hasta cargar sus descripciones. No se usan documentos de Futura ni nombres o logos de terceros.
- **Reclutamiento e ingreso › Perfiles de cargo:** por cargo, descripción completa (objetivo, funciones por proceso, competencias con nivel 1 a 5, perfil requerido), perfil del colaborador, exámenes con su peso, plan de onboarding y condiciones de evaluación; documento PDF con logo de Balú o Planeta. La edad y el género no se usan como criterio (LOTTT, art. 21).
- **Exámenes por cargo (batería DC-2026-04):** Asesor IPV + IPC; Cajero y Cajero Titular Lógico + Integridad + IPC; Almacenista Integridad + IPC; Jefe de Almacén Integridad + IPC + Lógico; **Visual IPC + Lógico** (antes IPV + IPC; ajuste IPC 50 % + básica 50 %); **Subgerente Kostick + IPC + Integridad** (antes Lógico); Gerente Kostick + IPC + Lógico. La configuración guardada antes se reemplaza por esta versión; se edita en Configuración.
- **Onboarding:** plantillas por cargo construidas con las funciones de la descripción (versión DC-2026-04).
- **Condiciones de evaluación:** las evaluaciones de período de prueba, prosecución y pase a fijo suman un ítem por cada proceso de la descripción del cargo. Cada evaluación guarda sus ítems; las anteriores se siguen leyendo con sus ítems originales.
- **Ayuda › Políticas:** 23 políticas por subsistema (incluye trato respetuoso, remuneración variable y comisiones, jornada y días libres, cobertura de vacantes, recepción de mercancía, facturación y cambios, apertura y cierre de caja, a partir del manual de procesos y de los hallazgos de tienda). Logo y razón social de la marca; PDF desde el sistema y Word por marca con `node politicas/generar-word.mjs` (incluidos en la exportación, carpeta 08).
- **Sin Futura:** los documentos para Nómina usan la razón social de la marca; las funciones del Asesor vienen de su descripción de cargo.


### 4.40 Feedback para quien no continúa e información fiscal por empresa (v1.8.1)
- `saleDeLaEmpresa(s)` (App.jsx): en evaluaciones de contrato (EVAL_PRUEBA/PROSECUCION/FIJO) con decisión distinta de CONTINUA, el feedback guarda `{ sale: true, notas }` y el informe final solo muestra «Notas». Con decisión CONTINUA (con o sin condiciones) se piden fortalezas, oportunidades y compromisos.
- `ENTIDADES_INICIAL` incluye por marca: razón social, RIF, domicilio fiscal, IVSS, INCES, FAOV y NIL (fuente: constancias y hoja PARAFISCALES). `entidadMarca()` usa el dato guardado y, si está vacío, el inicial. `valorTienda()` hace que la ficha de cada tienda herede esos datos si la tienda no tiene uno propio. Se edita en Configuración › Empresas.
- Prueba nueva: `test-feedback.cjs`.

### 4.41 Carta de culminación única, Informes unificados y Modelos de compensación ampliados (v1.9.0)
- **Carta de culminación:** los reductores `ACTIVAR_CARTA_CULMINACION` y `FECHA_EGRESO_CARTA` ignoran la acción si la carta ya existe / ya tiene fecha de egreso. La pantalla de la solicitud muestra la carta emitida sin formulario.
- **Informes:** el menú «Informes en Excel» se eliminó; es la pestaña `excel` («Descargas en Excel») de `InformesModulos` (solo rrhh, general y admin). La ruta `informesExcel` abre esa pestaña.
- **Modelos de compensación** (`ROLES_VE_MODELOS` = marca, operaciones, general, rrhh, admin; `ROLES_EDITA_MODELOS` = rrhh, general). Campos nuevos del modelo: `kpis` ({formato: [{kpiId, nombreLibre, calculo, meses, agregacion PROMEDIO|MEDIANA|TOTAL, repositorioId}]}), `metodos` ({m5095, m100}), `fechaCorte` (inicial 2026-07-01), `comisionCargos` ([{cargoId, pctVenta, pctPool}]), `formasComision`, `descripcionComision`, `ayudaMensual` ({monto, moneda}), `porVendedor` ([{trabajadorId, pctVenta, pctPool}]). `modeloConExtra()` completa los modelos antiguos.
- **Repositorios:** `config.repositorios` admite hasta `MAX_REPOSITORIOS` = 30, cada uno con `modulos` (ids de `MODULOS_REPOSITORIO`).
- Pruebas nuevas: `test-compensacion.cjs`.

### 4.42 Organigrama con casilla, género, antigüedad, pruebas agrupadas y tren gerencial (v1.10.0)
- Organigrama: casilla `org-temporada`; `hcNecesario/tieneHCDefinido/calcularHC` aceptan `modo` ('temporada' | 'normal'). Edición de plantillas solo `admin` (Configuración › Plantilla de HC); `Montos de apoyo` pasó a su pestaña.
- Ficha: género en Identificación (`generoTexto`). Excel Plantilla e Histórico: columnas `ANTIGUEDAD_COLS` (días, meses, años, texto) con `antiguedadPartes`.
- Informes: pestaña `pruebas` con casillas `inf-prueba-*` (los ids antiguos `ipv`, `kostick`… abren esa pestaña con la prueba marcada).
- Modelos de compensación: `componentes[].cargos` = lista de ids (`cargosComoLista` migra el texto anterior); `trenGerencial {tiendaId:{gt:{aplica,monto},sub:{...}}}` (monto en Ref, visible de Marca hacia arriba); KPI `TICKETS`.
- Prueba: `test-v1100.cjs`.

### 4.43 Moneda y tasa por componente, tren gerencial en Bs/divisas, ayuda por cargo y asignación por tienda (v1.11.0)
- Componente: `enUsd`, `montoUsd`, `tasa` (BCV|BINANCE|INTERNA|EURO), `pagoBs`, `pagoBsItem`.
- `trenGerencial[tienda][gt|sub] = {aplica, moneda: DIVISAS|BS, monto (USD)}`.
- `ayudaPorCargo {cargoId:{monto, moneda}}` reemplaza la ayuda única (`ayudaMensual` queda solo por compatibilidad).
- Reducer `ASIGNAR_MODELO_TIENDA` (selector `mc-asig-<tienda>` en «Por tienda»; solo RRHH y Gerencia General).

### 4.44 Período de corte, vendedor tipo+indicador, modelo oficial, hasta 4 modelos por tienda, ficha confidencial (v1.12.0)
- `periodoComision {frecuencia MES|QUINCENA|SEMANA|PERSONALIZADO, desde, hasta, detalle}`; `oficial` (bool); `porVendedor[].tipos/indicadores` (listas).
- Una tienda admite hasta `MAX_MODELOS_TIENDA` (4) modelos; reducer `ASIGNAR_MODELO_TIENDA {tiendaId, modeloIds[]}`; `GUARDAR_MODELO_COMP` ya no quita la tienda de otros modelos.
- `fichaCompensacionHTML` (botón «Ficha» en «Por tienda»); `ROLES_VE_MODELOS` incluye `visor` (Dirección Ejecutiva).

### 4.45 KPI por área, formación y cumplimiento de clima (v1.13.0)
- `kpisPorArea(datos, ids, hoy)` devuelve 11 áreas con KPI (valor, meta, sentido, fórmula, estado); `PanelKpiAreas` los muestra plegados en Indicadores de gestión; `OBJETIVOS_ESTRATEGICOS` los vincula a los objetivos del programa (derivados de la descripción del proyecto). Metas referenciales; `META_PARTICIPACION_CLIMA` = 70.
- Nuevos campos: `catalogoFormaciones[].costoTotal`, `participaciones[].notaPrevia`, `participaciones[].satisfaccion` (0–10).
- KPI de impacto (conversión, UPT/ticket, mermas, ROI) quedan «sin datos» hasta cargar ventas por tienda.
- Prueba: `test-kpis.cjs`.

### 4.46 Estructura administrativa, pruebas y Nine-Box por familia de cargo (v1.14.0)
- Módulo `EstructuraAdministrativa` (menú «Administración de personal › Estructura administrativa»). Visible para `rrhh`, `admin` y `general` (`ROLES_ESTRUCTURA_ADM`); cargan y configuran `rrhh` y `general` (`ROLES_EDITA_ADM`).
- **Privacidad:** el organigrama y la compensación NO están en el código, el repositorio, el paquete ni la base compartida. Se importan desde un JSON (`areas`, `posiciones {id, areaId, cargo, nombre, jefeId, vacante, comp}`, `distribucion`, `notas`) y se guardan solo en `localStorage['sgi-estructura-admin-v1']` del navegador. Si se requiere compartirlos entre usuarios, debe crearse una tabla restringida en Supabase con RLS (cambio de seguridad que requiere autorización expresa).
- `FAMILIAS_ADM` (8 familias por área del organigrama): batería de pruebas (máx. 3, `config.bateriaAdm`) y criterios de desempeño propios para la Nine-Box (`itemsDesempenoDe(administrativo, familiaId)`). La evaluación guarda `familiaAdm`; el potencial usa los criterios generales.
- `trabajador.familiaAdm` (opcional) se asigna en la pestaña «Pruebas y Nine-Box por cargo» o con «Asignar según el organigrama» (coincidencia por nombre con los datos locales).
- Selector de cargo de las pruebas: opciones `ADM:<familia>`; `bateriaPorCargo` y `nombreCargo` las resuelven.
- Prueba: `test-v1140.cjs` (con datos ficticios).

### 4.47 Instalación en Android como PWA (v1.15.0)
- Archivos en `pwa/`: `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`. `publicar.sh` los copia a la raíz del sitio y al paquete; `build-nube.py` enlaza el manifiesto y registra el service worker solo en el sitio publicado (no en la demo ni en el artefacto).
- El service worker prioriza la red (cada versión llega de inmediato), guarda solo la pantalla de acceso para abrir sin conexión y no intercepta otros orígenes (Supabase). `vercel.json` marca `/sw.js` y el manifiesto como `no-cache`.
- Un APK firmado (TWA/Capacitor) es opcional y requiere clave de firma a cargo de la usuaria; no se generó.
- Prueba: `test-pwa.cjs`.

### 4.48 Restablecer contraseña con preguntas de seguridad (v1.16.0)
- UI: `OlvidoClave` (enlace «¿Olvidó su contraseña?» en el acceso), `CamposPreguntas`/`FormPreguntasSeguridad` (primer ingreso y botón «Preguntas de seguridad»), `RegistroRestablecimientos` (Usuarios y accesos). `PREGUNTAS_SEGURIDAD` (10 preguntas, ids q01–q10). Métodos en `nube.js`: `preguntasDeCorreo`, `tienePreguntas`, `guardarPreguntas`, `restablecerClave`, `registroRestablecimientos`; si el servidor no tiene las funciones (`noActivada`) el sistema sigue funcionando sin las preguntas.
- Servidor (PENDIENTE de aplicar por la usuaria, ver `supabase/pendientes/LEEME-aplicar.md`): migración `20261009120000_restablecer_clave_preguntas.sql` (tablas `preguntas_seguridad`, `restablecer_intentos`, `restablecer_registro`; funciones `guardar_preguntas_seguridad`, `tiene_preguntas_seguridad`, `preguntas_de_correo`, `verificar_respuestas_seguridad`) y Edge Function pública `restablecer-clave` (Verify JWT desactivado).
- Seguridad: respuestas normalizadas y con hash bcrypt (pgcrypto); verificación solo con `service_role`; 5 intentos fallidos = bloqueo de 30 min; correos desconocidos reciben preguntas simuladas; registro visible solo para el Administrador.
- Pruebas: `test-nube.cjs` (flujo completo con servidor simulado) y `supabase/probar-restablecer.sh` (SQL en PostgreSQL local).

### 4.49 Instalación de la aplicación desde Ayuda (v1.16.1)
- `PanelInstalarApp` en `ManualDeUso`: visible solo para `ROLES_INSTALA_APP` (marca, operaciones, rrhh, general). Usa el evento `beforeinstallprompt` (capturado a nivel de módulo en `window.__INSTALAR__`); sin evento muestra las instrucciones por plataforma; en la demo/artefacto remite al sitio oficial. Prueba: `test-instalar.cjs`.

### 4.50 Perfiles de cargo administrativos y tiendas Planeta Sports (v1.17.0)
- Datos: `perfiles-adm.js` (generado, no editar a mano) con `PERFILES_ADM` (42 perfiles: id, marcas, familia, funciones por proceso, competencias técnicas y blandas con nivel 1–5, requisitos, `kpiNineBox`/`tecNineBox`, `diccionario` por rol), `PERFILES_TIENDA_PLANETA` (GT, SUB, CAJ, ASE, ALM de Planeta Sports) y `DICCIONARIO_COMPETENCIAS` (definición y descriptor por nivel, por marca). Se generan con `descripciones/leer-pdf-descripciones.py` (lee las descripciones de puesto en PDF con pdfplumber) y `descripciones/construir-perfiles-adm.py` (une los PDF con los diccionarios Excel); los documentos de origen los entrega RRHH y no se incluyen en el paquete. No contiene datos personales ni montos; se retiran el nombre de la casa matriz y el pie de firma, y no se cargan edad ni género (LOTTT, art. 21).
- Ediciones de RRHH: `config.perfilesAdm[id]` (se superpone a `PERFILES_ADM` con `perfilAdmEfectivo`); «Restablecer al documento» borra la clave. Edita `ROLES_EDITA_ADM` (rrhh, general); lo ven todos los perfiles salvo `tienda`.
- UI: `PerfilesCargo` ahora tiene dos pestañas: `PerfilesTienda` (con la marca elegida: `descripcionDe(cargoId, marca)` usa `PERFILES_TIENDA_PLANETA` en Planeta) y `PerfilesAdministrativos` + `EditorPerfilAdm`. `itemsHito(hitoId, marca, cargoId)` toma las funciones de la marca del colaborador.
- Pruebas y Nine-Box por perfil: `trabajador.perfilAdmId` (opcional; fija también `familiaAdm`); `bateriaAdmPerfil` (batería propia del perfil o la de su familia); `itemsDesempenoDe(administrativo, familiaId, perfilId)`; la evaluación guarda `perfilAdm`. Selector de cargo en asignación de pruebas: `ADM:<familia>` o `ADM:<familia>:<perfilId>`.
- Estructura administrativa: cada posición del JSON local puede llevar `perfilId` y `cargoAnterior`; se editan en «Personal y cargos» (solo en el navegador). El archivo privado v2 (cargos renombrados y vinculados) se entrega a RRHH aparte, fuera del repositorio.
- Prueba: `test-v1170.cjs`.
