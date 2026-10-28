/* Clave de acceso al portal de pruebas: primer apellido, con apellidos compuestos completos */
(async () => {
  const M = await import('./claves.js');
  const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
  ok(M.claveEvaluado('Rodríguez Pérez') === 'RODRIGUEZ', 'Apellido simple: RODRIGUEZ');
  ok(M.claveEvaluado('  Núñez  ') === 'NUNEZ', 'Sin acentos ni espacios sobrantes');
  ok(M.claveEvaluado('De Abreu Silva') === 'DEABREU', 'Apellido compuesto «De Abreu»: DEABREU');
  ok(M.claveEvaluado('Del Valle') === 'DELVALLE', 'Apellido «Del Valle» solo: DELVALLE');
  ok(M.claveEvaluado('De La Cruz Mora') === 'DELACRUZ', 'Doble partícula «De La Cruz»: DELACRUZ');
  ok(M.claveEvaluado('San Martín') === 'SANMARTIN', '«San Martín»: SANMARTIN');
  ok(M.claveEvaluado('De') === 'DE' && M.claveEvaluado('') === '', 'Casos límite sin error');
  ok(M.normalizarClave('del valle') === M.claveEvaluado('Del Valle'), 'Lo que escribe la persona («del valle») coincide con la clave');
  ok(M.normalizarClave('GARCÍA') === 'GARCIA', 'La persona puede escribir con acento y mayúsculas');
})();
