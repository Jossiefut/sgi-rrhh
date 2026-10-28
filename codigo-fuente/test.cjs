const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html','utf8') + '</body></html>';
const errores = [];
let dom, w, d; let desfase = 0;
const crearDom = (estado) => {
  dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/',
    beforeParse(w0){ w0.scrollTo=()=>{}; w0.URL.createObjectURL=()=> 'blob:x'; w0.URL.revokeObjectURL=()=>{};
      w0.console.error=(...a)=>errores.push(a.map(String).join(' ')); if (estado) w0.localStorage.setItem('talento-balu-v2', estado); } });
  w = dom.window; d = w.document;
  { const dn = w.Date.now.bind(w.Date); w.Date.now = () => dn() + desfase; }
};
const espera = (ms=30)=>new Promise(r=>setTimeout(r,ms));
const texto = ()=> d.getElementById('root').textContent;
function botonExacto(t){ const b=[...d.querySelectorAll('button')].find(b=>b.textContent.trim()===t); if(!b) throw new Error('No hay botón: '+t); return b; }
async function abrirOrg(){ const h=d.querySelector('main h1'); const b=[...d.querySelectorAll('button')].find(x=>x.textContent.trim()==='Ver organigrama'); if(h && h.textContent.trim()==='Tablero' && b && !d.querySelector('.org')) await click(b); }
function pestana(t){ const b=[...d.querySelectorAll('[role=tab]')].find(x=>x.textContent.trim().startsWith(t)); if(!b) throw new Error('No hay pestaña: '+t); return b; }
async function enviar(form){ form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})); await espera(150); }
function boton(t, idx=0){ const bs=[...d.querySelectorAll('button')].filter(b=>b.textContent.trim().includes(t)); if(!bs[idx]) throw new Error('No hay botón: '+t); return bs[idx]; }
const click = async (el)=>{ const _e = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entendido'); if (_e && _e !== el) { _e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); }  el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await espera(); for (let k = 0; k < 4; k++) { const ps = [...w.document.querySelectorAll('[data-plegado="1"]')]; if (!ps.length) break; ps.forEach((b) => b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))); await espera(); } };
function setValor(el, v){ const proto = el.tagName==='SELECT'? w.HTMLSelectElement.prototype : el.tagName==='TEXTAREA'? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto,'value').set.call(el,v); el.dispatchEvent(new w.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true})); el.dispatchEvent(new w.Event('change',{bubbles:true})); }
const ok=(c,m)=>{ console.log((c?'✓ ':'✗ ')+m); if(!c) process.exitCode=1; };
(async()=>{
  /* Estado inicial: el registro de prueba (Josselyn Tovar) conserva IPV + Kostick + Lógico para verificar el portal del IPV, que sigue vigente para Asesor y Visual Merchandiser */
  crearDom(); await espera(400);
  { const est = JSON.parse(w.localStorage.getItem('talento-balu-v2')); const dd0 = est.datos || est; const a0 = dd0.accesosPrueba.find((a) => a.solicitudId === 'S-PRUEBA-IPV'); a0.bateria = ['IPV', 'KOSTICK', 'LOGICO']; dom.window.close(); crearDom(JSON.stringify(est)); }
  await espera(300);
  ok(true, 'Estado de partida preparado');
  ok(texto().includes('Usuarios corporativos'), 'Login visible');
  // Admin: recorrer módulos
  await click(boton('Administrador'));
  ok(texto().includes('Plantilla activa'), 'Dashboard admin');
  ok(!d.querySelector('.org') && texto().includes('Ver organigrama'), 'Tablero operativo: organigrama plegado hasta que se pide');
  await abrirOrg();
  if (boton('Ver más indicadores (4)')) await click(boton('Ver más indicadores (4)'));
  const m = texto().match(/Egresos < 90 días(\d+,\d)%/); ok(!!m, 'Indicador egresos tempranos: '+(m&&m[1]));
  const ra = texto().match(/Rotación Asesores \(anualizada\)(\d+)%/); ok(!!ra, 'Rotación asesores anualizada: '+(ra&&ra[1])+'%');
  ok(texto().includes('Organigrama: plantilla activa frente a HC de temporada') && texto().includes('Ver plantilla de temporada') && texto().includes('Hoy rige la de temporada'), 'Organigrama con plantilla de temporada (oct-dic)');
  ok(!texto().includes('Plantilla activa por formato'), 'Panel por formato eliminado');
  const nodos = d.querySelectorAll('.org button'); ok(nodos.length===9, 'Nodos del organigrama (red): '+nodos.length);
  const cob = texto().match(/Cobertura([\d,]+)%HC aprobado(\d+)Existentes(\d+)Vacantes(\d+)Excedentes(\d+)/); ok(!!cob, 'Resumen HC red: '+(cob&&cob.slice(1).join(' | ')));
  // Alcance: una tienda tipo D (Lido) oculta VM y ALM con 0/0
  setValor(d.getElementById('org-alcance'),'T02'); await espera();
  const nodosLido=[...d.querySelectorAll('.org button')].map(b=>b.textContent); ok(nodosLido.length>=5 && nodosLido.length<8, 'Organigrama Lido: '+nodosLido.length+' cargos');
  // Clic en nodo abre directorio filtrado
  await click([...d.querySelectorAll('.org button')].find(b=>b.textContent.includes('Asesor de Ventas')));
  const filasAse=[...d.querySelectorAll('tbody tr')]; ok(filasAse.length>0 && filasAse.every(r=>r.children[2].textContent==='Asesor de Ventas' && r.children[3].textContent==='Balú Lido'), 'Nodo abre directorio filtrado ('+filasAse.length+' Asesores de Lido)');
  await click(boton('Tablero')); await abrirOrg();
  // Config HC: subir Asesores de Tipo D cambia cobertura
  await click(boton('Configuración')); await click(boton('Plantilla de HC'));
  ok(!!d.getElementById('hc-D-ASE'), 'Tabla HC por formato');
  setValor(d.getElementById('hc-D-ASE'),'20'); await espera(); await click(boton('Guardar',0));
  { const dlgAu=[...d.querySelectorAll('[role=dialog]')].find(x=>/Autorización del incremento de plantilla/.test(x.textContent)); if (dlgAu) { setValor(d.getElementById('ah-nombre'),'Carlos Operaciones'); await espera(); await click([...dlgAu.querySelectorAll('button')].find(b=>b.textContent.includes('Registrar y guardar'))); await espera(); } }
  await click(boton('Tablero')); await abrirOrg(); setValor(d.getElementById('org-alcance'),'T02'); await espera();
  const nodoAse=[...d.querySelectorAll('.org button')].find(b=>b.textContent.includes('Asesor de Ventas')).textContent; ok(/\/ 20/.test(nodoAse), 'HC editado se refleja: '+nodoAse);
  await click(boton('Configuración')); await click(boton('Plantilla de HC')); setValor(d.getElementById('hc-D-ASE'),'4'); await espera(); await click(boton('Guardar',0));
  for (const mod of ['Directorio','Nuevo ingreso','Evaluaciones','Solicitudes','Configuración']) { await click(boton(mod)); ok(!texto().includes('no pudo mostrarse'), 'Módulo '+mod); }
  for (const tab of ['Plantillas','Tiendas','Cargos','Bitácora','Datos']) { await click(boton(tab)); ok(!texto().includes('no pudo mostrarse'), 'Config '+tab); }
  // Ingreso menor de edad bloqueado
  await click(boton('Nuevo ingreso'));
  const set=(id,v)=>setValor(d.getElementById(id),v);
  const fichaM=()=>{ const el=(i)=>d.getElementById(i); if(!el('fm-genero')) return; set('in-telefono','0412-1234567'); const v={'fm-genero':'Masculino','fm-nacionalidad':'Venezolano/a','fm-tipoVivienda':'Propia','fm-zurdo':'No','fm-tieneHijos':'No','fm-padresViven':'Ambos','fm-rif':'V-12345678-0','fm-correo':'a@b.com','fm-sector':'Centro','fm-municipio':'Libertador','fm-estadoResidencia':'Distrito Capital','fm-emergencia1':'Ana, madre, 0414-0000000','fm-camisa':'M','fm-pantalon':'32','fm-calzado':'40','fm-conyugeNombre':'Cónyuge Prueba'}; Object.keys(v).forEach((k)=>{ if(el(k)) set(k,v[k]); }); };
  const buscarCed=async(n)=>{ set('bus-numero',n); await espera(); await click(boton('Buscar')); };
  await buscarCed('30111222');
  ok(texto().includes('no está en el listado precargado'), 'Cédula no precargada habilita carga manual');
  set('in-nombres','Prueba'); set('in-apellidos','Menor Edad'); set('in-fnac','2010-05-01'); set('in-dir','Sector Catia, calle 4, casa 10'); set('in-civil','Soltero/a'); set('in-nivel','Bachiller'); set('in-titulo','Bachiller en Ciencias'); fichaM(); set('in-tienda','T01');
  await espera(); await click(boton('Guardar y generar documentos'));
  ok(texto().includes('El ingreso de adolescentes requiere un procedimiento especial'), 'Menor de 18 bloqueado');
  // Ingreso válido
  set('in-fnac','1998-03-15'); await espera(); await click(boton('Guardar y generar documentos'));
  ok(texto().includes('Se generaron 4 documentos') && texto().includes('Ruta habitual de traslado (PDF)'), 'Ingreso válido genera el kit legal de 4 documentos y la ruta habitual de traslado visible de inmediato');
  { const dbk=JSON.parse(w.localStorage.getItem('talento-balu-v2')); const tk=dbk.trabajadores[dbk.trabajadores.length-1]; const docs=dbk.documentos.filter(x=>x.trabajadorId===tk.id); const h=(c)=>(docs.find(x=>x.clave===c)||{}).html||'';
    ok(docs.map(x=>x.clave).sort().join()==='cestaticket,confidencialidad,contrato,responsabilidad,rutahabitual', 'Kit: contrato, acuerdo, confidencialidad y convenio y ruta habitual de traslado');
    const ct=h('contrato');
    ok(ct.includes('REPRESENTACIONES ULAB 24, C.A.') && ct.includes('ASESOR (A) DE VENTAS') && ct.includes('Ciento Treinta Bolívares con 00/100 (Bs. 130,00)') && ct.includes('Cuatro Bolívares con 33/100 (Bs. 4,33)') && ct.includes('Cuarenta Dólares Americanos (USD 40)') && ct.includes('Comisión mensual de la venta global') && /90 días desde \d\d\/\d\d\/\d{4} hasta \d\d\/\d\d\/\d{4}/.test(ct) && /a los [a-záéíóúñ ]+ \(\d+\) días del mes de [a-z]+ del año dos mil/.test(ct) && ct.includes('DANIELA ROJAS') && ct.includes('Soltero/a') && !/\[[A-Z_]+\]/.test(ct), 'Contrato con datos del trabajador, salario en letras, comisión y fechas');
    ok(/V- \d{1,3}(\.\d{3})+/.test(ct) && ct.includes('EL PATRONO') && ct.includes('EL (LA) TRABAJADOR(A)'), 'Cédula con formato del modelo y firmas');
    ok(h('confidencialidad').includes('HUELLAS AMBOS PULGARES') && h('confidencialidad').includes('SELLO DE LA ENTIDAD DE TRABAJO') && /las partes eligen el Estado [A-Z]/.test(h('confidencialidad')), 'Confidencialidad con jurisdicción del estado de la tienda, huellas y sello');
    ok(h('cestaticket').includes('CUARENTA DÓLARES AMERICANOS ($40,00)') && h('responsabilidad').includes('30% de su quincena base'), 'Convenio de alimentación y acuerdo de responsabilidad'); }
  // Cédula duplicada
  await click(boton('Registrar otro ingreso'));
  await buscarCed('30111222');
  ok(texto().includes('ya está registrado'), 'Cédula duplicada detectada en la búsqueda');
  // Plantilla con variable desconocida bloquea
  await click(boton('Configuración')); await click(boton('Plantillas'));
  set('pl-texto', d.getElementById('pl-texto').value + '<p>[VARIABLE_INEXISTENTE]</p>'); await espera(); await click(boton('Guardar plantilla'));
  await click(boton('Nuevo ingreso'));
  await buscarCed('30999888');
  set('in-nombres','Var'); set('in-apellidos','Faltante'); set('in-fnac','1995-01-01'); set('in-dir','Sector Catia, calle 4, casa 10'); set('in-civil','Soltero/a'); set('in-nivel','Bachiller'); set('in-titulo','Bachiller en Ciencias'); fichaM(); set('in-tienda','T02');
  await espera(); await click(boton('Guardar y generar documentos'));
  ok(texto().includes('faltan variables') && texto().includes('[VARIABLE_INEXISTENTE]'), 'Variable faltante bloquea generación');
  await click(boton('Configuración')); await click(boton('Plantillas')); await click(boton('Cargar texto original')); await click(boton('Guardar plantilla'));
  // S002 (traslado de GT): RRHH valida con observación y Gerencia General firma
  const dlgBtn=(t)=>[...d.querySelectorAll('[role=dialog] button')].find(x=>x.textContent.trim()===t);
  await click(boton('Salir')); await click(boton('Gerente General'));
  await click(boton('Pendientes de mi aprobación'));
  ok(!texto().includes('S001'), 'Gerente General no ve S001 en pendientes');
  ok(!texto().includes('S002'), 'S002 aún no llega a Gerencia General (falta RRHH)');
  await click(boton('Salir')); await click(boton('Gerente de RRHH'));
  await click(boton('Pendientes de mi aprobación'));
  await click([...d.querySelectorAll('tr')].find(r=>r.textContent.includes('S002')));
  await click(boton('Validar',0));
  ok(dlgBtn('Validar').disabled, 'RRHH no puede validar sin observación');
  set('dlg-comentario','Resultados congruentes con el expediente y el desempeño.'); await espera();
  await click(dlgBtn('Validar'));
  await click(boton('Salir')); await click(boton('Gerente General'));
  await click(boton('Pendientes de mi aprobación'));
  await click([...d.querySelectorAll('tr')].find(r=>r.textContent.includes('S002')));
  await click(boton('Aprobar y firmar',0));
  ok(texto().includes('Resultados congruentes con el expediente'), 'Gerencia General ve la observación de RRHH');
  ok(dlgBtn('Aprobar y firmar').disabled, 'Firma exige aceptación');
  const chk=d.getElementById('dlg-firma'); chk.click(); await espera();
  await click(dlgBtn('Aprobar y firmar'));
  ok(texto().includes('Ejecutada') && /código [0-9A-F]{8}/.test(texto()), 'S002 firmada digitalmente y ejecutada');
  ok(texto().includes('La Cascada'), 'Expediente trasladado a La Cascada');
  { const sol2=JSON.parse(w.localStorage.getItem('talento-balu-v2')).solicitudes.find(x=>x.id==='S002');
    ok(sol2.rutagrama && sol2.rutagrama.tiendaDestinoId===sol2.datosPropuestos.tiendaDestinoId, 'Traslado de tienda genera el rutagrama');
    ok([...d.querySelectorAll('button')].some(b=>b.textContent.trim().startsWith('Ruta habitual de traslado')), 'Botón de ruta habitual de traslado en la solicitud ejecutada');
    await click([...d.querySelectorAll('button')].find(b=>b.textContent.trim().startsWith('Ruta habitual de traslado'))); await espera(150); await click(boton('Vista del documento'));
    const docR=[...d.querySelectorAll('[role=dialog]')].pop().textContent;
    ok(docR.includes('Ruta habitual de traslado') && docR.includes('RAZON SOCIAL:') && docR.includes('REPRESENTACIONES ULAB 24, C.A.') && docR.includes('LOPCYMAT') && docR.includes('PRIMERA ALTERNATIVA') && docR.includes('SEGUNDA ALTERNATIVA') && docR.includes('Medio de Transporte y Ruta:') && docR.includes('Trayecto desde mi Residencia al Centro de Trabajo') && docR.includes('Dirección Actual:') && docR.includes('NOMBRE Y APELLIDO') && docR.includes('FIRMA') && docR.includes('HUELLA') && docR.includes('in itinere'), 'Ruta habitual de traslado con formato oficial LOPCYMAT');
    await click(boton('Cerrar'));
    await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.lacascada'); await espera(); await click(boton('Entrar'));
    ok(texto().includes('Rutas habituales de traslado por cambio de tienda'), 'La tienda destino recibe el rutagrama');
    await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.lido'); await espera(); await click(boton('Entrar'));
    ok(!texto().includes('Rutas habituales de traslado por cambio de tienda') && !JSON.stringify([...d.querySelectorAll('tbody tr')].map(r=>r.textContent)).includes(sol2.id), 'La tienda origen ya no ve el rutagrama');
    await click(boton('Salir')); await click(boton('Administrador')); }
  // Rechazo exige comentario
  await click(boton('Salir')); await click(boton('Gerente de Marca'));
  await click(boton('Solicitudes'));
  await click([...d.querySelectorAll('tr')].find(r=>r.textContent.includes('S001')));
  await click(boton('Rechazar',0));
  const btnRech=[...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Rechazar');
  ok(btnRech.disabled, 'Rechazar deshabilitado sin comentario');
  set('dlg-comentario','Comentario corto'); await espera();
  ok(![...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Rechazar').disabled, 'Rechazar habilitado con 15+ caracteres');
  await click(boton('Cancelar'));
  await click(boton('Aprobar',0)); await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Aprobar'));
  ok(texto().includes('En revisión'), 'S001 aprobada por Marca -> En revisión');
  // RRHH ejecuta S003 (desincorporación)
  await click(boton('Salir')); await click(boton('Gerente de RRHH'));
  await click(boton('Pendientes de mi aprobación'));
  await click([...d.querySelectorAll('tr')].find(r=>r.textContent.includes('S003')));
  await click(boton('Ejecutar',0)); await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Ejecutar'));
  ok(texto().includes('Ejecutada'), 'S003 ejecutada');
  await click(boton('Expediente'));
  ok(texto().includes('Egresado'), 'Expediente actualizado a Egresado');
  // Evaluación Nine-Box (la realiza Gerencia de Marca)
  await click(boton('Evaluaciones')); await click(boton('Pendientes'));
  ok(!texto().match(/Evaluar/), 'RRHH no realiza Nine-Box');
  await click(boton('Salir')); await click(boton('Gerente de Marca'));
  await click(boton('Evaluaciones')); await click(boton('Pendientes'));
  await click(boton('Evaluar',0));
  const grupos=[...d.querySelectorAll('[role=radiogroup]')];
  ok(grupos.length===9, '9 ítems Likert');
  for (const [i,g] of grupos.entries()) await click(g.querySelectorAll('button')[i<5?4:3]);
  await click(boton('Guardar evaluación'));
  ok(texto().includes('Caja 9') || texto().includes('Estrella'), 'Resultado: caja 9 (desempeño 5 / potencial 4)');
  ok(texto().includes('APROBADO'), 'Constancia APROBADO (10 >= 7)');
  ok(texto().includes('En aprobación') && texto().includes('El feedback se habilita cuando apruebe el último paso'), 'Nine-Box en aprobación; feedback bloqueado');
  const flujoNB=(texto().match(/Flujo (S-[A-Z0-9]+)/)||[])[1]; ok(!!flujoNB, 'Flujo Nine-Box '+flujoNB);
  const calibrar = async (rolBtn) => { await click(boton('Salir')); await click(boton(rolBtn)); await click(boton('Evaluaciones')); await click([...d.querySelectorAll('[role=tab]')].find((t) => t.textContent.trim().startsWith('Calibración Nine-Box'))); await click(boton('Confirmar')); await click(d.getElementById('cal-enviar')); };
  for (const [rolBtn, accion] of [['Gerente de Operaciones','Aprobar'],['CALIBRAR','Marca'],['CALIBRAR','Operaciones'],['Gerente de RRHH','Validar'],['Gerente General','Aprobar y firmar']]) {
    if (rolBtn === 'CALIBRAR') { await calibrar(accion === 'Marca' ? 'Gerente de Marca' : 'Gerente de Operaciones'); continue; }
    await click(boton('Salir')); await click(boton(rolBtn));
    await click(boton('Solicitudes')); await click(boton('Pendientes de mi aprobación'));
    await click([...d.querySelectorAll('tr')].find(r=>r.textContent.includes(flujoNB)));
    await click(boton(accion,0));
    if (accion==='Validar') { set('dlg-comentario','Evaluación coherente con los resultados de la tienda.'); await espera(); }
    if (accion==='Aprobar y firmar') { d.getElementById('dlg-firma').click(); await espera(); }
    await click(dlgBtn(accion));
  }
  ok(texto().includes('Ejecutada'), 'Nine-Box aprobada tras la firma de Gerencia General');
  // Feedback del Gerente de Marca (evaluado es Gerente de Tienda)
  await click(boton('Salir')); await click(boton('Gerente de Marca'));
  ok(texto().includes('Feedback pendiente'), 'Feedback pendiente en el tablero del responsable');
  await click(boton('Dar feedback',0));
  set('fb-fort','Excelente manejo de inventario y del equipo.'); set('fb-opor','Debe delegar más en su Subgerente.'); set('fb-comp','Plan de delegación con seguimiento mensual.'); await espera();
  await click(boton('Registrar feedback y generar informe'));
  ok(texto().includes('Informe final PDF'), 'Informe final generado con feedback');
  // No elegibles
  await click(boton('Evaluaciones')); await click(boton('Aún no elegibles'));
  ok(/Disponible en/.test(texto()), 'Lista de no elegibles con días faltantes');
  // Gerente de tienda: alcance
  await click(boton('Salir'));
  setValor(d.getElementById('login-tienda'),'gerente.lido'); await espera(); await click(boton('Entrar'));
  await click(boton('Mi Tienda'));
  const filas=[...d.querySelectorAll('tbody tr')]; const tiendas=new Set(filas.map(r=>r.children[3].textContent));
  ok(tiendas.size===1 && tiendas.has('Balú Lido'), 'Gerente de Lido solo ve Lido ('+filas.length+' filas)');
  ok(!texto().includes('Configuración'), 'Gerente de tienda sin Configuración');
  // Visor
  await click(boton('Salir')); await click(boton('Visor General'));
  ok(!texto().includes('Nuevo ingreso'), 'Visor sin Nuevo ingreso');
  await click(boton('Solicitudes')); ok(!texto().includes('Nueva solicitud'), 'Visor no crea solicitudes');
  // Visor Balú no ve Planeta
  await click(boton('Directorio')); ok(!texto().includes('Planeta 0'), 'Visor Balú no ve tiendas Planeta');
  // Gerente de Marca Planeta
  await click(boton('Salir')); await click(boton('Gerente de Marca',1));
  ok(texto().includes('Marca Planeta'), 'Marca Planeta: tablero filtrado');
  await click(boton('Directorio'));
  const tiendasPl=new Set([...d.querySelectorAll('tbody tr')].map(r=>r.children[3].textContent)); ok([...tiendasPl].every(x=>x.startsWith('Planeta')), 'Marca Planeta solo ve tiendas Planeta ('+tiendasPl.size+')');
  ok(!d.getElementById('dir-marca'), 'Marca Planeta sin selector de marca');
  await click(boton('Solicitudes')); await click(boton('Pendientes de mi aprobación'));
  ok(!texto().includes('S001'), 'Marca Planeta no aprueba solicitudes de Balú');
  // RRHH: ambas marcas
  await click(boton('Salir')); await click(boton('Gerente de RRHH'));
  ok(!!d.getElementById('dash-marca'), 'RRHH tiene selector de marca en tablero');
  setValor(d.getElementById('dash-marca'),'PLANETA'); await espera();
  ok(texto().includes('Marca Planeta'), 'RRHH filtra tablero por Planeta');
  await abrirOrg();
  const optOrg=[...d.getElementById('org-alcance').options].map(o=>o.textContent); ok(optOrg.some(o=>o.includes('11 tiendas')), 'Organigrama Planeta: 11 tiendas');
  { const bAm=[...d.querySelectorAll('button[aria-pressed]')].find(b=>b.title==='Balú y Planeta'); if(bAm){ await click(bAm); await espera(); } }
  // Ingresos por período
  await click(boton('Ingresos y egresos'));
  const num=(t)=>{ const m=texto().match(new RegExp(t+'(\\d+)')); return m?Number(m[1]):-1; };
  const ingMes=num('Ingresos'); setValor(d.getElementById('ip-periodo'),'anio'); await espera(); const ingAnio=num('Ingresos');
  ok(ingAnio>=ingMes && ingAnio>0, `Ingresos mes ${ingMes} / año ${ingAnio}`);
  ok(!!d.getElementById('ip-marca'), 'RRHH filtra ingresos por marca');
  setValor(d.getElementById('ip-marca'),'PLANETA'); await espera(); const ingPl=num('Ingresos'); ok(ingPl>0 && ingPl<ingAnio, 'Ingresos año Planeta: '+ingPl);
  { const bAm=[...d.querySelectorAll('button[aria-pressed]')].find(b=>b.title==='Balú y Planeta'); if(bAm){ await click(bAm); await espera(); } }
  setValor(d.getElementById('ip-periodo'),'personalizado'); await espera(); setValor(d.getElementById('ip-desde'),'2026-09-30'); setValor(d.getElementById('ip-hasta'),'2026-09-01'); await espera();
  ok(texto().includes('La fecha inicial no puede ser posterior'), 'Rango inválido detectado');
  // Gerente de tienda en ingresos
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  await click(boton('Ingresos y egresos')); setValor(d.getElementById('ip-periodo'),'anio'); await espera();
  ok(!d.getElementById('ip-tienda') && !d.getElementById('ip-marca'), 'Gerente de tienda sin filtros de marca ni tienda');
  const tiendasIng=new Set([...d.querySelectorAll('tbody tr')].map(r=>r.children[4].textContent)); ok(tiendasIng.size<=1 && (!tiendasIng.size || tiendasIng.has('Balú Propatria')), 'Gerente Propatria solo ve sus ingresos');
  // Carga en bloque de nombres
  await click(boton('Salir')); await click(boton('Administrador')); await click(boton('Configuración')); await click(boton('Tiendas'));
  setValor(d.getElementById('ct-marca'),'PLANETA'); await espera();
  setValor(d.getElementById('ct-texto'),'Planeta Sambil; A; Caracas\nPlaneta Metrocenter; Outlet; Caracas'); await espera();
  await click(boton('Aplicar a 2 tiendas')); await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Aplicar'));
  ok(texto().includes('Planeta Sambil') && texto().includes('Planeta Metrocenter'), 'Carga en bloque renombra tiendas');
  // ===== Gerente de Tienda: precargados y contratos =====
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  ok(texto().includes('Vencimientos de contrato por atender'), 'GT ve alertas de contrato en el tablero');
  await click(boton('Nuevo ingreso'));
  await buscarCed('31245678');
  ok(texto().includes('Datos tomados del listado precargado') && d.getElementById('in-nombres').value==='Yuleisy Carolina', 'Precargado completa los datos');
  await click(boton('Guardar y generar documentos'));
  ok(texto().includes('Seleccione el estado civil'), 'El estado civil es obligatorio para el contrato');
  set('in-civil','Soltero/a'); set('in-nivel','Bachiller'); set('in-titulo','Bachiller en Ciencias'); fichaM(); await espera(); await click(boton('Guardar y generar documentos'));
  ok(texto().includes('Se generaron 4 documentos'), 'GT registra ingreso desde precargado');
  ok(texto().includes('La descarga se habilita el') && !texto().includes('Ver y descargar'), 'Documentos bloqueados los primeros 4 días');
  await click(boton('Registrar otro ingreso')); await buscarCed('30777111');
  set('in-nombres','Pedro'); set('in-apellidos','Permanencia Prueba'); set('in-fnac','1999-02-02'); set('in-dir','Sector Catia, calle 9, casa 3'); set('in-civil','Casado/a'); set('in-nivel','Bachiller'); set('in-titulo','Bachiller en Ciencias'); fichaM();
  const hace5=new Date(Date.now()-5*86400000); set('in-fing', hace5.toISOString().slice(0,10)); await espera();
  await click(boton('Guardar y generar documentos'));
  await click(boton('El trabajador continúa')); await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Confirmar'));
  ok(texto().includes('Ver y descargar los 4'), 'Tras confirmar permanencia (día 5) se habilita la descarga');
  await click(boton('Registrar otro ingreso')); await buscarCed('30567123');
  ok(texto().includes('Está precargado para la tienda Balú Lido'), 'Precargado de otra tienda bloqueado');
  await click(boton('Prueba y contratos'));
  ok([...d.querySelectorAll('tbody tr')].some(r=>r.textContent.includes('Período de prueba') && r.textContent.includes('Alerta roja')), 'Período de prueba sin evaluar en alerta roja (día 30)');
  const filaPrueba=[...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Período de prueba') && r.textContent.includes('Alerta amarilla'));
  ok(!!filaPrueba, 'Período de prueba en alerta amarilla (día 26)');
  await click([...filaPrueba.querySelectorAll('button')].find(b=>b.textContent.includes('Evaluar')));
  ok(texto().includes('Evaluación de período de prueba'), 'Formulario de evaluación de prueba');
  ok(texto().includes('Se requieren 3 de 4 aprobaciones'), 'Período de prueba: 3 de 4 aprobaciones (Tienda, Marca, Operaciones, RRHH)');
  for (const g of d.querySelectorAll('[role=radiogroup][aria-labelledby]')) await click(g.querySelectorAll('button')[3]);
  await click([...d.querySelectorAll('[role=radio]')].find(b=>b.textContent.includes('Superó el período de prueba')));
  await click(boton('Enviar evaluación'));
  ok(texto().includes('Evaluación enviada a Gerente de Marca') || texto().includes('Le corresponde') || texto().includes('En revisión'), 'Evaluación enviada con aprobación inicial del GT');
  const idEval = (texto().match(/Evaluación de período de prueba · (S-[A-Z0-9-]+?)Creada/)||[])[1]; ok(!!idEval, 'Solicitud de evaluación creada '+idEval);
  ok(texto().includes('Resumen de la gestión') && !texto().includes('Línea de tiempo'), 'Gerente de Tienda ve solo el resumen de la gestión');
  // FIJO a los 164 días requiere RRHH
  await click(boton('Prueba y contratos'));
  const filaFijo=[...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Pase a fijo') && r.textContent.includes('164'));
  await click([...filaFijo.querySelectorAll('button')].find(b=>b.textContent.includes('Evaluar')));
  ok(texto().includes('Gerente de RRHH · obligatorio'), 'Pase a fijo exige RRHH');
ok(d.querySelectorAll('[role=radiogroup][aria-labelledby]').length>=9 && texto().includes('Evaluación práctica y de habilidades blandas') && texto().includes('Módulo 1: Desempeño práctico y técnico'), 'Pase a fijo usa el formato oficial (9 criterios, escala E/MB/B/D/MD)');
  await click(boton('Prueba y contratos'));
  // Marca y Operaciones aprueban la prueba
  for (const [btnRol, idx] of [['Gerente de Marca',0],['Gerente de Operaciones',0]]) {
    await click(boton('Salir')); await click(boton(btnRol, idx));
    await click(boton('Solicitudes')); await click(boton('Pendientes de mi aprobación'));
    await click([...d.querySelectorAll('tr')].find(r=>r.textContent.includes(idEval)));
    await click(boton('Aprobar',0)); await click([...d.querySelectorAll('[role=dialog] button')].find(b=>/^Aprobar/.test(b.textContent.trim())));
  }
  ok(texto().includes('Ejecutada'), 'Prueba aprobada por Operaciones queda registrada (sin RRHH)');
  await click(boton('Expediente')); await click(boton('Contrato'));
  ok(/Evaluación de período de prueba[\s\S]*Aprobado/.test(texto()), 'Expediente: período de prueba aprobado');
  // RRHH aprueba el pase a fijo S004
  await click(boton('Salir')); await click(boton('Gerente de RRHH'));
  await click(boton('Solicitudes')); await click(boton('Pendientes de mi aprobación'));
  await click([...d.querySelectorAll('tr')].find(r=>r.textContent.includes('S004')));
  await click(boton('Aprobar',0)); await click([...d.querySelectorAll('[role=dialog] button')].find(b=>/^Aprobar/.test(b.textContent.trim())));
  await click(boton('Expediente')); await click(boton('Contrato'));
  ok(texto().includes('Tiempo indeterminado (fijo)'), 'RRHH aprueba pase a fijo: contrato indeterminado');
  ok([...d.querySelectorAll('button')].some(b=>b.textContent.trim()==='Certificado'), 'Certificado disponible para evaluaciones aprobadas');
  await click(boton('Carta de bienvenida')); await espera(150);
  await click(boton('Vista del documento')); const vistaCarta=d.querySelector('[role=dialog]').textContent;
  ok(vistaCarta.includes('REPRESENTACIONES ULAB 24, C.A') && vistaCarta.includes('J-50505660-3') && vistaCarta.includes('de conformidad con la cláusula PRIMERA del contrato firmado en fecha') && vistaCarta.includes('ha pasado a ser un trabajador fijo') && vistaCarta.includes('Recibido por el trabajador (a)') && vistaCarta.includes('Gerente de Talento Humano') && vistaCarta.includes('este documento no tiene validez'), 'Carta de pase a fijo con el formato del modelo');
  await click(boton('Cerrar'));
  // ===== Pruebas de Forms, amonestaciones y egresos =====
  const db=()=>JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const asesT01=db().trabajadores.filter(x=>x.tiendaId==='T01'&&x.cargoId==='ASE'&&x.estatus==='ACTIVO').filter(x=>db().resultadosPruebas.some(r=>r.trabajadorId===x.id));
  const conAmon=db().amonestaciones.map(a=>a.trabajadorId).find((id,i,arr)=>arr.filter(y=>y===id).length>1);
  await click(boton('Salir')); await click(boton('Gerente de RRHH'));
  await click(boton('Evaluaciones')); await click(boton('Traslados y promociones'));
  const objetivo=db().trabajadores.find(x=>x.id===conAmon);
  set('if-prueba','P2'); await espera();
  const inp=d.getElementById('if-archivo');
  const archivo=new w.File([`ID;Hora de finalización;Cédula;Puntos totales\n1;03/10/2026 10:15;${objetivo.cedula};85\n2;03/10/2026 10:20;V-99999999;70`], 'respuestas.csv', {type:'text/csv'});
  Object.defineProperty(inp,'files',{value:[archivo]}); inp.dispatchEvent(new w.Event('change',{bubbles:true})); await espera(200);
  ok(texto().includes('2 respuestas') && texto().includes('No encontrado'), 'Importación de Forms: vista previa con cédulas cruzadas');
  await click(boton('Registrar 1 resultados'));
  ok(db().resultadosPruebas.some(r=>r.trabajadorId===objetivo.id && r.pruebaId==='P2' && r.puntaje===85 && r.fuente==='IMPORTADO'), 'Resultado importado guardado');
  // GT Propatria: candidato con 2 amonestaciones no es elegible; candidato limpio sí
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  await click(boton('Evaluaciones'));
  set('pa-trab', objetivo.id); set('pa-cargo','CAJ'); await espera();
  ok(texto().includes('no elegible'), 'Dos amonestaciones en 6 meses: no elegible');
  set('pa-trab', asesT01[0].id); set('pa-cargo','CAJ'); await espera();
  ok(texto().includes('Cumple los requisitos para solicitar la promoción'), 'Asesor con prueba de conocimiento importada cumple para Cajero');
  set('pa-cargo','CAJT'); await espera();
  ok(texto().includes('el trabajador responderá en el portal: Indicador Lógico I, Inventario de Personalidad Comercial (IPC), Prueba de Integridad Laboral'), 'Cajero Principal: la prueba pendiente se responde en el portal');
  set('pa-cargo','CAJ'); await espera();
  await click(boton('Crear solicitud de promoción'));
  set('so-motivo','Buen desempeño y prueba aprobada en Forms.'); await espera();
  await click(boton('Crear y enviar'));
  ok(texto().includes('Promoción') && texto().includes('Gerente de Marca') && texto().includes('Gerente General · aprobación con firma digital') === false, 'Promoción creada');
  ok(texto().includes('Valida y observa') && texto().includes('Aprueba con firma digital'), 'Ruta incluye validación RRHH y firma de Gerencia General');
  // Egresos por período
  await click(boton('Ingresos y egresos')); setValor(d.getElementById('ip-periodo'),'anio'); await espera();
  await click(boton('Detalle de egresos'));
  ok(d.querySelectorAll('tbody tr').length>0 && texto().includes('Motivo'), 'Detalle de egresos por período');
  setValor(d.getElementById('ip-periodo'),'personalizado'); await espera(); setValor(d.getElementById('ip-desde'),'2015-01-01'); await espera();
  ok(!texto().includes('rango no válido'), 'Período personalizado sin máximo de tiempo');
  // ===== Apoyos de personal =====
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  await click(boton('Apoyos de personal'));
  const persT01=db().trabajadores.filter(x=>x.tiendaId==='T01'&&x.estatus==='ACTIVO'&&x.cargoId==='ASE');
  const regApoyo=async(trabId, tienda, cargo, distinto)=>{
    set('ap-trab',trabId); await espera(); set('ap-tienda',tienda); set('ap-cargo',cargo); await espera();
    set('ap-tipo', distinto ? 'FALTA_PERSONAL' : 'VACACIONES'); await espera();
    if (!distinto) { const sel=d.getElementById('ap-cubierto'); set('ap-cubierto', sel.options[1].value); await espera(); }
    set('ap-motivo','Cobertura por vacaciones del titular.'); await espera();
    if (distinto) { d.getElementById('ap-distinto').click(); await espera(); set('ap-monto','35'); set('ap-just','Cubre turno completo de cierre durante toda la quincena.'); await espera(); }
    await click(boton('Registrar y enviar'));
  };
  await regApoyo(persT01[0].id,'T01','CAJ',false);
  ok(texto().includes('Apoyos de la quincena') && texto().includes('0 de 2 aprobaciones'), 'Apoyo registrado: requiere 2 de 3');
  await click(boton('Registrar apoyo')); await regApoyo(persT01[1].id,'T05','CAJT',true);
  const apoyos=db().solicitudes.filter(x=>x.tipo==='APOYO');
  const [apNormal, apDistinto]=[apoyos.find(x=>!x.datosPropuestos.montoDistinto), apoyos.find(x=>x.datosPropuestos.montoDistinto)];
  ok(apNormal && apDistinto && apDistinto.pasos.some(p=>p.rol==='general'), 'Monto distinto agrega Gerencia General al final');
  const aprobarComo=async(rolBtn, idx, id)=>{
    await click(boton('Salir')); await click(boton(rolBtn, idx));
    await click(boton('Solicitudes')); await click(boton('Pendientes de mi aprobación'));
    const fila=[...d.querySelectorAll('tr')].find(r=>r.textContent.includes(id)); if(!fila) return false;
    await click(fila); await click(boton('Aprobar',0)); await click([...d.querySelectorAll('[role=dialog] button')].find(b=>/^Aprobar/.test(b.textContent.trim()))); return true;
  };
  await aprobarComo('Gerente de Marca',0,apNormal.id); await aprobarComo('Gerente de RRHH',0,apNormal.id);
  ok(db().solicitudes.find(x=>x.id===apNormal.id).estado==='EJECUTADA', 'Apoyo normal aprobado con 2 de 3 (Marca + RRHH)');
  ok(texto().includes('Constancia PDF'), 'Constancia de apoyo disponible');
  await aprobarComo('Gerente de Marca',0,apDistinto.id); await aprobarComo('Gerente de Operaciones',0,apDistinto.id);
  ok(db().solicitudes.find(x=>x.id===apDistinto.id).estado!=='EJECUTADA', 'Monto distinto no se cierra sin RRHH');
  ok(!(await aprobarComo('Gerente General',0,apDistinto.id)), 'Gerencia General no ve el caso antes de RRHH');
  await aprobarComo('Gerente de RRHH',0,apDistinto.id);
  ok(await aprobarComo('Gerente General',0,apDistinto.id), 'Tras RRHH llega a Gerencia General');
  ok(db().solicitudes.find(x=>x.id===apDistinto.id).estado==='EJECUTADA', 'Monto distinto aprobado por Gerencia General');
  await click(boton('Apoyos de personal')); await click(boton('Reporte quincenal'));
  ok(texto().includes('Flujo de aprobación') && (()=>{ const m=texto().match(/Total aprobado de la quincena: USD (\d+(?:\.\d{3})*(?:,\d{2})?)/); if(!m) return false; const v=Number(m[1].replace(/\./g,'').replace(',','.')); const dias=(v-35)/2.5; return Number.isInteger(dias) && dias>=1 && dias<=14; })(), 'Reporte quincenal con flujo y total (días a USD 2,50 según la fecha + 35 distinto)');
  ok(apNormal.datosPropuestos.motivoTipo==='VACACIONES' && apNormal.datosPropuestos.cubiertoId && apDistinto.datosPropuestos.motivoTipo==='FALTA_PERSONAL', 'Apoyo guarda el motivo y el trabajador cubierto');
  ok(texto().includes('Vacaciones') && texto().includes('Falta de personal'), 'Reporte quincenal muestra el motivo');
  await click([...d.querySelectorAll('button')].find(b=>b.textContent.trim()==='Indicadores'));
  ok(texto().includes('Apoyos por motivo') && texto().includes('Por falta de personal') && d.getElementById('ia-periodo'), 'Indicadores de apoyos por motivo con período');
  // ===== Pernoctas =====
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  await click(boton('Pernoctas'));
  await click(boton('Informar pernocta', 1));
  ok(texto().includes('Seleccione el motivo') && texto().includes('Seleccione al menos una persona'), 'Pernocta valida motivo y personas');
  set('pn-motivo','INVENTARIO'); set('pn-obj','Completar el conteo físico antes de la apertura.'); await espera();
  const pT01=db().trabajadores.filter(x=>x.tiendaId==='T01'&&x.estatus==='ACTIVO').sort((a,b)=>a.apellidos.localeCompare(b.apellidos));
  d.getElementById('pn-p-'+pT01[0].id).click(); await espera(); d.getElementById('pn-p-'+pT01[1].id).click(); await espera();
  await click([...d.querySelectorAll('[role=radio]')].find(b=>b.textContent.trim()==='Sí'));
  await click(boton('Informar pernocta', 1));
  const pn=db().solicitudes.find(x=>x.tipo==='PERNOCTA');
  ok(pn && pn.datosPropuestos.participantes.length===2 && pn.tiendaId==='T01' && pn.pasos.map(x=>x.rol).join()==='marca,operaciones,rrhh', 'Pernocta registrada con ruta Marca, Operaciones y RRHH');
  await aprobarComo('Gerente de Marca',0,pn.id); await aprobarComo('Gerente de Operaciones',0,pn.id);
  ok(db().solicitudes.find(x=>x.id===pn.id).estado!=='EJECUTADA', 'Pernocta no se cierra sin RRHH');
  await aprobarComo('Gerente de RRHH',0,pn.id);
  ok(db().solicitudes.find(x=>x.id===pn.id).estado==='EJECUTADA' && texto().includes('Personas que pernoctaron'), 'Pernocta aprobada por las tres gerencias');
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  ok(texto().includes('Pernoctas de los últimos 30 días') && texto().includes('Inventario físico') && texto().includes(pT01[0].nombres.split(' ')[0]), 'Tablero del Gerente muestra personas y motivo de la pernocta');
  await click(boton('Pernoctas')); await click(boton('Indicadores'));
  ok(texto().includes('Personas-noche') && texto().includes('100%') && d.getElementById('pn-periodo'), 'Indicadores de pernoctas con período');
  setValor(d.getElementById('pn-periodo'),'personalizado'); await espera(); setValor(d.getElementById('pn-desde'),'2020-01-01'); setValor(d.getElementById('pn-hasta'),'2020-12-31'); await espera();
  ok(texto().includes('Sin pernoctas en el período'), 'El período elegido filtra las pernoctas');
  // ===== Gerencia General: sin detalle de contratos =====
  await click(boton('Salir')); await click(boton('Gerente General',0));
  await click(boton('Prueba y contratos'));
  ok(texto().includes('Resumen por marca') && !texto().includes('Por atender'), 'Gerencia General ve el resumen de contratos por marca');
  setValor(d.getElementById('ct-agrupar'),'TIENDA'); await espera();
  ok(texto().includes('Resumen por tienda'), 'Gerencia General puede agrupar por tienda');
  await click(botonExacto('Ver detalle'));
  ok(texto().includes('Por atender') && texto().includes('Volver al resumen'), 'Gerencia General abre el detalle solo si lo pide');
  await click(boton('Volver al resumen'));
  const evC=db().solicitudes.find(x=>x.tipo==='EVAL_PRUEBA');
  if (evC) { await click(boton('Solicitudes')); await click(boton('Todas')); const fila=[...d.querySelectorAll('tr')].find(r=>r.textContent.includes(evC.id)); if (fila) { await click(fila); ok(texto().includes('Resumen de la gestión') && !texto().includes('Criterios'), 'Gerencia General ve solo el resumen de la evaluación'); } }
  const vistaDoc=async(btnTxt)=>{ await click(boton(btnTxt)); await espera(150); await click(boton('Vista del documento')); const dl=[...d.querySelectorAll('[role=dialog]')].pop(); const tx=dl.textContent; await click(boton('Cerrar')); return tx; };
  // ===== Pernocta: nuevos motivos y documento para nómina =====
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  await click(boton('Pernoctas'));
  const opsPn=[...d.getElementById('pn-motivo').options].map(o=>o.textContent);
  ok(opsPn.includes('Reetiquetado') && opsPn.includes('Cambios de precio'), 'Motivos de pernocta incluyen Reetiquetado y Cambios de precio');
  await click(boton('Pernoctas',1));
  const filaPn=[...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Inventario físico'));
  await click([...filaPn.querySelectorAll('button')].find(b=>b.textContent.includes('PDF nómina'))); await espera(150);
  await click(boton('Vista del documento')); const docPn=[...d.querySelectorAll('[role=dialog]')].pop().textContent; await click(boton('Cerrar'));
  ok(docPn.includes('Departamento de Nómina') && !docPn.includes('Futura') && docPn.includes('Firma del trabajador') && docPn.includes('GERENTE DE TIENDA') && docPn.includes(pT01[0].cedula), 'PDF de pernocta para Nómina con participantes y firmas');
  // ===== Información de tiendas =====
  await click(boton('Información de tiendas'));
  ok(texto().includes('Propatria') && texto().includes('N.º patronal IVSS') && !texto().includes('Exportar CSV') && !d.querySelector('tbody'), 'Gerente de Tienda ve solo la ficha de su tienda');
  ok(![...d.querySelectorAll('nav button, aside button')].some(b=>/Incentivos de ventas|Modelos de compensación/.test(b.textContent)), 'Gerente de Tienda no ve Incentivos ni Modelos de compensación');
  await click(boton('Salir')); await click(boton('Gerente de RRHH',0));
  await click(boton('Información de tiendas'));
  ok(d.querySelectorAll('tbody tr').length===32, 'RRHH ve las 30 tiendas y las 2 sedes administrativas');
  await click([...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Propatria'))); await click(boton('Editar'));
  set('it-direccion','Av. Principal de Propatria, Caracas'); set('it-metrosCuadrados','420'); set('it-metrosPisoVenta','500'); await espera();
  await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Guardar'));
  ok(texto().includes('No puede superar el metraje total'), 'Valida que el piso de ventas no supere el metraje total');
  set('it-metrosPisoVenta','310'); set('it-ivss','D12345678'); set('it-ince','123456'); set('it-faov','987654'); set('it-mintra','MT-001'); set('it-ciudad','Caracas, Distrito Capital'); await espera();
  await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Guardar'));
  const tPro=db().tiendas.find(x=>x.id==='T01');
  ok(tPro.metrosPisoVenta===310 && tPro.ivss==='D12345678' && texto().includes('Datos cargados: 9 de 9'), 'RRHH registra la información de la tienda');
  ok(texto().includes('Domicilio fiscal de la empresa') && texto().includes('REPRESENTACIONES ULAB 24, C.A.') && texto().includes('O12488405') === false && tPro.ivss==='D12345678', 'Ficha de tienda: razón social y domicilio fiscal de la empresa; el dato propio de la tienda prevalece');
  // ===== Modelos de compensación =====
  await click(boton('Modelos de compensación')); await click(boton('Nuevo modelo',0));
  set('mc-nombre','Modelo Outlet Balú'); set('mc-c-0','Comisión por ventas'); set('mc-b-0','Venta neta de la tienda'); set('mc-v-0','1,5%'); await espera();
  d.getElementById('mc-ti-T01').click(); await espera();
  await click(boton('Guardar modelo'));
  ok((db().modelosCompensacion||[]).length===1 && db().modelosCompensacion[0].tiendas.includes('T01') && texto().includes('Modelo Outlet Balú'), 'RRHH crea un modelo y lo asigna a la tienda');
  // ===== Incentivos de ventas =====
  await click(boton('Incentivos de ventas'));
  set('cv-categoria','CAMPANA'); await espera(); set('cv-tienda','T01'); await espera(); set('cv-tienda-2','T02'); await espera(); set('cv-resultado-2','+8%'); set('cv-monto-2','60'); set('cv-modalidad','FACTURACION'); set('cv-meta','+10% vs. año anterior'); set('cv-resultado','+12%'); set('cv-monto','100'); await espera();
  const elegT01=db().trabajadores.filter(x=>x.tiendaId==='T01'&&x.estatus==='ACTIVO');
  await click(boton('Registrar y enviar'));
  const cv=(db().concursos||[]).find(c=>c.lugar===1);
  const cv2=(db().concursos||[]).find(c=>c.lugar===2);
  ok(cv && cv2 && cv.grupoId===cv2.grupoId && cv.categoria==='CAMPANA' && cv2.tiendaId==='T02' && cv2.montoTotal===60, 'Incentivo con categoría y tiendas en 1.er y 2.º lugar');
  const corteCv=cv?cv.fechaCorte:'';
  ok(cv && cv.estado==='PENDIENTE' && cv.participantes.every(p=>p.dias>14) && cv.participantes.length+cv.excluidos.length===elegT01.filter(x=>x.fechaIngreso<=corteCv).length && Math.abs(cv.participantes.reduce((a,p)=>a+p.monto,0)-100)<0.001, 'Incentivo: participan solo con más de 14 días y el reparto suma el total');
  await click(boton('Salir')); await click(boton('Gerente de Marca',0)); await click(boton('Incentivos de ventas'));
  ok(!texto().includes('Registrar incentivo') && texto().includes('Por aprobar'), 'Gerente de Marca ve incentivos pero no registra');
  await click(boton('Salir')); await click(boton('Gerente General',0)); await click(boton('Incentivos de ventas'));
  await click([...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Propatria')));
  await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Aprobar'));
  await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Aprobar'));
  ok(db().concursos.find(c=>c.lugar===1).estado==='APROBADO' && db().concursos.find(c=>c.lugar===1).aprobacion.codigo, 'Gerencia General aprueba el incentivo');
  await click(boton('Relación de pago'));
  ok(texto().includes('Total a pagar') && texto().includes('USD 100,00'), 'Relación de pago con total por trabajador y total general');
  const docCv=await vistaDoc('Documento PDF para nómina');
  ok(docCv.includes('Total por trabajador') && docCv.includes('Total a pagar') && docCv.includes('RECIBIDO: NÓMINA'), 'PDF mensual de incentivos para Nómina');
  // ===== Ingresos y egresos por separado y resultados consolidados =====
  await click(boton('Ingresos y egresos')); setValor(d.getElementById('ip-periodo'),'anio'); await espera();
  await click(boton('Solo egresos'));
  ok(texto().includes('Rotación del período') && texto().includes('Egresos por motivo y cargo') && !texto().includes('Detalle de ingresos'), 'Vista solo de egresos');
  await click(boton('Solo ingresos'));
  ok(texto().includes('Siguen activos') && !texto().includes('Detalle de egresos'), 'Vista solo de ingresos');
  await click(boton('Tablero')); await abrirOrg();
  ok(texto().includes('Tablero de Gerencia General') && texto().includes('Resultados de evaluaciones') && !d.querySelector('.org'), 'Tablero informativo de Gerencia General con resultados consolidados');
  ok(!!d.getElementById('re-periodo'), 'Resultados consolidados se abren a pedido');
  ok(texto().includes('Plantilla frente a HC') && !texto().includes('Mapa de calor') && texto().includes('Vencimientos de contrato') && texto().includes('Pernoctas (30 días)') && texto().includes('Ingresos del mes'), 'Gerencia General ve resúmenes sin detalle');
  await click(boton('Ver por tienda'));
  ok(texto().includes('Mapa de calor') && [...d.querySelectorAll('th')].some(th=>th.textContent.trim()==='Formato'), 'Al expandir: plantilla por tienda con semáforo y mapa de calor');
  { const filasHC=[...d.querySelectorAll('tbody tr')].filter(r=>/(Rojo|Amarillo|Verde)$/.test(r.lastElementChild.textContent)); ok(filasHC.length>0 && filasHC.some(r=>/bg-(red|amber|emerald)-50/.test(r.className)), 'Filas en rojo, amarillo o verde según criticidad'); }
  await click(boton('Ver organigrama'));
  ok(!!d.querySelector('.org') && !!d.getElementById('org-alcance'), 'Organigrama por marca y tienda a pedido');
  await click(boton('Ver personas'));
  ok([...d.querySelectorAll('th')].some(th=>th.textContent.trim()==='Fecha límite'), 'Detalle de vencimientos a pedido');
  await click(boton('Salir')); await click(boton('Gerente de RRHH',0));
  await click(boton('Ver mapa de calor')); await click(boton('Ver por tienda'));
  ok(texto().includes('Mapa de calor') && texto().includes('Ingresos del año'), 'Tablero operativo con mapa de calor y plantilla con ingresos y egresos');
  // ===== Reprobado en evaluación de contrato: alerta a RRHH y carta de culminación =====
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  await click(boton('Prueba y contratos'));
  const filaEv=[...d.querySelectorAll('tbody tr')].find(r=>[...r.querySelectorAll('button')].some(b=>b.textContent.includes('Evaluar')));
  const nomEv=filaEv.querySelector('td').textContent;
  await click([...filaEv.querySelectorAll('button')].find(b=>b.textContent.includes('Evaluar')));
  for (const g of d.querySelectorAll('[role=radiogroup][aria-labelledby]')) await click(g.querySelectorAll('button')[0]);
  await click([...d.querySelectorAll('[role=radio]')].find(b=>/^No /.test(b.textContent.trim())));
  const just=d.querySelector('textarea'); setValor(just,'No cumple con los estándares de servicio y puntualidad requeridos.'); await espera();
  await click(boton('Enviar evaluación'));
  const rep=db().solicitudes.find(x=>x.datosPropuestos && x.datosPropuestos.decision==='NO_CONTINUA');
  ok(rep && texto().includes('Se envió una alerta a RRHH'), 'Reprobado: aviso inmediato de alerta a RRHH');
  await click(boton('Salir')); await click(boton('Gerente de RRHH',0));
  ok(texto().includes('Reprobados en evaluación de contrato') && texto().includes(nomEv.split(',')[0]), 'Tablero de RRHH muestra la alerta del reprobado');
  await click(boton('Activar carta')); await espera(100);
  ok(db().solicitudes.find(x=>x.id===rep.id).cartaCulminacion && !texto().includes('Reprobados en evaluación de contrato'), 'RRHH solo activa la carta');
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  ok(texto().includes('Cartas de culminación por emitir'), 'El Gerente de Tienda recibe la carta por emitir');
  await click(boton('Emitir carta'));
  await click(boton('Emitir carta'));
  ok(texto().includes('Indique una fecha de egreso'), 'Exige la fecha de egreso');
  setValor(d.getElementById('cc-egreso'), new Date(Date.now()+86400000).toISOString().slice(0,10)); await espera();
  await click(boton('Emitir carta')); await espera(150);
  await click(boton('Vista del documento')); const dlgC=[...d.querySelectorAll('[role=dialog]')].pop(); require('fs').writeFileSync('/tmp/claude-0/-home-claude/6df74d2a-0370-58ed-8e30-7baa3a029148/scratchpad/carta.html', dlgC.innerHTML); const docCul=dlgC.textContent; await click(boton('Cerrar'));
  ok(docCul.includes('REPRESENTACIONES ULAB 24, C.A.') && docCul.includes('J-50505660-3') && docCul.includes('artículo 64 de la Ley Orgánica del Trabajo') && docCul.includes('Recibido por el Trabajador') && docCul.includes('Presente.-') && /del 20\d\d/.test(docCul), 'Carta de culminación con el formato del modelo');
  ok(db().solicitudes.find(x=>x.id===rep.id).cartaCulminacion.fechaEgreso && [...d.querySelectorAll('button')].some(b=>b.textContent.includes('Registrar el egreso')), 'Fecha de egreso manual del Gerente y acceso a registrar el egreso');
  ok(![...d.querySelectorAll('button')].some(b=>b.textContent.trim()==='Emitir carta') && texto().includes('Ya no puede volver a solicitarse'), 'La carta de culminación emitida no puede volver a solicitarse');
  // ===== Sincronización de datos (formulario + BI) con datos ficticios =====
  await click(boton('Salir')); await click(boton('Gerente de RRHH',0));
  await click(boton('Sincronización de datos'));
  ok(texto().includes('Sin fichas') || db().fichas.every(f=>(f.fuente||'').includes('a mano')), 'Sincronización sin fichas del repositorio al inicio');
  await click(boton('Cargar formulario'));
  const encF=['Id','Hora de inicio','Hora de finalización','Correo electrónico','Nombre','Coloque sus nombres completos','Coloque sus Apellidos Completos','Género','Cédula de Identidad','Nacionalidad','Nacionalidad1','Zurdo','Numero de RIF','Fecha de Nacimiento','Tipo de Vivienda','Estado Civil','Nombre del Cónyugue','Número de Cédula del Cónyugue','Padres viven','Datos de Padre','Datos de Madre','Hijos','Cantidad de Hijos','Nombre de Hijo (1)','Fecha de Nacimiento de Hijo (1)','Cédula de Hijo (1)','Correo electrónico de contacto','Correo electrónico alternativo de su gerente de tienda/supervisor directo','¿En que estado reside?','Dirección: (Calle o Avenida)','Dirección: (Nombre Sector/Parroquia/Barrio/Ciudad)','Dirección: (Nombre/Número  de Edificio o Casa)','Dirección: (Municipio)','Numero de teléfonos de contacto','Código Postal','Personal con Discapacidad','¿Inscrito en el CONAPDIS?','Entorno de Trabajo','Unidad de Negocio','Unidad de Negocio1','Cargo','Cargo1','¿En que estado labora','Tienda en Distrito Capital','Tienda en Miranda','Educación: Ultimo Título Universitario Obtenido, Universidad','A quien llamar en caso de emergencia','A quien llamar en caso de emergencia (2)','Talla de Camisa','Talla de Pantalón','Talla de Calzado','Quiere actualizar sus datos Bancarios','Banco ','Numero de cuenta'];
  const filaF=(id,fin,nom,ape,ced,tienda,cargo,extra={})=>{ const r=Object.fromEntries(encF.map(h=>[h,''])); Object.assign(r,{'Id':id,'Hora de finalización':fin,'Coloque sus nombres completos':nom,'Coloque sus Apellidos Completos':ape,'Género':'Femenino','Cédula de Identidad':ced,'Nacionalidad':'Venezolana','Fecha de Nacimiento':'15/03/1999','Estado Civil':'Soltero (a)','Hijos':'Si','Nombre de Hijo (1)':'Hija Prueba','Fecha de Nacimiento de Hijo (1)':'01/02/2020','Correo electrónico de contacto':'prueba@ejemplo.com','¿En que estado reside?':'Distrito Capital','Dirección: (Calle o Avenida)':'Calle Ficticia','Numero de teléfonos de contacto':'0412-0000000','Entorno de Trabajo':'Tienda','Unidad de Negocio':'Balú Moda','Cargo':cargo,'Tienda en Distrito Capital':tienda,'A quien llamar en caso de emergencia':'Contacto ficticio 0414-0000000','Talla de Camisa':'M','Talla de Pantalón':'S','Talla de Calzado':'38','Banco ':'Banco X','Numero de cuenta':'01020000000000000000'},extra); return encF.map(h=>r[h]).join(';'); };
  const csvF=[encF.join(';'), filaF(1,'01/09/2026 10:00','ana maria','perez gil','V-40.111.222','C.C. Propatria','Asesor de Ventas (a)'), filaF(2,'02/09/2026 10:00','Luis','Rojas','40111333','Sabana Grande','Cajero (a)'), filaF(3,'03/09/2026 11:00','Ana Maria','Perez Gil','40111222','C.C. Propatria','Asesor de Ventas (a)',{'Talla de Camisa':'L'}), filaF(4,'03/09/2026 12:00','Rosa','Ficticia','40111444','','Diseñadora',{'Entorno de Trabajo':'Oficinas Administrativas'})].join('\n');
  let inpF=d.getElementById('sd-form'); Object.defineProperty(inpF,'files',{value:[new w.File([csvF],'formulario.csv',{type:'text/csv'})]}); inpF.dispatchEvent(new w.Event('change',{bubbles:true})); await espera(600);
  ok(texto().includes('Personas en el archivo3') && texto().includes('Fichas nuevas3'), 'Vista previa del formulario: duplicados unidos por cédula');
  await click(boton('Sincronizar fichas'));
  const fich=db().fichas;
  const ana=fich.find(f=>f.cedula==='40111222');
  ok(fich.filter(f=>!(f.fuente||'').includes('a mano')).length===3 && ana.tallas.camisa==='L' && ana.nombres==='Ana Maria' && ana.apellidos==='Perez Gil' && ana.tiendaId==='T01' && ana.cargoId==='ASE' && ana.hijos.length===1, 'Ficha toma la respuesta más reciente y mapea tienda y cargo');
  ok(!JSON.stringify(fich).includes('01020000000000000000') && !JSON.stringify(fich).includes('Banco X'), 'No se guardan datos bancarios');
  ok(texto().includes('Falta fecha de ingreso') && texto().includes('Oficinas administrativas'), 'Estado de las fichas');
  ok([...d.querySelectorAll('button')].some(b=>b.textContent.includes('Exportar datos precargados (Excel)')), 'RRHH tiene el botón de exportar datos precargados a Excel');
  await click(boton('Cargar fechas de ingreso (BI)'));
  const isoRel=(n)=>{ const t=new Date(); t.setDate(t.getDate()+n); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'); };
  const ingLuis=isoRel(-10), finLuis=isoRel(17); /* fecha relativa: el onboarding solo se crea si el ingreso tiene menos de 28 días */
  const csvBI='Cedula;Fecha de ingreso;Cargo\nV-40111222;10/08/2026;Asesor de Ventas\n40111333;'+ingLuis+';Cajero\n99999998;01/01/2025;Asesor';
  let inpB=d.getElementById('sd-bi'); Object.defineProperty(inpB,'files',{value:[new w.File([csvBI],'bi.csv',{type:'text/csv'})]}); inpB.dispatchEvent(new w.Event('change',{bubbles:true})); await espera(200);
  ok(texto().includes('listos para alta2') && texto().includes('Sin ficha del formulario1'), 'Vista previa de BI');
  await click(boton('Dar de alta 2'));
  const anaT=db().trabajadores.find(x=>x.cedula==='V-40111222');
  ok(anaT && anaT.fechaIngreso==='2026-08-10' && anaT.tiendaId==='T01' && anaT.cargoId==='ASE' && db().fichas.find(f=>f.cedula==='40111222').trabajadorId===anaT.id, 'Alta desde BI con fecha de ingreso y ficha vinculada');
  await click(boton('Directorio')); await click([...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Perez Gil')) || boton('Directorio'));
  if (texto().includes('Ficha del formulario')) { await click(boton('Ficha del formulario')); ok(texto().includes('Talla de camisa') && texto().includes('Hija Prueba'), 'Expediente muestra la ficha del formulario'); 
    ok(texto().includes('Datos laborales declarados en el formulario') && texto().includes('Contacto de emergencia 1') && [...d.querySelectorAll('button')].some(x=>x.textContent.includes('Ver y descargar ficha en PDF')), 'La ficha muestra datos laborales, emergencia y el botón de PDF');
    await click(boton('Ver y descargar ficha en PDF')); await espera(1500); await click(boton('Vista del documento')); await espera(200);
    ok(texto().includes('Ficha del trabajador') && texto().includes('Datos familiares') && texto().includes('Hija Prueba') && texto().includes('Contacto en caso de emergencia'), 'La ficha en PDF incluye datos familiares, hijos y emergencia'); } else ok(false, 'Expediente muestra la ficha del formulario');
  // ===== Onboarding =====
  const llenarLogico=async()=>{
  let vioImagen=false, escribioNumero=false, usoLetras=false;
  for (let i=0;i<50;i++) {
    if (d.querySelector('img[alt^="Figura de la pregunta"]')) vioImagen=true;
    const num=d.querySelector('input[id^=pt-num-]');
    if (num) { setValor(num,'12'); await espera(5); num.dispatchEvent(new w.Event('focusout',{bubbles:true})); escribioNumero=true; }
    else { const rs=[...d.querySelectorAll('input[type=radio]')]; if (rs.some(r=>r.value==='B')) usoLetras=true; if (i!==49) { const r=rs.find(x=>x.value==='2')||rs[0]; if (r) { r.click(); await espera(5); } } }
    if (i<49) { const sig=[...d.querySelectorAll('button')].find(b=>/^(Siguiente|Dejar sin responder y seguir)$/.test(b.textContent.trim())); await click(sig); }
  }
  ok(vioImagen && escribioNumero && usoLetras, 'Lógico: figuras, respuestas numéricas y letras en la pregunta 13');
    return {vioImagen,escribioNumero,usoLetras};
  };
  const onb=()=>db().onboarding||[];
  ok(onb().some(pl=>pl.trabajadorId==='W-40111333' && pl.tipo==='INGRESO' && pl.fechaFin===finLuis && pl.expectativas.map(x=>x.dia).join()==='28,120'), 'Onboarding de 28 días al dar de alta (expectativas 28 y 120)');
  ok(!onb().some(pl=>pl.trabajadorId===anaT.id), 'Sin onboarding para altas de personal con más de 28 días');
  const ingresoGT=db().trabajadores.find(x=>x.cedula && onb().some(pl=>pl.trabajadorId===x.id && pl.tipo==='INGRESO' && x.tiendaId==='T01'));
  ok(!!ingresoGT, 'Onboarding generado al registrar un ingreso');
  // Promoción aprobada genera Programa de Formación (90 días por defecto)
  const promo=db().solicitudes.find(x=>x.tipo==='PROMOCION' && x.estado!=='EJECUTADA' && x.estado!=='RECHAZADA');
  // Asesor a Cajero: el IPV es obligatorio; el trabajador lo responde en el portal antes de aprobar
  { const tp=db().trabajadores.find(x=>x.id===promo.trabajadorId); const clave=tp.apellidos.split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    ok((db().accesosPrueba||[]).some(a=>a.solicitudId===promo.id && [...a.bateria].sort().join()==='IPC,LOGICO,PIL'), 'Asesor a Cajero: la batería del cargo exige Lógico, Integridad e IPC (máximo 3 pruebas)');
    await click(boton('Salir')); await click(boton('Ir al portal'));
    set('pt-cedula',tp.cedula.replace(/\D/g,'')); set('pt-clave',clave); await enviar(d.querySelector('form'));
    const IPCm = await import('./ipc.js'); const PILm = await import('./integridad.js');
    let vioImagen,escribioNumero,usoLetras;
    for (let ronda=0; ronda<3; ronda++) {
      await click(boton('Comenzar',0));
      { const niv=d.getElementById('pt-nivel'); if (niv) set('pt-nivel','Bachiller'); const ac=d.getElementById('pt-acepto'); if (ac) await click(ac); }
      const tIntro=texto();
      await click(boton('Comenzar la prueba'));
      const t0=texto();
      if (t0.includes('de 46')) { for (let n=1;n<=46;n++) { const it=PILm.PIL_ITEMS[n-1]; d.getElementById('pt-q'+n+'-'+(it[2]==='+'?5:it[2]==='-'?1:2)).click(); await espera(5); if (n<46) await click(boton('Siguiente')); } }
      else if (t0.includes('de 54')) { for (let n=1;n<=54;n++) { const it=IPCm.IPC_ITEMS[n-1]; const v=it[1]==='DS'?3:it[1]==='ATN'?Number(it[2]):4; d.getElementById('pt-q'+it[0]+'-'+v).click(); await espera(5); if (n<54) await click(boton('Siguiente')); } }
      else { ok(tIntro.includes('Cada pregunta tiene una respuesta correcta') && !tIntro.includes('No hay respuestas buenas ni malas.'), 'Lógico: introducción propia (hay respuestas correctas)'); const lg=await llenarLogico(); vioImagen=lg.vioImagen; escribioNumero=lg.escribioNumero; usoLetras=lg.usoLetras; }
      await click(boton('Revisar y enviar')); await click(boton('Enviar la prueba')); await click(boton('Sí, enviar la prueba'));
      const pend=[...d.querySelectorAll('button')].find(b=>b.textContent.includes('Ver mis pruebas pendientes')); if (pend) await click(pend);
    }
    { const ac=db().accesosPrueba.find(a=>a.solicitudId===promo.id); const rl=ac.ev.LOGICO.respuestas;
      ok(ac.estado==='COMPLETADA' && ac.ev.LOGICO.completada && ac.ev.PIL.completada && ac.ev.IPC.completada && Object.keys(rl).length>=40 && rl['13'], 'Asesor a Cajero: Lógico, Integridad e IPC enviados, batería completa'); }
    await click(boton('Salir')); }
  for (const [rolBtn, accion] of [['Gerente de Marca','Aprobar'],['Gerente de Operaciones','Aprobar'],['Gerente de RRHH','Validar'],['Gerente General','Aprobar y firmar']]) {
    { const sb=[...d.querySelectorAll('button')].find(b=>b.textContent.trim()==='Salir'); if (sb) await click(sb); } await click(boton(rolBtn,0));
    await click(boton('Solicitudes')); await click(boton('Pendientes de mi aprobación'));
    const fila=[...d.querySelectorAll('tr')].find(r=>r.textContent.includes(promo.id)); if(!fila) continue;
    await click(fila);
    if (accion==='Validar') { ok(!!d.getElementById('sf-dias-'+promo.id) && texto().includes('Programa de Formación') && texto().includes('90 días (predeterminado)'), 'RRHH ve el campo «Días del Programa de Formación» (90 por defecto)');
      set('sf-dias-'+promo.id,'5'); await espera(); ok(texto().includes('Entre 7 y 365 días'), 'Los días del programa se validan (7 a 365)');
      set('sf-dias-'+promo.id,'45'); await espera(); await click(boton('Guardar días'));
      ok((db().solicitudes.find(x=>x.id===promo.id).datosPropuestos||{}).diasFormacion===45, 'RRHH fija 45 días para el Programa de Formación'); }
    await click(boton(accion,0));
    if (accion==='Validar') { set('dlg-comentario','Resultados de las pruebas coherentes con el desempeño.'); await espera(); }
    if (accion==='Aprobar y firmar') { d.getElementById('dlg-firma').click(); await espera(); }
    await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()===accion));
  }
  const plP=onb().find(pl=>pl.tipo==='PROMOCION' && pl.solicitudId===promo.id);
  ok(db().solicitudes.find(x=>x.id===promo.id).estado==='EJECUTADA' && plP && plP.cargoId==='CAJ' && plP.dias===45 && plP.expectativas.map(x=>x.dia).join()==='15,30,45' && plP.actividades.every(a=>/^Etapa [123] ·/.test(a.etapa)) && plP.fechaFin===new Date(new Date(plP.fechaInicio+'T12:00:00').getTime()+44*86400000).toISOString().slice(0,10), 'Promoción ejecutada abre el Programa de Formación de 45 días fijados por RRHH (tres etapas)');
  // Gerente de Tienda marca y firma
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  ok(texto().includes('Onboarding en curso'), 'Tablero del Gerente muestra onboarding en curso');
  await click(boton('Onboarding'));
  await click([...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Programa de Formación · 45 días')));
  const chkOn=[...d.querySelectorAll('[role=dialog] input[type=checkbox]')]; chkOn[0].click(); await espera();
  ok(onb().find(pl=>pl.id===plP.id).actividades[0].hecha, 'El supervisor marca actividades');
  { const a0=onb().find(pl=>pl.id===plP.id).actividades[0]; const del=d.getElementById('del-'+a0.id);
    ok(!!del && !d.getElementById('delnom-'+a0.id), 'Cada actividad ofrece la casilla «Delegado» (sin nombre mientras no se marque)');
    del.click(); await espera(150);
    const inp=d.getElementById('delnom-'+a0.id); ok(!!inp, 'Al marcar delegado aparece el campo del nombre de quien dio el entrenamiento');
    setValor(inp,'Marta Pérez (Asesora líder)'); inp.dispatchEvent(new w.FocusEvent('focusout',{bubbles:true})); await espera(150);
    const a1=onb().find(pl=>pl.id===plP.id).actividades[0]; ok(a1.delegado===true && a1.responsable==='Marta Pérez (Asesora líder)', 'Se guarda la delegación y el nombre del responsable del entrenamiento'); }
  { const dsx=d.getElementById('delsup-'+plP.id); ok(!!dsx && !d.getElementById('delsupnom-'+plP.id), 'El plan ofrece la casilla «Otra persona evalúa» y el nombre solo aparece al tildarla');
    dsx.click(); await espera(150); const ins=d.getElementById('delsupnom-'+plP.id); ok(!!ins, 'Al tildar aparece el campo para otra persona');
    setValor(ins,'Carla Mena (Supervisora de piso)'); ins.dispatchEvent(new w.FocusEvent('focusout',{bubbles:true})); await espera(150);
    ok((onb().find(pl=>pl.id===plP.id).delegadoFirma||{}).nombre==='Carla Mena (Supervisora de piso)', 'Se guarda la persona delegada como evaluadora del plan'); }
  await click(boton('Firmar como supervisor directo'));
  ok(onb().find(pl=>pl.id===plP.id).firma, 'Firma del supervisor directo');
  await click(boton('PDF del plan')); await espera(150); await click(boton('Vista del documento'));
  const docOn=[...d.querySelectorAll('[role=dialog]')].pop().textContent;
  ok(docOn.includes('SUPERVISOR DIRECTO') && docOn.includes('EL TRABAJADOR') && docOn.includes('A los 45 días') && docOn.includes('Programa de Formación de 45 días') && docOn.includes('Delegado: Marta Pérez (Asesora líder)') && docOn.includes('Carla Mena (Supervisora de piso)') && docOn.includes('Responsable del entrenamiento'), 'PDF del plan de onboarding con firmas y responsable delegado');
  // ===== Personal administrativo: prueba de 3 meses, prórroga manual de RRHH =====
  await click(boton('Salir')); await click(boton('Administrador'));
  await click(boton('Nuevo ingreso')); await buscarCed('31555777');
  set('in-nombres','Laura'); set('in-apellidos','Administrativa Prueba'); set('in-fnac','1994-06-06'); set('in-dir','Av. Libertador, edificio 5, Caracas'); set('in-civil','Casado/a'); set('in-nivel','Bachiller'); set('in-titulo','Bachiller en Ciencias'); fichaM(); set('in-tienda','OFB'); await espera(); set('in-cargo','ADM'); await espera();
  await click(boton('Guardar y generar documentos'));
  const adm=db().trabajadores.find(x=>x.cedula==='V-31555777');
  ok(adm && adm.contrato.pruebaHasta===new Date(new Date(adm.fechaIngreso+'T12:00:00').getTime()+89*86400000).toISOString().slice(0,10), 'Administrativo: período de prueba de 3 meses');
  ok((db().documentos.find(x=>x.trabajadorId===adm.id && x.clave==='contrato')||{}).html.includes('los tres (3) primeros meses de duración'), 'Contrato del administrativo con período de prueba de 3 meses');
  ok(adm && adm.docsAdm && adm.docsAdm.desde===new Date(new Date(adm.fechaIngreso+'T12:00:00').getTime()+86400000).toISOString().slice(0,10), 'Alta administrativa: la documentación de ingreso queda programada para el segundo día');
  ok(['contrato','responsabilidad','confidencialidad','cestaticket','rutahabitual'].every(c=>db().documentos.some(x=>x.trabajadorId===adm.id && x.clave===c)) && !db().documentos.some(x=>x.trabajadorId===adm.id && /^adm-/.test(x.clave)), 'El kit legal y la ruta habitual se conservan; la documentación administrativa se agrega aparte (sin guardar imágenes en el expediente)');
  await click(boton('Salir')); await click(boton('Gerente de RRHH',0));
  await click(boton('Directorio')); set('dir-busqueda','Administrativa'); await espera();
  const filaAdm=[...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Administrativa Prueba'));
  if (filaAdm) { await click(filaAdm); await click(boton('Contrato'));
    ok(texto().includes('Período de prueba administrativo (3 meses)') && texto().includes('Solo RRHH puede prorrogar'), 'Expediente muestra la prueba administrativa');
    await click(boton('Prorrogar período de prueba'));
    set('pa-fecha','2027-02-15'); set('pa-motivo','Extensión solicitada por RRHH para completar la evaluación del área.'); await espera();
    await click(boton('Guardar'));
    const adm2=db().trabajadores.find(x=>x.id===adm.id);
    ok(adm2.contrato.pruebaHasta==='2027-02-15' && adm2.contrato.prorrogasPrueba.length===1, 'RRHH prorroga manualmente el período de prueba');
  } else ok(false, 'Expediente muestra la prueba administrativa');
  ok(!adm || !d.querySelector('.org') , 'Sedes administrativas fuera del organigrama de tiendas');
  // ===== Gerencia General: documentos en resumen =====
  await click(boton('Salir')); await click(boton('Gerente General',0));
  await click(boton('Directorio')); set('dir-busqueda','Administrativa'); await espera();
  const filaG=[...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Administrativa Prueba'));
  if (filaG) { await click(filaG); await click(pestana('Documentos'));
    ok(texto().includes('Documentos (resumen)') && !texto().includes('Ver PDF'), 'Gerencia General ve el resumen de documentos de ingreso');
    await click(botonExacto('Ver detalle'));
    ok(texto().includes('Contrato de Trabajo a Tiempo Determinado'), 'Gerencia General abre el detalle de documentos a pedido');
  } else ok(false, 'Gerencia General ve el resumen de documentos de ingreso');
  // ===== Prórroga de contrato (día 91) al aprobarse la prosecución =====
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  await click(boton('Prueba y contratos'));
  const filaPro=[...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Prosecución') && [...r.querySelectorAll('button')].some(b=>b.textContent.includes('Evaluar')));
  if (filaPro) {
    await click([...filaPro.querySelectorAll('button')].find(b=>b.textContent.includes('Evaluar')));
    for (const g of d.querySelectorAll('[role=radiogroup][aria-labelledby]')) await click(g.querySelectorAll('button')[3]);
    await click([...d.querySelectorAll('[role=radio]')].find(b=>b.textContent.includes('Prorrogar el contrato')));
    const ta=d.querySelector('textarea'); if (ta) { setValor(ta,'Buen desempeño y adaptación al cargo durante el primer contrato.'); await espera(); }
    await click(boton('Enviar evaluación'));
    const solPro=db().solicitudes.filter(x=>x.tipo==='EVAL_PROSECUCION' && x.datosPropuestos.decision==='CONTINUA').sort((a,b)=>a.fechaCreacion<b.fechaCreacion?1:-1)[0];
    for (const [rolBtn] of [['Gerente de Marca'],['Gerente de Operaciones'],['Gerente de RRHH']]) {
      if (db().solicitudes.find(x=>x.id===solPro.id).estado==='EJECUTADA') break;
      await click(boton('Salir')); await click(boton(rolBtn,0));
      await click(boton('Solicitudes')); await click(boton('Pendientes de mi aprobación'));
      const f=[...d.querySelectorAll('tr')].find(r=>r.textContent.includes(solPro.id)); if(!f) continue;
      await click(f); await click(boton('Aprobar',0)); await click([...d.querySelectorAll('[role=dialog] button')].find(b=>/^Aprobar/.test(b.textContent.trim())));
    }
    const docP=db().documentos.find(x=>x.solicitudId===solPro.id && x.clave==='prorroga');
    if (process.env.DBG && docP) { require('fs').writeFileSync('/tmp/claude-0/-home-claude/6df74d2a-0370-58ed-8e30-7baa3a029148/scratchpad/prorroga.html', docP.html); console.log('ING', db().trabajadores.find(x=>x.id===docP.trabajadorId).fechaIngreso, (docP.html.match(/\[[A-Z_]+\]/g)||[])); }
    ok(db().solicitudes.find(x=>x.id===solPro.id).estado==='EJECUTADA' && docP && docP.html.includes('CLÁUSULA PRIMERA: OBJETO DE PRÓRROGA') && docP.html.includes('Artículo 62 de la LOTTT') && docP.html.includes('CLÁUSULA DÉCIMA PRIMERA') && /a partir del <b>\d{2} de [a-z]+ del \d{4}<\/b>/.test(docP.html) && (()=>{const t=db().trabajadores.find(x=>x.id===docP.trabajadorId); const f=new Date(t.fechaIngreso+'T00:00:00'); f.setDate(f.getDate()+90); return docP.html.includes(f.toISOString().slice(8,10)+'/'+f.toISOString().slice(5,7)+'/'+f.toISOString().slice(0,4));})() && !/\[[A-Z_]+\]/.test(docP.html), 'Prosecución aprobada genera el contrato de prórroga (día 91)');
    ok([...d.querySelectorAll('button')].some(b=>/pr[oó]rroga/i.test(b.textContent.trim()) && /contrato/i.test(b.textContent)), 'Botón del contrato de prórroga en la solicitud');
  } else ok(false, 'Prosecución aprobada genera el contrato de prórroga (día 91)');
  // ===== Vista resumida: 3 elementos y botón para ver el detalle =====
  await click(boton('Salir')); await click(boton('Gerente de RRHH',0)); await click(boton('Directorio'));
  const tablasCortadas=[...d.querySelectorAll('table.corte-tabla')];
  const btnVer=[...d.querySelectorAll('button')].find(b=>/^Ver detalle \(\d+\)$/.test(b.textContent.trim()));
  ok(tablasCortadas.length>0 && btnVer, 'Las tablas muestran 3 elementos y el botón Ver detalle');
  if (btnVer) { const n=d.querySelectorAll('table.corte-tabla').length; await click(btnVer); ok(d.querySelectorAll('table.corte-tabla').length===n-1 || [...d.querySelectorAll('button')].some(b=>b.textContent.trim()==='Ocultar detalle'), 'Ver detalle despliega la lista completa'); }
  // ===== Recordatorios del flujo =====
  await click(boton('Recordatorios'));
  ok(texto().includes('Mis recordatorios') && texto().includes('Envío por correo'), 'RRHH ve sus recordatorios y el envío por correo');
  await click(boton('Envío por correo'));
  ok(texto().includes('Destinatarios') && texto().includes('Sin correo'), 'Envío por correo lista destinatarios y avisa si falta el correo');
  await click(boton('Salir')); setValor(d.getElementById('login-tienda'),'gerente.propatria'); await espera(); await click(boton('Entrar'));
  await click(boton('Recordatorios'));
  ok(texto().includes('Mis recordatorios') && !texto().includes('Envío por correo'), 'El Gerente de Tienda ve solo sus recordatorios');
  // ===== Usuarios y accesos (Administrador) con correo =====
  await click(boton('Salir')); await click(boton('Administrador',0));
  await click(boton('Usuarios y accesos'));
  const filaU=[...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Gerencia de RRHH'));
  ok(filaU, 'El Administrador ve la pestaña Usuarios y accesos');
  if (filaU) {
    await click([...filaU.querySelectorAll('button')].find(b=>b.textContent.includes('Editar')));
    setValor(d.getElementById('us-correo'),'rrhh@futuraretail.com'); await espera();
    await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Guardar'));
    ok(db().usuarios.find(u=>u.id==='rrhh').correo==='rrhh@futuraretail.com', 'Se registra el correo del usuario');
  }
  // ===== Centro de documentos (todas las fases) =====
  await click(boton('Salir')); await click(boton('Gerente de RRHH',0));
  await click([...d.querySelectorAll('aside nav button')].find(b=>b.textContent.trim().startsWith('Documentos')));
  ok(texto().includes('Todos los documentos generados en cada fase') && ['Ingreso','Período de prueba y contrato','Traslados y promociones','Evaluaciones de desempeño','Apoyos y pernoctas','Incentivos de ventas'].every(f=>texto().includes(f)), 'Centro de documentos con las 6 fases');
  const filasDoc=[...d.querySelectorAll('main tbody tr')]; ok(filasDoc.length>=3, 'Centro de documentos lista documentos: '+filasDoc.length);
  { const btnF=[...d.querySelectorAll('main button[aria-pressed]')].find(b=>b.textContent.includes('Período de prueba y contrato')); await click(btnF);
    ok([...d.querySelectorAll('main tbody tr')].every(r=>r.textContent.includes('Período de prueba y contrato')), 'Filtro por fase');
    ok(texto().includes('Carta de culminación de contrato') || texto().includes('Certificado'), 'Fase contrato incluye cartas y certificados');
    const ver=[...d.querySelectorAll('main tbody button')].find(b=>b.textContent.trim()==='Ver'); await click(ver); await espera(150); await click(boton('Vista del documento'));
    ok([...d.querySelectorAll('[role=dialog]')].pop().textContent.length>200, 'Documento del centro se abre en el visor'); await click(boton('Cerrar')); }
  // Gerencia General ve la carta de culminación desde el centro de documentos
  await click(boton('Salir')); await click(boton('Gerente General',0));
  await click([...d.querySelectorAll('aside nav button')].find(b=>b.textContent.trim().startsWith('Documentos')));
  set('doc-busca','culminación'); await espera();
  ok(texto().includes('Carta de culminación de contrato'), 'Gerencia General puede ver la carta de culminación');
  // ===== Perfiles gerenciales: resumen primero =====
  await click(boton('Salir')); await click(boton('Gerente de Marca',0));
  ok(texto().includes('Tablero de Gerencia de Marca Balú') && texto().includes('Requiere su acción') && !d.querySelector('.org'), 'Gerente de Marca: tablero resumido con lo que requiere su acción');
  await click(boton('Solicitudes')); await click(boton('Pendientes de mi aprobación'));
  { const f=d.querySelector('main tbody tr'); if (f) { await click(f);
      ok(texto().includes('Resumen para decidir') && texto().includes('Ver detalle completo') && !texto().includes('Línea de tiempo'), 'Solicitud: resumen para decidir sin la ruta completa');
      await click(boton('Ver detalle completo')); ok(texto().includes('Línea de tiempo') && texto().includes('Volver al resumen'), 'Detalle completo a pedido');
    } else ok(false, 'Solicitud: resumen para decidir sin la ruta completa'); }
  // ===== Perfil Consulta RRHH Futura =====
  await click(boton('Salir'));
  ok(texto().includes('Consulta RRHH Futura'), 'Login muestra el perfil Consulta RRHH Futura');
  await click(boton('Consulta RRHH Futura',0));
  const menuC=[...d.querySelectorAll('aside nav button')].map(b=>b.textContent.trim());
  ok(menuC.some(x=>x.startsWith('Informes')) && menuC.some(x=>x.startsWith('Documentos')) && !menuC.some(x=>/^(Solicitudes|Recordatorios|Prueba y contratos|Evaluaciones|Apoyos|Pernoctas|Incentivos|Nuevo ingreso|Configuración|Onboarding)/.test(x)), 'Consulta: menú solo de informes y documentos ('+menuC.join(', ')+')');
  ok(texto().includes('Informes de RRHH · Balú') && !texto().includes('Requiere su acción') && !texto().includes('Pendientes de mi aprobación') && !texto().includes('En aprobación'), 'Consulta: resumen sin flujos ni aprobaciones');
  await click([...d.querySelectorAll('aside nav button')].find(b=>b.textContent.trim().startsWith('Informes')));
  for (const m of ['Plantilla y HC','Contratos y período de prueba','Evaluaciones Nine-Box','Traslados, promociones y egresos','Apoyos de personal','Pernoctas','Incentivos de ventas','Onboarding']) { await click(pestana(m)); }
  ok(texto().includes('Planes de onboarding'), 'Consulta: informes de los 8 módulos');
  await click(pestana('Evaluaciones Nine-Box'));
  { const bd=[...d.querySelectorAll('main tbody button')].find(b=>/documento/i.test(b.textContent)); ok(!!bd, 'Consulta: documentos desde el informe'); if (bd) { await click(bd); await espera(150); await click(boton('Cerrar')); } }
  await click(boton('Directorio')); const filaC=d.querySelector('main tbody tr'); await click(filaC);
  ok(!d.querySelectorAll('[role=tab]').length || ![...d.querySelectorAll('[role=tab]')].some(x=>x.textContent.startsWith('Solicitudes')), 'Consulta: expediente sin solicitudes');
  { const sol=db().solicitudes.find(x=>x.tipo==='TRASLADO'); if (sol) { const marcaSol=db().tiendas.find(ti=>ti.id===(db().trabajadores.find(w=>w.id===sol.trabajadorId)||{}).tiendaId); } }
  ok(db().trabajadores.length>0 && !texto().includes('Aprobar'), 'Consulta: sin botones de aprobación');
  await click([...d.querySelectorAll('aside nav button')].find(b=>b.textContent.trim().startsWith('Documentos')));
  { const btnAll=[...d.querySelectorAll('main button')].find(b=>/^Ver detalle \(\d+\)$/.test(b.textContent.trim())); if (btnAll) await click(btnAll);
    const vers=[...d.querySelectorAll('main tbody button')].filter(b=>b.textContent.trim()==='Ver'); let conFlujo=0; let abiertos=0;
    for (const v of vers.slice(0,25)) { await click(v); await espera(120); const vd=[...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.includes('Vista del documento')); if (vd) await click(vd); const tx=[...d.querySelectorAll('[role=dialog]')].pop().textContent; abiertos++; if (/Ruta de aprobación|Flujo de aprobación|Observación de RRHH/.test(tx)) conFlujo++; await click(boton('Cerrar')); }
    ok(abiertos>0 && conFlujo===0, 'Consulta: los documentos no muestran rutas ni observaciones internas ('+abiertos+' revisados)'); }
  // ===== Portal de evaluación y prueba IPV =====
  await click(boton('Salir'));
  { const sol=db().solicitudes.find(x=>x.id==='S-PRUEBA-IPV'); const ac=(db().accesosPrueba||[]).find(a=>a.solicitudId==='S-PRUEBA-IPV');
    ok(sol && ac && ac.cedula==='14952361' && ac.bateria.includes('IPV'), 'Registro de prueba: promoción de Josselyn Tovar con acceso al portal');
    ok(db().trabajadores.filter(x=>x.cedula==='V-14952361' && x.esPrueba).length>=28, 'Josselyn Tovar como Asesor de prueba en todas las tiendas'); }
  await click(boton('Gerente de Marca',0)); await click(boton('Solicitudes')); await click(boton('Pendientes de mi aprobación'));
  ok(![...d.querySelectorAll('main tbody tr')].some(r=>r.textContent.includes('S-PRUEBA-IPV')), 'Promoción con batería pendiente no aparece para aprobar');
  await click(boton('Salir'));
  await click(boton('Ir al portal'));
  ok(texto().includes('Ingrese a su prueba') && !!d.getElementById('pt-cedula'), 'Portal de evaluación: acceso con cédula y clave');
  set('pt-cedula','14952361'); set('pt-clave','Perez'); await enviar(d.querySelector('form'));
  ok(texto().includes('Cédula o clave incorrecta'), 'Portal rechaza una clave incorrecta');
  set('pt-clave','tovar'); await enviar(d.querySelector('form'));
  ok(texto().includes('Hola, Josselyn') && texto().includes('Inventario de Personalidad para Vendedores'), 'Portal: el trabajador ve su batería de pruebas');
  await click(boton('Comenzar',0));
  ok(texto().includes('¿Para qué es esta prueba?') && texto().includes('No hay respuestas buenas ni malas') && texto().includes('Tiene 40 minutos') && texto().includes('una oportunidad más'), 'IPV: introducción con el para qué, los 40 minutos y que no hay respuestas buenas ni malas');
  set('pt-nivel','Universitario'); await click(boton('Comenzar la prueba'));
  ok(/Tiempo restante\s*(39:5\d|40:00)/.test(texto()), 'IPV: cronómetro de 40 minutos en marcha');
  ok(texto().includes('Debe salir de viaje con una persona') && texto().includes('Su estilo de vida'), 'Portal: muestra el cuadernillo real cargado (pregunta 1)');
  for (let i=0;i<87;i++) { const r=d.querySelector('input[type=radio][value='+['a','b','c'][i%3]+']')||d.querySelector('input[type=radio]'); if (i===13||i===77) ok(d.querySelectorAll('input[type=radio]').length===2, 'Portal: la pregunta '+(i+1)+' muestra solo dos opciones'); r.click(); await espera(5); const sig=[...d.querySelectorAll('button')].find(b=>b.textContent.trim()==='Siguiente'); if (sig) await click(sig); }
  ok(texto().includes('87 respondidas'), 'Portal: 87 preguntas respondidas con guardado automático');
  await click(boton('Revisar y enviar')); await click(boton('Enviar la prueba')); await click(boton('Sí, enviar la prueba'));
  ok(texto().includes('Prueba enviada'), 'Portal: prueba enviada');
  const acF=db().accesosPrueba.find(a=>a.solicitudId==='S-PRUEBA-IPV');
  ok(acF.ev.IPV.completada && Object.keys(acF.ev.IPV.respuestas).length===87 && acF.nivelEducativo==='Universitario' && acF.ev.IPV.intentos.length===1 && acF.estado==='EN_CURSO', 'IPV: respuestas y nivel guardados; el acceso sigue abierto porque falta el Kostick');
  // ---- Kostick (promoción a Subgerente) ----
  const KM = await import('./kostick.js'); const LEO = JSON.parse(fs.readFileSync('fixtures/kostick-leonardo.json','utf8')); LEO['60']='a';
  const responder = async (desde, hasta, ultimaSig=false) => { for (let n=desde;n<=hasta;n++) { d.querySelector('input[type=radio][value='+LEO[String(n)]+']').click(); await espera(12); if (n<hasta || ultimaSig) await click(boton('Siguiente')); } };
  ok(texto().includes('Prueba enviada'), 'Portal: IPV enviado');
  await click(boton('Ver mis pruebas pendientes'));
  ok(texto().includes('Inventario Kostick') && texto().includes('90 preguntas') && texto().includes('40 minutos') && texto().includes('Enviada'), 'Portal: lista IPV enviado y Kostick pendiente con sus 40 minutos');
  await click([...d.querySelectorAll('button')].find(b=>b.textContent.trim()==='Comenzar'));
  ok(texto().includes('Inventario Kostick') && texto().includes('¿Para qué es esta prueba?') && texto().includes('No hay respuestas buenas ni malas') && texto().includes('Tiene 40 minutos') && texto().includes('dos frases'), 'Kostick: introducción con el para qué, los 40 minutos y que no hay respuestas buenas ni malas');
  ok(!d.getElementById('pt-nivel'), 'Kostick: no vuelve a pedir el nivel educativo');
  await click(boton('Comenzar la prueba'));
  ok(texto().includes('Soy trabajador tenaz') && texto().includes('No soy voluble') && d.querySelectorAll('input[type=radio]').length===2 && texto().includes('Pregunta 1 de 90'), 'Kostick: pregunta 1 con sus dos frases (a y b)');
  await responder(1,10);
  desfase += 41*60000; await espera(1300);
  ok(texto().includes('Se agotó el tiempo') && texto().includes('una vez más') && texto().includes('10 respuestas'), 'Kostick: al vencer los 40 minutos ofrece un intento más y conserva las respuestas');
  await click(boton('Comenzar el nuevo intento'));
  ok(texto().includes('Pregunta 11 de 90'), 'Kostick: el segundo intento continúa en la primera pregunta sin responder');
  await responder(11,90);
  await click(boton('Revisar y enviar')); ok(texto().includes('Respondió 90 de 90'), 'Kostick: revisión con las 90 respondidas');
  await click(boton('Enviar la prueba')); await click(boton('Sí, enviar la prueba'));
  { const a=db().accesosPrueba.find(x=>x.solicitudId==='S-PRUEBA-IPV'); const k=a.ev.KOSTICK;
    ok(texto().includes('Prueba enviada') && k.completada && k.intentos.length===2 && k.intentos[0].cierre==='TIEMPO' && k.intentos[1].cierre==='ENVIADA' && Object.keys(k.respuestas).length===90 && a.estado==='EN_CURSO', 'Kostick: enviado en el 2.º intento; falta el Lógico'); }
  await click(boton('Ver mis pruebas pendientes')); await click(boton('Comenzar',0)); await click(boton('Comenzar la prueba')); await llenarLogico(); await click(boton('Revisar y enviar')); await click(boton('Enviar la prueba')); await click(boton('Sí, enviar la prueba'));
  ok(db().accesosPrueba.find(x=>x.solicitudId==='S-PRUEBA-IPV').estado==='COMPLETADA', 'Promoción a Gerente: con el Lógico enviado el acceso queda COMPLETADA');
  await click(boton('Salir')); await click(boton('Salir'));
  ok(texto().includes('Usuarios corporativos'), 'Salir del portal vuelve al inicio');
  await click(boton('Gerente de RRHH',0)); await click(boton('Evaluaciones')); await click(pestana('Prueba IPV'));
  ok(texto().includes('Resultados IPV') && texto().includes('Josselyn Tovar') && texto().includes('Completada') && texto().includes('Cuadernillo de preguntas'), 'RRHH: resultados IPV tabulados y carga del cuadernillo');
  { const ver=[...d.querySelectorAll('main tbody button')].find(b=>b.textContent.trim()==='Ver'); await click(ver); await espera(150); await click(boton('Vista del documento'));
    let tx=''; for (let k=0;k<20;k++){ tx=([...d.querySelectorAll('[role=dialog]')].pop()||{}).textContent||''; if (tx.includes('Pasos a seguir') && tx.includes('Universitario')) break; await espera(100); }
    ok(['Disposición general para la venta','Receptividad','Agresividad','Comprensión','Adaptabilidad','Control de sí mismo','Tolerancia a la frustración','Combatividad','Dominancia','Seguridad','Actividad','Sociabilidad'].every(e=>tx.includes(e)) && tx.includes('Universitario') && tx.includes('Conclusión:') && tx.includes('Pasos a seguir'), 'Informe IPV con las 12 escalas, niveles, textos y conclusión con pasos a seguir');
    await click(boton('Cerrar')); }
  { const esc=KM.corregirKostick(LEO); const m=KM.matchKostick(esc, KM.KOSTICK_PERFILES_INICIALES.GT);
    ok(texto().includes('Resultados Kostick') && texto().includes('Match promedio') && texto().includes(m.pct+'%'), 'RRHH: resultados Kostick con el match de '+m.pct+'% frente a Gerente de Tienda');
    const bi=[...d.querySelectorAll('main tbody button')].find(b=>b.textContent.trim()==='Informe' && b.closest('table').textContent.includes('Match con el cargo')); await click(bi); await espera(150); await click(boton('Vista del documento'));
    let tx=[...d.querySelectorAll('[role=dialog]')].pop().textContent;
    ok(tx.includes('Match con el cargo propuesto') && tx.includes(m.pct+'%') && tx.includes('de coincidencia con el perfil de Gerente de Tienda') && KM.KOSTICK_ESCALAS.every(e=>tx.includes(e.nombre)) && tx.includes('Necesidad de controlar a otros') && tx.includes('Conclusión:') && tx.includes('Pasos a seguir'), 'Informe Kostick: match, 20 escalas, comparación con el perfil y conclusión con pasos a seguir');
    await click(boton('Cerrar'));
    const bc=[...d.querySelectorAll('main tbody button')].find(b=>b.textContent.trim()==='Constancia'); await click(bc); await espera(150); await click(boton('Vista del documento'));
    tx=[...d.querySelectorAll('[role=dialog]')].pop().textContent;
    ok(tx.includes('Constancia de match con el puesto') && tx.includes('Match con el puesto propuesto') && tx.includes('Inventario Kostick') && tx.includes('Evaluación Nine-Box') && tx.includes('Gerente de Tienda') && tx.includes('Josselyn Tovar'), 'Constancia de match: consolida los componentes ponderados y refleja la Nine-Box del caso de prueba');
    await click(boton('Cerrar')); }
  await click(boton('Solicitudes')); await click(pestana('Todas'));
  { const fila=[...d.querySelectorAll('main tbody tr')].find(r=>r.textContent.includes('S-PRUEBA-IPV')); if (fila) { const btnAll=[...d.querySelectorAll('main button')].find(b=>/^Ver detalle \(\d+\)$/.test(b.textContent.trim())); await click(fila); }
    ok(texto().includes('Batería de pruebas del portal') && /IPV[\s\S]*Completada/.test(texto()) && texto().includes('Informe IPV'), 'Solicitud: batería con IPV completado (Kostick y Lógico pendientes)'); }
  for (const [rolBtn, etiqueta] of [['Gerente General','Gerencia General'],['Visor General','Visor general']]) {
    await click(boton('Salir')); await click(boton(rolBtn));
    const hayEval=[...d.querySelectorAll('nav button, aside button')].some(x=>x.textContent.trim()==='Evaluaciones');
    if (hayEval) { await click(boton('Evaluaciones')); }
    ok(!hayEval || !([...d.querySelectorAll('[role=tab]')].some(x=>x.textContent.includes('Prueba IPV'))), etiqueta+': el IPV no es su vista principal (sin pestaña en Evaluaciones)');
  }
  await click(boton('Salir')); await click(boton('Gerente de Marca',0)); await click(boton('Evaluaciones'));
  ok([...d.querySelectorAll('[role=tab]')].some(x=>x.textContent.includes('Prueba IPV')), 'Gerente de Marca: ve la pestaña Prueba IPV');
  // RRHH solicita una promoción a Subgerente: se crea el acceso automáticamente
  await click(boton('Salir')); await click(boton('Gerente de RRHH',0));
  { const antes=(db().accesosPrueba||[]).length;
    const cand=db().trabajadores.find(x=>x.cargoId==='ASE' && x.estatus==='ACTIVO' && x.tiendaId==='T02' && !x.esPrueba && !db().solicitudes.some(s=>s.trabajadorId===x.id && ['PENDIENTE','EN_REVISION','APROBADA','DEVUELTA'].includes(s.estado)) && db().amonestaciones.filter(a=>a.trabajadorId===x.id).length===0);
    await click(boton('Solicitudes')); await click(boton('Nueva solicitud'));
    ok([...d.getElementById('so-tipo').options].map(o=>o.value).join()==='TRASLADO,PROMOCION,DESINCORPORACION,EVAL_PRUEBA,EVAL_PROSECUCION,EVAL_FIJO,NINEBOX,APOYO,PERNOCTA', 'Nueva solicitud ofrece todos los tipos');
    set('so-buscar', cand.cedula); await espera(); set('so-trab', cand.id); await espera(); set('so-cdest','SUB'); await espera();
    if (process.env.DBG) { const tx=texto(); const i0=tx.indexOf('Requisitos'); console.log('DBG-FORM', d.getElementById('so-trab').value, cand.id, d.getElementById('so-cdest').value, '|', tx.slice(i0, i0+700)); }
    ok(texto().includes('Se responderán en el portal de evaluación'), 'El formulario avisa que las pruebas se responden en el portal');
    set('so-motivo','Buen desempeño comercial y liderazgo en piso de ventas.'); await espera();
    await click(boton('Crear y enviar'));
    const ac=(db().accesosPrueba||[]).find(a=>a.trabajadorId===cand.id);
    ok((db().accesosPrueba||[]).length===antes+1 && ac && ac.cedula===cand.cedula.replace(/\D/g,''), 'Al solicitar la promoción se crea el acceso del trabajador');
    ok(texto().includes('Acceso del trabajador') && texto().includes('Copiar mensaje') && texto().includes(cand.apellidos.split(' ')[0].normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase()), 'La solicitud muestra el enlace, el usuario y la clave para enviar');
    ok(texto().includes('Inventario Kostick') && ac.bateria.includes('KOSTICK') && !ac.bateria.includes('IPV'), 'La promoción de un Asesor a Subgerente incluye solo el Kostick en la batería');
    // ---- Intentos agotados: bloqueo y autorización de RRHH ----
    const acC=(db().accesosPrueba||[]).find(a=>a.trabajadorId===cand.id);
    const apellido=cand.apellidos.split(' ')[0];
    const entrarPortal=async()=>{ await click(boton('Salir')); await click(boton('Ir al portal')); set('pt-cedula',acC.cedula); set('pt-clave',apellido); await enviar(d.querySelector('form')); };
    const intentoVencido=async(n)=>{ await click([...d.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Comenzar'||b.textContent.trim()==='Continuar')[0]); if (d.getElementById('pt-nivel')) set('pt-nivel','Bachiller'); await click(boton('Comenzar la prueba')); d.querySelector('input[type=radio]').click(); await espera(20); desfase+=41*60000; await espera(1300); };
    await entrarPortal();
    ok(texto().includes('Hola'), 'Portal: entra el candidato a Subgerente');
    await intentoVencido(1);
    ok(texto().includes('Se agotó el tiempo') && texto().includes('una vez más'), 'Intento 1 vencido: queda un intento más');
    await click(boton('Comenzar el nuevo intento')); desfase+=41*60000; await espera(1300);
    ok(texto().includes('Usó sus oportunidades') && texto().includes('Comuníquese con la Gerencia de RRHH') && !texto().includes('Comenzar el nuevo intento'), 'Intento 2 vencido: bloqueada, debe comunicarse con RRHH');
    await click(boton('Volver a mis pruebas'));
    ok(texto().includes('Comuníquese con RRHH') && !texto().includes('Autorizar'), 'Portal: la prueba queda bloqueada para el trabajador');
    { const a=db().accesosPrueba.find(x=>x.id===acC.id); const t=Object.keys(a.ev)[0]; ok(a.ev[t].intentos.length===2 && a.ev[t].extra===0 && a.ev[t].intentos[0].cierre==='TIEMPO', 'Bloqueo registrado: 2 intentos usados y ninguno autorizado todavía ('+t+')'); }
    // RRHH autoriza una sola vez
    await click(boton('Salir')); await click(boton('Salir')); await click(boton('Gerente de RRHH',0)); await click(boton('Solicitudes')); await click(pestana('Todas'));
    { const fila=[...d.querySelectorAll('main tbody tr')].find(r=>r.textContent.includes(apellido)); await click(fila); }
    ok(texto().includes('Bloqueada') && texto().includes('Autorizar último intento'), 'RRHH: ve la prueba bloqueada y el botón para autorizar');
    await click(boton('Autorizar último intento'));
    { const a=db().accesosPrueba.find(x=>x.id===acC.id); const t=Object.keys(a.ev)[0]; ok(a.ev[t].extra===1, 'RRHH autorizó el último intento'); }
    ok(!texto().includes('Autorizar último intento'), 'La autorización se puede dar una sola vez');
    await entrarPortal();
    await click([...d.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Comenzar'||b.textContent.trim()==='Continuar')[0]);
    ok(texto().includes('último intento, autorizado por RRHH') && texto().includes('definitivo'), 'Portal: el tercer intento se anuncia como último y definitivo');
    await click(boton('Comenzar la prueba')); desfase+=41*60000; await espera(1300);
    ok(texto().includes('Este era su último intento'), 'Tercer intento vencido: cierre definitivo');
    { const a=db().accesosPrueba.find(x=>x.id===acC.id); const t=Object.keys(a.ev)[0]; ok(a.ev[t].intentos.length===3, 'Tres intentos en total y ninguno adicional'); }
    await click(boton('Volver a mis pruebas'));
    ok(texto().includes('Cerrada') && !texto().includes('Comuníquese con RRHH'), 'Portal: la prueba figura como cerrada (definitiva)');
  }
  console.log('Errores de consola:', errores.length ? errores.slice(0,5) : 'ninguno');
})().catch(e=>{ console.error('FALLO', e.message); console.log(errores.slice(0,5)); process.exit(1); });
