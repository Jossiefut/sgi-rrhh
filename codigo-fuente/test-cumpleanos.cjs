const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
(async () => {
  const hoy = hoyISO();
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(150); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const texto = () => d.body.textContent;
  // Un trabajador cumple años hoy (cumple 30) y otro más tarde en el mes (o ya pasó)
  const e = JSON.parse(w.localStorage.getItem('talento-balu-v2')) || {}; const dd = e.datos || e;
  if (!dd.trabajadores) { console.log('sin estado inicial'); process.exit(1); }
  const act = dd.trabajadores.filter((t) => t.estatus === 'ACTIVO' && !t.esPrueba);
  act.forEach((t) => { t.fechaNacimiento = '1990-01-15'; });
  const [anio] = hoy.split('-').map(Number);
  act[0].fechaNacimiento = `${anio - 30}${hoy.slice(4)}`; const nombre0 = act[0].nombres;
  act[1].fechaNacimiento = `${anio - 41}-${hoy.slice(5, 7)}-28`;
  w.localStorage.setItem('talento-balu-v2', JSON.stringify(e.datos ? { ...e, datos: dd } : dd));
  const dom2 = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w2) { w2.scrollTo = () => {}; w2.URL.createObjectURL = () => 'blob:x'; w2.localStorage.setItem('talento-balu-v2', w.localStorage.getItem('talento-balu-v2')); } });
  await espera(400); const w2 = dom2.window, d2 = w2.document;
  const c2 = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w2.MouseEvent('click', { bubbles: true })); await espera(150); };
  const b2 = (t, i = 0) => [...d2.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const t2 = () => d2.body.textContent;
  await c2(b2('Gerente de RRHH', 0)); await espera(300);
  ok(t2().includes('Cumpleaños') && t2().includes('Hoy,') && t2().includes('cumple 30 años'), 'Al entrar RRHH ve la ventana con el cumpleaños de hoy y la edad que cumple');
  ok(t2().includes('Cumpleaños de') && t2().includes('41'), 'Lista los cumpleaños del mes');
  ok([...d2.querySelectorAll('a')].some((a) => a.href.startsWith('https://wa.me/') && decodeURIComponent(a.href).includes('🎉') && decodeURIComponent(a.href).includes(nombre0.split(' ')[0])), 'Ofrece felicitar por WhatsApp con un mensaje predeterminado del cargo (varía entre varios textos)');
  await c2(b2('Entendido'));
  ok(!t2().includes('Cumpleaños de'), 'La ventana se cierra');
  // Indicadores con edad
  const tm = () => { const m = d2.querySelector('main') || d2.body; return m.textContent; };
  const nv = [...d2.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith('Indicadores'));
  await c2(nv);
  console.log('main:', tm().slice(0, 90));
  for (const b of [...d2.querySelectorAll('main button')].filter((x) => x.getAttribute('aria-expanded') === 'false')) await c2(b);
  const t = tm();
  ok(t.includes('Edad mediana') && t.includes('Distribución por edad') && t.includes('Edad promedio por cargo') && t.includes('Edad promedio por tienda') && t.includes('25 a 34 años'), 'Indicadores: edad mediana, distribución por rangos y edad por cargo y tienda');
  ok(!/NaN|undefined/.test(t), 'Sin NaN ni undefined');
  // Otros perfiles también la ven, sin la edad
  await c2(b2('Salir'));
  await c2(b2('Gerente General', 0)); await espera(300);
  ok(t2().includes('Cumpleaños de') && t2().includes('Hoy,'), 'Gerencia General también ve la ventana de cumpleaños');
  ok(!/cumple \d+ años|cumplió \d+/.test(t2()), 'Quien no es RRHH ni Administrador no ve la edad');
  ok([...d2.querySelectorAll('a')].some((a) => a.href.startsWith('https://wa.me/')), 'Gerencia General puede felicitar por WhatsApp');
  console.log('fin'); process.exit(process.exitCode || 0);
})();
