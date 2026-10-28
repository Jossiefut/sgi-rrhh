const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('prueba-nube.html','utf8') + '</body></html>';
const errores = [];
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/',
  beforeParse(w){ w.scrollTo=()=>{}; w.URL.createObjectURL=()=> 'blob:x'; w.URL.revokeObjectURL=()=>{}; w.console.error=(...a)=>errores.push(a.map(String).join(' ')); } });
const w = dom.window, d = w.document;
const espera = (ms=40)=>new Promise(r=>setTimeout(r,ms));
const texto = ()=> d.getElementById('root').textContent;
function boton(t, idx=0){ const bs=[...d.querySelectorAll('button')].filter(b=>b.textContent.trim().includes(t)); if(!bs[idx]) throw new Error('No hay botón: '+t); return bs[idx]; }
const click = async (el)=>{ el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await espera(); for (let k = 0; k < 4; k++) { const ps = [...w.document.querySelectorAll('[data-plegado="1"]')]; if (!ps.length) break; ps.forEach((b) => b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))); await espera(); } };
function setValor(el, v){ const proto = el.tagName==='SELECT'? w.HTMLSelectElement.prototype : el.tagName==='TEXTAREA'? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto,'value').set.call(el,v); el.dispatchEvent(new w.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true})); el.dispatchEvent(new w.Event('change',{bubbles:true})); }
const set=(id,v)=>setValor(d.getElementById(id),v);
const enviar=async(form)=>{ form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})); await espera(150); };
const ok=(c,m)=>{ console.log((c?'✓ ':'✗ ')+m); if(!c) process.exitCode=1; };
const db=()=>w.__DB__;
(async()=>{
  await espera(300);
  ok(texto().includes('Inicie sesión') && !texto().includes('Usuarios corporativos'), 'Nube: pide correo y contraseña (sin acceso por botones)');
  ok(!texto().includes('Modo pruebas'), 'Nube: sin banner de modo pruebas');
  set('ln-correo','alguien@futurarg.com'); set('ln-clave','x'); await enviar(d.querySelector('form'));
  ok(texto().includes('Correo o contraseña incorrectos'), 'Nube: rechaza credenciales inválidas');
  await click(boton('Primer acceso del Administrador'));
  set('ln-nombre','Josselyn Tovar'); set('ln-correo','otra@futurarg.com'); set('ln-clave','Clave2026x'); set('ln-clave2','Clave2026x'); await enviar(d.querySelector('form'));
  ok(texto().includes('no está autorizado'), 'Nube: solo el correo autorizado activa el administrador inicial');
  set('ln-correo','josselyn.tovar@futurarg.com'); await enviar(d.querySelector('form')); await espera(400);
  ok(texto().includes('Tablero') && texto().includes('Josselyn Tovar'), 'Nube: administrador inicial entra al sistema');
  ok(db().registros.size>=37 && db().ajustes.size===9 && [...db().registros.values()].some(r=>r.coleccion==='tiendas'&&r.data.nombre==='Balú Sambil Valencia'), 'Nube: siembra tiendas reales, cargos y ajustes');
  ok(!texto().includes('Talento Balú'), 'Nube: nombre nuevo del sistema');
  { const q=db().ajustes.get('ipvPreguntas'); ok(Array.isArray(q) && q.length===87 && q[13].c==='' && q[0].texto.includes('Debe salir de viaje'), 'Nube: el cuadernillo IPV queda guardado de inicio (87 preguntas, 14 y 78 con dos opciones)'); }
  ok(texto().includes('0 de 161 puestos') && /\d+ sin HC aprobado/.test(texto()), 'Nube: HC aprobado solo de Planeta (161); Balú sin mínimo definido y fuera de la cobertura: '+(texto().match(/vacantes · [^C]{0,60}/)||[''])[0]);
  // Crear Gerente de Tienda
  await click(boton('Usuarios y accesos')); await click(boton('Nuevo usuario'));
  set('us-nombre','Gerente Propatria'); set('us-correo','gt.propatria@futurarg.com'); set('us-rol','tienda'); await espera(); set('us-tienda','T01'); await espera();
  const claveTemp=[...d.querySelectorAll('[role=dialog] dd')].map(x=>x.textContent).find(x=>/^[A-Za-z]{6}\d{2}$/.test(x));
  await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Guardar')); await espera(300);
  const p=db().perfiles.find(x=>x.correo==='gt.propatria@futurarg.com');
  ok(p && p.rol==='tienda' && p.tienda_id==='T01' && p.marca==='BALU' && texto().includes('Entregue estos datos'), 'Nube: el Administrador crea un Gerente de Tienda con clave temporal');
  await click(boton('Listo'));
  // Guardado de cambios: editar información de tienda
  const antes=db().guardados.length;
  await click(boton('Información de tiendas')); await click([...d.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Propatria'))); await click(boton('Editar'));
  set('it-direccion','Dirección de prueba'); await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Guardar')); await espera(200);
  const ult=db().guardados.slice(antes);
  ok(ult.some(g=>g.registros.includes('tiendas:T01:T01') && g.registros.some(r=>r.startsWith('bitacora:'))) && [...db().registros.values()].find(r=>r.coleccion==='tiendas'&&r.id==='T01').data.direccion==='Dirección de prueba', 'Nube: los cambios se guardan en la base (registro y bitácora)');
  ok(ult.every(g=>g.registros.length<=3), 'Nube: solo se envía lo que cambió');
  // Salir y entrar como Gerente de Tienda: cambio de clave obligatorio
  await click(boton('Salir')); await espera(200);
  ok(texto().includes('Inicie sesión'), 'Nube: cerrar sesión');
  set('ln-correo','gt.propatria@futurarg.com'); set('ln-clave',claveTemp); await enviar(d.querySelector('form')); await espera(300);
  ok(texto().includes('Cree su contraseña personal'), 'Nube: exige cambiar la contraseña temporal');
  set('cc-clave','corta'); set('cc-clave2','corta'); await enviar(d.querySelector('form'));
  ok(texto().includes('al menos 8'), 'Nube: valida la contraseña nueva');
  set('cc-clave','Propatria2026'); set('cc-clave2','Propatria2026'); await enviar(d.querySelector('form'));
  ok(texto().includes('Elija las tres preguntas'), 'Nube: el primer ingreso exige las preguntas de seguridad');
  set('ps-p1','q01'); set('ps-p2','q01'); set('ps-p3','q03'); set('ps-r1','Maracay'); set('ps-r2','Rex'); set('ps-r3','Pérez'); await enviar(d.querySelector('form'));
  ok(texto().includes('tres preguntas distintas'), 'Nube: las tres preguntas deben ser distintas');
  set('ps-p2','q02'); await enviar(d.querySelector('form')); await espera(400);
  ok(texto().includes('Tablero') && texto().includes('Gerente Propatria') && !texto().includes('Usuarios y accesos') && !texto().includes('Sincronización de datos'), 'Nube: el Gerente de Tienda entra con su menú');
  ok(texto().includes('gt.propatria@futurarg.com'), 'Nube: muestra el correo del usuario');
  // Restablecer la contraseña con preguntas de seguridad
  await click(boton('Salir')); await espera(200);
  await click(d.getElementById('ln-olvido')); await espera(100);
  ok(texto().includes('Restablecer contraseña') && !!d.getElementById('ol-correo'), 'Olvido: pide primero el correo');
  set('ol-correo','gt.propatria@futurarg.com'); await enviar(d.querySelector('form')); await espera(150);
  ok(texto().includes('¿En qué ciudad nació su madre?') && texto().includes('¿Cómo se llamaba su primera mascota?') && texto().includes('segundo apellido de su abuela'), 'Olvido: muestra las tres preguntas configuradas');
  const intentar = async (r1, clave) => { set('ol-r1', r1); set('ol-r2','rex'); set('ol-r3','perez'); set('ol-clave', clave || 'Nueva2026x'); set('ol-clave2', clave || 'Nueva2026x'); await enviar(d.querySelector('form')); await espera(150); };
  await intentar('mal'); ok(texto().includes('Las respuestas no coinciden'), 'Olvido: respuestas incorrectas se rechazan');
  await intentar('Maracay', 'corta'); ok(texto().includes('al menos 8'), 'Olvido: valida la contraseña nueva');
  await intentar('  MARACAY ', 'Nueva2026x'); await espera(200);
  ok(texto().includes('Contraseña restablecida') && texto().includes('Inicie sesión'), 'Olvido: con las respuestas correctas (sin importar mayúsculas ni tildes) restablece y vuelve al acceso');
  set('ln-correo','gt.propatria@futurarg.com'); set('ln-clave','Nueva2026x'); await enviar(d.querySelector('form')); await espera(400);
  ok(texto().includes('Gerente Propatria'), 'Olvido: entra con la contraseña nueva');
  await click(boton('Salir')); await espera(200);
  // Bloqueo tras 5 intentos fallidos
  await click(d.getElementById('ln-olvido')); set('ol-correo','gt.propatria@futurarg.com'); await enviar(d.querySelector('form')); await espera(150);
  for (let k = 0; k < 5; k++) await intentar('incorrecta');
  ok(texto().includes('Demasiados intentos'), 'Olvido: tras 5 intentos fallidos se bloquea');
  await intentar('Maracay'); ok(texto().includes('Demasiados intentos'), 'Olvido: bloqueado aun con las respuestas correctas');
  ok(db().registroRest.some((r) => r.resultado === 'BLOQUEO_30_MIN') && db().registroRest.some((r) => r.resultado === 'OK'), 'Olvido: cada intento queda registrado');
  await click(boton('Volver a iniciar sesión')); await espera(100);
  set('ln-correo','gt.propatria@futurarg.com'); set('ln-clave','Nueva2026x'); await enviar(d.querySelector('form')); await espera(400);
  ok(!!boton('Preguntas de seguridad'), 'Cuenta: botón para cambiar las preguntas de seguridad');
  await click(boton('Salir')); await espera(200);
  set('ln-correo','josselyn.tovar@futurarg.com'); set('ln-clave','Clave2026x'); await enviar(d.querySelector('form')); await espera(400);
  await click(boton('Usuarios y accesos')); await click(d.getElementById('us-reg-rest')); await espera(200);
  ok(texto().includes('Bloqueada 30 min') && texto().includes('Restablecida'), 'Administrador: ve los restablecimientos de clave');
  await click(boton('Salir')); await espera(200);
  set('ln-correo','gt.propatria@futurarg.com'); set('ln-clave','Nueva2026x'); await enviar(d.querySelector('form')); await espera(400);
  // Perfil Consulta RRHH Futura: lo crea el Administrador y solo ve informes y documentos
  await click(boton('Salir')); await espera(200);
  db().perfiles.find(x=>x.rol==='admin');
  { const adm=db().perfiles.find(x=>x.rol==='admin'); const ua=db().usuarios.find(x=>x.id===adm.id);
    set('ln-correo',ua.correo); set('ln-clave',ua.clave); await enviar(d.querySelector('form')); await espera(400);
    await click(boton('Usuarios y accesos')); await click(boton('Nuevo usuario'));
    set('us-nombre','Analista RRHH Futura'); set('us-correo','rrhh.futura@futurarg.com'); set('us-rol','consulta'); await espera();
    ok(!!d.getElementById('us-marca'), 'Nube: el perfil de consulta pide la marca');
    set('us-marca','BALU'); await espera();
    const claveC=[...d.querySelectorAll('[role=dialog] dd')].map(x=>x.textContent).find(x=>/^[A-Za-z]{6}\d{2}$/.test(x));
    await click([...d.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim()==='Guardar')); await espera(300);
    const pc=db().perfiles.find(x=>x.correo==='rrhh.futura@futurarg.com');
    ok(pc && pc.rol==='consulta' && pc.marca==='BALU', 'Nube: el Administrador crea un usuario Consulta RRHH Futura');
    await click(boton('Listo')); await click(boton('Salir')); await espera(200);
    set('ln-correo','rrhh.futura@futurarg.com'); set('ln-clave',claveC); await enviar(d.querySelector('form')); await espera(300);
    set('cc-clave','Futura2026x'); set('cc-clave2','Futura2026x'); set('ps-p1','q01'); set('ps-r1','Maracay'); set('ps-p2','q02'); set('ps-r2','Rex'); set('ps-p3','q03'); set('ps-r3','Pérez'); await enviar(d.querySelector('form')); await espera(400);
    const menuC=[...d.querySelectorAll('aside nav button')].map(b=>b.textContent.trim());
    ok(texto().includes('Informes de RRHH') && menuC.some(x=>x.startsWith('Informes')) && !menuC.some(x=>/^(Solicitudes|Recordatorios|Usuarios)/.test(x)), 'Nube: Consulta RRHH Futura entra solo a informes y documentos');
    await click(boton('Salir')); await espera(200); }
  // Portal de evaluación en la nube: valida en el servidor y exige el cuadernillo cargado
  db().ajustes.set('ipvPreguntas', []);
  db().accesos.push({ id:'AC-N1', cedula:'14952361', clave:'TOVAR', trabajador_id:'W-X', solicitud_id:'S-X', tienda_id:'T01', nombre:'Josselyn Tovar', cargo_destino:'SUB', bateria:['IPV','KOSTICK'], estado:'PENDIENTE', respuestas:{}, ev:{}, nivel_educativo:'', expira:'2099-01-01' });
  await click(boton('Ir al portal'));
  set('pt-cedula','14.952.361'); set('pt-clave','tovar'); await enviar(d.querySelector('form')); await espera(200);
  ok(texto().includes('Hola, Josselyn') && texto().includes('RRHH debe cargar el cuadernillo'), 'Nube: el portal no muestra la prueba si el cuadernillo está vacío');
  await click(boton('Salir')); await espera(100);
  db().ajustes.set('ipvPreguntas', Array.from({length:87},(_,i)=>({ n:i+1, texto:'P'+(i+1), a:'x', b:'y', c:'z' })));
  set('pt-cedula','14952361'); set('pt-clave','Tovar'); await enviar(d.querySelector('form')); await espera(200);
  db().ajustes.set('config', { ...(db().ajustes.get('config')||{}), minutosPrueba: { IPV: 30, KOSTICK: 40 } });
  await click(boton('Salir')); await espera(100); set('pt-cedula','14952361'); set('pt-clave','Tovar'); await enviar(d.querySelector('form')); await espera(200);
  ok(texto().includes('30 minutos') && texto().includes('Inventario Kostick'), 'Nube: los minutos de cada prueba salen del servidor');
  await click(boton('Comenzar',0));
  ok(texto().includes('Tiene 30 minutos') && texto().includes('No hay respuestas buenas ni malas'), 'Nube: la introducción usa los minutos del servidor');
  set('pt-nivel','Bachiller'); await click(boton('Comenzar la prueba')); await espera(150);
  d.querySelector('input[type=radio][value=b]').click(); await espera(200);
  { const a=db().accesos.find(x=>x.id==='AC-N1'); ok(a.ev.IPV.respuestas['1']==='b' && a.estado==='EN_CURSO' && a.ev.IPV.intentos.length===1, 'Nube: cada respuesta se guarda en el servidor, con su intento'); }
  w.__DESFASE__ = 31*60000; await espera(100);
  d.querySelectorAll('input[type=radio]')[1] && d.querySelector('input[type=radio][value=a]') && d.querySelector('input[type=radio][value=a]').click(); await espera(300);
  ok(texto().includes('Se agotó el tiempo'), 'Nube: el servidor rechaza respuestas fuera de tiempo y el portal lo avisa');
  { const a=db().accesos.find(x=>x.id==='AC-N1'); ok(a.ev.IPV.respuestas['1']==='b' && !a.ev.IPV.respuestas['2'] && a.ev.IPV.intentos[0].cierre==='TIEMPO', 'Nube: la respuesta tardía no se guardó y el intento quedó cerrado por tiempo'); }
  w.__DESFASE__ = 0;
  await click(boton('Volver a mis pruebas')); await click(boton('Salir')); await espera(100); await click(boton('Salir')); await espera(200);
  ok(texto().includes('Inicie sesión'), 'Nube: salir del portal vuelve al inicio de sesión');
  // Usuario pendiente
  db().perfiles.push({ id:'u-x', correo:'nuevo@futurarg.com', nombre:'', rol:'pendiente', marca:null, tienda_id:null, activo:true, debe_cambiar_clave:true }); db().usuarios.push({ id:'u-x', correo:'nuevo@futurarg.com', clave:'Pendiente1' });
  set('ln-correo','nuevo@futurarg.com'); set('ln-clave','Pendiente1'); await enviar(d.querySelector('form')); await espera(300);
  ok(texto().includes('Cuenta pendiente de activación'), 'Nube: cuenta sin rol no accede a datos');
  // Cambio de tienda: los registros del trabajador pasan a la tienda destino
  { const { diferenciasNube } = w.__pruebas;
    { const f = { id: '111', cedula: '111', tiendaId: 'T01', trabajadorId: '', nombres: 'X', discapacidad: { tiene: 'Sí', conapdis: 'No' } };
      const c = diferenciasNube({ fichas: [] }, { fichas: [f] });
      ok(c.fichas.length === 1 && !('discapacidad' in c.fichas[0].data) && c.sensibles.length === 1 && c.sensibles[0].data.tiene === 'Sí', 'Nube: la discapacidad viaja a la tabla sensible y no a la ficha pública'); }
    const tA={id:'W1',tiendaId:'T01'}; const tB={...tA,tiendaId:'T03'};
    const docu={id:'D1',trabajadorId:'W1'}; const ev={id:'E1',trabajadorId:'W1',tiendaId:'T01'}; const sol={id:'S1',trabajadorId:'W1',tipo:'TRASLADO'}; const otro={id:'D2',trabajadorId:'W9'};
    const base={tiendas:[],cargos:[],trabajadores:[tA,{id:'W9',tiendaId:'T01'}],documentos:[docu,otro],evaluaciones:[ev],solicitudes:[sol],resultadosPruebas:[],amonestaciones:[],precargados:[],bitacora:[],modelosCompensacion:[],concursos:[],onboarding:[],fichas:[]};
    const nuevo={...base,trabajadores:[tB,base.trabajadores[1]]};
    const c=diferenciasNube(base,nuevo); const m=Object.fromEntries(c.registros.map(r=>[`${r.coleccion}:${r.id}`,r.tienda_id]));
    ok(m['trabajadores:W1']==='T03' && m['documentos:D1']==='T03' && m['evaluaciones:E1']==='T03' && m['solicitudes:S1']==='T03' && !('documentos:D2' in m), 'Nube: al trasladar, documentos, evaluaciones y solicitudes pasan a la tienda destino'); }
  console.log('Errores de consola:', errores.length ? errores.slice(0,4) : 'ninguno');
})().catch(e=>{ console.error('FALLO', e.message); console.log(errores.slice(0,5)); process.exit(1); });
