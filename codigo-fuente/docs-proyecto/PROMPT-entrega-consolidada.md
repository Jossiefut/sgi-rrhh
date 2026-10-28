Implementa en el Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta) los cambios descritos en los prompts guardados en el proyecto. Hazlo en este orden y en una sola entrega:

1. `claude/PROMPT-plan-sucesion-y-trayectoria.md`: Formación, Plan de sucesión de tiendas Balú y Trayectoria del trabajador.
2. `claude/PROMPT-implementacion-Integridad.md` y el módulo `claude/integridad.js`.
3. `claude/PROMPT-implementacion-IPC.md` y el módulo `claude/ipc.js`.
4. `claude/PROMPT-implementacion-DISC.md` y el módulo `claude/disc.js`. El DISC queda como prueba **opcional de desarrollo**, según el punto 5.
5. `claude/PROMPT-bateria-por-cargo.md`: máximo 3 pruebas por cargo destino.
6. `claude/PROMPT-ninebox-extension-y-calibracion.md`: Nine-Box ampliada y sesión de calibración.

Si dos prompts dicen cosas distintas, manda el que está más abajo en la lista. Los módulos `.js` no se modifican.

## Decisiones ya tomadas (aplícalas como valores iniciales, editables en Configuración)

**Plan de sucesión**
- **Pesos del puntaje de preparación:** Evaluación 35 %, Pruebas 25 %, Formación 20 %, Conducta 10 %, Antigüedad 10 %.
- **Niveles de preparación:** 80 o más = Listo ahora; 65 = Listo en 6 a 12 meses; 50 = Listo en 12 a 24 meses.
- **Antigüedad mínima en el cargo:** 6 meses en rutas operativas y 12 meses de Subgerente a Gerente de Tienda.
- **Condiciones para «Listo ahora»:** ser fijo, no tener plan de mejora abierto y no tener amonestaciones en los últimos 6 meses. Para las rutas hacia caja y almacén, además, una Integridad favorable o la decisión «Continúa» de RRHH, con menos de 24 meses.
- **Auxiliar de Seguridad:** fuera de las rutas.
- **Accesos:** el Gerente de Marca tiene acceso limitado a Desarrollo (solo su marca) y propone los sucesores; RRHH los aprueba. El Gerente de Tienda no tiene acceso a Desarrollo.

**Pruebas**
- **Tiempos por intento:** Integridad 15 minutos, IPC 20 minutos, DISC 20 minutos.
- **Cortes provisionales:** los de cada módulo. El baremo local se revisa al llegar a 100 aplicaciones.
- **Pesos del índice de potencial comercial (IPC):** Estabilidad 20 %, Empuje 25 %, Sociabilidad 20 %, Amabilidad 20 %, Responsabilidad 15 %, Apertura 0 %.
- **Ponderación de la constancia de match:** el IPC reemplaza al IPV donde el IPV ya no se aplica.
  - Asesor a Cajero o Depositario: IPC 50 % + evaluación básica 50 %.
  - Asesor a Visual Merchandiser: IPV 25 % + IPC 25 % + evaluación básica 50 %.
  - Subgerente a Gerente de Tienda: IPC 20 % · Kostick 40 % · Nine-Box 30 % · Conducta 10 %.
- **Integridad y Lógico:** son requisitos y no suman al porcentaje.

**Indicador Lógico I**
- **Mínimos de respuestas correctas:** Cajero y Cajero Principal 8; Gerente de Tienda 12, como están hoy. Subgerente 10 y Jefe de Almacén 10, nuevos.
- **Panel «Validación del Indicador Lógico»** (en Configuración, solo RRHH):
  - Permite aplicar la prueba a trabajadores activos con buen desempeño (Nine-Box calibrada en caja 5 o superior, o evaluación de contrato aprobada) **sin que cuente como evaluación**.
  - Con esos resultados, muestra por cargo: cantidad de casos, promedio, percentil 25 y mínimo sugerido (igual al percentil 25).
  - El panel solo informa: RRHH decide si cambia el mínimo.
- **Preguntas por verificar:** las preguntas 3, 8, 12, 20, 28 y 50 siguen marcadas así. Agrega la opción «Excluir del puntaje las preguntas por verificar», desactivada por defecto. Si se activa, el puntaje se calcula sobre las 44 preguntas restantes y los mínimos se ajustan en la misma proporción, redondeando hacia arriba.

**Nine-Box y calibración**
- **Cargos que se evalúan:** Gerente de Tienda, Subgerente, Cajero Principal / Cajero, Jefe de Almacén y Visual Merchandiser. También el personal administrativo, que lo evalúa su supervisor inmediato.
- **Calibración:**
  - Cargos de tienda (gerenciales y no gerenciales): Gerente de Marca y Gerente de Operaciones de la marca.
  - Personal administrativo: supervisor inmediato y RRHH.
  - La calibración se cierra solo cuando confirman los dos calibradores.
- **Rutas de aprobación:**
  - Cajero Principal / Cajero, Jefe de Almacén y Visual Merchandiser: evaluación → calibración → validación de RRHH, sin firma de Gerencia General.
  - Gerente de Tienda, Subgerente y personal administrativo: terminan con la firma de Gerencia General.
- **Ciclo semestral:** abril y octubre.
- **Referencia de distribución:** máximo 15 % en la caja 9 y 25 % sumando las cajas 6, 8 y 9. Si se supera, solo se avisa; no se bloquea.
- **Preguntas administrativas:** usa la propuesta del prompt y muéstrame los textos antes de publicar.

## Reglas para esta entrega
- **Código de partida:** parte de la versión más reciente del código. No uses copias anteriores.
- **Ortografía y fechas:** revisa la ortografía de todos los textos nuevos y respeta siempre la fecha real de cada evento en el expediente.
- **Visibilidad:** respeta las reglas vigentes por rol, marca y tienda en pantalla y en la base de datos (RLS).
- **Supabase:** prepara una sola migración con todas las tablas y políticas nuevas. Muéstrame el resumen y **espera mi confirmación antes de aplicarla**.
- **Cierre:** al terminar, compila el sitio, ejecuta las verificaciones de cada prompt con la persona de prueba (Josselyn Tovar) y actualiza LEEME-paquete.md con una sección por cada módulo nuevo y una lista de pendientes:
  - descripciones de cargo;
  - plan administrativo y Planeta;
  - baremos locales;
  - ponderación del DISC;
  - mínimos definitivos del Indicador Lógico.
