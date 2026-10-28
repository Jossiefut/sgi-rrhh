/* Recorre la demo (talento-balu.html) con cada perfil y extrae, tal como lo ve ese perfil:
   el menú por grupos y, para cada módulo, el título, el subtítulo, las pestañas y los botones principales.
   Uso: node manuales/extraer-menu.cjs > manuales/menu-por-perfil.json   (desde la carpeta del código) */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(raiz, 'talento-balu.html'), 'utf8') + '</body></html>';
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const limpiar = (t) => String(t || '').replace(/\s+/g, ' ').trim();
const PERFILES = [
  { rol: 'admin', boton: 'Administrador' },
  { rol: 'rrhh', boton: 'Gerente de RRHH' },
  { rol: 'analista', boton: 'Analista de RRHH' },
  { rol: 'general', boton: 'Gerente General' },
  { rol: 'junta', boton: 'Junta Directiva' },
  { rol: 'marca', boton: 'Gerente de Marca' },
  { rol: 'operaciones', boton: 'Gerente de Operaciones' },
  { rol: 'tienda', tienda: true },
  { rol: 'visor', boton: 'Visor General' },
  { rol: 'consulta', boton: 'Consulta RRHH Futura' },
];
(async () => {
  const salida = {};
  for (const p of PERFILES) {
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.print = () => {}; w.open = () => null; } });
    await espera(300);
    const w = dom.window, d = w.document;
    const click = async (el, ms = 160) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(ms); };
    if (p.tienda) {
      const sel = d.getElementById('login-tienda');
      const proto = w.HTMLSelectElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(sel, sel.options[1].value);
      sel.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(80);
      await click([...d.querySelectorAll('button')].find((b) => limpiar(b.textContent) === 'Entrar'), 300);
    } else {
      await click([...d.querySelectorAll('button')].find((b) => limpiar(b.textContent).startsWith(p.boton)), 300);
    }
    /* Cierra ventanas emergentes de bienvenida (cumpleaños, etc.) */
    for (let i = 0; i < 3; i++) { const b = [...d.querySelectorAll('[role=dialog] button')].find((x) => /Entendido|Cerrar/.test(x.textContent)); if (b) await click(b); }
    const navs = d.querySelectorAll('aside nav');
    const nav = navs[navs.length - 1];
    const grupos = [];
    let actual = null;
    for (const el of nav.children) {
      if (el.tagName === 'P') { actual = { grupo: limpiar(el.textContent), modulos: [] }; grupos.push(actual); continue; }
      const b = el.tagName === 'BUTTON' ? el : el.querySelector('button');
      if (!b) continue;
      if (!actual) { actual = { grupo: '', modulos: [] }; grupos.push(actual); }
      actual.modulos.push({ texto: limpiar(b.textContent).replace(/\s*\d+$/, '') });
    }
    for (const g of grupos) {
      for (const m of g.modulos) {
        /* El menú se vuelve a dibujar en cada cambio: se busca el botón de nuevo cada vez */
        const navActual = [...d.querySelectorAll('aside nav')].pop();
        const b = [...navActual.querySelectorAll('button')].find((x) => limpiar(x.textContent).replace(/\s*\d+$/, '') === m.texto);
        try { await click(b, 250); } catch (e) { m.error = String(e.message || e); continue; }
        const main = d.querySelector('main') || d.body;
        const h1 = main.querySelector('h1');
        m.titulo = h1 ? limpiar(h1.textContent) : '';
        const sub = h1 && h1.parentElement ? h1.parentElement.querySelector('p') : null;
        m.subtitulo = sub ? limpiar(sub.textContent) : '';
        m.pestanas = [...main.querySelectorAll('[role=tab]')].map((x) => limpiar(x.textContent).replace(/\s*\d+$/, '')).filter(Boolean);
        m.secciones = [...new Set([...main.querySelectorAll('h2, h3')].map((x) => limpiar(x.textContent)).filter((t) => t && t.length < 90))].slice(0, 25);
        m.acciones = [...new Set([...main.querySelectorAll('button')].map((x) => limpiar(x.textContent)).filter((t) => t && t.length > 2 && t.length < 50 && !/^\d+$/.test(t)))].slice(0, 30);
      }
    }
    salida[p.rol] = grupos;
    w.close();
  }
  process.stdout.write(JSON.stringify(salida, null, 1));
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
