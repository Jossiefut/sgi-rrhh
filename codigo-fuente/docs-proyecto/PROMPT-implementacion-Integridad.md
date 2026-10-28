Agrega la **Prueba de Integridad Laboral (PIL)** al portal de evaluación y al módulo Evaluaciones del Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta). Te adjunto el módulo `integridad.js`, que contiene el cuadernillo (46 afirmaciones), la clave, la corrección, los textos de interpretación y las conclusiones. Úsalo como fuente única de la lógica y no lo modifiques.

Reglas generales:
- Reutiliza los componentes que ya existen para IPV, Kostick, Lógico y DISC: acceso al portal, intentos, introducción, guardado automático, informe en PDF y batería de pruebas.
- Todo lo indicado como «propuesta» queda editable en Configuración. Antes de fijar cualquier criterio que no esté aquí, pregúntame.
- Respeta las reglas de visibilidad vigentes y revisa la ortografía de todos los textos nuevos.
- Si necesitas tablas o columnas nuevas en Supabase, prepara la migración con RLS, muéstrame el resumen y espera mi confirmación antes de aplicarla.

## 1. Cargos que la presentan
- **Cargos destino:** Cajero, Cajero Principal, Depositario y Jefe de Almacén. Son los cargos con manejo de dinero y mercancía. Agrégalos en Evaluaciones › Pruebas como cargos que aplican la PIL; la lista queda editable.
- **Promociones:** cuando el cargo destino es uno de esos cuatro, la PIL forma parte de la batería. La aprobación queda bloqueada hasta que la batería esté completa, igual que con las demás pruebas.
- **Ingresos:** se asigna al candidato a ingreso con el mismo acceso de candidatos (usuario: cédula; clave: primer apellido). Cuando la persona ingresa, el informe se une a su expediente por la cédula.

## 2. Presentación en el portal
- **Introducción:** muestra `PIL_INSTRUCCIONES` y agrega este aviso:
  > Esta prueba explora criterios y actitudes ante situaciones de trabajo. Sus respuestas son confidenciales y solo las ve el personal autorizado de Recursos Humanos. El resultado se revisa junto con la entrevista y no decide por sí solo.

  La persona marca «He leído y acepto» antes de comenzar. Guarda esa aceptación con su fecha y hora.
- **Formato:**
  - Una afirmación por pantalla, en el orden del cuadernillo.
  - Cinco botones con los textos de `PIL_ESCALA_RESPUESTA`.
  - Barra «Afirmación X de 46» y guardado automático de cada respuesta.
- **Tiempo:** 15 minutos por intento (propuesta). Mismas reglas de intentos: 2 intentos y un último intento autorizado por RRHH.
- **Envío:**
  - Pantalla de revisión al final. Solo permite enviar si `validarRespuestasPIL()` es válida.
  - Una vez enviada, no se reabre y la persona no ve su resultado.
- **Diseño:** la pantalla nunca muestra el nombre de las escalas ni indica qué respuesta es «correcta». Debe funcionar en el teléfono (ancho mínimo de 360 px).

## 3. Corrección y resultados
Al enviar, ejecuta `corregirPIL(respuestas)` y guarda:
- las respuestas;
- el puntaje por escala;
- el índice global;
- la deseabilidad social;
- las respuestas críticas;
- las inconsistencias;
- la validez;
- las alertas y la conclusión;
- la fecha del evento y la versión del módulo.

Muestra el resultado así:
- **Índice de integridad (0 a 100) y su nivel:** Favorable (75 o más), Moderado (60 a 74) o Riesgo (menos de 60). Los cortes son **provisionales**.
- **Cinco escalas** en barras horizontales, cada una con su puntaje, su nivel y el texto de `PIL_TEXTOS_ESCALA` que corresponda.
- **Validez:** «Aceptable» o «Dudosa», con la deseabilidad social y las inconsistencias.
- **Respuestas críticas:** cada afirmación crítica marcada «de acuerdo», con la respuesta dada.
- **Alertas** en un recuadro visible para quien interpreta.
- **Conclusión:** Favorable, Revisar en entrevista o No favorable, con el texto de `PIL_CONCLUSIONES`.

## 4. Revisión obligatoria de RRHH
- Si la conclusión es «Revisar en entrevista» o «No favorable», el proceso queda en estado **«Pendiente de entrevista de integridad»**.
- RRHH registra la entrevista. Campos:
  - fecha de la entrevista;
  - comentarios por cada respuesta crítica y por cada escala en riesgo;
  - decisión final: «Continúa» o «No continúa»;
  - justificación.
- Solo con ese registro la PIL cuenta como completa en la batería.
- La decisión de RRHH queda en el informe y en la bitácora, con fecha y usuario. El resultado calculado no se modifica: la decisión se agrega como anotación.

## 5. Confidencialidad y visibilidad
- **Detalle completo** (escalas, respuestas críticas y comentarios de la entrevista): solo RRHH y el Administrador.
- **Gerente de Tienda, Gerente de Marca y Operaciones:** ven únicamente el índice, el nivel, la conclusión y la decisión final de RRHH. No ven las respuestas individuales ni las afirmaciones críticas.
- **Gerencia General:** ve la conclusión y la decisión final en Informes.
- **Consulta RRHH:** solo el estatus del proceso.
- Aplica estas reglas también en la base de datos (RLS), no solo en pantalla. Las respuestas individuales se guardan en una tabla aparte con acceso exclusivo de RRHH, igual que `fichas_sensibles`.

## 6. Informe PIL (PDF) y expediente
- **Contenido del informe:**
  - logo de la marca del trabajador y datos del evaluado;
  - fecha de aplicación, índice, escalas, validez, alertas, conclusión y decisión de RRHH;
  - nota al pie: «La Prueba de Integridad Laboral explora actitudes ante situaciones de trabajo. Complementa, y no sustituye, la entrevista, las referencias y la evaluación de desempeño. Ningún resultado descarta por sí solo a una persona».
- **Dos versiones del PDF:**
  - completa, para RRHH y el Administrador;
  - resumen, para los gerentes, con índice, nivel, conclusión y decisión.
- Se guarda en el expediente, en la fase Evaluación, con la fecha del evento. Cada emisión es una versión nueva y no reemplaza a la anterior.

## 7. Ponderación e informes
- **Constancia de match:** la PIL entra como **requisito**, sin peso en el porcentaje. Muestra «Integridad: Favorable / Continúa según entrevista / No continúa».
- **Plan de sucesión:** para las rutas hacia Cajero, Cajero Principal, Depositario y Jefe de Almacén, agrega como condición obligatoria de «Listo ahora» tener una PIL favorable o una decisión «Continúa» de RRHH con menos de 24 meses (propuesta).
- **Informes › Pruebas:** tabla PIL con fecha, trabajador, tienda, cargo destino, índice, nivel, conclusión y decisión. Las escalas y las respuestas críticas solo las ve RRHH.
- **Informes en Excel:** nueva hoja «Integridad», con una fila por aplicación: puntaje por escala, índice, deseabilidad social, número de críticos, validez, conclusión, decisión, y el mes (en letras) y el año en columnas separadas. Nombres, cédulas y escalas solo para RRHH.
- **Trayectoria del trabajador:** la PIL aparece con su fecha, conclusión y estatus (pendiente de entrevista, continúa o no continúa).

## 8. Baremo
- Los cortes `PIL_CORTES` y `PIL_DS_CORTES` son provisionales.
- A partir de 100 aplicaciones completas, avisa en Configuración que ya se puede revisar el baremo y muestra la distribución real del índice y de cada escala.

## 9. Verificación
Comprueba estos casos de control con `integridad.js` sin cambios:

| Caso | Respuestas | Resultado esperado |
|---|---|---|
| Ideal | Favorables al máximo, validez en 2 | Índice 100, Favorable |
| Riesgo | Favorables en 2, desfavorables en 4 | Índice 25, 6 críticos, No favorable |
| Imagen idealizada | Favorables al máximo, validez en 5 | Índice 100, validez «Dudosa», Revisar en entrevista |
| Neutro | Todas en 3 | Índice 50, No favorable |

Verifica también:
- La persona de prueba (Josselyn Tovar) completa la prueba de principio a fin, incluido el registro de la entrevista de RRHH. Ese registro no suma en los indicadores.
- Un Gerente de Tienda y un Gerente de Marca no pueden leer las respuestas individuales ni las escalas, ni en pantalla ni consultando la base de datos.
- Al terminar, actualiza LEEME-paquete.md con una sección de la PIL: cargos, cómo se interpreta, revisión obligatoria de RRHH, confidencialidad y parámetros pendientes (tiempo, cortes y baremo).
