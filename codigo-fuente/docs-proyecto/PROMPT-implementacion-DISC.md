Agrega la prueba **DISC** al portal de evaluación y al módulo Evaluaciones del Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta). Adjunto el módulo `disc.js`: contiene el cuadernillo (28 grupos de 4 palabras), la clave, la corrección, los textos de interpretación y el perfil deseado por cargo. Úsalo como fuente única de la lógica; no lo modifiques.

Reglas generales:
- Reutiliza los componentes que ya existen para IPV y Kostick: acceso al portal, intentos, introducción, guardado automático, informe en PDF y constancia de match.
- Todo lo que se indica como «propuesta» queda editable en Configuración. Antes de fijar cualquier criterio que no esté aquí, pregúntame.
- Respeta las reglas de visibilidad vigentes. Revisa la ortografía de todos los textos nuevos.
- Si necesitas tablas o columnas nuevas en Supabase, prepara la migración con RLS, muéstrame el resumen y espera mi confirmación antes de aplicarla.

## 1. Cuándo se aplica (propuesta)
- **Promociones:** forma parte de la batería cuando el cargo destino es Asesor de Ventas, Cajero, Cajero Principal, Visual Merchandiser, Subgerente o Gerente de Tienda.
- **Ingresos:** se puede asignar a un candidato a ingreso con el mismo acceso de candidatos (usuario: cédula; clave: primer apellido).
- Los cargos que la presentan se configuran en Evaluaciones › Pruebas, igual que IPV, Kostick y Lógico.

## 2. Presentación en el portal
- **Introducción:** muestra `DISC_INSTRUCCIONES` antes de empezar. Agrega que el resultado describe estilos de comportamiento y no mide capacidad ni inteligencia.
- **Formato:** un grupo por pantalla, con las 4 palabras en el orden del cuadernillo. Cada palabra tiene dos botones, «Más» y «Menos».
  - La misma palabra no puede marcarse como Más y Menos a la vez.
  - No se puede avanzar sin elegir las dos.
- **Avance y guardado:** barra «Grupo X de 28» y guardado automático de cada respuesta.
- **Tiempo:** 20 minutos por intento (propuesta). Mismas reglas de intentos que IPV y Kostick: 2 intentos y un último intento autorizado por RRHH.
- **Envío:**
  - Al final, una pantalla de revisión. Solo permite enviar si `validarRespuestasDISC()` es válida.
  - Una vez enviada, la prueba no se puede volver a abrir y el trabajador no ve su resultado.
- Debe funcionar en el teléfono (ancho mínimo de 360 px).

## 3. Corrección y resultados
Al enviar, ejecuta `corregirDISC(respuestas)` y guarda:
- Las respuestas.
- Los conteos Más y Menos y la diferencia por factor.
- Los tres gráficos y el perfil.
- Las alertas.
- La fecha del evento y la versión del módulo.

**Tres gráficos de barras de D, I, S y C** (escala de 1 a 7, con la línea media en 4):
- **Gráfico I, «Cómo se muestra»:** respuestas Más.
- **Gráfico II, «Cómo responde bajo presión»:** respuestas Menos, invertidas.
- **Gráfico III, «Perfil integrado»:** Más menos Menos. Es el que se usa para el perfil y el match.

**Estilo:** muestra el código (por ejemplo, «DI · Impulsor») y su interpretación de `DISC_ESTILOS`: descripción, fortalezas, áreas de desarrollo, comportamiento bajo presión, cómo dirigirlo y uso en tienda.

**Detalle por factor:** usa `DISC_FACTOR_TEXTOS`, con el texto alto si el segmento es 5 o más, el texto bajo si es 3 o menos, y ambos matizados si es 4.

**Alertas** (perfil plano, perfil poco definido, diferencia entre cómo se muestra y cómo responde bajo presión): van en un recuadro visible para quien interpreta. Si el perfil es «PLANO», el informe dice que el resultado no se usa para decidir hasta confirmarlo en entrevista.

**Match con el cargo:**
- Usa `matchDISC(resultado, perfilDelCargo)` con el perfil deseado del cargo destino.
- Muestra porcentaje y nivel: Alto (80 % o más), Medio (65 % a 79 %) o Bajo (menos de 65 %).
- Detalla cada factor: esperado frente a obtenido.
- Los perfiles de `DISC_PERFIL_CARGO_INICIAL` son una **propuesta**. Crea en Configuración la pantalla «Perfil DISC por cargo», con nivel esperado (alto, medio, bajo o indiferente) por factor y por cargo.

## 4. Informe DISC (PDF) y expediente
- **Contenido:**
  - Logo de la marca del trabajador y datos del evaluado.
  - Fecha de aplicación, los tres gráficos, estilo, interpretación, detalle por factor, match con el cargo, alertas y conclusión.
  - Conclusión con el mismo criterio de los demás informes: favorable, intermedia o no favorable, con los días para volver a presentar configurados.
- **Nota al pie:** «El DISC describe preferencias de comportamiento. Complementa, y no sustituye, la entrevista, las pruebas técnicas y la evaluación de desempeño».
- **Expediente:** se guarda en la fase Evaluación con la fecha del evento. Cada emisión es una versión nueva y no reemplaza a la anterior.
- **Panel de la promoción:** aparece en «Batería de pruebas» junto a IPV, Kostick y Lógico. La aprobación queda bloqueada hasta que la batería esté completa.

## 5. Ponderación
- El DISC entra en la constancia de match como componente informativo, sin peso, hasta que yo defina su ponderación.
- Deja en Configuración › Ponderación del match la opción de asignarle peso por cargo actual, con 0 % por defecto.

## 6. Informes y archivos planos
- **Informes › Pruebas:** tabla DISC (fecha, trabajador, tienda, cargo destino, perfil, estilo, match y nivel) y distribución de estilos por tienda y por cargo.
- **Informes en Excel:** hoja «DISC», con una fila por aplicación: conteos Más y Menos, diferencia y segmento por factor, perfil, match, mes en letras y año aparte. Nombres y cédulas solo para RRHH.
- **Trayectoria del trabajador:** el DISC aparece con su fecha, estilo, match y estatus.

## 7. Baremo
- Los cortes de intensidad del módulo (`DISC_CORTES_CONTEO` y `DISC_CORTES_DIFERENCIA`) son provisionales.
- Agrega en Configuración un aviso que se active a partir de 100 aplicaciones completas: «Ya hay datos suficientes para ajustar el baremo DISC con la población propia».
- Al pulsarlo se muestra la distribución real por factor, para que RRHH decida si ajusta los cortes.

## 8. Verificación
- **Casos de control** (con `disc.js` sin cambios):
  - Si en todos los grupos se marca Más en D y Menos en S, el perfil debe ser «D» o «DI»; D en segmento 7 y S en segmento 1.
  - Si se marca Más en C y Menos en I en todos los grupos, el perfil debe ser «C · Analista».
  - Una respuesta con la misma palabra en Más y Menos debe rechazarse.
- **Prueba completa:** usa la persona de prueba (Josselyn Tovar) para una aplicación de principio a fin, con su informe. No suma en los indicadores.
- **Visibilidad:** el Gerente de Tienda no ve resultados de otra tienda, ni en pantalla ni consultando la base de datos.
- **Documentación:** actualiza LEEME-paquete.md con una sección del DISC: cuándo se aplica, cómo se interpreta, parámetros propuestos y pendientes (ponderación y baremo local).
