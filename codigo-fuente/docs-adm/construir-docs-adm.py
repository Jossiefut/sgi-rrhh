#!/usr/bin/env python3
"""
Construye ../documentos-adm.js a partir de los originales en ./originales (PDF).
Cada página se rasteriza (WebP) y se acompaña de los campos que el sistema rellena
con los datos del trabajador (nombre, cédula, cargo, fecha, dirección, teléfono).
Las coordenadas están en puntos PDF medidos desde la esquina superior izquierda.
Uso:  python3 construir-docs-adm.py            (genera documentos-adm.js)
      python3 construir-docs-adm.py --previa   (además deja vistas previas en ./previas)
"""
import base64, io, json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
ORIG = os.path.join(AQUI, 'originales')
SALIDA = os.path.join(AQUI, '..', 'documentos-adm.js')

# Valores de ejemplo solo para la vista previa
EJEMPLO = {'NOMBRES_APELLIDOS': 'MARÍA ALEJANDRA PÉREZ GÓMEZ', 'APELLIDOS_NOMBRES': 'PÉREZ GÓMEZ MARÍA ALEJANDRA', 'CEDULA': 'V-12.345.678',
           'CEDULA_SIMPLE': '12.345.678', 'CARGO': 'Analista de Compensación y Beneficios', 'FECHA_CARTA': 'Caracas, 14 de octubre del 2026', 'FECHA': '14/10/2026',
           'NOMBRES': 'MARÍA ALEJANDRA', 'APELLIDOS': 'PÉREZ GÓMEZ', 'DIRECCION': 'Av. Principal de Los Ruices, Edif. Centro, Piso 3, Caracas', 'TELEFONO': '0414-1234567'}

def F(v, x, y, size=9, w=0, negrita=False, cubre=None, alinear='izq', cursiva=False, mayus=False, resto=None, tienda=False, plantilla=None, lh=0, n=0):
    d = {'v': v, 'x': x, 'y': y, 's': size}
    if tienda: d['t'] = 1            # solo se aplica al personal de tiendas (Balú o Planeta); el administrativo conserva el original
    if plantilla: d['tx'] = plantilla  # texto con variables {RAZON_SOCIAL}, {RIF}, {DOMICILIO}, {CARGO}, {FIRMANTE_NOMBRE}, {FIRMANTE_CARGO}
    if lh: d['lh'] = lh              # interlineado: el texto se reparte en hasta n líneas dentro del ancho w
    if n: d['n'] = n
    if w: d['w'] = w
    if negrita: d['b'] = 1
    if cursiva: d['i'] = 1
    if cubre: d['c'] = cubre
    if alinear != 'izq': d['a'] = alinear
    if mayus: d['m'] = 1
    if resto: d['r'] = resto          # segundo recuadro donde continúa el texto largo
    return d

# (clave, nombre, archivo, dpi, escala de grises, calidad, {pagina: [campos]})
DOCS = [
    ('hoja-de-vida', 'Hoja de vida', '01_hoja_de_vida.pdf', 130, False, 74, {
        1: [F('APELLIDOS_NOMBRES', 146, 158, 7.5, 150), F('CEDULA', 416, 158, 7.5, 85), F('CARGO', 46, 573, 7.5, 140)]}),
    ('antecedente-clinico', 'Antecedente clínico', '02_antecedente_clinico.pdf', 130, False, 74, {
        1: [F('NOMBRES', 52, 80, 6.5, 160), F('APELLIDOS', 197, 80, 6.5, 105), F('CEDULA', 314, 80, 6.5, 80), F('FECHA', 498, 80, 6.5, 55)]}),
    ('reglamento-interno', 'Reglamento interno', '03_reglamento_interno.pdf', 130, False, 74, {
        1: [F('FECHA_CARTA', 527, 91, 11, 0, cubre=[345, 80, 530, 96], alinear='der'),
            F('NOMBRES_APELLIDOS', 85.2, 143.5, 11, 215, True, cubre=[84, 132, 306, 147], cursiva=True, mayus=True),
            F('CEDULA_CI', 85.2, 158, 11, 0, True, cubre=[84, 147, 306, 161], cursiva=True)]}),
    ('notificacion-de-riesgo', 'Notificación de riesgo (oficina)', '04_notificacion_de_riesgo.pdf', 125, False, 72, {}),
    ('normativa-trabajo-seguro', 'Normativa de trabajo seguro', '05_normativa_trabajo_seguro.pdf', 130, False, 74, {}),
    ('rutagrama', 'Rutagrama (ruta habitual de traslado)', '06_rutagrama.pdf', 130, False, 74, {
        1: [F('FECHA', 430, 60, 10, 90), F('DIRECCION', 130, 557, 9, 400), F('TELEFONO', 96, 598, 9, 150),
            F('NOMBRES_APELLIDOS', 52, 726, 9, 290), F('CEDULA', 92, 757, 9, 150)]}),
    ('triptico-i', 'Tríptico I (estaciones manuales, extintor, fuego, evacuación)', '07a_triptico_i.pdf', 110, False, 70, {}),
    ('triptico-ii', 'Tríptico II (primeros auxilios)', '07b_triptico_ii.pdf', 110, False, 70, {}),
    ('acuse-de-recibo', 'Acuse de recibo', '08_acuse_de_recibo.pdf', 130, False, 74, {
        1: [F('NOMBRES_APELLIDOS', 80, 106.5, 9, 150, mayus=True), F('CEDULA_SIMPLE', 280, 106.5, 9, 150),
            F('CARGO', 461, 128, 8, 66, resto=[58, 148.5, 62])]}),
    ('carta-de-prestaciones', 'Carta de prestaciones sociales', '09_carta_de_prestaciones.pdf', 130, False, 74, {
        1: [F('NOMBRES_APELLIDOS', 80, 181, 9.5, 235, mayus=True), F('CEDULA_SIMPLE', 58, 202, 9.5, 130),
            F('NOMBRES_APELLIDOS', 184, 595, 9, 150, mayus=True), F('CEDULA_SIMPLE', 124, 616, 9, 105)]}),
    ('manual-normativo-de-ventas', 'Manual normativo de ventas', '10_manual_normativa_ventas.pdf', 130, False, 74, {
        1: [F('FECHA_CARTA', 527, 80, 11, 0, cubre=[345, 69, 530, 85], alinear='der'),
            F('NOMBRES_APELLIDOS', 85.2, 131.5, 11, 215, True, cubre=[84, 119, 306, 134], cursiva=True, mayus=True),
            F('CEDULA_CI', 85.2, 146, 11, 0, True, cubre=[84, 134, 306, 149], cursiva=True),
            F('PRESENTE', 85.2, 160.5, 11, 0, True, cubre=[84, 149, 306, 164], cursiva=True),
            F('NOMBRES_APELLIDOS', 210, 513, 9, 135, mayus=True), F('CEDULA_SIMPLE', 157, 542, 9, 90)]}),
    ('ficha-rnet', 'Ficha del trabajador (RNET)', '11_ficha_rnet.pdf', 130, False, 74, {
        1: [F('CARGO', 368, 89.5, 8, 170), F('APELLIDOS_NOMBRES', 148, 105, 8, 180), F('CEDULA', 369, 105, 8, 100), F('CEDULA_SIMPLE', 441, 565, 8, 80)]}),
    ('planilla-de-estacionamiento', 'Planilla de estacionamiento', '12_planilla_estacionamiento.pdf', 100, True, 62, {}),
]

# --- Personal de tiendas: los originales son de Futura Retail; para Balú y Planeta se cubre el logo y el nombre de Futura y se escribe
#     la razón social de la marca (y su logo). Todo se calcula con las variables de la marca; el original administrativo no cambia. ---
LOGO_FUTURA = {  # (clave, página) -> recuadro del logo de Futura en puntos [x0, y0, x1, y1]
    ('antecedente-clinico', 1): [43, 14, 131, 47],
    ('reglamento-interno', 1): [85, 35, 174, 68], ('reglamento-interno', 2): [85, 35, 174, 68], ('reglamento-interno', 3): [85, 35, 174, 68],
    ('normativa-trabajo-seguro', 1): [85, 35, 174, 68], ('normativa-trabajo-seguro', 2): [85, 35, 174, 68],
    ('acuse-de-recibo', 1): [57, 42, 146, 76], ('carta-de-prestaciones', 1): [54, 35, 143, 68], ('manual-normativo-de-ventas', 1): [85, 35, 174, 68],
}
RAZON_REGLAMENTO_9 = 'Administraciones de {RAZON_SOCIAL}; que no sean expresamente laboral, esta prohibición se extiende hasta el personal de tiendas.'
RAZON_REGLAMENTO_FIN = 'El incumplimiento por parte de los empleados de {RAZON_SOCIAL}, de la normativa antes expuesta acarreará las sanciones y acciones disciplinarias.'
NOTIFICACION = ('{RAZON_SOCIAL}, sociedad mercantil identificada con el Registro de Información Fiscal (RIF) {RIF}, con domicilio en {DOMICILIO}, a fin de dar cumplimiento a lo preceptuado en los artículos Cincuenta y tres (53) y Cincuenta y seis (56) '
                'de la Ley Orgánica de Prevención, Condiciones y Medio Ambiente de Trabajo (LOPCYMAT), en nombre de {RAZON_SOCIAL}, cumplo con informarle que, con motivo del desempeño de sus labores como {CARGO} en {RAZON_SOCIAL}, '
                'usted podría estar expuesta/o a riesgos que más abajo se describen, así como los medios y medidas para prevenirlos y mitigarlos.')
CAMPOS_TIENDA = {  # clave -> {página: [campos]}
    'reglamento-interno': {
        2: [F('TXT', 121.2, 237.2, 11, 409, cubre=[120, 226, 532, 255.5], plantilla=RAZON_REGLAMENTO_9, lh=14.5, n=2, tienda=True)],
        3: [F('TXT', 85.2, 257.4, 11, 445, cubre=[84, 246, 532, 276], plantilla=RAZON_REGLAMENTO_FIN, lh=14.5, n=2, tienda=True),
            F('TXT', 121.2, 369.0, 10.5, 200, cubre=[120, 358, 290, 391], plantilla='{FIRMANTE_NOMBRE}', tienda=True),
            F('TXT', 121.2, 383.5, 10.5, 200, plantilla='{FIRMANTE_CARGO}', tienda=True)]},
    'notificacion-de-riesgo': {
        1: [F('TXT', 115.6, 176.2, 5.4, 560, cubre=[114.2, 162, 677.0, 214.5], plantilla=NOTIFICACION, lh=6.7, n=5, tienda=True)]},
    'rutagrama': {
        1: [F('TXT', 132.9, 58.4, 11, 255, negrita=True, cubre=[132.4, 49.8, 231, 62.4], plantilla='{RAZON_SOCIAL}', tienda=True)]},
    'acuse-de-recibo': {
        1: [F('TXT', 129.9, 128.6, 7.6, 328, negrita=True, cubre=[129, 116.5, 459, 132.5], plantilla='{RAZON_SOCIAL}  RIF: {RIF}  en calidad de:', lh=9, n=1, tienda=True)]},
    'carta-de-prestaciones': {
        1: [F('TXT', 54.0, 139.2, 12, 330, negrita=True, cubre=[53, 126.5, 190, 142], plantilla='{RAZON_SOCIAL}', tienda=True)]},
    'ficha-rnet': {
        1: [F('TXT', 52.6, 88.5, 9, 275, negrita=True, cubre=[52, 80.6, 191, 91.4], plantilla='RAZÓN SOCIAL: {RAZON_SOCIAL}', tienda=True)]},
}

def verificar_cobertura():
    """Garantiza que nada de Futura (logo, nombre, firmante, RIF) quede visible en la versión para tiendas."""
    import pymupdf
    faltan = []
    def dentro(r, b, tol=2): return r.x0 >= b[0] - tol and r.y0 >= b[1] - tol and r.x1 <= b[2] + tol and r.y1 <= b[3] + tol
    for clave, nombre, archivo, *_ in DOCS:
        doc = pymupdf.open(os.path.join(ORIG, archivo))
        for i, pg in enumerate(doc, 1):
            cub = [c['c'] for c in CAMPOS_TIENDA.get(clave, {}).get(i, []) if c.get('c')]
            for q in ('FUTURA', 'DANIELA', '502141219'):
                for r in pg.search_for(q):
                    if not any(dentro(r, b) for b in cub): faltan.append(f'{clave} p{i}: texto «{q}» sin cubrir en {[round(v) for v in r]}')
            for im in pg.get_image_info():
                if (im['width'], im['height']) in {(246, 91), (247, 91), (369, 137)}:
                    r = pymupdf.Rect(im['bbox']); lg = LOGO_FUTURA.get((clave, i))
                    if not (lg and dentro(r, lg)): faltan.append(f'{clave} p{i}: logo de Futura sin sustituir en {[round(v) for v in r]}')
    if faltan: raise SystemExit('Quedaría algo de Futura en los documentos de tiendas:\n  ' + '\n  '.join(faltan))
    print('Cobertura verificada: ningún logo, nombre, firmante ni RIF de Futura queda visible en la versión para tiendas.')

def paginas_pdf(ruta):
    out = subprocess.run(['pdfinfo', '-f', '1', '-l', '99', ruta], capture_output=True, text=True).stdout
    tam = []
    for l in out.splitlines():
        if l.startswith('Page') and 'size' in l:
            a = l.split(':')[1].split('x'); w = float(a[0]); h = float(a[1].split()[0]); tam.append((w, h))
    return tam

def construir(previa):
    verificar_cobertura()
    docs = []
    total = 0
    if previa:
        os.makedirs(os.path.join(AQUI, 'previas'), exist_ok=True)
    for orden, (clave, nombre, archivo, dpi, gris, q, campos) in enumerate(DOCS, 1):
        ruta = os.path.join(ORIG, archivo)
        tams = paginas_pdf(ruta)
        pags = []
        with tempfile.TemporaryDirectory() as tmp:
            subprocess.run(['pdftoppm', '-r', str(dpi), '-png', ruta, os.path.join(tmp, 'p')], check=True)
            archivos = sorted(f for f in os.listdir(tmp) if f.endswith('.png'))
            for i, f in enumerate(archivos, 1):
                im = Image.open(os.path.join(tmp, f)).convert('L' if gris else 'RGB')
                buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
                b = buf.getvalue(); total += len(b)
                w, h = tams[i - 1] if i - 1 < len(tams) else (im.width * 72 / dpi, im.height * 72 / dpi)
                pag = {'w': round(w, 1), 'h': round(h, 1), 'img': 'data:image/webp;base64,' + base64.b64encode(b).decode(), 'campos': campos.get(i, []) + CAMPOS_TIENDA.get(clave, {}).get(i, [])}
                if (clave, i) in LOGO_FUTURA: pag['logo'] = LOGO_FUTURA[(clave, i)]
                pags.append(pag)
                if previa and campos.get(i):  # vista previa del original administrativo (sin las capas de tiendas)
                    pv = im.convert('RGB'); dr = ImageDraw.Draw(pv); k = dpi / 72
                    for c in campos[i]:
                        if c.get('t'): continue
                        if c.get('c'):
                            x0, y0, x1, y1 = [v * k for v in c['c']]; dr.rectangle([x0, y0, x1, y1], fill='white')
                        txt = EJEMPLO.get(c['v'], 'C.I. V-12.345.678' if c['v'] == 'CEDULA_CI' else 'Presente.' if c['v'] == 'PRESENTE' else c['v'])
                        if c['v'] == 'CEDULA_CI': txt = 'C.I. ' + EJEMPLO['CEDULA']
                        try: ft = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', int(c['s'] * k))
                        except Exception: ft = ImageFont.load_default()
                        x = c['x'] * k
                        if c.get('a') == 'der': x = c['x'] * k - dr.textlength(txt, font=ft)
                        dr.text((x, c['y'] * k), txt, fill='#0a2a8a', font=ft, anchor='ls' if c.get('a') != 'der' else 'ls')
                    pv.save(os.path.join(AQUI, 'previas', f'{orden:02d}-{clave}-{i}.png'))
        docs.append({'clave': clave, 'nombre': nombre, 'orden': orden, 'paginas': pags})
    cab = ('/* GENERADO por docs-adm/construir-docs-adm.py a partir de los originales de docs-adm/originales. No editar a mano.\n'
           ' * Documentos de ingreso del personal administrativo (Futura Retail, C.A.): cada página es la imagen del original y\n'
           ' * los campos (x, y en puntos desde la esquina superior izquierda) se rellenan con los datos del trabajador.\n'
           ' * Los campos con t=1 y el recuadro logo solo se aplican al personal de tiendas (Balú o Planeta). */\n')
    js = cab + 'export const DOCS_ADM = ' + json.dumps(docs, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(SALIDA, 'w', encoding='utf8').write(js)
    print('documentos-adm.js:', round(len(js) / 1024 / 1024, 2), 'MB;', sum(len(d['paginas']) for d in docs), 'páginas;', round(total / 1024), 'KB de imágenes')

if __name__ == '__main__':
    construir('--previa' in sys.argv)
