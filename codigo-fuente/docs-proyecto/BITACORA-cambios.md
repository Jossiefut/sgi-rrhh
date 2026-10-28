# Bitácora de cambios — Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta)

Actualizada el 08/10/2026. Complementa a `LEEME-paquete.md` (que describe cómo funciona el programa). Aquí se registra qué se pidió, cuándo y en qué estado quedó. Las fechas de los eventos de cada trabajador siguen siendo las reales; esta bitácora solo registra el desarrollo del sistema.

Estados: **En la app** = descrito en `LEEME-paquete.md` como funcionando · **Entregado** = archivo o prompt listo en el proyecto · **Pendiente** = falta una decisión o un dato.

## Resumen por fecha

### 05/10/2026
| Cambio | Estado | Dónde |
|---|---|---|
| Prueba IPV decodificada desde el Excel: clave de 87 ítems, 12 escalas, baremos, informe y cuadernillo, con logos Balú y Planeta (texto mientras no se carguen los oficiales) | En la app | `ipv.js`, `ipv-cuadernillo.js`, `PROMPT-implementacion-IPV.md` |
| Clave del Indicador Lógico I (50 preguntas) y hoja de cálculo de corrección | En la app | `logico.js`, `logico-cuadernillo.js` |
| Paquete administrativo de Futura Retail: 9 documentos individuales (docx y PDF), logo rehecho en vectorial, duplicados eliminados, datos personales reemplazados por plantillas en blanco | Entregado | `futura-logo.svg` y carpeta de salida |
| Corrección de ortografía en los 9 documentos (ropa, acarreará, ingresó, carretillas, «se deberá», CÉDULA, etc.) | Entregado | misma carpeta |

### 06/10/2026
| Cambio | Estado | Dónde |
|---|---|---|
| Plan de sucesión de tiendas Balú y Trayectoria del trabajador (prompt reescrito con las reglas nuevas) | En la app (LEEME 4.24) | `PROMPT-plan-sucesion-y-trayectoria.md` |
| Gerente de Marca con acceso limitado a Desarrollo; Gerente de Tienda sin acceso a Desarrollo; Marca propone y RRHH aprueba | En la app | LEEME 4.24 |
| Cajero Principal = tienda grande; Cajero = tienda pequeña (campo «Tamaño» en Información de tiendas) | En la app | LEEME 4.23 |
| Migración de Supabase del Indicador Lógico y del control de intentos | Aplicada 06/10 | LEEME 4.14 |

### 07/10/2026
| Cambio | Estado | Dónde |
|---|---|---|
| Prueba DISC con cuadernillo e interpretación (28 grupos, 16 estilos). Pasa a **prueba opcional de desarrollo**, fuera de la batería | En la app | `disc.js`, LEEME 4.25 |
| Prueba de Integridad Laboral (PIL, 46 afirmaciones). Es requisito, no suma puntos; entrevista de RRHH obligatoria si el resultado lo exige | En la app | `integridad.js`, LEEME 4.25 |
| Inventario de Personalidad Comercial (IPC, 54 afirmaciones, prueba propia equivalente a Hogan; no usa ese nombre) | En la app | `ipc.js`, LEEME 4.25 |
| Batería por cargo destino con máximo 3 pruebas | En la app | `PROMPT-bateria-por-cargo.md`, LEEME 4.25 |
| Nine-Box ampliada (Cajero Principal/Cajero, Jefe de Almacén, Visual Merchandiser, administrativos) y sesión de calibración con acta | En la app | `PROMPT-ninebox-extension-y-calibracion.md`, LEEME 4.25 |
| Prompt consolidado que aplica los seis prompts en orden | Entregado | `PROMPT-entrega-consolidada.md` |
| Módulo de Clima laboral y buzón de sugerencias | En la app (LEEME 4.26) | `clima.js` |
| Migración de pruebas nuevas y Nine-Box | Aplicada 07/10 y verificada | LEEME 4.25 |

## Decisiones tomadas por RRHH (valores iniciales, editables en Configuración)

**Batería por cargo**

| Cargo destino | Pruebas |
|---|---|
| Asesor de Ventas | IPV + IPC |
| Cajero / Cajero Principal | Indicador Lógico + Integridad + IPC |
| Depositario | Integridad + IPC |
| Jefe de Almacén | Integridad + IPC + Indicador Lógico |
| Visual Merchandiser | IPV + IPC |
| Subgerente | Kostick + IPC + Indicador Lógico |
| Gerente de Tienda | Kostick + IPC + Indicador Lógico |

**Ponderación del match:** Asesor → Cajero/Depositario, IPC 50 % + evaluación básica 50 %. Asesor → Visual Merchandiser, IPV 25 % + IPC 25 % + básica 50 %. Subgerente → Gerente de Tienda, IPC 20 % · Kostick 40 % · Nine-Box 30 % · Conducta 10 %. Integridad y Lógico son requisitos, sin porcentaje.

**Plan de sucesión:** Evaluación 35 %, Pruebas 25 %, Formación 20 %, Conducta 10 %, Antigüedad 10 %. Niveles: 80 Listo ahora, 65 de 6 a 12 meses, 50 de 12 a 24 meses. «Listo ahora» exige contrato fijo, sin plan de mejora abierto y sin amonestaciones en 6 meses.

**Calibración Nine-Box:** en tienda, Gerente de Marca y Gerente de Operaciones; en administrativo, supervisor inmediato y RRHH. Se cierra solo cuando confirman los dos. Ciclo semestral en abril y octubre. Referencia: máximo 15 % en la caja 9 y 25 % sumando las cajas 6, 8 y 9 (solo aviso).

**Tiempos:** Integridad 15 min, IPC 20 min, DISC 20 min.

## Pendientes

1. **Indicador Lógico, mínimos y duración.** Hoy: Cajero y Cajero Principal 8, Gerente de Tienda 12, Subgerente y Jefe de Almacén 10. Se sugirió subirlos a 14 (Cajero y Jefe de Almacén), 16 (Subgerente) y 18 (Gerente de Tienda) y volver a 15 minutos, porque la hoja original dice 15 y la configuración vigente dice 25. **Falta su decisión.** El panel «Validación del Indicador Lógico» permite calibrarlos con personal activo de buen desempeño.
2. **Preguntas 3, 8, 12, 20, 28 y 50 del Indicador Lógico:** verificar contra el cuadernillo impreso.
3. **Razón social del paquete administrativo:** los documentos conservan «FUTURA RETAIL, C.A.» y el RIF J-502141219 del original. Confirmar si corresponde esa empresa o Representaciones Ulab 24, C.A.
4. **Logos oficiales de Balú, Planeta y Futura Retail:** se usan versiones en texto o rehechas hasta recibir los archivos oficiales.
5. **Migraciones de Supabase:** verificadas el 08/10/2026 en la lista de migraciones del proyecto: `clima_sugerencias` (08/10) y `desarrollo_sucesion_permisos` (08/10) ya están aplicadas. Sin pendientes.
6. **Descripciones de cargo, plan administrativo, Planeta y baremos locales** (revisar a las 100 aplicaciones por prueba).
7. **Ponderación del DISC:** no pesa en el match; queda como prueba de desarrollo.
8. **Calibradores de los cargos de tienda no gerenciales** (Caja, Almacén, Visual): se usaron Marca y Operaciones; falta confirmarlos.
9. **Formularios de Microsoft Forms hacia Excel con Power Automate:** quedó para otra sesión; requiere la extensión de Chrome vinculada, el nombre del formulario y la ubicación del Excel.
10. **Evaluaciones semestrales adicionales** (propuesta): empezar con Nine-Box calibrada, evaluación por indicadores y prueba de conocimiento del cargo; 180° y clima, una vez al año. Falta definir los indicadores por cargo y su fuente de datos (SIA o reportes de ventas).
11. **Publicación y demostración:** el sitio se compiló el 08/10/2026 con el código vigente (index.html de 1,8 MB y vercel.json; pantalla de inicio de sesión verificada). Falta subirlo a Vercel (requiere que Jossie inicie sesión; la extensión Claude in Chrome estaba desactivada) y definir quién verá la demostración.

## Versiones de librerías (08/10/2026)
supabase-js 2.117.3 · tailwindcss 3.4.19 · esbuild 0.28.2 · react y react-dom 18.3.1 · lucide-react 0.460.0 · jsdom 24.1.3. No se aplicaron versiones mayores (React 19, Tailwind 4, lucide 1.x, jsdom 29) hasta después del piloto.

## Nota sobre el código
La copia de `claude/App.jsx` del Proyecto es la vigente (1,45 MB) y compila junto con los módulos y archivos de armado guardados el 08/10/2026.
