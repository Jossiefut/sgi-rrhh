Amplía la evaluación **Nine-Box** y agrega la **sesión de calibración** en el Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta). Reutiliza la Nine-Box actual: preguntas, cálculo de caja y puntaje, informe, constancia, retroalimentación y documentos del expediente. No cambies su cálculo.

Reglas generales:
- Todo lo indicado como «propuesta» queda editable en Configuración. Antes de fijar cualquier criterio que no esté aquí, pregúntame.
- Respeta las reglas de visibilidad vigentes y revisa la ortografía de todos los textos nuevos.
- Si necesitas tablas o columnas nuevas en Supabase, prepara la migración con RLS, muéstrame el resumen y espera mi confirmación antes de aplicarla.
- Fechas: usa siempre la fecha real de cada paso (evaluación, calibración, validación y firma). Los resultados cerrados no se editan: los cambios quedan como anotaciones en la bitácora.

## 1. Nine-Box en las posiciones clave de tienda
- **Cargos nuevos:** extiende la Nine-Box a Cajero Principal, Cajero, Jefe de Almacén y Visual Merchandiser, además de Gerente de Tienda y Subgerente. Cajero Principal y Cajero son la misma posición: el nombre depende del tamaño de la tienda.
- **Quién evalúa en los cargos nuevos:** el Gerente de Tienda de su tienda.
- **Ruta de aprobación de los cargos nuevos (propuesta):** evaluación del Gerente de Tienda → calibración → validación de RRHH. Para estos cargos no se requiere la firma de Gerencia General.
- **Gerente de Tienda y Subgerente:** conservan su ruta actual, con la calibración insertada antes de la validación de RRHH.
- **Elegibilidad:** la misma regla de antigüedad que ya existe. La evaluación por movimiento (traslado o promoción) sigue disponible.
- **Preguntas:** las mismas preguntas de desempeño y potencial de tienda.
- **Configuración:** agrega la lista «Cargos que se evalúan con Nine-Box», editable por RRHH.

## 2. Nine-Box para el personal administrativo
- **Quién evalúa:** el supervisor inmediato de cada posición. Si el expediente del personal administrativo no tiene el campo «Supervisor inmediato», agrégalo (lo asigna RRHH, debe ser un usuario del sistema y el cambio queda en la bitácora).
- **Preguntas:** usa ítems administrativos, porque los de tienda hablan de ventas y exhibición. Propuesta:
  - **Desempeño:**
    - cumplimiento de objetivos del área;
    - calidad y exactitud del trabajo;
    - dominio técnico del cargo;
    - autonomía;
    - alineación con la cultura.
  - **Potencial:** los mismos 4 ítems actuales (aspiración, agilidad de aprendizaje, liderazgo y resolución de problemas).
  - **Escala y cálculo:** la misma escala y el mismo cálculo de caja. Muéstrame los textos finales antes de guardarlos.
- **Ruta:** evaluación del supervisor inmediato → calibración (supervisor inmediato y RRHH) → firma de Gerencia General.
- **Visibilidad:** RRHH, Gerencia General y el supervisor inmediato (solo su personal a cargo). Esto respeta la regla de que el plan administrativo solo lo ven RRHH y Gerencia General.

## 3. Sesión de calibración
**Quién calibra:**

| Personal | Calibran (ambos deben confirmar) |
|---|---|
| Tienda: Gerente de Tienda y Subgerente | Gerente de Marca y Gerente de Operaciones de la marca |
| Tienda: Cajero Principal / Cajero, Jefe de Almacén y Visual Merchandiser | Gerente de Marca y Gerente de Operaciones de la marca (propuesta, por confirmar) |
| Administrativo | Supervisor inmediato de cada posición y RRHH |

**Cómo funciona:**
- **Ciclo:** semestral, en abril y octubre (propuesta). Al aprobar la evaluación, esta pasa al estado **«Pendiente de calibración»**. Las evaluaciones por movimiento también se calibran, de forma individual y sin esperar el ciclo.
- **Pantalla «Calibración Nine-Box»** (en Evaluaciones):
  - Una matriz de 3 × 3 por marca (y otra para administrativo) con una tarjeta por persona evaluada. Cada tarjeta muestra nombre, cargo, tienda, caja propuesta, puntaje y evaluador.
  - Filtros por tienda y por cargo.
  - Distribución real frente a una referencia (propuesta: no más del 15 % en la caja 9 y del 25 % en las cajas 6, 8 y 9 juntas). Si se supera, se muestra como aviso, no como bloqueo.
- **Mover a una persona de caja:** cualquiera de los dos calibradores puede hacerlo, con justificación obligatoria. Se guardan la caja original y la calibrada, quién la movió, la fecha y el motivo. El puntaje original no se borra.
- **Cierre:** la calibración se cierra cuando **los dos calibradores confirman**. Si uno no está de acuerdo, la persona queda en «Calibración en discusión» y no avanza.
- **Acta de calibración (PDF):**
  - Una por sesión, con la lista de personas, la caja original, la caja final, los movimientos con su justificación, los calibradores y la fecha.
  - Se guarda en Documentos y en el expediente de cada persona, en la fase Evaluación.
- **Después de calibrar:** continúa la ruta (RRHH valida y, si corresponde, firma Gerencia General). La retroalimentación al trabajador se da sobre la caja calibrada.

## 4. Contraste del potencial con las pruebas
- En la tarjeta de calibración y en el informe de la evaluación, muestra el aviso **«Contrastar con pruebas»** cuando el potencial que asignó el evaluador no coincide con los resultados del portal. Usa la prueba más reciente, de máximo 24 meses:
  - Potencial alto (promedio de 4 o más) con índice de potencial comercial del IPC menor que 40, match del Kostick bajo o Indicador Lógico por debajo del mínimo del cargo.
  - Potencial bajo (promedio de 2 o menos) con índice del IPC de 70 o más y match del Kostick alto.
- El aviso es solo informativo: no cambia la caja.

## 5. Efectos en el plan de sucesión y en los informes
- **Plan de sucesión:**
  - Solo cuentan las evaluaciones Nine-Box **calibradas y aprobadas**.
  - El componente de evaluación (35 %) usa la Nine-Box también para Cajero Principal / Cajero, Jefe de Almacén y Visual Merchandiser.
  - Mientras una persona no tenga Nine-Box calibrada, se usa su última evaluación de contrato, como hasta ahora.
- **Riesgo del titular:** las cajas 1 y 4 calibradas marcan riesgo alto.
- **Trayectoria del trabajador:** muestra la evaluación, la calibración (caja original → caja final) y la validación, cada una con su fecha.
- **Informes:**
  - **Informes › Evaluaciones:** distribución por caja antes y después de calibrar, por tienda, cargo y marca, y porcentaje de evaluaciones calibradas.
  - **Informes en Excel:** en la hoja de Nine-Box, agrega las columnas caja original, caja calibrada, fecha de calibración, calibradores y motivo del cambio.
- **Recordatorios por correo:**
  - A los calibradores, cuando tengan evaluaciones «Pendiente de calibración».
  - Al supervisor inmediato administrativo, cuando su personal sea elegible para evaluación.

## 6. Verificación
- Con la persona de prueba (Josselyn Tovar), haz una Nine-Box de cada tipo:
  - Cajero, evaluado por el Gerente de Tienda y calibrado por Marca y Operaciones.
  - Subgerente.
  - Administrativo, calibrado por el supervisor inmediato y RRHH.

  Comprueba que la calibración no se cierre con una sola confirmación y que el acta guarde el cambio de caja con su justificación.
- Verifica estos accesos:
  - Un Gerente de Marca no ve evaluaciones de la otra marca.
  - Un supervisor administrativo solo ve a su personal a cargo.
  - Nadie fuera de RRHH, Gerencia General y el supervisor inmediato ve la Nine-Box administrativa.

  Comprueba los accesos en pantalla y consultando la base de datos.
- Al terminar, actualiza LEEME-paquete.md con:
  - los cargos que se evalúan con Nine-Box;
  - las rutas y la calibración;
  - el acta;
  - el contraste con las pruebas;
  - los pendientes: textos administrativos, referencia de distribución y calibradores de los cargos de tienda no gerenciales.
