Trabaja sobre el Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta), usando la estructura que ya existe: grupo Desarrollo › Plan de sucesión y carrera (pestaña Tienda), grupo Formación, módulo Evaluaciones y expediente del trabajador. Alcance de esta entrega: personal de tiendas de **Balú**. El plan administrativo y Planeta quedan para después, con la misma estructura.

Reglas generales:
- Usa solo datos que ya existen en el sistema. No inventes trabajadores, resultados ni fechas.
- Todo parámetro que te indico como «propuesta» debe quedar editable en Configuración. Antes de fijar cualquier criterio que no esté definido aquí, pregúntame.
- Respeta las reglas de visibilidad vigentes: Gerente de Tienda solo su tienda; Marca y Operaciones solo su marca; RRHH, Gerencia General y Administrador ambas marcas. Consulta RRHH solo ve estatus.
- **Acceso al grupo Desarrollo:**
  - **Gerente de Marca:** acceso limitado. Ve solo el Plan de sucesión de tiendas de su marca, propone sucesores y registra el plan de desarrollo de sus candidatos. No ve el plan administrativo ni modifica la configuración (rutas, pesos, cortes).
  - **Gerente de Tienda y Consulta RRHH:** no tienen acceso al grupo Desarrollo.
  - **Gerente de Tienda:** sí ve la trayectoria de su personal (punto 3) y registra formaciones de su tienda (punto 1).
- Prepara las tablas nuevas de Supabase con RLS por marca y tienda en un archivo de migración. Muéstrame el resumen y espera mi confirmación antes de aplicarla.
- Revisa la ortografía de todos los textos nuevos.

## 1. Formación (registro que alimenta el plan y el expediente)

**Catálogo de formaciones** (RRHH lo administra), con estos campos:
- Nombre.
- Tipo: inducción, técnica del cargo, liderazgo, normativa o seguridad (LOPCYMAT) u otra.
- Modalidad, horas y facilitador.
- Cargos o rutas de carrera a las que aplica.
- Obligatoria (sí/no) y vigencia en meses (si caduca).

**Registro de participación por trabajador**, con estos campos:
- Formación y fecha programada.
- Fecha de realización.
- Estatus: Programada, En curso, Completada, No asistió o Vencida.
- Calificación (0 a 20 o Aprobado/No aprobado, según la formación) y evidencia (archivo opcional).
- Quién registró y fecha de registro.

**Reglas:**
- El estatus Vencida se marca solo cuando pasa la fecha programada sin realizarse, o cuando caduca la vigencia.
- Los temas del onboarding ya completados cuentan como formación de inducción.
- Pueden registrar participaciones RRHH y el Gerente de Tienda (solo su tienda). Marca y Operaciones consultan su marca.

## 2. Plan de sucesión de tiendas Balú

**2.1 Cargo de caja según el tamaño de la tienda.** Cajero Principal y Cajero ocupan la misma posición; la denominación depende del tamaño de la tienda:
- **Tiendas grandes:** el cargo de caja se denomina Cajero Principal.
- **Tiendas pequeñas:** el cargo de caja se denomina Cajero.
- **No es un ascenso:** pasar de Cajero a Cajero Principal es un cambio de tienda, no una promoción. No crees una ruta entre ambos.
- **Tamaño de la tienda:** agrega el campo «Tamaño: grande / pequeña» en Información de tiendas, editable por RRHH y el Administrador. Propón el valor inicial según la plantilla actual: si la tienda tiene Cajero Principal, grande; si tiene Cajero, pequeña. Muéstrame la lista de las 19 tiendas Balú con el tamaño propuesto antes de guardarla. Si una tienda no tiene ninguno de los dos cargos, pregúntame.
- **Mapa y sucesión:** el mapa muestra una sola posición «Caja» con la denominación que corresponde a cada tienda. Un candidato de caja de una tienda pequeña puede ser sucesor en una tienda grande (y al revés) como movimiento lateral.

**2.2 Rutas de carrera** (tabla editable en Configuración, con origen → destino). Propuesta inicial:
- Asesor de Ventas → Cajero Principal o Cajero (según el tamaño de la tienda), Depositario o Visual Merchandiser
- Depositario → Jefe de Almacén
- Cajero Principal, Cajero, Jefe de Almacén o Visual Merchandiser → Subgerente
- Subgerente → Gerente de Tienda
- Auxiliar de Seguridad: fuera de ruta, salvo que RRHH lo agregue.

Cada ruta define:
- Antigüedad mínima en el cargo actual. Propuesta: 6 meses en rutas operativas y 12 meses de Subgerente a Gerente de Tienda.
- Formaciones obligatorias del catálogo.
- Pruebas que aplican: IPV, Kostick o Indicador Lógico, según la configuración actual del portal.
- Un campo «Requisitos según descripción de cargo» marcado como **Pendiente**. Las descripciones de cargo aún no están cargadas: mientras sigan pendientes, el criterio no entra al cálculo y el resto se reescala a 100 %. Muestra el aviso «Descripción de cargo pendiente».

**2.3 Puntaje de preparación (0 a 100) por candidato y ruta.** Reutiliza la lógica de ponderación existente (ponderacion.js) y los resultados ya calculados. Componentes y pesos propuestos:
- **Evaluación de desempeño vigente (35 %):** Nine-Box para Subgerente y Gerente de Tienda (promedio de desempeño y potencial sobre 5). Para los demás cargos, el último resultado de evaluación de contrato o desempeño. Solo cuenta si tiene 12 meses o menos y está aprobado.
- **Pruebas del portal y constancia de match (25 %),** cuando la ruta las exige.
- **Formación (20 %):** porcentaje de formaciones obligatorias de la ruta completadas y vigentes.
- **Conducta (10 %):** misma regla del componente Conducta de la constancia de match.
- **Antigüedad en el cargo frente al mínimo de la ruta (10 %):** tope 100 %.
- **Requisitos de la descripción de cargo:** pendiente, sin peso hasta que se carguen.

**Condiciones obligatorias.** Si alguna no se cumple, el candidato no puede quedar «Listo ahora»:
- Contrato fijo (pase a fijo superado).
- Sin plan de mejora abierto.
- Sin amonestación en los últimos 6 meses (propuesta).

**Nivel de preparación (propuesta):**

| Nivel | Color | Condición |
|---|---|---|
| Listo ahora | verde | 80 o más, con todas las condiciones obligatorias |
| Listo en 6 a 12 meses | amarillo | 65 a 79 |
| Listo en 12 a 24 meses | naranja | 50 a 64 |
| En desarrollo | gris | menos de 50 |

En cada candidato muestra qué le falta (por ejemplo, «2 formaciones obligatorias», «Nine-Box vencida», «antigüedad: faltan 3 meses»).

**2.4 Mapa de sucesión** (pestaña Tienda). Por tienda Balú, con los nombres de tienda precedidos por la marca:
- **Posiciones clave:** Gerente de Tienda, Subgerente, Caja (Cajero Principal o Cajero, según el tamaño), Jefe de Almacén y Visual Merchandiser. Cada una muestra al titular con su riesgo y hasta 3 sucesores ordenados por puntaje, con el color de su nivel.
- **Riesgo del titular:**
  - Alto: egreso registrado o en proceso, plan de mejora o Nine-Box caja 1 o 4.
  - Medio: contrato a tiempo determinado o menos de 6 meses en el cargo.
  - Bajo: el resto.
- **Posición crítica:** titular de riesgo alto y sin sucesor «Listo ahora».
- **Candidatos sugeridos:** el sistema los calcula a partir de las rutas, incluso desde otra tienda de Balú (marca la tienda de origen).
- **Nominación formal:** el Gerente de Marca propone (solo tiendas de su marca) y RRHH aprueba. Si el candidato viene de otra marca, se requiere además la aprobación de Gerencia General. Mientras no se apruebe, el candidato aparece como «Sugerido». Cada paso queda con fecha, usuario y comentario.

**Indicadores de cabecera** (por tienda y consolidado Balú), con la fórmula visible al pasar el cursor:
- Cobertura: posiciones clave con al menos un sucesor «Listo ahora».
- Banco de talento: candidatos por nivel.
- Posiciones críticas.
- Personal con plan de desarrollo.

**2.5 Actualización automática del mapa.** Recalcula el puntaje, el nivel y el riesgo cada vez que ocurra cualquiera de estos eventos:
- Se aprueba una evaluación (Nine-Box, período de prueba, prosecución o pase a fijo).
- Se completa una prueba del portal o se emite una constancia de match.
- Se registra o vence una formación.
- Se registra una amonestación.
- Se ejecuta un traslado, una promoción o una desincorporación.
- Se registra un egreso o cambia el estatus de contrato.

Además:
- **Promoción ejecutada:** el sucesor pasa a titular de la nueva posición, su nominación se cierra como «Promovido» y la vacante se reasigna en el mapa.
- **Foto mensual:** el primer día de cada mes, guarda el mapa de cada tienda (cobertura, críticos y niveles) con su fecha. Agrega un gráfico de evolución para ver el avance mes a mes. Las fotos no se modifican.

**2.6 Plan de desarrollo individual (PDI) por sucesor nominado** (lo registra el Gerente de Marca o RRHH):
- Brechas detectadas (lo que le falta).
- Acciones: formación del catálogo, mentoría, rotación o asignación especial.
- Responsable, fecha compromiso y estatus de cada acción.
- Las acciones de formación se crean como participaciones «Programadas» en el módulo Formación.

## 3. Informe de trayectoria del trabajador (módulo Evaluaciones y expediente)

**3.1** En Evaluaciones agrega la vista «Trayectoria del trabajador»: buscador por trabajador y filtros por tienda, cargo y período. En el expediente agrega la pestaña «Trayectoria».

**3.2** Muestra una línea de tiempo cronológica de todos los procesos del trabajador:
- Ingreso, período de prueba, prosecución y pase a fijo.
- Evaluaciones Nine-Box y sus retroalimentaciones.
- Pruebas IPV, Kostick e Indicador Lógico, y constancias de match.
- Onboarding y formaciones.
- Traslados, promociones y desincorporación.
- Amonestaciones y estatus en el plan de sucesión.

**3.3** Cada línea incluye:
- Fecha del evento.
- Proceso.
- Resultado o calificación (puntaje, caja, nivel o nota).
- Estatus: Pendiente, En curso, Aprobado, Superado, Superado con limitaciones, En plan de mejora, Rechazado, Vencido o Completado.
- Responsable o evaluador.
- Enlace al documento.

Encima de la línea de tiempo va un resumen: cargo y tienda actual, antigüedad, última evaluación, formaciones completadas frente a obligatorias, nivel de preparación y procesos pendientes.

**3.4 Las fechas forman parte del expediente y no se alteran:**
- Usa siempre la fecha real de cada proceso (evaluación, aprobación, realización de la formación), nunca la fecha de carga. Si un dato histórico se carga después, exige la fecha del evento y guarda aparte la fecha de registro.
- Los registros cerrados no se editan ni se borran. Una corrección se hace con una anotación con motivo, usuario y fecha, que queda en la bitácora y en la trayectoria.
- Ordena por fecha del evento. A igual fecha, por hora de registro.

**3.5** Botón «Generar informe de trayectoria (PDF)»:
- Logo de la marca del trabajador y razón social de la marca.
- Fecha y hora de emisión, y usuario que lo emitió.
- Se guarda en el expediente, fase Evaluación, como documento nuevo con su fecha. Cada emisión es una versión nueva y nunca reemplaza a la anterior.
- Consulta RRHH solo ve el resumen de estatus (sin calificaciones) y no descarga el PDF, según su regla actual.

## 4. Informes y archivos planos

- Informe global: agrega el bloque «Sucesión y formación» con cobertura, posiciones críticas, banco de talento y cumplimiento de formación obligatoria, por tienda y consolidado Balú.
- Informes en Excel:
  - Hojas nuevas: «Plan de sucesión» (una fila por candidato y ruta), «Formación» (una fila por participación) y «Trayectoria» (una fila por evento, con fecha del evento y fecha de registro en columnas separadas, y mes en letras y año aparte).
  - En «Histórico de actividad por trabajador», el campo «Considerado en plan de sucesión» pasa a tomar el valor real (Sí si tiene nominación aprobada).
  - Nombres y cédulas solo para RRHH, como en las demás hojas.

## 5. Datos de prueba y verificación

- Usa la persona de prueba existente (Josselyn Tovar) para mostrar un caso completo: dos formaciones, una evaluación, una nominación y el informe de trayectoria. Ese registro no suma en los indicadores.
- Verifica:
  - Que el Gerente de Tienda no vea el grupo Desarrollo y solo vea la trayectoria de su personal, ni en pantalla ni consultando la base de datos.
  - Que el Gerente de Marca solo vea y proponga candidatos de su marca, y no vea el plan administrativo ni la configuración.
  - Que al aprobar una evaluación o completar una formación el mapa cambie solo.
  - Que el PDF conserve las fechas originales.
- Al terminar, actualiza LEEME-paquete.md con una sección nueva que explique el módulo, los parámetros propuestos y lo que queda pendiente: descripciones de cargo, plan administrativo y Planeta.
