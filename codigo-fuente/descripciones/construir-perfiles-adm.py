#!/usr/bin/env python3
"""Genera perfiles-adm.js a partir de las descripciones de puesto (PDF, ya leídas con leer-pdf-descripciones.py)
y de los diccionarios de competencias (Excel) de Balú y Planeta Sports.
Uso: construir-perfiles-adm.py dc.json diccionario-balu.xlsx diccionario-planeta.xlsx salida.js
No se copian datos personales ni el pie de firma; se retira el nombre de la casa matriz."""
import sys, json, re, unicodedata, openpyxl

def norm(t):
    t = unicodedata.normalize('NFD', str(t or '').lower())
    return re.sub(r'[^a-z0-9]+', ' ', ''.join(c for c in t if unicodedata.category(c) != 'Mn')).strip()

def limpia_texto(t):
    t = str(t or '')
    t = re.sub(r'Junta Directiva de Futura Retail', 'Junta Directiva', t)
    t = re.sub(r'Futura Retail', 'la corporación', t)
    t = re.sub(r'Futura', 'la corporación', t)
    return re.sub(r'\s+', ' ', t).strip()

def limpia(o):
    if isinstance(o, str): return limpia_texto(o)
    if isinstance(o, list): return [limpia(x) for x in o]
    if isinstance(o, dict): return {k: limpia(v) for k, v in o.items()}
    return o

dc = json.load(open(sys.argv[1]))
def doc(prefijo):
    k = [x for x in dc if x.startswith(prefijo)][0]
    return dc[k]

# nombre en el documento (normalizado) -> (nombre canónico, familia, nivel jerárquico)
CANON = {
 'director general': ('Director General', 'DIR', 'Dirección'),
 'director comercial': ('Director Comercial', 'COM', 'Dirección'),
 'director comercial operativo': ('Director Comercial-Operativo', 'COM', 'Dirección'),
 'brand manager': ('Brand Manager', 'COM', 'Gerencia'),
 'disenador comprador desarrollador de producto textil': ('Diseñador/Comprador Textil', 'CMP', 'Analista'),
 'disenador comprador desarrollador de producto calzado y accesorios': ('Diseñador/Comprador Calzado y Accesorios', 'CMP', 'Analista'),
 'disenador grafico': ('Diseñador Gráfico', 'DIS', 'Analista'),
 'supervisor de visual nacional': ('Supervisor de Visual Nacional', 'VIS', 'Coordinación'),
 'director de mercadeo': ('Director de Mercadeo', 'MER', 'Dirección'),
 'gerente de mercadeo': ('Gerente de Mercadeo', 'MER', 'Gerencia'),
 'visual nacional': ('Visual Nacional', 'VIS', 'Analista'),
 'visual': ('Visual', 'VIS', 'Analista'),
 'consultor de gestion de proyectos': ('Consultor de Gestión de Proyectos', 'MER', 'Coordinación'),
 'community manager': ('Community Manager', 'MER', 'Analista'),
 'director creativo': ('Director Creativo', 'DIS', 'Dirección'),
 'stylist': ('Stylist', 'DIS', 'Analista'),
 'productor logistico': ('Productor Logístico', 'DIS', 'Analista'),
 'asistente comercial': ('Asistente Comercial', 'COM', 'Asistente'),
 'analista de compras': ('Analista de Compras', 'CMP', 'Analista'),
 'analista de ventas': ('Analista de Ventas', 'COM', 'Analista'),
 'gerente de planificacion comercial marcas propias': ('Gerente de Planificación Comercial (Marcas Propias)', 'COM', 'Gerencia'),
 'consultor de estrategia comercial e e commerce': ('Consultor de Estrategia Comercial e E-Commerce', 'COM', 'Coordinación'),
 'asistente administrativo': ('Asistente Administrativo', 'FIN', 'Asistente'),
 'analista administrativo': ('Analista Administrativo', 'FIN', 'Analista'),
 'administrador': ('Administrador', 'FIN', 'Dirección'),
 'contralor': ('Contralor', 'FIN', 'Dirección'),
 'gerente de talento humano': ('Gerente de Talento Humano', 'TH', 'Gerencia'),
 'analista de procesos y productividad': ('Analista de Procesos y Productividad', 'TH', 'Analista'),
 # documentos adicionales (09/10/2026)
 'lider de desarrollo de producto': ('Líder de Desarrollo de Producto', 'CMP', 'Gerencia'),
 'desarrollador de producto disenador de moda': ('Desarrollador de Producto (Diseñador de Moda)', 'CMP', 'Analista'),
 'analista de datos': ('Analista de Datos', 'COM', 'Analista'),
 'administrador almacen principal': ('Administrador de Almacén', 'FIN', 'Coordinación'),
 'jefe de almacen logistica y operaciones': ('Jefe de Almacén, Logística y Operaciones', 'FIN', 'Gerencia'),
}
# correcciones de texto por renglones superpuestos en el PDF original
CORRIGE_COMP = {
 'Curiosidad y aprendizaje continuo en herramientas y metodologías de aCnoánlfiisdisencialidad y manejo responsable de información sensible del': ('Curiosidad y aprendizaje continuo en herramientas y metodologías de análisis', None),
}
def slug(t): return re.sub(r'\s+', '-', norm(t))

def armar(c, grupo, marcas, canon, org=False):
    nombre, fam, niv = canon
    def limpia_nombre(n):
        n = limpia_texto(n)
        return re.sub(r'^Competencias\s+(?=[A-ZÁÉÍÓÚ])', '', n)
    comp = lambda sec: [{'nombre': limpia_nombre(n), 'nivel': v} for s, n, v in grupo if s == sec]
    tec = comp('tecnica'); bla = comp('blanda')
    if org:   # competencias organizacionales del documento (se suman a las blandas)
        for x in comp('organizacional'):
            if x['nombre'] not in [b['nombre'] for b in bla]: bla.insert(0, x)
    # renglones superpuestos: se separan en las dos competencias
    arreglado = []
    for i, x in enumerate(bla):
        if x['nombre'] in CORRIGE_COMP:
            arreglado.append({'nombre': CORRIGE_COMP[x['nombre']][0], 'nivel': x['nivel']})
        elif x['nombre'] == 'negocio' and arreglado and arreglado[-1]['nombre'].startswith('Curiosidad'):
            arreglado.append({'nombre': 'Confidencialidad y manejo responsable de información sensible del negocio', 'nivel': x['nivel']})
        else: arreglado.append(x)
    bla = arreglado
    p = c['perfil']; d = c['detalles']
    perfil = {k: limpia_texto(p.get(k, '')) for k in ('nivelEducativo', 'carrera', 'experiencia', 'idiomas', 'disponibilidadViajar') if p.get(k)}
    perfil['otros'] = [limpia_texto(x) for x in p.get('otros', []) if not limpia_texto(x).endswith(':')]
    top = sorted(tec, key=lambda x: -x['nivel'])[:3]
    obj = limpia_texto(c.get('objetivo', ''))
    return {
        'nombre': nombre, 'nombreDocumento': limpia_texto(c['nombre']), 'marcas': marcas, 'familia': fam,
        'area': limpia_texto(c.get('area', '')), 'nivelJerarquico': limpia_texto(c.get('nivelJerarquico', '')) or niv,
        'supervisor': limpia_texto(c.get('supervisor', '')), 'supervisaA': limpia_texto(c.get('supervisaA', '')),
        'objetivo': obj,
        'procesos': [{'proceso': limpia_texto(x['proceso']), 'funciones': [limpia_texto(f) for f in x['funciones']]} for x in c['procesos']],
        'relaciones': limpia(c['relaciones']),
        'jornada': limpia_texto(d.get('jornada', '')), 'modalidad': limpia_texto(d.get('modalidad', '')),
        'horario': limpia_texto(d.get('horario', '')), 'diasLibres': limpia_texto(d.get('diasLibres', '')),
        'sede': limpia_texto(d.get('sede', '')),
        'herramientasRequeridas': limpia_texto(d.get('requeridas', '')), 'herramientasAsignadas': limpia_texto(d.get('asignadas', '')),
        'competenciasTecnicas': tec, 'competenciasBlandas': bla,
        'perfil': perfil,
        'kpiNineBox': ('Cumplimiento del objetivo del cargo: ' + (obj[:150] + ('…' if len(obj) > 150 else ''))) if obj else '',
        'tecNineBox': ('Dominio de: ' + ', '.join(x['nombre'] for x in top)) if top else '',
        'revisar': not (perfil.get('nivelEducativo') and tec and bla),
    }

entradas = []   # (clave canónica, perfil)
def agregar(prefijo, marcas, solo=None, org=False):
    v = doc(prefijo)
    for c, g in zip(v['cargos'], v['competencias']):
        k = norm(c['nombre'])
        if solo is not None and k not in solo: continue
        if k not in CANON: print('SIN CANON', c['nombre']); continue
        entradas.append((CANON[k][0], armar(c, g, marcas, CANON[k], org)))
agregar('6aa55906', ['BALU'])          # diseño, mercadeo y comercial (Balú)
agregar('6cd0b37e', ['BALU'])          # administración y contraloría (Balú)
agregar('701e4045', ['BALU', 'PLANETA'])   # talento humano
planeta_adm = [e for e in []]
agregar('4e3e7e46', ['PLANETA'])       # administrativo y comercial (Planeta Sports)
# documentos adicionales: solo los cargos administrativos (las hojas de tienda no reemplazan las descripciones vigentes)
agregar('44d4d8c9', ['BALU'], {'lider de desarrollo de producto'}, True)
agregar('1196ac8d', ['BALU'], None, True)
agregar('8cd936f0', ['BALU'], None, True)
agregar('94965c7d', ['BALU'], None, True)

def firma(p):
    q = {k: v for k, v in p.items() if k not in ('marcas', 'nombreDocumento', 'sede')}
    return json.dumps(q, sort_keys=True, ensure_ascii=False)
perfiles = {}
por_nombre = {}
for nombre, p in entradas:
    por_nombre.setdefault(nombre, []).append(p)
for nombre, lst in por_nombre.items():
    grupos = []
    for p in lst:
        for g in grupos:
            if firma(g) == firma(p):
                g['marcas'] = sorted(set(g['marcas'] + p['marcas']), key=lambda m: m != 'BALU'); break
        else: grupos.append(p)
    for i, p in enumerate(grupos):
        sufijo = '' if len(grupos) == 1 else ('-balu' if p['marcas'] == ['BALU'] else '-planeta' if p['marcas'] == ['PLANETA'] else f'-{i+1}')
        # un perfil existente en ambas marcas con la misma descripción queda único
        p['id'] = slug(nombre) + sufijo
        perfiles[p['id']] = p

# ---- diccionarios de competencias (Excel) ----
def leer_dic(ruta, off):
    wb = openpyxl.load_workbook(ruta, data_only=True)
    ws = wb['Diccionario']
    filas = [r[off:] for r in ws.iter_rows(values_only=True)]
    h = [i for i, r in enumerate(filas) if r and r[0] == 'ID'][0]
    cab = [str(x or '').strip() for x in filas[h]]
    ix = {n: i for i, n in enumerate(cab)}
    dic = {}
    for r in filas[h + 1:]:
        if not r or not r[0] or not str(r[0]).startswith('C'): continue
        niv = ix.get('Alcance') if 'Alcance' in ix else ix.get('Nivel sugerido')
        dic[norm(r[ix['Competencia']])] = {
            'nombre': limpia_texto(r[ix['Competencia']]), 'tipo': limpia_texto(r[ix['Tipo']]),
            'alcance': limpia_texto(r[niv]) if niv is not None else '',
            'definicion': limpia_texto(r[ix['Definición']]),
            'niveles': [limpia_texto(r[ix[f'Descriptor Nivel {n}']]) for n in range(1, 6)],
        }
    mat = wb['Matriz']
    filas = [r[off:] for r in mat.iter_rows(values_only=True)]
    h = [i for i, r in enumerate(filas) if r and r[0] == 'Departamento'][0]
    cab = [str(x or '').strip() for x in filas[h]]
    ix = {n: i for i, n in enumerate(cab)}
    roles = {}
    for r in filas[h + 1:]:
        if not r or not r[0]: continue
        rol = r[ix['Rol']] if r[ix['Rol']] else r[ix['Subárea']]
        if 'Subárea' in ix and r[ix['Rol']] is None: rol = r[ix['Subárea']]
        n = r[ix['Nivel esperado']] if 'Nivel esperado' in ix else None
        roles.setdefault(norm(rol), []).append({'nombre': limpia_texto(r[ix['Competencia']]), 'tipo': limpia_texto(r[ix['Tipo']]), 'nivel': int(n) if isinstance(n, (int, float)) else None, 'critica': bool(r[ix['Crítica']]) if 'Crítica' in ix and r[ix['Crítica']] else False, 'rol': rol, 'depto': r[ix['Departamento']]})
    return dic, roles
dic_b, roles_b = leer_dic(sys.argv[2], 1)
dic_p, roles_p = leer_dic(sys.argv[3], 0)

ALIAS_ROL = {  # nombre canónico normalizado -> nombre del rol en la matriz
 'disenador comprador textil': 'disenador comprador textil', 'visual nacional': 'visual nacional', 'supervisor de visual nacional': 'supervisor visual nacional',
 'director de mercadeo': 'director de mercadeo', 'productor logistico': 'productor logistico',
}
usadas = {'BALU': set(), 'PLANETA': set()}
for p in perfiles.values():
    k = norm(p['nombre'])
    p['diccionario'] = []
    for m, roles, dic in (('BALU', roles_b, dic_b), ('PLANETA', roles_p, dic_p)):
        if m not in p['marcas']: continue
        filas = roles.get(ALIAS_ROL.get(k, k)) or roles.get(norm(p['nombre'])) or []
        if k == 'administrador de almacen' and m == 'BALU':
            filas = [f for f in roles.get('administrador', []) if f['depto'] == 'Almacén Principal']
        for f in filas:
            usadas[m].add(norm(f['nombre']))
            p['diccionario'].append({'marca': m, 'competencia': f['nombre'], 'tipo': f['tipo'], 'nivel': f['nivel']})
    for c in p['competenciasTecnicas'] + p['competenciasBlandas']:
        for m, dic in (('BALU', dic_b), ('PLANETA', dic_p)):
            if m in p['marcas'] and norm(c['nombre']) in dic: usadas[m].add(norm(c['nombre']))

# perfiles sin documento de puesto (solo diccionario)
for nombre, depto, fam, marca in (('Director de Tecnología de la Información', 'Tecnología de la Información', 'DIR', 'BALU'),
                                  ):
    filas = roles_b.get(norm(nombre)) or []
    if nombre == 'Administrador de Almacén': filas = [f for f in roles_b.get('administrador', []) if f['depto'] == 'Almacén Principal']
    if nombre.startswith('Jefe de Almacén, '): filas = roles_b.get(norm('Jefe de Almacén, Logística y Operaciones')) or []
    for f in filas: usadas['BALU'].add(norm(f['nombre']))
    pid = slug(nombre)
    perfiles[pid] = {'id': pid, 'nombre': nombre, 'nombreDocumento': nombre, 'marcas': [marca], 'familia': fam, 'area': depto, 'nivelJerarquico': '', 'supervisor': '', 'supervisaA': '', 'objetivo': '', 'procesos': [], 'relaciones': {'internas': '', 'externas': ''}, 'jornada': '', 'modalidad': '', 'horario': '', 'diasLibres': '', 'sede': '', 'herramientasRequeridas': '', 'herramientasAsignadas': '', 'competenciasTecnicas': [], 'competenciasBlandas': [], 'perfil': {'otros': []}, 'kpiNineBox': '', 'tecNineBox': '', 'revisar': True, 'incompleto': True,
        'diccionario': [{'marca': marca, 'competencia': f['nombre'], 'tipo': f['tipo'], 'nivel': f['nivel']} for f in filas]}

DIC = {'BALU': {dic_b[k]['nombre']: dic_b[k] for k in sorted(usadas['BALU']) if k in dic_b}, 'PLANETA': {dic_p[k]['nombre']: dic_p[k] for k in sorted(usadas['PLANETA']) if k in dic_p}}

# ---- tiendas Planeta Sports (descripciones de CCCT, Sambil Chacao y Sambil Candelaria: iguales en funciones) ----
TIENDA = {'gerente de tienda': 'GT', 'subgerente de tienda': 'SUB', 'cajero': 'CAJ', 'asesor de ventas': 'ASE', 'depositario': 'ALM'}
base = doc('cb5ca00b')
tienda = {}
for c, g in zip(base['cargos'], base['competencias']):
    cid = TIENDA[norm(c['nombre'])]
    p = c['perfil']; d = c['detalles']
    tec = [{'nombre': limpia_texto(n), 'nivel': v} for s, n, v in g if s == 'tecnica']
    bla = [{'nombre': limpia_texto(n), 'nivel': v} for s, n, v in g if s == 'blanda']
    rep = {'supervisorInmediato': limpia_texto(c.get('supervisor', '')), 'supervisaA': limpia_texto(c.get('supervisaA', '')) or 'N/A'}
    tienda[cid] = {'id': cid, 'nombre': {'GT': 'Gerente de Tienda', 'SUB': 'Subgerente de Tienda', 'CAJ': 'Cajero', 'ASE': 'Asesor de Ventas', 'ALM': 'Depositario'}[cid],
        'area': limpia_texto(c.get('area', 'Comercial')), 'nivelJerarquico': limpia_texto(c.get('nivelJerarquico', '')) or ('Coordinador' if cid in ('GT', 'SUB') else 'Operativo'),
        'objetivo': limpia_texto(c.get('objetivo', '')),
        'procesos': [{'proceso': limpia_texto(x['proceso']), 'funciones': [limpia_texto(f) for f in x['funciones']]} for x in c['procesos']],
        'relaciones': limpia(c['relaciones']), 'jornada': limpia_texto(d.get('jornada', '')), 'modalidad': limpia_texto(d.get('modalidad', '')),
        'horario': limpia_texto(d.get('horario', '')), 'diasLibres': limpia_texto(d.get('diasLibres', '')),
        'herramientasRequeridas': limpia_texto(d.get('requeridas', '')), 'herramientasAsignadas': limpia_texto(d.get('asignadas', '')),
        'competenciasTecnicas': tec, 'competenciasBlandas': bla,
        'perfil': {**{k: limpia_texto(p.get(k, '')) for k in ('nivelEducativo', 'carrera', 'experiencia', 'idiomas', 'disponibilidadViajar')}, 'otros': [limpia_texto(x) for x in p.get('otros', [])]},
        'fecha': '', 'reporte': {'grande': rep, 'pequena': rep}}
    sede = limpia_texto(d.get('sede', ''))

salida = ['/* Generado por descripciones/construir-perfiles-adm.py — no editar a mano.',
  '   Perfiles de cargo administrativos y corporativos (Balú y Planeta Sports), descripciones de las tiendas Planeta Sports y diccionarios de competencias.',
  '   No contiene datos personales ni montos. Las ediciones de RRHH se guardan aparte (configuración) y se superponen a estos valores. */',
  'export const FUENTE_PERFILES_ADM = ' + json.dumps({'origen': 'Descripciones de puesto de trabajo y diccionarios de competencias de Balú y Planeta Sports', 'elaboradoPor': 'Gerencia de Recursos Humanos', 'fecha': '09/10/2026', 'nota': 'Los requisitos de edad y género de los documentos originales no se cargan: no son criterios de selección (LOTTT, art. 21).'}, ensure_ascii=False) + ';',
  'export const PERFILES_ADM = ' + json.dumps(perfiles, ensure_ascii=False) + ';',
  'export const PERFILES_TIENDA_PLANETA = ' + json.dumps(tienda, ensure_ascii=False) + ';',
  'export const DICCIONARIO_COMPETENCIAS = ' + json.dumps(DIC, ensure_ascii=False) + ';',
  'export const SEDE_PLANETA_TIENDAS = ' + json.dumps(sede, ensure_ascii=False) + ';']
open(sys.argv[4], 'w').write('\n'.join(salida) + '\n')
print(len(perfiles), 'perfiles;', len(tienda), 'de tienda;', {m: len(v) for m, v in DIC.items()}, 'competencias del diccionario')
for p in perfiles.values():
    print(f"{p['id']:55} {','.join(p['marcas']):14} {p['familia']} proc={len(p['procesos'])} tec={len(p['competenciasTecnicas'])} bla={len(p['competenciasBlandas'])} dic={len(p['diccionario'])} {'REVISAR' if p['revisar'] else ''}")
