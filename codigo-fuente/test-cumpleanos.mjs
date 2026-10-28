import { cumpleanosDelMes, rangoDeEdad, edadEn, medianaDe } from './cumpleanos.js';
let f = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) f++; };
const xs = [{ id: 1, nombre: 'A', fechaNacimiento: '1990-10-07' }, { id: 2, nombre: 'B', fechaNacimiento: '2001-10-02' }, { id: 3, nombre: 'C', fechaNacimiento: '1985-10-25' }, { id: 4, nombre: 'D', fechaNacimiento: '1985-11-01' }, { id: 5, nombre: 'E', fechaNacimiento: '' }, { id: 6, nombre: 'F', fechaNacimiento: '2012-10-10' }];
const r = cumpleanosDelMes(xs, '2026-10-07');
ok(r.hoy.length === 1 && r.hoy[0].id === 1 && r.hoy[0].cumple === 36, 'Cumpleaños de hoy con la edad que cumple');
ok(r.mes.map((x) => x.id).join() === '2,1,3' && r.mes[0].pasado && !r.mes[1].pasado, 'Del mes, ordenados por día, marcando los ya pasados; sin fechas vacías ni menores de 15');
const b = cumpleanosDelMes([{ id: 9, fechaNacimiento: '1992-02-29' }], '2027-02-28');
ok(b.hoy.length === 1, 'El 29 de febrero se celebra el 28 en año no bisiesto');
ok(cumpleanosDelMes([{ id: 9, fechaNacimiento: '1992-02-29' }], '2028-02-28').hoy.length === 0, 'En año bisiesto se celebra el 29');
ok(rangoDeEdad(24).id === 'R1' && rangoDeEdad(25).id === 'R2' && rangoDeEdad(60).id === 'R5' && rangoDeEdad(null) === null, 'Rangos de edad');
ok(edadEn('1990-10-08', '2026-10-07') === 35 && edadEn('1990-10-07', '2026-10-07') === 36, 'Edad en fecha');
ok(medianaDe([1, 3, 2]) === 2 && medianaDe([1, 2, 3, 4]) === 2.5 && medianaDe([]) === null, 'Mediana');
import { cumpleanosDeMes } from './cumpleanos.js';
{
  const it = [{ id: 'a', nombre: 'A', fechaNacimiento: '1990-03-10' }, { id: 'b', nombre: 'B', fechaNacimiento: '1996-02-29' }, { id: 'c', nombre: 'C', fechaNacimiento: '1990-04-01' }];
  const m3 = cumpleanosDeMes(it, 2026, 3, '2026-10-07');
  console.log(m3.length === 1 && m3[0].cumple === 36 && !m3[0].esHoy && !m3[0].pasado ? '✓ Mes ajeno al actual: sin marcas de hoy/pasado' : '✗ mes ajeno');
  const f = cumpleanosDeMes(it, 2027, 2, '2026-10-07');
  console.log(f.length === 1 && f[0].dia === 28 && f[0].cumple === 31 ? '✓ 29 de febrero se celebra el 28 en año no bisiesto' : '✗ febrero');
  const a = cumpleanosDeMes(it, 2026, 10, '2026-10-07');
  console.log(a.length === 0 ? '✓ Mes actual sin cumpleañeros' : '✗ actual');
}
import { mensajeCumpleanos as mc, familiaDeCargo as fc, enlaceWhatsApp as wa } from './cumpleanos.js';
{
  const okk = (c, m) => console.log((c ? '✓ ' : '✗ ') + m);
  okk(fc('GT', 'Gerente de Tienda') === 'gerente' && fc('SUB', 'Subgerente') === 'subgerente' && fc('', 'Subgerente') === 'subgerente', 'Mensaje: gerente y subgerente se distinguen');
  okk(fc('CAJ', '') === 'caja' && fc('ASE', '') === 'ventas' && fc('JALM', '') === 'almacen' && fc('VM', '') === 'visual' && fc('SEG', '') === 'seguridad' && fc('ADM', '') === 'administrativo', 'Mensaje: un texto propio por cada cargo');
  okk(fc('', 'Cargo nuevo') === 'general' && fc('', 'Auxiliar de Vigilancia') === 'seguridad', 'Mensaje: cargos nuevos se reconocen por su nombre o usan el general');
  const m = mc({ primerNombre: 'Ana', cargoId: 'ASE', cargoNombre: 'Asesor de Ventas', marca: 'PLANETA' });
  okk(m.includes('Ana') && m.includes('Planeta') && m.includes('cliente'), 'Mensaje: lleva el nombre, la marca y el contenido del cargo');
  const vistos = new Set(Array.from({ length: 60 }, () => mc({ primerNombre: 'Ana', cargoId: 'ASE', cargoNombre: '', marca: 'BALU' })));
  okk(vistos.size >= 4, 'Mensaje: varía al azar, no es siempre el mismo');
  let seguidos = false; let prev = ''; for (let i = 0; i < 80; i += 1) { const x = mc({ primerNombre: 'Ana', cargoId: 'GT', cargoNombre: '', marca: 'BALU' }).split('\n')[0]; if (x === prev) seguidos = true; prev = x; }
  okk(!seguidos, 'Mensaje: no repite dos veces seguidas el mismo texto');
  okk([0, 0.3, 0.6, 0.99].every((r) => mc({ primerNombre: 'Luis', cargoId: 'CAJ', cargoNombre: '', marca: 'PLANETA' }, () => r).includes('Luis')), 'Mensaje: todas las versiones llevan el nombre');
  okk(['ADM', 'GT', 'SUB', 'CAJ', 'ASE', 'JALM', 'VM', 'SEG', 'XX'].every((c) => [0, 0.3, 0.6, 0.99].every((r) => mc({ primerNombre: 'Ana', cargoId: c, cargoNombre: '', marca: 'BALU' }, () => r).includes('Ana'))), 'Mensaje: cada cargo y el general tienen versiones válidas');
  okk(wa('0412-1234567', 'x') === 'https://wa.me/584121234567?text=x' && wa('123', 'x') === null, 'WhatsApp: prefijo 58 y número inválido');
}
process.exit(f || process.exitCode ? 1 : 0);
