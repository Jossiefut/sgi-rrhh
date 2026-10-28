#!/usr/bin/env python3
"""Genera descripciones.js (módulo del sistema) a partir de las descripciones de cargo de Balú (14/04/2026).
Fuente: fuente/DC - Tienda (Sambil Chacao).txt (tienda grande) y fuente/DC - Tienda (Propatria).txt (tienda pequeña).
Las funciones son iguales en todas las tiendas; solo cambian las líneas de reporte según el tamaño.
Uso: python3 descripciones/construir-descripciones.py > descripciones.js"""
import json, os, subprocess, sys
aqui = os.path.dirname(os.path.abspath(__file__))
def leer(n):
    return json.loads(subprocess.check_output([sys.executable, os.path.join(aqui, 'parsear-dc.py'), os.path.join(aqui, 'fuente', n)]))[n]
grande = leer('DC - Tienda (Sambil Chacao).txt')
pequena = {c['nombre']: c for c in leer('DC - Tienda (Propatria).txt')}
IDS = {'Gerente de Tienda': 'GT', 'Subgerente de Tienda': 'SUB', 'Asesor de Ventas': 'ASE', 'Visual': 'VM', 'Cajero Titular': 'CAJT', 'Cajero': 'CAJ', 'Jefe de Almacén': 'JALM', 'Almacenista': 'ALM'}
out = {}
for c in grande:
    cid = IDS[c['nombre']]
    # Correcciones de lectura del PDF (verificadas contra el documento)
    if cid == 'GT':
        f = [x for p in c['procesos'] for x in p['funciones']]
        c['procesos'] = [
            {'proceso': 'Dirección y supervisión integral de la operación', 'funciones': f[0:6]},
            {'proceso': 'Gestión comercial y seguimiento de resultados', 'funciones': f[6:10]},
            {'proceso': 'Supervisión de producto y visual merchandising', 'funciones': f[10:14]},
            {'proceso': 'Gestión administrativa y control operativo', 'funciones': f[14:20]},
            {'proceso': 'Gestión de incidencias y servicio al cliente', 'funciones': f[20:23]},
            {'proceso': 'Gestión de incorporación y seguimiento de personal', 'funciones': f[23:27]},
        ]
    if cid == 'CAJT':
        for p in c['procesos']:
            nf = []
            for x in p['funciones']:
                if x.startswith('Auditoría para garantizar') and nf: nf[-1] += ' Auditoría' + x[len('Auditoría'):]
                else: nf.append(x)
            p['funciones'] = nf
        c['perfil'].update({'nivelEducativo': 'Bachiller. Deseable T.S.U. o Licenciatura', 'carrera': 'No limitativo. Deseable carreras administrativas', 'experiencia': '1 a 2 años en el área de Caja'})
    if cid == 'VM':
        apoyo = next(p for p in c['procesos'] if p['proceso'].startswith('Apoyo operativo'))
        inv = next(p for p in c['procesos'] if p['proceso'].startswith('Gestión de inventario'))
        mover = [x for x in inv['funciones'] if x.startswith('Compartir buenas prácticas')]
        inv['funciones'] = [x for x in inv['funciones'] if x not in mover]; apoyo['funciones'] += mover
    if cid == 'GT' and c['supervisorInmediato'] == 'Brand Manager': c['supervisorInmediato'] = 'Brand Manager (Gerente de Marca)'
    p = pequena.get(c['nombre'])
    c['reporte'] = {
        'grande': {'supervisorInmediato': c['supervisorInmediato'], 'supervisaA': c['supervisaA']},
        'pequena': {'supervisorInmediato': p['supervisorInmediato'], 'supervisaA': p['supervisaA']} if p else None,
    }
    if p and cid == 'GT': c['reporte']['pequena']['supervisorInmediato'] = 'Brand Manager (Gerente de Marca)'
    for k in ['supervisorInmediato', 'supervisaA']: c.pop(k)
    c['id'] = cid
    c['modalidad'] = c['jornada'].split('Modalidad')[1].strip() if 'Modalidad' in c['jornada'] else ''
    c['jornada'] = c['jornada'].split(' Modalidad')[0].strip()
    c['diasLibres'] = c['horario'].split('Días libres')[1].strip() if 'Días libres' in c['horario'] else ''
    c['horario'] = c['horario'].split(' Días libres')[0].strip()
    c.pop('elaboradoPor', None)
    out[cid] = c
# Perfil del colaborador («Employee persona») del manual de procesos de tienda Balú
PERSONAS = {
 'GT': ('El estratega del equipo', 'Líder con experiencia que entiende que el éxito de la tienda depende de la sinergia de su equipo; analítico pero muy humano.', 'Superar las metas de ventas y ver a su equipo crecer; tiene el control de la operación y sabe delegar.', 'Lidero con el ejemplo para que los resultados hablen por nosotros.', ['Toma de decisiones', 'Visión comercial', 'Resolución de conflictos']),
 'SUB': ('El motor operativo', 'La mano derecha de la gerencia: muy organizado, sabe que la clave está en los detalles de la apertura y el cierre (damas: agilidad en probadores; caballeros: disponibilidad de stock; kids & teens: orden y seguridad).', 'Que la tienda funcione como un reloj y todo esté listo antes de que entre el primer cliente.', 'Si la operación está bajo control, el equipo puede enfocarse en vender.', ['Organización', 'Supervisión directa', 'Proactividad']),
 'ASE': ('El creador de experiencias', 'Persona dinámica y con energía, que disfruta estar con la gente y tiene ojo para la moda (damas: personal shopper; caballeros: asesor técnico en telas, cortes y tallas; kids & teens: paciencia y comunicación con los padres).', 'Ayudar a otros a verse y sentirse bien; cerrar una venta bien asesorada.', 'Si el cliente se va con una sonrisa y el outfit perfecto, mi día fue un éxito.', ['Empatía', 'Agilidad física', 'Capacidad de escucha']),
 'VM': ('El guardián de la estética', 'Creativo, detallista y muy visual; entiende que todo entra por los ojos (damas: looks totales; caballeros: orden métrico por talla y color; kids & teens: color y exhibiciones resistentes).', 'Transformar el piso de venta en un lugar aspiracional que impulse la venta de cada colección.', 'El orden es mi lenguaje y la tienda es mi lienzo.', ['Creatividad', 'Atención al detalle', 'Conocimiento de tendencias']),
 'JALM': ('El cerebro del inventario', 'Persona metódica, responsable y con capacidad de mando; protege la mercancía.', 'Mantener el almacén impecable para que ventas encuentre rápido lo que busca.', 'Un almacén ordenado es la base de una venta exitosa.', ['Liderazgo de equipos operativos', 'Control de inventarios', 'Agilidad logística']),
 'ALM': ('El guardián del stock', 'Persona metódica, con resistencia física y gran capacidad de organización; conoce cada rincón del almacén.', 'Ver el almacén clasificado y que el producto llegue a piso justo cuando el cliente lo necesita.', 'Si el almacén está en orden, la tienda brilla.', ['Agilidad física', 'Atención al detalle', 'Responsabilidad']),
 'CAJ': ('La cara de la eficiencia', 'Amable, rápido y muy honesto; es el último punto de contacto con el cliente.', 'Que el pago sea fluido y sin errores, con un cierre positivo de la compra.', 'Mi rapidez y mi sonrisa son el sello final de una gran compra.', ['Agilidad numérica', 'Atención al cliente', 'Manejo de herramientas de cobro']),
 'CAJT': ('El facilitador del cierre', 'Persona con alto sentido de responsabilidad y honestidad; referente de confianza del equipo de cajas.', 'Mantener la transparencia de los procesos administrativos y apoyar al equipo cuando la tienda está llena.', 'La confianza se gana con procesos claros y un equipo bien formado.', ['Manejo de personal', 'Control administrativo', 'Resolución de dudas operativas']),
}
for k, (t, q, m, f, h) in PERSONAS.items():
    out[k]['persona'] = {'titulo': t, 'quienEs': q, 'motivacion': m, 'frase': f, 'habilidades': h}
FUENTE = {'origen': 'Descripciones de puesto de trabajo y manual de procesos de tiendas Balú', 'elaboradoPor': 'Gerencia de Recursos Humanos', 'fecha': '14/04/2026',
          'nota': 'Funciones, competencias y perfil iguales en todas las tiendas; la línea de reporte depende del tamaño de la tienda (grande: Cajero Titular y Jefe de Almacén; pequeña: reportan al Subgerente). Planeta usa las mismas descripciones hasta cargar las suyas.'}
print('/* Generado por descripciones/construir-descripciones.py — no editar a mano.')
print('   Descripciones de cargo de tienda (Balú, 14/04/2026). Se aplican igual a Planeta hasta cargar las suyas. */')
print('export const FUENTE_DESCRIPCIONES = ' + json.dumps(FUENTE, ensure_ascii=False) + ';')
print('export const DESCRIPCIONES_CARGO = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';')
