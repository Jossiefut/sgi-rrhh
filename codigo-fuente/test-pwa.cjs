/* v1.15.0: la app se puede instalar en Android desde Chrome (PWA). */
const fs = require('fs'); const cp = require('child_process');
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const sitio = fs.readFileSync('sitio/index.html', 'utf8');
ok(sitio.includes('rel="manifest" href="/manifest.webmanifest"'), 'El sitio publicado enlaza el manifiesto');
ok(sitio.includes('name="theme-color"') && sitio.includes("serviceWorker.register('/sw.js')"), 'Color de tema y registro del service worker');
ok(!fs.readFileSync('talento-balu.html', 'utf8').includes('serviceWorker.register'), 'La demo/artefacto no registra service worker');
const m = JSON.parse(fs.readFileSync('pwa/manifest.webmanifest', 'utf8'));
ok(m.display === 'standalone' && m.start_url && m.name && m.short_name && m.lang === 'es', 'Manifiesto: nombre, inicio y modo de aplicación');
ok(m.icons.some((i) => i.sizes === '192x192') && m.icons.some((i) => i.sizes === '512x512' && i.purpose === 'any') && m.icons.some((i) => i.purpose === 'maskable'), 'Manifiesto: íconos 192, 512 y maskable');
const png = (f) => { const b = fs.readFileSync(f); return b.slice(1, 4).toString() === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };
ok(m.icons.every((i) => { const d = png('pwa' + i.src); const n = Number(i.sizes.split('x')[0]); return d && d[0] === n && d[1] === n; }), 'Los íconos existen y tienen el tamaño declarado');
ok(cp.spawnSync('node', ['--check', 'pwa/sw.js']).status === 0, 'El service worker es JavaScript válido');
const sw = fs.readFileSync('pwa/sw.js', 'utf8');
ok(sw.includes('u.origin !== self.location.origin') && sw.includes('fetch(r)'), 'El service worker no guarda datos de otros orígenes y prioriza la red');
const vj = JSON.parse(fs.readFileSync('../sgi-rrhh/vercel.json', 'utf8'));
ok(vj.headers.some((h) => h.source === '/sw.js'), 'Vercel: el service worker no se guarda en caché');
ok(m.theme_color === '#6B1E3F' && !/talent\s*booth|futura/i.test(JSON.stringify(m) + sw), 'Sin nombres ni logos ajenos');
