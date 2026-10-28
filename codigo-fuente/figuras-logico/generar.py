import math, json
T='#1A1A1A'; F="font-family:Arial,Helvetica,sans-serif"
def svg(w,h,body,titulo):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{titulo}"><rect width="{w}" height="{h}" fill="#fff"/>{body}</svg>'
def txt(x,y,t,size=17,bold=False,anchor='start',fill=T):
    return f'<text x="{x}" y="{y}" style="{F};font-size:{size}px;{"font-weight:bold;" if bold else ""}" text-anchor="{anchor}" fill="{fill}">{t}</text>'
def poly(pts,fill='none',sw=2.2):
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x,y in pts)}" fill="{fill}" stroke="{T}" stroke-width="{sw}" stroke-linejoin="round"/>'
def regular(cx,cy,r,n,rot=-90):
    return [(cx+r*math.cos(math.radians(rot+360*i/n)), cy+r*math.sin(math.radians(rot+360*i/n))) for i in range(n)]
def esc(s): return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def numeros(xs,y): return ''.join(txt(x,y,str(i+1),19,True,'middle') for i,x in enumerate(xs))
def filas(y1,y2): return txt(10,y1,'Fila 1',17)+txt(10,y2,'Fila 2',17)
out={}

# ---- P8: pares de símbolos (monoespaciado)
pares=[('\\/\\..\\\\','\\/\\..\\\\'),('\\\\]../','\\\\[../'),('[]\\///.','[]\\//..'),(']].[///.',']].]///.'),('][][...\\','][][...\\'),('[.].[/\\.','[.].[/\\.'),('\\\\\\.\\.\\\\..\\','\\\\\\.\\.\\\\\\..\\')]
b=''
for i,(l,r) in enumerate(pares):
    y=40+i*34
    b+=f'<text x="115" y="{y}" style="font-family:\'Courier New\',Courier,monospace;font-size:22px;font-weight:bold;letter-spacing:2px" text-anchor="middle" fill="{T}">{esc(l)}</text>'
    b+=f'<text x="310" y="{y}" style="font-family:\'Courier New\',Courier,monospace;font-size:22px;font-weight:bold;letter-spacing:2px" text-anchor="middle" fill="{T}">{esc(r)}</text>'
out[8]=svg(420,270,b,'Siete pares de símbolos: columna izquierda y columna derecha')

# ---- P12: cuadrículas de 5 x 7 símbolos. P=+, X=×, A=8 brazos, S=estrella de 5 brazos
def simbolo(k,cx,cy,r=11):
    def ln(a): return f'<line x1="{cx-r*math.cos(a):.1f}" y1="{cy-r*math.sin(a):.1f}" x2="{cx+r*math.cos(a):.1f}" y2="{cy+r*math.sin(a):.1f}" stroke="{T}" stroke-width="2.6" stroke-linecap="round"/>'
    if k=='P': return ln(0)+ln(math.pi/2)
    if k=='X': return ln(math.pi/4)+ln(-math.pi/4)
    if k=='A': return ln(0)+ln(math.pi/2)+ln(math.pi/4)+ln(-math.pi/4)
    if k=='S': return ''.join(f'<line x1="{cx}" y1="{cy}" x2="{cx+r*math.cos(math.radians(-90+72*i)):.1f}" y2="{cy+r*math.sin(math.radians(-90+72*i)):.1f}" stroke="{T}" stroke-width="2.6" stroke-linecap="round"/>' for i in range(5))
izq=['PXASAXA','APPSAXX','XSAPAPX','APSSAXA','XSAXASS']
der=['PXAAXXA','APPSAXX','XSAXAPX','APSXAXA','XSAXASA']
b=''
for g,grid in enumerate([izq,der]):
    x0=40+g*300
    for i,row in enumerate(grid):
        for j,k in enumerate(row): b+=simbolo(k,x0+j*34,34+i*38)
out[12]=svg(560,215,b,'Dos cuadrículas de cinco filas de símbolos')

# ---- P14
b=filas(78,215)
b+=poly([(150,40),(225,40),(225,115),(150,115)])
b+=poly([(270,48),(345,35),(345,118),(270,118)])
b+=poly([(160,140),(205,185),(160,230),(115,185)])
b+=poly([(270,145),(355,145),(320,225),(230,225)])
b+=poly([(370,145),(430,145),(415,225),(385,225)])
b+=poly(regular(495,190,42,5))
b+=poly([(560,145),(605,145),(605,225),(560,225)])
b+=numeros([160,293,400,495,583],262)
out[14]=svg(640,275,b,'Fila 1: dos figuras. Fila 2: cinco figuras numeradas del 1 al 5')

# ---- P21: figuras rellenas
G='#3F3A42'
def pf(pts): return poly(pts,G,1.5)
b=''
b+=f'<path d="M30,95 L30,60 A30,38 0 0 1 90,60 L90,95 Z" fill="{G}" stroke="{T}" stroke-width="1.5"/>'+txt(118,82,'es a',18)
b+=f'<path d="M285,45 L250,45 A38,30 0 0 0 250,105 L285,105 Z" fill="{G}" stroke="{T}" stroke-width="1.5"/>'+txt(320,82,'lo que',18)
b+=pf([(420,40),(420,105),(480,105)])+txt(500,82,'es a',18)
b+=pf([(30,160),(30,235),(75,197)])
b+=pf([(115,232),(155,175),(215,232)])
b+=pf([(220,165),(280,165),(280,235)])
b+=pf([(340,165),(410,165),(340,215)])
b+=pf([(460,232),(525,232),(525,170)])
b+=numeros([45,160,255,370,500],268)
out[21]=svg(580,280,b,'La primera figura es a la segunda lo que la tercera es a una de las cinco figuras numeradas')

# ---- P27: polígonos con líneas paralelas (tantas líneas como lados)
def lineas(cx,cy,n,largo=150,sep=10):
    a=math.radians(58); dx,dy=math.cos(a),math.sin(a); px,py=-dy,dx; s=''
    for i in range(n):
        o=(i-(n-1)/2)*sep
        x,y=cx+px*o,cy+py*o
        s+=f'<line x1="{x-dx*largo/2:.1f}" y1="{y-dy*largo/2:.1f}" x2="{x+dx*largo/2:.1f}" y2="{y+dy*largo/2:.1f}" stroke="{T}" stroke-width="1.6"/>'
    return s
def fig(cx,cy,lados,nl,r=42):
    if lados==4: pts=[(cx-38,cy-32),(cx+38,cy-32),(cx+38,cy+32),(cx-38,cy+32)]
    else: pts=regular(cx,cy,r,lados,-90 if lados%2 else 0)
    return poly(pts,'none',2)+lineas(cx+12,cy+8,nl)
b=filas(85,250)
b+=fig(165,85,3,3)+fig(300,85,4,4)+fig(435,85,5,5)
b+=fig(165,250,4,4)+fig(300,250,6,6)+fig(435,250,8,8)+fig(570,250,5,7)+fig(705,250,6,5)
b+=numeros([165,300,435,570,705],350)
out[27]=svg(790,365,b,'Fila 1: tres polígonos atravesados por líneas. Fila 2: cinco opciones numeradas')

# ---- P32: relojes (12 marcas; aguja corta = hora, larga = minutos)
def reloj(cx,cy,h,m,r=40):
    s=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff" stroke="{T}" stroke-width="2.4"/>'
    for i in range(12):
        a=math.radians(i*30-90); s+=f'<line x1="{cx+(r-11)*math.cos(a):.1f}" y1="{cy+(r-11)*math.sin(a):.1f}" x2="{cx+(r-3)*math.cos(a):.1f}" y2="{cy+(r-3)*math.sin(a):.1f}" stroke="{T}" stroke-width="2.4" stroke-linecap="round"/>'
    am=math.radians(m*6-90); ah=math.radians((h%12+m/60)*30-90)
    s+=f'<line x1="{cx}" y1="{cy}" x2="{cx+(r-9)*math.cos(am):.1f}" y2="{cy+(r-9)*math.sin(am):.1f}" stroke="{T}" stroke-width="2.6" stroke-linecap="round"/>'
    s+=f'<line x1="{cx}" y1="{cy}" x2="{cx+(r-20)*math.cos(ah):.1f}" y2="{cy+(r-20)*math.sin(ah):.1f}" stroke="{T}" stroke-width="3.6" stroke-linecap="round"/>'
    return s+f'<circle cx="{cx}" cy="{cy}" r="3.5" fill="{T}"/>'
b=filas(65,170)
for i,(h,m) in enumerate([(1,25),(2,5),(2,45)]): b+=reloj(150+i*100,60,h,m)
for i,(h,m) in enumerate([(4,10),(4,0),(4,5),(3,25),(3,55)]): b+=reloj(150+i*110,165,h,m)
b+=numeros([150+i*110 for i in range(5)],235)
out[32]=svg(640,250,b,'Fila 1: tres relojes. Fila 2: cinco relojes numerados')

# ---- P41
b=filas(78,200)
b+=poly([(150,40),(215,40),(195,105),(130,105)])
b+=poly([(240,110),(330,30),(300,95)])
b+=poly([(140,150),(215,150),(200,225),(155,225)])
b+=poly([(245,155),(330,155),(330,215),(245,215)])
b+=poly([(380,150),(380,220),(430,220)])
b+=f'<circle cx="490" cy="187" r="33" fill="none" stroke="{T}" stroke-width="2.2"/>'
b+=poly([(580,150),(617,187),(580,224),(543,187)])
b+=numeros([178,288,400,490,580],262)
out[41]=svg(640,275,b,'Fila 1: dos figuras. Fila 2: cinco figuras numeradas del 1 al 5')

json.dump({str(k):v for k,v in out.items()},open('figuras.json','w'),ensure_ascii=False)
for k,v in out.items(): open(f'p{k}.svg','w').write(v)
print('ok',{k:len(v) for k,v in out.items()})
