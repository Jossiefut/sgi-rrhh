# Prompt: implementar la prueba IPV en el sistema propio

Copie todo el bloque siguiente en la herramienta o con el desarrollador que vaya a hacer la implementación. Entregue también el archivo `ipv.js`.

---

Necesito integrar la prueba **IPV (Inventario de Personalidad para Vendedores)** en el Sistema de Gestión Integrado de RRHH de Marcas Propias (Balú y Planeta), de Representaciones Ulab 24, C.A. El sistema es una aplicación web (React) con base de datos Supabase y roles por marca y tienda.

**Insumo:** el módulo `ipv.js`, que ya contiene la clave de corrección de las 87 preguntas, las 12 escalas, los baremos (de puntaje directo a puntaje típico 1-10), los niveles, los textos del informe y la función `informeIPVHtml()` con los logos de Balú y Planeta. Ese módulo **no se debe modificar**: fue verificado contra el Excel original y da resultados idénticos. Úsalo como fuente única de la lógica.

**1. Quién presenta la prueba**
- La presentan quienes optan a Asesor de Ventas, Subgerente o Gerente de Tienda dentro de una solicitud de **Promoción**. Los cargos deben poder cambiarse en Configuración.
- Al registrar la promoción, el sistema crea un acceso temporal al portal de evaluación:
  - Usuario: la cédula, solo números.
  - Clave: el primer apellido, sin acentos y sin distinguir mayúsculas.
  - Vigencia: 15 días, configurable. El acceso caduca al vencer o al cerrar o anular la solicitud.
- Las claves se guardan cifradas. Tras 5 intentos fallidos, el acceso se bloquea 15 minutos.
- Desde el portal no se puede leer ningún otro dato del sistema.

**2. Cuadernillo (enunciados)**
- Los enunciados son material licenciado y **no van en el código**.
- En Evaluaciones → Prueba IPV → Configuración, RRHH carga un Excel o CSV de 87 filas con las columnas `N.º`, `Pregunta`, `a`, `b`, `c`. Usa `plantillaCuadernillo()` para ofrecer la plantilla vacía.
- Valida que haya 87 filas y que ninguna celda quede vacía. Mientras no se cargue el cuadernillo, el portal indica "Prueba no disponible".
- Guarda el cuadernillo en una tabla que solo pueda leer el portal durante una sesión de prueba activa.

**3. Presentación en el portal**
- Una pregunta por pantalla, con tres opciones (a, b, c), barra de avance "Pregunta X de 87" y botones Anterior / Siguiente.
- Cada respuesta se guarda al elegirla, para que el trabajador pueda retomar si se corta la conexión.
- Al final, una pantalla de revisión con las preguntas sin responder y el botón "Enviar prueba".
- Usa `validarRespuestasIPV()`: no permitas enviar con respuestas faltantes.
- Una vez enviada, la prueba no se puede volver a abrir.
- El trabajador **no ve** su resultado.
- Muestra los logos de Balú y Planeta en el encabezado del portal, con los mismos valores de `IPV_MARCAS`.
- La interfaz debe funcionar en el teléfono (ancho mínimo de 360 px).

**4. Corrección y resultados**
- Al enviar, ejecuta `corregirIPV(respuestas)` y guarda:
  - las respuestas crudas;
  - el resultado por escala (PD, PT, nivel y texto);
  - la fecha y la versión del módulo.
- El resultado aparece en Evaluaciones → Prueba IPV y en Informes → IPV, con filtros por marca, tienda, cargo y fecha.
- Cada promoción muestra su **Informe IPV**, generado con `informeIPVHtml(resultado, { nombre, documento, nivelEducativo, cargo, fecha, marca })`, con un botón para imprimir o guardar en PDF. El logo de la marca del trabajador se ve resaltado y el de la otra marca, atenuado.
- Las aprobaciones de la promoción quedan bloqueadas hasta que la prueba esté completa.

**5. Logos**
- En `IPV_MARCAS.BALU.logo` e `IPV_MARCAS.PLANETA.logo`, coloca la imagen oficial: una URL https o un `data:image/png;base64,...`.
- Si el campo está vacío, el informe muestra el nombre de la marca como logotipo de texto. No uses imágenes de internet ni recrees el logo.

**6. Permisos (iguales a los del resto del sistema)**
- RRHH, el Administrador y la Gerencia General ven todos los resultados.
- La Gerencia de Marca ve solo los de su marca. El Gerente de Tienda ve solo los de su tienda.
- El rol "Consulta RRHH Futura" ve los informes de su marca y no puede modificar nada.
- Aplica estas reglas también en la base de datos (políticas RLS de Supabase), no solo en la pantalla.

**7. Pruebas antes de publicar**
- Corrige con `corregirIPV` estos casos de control (respuestas ficticias, verificadas contra el Excel original) y confirma el resultado esperado (PD / PT):
  - Caso 1, respuestas 1-87: `a c c a b c b c c a c a b b c a a c b c c b b c a a c a c b c a c a a c a b a b b c c b c b b c c b a b a a a b a b c b c b b c b c b c c b c a b c a b c c c a c b c c c a c`
    Esperado: DGV 6/2 · R 14/1 · A 10/3 · I 1/1 · II 3/3 · III 4/4 · IV 6/5 · V 3/3 · VI 3/4 · VII 4/7 · VIII 0/2 · IX 5/6
  - Caso 2, todas en "a": DGV 7/3 · R 15/2 · A 11/4 · I 3/3 · II 3/3 · III 4/4 · IV 5/4 · V 3/3 · VI 3/4 · VII 3/5 · VIII 2/6 · IX 3/3
  - Caso 3, todas en "c": DGV 5/1 · R 16/3 · A 12/4 · I 4/4 · II 4/4 · III 3/3 · IV 5/4 · V 3/3 · VI 4/6 · VII 3/5 · VIII 2/6 · IX 3/3
- Confirma que un Gerente de Tienda no puede ver resultados de otra tienda, ni siquiera consultando la base de datos directamente.

**Restricciones:** no cambies la clave, los baremos ni los textos de `ipv.js`. La pregunta 84 no suma en ninguna escala, igual que en el Excel original; no la "corrijas". Escribe en español todos los mensajes al usuario.
