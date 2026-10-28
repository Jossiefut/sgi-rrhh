#!/usr/bin/env python3
"""Lee las descripciones de puesto (PDF) y devuelve una lista de cargos en JSON.
Uso: leer-pdf-descripciones.py salida.json archivo1.pdf archivo2.pdf ...
No guarda nada del pie de firma (elaborado por/aprobado por)."""
import sys, json, re, pdfplumber

def limpia(t):
    return re.sub(r'\s+', ' ', str(t if t is not None else '').replace('\n', ' ')).strip()

def niveles_por_pagina(pdf):
    """Devuelve, en orden de aparición, (sección, nombre, nivel) leyendo la posición de la 'x'."""
    salida = []
    cab = None; seccion = ''
    for pg in pdf.pages:
        ws = pg.extract_words()
        filas = {}
        for w in ws:
            filas.setdefault(round(w['top'] / 3), []).append(w)
        ordenadas = [sorted(filas[k], key=lambda w: w['x0']) for k in sorted(filas)]
        prev = ''; saltar = False
        for idx, l in enumerate(ordenadas):
            if saltar: saltar = False; continue
            txt = limpia(' '.join(w['text'] for w in l))
            nums = [w for w in l if w['text'] in '12345' and len(w['text']) == 1]
            bajo = txt.lower()
            if bajo.startswith('competencias') and bajo != 'competencias':
                nombre = limpia(' '.join(w['text'] for w in l if w not in nums)).lower()
                seccion = 'organizacional' if 'organiz' in nombre else ('blanda' if 'blanda' in nombre else 'tecnica')
                if len(nums) == 5: cab = [(w['x0'] + w['x1']) / 2 for w in nums]
                continue
            if len(nums) == 5 and len(l) == 5:
                cab = [(w['x0'] + w['x1']) / 2 for w in nums]; continue
            if txt.startswith('Nombre del cargo'):
                salida.append(('__nuevo__', '', 0)); cab = None; continue
            xs = [w for w in l if w['text'] in ('x', 'X')]
            if cab and xs:
                xw = xs[0]; c = (xw['x0'] + xw['x1']) / 2
                nivel = 1 + min(range(5), key=lambda i: abs(cab[i] - c))
                nombre = limpia(' '.join(w['text'] for w in l if w is not xw))
                if not nombre:   # nombre partido en dos renglones: la x queda sola en medio
                    sig = ordenadas[idx + 1] if idx + 1 < len(ordenadas) else []
                    sig_txt = limpia(' '.join(w['text'] for w in sig))
                    if sig and not any(w['text'] in ('x', 'X') for w in sig) and not sig_txt.lower().startswith(('competencias', 'perfil')):
                        nombre = limpia(prev + ' ' + sig_txt); saltar = True
                    else:
                        nombre = prev
                if nombre:
                    salida.append((seccion, nombre, nivel))
                prev = ''
                continue
            elif cab and txt.startswith(('Perfil', 'Nivel Educativo')):
                cab = None
            else:
                prev = txt
        # salto de página conserva la última sección
    return salida

def leer(ruta):
    cargos = []; actual = None; modo = ''
    with pdfplumber.open(ruta) as pdf:
        filas = []
        for pg in pdf.pages:
            for t in pg.extract_tables():
                filas.extend(t)
        for r in filas:
            c = [limpia(x) for x in r] + [''] * 6
            k = c[0]
            if k == 'Nombre del cargo':
                actual = {'nombre': c[1], 'procesos': [], 'relaciones': {'internas': '', 'externas': ''}, 'perfil': {}, 'detalles': {}}
                cargos.append(actual); modo = 'resumen'; continue
            if actual is None: continue
            if k in ('Área/Departamento', 'Area/Departamento'): actual['area'] = c[1]
            elif k == 'Supervisor inmediato': actual['supervisor'] = c[1]
            elif k == 'Supervisa a': actual['supervisaA'] = c[1]
            elif k == 'Nivel Jerárquico': actual['nivelJerarquico'] = c[1]
            elif k == 'Objetivo del cargo': modo = 'objetivo'
            elif modo == 'objetivo' and k and k != 'Posición en la Organización':
                actual['objetivo'] = (actual.get('objetivo', '') + ' ' + k).strip()
            elif k == 'Posición en la Organización': modo = ''
            elif k == 'Funciones del puesto': modo = 'funciones'
            elif k == 'Proceso': continue
            elif modo == 'funciones' and (c[1] or k) and k != 'Relaciones':
                if k:
                    actual['procesos'].append({'proceso': k, 'funciones': []})
                if c[1] and actual['procesos']:
                    actual['procesos'][-1]['funciones'].append(c[1])
            elif k == 'Relaciones': modo = 'relaciones'
            elif modo == 'relaciones' and k == 'Internas': continue
            elif modo == 'relaciones' and k:
                actual['relaciones'] = {'internas': k, 'externas': c[1]}; modo = ''
            elif k == 'Detalles del cargo': modo = 'detalles'
            elif modo == 'detalles' and k in ('Sede', 'Tipo de jornada', 'Horario de trabajo', 'Herramientas requeridas', 'Herramientas asignadas'):
                d = actual['detalles']
                if k == 'Sede': d['sede'] = c[1]
                elif k == 'Tipo de jornada': d['jornada'] = c[1]; d['modalidad'] = c[3]
                elif k == 'Horario de trabajo': d['horario'] = c[1]; d['diasLibres'] = c[3]
                elif k == 'Herramientas requeridas': d['requeridas'] = limpia(c[1] + ' ' + c[2])
                elif k == 'Herramientas asignadas': d['asignadas'] = limpia(c[1] + ' ' + c[2])
            elif k == 'Perfil': modo = 'perfil'
            elif modo in ('perfil', 'detalles', 'competencias', '') and (k in ('Nivel Educativo', 'Experiencia', 'Disponibilidad para viajar', 'Género') or (k == '' and c[4].lower().startswith('nivel')) or (k.startswith(('Ubicación', 'Manejo de dinero', 'Manejo de información')) and c[1] not in ('', 'x')) or k == 'Requisitos adicionales'):
                p = actual['perfil']
                if k == 'Requisitos adicionales': continue
                if k.startswith(('Ubicación', 'Manejo de dinero', 'Manejo de información')):
                    p.setdefault('otros', [])
                    p['otros'].append(f"{k}: {c[1]}")
                    if c[3]: p['otros'].append(f"{limpia(c[3])}: {c[4]}")
                    continue
                if k == 'Nivel Educativo': p['nivelEducativo'] = c[1]; p['carrera'] = c[4]
                elif k == 'Experiencia': p['experiencia'] = c[1]; p['idiomas'] = c[4]
                elif k == '' and c[4].lower().startswith('nivel'): p['idiomas'] = limpia(p.get('idiomas', '') + ' ' + c[4])
                elif k == 'Disponibilidad para viajar': p['disponibilidadViajar'] = c[1]; p['carroPropio'] = c[4]
                elif k == 'Género': p['_genero'] = c[1]; p['_edad'] = c[4]
    lv = niveles_por_pagina(pdfplumber.open(ruta))
    # reparte las competencias por cargo: cada cargo reinicia en 'organizacional' o 'tecnica' tras una sección blanda
    grupos = []
    for s, n, v in lv:
        if s == '__nuevo__': grupos.append([]); continue
        if grupos: grupos[-1].append((s, n, v))
    return cargos, grupos


def leer_xlsx(ruta, hojas=None):
    """Lee descripciones de puesto en Excel (una hoja por cargo). Devuelve {hoja: (cargo, grupo_competencias)}."""
    import openpyxl
    wb = openpyxl.load_workbook(ruta, data_only=True)
    salida = {}
    for ws in wb:
        if hojas and ws.title not in hojas: continue
        filas = [[limpia(c) if c is not None else '' for c in r] + [''] * 8 for r in ws.iter_rows(values_only=True)]
        c = {'nombre': '', 'procesos': [], 'relaciones': {'internas': '', 'externas': ''}, 'perfil': {}, 'detalles': {}}
        grupo = []; modo = ''; seccion = ''
        for r in filas:
            k = r[0]
            if not k and not any(r[1:6]) and modo != 'funciones': continue
            if k == 'Nombre del cargo': c['nombre'] = r[1]; continue
            if not c['nombre']: continue
            if k in ('Área/Departamento', 'Area/Departamento'): c['area'] = r[1]
            elif k == 'Supervisor inmediato': c['supervisor'] = r[1]
            elif k.startswith('Supervisa a'): c['supervisaA'] = r[1]
            elif k == 'Nivel Jerárquico': c['nivelJerarquico'] = r[1]
            elif k == 'Objetivo del cargo': modo = 'objetivo'
            elif modo == 'objetivo' and k and k != 'Posición en la Organización': c['objetivo'] = (c.get('objetivo', '') + ' ' + k).strip()
            elif k == 'Posición en la Organización': modo = ''
            elif k == 'Funciones del puesto': modo = 'funciones'
            elif k == 'Proceso' and r[1] == 'Funciones': continue
            elif modo == 'funciones' and k != 'Relaciones' and (k or r[1]):
                if k: c['procesos'].append({'proceso': k, 'funciones': []})
                if r[1] and c['procesos']: c['procesos'][-1]['funciones'].append(r[1])
            elif k == 'Relaciones': modo = 'relaciones'
            elif modo == 'relaciones' and k in ('Internas', 'Externas'): c['relaciones'][k.lower()] = r[1]
            elif k == 'Detalles del cargo': modo = 'detalles'
            elif k == 'Sede': c['detalles']['sede'] = r[1]
            elif k == 'Tipo de jornada': c['detalles']['jornada'] = r[1]; c['detalles']['modalidad'] = r[4]
            elif k == 'Horario de trabajo': c['detalles']['horario'] = r[1]; c['detalles']['diasLibres'] = r[4]
            elif k == 'Herramientas requeridas': c['detalles']['requeridas'] = r[1]
            elif k == 'Herramientas asignadas': c['detalles']['asignadas'] = r[1]
            elif k == 'Competencias': modo = 'comp'
            elif modo == 'comp' and k.lower().startswith('competencias'):
                seccion = 'organizacional' if 'organiz' in k.lower() else ('blanda' if 'blanda' in k.lower() else 'tecnica')
            elif modo == 'comp' and k and k not in ('Perfil',):
                niv = [i for i in range(1, 6) if r[i].upper() == 'X']
                if niv: grupo.append((seccion, k, niv[0]))
            elif k == 'Perfil': modo = 'perfil'
            elif k == 'Nivel Educativo': c['perfil']['nivelEducativo'] = r[1]; c['perfil']['carrera'] = r[4]
            elif k == 'Experiencia': c['perfil']['experiencia'] = r[1]; c['perfil']['idiomas'] = limpia(r[4] + ' ' + r[5])
            elif k == '' and r[4] == 'Nivel' and r[5]: c['perfil']['idiomas'] = limpia(c['perfil'].get('idiomas', '') + ' Nivel ' + r[5])
            elif k == 'Certificaciones': c['perfil'].setdefault('otros', []).append('Certificaciones: ' + r[1])
            elif k == 'Disponibilidad para viajar': c['perfil']['disponibilidadViajar'] = r[1]; c['perfil']['carroPropio'] = r[4]
            elif k.startswith(('Ubicación', 'Manejo de dinero', 'Manejo de información')) and r[1] not in ('', 'X', 'x'):
                c['perfil'].setdefault('otros', []).append(f"{k}: {r[1]}")
            elif k == 'ELABORADO POR': modo = 'fin'
        if c['nombre']: salida[ws.title] = (c, grupo)
    return salida

if __name__ == '__main__':
    out = {}
    for ruta in sys.argv[2:]:
        if ruta.endswith('.xlsx'):
            hojas = leer_xlsx(ruta)
            out[ruta.split('/')[-1]] = {'cargos': [v[0] for v in hojas.values()], 'competencias': [v[1] for v in hojas.values()], 'hojas': list(hojas)}
            continue
        cargos, grupos = leer(ruta)
        out[ruta.split('/')[-1]] = {'cargos': cargos, 'competencias': grupos}
    json.dump(out, open(sys.argv[1], 'w'), ensure_ascii=False)
    for k, v in out.items():
        print(k[:50], len(v['cargos']), 'cargos', len(v['competencias']), 'grupos comp')
        if 'hojas' in v: print('   hojas:', v['hojas'])
        for c in v['cargos']:
            print('   ', c['nombre'], '|', len(c['procesos']), 'proc', sum(len(p['funciones']) for p in c['procesos']), 'fun')
