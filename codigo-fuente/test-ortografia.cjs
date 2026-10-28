(async () => {
  const { corregirTexto: c, fichasDesdeFormulario } = await import('./sincronizacion.js');
  const ok = (a, b, m) => { const r = a === b; console.log((r ? '✓ ' : '✗ ') + m + (r ? '' : ` → «${a}»`)); if (!r) process.exitCode = 1; };
  ok(c('ANALISTA DE ADMINISTRACION', 'titulo'), 'Analista de Administración', 'Mayúsculas a título y tilde');
  ok(c('jefe de almacen', 'titulo'), 'Jefe de Almacén', 'Almacén con tilde');
  ok(c('licenciada en  contaduria , mención gerencial'), 'Licenciada en contaduría, mención gerencial', 'Espacios, coma y tilde');
  ok(c('san cristobal', 'titulo'), 'San Cristóbal', 'Lugar con tilde');
  ok(c('c.c. sambil barquisimeto', 'titulo'), 'C.C. Sambil Barquisimeto', 'Siglas C.C.');
  ok(c('no me gusta'), 'No me gusta', 'Primera letra en mayúscula');
  ok(c('Ambiente laboral '), 'Ambiente laboral', 'Quita espacios sobrantes');
  ok(c('Remuneración'), 'Remuneración', 'No altera lo ya correcto');
  const enc = ['Coloque sus nombres completos', 'Coloque sus Apellidos Completos', 'Cédula de Identidad', 'Nacionalidad', 'Nacionalidad1', 'Hijos', 'Personal con Discapacidad', '¿Inscrito en el CONAPDIS?', 'Cargo', 'Unidad de Negocio'];
  const { fichas } = fichasDesdeFormulario([enc, ['ana maria', 'perez gil', 'V-40111222', 'Venezolana', 'Venezolana', 'si', 'si', 'no', 'asesor de ventas', 'balu']]);
  const f = fichas[0];
  ok(Boolean(f && f.discapacidad.tiene === 'Si' && f.discapacidad.conapdis === 'No' && f.tieneHijos === 'Si' && f.nacionalidadDetalle === 'Venezolana' && f.cargoTexto === 'Asesor de Ventas'), true, 'La ficha importa discapacidad, CONAPDIS, hijos y nacionalidad con ortografía corregida');
})();
