css=open('dist/app.css').read(); js=open('dist/nube.js').read().replace('</script','<\\/script')
html=f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>SGI RRHH Marcas Propias</title>
<meta name="description" content="Sistema de Gesti&oacute;n Integrado de RRHH Marcas Propias: Bal&uacute; y Planeta">
<meta name="robots" content="noindex, nofollow">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#6B1E3F">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="icon" type="image/png" href="/icon-192.png">
<link rel="apple-touch-icon" href="/icon-192.png">
<style>
:root{{color-scheme:light;--fondo:#F7F5F8;--tinta:#1F1A24}}
html,body{{height:100%;margin:0}}
body{{background:var(--fondo);color:var(--tinta)}}
#root{{min-height:100%}}
@media (prefers-reduced-motion: reduce){{*{{animation:none!important;transition:none!important}}}}
{css}
</style>
</head>
<body>
<div id="root"></div>
<script>{js}</script>
<script>if('serviceWorker' in navigator){{window.addEventListener('load',function(){{navigator.serviceWorker.register('/sw.js').catch(function(){{}});}});}}</script>
</body>
</html>
'''
import os
os.makedirs('sitio', exist_ok=True)
open('sitio/index.html','w').write(html)
print(len(html))
