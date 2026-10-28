import { IPC_ITEMS, corregirIPC, matchIPC, IPC_PERFIL_CARGO_INICIAL, validarRespuestasIPC } from './ipc.js';
let f=0; const ok=(c,m)=>{if(!c){f++;console.log('FALLA',m)}else console.log('ok',m)};
// perfil vendedor: construir respuestas para lograr puntajes por escala
const objetivo={SOC:100,AMA:100,EST:75,EMP:75,RES:50,APE:50};
const r={};
for(const x of IPC_ITEMS){ const [n,e,d]=x; if(e==='DS'){r[n]=3;continue} if(e==='ATN'){r[n]=Number(d);continue}
 const m=1+objetivo[e]/100*4; const fav=m; r[n]=d==='+'?fav:6-fav; }
// valores deben ser enteros: usar mezcla
const por={}; for(const e of Object.keys(objetivo)) por[e]=IPC_ITEMS.filter(x=>x[1]===e).map(x=>x[0]);
for(const e of Object.keys(objetivo)){ const ids=por[e]; const tot=Math.round(objetivo[e]/100*4*ids.length); // suma de (fav-1)
 let resto=tot; ids.forEach((n,i)=>{const it=IPC_ITEMS.find(x=>x[0]===n); const add=Math.min(4,Math.round(resto/(ids.length-i))); resto-=add; const fav=1+add; r[n]=it[2]==='+'?fav:6-fav;}); }
let a=corregirIPC(r); console.log(a.escalas.map(e=>e.id+e.puntaje).join(' '),a.potencial,a.nivelPotencial,a.validez);
const m=matchIPC(a,IPC_PERFIL_CARGO_INICIAL.ASE); ok(a.potencial===81&&a.nivelPotencial==='Alto','potencial 81'); ok(m.porcentaje===100,'match 100 '+m.porcentaje);
const t5=Object.fromEntries(IPC_ITEMS.map(x=>[x[0],5])); a=corregirIPC(t5); ok(a.escalas.every(e=>e.nivel==='Medio')&&a.validez==='Dudosa','todo 5 medio/dudosa');
const mal=Object.fromEntries(IPC_ITEMS.map(x=>[x[0],x[1]==='ATN'?3:3])); a=corregirIPC(mal); ok(a.validez==='No válida','atención');
ok(!validarRespuestasIPC({}).valida,'incompleta');
process.exit(f?1:0);
