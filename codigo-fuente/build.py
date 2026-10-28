css=open('dist/app.css').read(); js=open('dist/app.js').read().replace('</script','<\\/script')
html=f'''<title>SGI RRHH Marcas Propias</title>
<meta name="description" content="Sistema de Gesti&oacute;n Integrado de RRHH Marcas Propias: Bal&uacute; y Planeta">
<style>
/* Diseño de un solo tema claro (decisión deliberada): fondo y colores explícitos */
:root{{color-scheme:light;--fondo:#F7F5F8;--tinta:#1F1A24}}
html,body{{height:100%}}
body{{background:var(--fondo);color:var(--tinta)}}
#root{{min-height:100%}}
@media (prefers-reduced-motion: reduce){{*{{animation:none!important;transition:none!important}}}}
{css}
</style>
<div id="root"></div>
<script>{js}</script>
'''
open('talento-balu.html','w').write(html)
print(len(html))
