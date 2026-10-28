Agrega el **Inventario de Personalidad Comercial (IPC)** al portal de evaluación y al módulo Evaluaciones del Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta), con el mismo tratamiento que el DISC.

Te adjunto el módulo `ipc.js`. Contiene:
- el cuadernillo de 54 afirmaciones;
- la clave y la corrección;
- los textos por escala;
- los riesgos bajo presión;
- el índice de potencial comercial;
- el perfil deseado por cargo.

Úsalo como fuente única de la lógica y no lo modifiques. El IPC es un instrumento propio basado en los cinco grandes factores de la personalidad. No es Hogan: no uses ese nombre en ninguna pantalla ni documento.

Reglas generales:
- Reutiliza los componentes existentes de IPV, Kostick, Lógico, DISC e Integridad: acceso al portal, intentos, introducción, guardado automático, informe PDF y batería de pruebas.
- Todo lo indicado como «propuesta» queda editable en Configuración. Antes de fijar cualquier criterio que no esté aquí, pregúntame.
- Respeta las reglas de visibilidad vigentes y revisa la ortografía de todos los textos nuevos.
- Si necesitas tablas o columnas nuevas en Supabase, prepara la migración con RLS, muéstrame el resumen y espera mi confirmación antes de aplicarla.

## 1. Cuándo se aplica (propuesta)
- **Promociones:** forma parte de la batería cuando el cargo destino es Asesor de Ventas, Cajero, Cajero Principal, Depositario, Jefe de Almacén, Visual Merchandiser, Subgerente o Gerente de Tienda.
- **Ingresos:** se asigna al candidato a ingreso con el mismo acceso de candidatos (usuario: cédula; clave: primer apellido).
- **Configuración:** los cargos que lo presentan se editan en Evaluaciones › Pruebas, igual que las demás pruebas.

## 2. Presentación en el portal
- **Introducción:** muestra `IPC_INSTRUCCIONES` y aclara que el resultado describe la forma de ser en el trabajo y no mide capacidad ni inteligencia.
- **Preguntas:**
  - Una afirmación por pantalla, en el orden del cuadernillo, con cinco botones (`IPC_ESCALA_RESPUESTA`).
  - Barra «Afirmación X de 54» y guardado automático.
  - Las afirmaciones de atención se muestran como cualquier otra.
- **Tiempo e intentos:** 20 minutos por intento (propuesta). Mismas reglas de intentos que las demás pruebas: 2 intentos y un último intento autorizado por RRHH.
- **Envío:**
  - Pantalla de revisión al final. Solo se puede enviar si `validarRespuestasIPC()` es válida.
  - Una vez enviada, la prueba no se reabre y la persona no ve su resultado.
- **Lo que no se muestra:** los nombres de las escalas ni qué respuesta suma.
- **Teléfono:** debe funcionar en pantallas de 360 px de ancho o más.

## 3. Corrección y resultados
Al enviar, ejecuta `corregirIPC(respuestas)` y guarda:
- las respuestas;
- el puntaje y el nivel por escala;
- el índice de potencial comercial;
- las fortalezas y los aspectos a desarrollar;
- los riesgos;
- la deseabilidad social, la atención y la validez;
- las alertas;
- la fecha del evento y la versión del módulo.

**Qué se muestra:**
- **Seis escalas** en barras de 0 a 100, cada una con su nivel y su texto (`IPC_TEXTOS`):
  - Estabilidad emocional;
  - Empuje y ambición;
  - Sociabilidad;
  - Amabilidad y servicio;
  - Responsabilidad y orden;
  - Apertura y aprendizaje.
- **Nivel por escala:** Alto (70 o más), Medio (40 a 69) o Bajo (menos de 40). Son cortes **provisionales**.
- **Índice de potencial comercial (0 a 100):** promedio ponderado con `IPC_PESOS_POTENCIAL`. Los pesos son una **propuesta** editable en Configuración.
- **Fortalezas y aspectos a desarrollar:** las dos escalas más altas y las dos más bajas.
- **Riesgos bajo presión:** en un recuadro aparte, con su título y su texto. Aclara que no son diagnósticos, sino conductas que conviene explorar en la entrevista.
- **Validez:**
  - Puede ser «Aceptable», «Dudosa» o «No válida».
  - Si es «No válida» (dos afirmaciones de atención fallidas), el informe indica que el resultado no se usa y que la prueba debe repetirse. RRHH puede autorizar un nuevo intento.
- **Match con el cargo:**
  - Se calcula con `matchIPC(resultado, perfilDelCargo)` usando el perfil deseado del cargo destino.
  - Muestra el porcentaje y el nivel: Alto (80 % o más), Medio (65 % a 79 %) o Bajo (menos de 65 %).
  - Detalla cada escala con lo esperado frente a lo obtenido, y el descuento por riesgos.
- **Perfil por cargo:** los perfiles de `IPC_PERFIL_CARGO_INICIAL` son una **propuesta**. Crea en Configuración la pantalla «Perfil IPC por cargo», con el nivel mínimo por escala y cargo: alto, medio o indiferente.

## 4. Informe IPC (PDF) y expediente
- **Contenido del informe:**
  - logo de la marca del trabajador y datos del evaluado;
  - fecha de aplicación, escalas, índice de potencial comercial, fortalezas, aspectos a desarrollar, riesgos, validez y match con el cargo;
  - conclusión con el mismo criterio de los demás informes: favorable, intermedia o no favorable, con los días para volver a presentar ya configurados.
- **Nota al pie:** «El Inventario de Personalidad Comercial describe la forma de ser en el trabajo. Complementa, y no sustituye, la entrevista, las pruebas técnicas y la evaluación de desempeño».
- **Expediente:** el informe se guarda en la fase Evaluación con la fecha del evento. Cada emisión es una versión nueva y no reemplaza a la anterior.
- **Batería de pruebas:** el IPC aparece en el panel de la promoción junto a las demás pruebas. La aprobación queda bloqueada hasta que la batería esté completa.

## 5. Ponderación
- El IPC entra en la constancia de match como componente informativo, sin peso, hasta que yo defina su ponderación.
- Deja en Configuración › Ponderación del match la opción de asignarle peso por cargo actual, con 0 % por defecto.

## 6. Informes y archivos planos
- **Informes › Pruebas:** tabla IPC con fecha, trabajador, tienda, cargo destino, índice de potencial comercial, match, nivel, riesgos y validez. Agrega el promedio por escala por tienda y por cargo.
- **Informes en Excel:** hoja «IPC» con una fila por aplicación. Columnas:
  - puntaje y nivel por escala;
  - índice de potencial comercial;
  - riesgos detectados, separados por coma;
  - deseabilidad social, atención y validez;
  - match;
  - mes en letras y año, en columnas aparte.

  Nombres y cédulas solo los ve RRHH.
- **Trayectoria del trabajador:** el IPC aparece con su fecha, índice, match y estatus.
- **Plan de sucesión:** el match del IPC se suma al componente «Pruebas del portal» de las rutas que lo exijan.

## 7. Baremo
- Los cortes `IPC_CORTES` e `IPC_DS_CORTES` son provisionales.
- A partir de 100 aplicaciones completas, Configuración avisa que ya se puede ajustar el baremo con la población propia y muestra la distribución real de cada escala.

## 8. Verificación
**Casos de control**, con `ipc.js` sin cambios:
- **Perfil de vendedor:** Sociabilidad y Amabilidad en 100, Estabilidad y Empuje en 75, Responsabilidad y Apertura en 50, validez aceptable. Esperado: potencial comercial 81 (Alto) y match del 100 % para Asesor de Ventas.
- **Todas las afirmaciones respondidas con 5:** las escalas quedan en Medio, porque cada escala tiene afirmaciones a favor y en contra. La validez debe ser «Dudosa» por la deseabilidad social alta.
- **Dos afirmaciones de atención mal respondidas:** validez «No válida».

**Prueba completa:** usa a la persona de prueba (Josselyn Tovar) para una aplicación de principio a fin, con su informe. Este registro no suma en los indicadores.

**Visibilidad:** confirma que el Gerente de Tienda no ve resultados de otra tienda, ni en pantalla ni consultando la base de datos.

**Documentación:** al terminar, actualiza LEEME-paquete.md con una sección del IPC que explique:
- cuándo se aplica;
- cómo se interpreta;
- los riesgos bajo presión;
- los parámetros propuestos;
- lo pendiente: ponderación, pesos del potencial y baremo local.
