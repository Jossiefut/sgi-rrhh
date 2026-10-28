#!/usr/bin/env python3
"""Convierte las descripciones de cargo de Balú (formato «DESCRIPCIÓN DE PUESTO DE TRABAJO»)
en datos estructurados. Entrada: texto de pdftotext -layout. Salida: JSON por cargo.
Uso: python3 parsear-dc.py archivo.txt [...] > salida.json"""
import json, re, sys

def bloques(texto):
    partes = re.split(r'\n\s*DESCRIPCIÓN DE PUESTO DE TRABAJO\s*\n', '\n' + texto)
    return [p for p in partes if 'Nombre del cargo' in p]

def campo(lineas, etiqueta):
    for l in lineas:
        if l.strip().startswith(etiqueta):
            return re.sub(r'\s+', ' ', l.strip()[len(etiqueta):]).strip()
    return ''

def entre(lineas, ini, fin):
    i = next((k for k, l in enumerate(lineas) if l.strip().startswith(ini)), None)
    if i is None: return []
    j = next((k for k in range(i + 1, len(lineas)) if lineas[k].strip().startswith(fin)), len(lineas))
    return lineas[i + 1:j]

def oraciones(fragmentos):
    """Une líneas partidas: una función nueva empieza con mayúscula."""
    out = []
    for f in fragmentos:
        f = f.strip()
        if not f: continue
        if out and (f[0].islower() or out[-1].endswith((',', ' y', ' de', ' la', ' el', ' a', ' en', ' del', ' los', ' las', ' con', ' que', ' para', ' por'))):
            out[-1] += ' ' + f
        else:
            out.append(f)
    return [re.sub(r'\s+', ' ', o) for o in out]

def funciones(lineas):
    zona = entre(lineas, 'Proceso', 'Relaciones')
    if not zona:
        zona = entre(lineas, 'Funciones del puesto', 'Relaciones')
    # columna derecha: donde empiezan las funciones
    col = min((len(l) - len(l.lstrip()) for l in zona if len(l) - len(l.lstrip()) > 40), default=60)
    items, procesos = [], []
    for k, l in enumerate(zona):
        izq, der = l[:col].strip(), l[col:].strip() if len(l) > col else ''
        if izq and not izq.startswith('Proceso'):
            procesos.append((k, re.sub(r'\s+', ' ', izq)))
        if der:
            if items and (der[0].islower() or der[0] in '(' ):
                items[-1][1] += ' ' + der
            else:
                items.append([k, der])
    # un mismo proceso puede repetirse por salto de página: se unifica
    vistos = []
    for _, p in procesos:
        if p not in vistos: vistos.append(p)
    grupos = {p: [] for p in vistos}
    # La etiqueta del proceso queda centrada verticalmente en su grupo de funciones:
    # cada límite se obtiene reflejando el límite anterior sobre la etiqueta (b_i = 2*c_i - b_(i-1)).
    if procesos and items:
        filas = [k for k, l in enumerate(zona) if len(l) > col and l[col:].strip()]
        ini, fin = filas[0], filas[-1] + 1
        limites, b = [], ini
        for idx, (c, _) in enumerate(procesos):
            if idx == len(procesos) - 1: b = fin
            else:
                b = max(b + 1, round(2 * c + 1 - b))
                b = min(b, procesos[idx + 1][0] + 1)
            limites.append(b)
        for k, t in items:
            j = next((i for i, lim in enumerate(limites) if k < lim), len(procesos) - 1)
            grupos[procesos[j][1]].append(re.sub(r'\s+', ' ', t).strip())
    return [{'proceso': p, 'funciones': f} for p, f in grupos.items() if f]

def competencias(lineas, tipo):
    """tipo: 'técnicas' o 'blandas'. Nivel 1-5 según la columna de la «x»."""
    i = next((k for k, l in enumerate(lineas) if f'Competencias {tipo}' in l), None)
    if i is None: return []
    cab = lineas[i]
    base = cab.index(f'Competencias {tipo}') + 20
    cols = [base + m.start() for m in re.finditer(r'\b[1-5]\b', cab[base:])]
    if not cols:  # cabecera sin números: se usan las columnas de las competencias técnicas
        j = next((k for k, l in enumerate(lineas) if 'Competencias técnicas' in l), None)
        if j is not None:
            c2 = lineas[j]; b2 = c2.index('Competencias técnicas') + 20
            cols = [b2 + m.start() for m in re.finditer(r'\b[1-5]\b', c2[b2:])]
    out, pendiente = [], ''
    for l in lineas[i + 1:]:
        s = l.strip()
        if not s: continue
        if s.startswith('Competencias') or s.startswith('Perfil'): break
        if 'x' not in l.split()[-1:] and not re.search(r'\sx\s*$', l):
            pendiente = (pendiente + ' ' + s).strip(); continue
        x = l.rstrip().rfind('x')
        nombre = (pendiente + ' ' + l[:x].strip()).strip(); pendiente = ''
        nivel = (min(range(len(cols)), key=lambda c: abs(cols[c] - x)) + 1) if cols else None
        out.append({'nombre': re.sub(r'\s+', ' ', nombre), 'nivel': nivel})
    # competencias sin «x» (sin nivel marcado)
    return out

def perfil(lineas):
    zona = entre(lineas, 'Perfil', 'ELABORADO POR')
    txt = '\n'.join(zona)
    def val(etq, corte):
        m = re.search(etq + r'\s+(.*?)\s{2,}' + corte, txt)
        return re.sub(r'\s+', ' ', m.group(1)).strip() if m else ''
    nivel = val('Nivel Educativo', 'Carrera')
    carrera = re.search(r'Carrera\s+(.+)', txt)
    exp_lineas = []
    for l in zona:
        s = l.strip()
        if s.startswith('Requisitos adicionales'): break
        izq = re.split(r'\s{3,}', s)
        if s.startswith('Experiencia') or (exp_lineas is not None and len(l) - len(l.lstrip()) > 40 and not s.startswith(('Inglés', 'Nivel'))):
            t = re.sub(r'^(Experiencia|Nivel Educativo)', '', s).strip()
            t = re.split(r'\s{3,}(Inglés|Idiomas|Nivel|Carrera)', t)[0].strip()
            if t and not t.startswith(('Opcional', 'Básico')): exp_lineas.append(t)
    edad = re.search(r'Edad\s+(.+)', txt)
    viajar = re.search(r'Disponibilidad para viajar\s+(\S+)', txt)
    return {
        'nivelEducativo': nivel,
        'carrera': re.sub(r'\s+', ' ', carrera.group(1)).strip() if carrera else '',
        'experiencia': re.sub(r'\s+', ' ', ' '.join(x for x in exp_lineas if not x.startswith(nivel[:12] or '§'))).replace(' Idiomas ', ' ').strip(),
        'idiomas': 'Inglés opcional, nivel básico' if 'Inglés' in txt else '',
        'edad': re.sub(r'\s+', ' ', edad.group(1)).strip() if edad else '',
        'disponibilidadViajar': viajar.group(1) if viajar else '',
    }

def cargo(bloque):
    L = bloque.split('\n')
    obj = ' '.join(x.strip() for x in entre(L, 'Objetivo del cargo', 'Posición en la Organización') if x.strip())
    rel_int = campo(L, 'Internas'); rel_ext = campo(L, 'Externas')
    return {
        'nombre': campo(L, 'Nombre del cargo'),
        'area': campo(L, 'Área/Departamento'),
        'supervisorInmediato': campo(L, 'Supervisor inmediato'),
        'supervisaA': campo(L, 'Supervisa a'),
        'nivelJerarquico': campo(L, 'Nivel Jerárquico'),
        'objetivo': re.sub(r'\s+', ' ', obj).replace(' ,', ','),
        'procesos': funciones(L),
        'relaciones': {'internas': rel_int, 'externas': rel_ext},
        'jornada': re.split(r'\s{3,}', campo(L, 'Tipo de jornada'))[0],
        'horario': re.split(r'\s{3,}', campo(L, 'Horario de trabajo'))[0],
        'herramientasRequeridas': campo(L, 'Herramientas requeridas'),
        'herramientasAsignadas': campo(L, 'Herramientas asignadas'),
        'competenciasTecnicas': competencias(L, 'técnicas'),
        'competenciasBlandas': competencias(L, 'blandas'),
        'perfil': perfil(L),
        'elaboradoPor': (re.search(r'ELABORADO POR\s+(\S+(?: \S+)?)', bloque) or [None, ''])[1].strip(),
        'fecha': (re.search(r'FECHA\s+(\d{2}/\d{2}/\d{4})', bloque) or [None, ''])[1],
    }

if __name__ == '__main__':
    res = {}
    for f in sys.argv[1:]:
        res[f.split('/')[-1]] = [cargo(b) for b in bloques(open(f, encoding='utf8').read())]
    json.dump(res, sys.stdout, ensure_ascii=False, indent=1)
