/* Contenido de los manuales de uso por perfil.
   - Lo que cada perfil VE (menú, pestañas, subtítulos) lo extrae solo `extraer-menu.cjs` de la versión compilada.
   - Este archivo explica PARA QUÉ sirve cada módulo y CÓMO se usa, con notas por perfil.
   - Regla: si un módulo nuevo aparece en el menú y no tiene entrada aquí, `generar-manuales.cjs` se detiene
     con error. Así ningún manual sale incompleto después de una actualización.
   Claves de perfil: admin, rrhh, analista, general, junta, marca, operaciones, tienda, visor, consulta. */

const PERFILES = {
  admin: { nombre: 'Administrador', alcance: 'Balú y Planeta (todas las tiendas y oficinas).', resumen: 'Configura el sistema, crea y desactiva usuarios, y puede actuar en cualquier paso de aprobación cuando hace falta (por ejemplo, el paso de RRHH de una promoción creada por RRHH).' },
  rrhh: { nombre: 'Gerente de RRHH', alcance: 'Balú y Planeta (todas las tiendas y oficinas).', resumen: 'Mantiene los datos del personal, registra ingresos, valida evaluaciones y movimientos, ejecuta desincorporaciones, administra pruebas, formación, clima laboral, incentivos y la sincronización de datos.' },
  analista: { nombre: 'Analista de RRHH', alcance: 'Balú y Planeta (todas las tiendas y oficinas).', resumen: 'Apoya a la Gerencia de RRHH con la consulta y la descarga de la documentación del personal: documentos, informes, expedientes y requisiciones de personal. No aprueba, no firma, no crea ni modifica registros, y no ve remuneración, modelos de compensación ni datos sensibles.' },
  general: { nombre: 'Gerente General', alcance: 'Balú y Planeta (todas las tiendas y oficinas).', resumen: 'Firma el último paso de traslados, promociones, Nine-Box gerenciales y administrativas, desincorporaciones de Gerentes de Tienda e incentivos de ventas. Consulta indicadores, informes y la trazabilidad.' },
  junta: { nombre: 'Junta Directiva', alcance: 'Balú y Planeta (toda la organización).', resumen: 'Perfil por encima de la Gerencia General. Consulta tableros, informes, estructura y modelos de compensación, y ve y registra la remuneración y los KPI de todo el personal. No aprueba flujos ni modifica otros datos.' },
  marca: { nombre: 'Gerente de Marca', alcance: 'Solo las tiendas de su marca (Balú o Planeta).', resumen: 'Aprueba el primer paso de los movimientos de su marca, registra ingresos y solicitudes, propone sucesores, calibra Nine-Box y revisa los indicadores de su marca.' },
  operaciones: { nombre: 'Gerente de Operaciones', alcance: 'Solo las tiendas de su marca (Balú o Planeta).', resumen: 'Aprueba el paso de Operaciones de los movimientos, apoyos y pernoctas de su marca, calibra Nine-Box y revisa los indicadores de su marca.' },
  tienda: { nombre: 'Gerente de Tienda (Gerente o Subgerente)', alcance: 'Solo su tienda.', resumen: 'Registra ingresos, evalúa contratos y Nine-Box de su personal, crea solicitudes (traslado, promoción, desincorporación), reporta egresos y abandonos, informa pernoctas y apoyos, carga amonestaciones y lleva el onboarding.' },
  visor: { nombre: 'Visor General', alcance: 'Solo las tiendas de su marca (Balú o Planeta).', resumen: 'Consulta tableros, indicadores, informes y solicitudes de su marca. No crea, aprueba ni modifica registros.' },
  consulta: { nombre: 'Consulta RRHH Futura', alcance: 'Solo su marca. Ve informes, resultados y documentos en pantalla.', resumen: 'Solo visualiza. No ve rutas de aprobación, comentarios, bandejas, claves de acceso ni la ficha personal, y no puede modificar, imprimir ni descargar documentos (salvo «Imprimir informe» en Informes).' },
};

/* Capítulos comunes a todos los perfiles internos */
const GENERAL = [
  {
    titulo: 'Entrar al sistema',
    texto: [
      'Abra **https://sgi-rrhh.vercel.app** en Chrome, Edge o Safari (computadora o teléfono).',
      'Escriba su **correo** y su **contraseña**. La primera vez use la contraseña temporal que le entregó el Administrador: el sistema le pedirá crear una propia (mínimo 8 caracteres).',
      'Si olvidó la contraseña, pida al Administrador que la restablezca (Usuarios y accesos › Clave). Nadie debe compartir su usuario: cada acción queda registrada con su nombre, cargo y ubicación.',
      'Para salir use el botón **Salir** de la cabecera.',
      'Si la página no carga o se ve una versión anterior, recargue con **Ctrl + F5** (Mac: Cmd + Shift + R) o ábrala en una ventana privada.',
    ],
  },
  {
    titulo: 'Cómo se organiza la pantalla',
    texto: [
      '**Menú lateral por subsistema de RRHH:** cada perfil ve solo las opciones que le corresponden (ver «Su menú» más abajo). En el teléfono el menú se abre con el botón de tres líneas.',
      '**Cabecera:** su nombre, su rol, la **versión del sistema** (al pulsarla se ve el historial de cambios) y el contador de **recordatorios**.',
      { roles: ['admin', 'rrhh', 'general'], t: '**Selector de marca:** en la cabecera, logos Balú, Planeta o «Ambas». Cambia el alcance de tableros e informes en todas las pantallas.' },
      { roles: ['marca', 'operaciones', 'rrhh', 'general', 'junta', 'admin'], t: '**Mi firma (cabecera):** importe una imagen de su firma (PNG o JPG sobre fondo claro, hasta 3 MB). Se mostrará en los documentos que usted emita y en las aprobaciones y firmas que realice (solicitudes, onboarding, incentivos). Queda solo en su navegador; al aprobar se copia al registro de ese paso para que el documento la muestre desde cualquier equipo. «Reemplazar firma» o «Quitar firma» la cambian cuando quiera. Quien no tiene firma importada aprueba igual y el documento sale solo con su nombre y cargo.' },
      '**Tarjetas con «Ver detalle ›»:** llevan al módulo donde está el detalle. Arriba aparece **«Volver a …»** para regresar a la página anterior.',
      '**Pestañas:** dentro de cada módulo, las pestañas separan las tareas (por ejemplo, «Pendientes de mi aprobación», «Creadas por mí», «Todas»). Los números al lado indican cuántos registros hay.',
    ],
  },
  {
    titulo: 'Responsables y trazabilidad',
    texto: [
      'Cada aprobación, rechazo, devolución, ejecución o documento subido guarda **quién lo hizo, con su cargo y su ubicación, en la fecha y hora reales**. Aunque la persona cambie de cargo o se desactive su usuario, el historial conserva los datos que tenía al actuar.',
      'Los documentos PDF llevan al pie «**Emitido por:** nombre · cargo · ubicación». Las rutas de aprobación impresas muestran «Aprobado por / Rechazado por / Devuelto por / Ejecutado por».',
      'Los usuarios **no se reutilizan**: si una persona deja el cargo, el Administrador crea un usuario nuevo para quien la reemplaza y desactiva el anterior.',
    ],
  },
  {
    titulo: 'Autenticación de documentos (código QR) y exportación a Excel',
    texto: [
      'Todo documento que el sistema genera con la información de sus flujos (informes, evaluaciones, certificados, relaciones de pago, planes de onboarding y Programas de Formación, constancias, actas) sale con un **código QR** y un **código de verificación** del tipo SGI-XXXX-XXXX-XXXX al pie, con quién lo emitió y cuándo. El código se registra cuando se descarga el PDF.',
      '**No llevan QR** los documentos de los expedientes de personal: kit legal de ingreso, contratos y prórrogas, cartas de culminación y de pase a fijo, ruta habitual de traslado, ficha del trabajador y la documentación administrativa del día 2. Esos conservan su formato original.',
      '**Para comprobar un documento:** escanee el QR con la cámara del teléfono, o use «**Verificar un documento**» en la pantalla de acceso y escriba el código. El sistema dice si el documento es auténtico y vigente, anulado o desconocido, y muestra su nombre, la fecha, quién lo emitió y su marca; nunca muestra datos de trabajadores.',
      '**Exportar a Excel:** el visor de cada informe o documento, el módulo Informes («Exportar a Excel» por pestaña) y el módulo Documentos (todos los documentos filtrados en un solo libro) tienen el botón «Exportar a Excel». Cada tabla va en su hoja. Como Excel no admite el QR, el libro lleva una hoja «Autenticación» con el código y el enlace de verificación.',
      { roles: ['admin', 'rrhh', 'general', 'junta'], t: 'En **Documentos › Documentos autenticados emitidos** se ve el registro de todo lo emitido (código, documento, quién lo emitió, estado). RRHH y el Administrador pueden **anular** un documento con su motivo; quien lo verifique verá que está anulado.' },
      { roles: ['admin', 'rrhh', 'general'], t: 'Las exportaciones globales están en Informes: «Exportar todo a Excel» baja el libro con todos los informes (RRHH recibe nombres y cédulas; los demás, solo códigos de trabajador).' },
    ],
  },
  {
    titulo: 'Recordatorios por correo y ventana de cumpleaños',
    texto: [
      'Cada persona del flujo recibe un correo diario con sus pendientes (evaluaciones de contrato, aprobaciones, cartas, Nine-Box). El correo es el mismo con el que entra al sistema.',
      'Al abrir el sistema aparece la ventana de **cumpleaños** de su alcance (hoy y el mes), con el enlace «Felicitar por WhatsApp» (el mensaje es cercano y amable, y cambia al azar entre varias versiones por cargo, sin repetir el anterior) cuando el colaborador tiene teléfono. La edad solo la ven RRHH y el Administrador. Se cierra con «Entendido».',
    ],
  },
];

/* Módulos. Clave = texto del menú. `alias` permite que un texto distinto (por perfil) use la misma entrada. */
const MODULOS = {
  Tablero: {
    alias: ['Resumen'],
    para: 'Resumen del día: lo que requiere su acción, la plantilla frente al HC, vencimientos de contrato, ingresos y egresos, resultados de evaluaciones y pernoctas.',
    pasos: [
      'Revise primero **«Requiere su acción» / «Pendientes y avisos»**: cada fila muestra cuántos casos tiene y se abre con un clic.',
      'Pulse una tarjeta con «Ver detalle ›» para ir al módulo con el detalle; use «Volver a Tablero» para regresar.',
    ],
    notas: {
      admin: 'Las cifras adicionales están en «Ver más indicadores (4)».',
      rrhh: 'Las cifras adicionales están en «Ver más indicadores (4)». Los avisos de onboarding, vencimientos, cartas y rutas de traslado se muestran como filas con su conteo.',
      general: 'Su tablero es el «Tablero de Gerencia General», con cumplimiento legal (5 %) y egresos críticos.',
      tienda: 'Muestra su tienda: plantilla, organigrama (con casilla para alternar entre la plantilla de temporada y la ordinaria), planes de onboarding, feedback pendiente y evaluaciones por hacer, con botones directos («Evaluar», «Dar feedback», «Ver planes»).',
      consulta: 'Se llama «Resumen» («Informes de RRHH»): solo cifras y estatus de su marca.',
      visor: 'Su tablero muestra el **personal evaluado y su estatus** (evaluado, pendiente de aprobación, aprobada, rechazada) y el **clima laboral**. No incluye vencimientos de contrato, pernoctas ni documentos del mes. Las tarjetas se colorean en **verde** (bueno), **amarillo** (regular) o **rojo** (malo).',
    },
  },
  Recordatorios: {
    para: 'Lista de sus pendientes de contratos y evaluaciones, con el botón «Atender» para ir directo al caso.',
    pasos: [
      'Pulse **Atender** en cada recordatorio para abrir la evaluación o aprobación correspondiente.',
      'Los mismos recordatorios le llegan por correo una vez al día.',
    ],
    notas: {
      admin: 'Pestaña **Envío por correo**: ver el estado del envío diario y «Enviar ahora». El envío automático ocurre la primera vez que RRHH o el Administrador entra en el día.',
      rrhh: 'Pestaña **Envío por correo**: ver el estado del envío diario y «Enviar ahora».',
    },
  },
  'Indicadores de gestión': {
    para: 'Tablero de personal. Abre con el bloque «KPI por área y estrategia» y sigue con cuatro bloques: dotación y rotación; perfil de la plantilla (antigüedad, edad, género, cargo, instrucción); talento y pruebas; gestión y cumplimiento.',
    pasos: [
      '**KPI por área y estrategia:** bloque plegado con los KPI de las 11 áreas del sistema (incluidas Formación y Clima laboral), unidos a los objetivos del programa. Pulse el bloque para ampliarlo, abra el área que le interese y, si lo desea, «Cómo se calcula» y «Abrir» para ir al módulo.',
      '«Dotación y rotación» aparece abierta; los demás bloques muestran sus cifras principales y se abren a pedido.',
      'Pase el cursor sobre una tarjeta para ver su **fórmula**. Pulse «Ver detalle ›» para ir al módulo de origen.',
      'Los períodos de 12 meses son los últimos 365 días.',
      '**Período de medición:** todos los perfiles pueden elegir el período (por defecto, los últimos 12 meses). Rige el bloque «KPI por área y estrategia» y el «Cruce de indicadores», de modo que todo lo que se compara habla del mismo período.',
      '**Cruce de indicadores:** en «KPI por área y estrategia» marque la casilla **Ver** de cualquier indicador (también puede agregarlos desde el cuadro «Agregar indicador»). Se abre el cruce con los indicadores marcados lado a lado, por tienda, por marca o solo el total, con orden por cualquiera de ellos y, cuando hay dos o más, la relación entre cada par (coeficiente r). «Exportar a Excel» descarga el cruce, los parámetros, las correlaciones y las fórmulas.',
      '**Datos personales en el cruce (solo RRHH, Administrador y Gerencia General):** en «Desglosar por» elija un dato personal (género, rango de edad, escolaridad, estado civil, hijos, estado o municipio de residencia, antigüedad, tipo de contrato o cargo). Cada fila calcula el indicador solo con las personas de esa categoría, en el mismo período, y muestra cuántas personas activas la componen; con menos de 5 se avisa «muestra pequeña». Los indicadores que se miden por tienda o para toda la empresa (cobertura del HC, clima) no se pueden partir por persona y se marcan con ‡. Los datos son confidenciales. El Excel respeta el mismo desglose.',
      '**Egresos:** en Reclutamiento e ingreso hay tres KPI nuevos (egresos del período, motivo principal y egresos voluntarios); «Abrir» lleva al análisis de egresos.',
    ],
    notas: { marca: 'Las cifras corresponden solo a su marca.', operaciones: 'Las cifras corresponden solo a su marca.', visor: 'Las cifras corresponden solo a su marca. Puede **elegir el período de medición** (desde / hasta). Incluye segmentación de la plantilla, clima laboral y personal evaluado; no incluye vencimientos de contrato ni pernoctas.' },
  },
  Informes: {
    para: 'Resultados de cada módulo con su detalle y sus documentos, sin rutas de aprobación ni comentarios. Incluye el Informe global, el de Cumpleaños del mes y, para RRHH y Gerencia General, la pestaña «Descargas en Excel» con los archivos planos (.xlsx) y el libro completo.',
    pasos: [
      'Elija la pestaña del informe (Informe global, Plantilla y HC, Contratos, Nine-Box, Movimientos, Apoyos, Pernoctas, Onboarding, etc.). Las pruebas (IPV, Kostick, Lógico, IPC, DISC e Integridad) están agrupadas en «Pruebas y evaluaciones psicotécnicas»: marque con una casilla las que desea ver.',
      'Ajuste los filtros de período, marca o tienda cuando el informe los tenga.',
      'Use **Imprimir informe** para obtener el PDF del resumen en tabla, con logo y razón social de la marca y su QR de autenticación.',
      'Use **Exportar a Excel** para bajar las tablas de la pestaña actual (una hoja por tabla). Con acceso global, **Exportar todo a Excel** baja el libro con todos los informes.',
    ],
    notas: {
      rrhh: 'En «Descargas en Excel» es el único perfil que recibe nombres y cédulas; los demás reciben códigos de trabajador. En «Egresos críticos» puede asignar la tienda a las entrevistas «Sin clasificar». Es el único perfil que ve nombres y cédulas en las entrevistas de salida.',
      tienda: 'Ve solo los informes de su tienda; no tiene la pestaña de Incentivos ni la de Egresos críticos.',
      consulta: 'Tiene además la pestaña «Estatus de solicitudes» (fecha, tipo, trabajador, tienda y estatus). En «Egresos críticos» solo ve los nombres. «Imprimir informe» es la única impresión permitida.',
    },
  },
  Documentos: {
    para: 'Todos los documentos generados en cada fase: ingreso, período de prueba y contrato, traslados y promociones, evaluaciones, apoyos, pernoctas e incentivos.',
    pasos: [
      'Filtre por fase, tienda, fecha o trabajador.',
      'Pulse **Ver** para abrir el documento; desde allí puede imprimirlo o guardarlo en PDF (con su QR de autenticación) o exportar su contenido a Excel.',
      'Con **Exportar a Excel** (encabezado de la lista) baja un libro con el índice de los documentos filtrados y el contenido de los informes del sistema.',
      'El expediente de cada trabajador muestra los mismos documentos ordenados por fase. **Personal administrativo:** al segundo día de ingreso el sistema genera 13 documentos de ingreso (hoja de vida, antecedente clínico, reglamento interno, rutagrama, acuse de recibo, carta de prestaciones, manual normativo de ventas, ficha RNET y otros) con los datos del trabajador, listos para imprimir y firmar; RRHH recibe un recordatorio. Las firmas, huellas y fechas de firma quedan en blanco. **Personal de tiendas:** reciben 11 documentos oficiales de tienda, personalizados con el nombre, la cédula, el cargo y la tienda del trabajador y con el logo, la razón social y el RIF de su empresa (Balú: REPRESENTACIONES ULAB 24, C.A.; Planeta: COMERCIALIZADORA CLOCK WORK, C.A.): hoja de vida, antecedente clínico, normas y reglamento de tienda, notificación de riesgos (10 hojas por tarea, con el cargo del trabajador), normativa interna de trabajo seguro SST-02, ruta habitual de traslado, trípticos de seguridad (fuego y terremoto; primeros auxilios), acuse de recibo, carta de prestaciones sociales y ficha del trabajador (RNET). Las firmas, huellas y fechas de firma quedan en blanco; nunca llevan el nombre ni el logo de Futura. Se programan solos para ingresos de los últimos 15 días; para personal anterior, RRHH los genera con «Generar ahora» desde el expediente. El control de entrega y firma lo ven solo RRHH y el Administrador.',
    ],
    notas: { consulta: 'Los documentos se ven en pantalla, sin botones para imprimir ni descargar.' },
  },
  'Requisiciones de personal': {
    para: 'Reponer al personal que egresa. El sistema genera sola una requisición por cada egreso (cuando sale la carta de egreso o se da de baja al trabajador) con el nombre de la tienda, el cargo a reponer y el trabajador que salió.',
    pasos: [
      'Al generarse la requisición, **todos los perfiles de RRHH** (Gerente y Analista) reciben el aviso en **Recordatorios** («Reponer personal en [tienda]»), y el Gerente de la tienda recibe el aviso de firmarla.',
      '**Firma:** la firma el Gerente **o** el Subgerente de la tienda, de manera indistinta. Pulse **Firmar** e indique quién firma; el nombre y el cargo quedan en el documento.',
      'Pulse **Ver / PDF** para abrir el documento con el número de requisición, la tienda, el cargo y los datos del egreso, e imprimirlo o guardarlo en PDF.',
      'RRHH inicia la reposición y, al ocupar la vacante, pulsa **Vacante cubierta**. Si ya no se necesita, **Anular** (con una nota opcional).',
      'No se duplica: una baja posterior a la carta de egreso usa la misma requisición. El personal de oficina no genera requisición de tienda.',
    ],
    notas: { analista: 'Ve y descarga las requisiciones; no firma ni cierra la vacante.', tienda: 'Firma las requisiciones de su tienda (Gerente o Subgerente) y descarga el documento.', rrhh: 'Recibe el aviso de cada egreso, descarga el documento y cierra la requisición (vacante cubierta o anulada).', admin: 'Puede firmar, cerrar o anular cualquier requisición.', marca: 'Consulta las requisiciones de su marca.', operaciones: 'Consulta las requisiciones de su marca.', general: 'Consulta las requisiciones de toda la organización.' },
  },
  'Nuevo ingreso': {
    para: 'Registro de un trabajador nuevo. Al guardar se genera el kit legal de ingreso (contrato, acuerdo de responsabilidad, confidencialidad, convenio de alimentación) y la ruta habitual de traslado.',
    pasos: [
      'Escriba la **cédula** y pulse **Buscar**. Si la persona llenó el formulario de actualización de datos, la ficha se llena sola (puede verla y descargarla en PDF).',
      'Si no aparece, complete la ficha a mano: datos personales, dirección, familia, emergencia, tallas y educación. El nivel de instrucción es obligatorio.',
      'Indique tienda, cargo, fecha de ingreso y tipo de contrato. Marque «Viene de otra empresa del grupo» si aplica.',
      'Si es un reingreso con menos de 90 días desde el egreso anterior, el sistema propone la fecha más temprana permitida (día 91).',
      'Pulse **Registrar ingreso**. Se crean el expediente, el plan de onboarding de 28 días y los documentos del kit legal.',
      'Pestaña **Listado precargado**: personas que RRHH dejó listas para dar de alta.',
    ],
    notas: {
      tienda: 'Solo puede dar de alta en su tienda. La discapacidad la registra únicamente RRHH.',
      rrhh: 'Puede agregar personas al listado precargado («Agregar al listado precargado») y registrar discapacidad y CONAPDIS (dato visible solo para RRHH).',
      marca: 'Solo puede dar de alta en tiendas de su marca.',
    },
  },
  Onboarding: {
    para: 'Plan de onboarding de 28 días al dar de alta a un trabajador (expectativas a los 28 y 120 días) y Programa de Formación al cargo en cada promoción, de X días fijados por RRHH (90 por defecto). Lo firma el supervisor directo.',
    pasos: [
      'En **En curso**, abra el plan del trabajador y marque cada actividad al completarla (queda en la bitácora con su nombre y fecha).',
      'Si otra persona dio el entrenamiento, marque «Delegado» e indique su nombre. Si otra persona evalúa el plan, marque «Otra persona evalúa este plan».',
      'Al terminar, el plan pasa a **Completados** y se puede imprimir en PDF.',
      '**Programa de Formación (promoción):** al ejecutarse una promoción se abre un programa de formación al nuevo cargo, con el mismo concepto del onboarding (actividades por cargo, delegación, firma del supervisor). RRHH fija los días en la solicitud de promoción antes de ejecutarla («Días del Programa de Formación») y puede ajustarlos después dentro del propio programa; las tres etapas (transición, ejecución acompañada, autonomía y resultados) se reparten según esos días.',
    ],
    notas: { rrhh: 'Pestaña **Plantillas por cargo**: actividades del plan para cada cargo.', admin: 'Pestaña **Plantillas por cargo**: actividades del plan para cada cargo.', general: 'Solo consulta.', visor: 'Solo consulta.' },
  },
  Directorio: {
    alias: ['Mi Tienda'],
    para: 'Lista del personal con buscador y filtros. Cada fila abre el **expediente** del trabajador: datos, ficha del formulario, documentos por fase, historial, evaluaciones, amonestaciones y trayectoria.',
    pasos: [
      'Busque por nombre o cédula, o filtre por tienda, cargo y estatus.',
      'Pulse el trabajador para abrir su expediente. Use las pestañas del expediente para ver cada tema.',
      'Desde el expediente: «Generar ficha en PDF», «Generar informe de trayectoria (PDF)» e «Iniciar desincorporación» (lleva a Reporte de egresos), según su perfil.',
    ],
    notas: {
      tienda: 'Se llama **Mi Tienda** y muestra solo su personal. Puede exportar a CSV.',
      rrhh: 'Corrige datos base con motivo (queda en la bitácora), marca aprendices INCES y asigna el supervisor inmediato del personal administrativo.',
      consulta: 'No ve la ficha personal (familia, dirección, tallas) ni exporta.',
      operaciones: 'Solo consulta, sin exportar.',
      visor: 'Solo consulta, sin exportar.',
    },
  },
  'Ingresos y egresos': {
    para: 'Movimiento de personal por período: comparativo, solo ingresos, solo egresos, por tienda, el detalle de cada uno y el análisis de egresos.',
    pasos: ['Elija el período en los filtros (incluye «Últimos 12 meses»).', 'Use las pestañas para cambiar de vista. **Exportar ingresos (CSV)** descarga el detalle.', '**Análisis de egresos:** marque una o varias variables (motivo, tipo de egreso, marca, tienda, formato de tienda, cargo, mes, trimestre, antigüedad al egresar, egreso temprano, tipo de contrato) y el sistema muestra la cantidad, el porcentaje, la antigüedad promedio y los egresos tempranos de cada combinación. Con dos variables aparece además una matriz cruzada. Hay combinaciones sugeridas (por ejemplo, Tienda × Motivo). «Exportar a Excel» descarga el análisis, la matriz y el detalle de los egresos.'],
    notas: { consulta: 'Sin exportación a Excel.', tienda: 'Muestra solo su tienda (sin la pestaña «Por tienda»).', rrhh: 'Además puede analizar los egresos por género y rango de edad.', general: 'Además puede analizar los egresos por género y rango de edad.', admin: 'Además puede analizar los egresos por género y rango de edad.' },
  },
  'Reporte de egresos': {
    para: 'Reportar la salida de un trabajador con su motivo y documento de soporte. Crea una solicitud de desincorporación que sigue la ruta de aprobación.',
    pasos: [
      'Elija el trabajador, la **fecha de egreso** y el **motivo**: renuncia voluntaria, término de contrato, despido justificado, abandono de trabajo, mutuo acuerdo u otro.',
      '**Renuncia voluntaria:** cargue la carta de renuncia (PDF, PNG o JPG, hasta 1,5 MB). Es obligatoria.',
      '**Abandono de trabajo:** indique el último día que se presentó y marque la declaración de que el trabajador **nunca regresó**. El sistema muestra los días sin asistir y avisa si son menos de 3.',
      'Pulse **Reportar egreso**. La solicitud pasa por Gerente de Marca → Gerente de Operaciones → (Gerente General si es Gerente de Tienda) → ejecución de RRHH. Al ejecutarse, el trabajador queda EGRESADO.',
      'En **Egresos reportados** se ve cada reporte con su estado, quién lo subió y el documento.',
    ],
    notas: {
      tienda: 'El Gerente o Subgerente es quien declara el abandono de trabajo de su personal.',
      rrhh: 'Además de reportar, ejecuta el último paso de la desincorporación en Solicitudes.',
    },
  },
  Solicitudes: {
    para: 'Traslados, promociones y desincorporaciones con aprobación por etapas. Desde «Nueva solicitud» también se inician evaluaciones, Nine-Box, apoyos y pernoctas.',
    pasos: [
      '**Nueva solicitud:** elija el trabajador y el tipo. Si no aplica (cargo, antigüedad, estatus, hito del contrato o rol), el sistema explica el motivo y no deja crearla.',
      '**Traslado y promoción:** ruta Gerente de Marca → Gerente de Operaciones → validación de RRHH → firma de Gerencia General. Al firmar Gerencia General, el sistema actualiza la tienda y/o el cargo del trabajador, registra el movimiento, abre el Programa de Formación de la promoción (X días fijados por RRHH) y crea la ruta habitual de traslado si cambia de tienda.',
      '**Promoción:** se crea el acceso del trabajador al portal de evaluación. El panel «Batería de pruebas» muestra el enlace, el usuario y la clave para enviarlos por WhatsApp o correo. Las aprobaciones quedan bloqueadas hasta completar la batería.',
      '**Desincorporación:** Gerente de Marca → Gerente de Operaciones → (Gerente General si es Gerente de Tienda) → ejecución de RRHH.',
      '**Avisos por correo:** quien debe aprobar una solicitud recibe un correo que indica que tiene una solicitud pendiente (solo el tipo de solicitud), y quien la creó recibe otro cuando fue aprobada o rechazada. Los correos no incluyen nombres ni motivos; los detalles se ven en el sistema.',
      '**Para decidir:** abra la solicitud desde «Pendientes de mi aprobación», revise el «Resumen para decidir» y pulse **Aprobar**, **Rechazar** o **Devolver** (con comentario). La devolución regresa la solicitud al creador para corregir y reenviar.',
    ],
    notas: {
      tienda: 'Crea solicitudes solo para su tienda. Pestañas: Pendientes de mi aprobación, Creadas por mí y Todas.',
      marca: 'Aprueba el paso de Gerente de Marca y crea solicitudes para su marca.',
      operaciones: 'Aprueba el paso de Gerente de Operaciones. No crea solicitudes.',
      rrhh: 'Valida traslados y promociones y ejecuta desincorporaciones. Solo puede crear **promociones**, y no aprueba las que crea: ese paso lo atiende el Administrador.',
      general: 'Firma traslados y promociones («Aprobar y firmar») y aprueba desincorporaciones de Gerentes de Tienda. No crea solicitudes.',
      visor: 'Solo consulta.',
      admin: 'Puede crear solicitudes y actuar en cualquier paso cuando sea necesario.',
    },
  },
  'Prueba y contratos': {
    para: 'Hitos del contrato por tiempo determinado con semáforo: período de prueba (días 15, 22 y 28), prosecución (70, 80 y 90) y pase a fijo (150, 170 y 180) en verde, amarillo y rojo.',
    pasos: [
      'En **Por atender**, pulse **Evaluar** en el trabajador: responda los ítems y elija el resultado.',
      '**Pase a fijo (solo personal de tienda, al terminar el segundo contrato):** se usa el formato oficial «Evaluación de colaboradores para contratos a tiempo indeterminado». Califique los 9 factores (Módulo 1: calidad, volumen y eficiencia, horario y disciplina; Módulo 2: trabajo en equipo, comunicación, iniciativa, resolución de problemas, compromiso e imagen) con E, MB, B, D o MD; escriba las fortalezas y las áreas por mejorar; y responda «Sí» o «No» a la recomendación del contrato a tiempo indeterminado. El formato en PDF lleva la firma del evaluador y la del trabajador. El personal administrativo no tiene esta evaluación.',
      'Si el puntaje no alcanza el mínimo y usted indica que sí superó el período, se requiere la autorización de Marca, Operaciones y RRHH (3 de 3): queda «Superado el período con limitaciones».',
      '**En aprobación** muestra las evaluaciones que siguen su ruta; **Historial**, las cerradas con su certificado.',
    ],
    notas: {
      tienda: 'Evalúa a su personal. Si un hito vence sin evaluación, la alerta llega también a Gerencia de Marca.',
      rrhh: 'Valida evaluaciones, activa las cartas de culminación y prorroga el período de prueba del personal administrativo.',
      general: 'Solo consulta.',
      visor: 'Solo consulta.',
    },
  },
  'Carga de amonestaciones': {
    para: 'Cargar la imagen (PNG/JPG) o el PDF de cada amonestación, hasta 1,5 MB. Queda en el expediente con «Subido por».',
    pasos: ['Elija el trabajador, el tipo (escrita o verbal documentada), la fecha y el motivo.', 'Adjunte el archivo y pulse **Guardar amonestación**.', 'En «Amonestaciones cargadas» puede descargarlas.'],
    notas: { rrhh: 'Puede **anular** una amonestación con motivo; queda registrado quién la anuló y cuándo.', admin: 'Puede **anular** una amonestación con motivo.', tienda: 'Solo para su tienda.' },
  },
  Evaluaciones: {
    para: 'Nine-Box con calibración para los cargos definidos por RRHH (gerentes, personal de tienda y administrativo) y pruebas del portal (IPV, Kostick, Indicador Lógico, IPC, DISC e Integridad) para traslados, promociones y candidatos a ingreso.',
    pasos: [
      '**Pendientes:** pulse **Evaluar** para hacer la Nine-Box de un trabajador elegible (desempeño y potencial, escala de 1 a 5). La caja se calcula sola.',
      '**Calibración Nine-Box:** los dos calibradores revisan la matriz 3 × 3; mover a alguien de caja exige justificación. La caja se cierra solo cuando ambos confirman y se genera el acta.',
      '**Feedback pendiente:** registre la retroalimentación al trabajador sobre la caja calibrada.',
      '**Feedback de evaluaciones de contrato:** si el colaborador supera el período de prueba (o lo supera con condiciones) se registran fortalezas, oportunidades de mejora y compromisos con plan de acción. Si no continúa en la empresa, por cualquier motivo, solo se registran «Notas» y se genera el informe final.',
      '**Prueba IPV, Kostick y Lógico / IPC, DISC e Integridad:** resultados, informes PDF y, para «Candidato a ingreso», generación del acceso al portal (para cualquier tienda u oficina y para cargos de tienda, administrativos o corporativos) (usuario: cédula; clave: primer apellido; en apellidos compuestos, completo y junto, p. ej. DELVALLE). El enlace que se envía siempre apunta a https://sgi-rrhh.vercel.app; en modo demostración (sin la nube) el acceso solo funciona en el mismo equipo y el panel lo advierte.',
      '**Trayectoria del trabajador:** línea de tiempo de todos los procesos del trabajador con su fecha real; botón «Generar informe de trayectoria (PDF)».',
    ],
    notas: {
      tienda: 'Evalúa a su personal. No tiene la pestaña de calibración.',
      marca: 'Calibra con Operaciones la Nine-Box de tiendas de su marca.',
      operaciones: 'Calibra con el Gerente de Marca la Nine-Box de tiendas de su marca.',
      rrhh: 'Valida Nine-Box, calibra la del personal administrativo con el supervisor inmediato, registra la entrevista de integridad (solo RRHH ve las respuestas del PIL), autoriza el «último intento» de una prueba y usa el panel «Validación del Indicador Lógico».',
      general: 'Firma la Nine-Box de Gerentes, Subgerentes y administrativos. Consulta resultados.',
    },
  },
  Formación: {
    para: 'Catálogo de formaciones, participación por trabajador y talleres. Alimenta el plan de sucesión y el expediente.',
    pasos: [
      '**Participaciones:** «Registrar participación» con la formación, fecha programada, realización, estatus y calificación. Los registros cerrados no se editan: use «Anotar corrección».',
      '**Indicadores de formación:** se ven en Indicadores de gestión › KPI por área (finalización, asistencia, horas por empleado, costo por participante, evolución de puntuación, NPS formativo, tiempo para alcanzar la competencia y retención a 90 días). Para que se calculen, cargue el costo total en el catálogo y, en cada participación, la nota previa y la satisfacción (opcionales).',
      '**Catálogo:** formaciones con tipo, modalidad, horas, costo total, facilitador, cargos, obligatoria y vigencia. Menos de 8 horas = Taller; 8 o más = Formación.',
      '**Talleres:** marque los asistentes con casillas o impórtelos desde Excel/CSV con una columna de cédulas. Con asistencia y horas se genera el certificado en PDF.',
    ],
    notas: {
      rrhh: 'Administra el catálogo, indica horas y calificación (0 a 20, mínima 10) de los talleres.',
      tienda: 'Registra participaciones y asistencia de su tienda.',
      marca: 'Consulta su marca.',
      operaciones: 'Consulta su marca.',
    },
  },
  'Plan de sucesión': {
    para: 'Cobertura de cargos clave (Gerente, Subgerente, Caja, Jefe de Almacén, Visual) con riesgo del titular, posiciones críticas y hasta 3 sucesores por posición con su nivel de preparación.',
    pasos: [
      '**Mapa de sucesión:** por tienda, titular, riesgo y sucesores (Listo ahora ≥ 80, 6 a 12 meses ≥ 65, 12 a 24 meses ≥ 50). Cada candidato muestra qué le falta.',
      '**Banco de talento** y **Evolución mensual** (foto automática cada mes).',
      '**Planes de desarrollo (PDI):** brechas, acciones, responsable y fecha. Las acciones de formación crean participaciones «Programadas».',
      '**Nominación:** el Gerente de Marca propone; RRHH aprueba (si el candidato es de otra marca, también Gerencia General). Al ejecutarse la promoción pasa a «Promovido».',
      '**Plan administrativo (confidencial):** el Administrador y el Gerente de RRHH registran los sucesores de cada cargo administrativo (sucesor, horizonte de preparación y fundamento) con **Proponer sucesor**, y los quitan con **Quitar**; no requiere aprobación. La Gerencia General y la Junta Directiva solo lo consultan. Cada cambio queda en la bitácora.',
    ],
    notas: {
      marca: 'Ve solo el plan de tiendas de su marca y propone sucesores. No ve el plan administrativo ni los parámetros.',
      rrhh: 'Aprueba nominaciones y edita **Tamaño de tiendas** y **Rutas y parámetros**. En el plan **Administrativo** propone y quita sucesores.',
      admin: 'En el plan **Administrativo** propone y quita sucesores.',
      general: 'Ve el plan de tienda y el **Administrativo** (solo consulta).',
      junta: 'Consulta el plan **Administrativo** (solo consulta).',
      operaciones: 'Consulta su marca.',
      visor: 'Consulta su marca.',
    },
  },
  'Clima laboral': {
    para: 'Encuestas de clima por ciclos, resultados y buzón de sugerencias de los colaboradores.',
    pasos: [
      '**Encuestas:** cree el ciclo (marca, fechas, preguntas; propuesta base de 22 en 8 dimensiones, más la pregunta de recomendación eNPS de 0 a 10, que puede quitar al crear el ciclo). Al **activarlo** se genera el enlace para copiar o compartir por WhatsApp.',
      'Los colaboradores responden con su cédula (una respuesta por ciclo). Los grupos con menos de 5 respuestas aparecen como «Reservado».',
      '**eNPS:** promotores (9–10), pasivos (7–8) y detractores (0–6); el resultado es el % de promotores menos el % de detractores (de −100 a +100) y se compara con el ciclo anterior. También es un KPI de «Indicadores de gestión».',
      '**Resultados:** % favorable, promedios, mapa de calor tienda × dimensión, comparación entre ciclos; informe en PDF y Excel.',
      '**Buzón de sugerencias:** campaña con enlace propio; cada idea se gestiona (Recibida, En revisión, Implementada, No viable).',
    ],
    notas: {},
  },
  'Información de tiendas': {
    para: 'Ubicación, metraje, tamaño y números de registro patronal de cada tienda.',
    pasos: ['Abra la tienda para ver o actualizar sus datos.', 'La ficha muestra la información fiscal de la empresa de la marca (razón social, RIF, domicilio fiscal, IVSS, INCES, FAOV y NIL): Representaciones Ulab 24, C.A. para Balú y Comercializadora Clock Work, C.A. para Planeta. Un dato propio de la tienda prevalece sobre el de la empresa.', '«Ficha en PDF» genera la ficha para trámites administrativos. «Exportar CSV» descarga la lista.'],
    notas: { tienda: 'Ve los datos legales y físicos de su tienda.', rrhh: 'Mantiene la información y el tamaño (grande/pequeña) de cada tienda.', admin: 'Mantiene la información y el tamaño de cada tienda.', consulta: 'Solo consulta, sin exportar.' },
  },
  'Apoyos de personal': {
    para: 'Personal que presta apoyo en otro cargo o tienda. Se registra por quincena (10 días trabajados + 4 de descanso) y requiere 2 de 3 aprobaciones (Marca, Operaciones, RRHH).',
    pasos: [
      '**Registrar apoyo:** trabajador, tienda y cargo donde apoya, motivo, días y monto. Un monto distinto del predeterminado exige justificación y pasa también por Gerencia General.',
      '**Apoyos de la quincena:** aprobar o rechazar los pendientes.',
      '**Reporte quincenal:** relación para nómina en PDF y CSV. **Indicadores:** resumen por tienda y motivo.',
    ],
    notas: {
      tienda: 'Registra los apoyos de su tienda.',
      admin: 'Puede registrar apoyos.',
      marca: 'Aprueba como Gerente de Marca.',
      operaciones: 'Aprueba como Gerente de Operaciones.',
      rrhh: 'Aprueba como RRHH y emite el reporte quincenal.',
      general: 'Aprueba los apoyos con monto distinto.',
      visor: 'Solo consulta.',
    },
  },
  'Montos y autorizaciones': {
    para: 'Define cómo se calcula el monto de lo que requiere autorización: la pernocta (por persona y por noche) y el apoyo de personal. Solo RRHH y el Administrador lo ven y lo cambian.',
    pasos: [
      '**Cómo se define el monto:** para cada concepto elija **Monto fijo (USD)**, **Porcentaje del salario integral**, **Porcentaje del salario base** o **En blanco**. Con «En blanco» no hay monto predeterminado: quien registra la solicitud escribe el monto y el sistema lo exige antes de enviarla.',
      '**Porcentaje:** en la pernocta se aplica al salario diario (mensual entre 30) de cada participante; en el apoyo, al salario mensual de quien presta el apoyo, repartido por quincena y por días de apoyo. Usa el **salario base en USD** registrado en «Remuneración del personal»; si la persona no tiene salario registrado, el monto queda **por definir**.',
      '**Salario integral:** salario base más las alícuotas de utilidades y de bono vacacional. Los **días de utilidades y de bono vacacional** se escriben en «Parámetros de cálculo» (confírmelos con Nómina).',
      '**Probar con un trabajador:** muestra cuánto resultaría con las reglas elegidas antes de guardar.',
      '**Guardar:** cada solicitud conserva la regla vigente cuando se registró; un cambio posterior no altera lo ya solicitado.',
    ],
    notas: { rrhh: 'Puede ver y cambiar los montos.', admin: 'Puede ver y cambiar los montos.' },
  },
  'Emitir amonestación': {
    para: 'Emite el documento de amonestación con el modelo del literal del **artículo 79 de la LOTTT** que describe los hechos. Quien emite solo escribe los hechos; el sistema redacta el documento y cita el literal.',
    pasos: [
      '**Emitir:** busque al trabajador, indique la fecha y el tipo (escrita o verbal con constancia), elija el **literal** (a–k) y describa los hechos. El literal «i» (falta grave a las obligaciones de la relación de trabajo) es el más usado en tienda.',
      '**Literales de especial gravedad** (a, b, h, j y k): el sistema muestra un aviso para consultar con RRHH y Asesoría Legal antes de emitir, porque pueden configurar causa justificada de despido.',
      '**Vista previa** muestra el documento con las firmas configuradas; **Registrar y generar documento** lo guarda en el expediente con su literal y los hechos.',
      '**Modelos por literal:** ejemplo de redacción y cuándo aplica cada literal. **Emitidas:** lista de las amonestaciones generadas.',
      'Quién firma lo define el Administrador en Configuración › Firmantes de amonestaciones. La redacción de los literales debe ser validada por Asesoría Legal contra la Gaceta Oficial antes del uso oficial.',
    ],
    notas: {},
  },
  Pernoctas: {
    para: 'Pernoctas de la tienda (inventario, montaje, mercancía, remodelación, etc.) con sus participantes y resultado. Requiere la aprobación de Gerencia de Marca, Operaciones y RRHH.',
    pasos: [
      '**Informar pernocta:** fecha, motivo, personas que pernoctaron y si se cumplió el objetivo (Sí, Parcialmente, No). El **motivo** se elige de una lista de categorías (inventario, montaje de temporada, mercancía, remodelación, apertura, layout, auditoría, reetiquetado, cambios de precio, etc.); si ninguna corresponde, elija **Otro** y escriba el motivo a mano.',
      '**Monto:** se calcula según lo definido en «Montos y autorizaciones» (fijo, porcentaje del salario o en blanco). Si está en blanco, el formulario pide el **monto por persona**.',
      '**Pernoctas:** seguimiento y aprobación. **Indicadores:** cantidad, personas, monto aprobado y pernoctas por motivo.',
      '**Categorías de motivo** (RRHH y Administrador): agregue, renombre, active o desactive las categorías y quite las que no se han usado; pulse **Guardar**. Cambiar un nombre no modifica las pernoctas ya registradas.',
    ],
    notas: { tienda: 'Informa las pernoctas de su tienda.', admin: 'Puede informar pernoctas y editar las categorías de motivo.', marca: 'Aprueba como Gerente de Marca.', operaciones: 'Aprueba como Gerente de Operaciones.', rrhh: 'Aprueba como RRHH y edita las categorías de motivo.', general: 'Solo consulta.', visor: 'Solo consulta.' },
  },
  'Incentivos de ventas': {
    para: 'Concursos, campañas y otros incentivos con tiendas en 1.er, 2.º y 3.er lugar. RRHH registra, Gerencia General aprueba y se emite el documento para Nómina. Participa la plantilla activa con más de 14 días de antigüedad.',
    pasos: [
      '**Registrar incentivo:** nombre, período, tiendas ganadoras y montos; «Registrar y enviar».',
      '**Por aprobar:** Gerencia General aprueba o rechaza.',
      '**Incentivos del mes** y **Relación de pago** para Nómina.',
    ],
    notas: { rrhh: 'Registra los incentivos.', admin: 'Puede registrar incentivos.', general: 'Aprueba o rechaza los incentivos.', marca: 'Consulta.', operaciones: 'Consulta.', visor: 'Consulta.' },
  },
  'Estructura administrativa': {
    para: 'Organigrama, cargos y compensación del personal administrativo de la División de Marcas Propias, con la batería de pruebas y la Nine-Box de cada familia de cargo. La ven RRHH, el Administrador y Gerencia General.',
    pasos: [
      '**Datos:** pulse «Cargar organigrama de Visio (.vsdx)». El archivo debe ser un dibujo de Visio con un recuadro por cargo (cargo y nombre de la persona, o la palabra «Vacante») unidos por conectores de arriba hacia abajo. Antes de guardar verá una vista previa con los cargos leídos, quién reporta a quién, el área de cada uno y los avisos (por ejemplo, recuadros sin conexión); si la primera línea del recuadro es el nombre y no el cargo, cámbielo en la lista. La información **queda solo en este navegador**: no se envía a la nube ni al repositorio. Para verla en otro equipo hay que cargar el archivo allí; «Quitar datos de este equipo» la elimina.',
      '**Volver a cargar el organigrama:** al cargar un dibujo nuevo se conservan la compensación y el perfil de cargo de las personas (o vacantes) que coinciden por nombre o cargo. Los montos de compensación se cargan con el archivo JSON opcional, que está al final de la pestaña «Datos».',
      '**Organigrama:** diagrama con un recuadro por cargo unido a su jefe (las vacantes van en trazo discontinuo), o lista por línea de reporte con el botón «Lista»; además, la plantilla por área. El área de cada cargo se ajusta en «Personal y cargos».',
      '**Personal y cargos:** lista filtrable por área, con el perfil de cargo vinculado a cada posición. RRHH y Gerencia General pueden cambiar el nombre del cargo (queda guardado el nombre anterior) y elegir su perfil de cargo.',
      '**Compensación:** componentes de cada cargo (salario base, cesta ticket, ayuda, efectivo, otras, bono especial), total por área, total mensual y anualizado. Los montos no cargados se avisan.',
      '**Distribución del gasto:** reparto entre Balú y Planeta con su criterio.',
      '**Pruebas y Nine-Box por cargo:** marque hasta 3 pruebas por familia de cargo y pulse «Guardar» (RRHH y Gerencia General). Cada familia tiene criterios de desempeño propios en la Nine-Box. Asigne el perfil de cargo y la familia de cada persona administrativa o pulse «Asignar según el organigrama» (usa el perfil vinculado a su posición).',
    ],
    notas: { admin: 'Puede ver la información; la edición de las pruebas corresponde a RRHH y Gerencia General.', general: 'Puede ver la información y editar las pruebas por familia de cargo.' },
  },
  'Remuneración del personal': {
    para: 'KPI con los que se mide a cada persona, su peso y su remuneración, con historial. RRHH, el Administrador, la Gerencia General y la Junta Directiva ven y registran todo; los Gerentes de Operaciones, de Marca y de Tienda ven solo a su personal a cargo (según el jefe directo indicado en cada registro).',
    pasos: [
      '**Lista:** muestra la remuneración vigente de cada persona (salario base, total mensual y cantidad de KPI). Filtre por marca o busque por nombre o cédula; pulse una fila para abrir su ficha en la pestaña «KPI y remuneración».',
      '**Registrar un cambio (ficha del trabajador):** pestaña «KPI y remuneración» › «Registrar cambio». Indique desde cuándo rige, moneda, salario base, bono variable máximo, otros y el jefe directo; marque los KPI del cargo (sugeridos según la guía de KPI) o agregue uno propio, y asigne el peso de cada uno: deben sumar 100 %.',
      '**Historial:** cada cambio es un registro nuevo; los anteriores se conservan. Un error se corrige con «Anular» (queda marcado con su motivo) y un registro nuevo.',
      '**Importar desde Excel:** «Plantilla Excel» descarga el archivo con las hojas Carga, Ejemplo, Instrucciones y KPI por cargo. Llene la hoja Carga (una fila por persona y por cambio, con hasta 6 KPI y sus pesos), pulse «Importar Excel», revise la vista previa y confirme. Solo se cargan las filas válidas y cada una crea un registro nuevo.',
      '**Exportar Excel:** descarga las remuneraciones vigentes y el historial que su perfil puede ver.',
      '**Modelos y salarios (Excel):** un solo libro con el tipo de cada modelo de compensación (fijo, variable, bono o beneficio), sus componentes, la comisión por cargo y por vendedor, los KPI de retail, la ayuda mensual, el tren gerencial, los modelos asignados a cada tienda y los salarios vigentes e historial que su perfil puede ver. Queda anotado en la trazabilidad. Es confidencial.',
    ],
    notas: { rrhh: 'Registra, importa y anula.', admin: 'Registra, importa y anula.', general: 'Registra, importa y anula; ve toda la organización.', junta: 'Registra, importa y anula; ve toda la organización.', operaciones: 'Solo consulta a su personal a cargo, dentro de su marca.', marca: 'Solo consulta a su personal a cargo, dentro de su marca.', tienda: 'Solo consulta a su personal a cargo, dentro de su tienda.' },
  },
  'Modelos de compensación': {
    para: 'Estructura de compensación vigente en cada tienda: KPI con los que se mide a las personas según el tipo de tienda, método de cálculo, comisión por cargo y por vendedor, y ayuda mensual. La ven la Gerencia de Marca, Operaciones, Gerencia General, RRHH, el Administrador y la Dirección Ejecutiva; solo RRHH y Gerencia General la modifican. El Gerente de Tienda no ve este módulo.',
    pasos: [
      '**Por tienda:** modelo vigente de cada tienda. **Modelos:** detalle de cada modelo; «Nuevo modelo» para crear uno.',
      '**Importar esquema (Excel):** RRHH y Gerencia General cargan el libro «Esquema de comisiones y estructura de pago». El sistema propone un modelo de estructura de pago por marca (sueldo y tickets por cargo, ayuda mensual y tren gerencial de cada tienda según su categoría AAA, A o B, con la marca «mixto») y un modelo de comisión por cada grupo de tiendas (porcentaje base y metas por cargo). En la vista previa indique si las cifras están en USD o en bolívares, elija la tienda que corresponde a las ubicaciones que no se reconocen y revise los avisos (por ejemplo, dos porcentajes para el mismo cargo). Los modelos se guardan como **borrador**; al volver a importar se reemplazan los del mismo nombre. La hoja nominal con cédulas no se carga.',
      '**Exportar a Excel:** descarga un libro con el tipo de cada modelo, componentes, comisión por cargo y por vendedor, KPI, ayuda mensual, tren gerencial y modelos por tienda, más los salarios que su perfil puede ver.',
      '**KPI según el tipo de tienda:** elija el tipo de tienda y marque uno o varios KPI (venta total, venta por vendedor, venta con pool, metas, tickets, ticket promedio, UPT, conversión). Para cada KPI indique cómo se calcula, cuántos meses de referencia se toman, si la referencia es promedio, mediana o total, y el repositorio de donde se toma. «Agregar otra variable» deja un espacio libre para cualquier otra.',
      '**Método de cálculo:** marque «Método 5%/95%» (empleados nuevos) y/o «100% de impacto de la comisión» (quienes ingresaron antes de la fecha de corte, inicialmente 1 de julio de 2026).',
      '**Indicadores de la comisión:** marque los que describen la comisión (venta, meta, tickets, UPT, unidades totales vendidas, productos especiales vendidos por promoción vendida, etc.). El botón «Canon de referencia» toma como base los meses anteriores: usted escribe cuántos meses y si se usa promedio, mediana o total.',
      '**Comisión:** marque la forma de describirla y escriba la descripción; indique el porcentaje de venta y el porcentaje con pool de venta de cada cargo, la ayuda mensual por cargo (se carga a mano) y la comisión por vendedor. Cada vendedor muestra el método que le corresponde según su fecha de ingreso.',
      '**Moneda de cada componente:** marque «El componente es en USD» e indique el monto y la tasa (BCV, Binance, Interna o Euro); si tiene pago en Bs, marque la casilla e indique qué ítem se paga en Bs.',
      '**Período de corte de la comisión:** indique desde qué día hasta qué día (de cada mes, quincena o semana) o describa un período personalizado.',
      '**Comisión por vendedor:** elija el tipo de comisión y el indicador; puede combinar varios.',
      '**Modelo oficial:** marque «Datos cargados: tomar este modelo como el oficial» cuando termine de cargar los datos.',
      '**Hasta 4 modelos por tienda** y **ficha por tienda:** en «Por tienda» asigne más de un modelo y pulse «Ficha» para ver y descargar la ficha confidencial (no se muestra al Gerente de Tienda).',
      '**Asignar a una tienda:** en «Por tienda», RRHH y Gerencia General eligen el modelo de cada tienda; la columna «KPI de retail» muestra con qué se mide.',
      '**Cargos a los que aplica:** cada componente se marca con casillas (sin marcar = todos los cargos).',
      '**Bono de tren gerencial:** por cada tienda del modelo, marque si el gerente y/o el subgerente lo reciben e indique si se paga en Bs o en divisas y el monto en USD de cada uno. Lo ve la Gerencia de Marca y los niveles superiores.',
    ],
    notas: { rrhh: 'Crea y modifica los modelos.', general: 'Crea y modifica los modelos.', marca: 'Solo consulta; ve también la ayuda mensual.', operaciones: 'Solo consulta; ve también la ayuda mensual.', admin: 'Solo consulta.', visor: 'Solo consulta, de su marca.' },
  },
  'Sincronización de datos': {
    para: 'Fichas del formulario de actualización de datos y altas con la fecha de ingreso de BI. Se cruzan por cédula. No se cargan datos bancarios.',
    pasos: [
      '**Cargar formulario:** descargue una copia del Excel «Jornada de Actualización de datos» y cárguelo; revise la vista previa y pulse «Sincronizar fichas». Si una cédula tiene varios registros, gana el más reciente (fecha y hora).',
      '**Recepción automática** (sitio publicado): genera la clave de integración para Power Automate, cuenta lo recibido y permite **revisar y aplicar**.',
      '**Cargar fechas de ingreso (BI):** Excel o CSV con Cédula y Fecha de ingreso (opcional Cargo, Tienda, Marca) para crear los expedientes.',
      '**Estado de las fichas:** quién falta, «Dar de alta» a mano y, solo RRHH, «Exportar datos precargados (Excel)».',
      '**Entrevistas de salida:** cargue el Excel de la encuesta de salida; volver a cargarlo no duplica y actualiza lo ya cargado. De la pregunta «¿Qué probabilidades hay de que nos recomiende…?» (0 a 10) se calcula el eNPS de salida, que se ve en el informe de egresos y en Indicadores de gestión.',
      '**Repositorios de datos:** hasta 30 repositorios de información, con su enlace y los módulos que los usan («Agregar repositorio» para sumar uno).',
    ],
    notas: { rrhh: 'Decide qué registro conservar cuando una cédula tiene varios. Es el único perfil que ve discapacidad y CONAPDIS.' },
  },
  Trazabilidad: {
    para: 'Quién aprobó, rechazó, devolvió o ejecutó cada paso de cada flujo, y registro de todo lo que se hace en el sistema.',
    pasos: [
      '**Aprobaciones por flujo:** una fila por acción (traslado, promoción, desincorporación, evaluaciones de contrato, Nine-Box, apoyos, pernoctas, incentivos) con responsable, cargo, ubicación, paso, acción, fecha, comentario y estado. Incluye las decisiones pendientes y quién debe tomarlas.',
      'Filtre por flujo, responsable, acción, estado y fechas. **Exportar a CSV** descarga lo filtrado.',
      '**Bitácora general:** todas las acciones del sistema, con filtros y exportación.',
    ],
    notas: {},
  },
  'Usuarios y accesos': {
    para: 'Alta, desactivación y restablecimiento de contraseña de los usuarios. El rol define lo que cada persona ve.',
    pasos: [
      '**Nuevo usuario:** nombre, correo, rol y, según el rol, marca o tienda. El sistema genera una contraseña temporal para entregar; al primer ingreso la persona crea la suya.',
      '**Clave:** restablece la contraseña de un usuario (genera una temporal nueva).',
      '**Un usuario no se reutiliza:** el nombre, rol, marca y tienda de un usuario existente no se cambian. Si la persona deja el cargo, cree un usuario nuevo y desactive el anterior. Las cuentas «Pendiente de activación» sí se asignan la primera vez.',
    ],
    notas: {},
  },
  'Perfiles de cargo': {
    para: 'Perfil completo de cada cargo: descripción de cargo (objetivo, funciones por proceso, competencias y perfil requerido), exámenes del portal y condiciones de evaluación. Hay dos pestañas: cargos de tienda (Balú y Planeta Sports, cada marca con su descripción) y cargos administrativos y corporativos.',
    pasos: [
      '**Cargos administrativos y corporativos:** elija la marca y el cargo. Cada perfil trae sus competencias con lo que se espera en cada nivel (diccionario de competencias), los requisitos, las pruebas del portal y los criterios de la Nine-Box. RRHH y Gerencia General pulsan **Editar perfil** para cambiar cualquier campo, las pruebas (máximo 3) y los criterios; **Restablecer al documento** vuelve al texto original.',
      'Cargos de tienda: elija la marca, el **cargo** y el **tamaño de la tienda** (cambia a quién reporta: en tiendas pequeñas el cajero y el almacenista reportan al Subgerente).',
      'Revise las secciones: funciones, competencias con su nivel requerido (1 a 5), perfil, exámenes con su peso en el ajuste al cargo, onboarding y condiciones de evaluación.',
      '**Ver documento** abre el perfil en PDF con el logo y la razón social de la marca.',
    ],
    notas: { consulta: 'Puede leer el documento en pantalla, sin descargarlo.', tienda: 'Al entrar se muestra la línea de reporte según el tamaño de su tienda.' },
  },
  'Políticas': {
    para: 'Políticas de los procesos de RRHH por subsistema (reclutamiento, administración de personal, contratación, desempeño, formación, desarrollo, operación de tiendas, compensación y sistema), con el logo y la razón social de la marca.',
    pasos: [
      'Elija la política en la lista de la izquierda, agrupada por subsistema.',
      '**Ver documento** abre la política en PDF; **Todas las políticas** genera el compendio completo.',
    ],
    notas: { consulta: 'Puede leerlas en pantalla, sin descargarlas.', admin: 'Elige la marca (Balú o Planeta) con la que se emite el documento.', rrhh: 'Elige la marca (Balú o Planeta) con la que se emite el documento.', general: 'Elige la marca (Balú o Planeta) con la que se emite el documento.' },
  },
  'Manual de uso': {
    para: 'Este mismo manual, dentro del sistema. Cada perfil ve solo el suyo, actualizado a la versión vigente.',
    pasos: [
      'Abra **Ayuda › Manual de uso** en el menú.',
      'Use **Ir a la sección** para saltar a un módulo, o el buscador para encontrar una palabra.',
      '**Descargar PDF** guarda una copia del manual de su perfil.',
      '**Olvidé mi contraseña:** en la pantalla de acceso pulse «¿Olvidó su contraseña?», indique su correo, responda sus tres preguntas de seguridad y cree una contraseña nueva. Tras 5 intentos fallidos se bloquea 30 minutos. Defina o cambie sus preguntas con el botón «Preguntas de seguridad» de la barra superior. Si no las configuró, pida al Administrador que restablezca su contraseña.',
      '**Descargar la aplicación (Gerencia de Marca, Operaciones, RRHH y Gerencia General):** en esta misma sección aparece el cuadro «Descargar la aplicación en el teléfono». Pulse «Instalar la aplicación» o siga las instrucciones (Android: menú ⋮ › «Instalar aplicación»; iPhone: Compartir › «Agregar a pantalla de inicio»). Queda un ícono «SGI RRHH» que abre el sistema a pantalla completa y se actualiza solo con cada versión. Requiere conexión para trabajar.',
    ],
    notas: { consulta: 'Puede leerlo en pantalla; la descarga en PDF no está disponible para este perfil.' },
  },
  Configuración: {
    para: 'Parámetros, plantillas, catálogos y bitácora del sistema.',
    pasos: [
      '**Parámetros:** días de alertas, vigencia de accesos, umbrales, recordatorios.',
      '**Empresas:** razón social, RIF y domicilio fiscal de cada marca; empresas del grupo.',
      '**Plantillas:** textos del kit legal y cartas. **Tiendas** y **Cargos:** catálogos.',
      '**Plantilla de HC** (solo Administrador): edita la plantilla aprobada ordinaria y la de temporada. Un **aumento del HC necesario** (incremento de plantilla) lo decide el Gerente o el Director de Operaciones: el sistema pide su autorización y deja constancia de quién la dio.',
      '**Empresas** (solo Administrador): además de la razón social y el RIF, se registra el **representante legal** de cada empresa (nombre, cédula, nacionalidad, cargo e inscripción en el Registro Mercantil). Ese dato alimenta la notificación de riesgos y, si se elige, la firma de las amonestaciones.',
      '**Firmantes de amonestaciones** (solo Administrador): define quién firma el documento de amonestación (quien amonesta, el Gerente de RRHH, el representante legal y el trabajador) con su título, nombre y cargo; hasta 5 firmantes. «Restablecer valores» vuelve a la configuración inicial.',
      'Los **montos de pernocta y apoyo** se definen en el módulo **Montos y autorizaciones** (RRHH y Administrador).',
      '**Pruebas (Forms):** enlaces de las pruebas de conocimiento por cargo.',
      '**Bitácora** y **Datos** (respaldo y restauración).',
    ],
    notas: {},
  },
};

/* Manuales para personas que no entran con usuario del sistema */
const EXTERNOS = [
  {
    archivo: 'portal-evaluacion',
    titulo: 'Trabajador o candidato — Portal de evaluación',
    secciones: [
      { titulo: 'Para qué sirve', texto: ['Presentar las pruebas de una promoción o de un ingreso: IPV, Inventario Kostick, Indicador Lógico I, Personalidad comercial (IPC), Integridad laboral (PIL) y, si RRHH la asigna, el DISC (prueba de desarrollo).'] },
      { titulo: 'Cómo entrar', texto: [
        'Abra el enlace que le enviaron (termina en **#evaluacion**) o entre a https://sgi-rrhh.vercel.app y pulse **Ir al portal**.',
        '**Usuario:** su cédula, solo números. **Clave:** su primer apellido, sin acentos (no importa si usa mayúsculas). Si el apellido es compuesto (De Abreu, Del Valle, De La Cruz, San Martín), escríbalo completo y junto: **DEABREU**, **DELVALLE**, **DELACRUZ**, **SANMARTIN**. Si no sirve, pida a RRHH que le confirme la clave exacta.',
        'El acceso vence a los 15 días o al cerrarse la solicitud. Tras 5 intentos fallidos se bloquea 15 minutos.',
      ] },
      { titulo: 'Cómo presentar cada prueba', texto: [
        'Lea la introducción: explica para qué sirve la prueba, cuánto dura y que no hay respuestas buenas o malas (salvo el Indicador Lógico, que mide razonamiento).',
        'Una pregunta por pantalla; cada respuesta se guarda sola. Si se corta la luz o la conexión, vuelva a entrar y continúe.',
        'Tiempos por intento: IPV 40 min, Kostick 40 min, Indicador Lógico 25 min, IPC 20 min, Integridad 15 min, DISC 20 min. Hay **2 intentos**; si no termina, RRHH puede autorizar un último intento definitivo.',
        'Al final revise y pulse **Enviar**. Una vez enviada, la prueba no se reabre y usted no ve el resultado: lo revisa su supervisor y RRHH.',
        'En la Integridad laboral debe marcar «He leído y acepto» antes de comenzar; sus respuestas solo las ve RRHH.',
      ] },
    ],
  },
  {
    archivo: 'encuesta-clima-y-buzon',
    titulo: 'Colaborador — Encuesta de clima y buzón de sugerencias',
    secciones: [
      { titulo: 'Encuesta de clima laboral', texto: [
        'Abra el enlace que le compartió RRHH (termina en **#clima=…**).',
        'Escriba su **cédula** (solo personal activo). Responda cada afirmación de 1 a 5 y, si desea, deje un comentario.',
        'Solo se acepta una respuesta por persona y ciclo. Los resultados se muestran agrupados; los grupos de menos de 5 personas no se publican y los comentarios se leen sin nombre.',
      ] },
      { titulo: 'Buzón de sugerencias', texto: [
        'Abra el enlace de la campaña, escriba su cédula y registre hasta 5 ideas con su tema y el beneficio esperado.',
        'RRHH revisa cada idea y le asigna un estado: Recibida, En revisión, Implementada o No viable.',
      ] },
    ],
  },
];

module.exports = { PERFILES, GENERAL, MODULOS, EXTERNOS };
