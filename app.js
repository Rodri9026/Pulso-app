/* PULSO — sin dependencias, los registros permanecen en este navegador/dispositivo. */
(() => {
'use strict';
const KEY = 'pulso_entrenamientos_v1';
const SYNC_KEY = 'pulso_health_sync_private_v1'; // SOLO local, nunca en el respaldo
const LIBRARY = ['Press banca','Sentadilla','Peso muerto','Press militar','Dominadas','Remo con barra','Remo con mancuerna','Jalón al pecho','Press inclinado','Prensa de piernas','Extensión de cuádriceps','Curl femoral','Elevación de gemelos','Curl de bíceps','Extensión de tríceps','Elevaciones laterales','Hip thrust','Zancadas','Plancha','Crunch abdominal','Fondos en paralelas','Face pull'];
const icons = {
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 dumbbell:'<path d="m6.5 6.5 11 11M4 9l5-5M2 7l5-5M15 20l5-5M17 22l5-5M6.5 17.5l11-11"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
 chart:'<path d="M3 3v18h18M7 16l4-5 4 3 5-7"/>',
 settings:'<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M20 12a8.3 8.3 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a8.1 8.1 0 0 0-2-1.2L15.2 3h-4l-.4 2.6a8.1 8.1 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.5a8.3 8.3 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1a8.1 8.1 0 0 0 2 1.2l.4 2.6h4l.4-2.6a8.1 8.1 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2Z"/>',
 play:'<path d="m8 5 11 7-11 7z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 arrow:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 trash:'<path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M12 13V9m-3-7h6m-3 0v3m5.6 1.8 1.6-1.6"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
 close:'<path d="M18 6 6 18M6 6l12 12"/>',
 down:'<path d="m6 9 6 6 6-6"/>',
 runner:'<circle cx="14" cy="4" r="2"/><path d="m9 12 3-3 3 2 2 4 4 2M8 21l3-6-3-3-5 2m9-5-2 4 2 2-1 6"/>',
 scale:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 9h8m-4 0 2 3"/>',
 trophy:'<path d="M8 21h8m-4-4v4M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 upload:'<path d="M12 21V9m-5 5 5-5 5 5M4 7V3h16v4"/>',
 edit:'<path d="m15 5 4 4M4 20l4.5-1 11-11a2 2 0 0 0-4-4l-11 11L4 20Z"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10v.5"/>'
};
const ico = (name,size=19) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]||icons.bolt}</svg>`;
const el = id => document.getElementById(id);
const esc = v => String(v??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => (globalThis.crypto?.randomUUID?.() || ('id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)));
const day = (d=new Date()) => [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const fromDay = d => new Date(`${d}T12:00:00`);
const fmtDate = d => d ? new Intl.DateTimeFormat('es-CL',{day:'numeric',month:'short',year:'numeric'}).format(fromDay(d)) : '—';
const fmtDay = d => new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long'}).format(d);
const n = v => { const x=Number(String(v??'').trim().replace(',','.'));return Number.isFinite(x) ? x:0; };
const num = (v,digits=0)=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:digits}).format(v||0);
const minmax = (v,min,max)=>Math.min(max,Math.max(min,v));
const r = (name, sets=3, reps='8–12', rest=90) => ({id:uid(),name,sets,reps,rest});
const defaults = () => ({version:1,routines:[
 {id:uid(),name:'Fuerza · Full body',exercises:[r('Sentadilla',3,'8–10'),r('Press banca',3,'8–12'),r('Remo con barra',3,'10–12'),r('Plancha',3,'30 s')]},
 {id:uid(),name:'Fuerza · Tren superior',exercises:[r('Press inclinado',3,'8–12'),r('Jalón al pecho',3,'10–12'),r('Press militar',3,'8–12'),r('Curl de bíceps',3,'12–15')]}
 ],workouts:[],measurements:[],draft:null,timerUntil:0,restSeconds:90});
let storageOk = true, db, view='inicio', modal=null, progressMetric='fuerza', lastTimerDone=0, toastHandle;
let healthImportBusy = false, healthImportStatus = '';
let syncBusy = false, syncStatus = 'Pendiente de configurar';
let syncConfig = {endpoint:'',readToken:'',lastSync:''};
try {const x=JSON.parse(localStorage.getItem(SYNC_KEY)||'{}');syncConfig={...syncConfig,...x};}catch(_){}
let measureRange = '365', measureHistoryCount = 15; 
try { db = JSON.parse(localStorage.getItem(KEY)||'null'); if (!db || !Array.isArray(db.workouts)|| !Array.isArray(db.routines)||!Array.isArray(db.measurements)) db=defaults(); }
catch(e) { db=defaults();storageOk=false; }
function persist(){ try {localStorage.setItem(KEY,JSON.stringify(db)); storageOk=true;return true;}catch(e){storageOk=false;showToast('No se pudo guardar. Exporta tu respaldo.');return false;} }
function showToast(t){const box=el('toast');if(!box)return;clearTimeout(toastHandle);box.textContent=t;box.classList.add('show');toastHandle=setTimeout(()=>box.classList.remove('show'),2800);}
function setupSW(){if('serviceWorker' in navigator && location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));}}
function setView(next){view=next;modal=null;render();window.scrollTo(0,0);}
function nav(){const tabs=[['inicio','home','Inicio'],['entrenar','dumbbell','Entrenar'],['rutinas','calendar','Rutinas'],['progreso','chart','Progreso'],['ajustes','settings','Ajustes']];return `<nav class="tabbar" aria-label="Navegación principal">${tabs.map(([id,icon,label])=>`<button class="tab ${view===id?'active':''}" data-action="navigate" data-view="${id}" aria-label="${label}" ${view===id?'aria-current="page"':''}>${ico(icon,23)}<span>${label}</span></button>`).join('')}</nav>`;}
function header(){return `<header class="mast"><div class="brand"><span class="brandmark">↗</span>PULSO<span style="color:var(--lime)">.</span></div><div class="top-right"><span class="online-pill"><span class="online-dot"></span>Sin suscripción</span><span class="avatar">P</span></div></header>`;}
function title(k,t,s='',action=''){return `<div class="head"><div><div class="eyebrow">${esc(k)}</div><h1 class="h1">${esc(t)}</h1>${s?`<p class="lead">${esc(s)}</p>`:''}</div>${action}</div>`;}
function section(s,action=''){return `<div class="section-row"><h2>${esc(s)}</h2>${action}</div>`;}
const abtn=(action,label,style='btn-ghost',extras='')=>`<button class="btn ${style}" data-action="${action}" ${extras}>${label}</button>`;
function weekStart(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);x.setDate(x.getDate()-((x.getDay()+6)%7));return x;}
function shiftDay(d,i){let x=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);x.setDate(x.getDate()+i);return x;}
function getWeekWorkouts(){const start=day(weekStart(new Date()));return db.workouts.filter(w=>w.date>=start && w.date<=day());}
function completedSets(w){return (w.exercises||[]).flatMap(e=>(e.sets||[]).filter(s=>s.done));}
function volume(w){return (w.exercises||[]).reduce((sum,e)=>sum+(e.sets||[]).reduce((x,s)=>x+(s.done?n(s.weight)*n(s.reps):0),0),0);}
function minutes(w){return (w.cardio||[]).reduce((a,c)=>a+n(c.minutes),0);}
function workTitle(w){if(w.name && w.name!=='Entrenamiento libre')return w.name;const sets=completedSets(w).length;const ca=(w.cardio||[]).length;return sets && ca?'Fuerza + cardio':sets?'Entrenamiento de fuerza':ca?'Sesión de cardio':'Entrenamiento libre';}
function getRecent(){return [...db.workouts].sort((a,b)=>b.startedAt.localeCompare(a.startedAt));}
function weeklySeries(){let base=weekStart(new Date());return Array.from({length:8},(_,i)=>{let sd=day(shiftDay(base,(i-7)*7));let end=day(shiftDay(fromDay(sd),6));return {date:sd,label:`${fromDay(sd).getDate()}/${fromDay(sd).getMonth()+1}`,vol:db.workouts.filter(w=>w.date>=sd && w.date<=end).reduce((sum,w)=>sum+volume(w),0),cardio:db.workouts.filter(w=>w.date>=sd && w.date<=end).reduce((sum,w)=>sum+minutes(w),0)};});}
function barChart(data,field){let max=Math.max(...data.map(x=>x[field]),1);return `<div class="bars-wrap"><div class="bars">${data.map((v,i)=>`<div class="bar-cell" title="${esc(v.label)}: ${num(v[field],1)}"><div class="bar ${i===data.length-1?'highlight':''}" style="height:${Math.max(3,v[field]/max*126)}px"></div><span class="bar-label">${esc(v.label)}</span></div>`).join('')}</div></div>`;}
function spark(){return `<svg class="spark" viewBox="0 0 40 23"><polyline points="1,18 10,12 18,14 28,4 38,6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}
function renderHome(){const ws=getWeekWorkouts(),sets=ws.reduce((a,w)=>a+completedSets(w).length,0),v=ws.reduce((a,w)=>a+volume(w),0),ca=ws.reduce((a,w)=>a+minutes(w),0),recent=getRecent().slice(0,4),series=weeklySeries(),total=series.reduce((a,w)=>a+w.vol,0);
return `${title('TU ESPACIO DE ENTRENAMIENTO','Haz que cada serie cuente.',fmtDay(new Date()))}
 <div class="hero card"><div class="hero-content"><div class="eyebrow">CONSTANCIA &gt; PERFECCIÓN</div><h2>${db.draft?'Tu sesión te está esperando.':'Hoy es un buen día para progresar.'}</h2><p>Registra tu esfuerzo, observa tus avances y supera tu versión anterior.</p>${abtn(db.draft?'resume':'go-train',`${ico(db.draft?'arrow':'play')} ${db.draft?'Continuar sesión':'Empezar entrenamiento'}`,'btn-primary')}</div><div class="hero-icon">↗</div></div>
 <div class="stats"><div class="stat"><div class="stat-top">Sesiones ${spark()}</div><div class="stat-val">${ws.length}<small> / sem</small></div><div class="stat-foot">Esta semana</div></div><div class="stat"><div class="stat-top">Volumen ${spark()}</div><div class="stat-val">${num(v/1000,1)}<small> t</small></div><div class="stat-foot">Pesas movilizadas</div></div><div class="stat"><div class="stat-top">Cardio ${spark()}</div><div class="stat-val">${num(ca)}<small> min</small></div><div class="stat-foot">Esta semana · ${sets} series</div></div></div>
 <div class="split mt16"><div class="card chart-card"><div class="chart-head"><div><p class="kicker">Volumen de fuerza · últimas 8 semanas</p><div class="big-n">${num(series.at(-1).vol)} <span class="small muted">kg</span></div></div><span class="pill">${ico('chart',14)} Progreso</span></div>${barChart(series,'vol')}</div><div class="card">${section('Actividad reciente',abtn('go-progress','Ver todo','btn-xs btn-ghost'))}${recent.length?recent.map(w=>workRow(w)).join(''):'<div class="empty">Todavía no hay entrenamientos guardados.<strong>Empieza tu primera sesión</strong>Tu actividad aparecerá aquí.</div>'}</div></div>
 ${section('Accesos rápidos')}<div class="grid2"><button class="settings-action" data-action="open-measurement"><span class="activity-icon orange">${ico('scale')}</span><span class="grow"><strong>Registrar medidas</strong><small>Peso, grasa corporal y cintura</small></span>${ico('arrow')}</button><button class="settings-action" data-action="navigate" data-view="rutinas"><span class="activity-icon">${ico('calendar')}</span><span class="grow"><strong>Mis rutinas</strong><small>Organiza tus ejercicios</small></span>${ico('arrow')}</button></div>`;}
function workRow(w){const strength=completedSets(w).length,ca=minutes(w);return `<button class="timeline-row" style="width:100%;background:none;color:inherit;border-left:0;border-right:0;border-top:0;text-align:left;cursor:pointer" data-action="workout-detail" data-id="${esc(w.id)}"><span class="activity-icon ${strength?'':'blue'}">${ico(strength?'dumbbell':'runner')}</span><span class="grow"><div class="list-title">${esc(workTitle(w))}</div><p class="list-sub">${fmtDate(w.date)} · ${strength} series${ca?' · '+num(ca)+' min cardio':''}</p></span><span class="right tiny accent">${strength?num(volume(w))+' kg':num(ca)+' min'}</span></button>`;}
function workFromRoutine(rt){return rt.exercises.map(ex=>({id:uid(),name:ex.name,targetReps:ex.reps,rest:minmax(n(ex.rest)||db.restSeconds,10,600),sets:Array.from({length:minmax(n(ex.sets)||3,1,15)},()=>({id:uid(),weight:'',reps:'',done:false}))}));}
function startWorkout(id){if(db.draft){setView('entrenar');showToast('Ya tienes una sesión en curso');return;}const rt=db.routines.find(x=>x.id===id);db.draft={id:uid(),date:day(),startedAt:new Date().toISOString(),name:rt?.name||'Entrenamiento libre',exercises:rt?workFromRoutine(rt):[],cardio:[]};persist();setView('entrenar');}
function timerPanel(){const time=Math.max(0,Math.ceil((n(db.timerUntil)-Date.now())/1000));return `<div class="card highlight-card mt16"><div class="row between"><div><p class="kicker">${ico('timer',15)} DESCANSO</p><strong id="rest-count" style="font-size:31px;letter-spacing:-.7px">${String(Math.floor(time/60)).padStart(2,'0')}:${String(time%60).padStart(2,'0')}</strong></div><div class="inline-actions">${abtn('timer-add','+ 30 s','btn-xs btn-soft')}${abtn('timer-stop','Detener','btn-xs btn-ghost')}</div></div></div>`;}
function renderWorkout(){if(!db.draft)return `${title('ENTRENA A TU MANERA','Inicia una sesión.','Crea un registro detallado de cada serie o actividad cardiovascular.')}
 <div class="card highlight-card"><h2 class="secondary-title">Entrenamiento libre</h2><p class="note">Agrega ejercicios de fuerza, registra cardio o combina ambos en una misma sesión.</p>${abtn('start-free',`${ico('plus')} Iniciar sesión libre`,'btn-primary btn-full')}</div>
 ${section('O elige una rutina')} ${db.routines.length?db.routines.map(rt=>routineCard(rt,true)).join(''):'<div class="empty">Aún no has creado rutinas.</div>'}
 ${section('Historial',abtn('go-progress','Ver progreso','btn-xs btn-ghost'))}${getRecent().slice(0,5).map(workRow).join('')||'<div class="empty">Tu historial aparecerá aquí.</div>'}`;
const d=db.draft,done=d.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0),all=d.exercises.reduce((a,e)=>a+e.sets.length,0);return `${title('SESIÓN EN CURSO',d.name,`Iniciada hoy · ${done}/${all} series completadas`)}<div class="card highlight-card"><div class="workout-header"><div><span class="pill">${ico('bolt',13)} ACTIVA</span><p class="workout-meta mt8">${d.exercises.length} ejercicios · ${d.cardio.length} actividades cardio</p></div>${abtn('discard-workout','Descartar','btn-xs btn-danger')}</div><div class="field-grid"><label>Nombre de la sesión<input id="draft-name" maxlength="90" value="${esc(d.name)}" data-change="draft-name" aria-label="Nombre de la sesión"></label><label>Fecha<input id="draft-date" type="date" value="${esc(d.date)}" data-change="draft-date" aria-label="Fecha de la sesión"></label></div></div>
${n(db.timerUntil)>Date.now()?timerPanel():''}
${section('Ejercicios de fuerza',abtn('open-exercise',`${ico('plus',14)} Ejercicio`,'btn-xs btn-soft'))}
${d.exercises.length?d.exercises.map(e=>exerciseCard(e)).join(''):'<div class="empty">Añade un ejercicio para empezar a registrar tus series.</div>'}
${section('Cardio',abtn('open-cardio',`${ico('plus',14)} Cardio`,'btn-xs btn-soft'))}
<div class="card">${d.cardio.length?d.cardio.map(c=>`<div class="cardio-entry"><span class="activity-icon blue">${ico('runner')}</span><span class="grow"><div class="list-title">${esc(c.type)}</div><div class="list-sub">${num(c.minutes,1)} min · ${num(c.distance,2)} km${c.hr?' · '+num(c.hr)+' ppm':''}</div></span><button class="iconbtn" aria-label="Eliminar cardio" data-action="delete-cardio" data-id="${esc(c.id)}">${ico('trash')}</button></div>`).join(''):'<p class="note mb0">Puedes registrar una carrera, caminata, bicicleta u otra actividad.</p>'}</div>
<div class="mt24">${abtn('finish-workout',`${ico('check')} Finalizar y guardar entrenamiento`,'btn-primary btn-full')}</div><div class="note mt8" style="text-align:center">Las series solo cuentan como completadas al marcar ✓.</div>`;}
function exerciseCard(e){let finished=e.sets.filter(s=>s.done).length;return `<article class="workout-exercise"><div class="row between"><div class="grow"><h3>${esc(e.name)}</h3><p class="workout-meta mt8">${finished}/${e.sets.length} series completadas${e.targetReps?` · objetivo ${esc(e.targetReps)}`:''}</p></div><button class="iconbtn" data-action="remove-exercise" data-id="${esc(e.id)}" aria-label="Quitar ejercicio">${ico('trash')}</button></div><div class="set-head"><span>Serie</span><span>kg</span><span>Reps</span><span>Hecho</span></div>
${e.sets.map((s,i)=>`<div class="set-row"><span class="set-num">${i+1}</span><input inputmode="decimal" type="number" min="0" max="2000" step="0.5" placeholder="0" value="${esc(s.weight)}" data-change="set" data-kind="weight" data-ex="${esc(e.id)}" data-set="${esc(s.id)}" aria-label="Peso serie ${i+1} de ${esc(e.name)}"><input inputmode="numeric" type="number" min="0" max="999" step="1" placeholder="0" value="${esc(s.reps)}" data-change="set" data-kind="reps" data-ex="${esc(e.id)}" data-set="${esc(s.id)}" aria-label="Repeticiones serie ${i+1} de ${esc(e.name)}"><button class="done-btn ${s.done?'done':''}" data-action="toggle-set" data-ex="${esc(e.id)}" data-set="${esc(s.id)}" aria-label="${s.done?'Desmarcar':'Completar'} serie ${i+1}">${ico('check',17)}</button></div>`).join('')}
<div class="inline-actions mt12">${abtn('add-set',`${ico('plus',14)} Serie`,'btn-xs btn-soft',`data-id="${esc(e.id)}"`)}${e.sets.length>1?abtn('delete-last-set','Quitar última','btn-xs btn-ghost',`data-id="${esc(e.id)}"`):''}${abtn('start-timer',`${ico('timer',14)} ${n(e.rest)||n(db.restSeconds)} s`,'btn-xs btn-ghost',`data-seconds="${n(e.rest)||n(db.restSeconds)}"`)}</div></article>`;}
function routineCard(rt,shortcut=false){return `<article class="routine"><span class="routine-icon">${ico('dumbbell',22)}</span><div class="grow"><div class="row between"><strong>${esc(rt.name)}</strong><span class="pill gray">${rt.exercises.length} ej.</span></div><ol>${rt.exercises.slice(0,4).map(e=>`<li>${esc(e.name)} · ${n(e.sets)} × ${esc(e.reps)}</li>`).join('')}${rt.exercises.length>4?`<li>Y ${rt.exercises.length-4} más…</li>`:''}</ol><div class="inline-actions mt12">${abtn('start-routine',`${ico('play',14)} Entrenar`,'btn-primary btn-xs',`data-id="${esc(rt.id)}"`)}${shortcut?'':abtn('edit-routine',`${ico('edit',14)} Editar`,'btn-xs btn-ghost',`data-id="${esc(rt.id)}"`)}${shortcut?'':abtn('delete-routine',ico('trash',15),'btn-xs btn-ghost',`data-id="${esc(rt.id)}" aria-label="Eliminar rutina"`)}</div></div></article>`;}
function renderRoutines(){return `${title('PLANIFICA TU PROGRESO','Mis rutinas.','Personaliza tus días, series, repeticiones y descansos.',abtn('new-routine',`${ico('plus')} Nueva rutina`,'btn-primary'))}<div class="callout">Incluimos dos rutinas de ejemplo para que puedas empezar. Puedes editarlas, borrarlas o crear las tuyas.</div>${section('Rutinas disponibles')}<div class="${db.routines.length?'':'empty'}">${db.routines.length?db.routines.map(rt=>routineCard(rt)).join(''):'No tienes rutinas. Pulsa “Nueva rutina” para crear la primera.'}</div>`;}
function linePlot(items,field,unit){const all=items.filter(x=>Number.isFinite(n(x[field])) && n(x[field])>0);const interval=measureRange==='all'?null:day(shiftDay(new Date(),-Number(measureRange)));const eligible=interval?all.filter(x=>x.date>=interval):all;const pts=eligible.length>120?eligible.filter((_,i)=>i===0||i===eligible.length-1||i%Math.ceil(eligible.length/118)===0):eligible;if(!pts.length)return '<div class="no-data-plot">Añade registros para visualizar tu tendencia.</div>';
const W=346,H=160,L=30,R=12,T=12,B=28,v=pts.map(x=>n(x[field])),low=Math.max(0,Math.min(...v)*.91),high=Math.max(...v)*1.06||1,diff=Math.max(high-low,1),range=W-L-R;
const XY=pts.map((p,i)=>[L+(pts.length===1?.5:i/(pts.length-1))*range,T+(H-T-B)*(1-(n(p[field])-low)/diff)]);
const pth=XY.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' '),area=`${pth} L${XY.at(-1)[0]} ${H-B} L${XY[0][0]} ${H-B} Z`;
return `<svg class="chart-line" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de ${esc(unit)}, desde ${num(v[0],1)} hasta ${num(v.at(-1),1)}"><defs><linearGradient id="fillPlot" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c5f56a" stop-opacity=".28"/><stop offset="100%" stop-color="#c5f56a" stop-opacity="0"/></linearGradient></defs><path d="M${L} ${H-B}H${W-R}" stroke="#425044"/><path d="M${L} ${T+32}H${W-R}" stroke="#2e3931" stroke-dasharray="4 5"/><path d="${area}" fill="url(#fillPlot)"/><path d="${pth}" stroke="#c5f56a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" fill="none"/>${XY.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.2" fill="#d7f9ae"><title>${esc(fmtDate(pts[i].date))}: ${num(v[i],2)} ${esc(unit)}</title></circle>`).join('')}<text x="${L}" y="${H-8}">${esc(fmtDate(pts[0].date))}</text><text x="${W-R}" y="${H-8}" text-anchor="end">${esc(fmtDate(pts.at(-1).date))}</text><text x="${L}" y="${T+5}">${num(high,1)}</text></svg>`;}
function records(){const map=new Map();for(const w of db.workouts){for(const e of w.exercises||[]){let entry=map.get(e.name)||{name:e.name,max:0,e1rm:0,maxReps:0,sets:0};for(const s of e.sets||[]){if(!s.done)continue;const weight=n(s.weight),reps=n(s.reps);entry.max=Math.max(entry.max,weight);entry.e1rm=Math.max(entry.e1rm,weight*(1+Math.min(reps,30)/30));entry.maxReps=Math.max(entry.maxReps,reps);entry.sets++;}map.set(e.name,entry);}}return [...map.values()].filter(x=>x.sets).sort((a,b)=>b.e1rm-a.e1rm);}
function dailyMetricSeries(rows,field){
 const map=new Map();
 for(const m of rows){if(n(m[field])>0 && (!map.has(m.date) || m.source==='apple-health'))map.set(m.date,m);}
 return [...map.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
function renderProgress(){const all=getRecent(),trends=weeklySeries(),totalVol=db.workouts.reduce((a,w)=>a+volume(w),0),allCardio=db.workouts.reduce((a,w)=>a+minutes(w),0),prs=records(),measurements=[...db.measurements].sort((a,b)=>a.date.localeCompare(b.date)),weight=dailyMetricSeries(measurements,'weight'),fat=dailyMetricSeries(measurements,'bodyFat'),week=trends.at(-1),plotField=progressMetric==='fuerza'?'vol':'cardio',maxDistance=Math.max(0,...db.workouts.flatMap(w=>(w.cardio||[]).map(c=>n(c.distance))));
return `${title('REVISA TUS MARCAS','Tu progreso.','Cada sesión construye tu historial.')}
<div class="stats"><div class="stat"><div class="stat-top">Sesiones</div><div class="stat-val">${db.workouts.length}</div><div class="stat-foot">Históricas</div></div><div class="stat"><div class="stat-top">Fuerza</div><div class="stat-val">${num(totalVol/1000,1)}<small> t</small></div><div class="stat-foot">Volumen acumulado</div></div><div class="stat"><div class="stat-top">Cardio</div><div class="stat-val">${num(allCardio)}<small> min</small></div><div class="stat-foot">${num(maxDistance,2)} km mejor distancia</div></div></div>
${section('Evolución semanal')}<div class="card"><div class="chart-head"><div><p class="kicker">Últimas 8 semanas</p><div class="big-n">${num(week[plotField])} <span class="small muted">${progressMetric==='fuerza'?'kg':'min'}</span></div></div><div class="inline-actions">${abtn('metric-fuerza','Fuerza',`btn-xs ${progressMetric==='fuerza'?'btn-soft':'btn-ghost'}`)}${abtn('metric-cardio','Cardio',`btn-xs ${progressMetric==='cardio'?'btn-soft':'btn-ghost'}`)}</div></div>${barChart(trends,plotField)}</div>
${section('Récords personales')}<div class="card">${prs.length?prs.slice(0,10).map(v=>`<div class="record-row"><div><div class="list-title">${esc(v.name)}</div><span class="list-sub">${v.sets} series registradas · e1RM estimada: ${num(v.e1rm,1)} kg</span></div><div class="right"><span class="pill">${ico('trophy',13)} ${num(v.max,1)} kg</span><div class="tiny muted mt8">Peso máximo</div></div></div>`).join(''):'<div class="empty">Completa series con peso y repeticiones para ver tus récords.</div>'}<p class="caption mt12">e1RM = peso × (1 + repeticiones / 30). Es una estimación, no una carga máxima prescrita.</p></div>
${section('Medidas corporales',abtn('open-measurement',`${ico('plus',14)} Registrar`,'btn-xs btn-soft'))}
<div class="inline-actions mb16" aria-label="Intervalo de los gráficos de medidas">${[['90','3 meses'],['365','12 meses'],['all','Todo el historial']].map(([value,label])=>abtn('measure-range-'+value,label,'btn-xs '+(measureRange===value?'btn-soft':'btn-ghost'))).join('')}</div>
<div class="grid2"><div class="card"><div class="chart-head"><div><p class="kicker">Peso corporal</p><div class="big-n">${weight.length?num(weight.at(-1).weight,1):'—'} <span class="small muted">kg</span></div></div>${ico('scale',24)}</div>${linePlot(weight,'weight','kg')}</div><div class="card"><div class="chart-head"><div><p class="kicker">Grasa corporal</p><div class="big-n">${fat.length?num(fat.at(-1).bodyFat,1):'—'} <span class="small muted">%</span></div></div>${ico('heart',24)}</div>${linePlot(fat,'bodyFat','%')}</div></div>
<div class="mt16">${abtn('go-health-import',`${ico('upload',15)} Importar de Salud de Apple`,'btn-soft btn-full')}</div>
<div class="card mt12">${section('Historial de medidas')}<p class="caption">${measurements.length} fechas registradas · las más recientes primero</p>${measurements.length?measurements.slice().reverse().slice(0,measureHistoryCount).map(m=>`<div class="meas-row"><span class="activity-icon orange">${ico('scale')}</span><div class="grow"><div class="list-title">${fmtDate(m.date)}</div><p class="list-sub">${m.weight?num(m.weight,1)+' kg':''}${m.bodyFat?' · '+num(m.bodyFat,1)+'% grasa':''}${m.waist?' · '+num(m.waist,1)+' cm cintura':''}${m.note?' · '+esc(m.note):''}${m.source==='apple-health'?' · Salud de Apple':''}</p></div><button class="iconbtn" data-action="delete-measurement" data-id="${esc(m.id)}" aria-label="Borrar medida">${ico('trash',17)}</button></div>`).join(''):'<div class="empty">Aquí aparecerán tus mediciones de peso y composición corporal.</div>'}${measurements.length>measureHistoryCount?`<div class="mt12">${abtn('more-measurements',`Ver ${Math.min(25,measurements.length-measureHistoryCount)} fechas anteriores`,'btn-ghost btn-full')}</div>`:''}</div>
${section('Historial de entrenamientos')}<div class="card">${all.length?all.map(workRow).join(''):'<div class="empty">Aún no has guardado entrenamientos.</div>'}</div>`;}
function syncSettings() {
return `${section('Atajos · Sincronización automática')}
<div class="card health-card"><div class="row gap8"><span class="activity-icon">${ico('bolt')}</span><div class="grow"><div class="list-title">Apple Salud → Atajos → PULSO</div><p class="list-sub">Sincroniza automáticamente al abrir PULSO si hay conexión.</p></div></div>
<p class="note mt12">Configura primero el servicio Cloudflare incluido en la descarga. Atajos le enviará exclusivamente peso y grasa corporal. <strong>No pongas aquí la clave WRITE_TOKEN</strong>: solo la de lectura.</p>
<div class="form-stack mt12"><label>Dirección de tu servicio Cloudflare<input type="url" id="sync-endpoint" inputmode="url" spellcheck="false" autocomplete="off" placeholder="https://pulso-sync-personal.usuario.workers.dev" value="${esc(syncConfig.endpoint)}"></label>
<label>Clave READ_TOKEN (privada)<input type="password" id="sync-read-token" spellcheck="false" autocomplete="off" placeholder="Tu clave de lectura" value="${esc(syncConfig.readToken)}"></label>
<div class="inline-actions">${abtn('sync-save',`${ico('check',15)} Guardar conexión`,'btn-soft')}${abtn('sync-now',`${ico('download',15)} Sincronizar ahora`,'btn-ghost',syncBusy?'disabled':'')}
</div><div class="mt12">${abtn('sync-clear','Borrar claves de este iPhone','btn-xs btn-ghost')}</div>
<div id="sync-status" class="note" role="status" aria-live="polite">${esc(syncStatus)}${syncConfig.lastSync?' · Última consulta: '+esc(new Date(syncConfig.lastSync).toLocaleString('es-CL')):''}</div></div>
<p class="caption mt12">Se guardan las claves en el almacenamiento local de este navegador, no en tus respaldos. Las mediciones sí viajan cifradas por HTTPS y se almacenan en tu base de datos Cloudflare, no con cifrado de extremo a extremo. No uses un dispositivo compartido.</p></div>`;
}
function setSyncStatus(message) {syncStatus=message;const out=el('sync-status');if(out)out.textContent=message+(syncConfig.lastSync?' · Última consulta: '+new Date(syncConfig.lastSync).toLocaleString('es-CL'):'');}
function saveSync() {
 const endpoint=(el('sync-endpoint')?.value||'').trim().replace(/\/+$/,'');
 const readToken=(el('sync-read-token')?.value||'').trim();
 let url;
 try {url=new URL(endpoint);}catch(_) {showToast('Introduce una dirección HTTPS válida');return;}
 if(url.protocol!=='https:' || url.username || url.password || url.search || url.hash || url.pathname!=='/' || !readToken || readToken.length<32){showToast('Revisa la URL HTTPS y la clave de lectura (mín. 32 caracteres)');return;}
 syncConfig={...syncConfig,endpoint:url.origin,readToken};
 try{localStorage.setItem(SYNC_KEY,JSON.stringify(syncConfig));}catch(_){showToast('No se pudo guardar la conexión');return;}
 setSyncStatus('Conexión guardada. Pulsa Sincronizar ahora.');showToast('Conexión guardada');
}
async function syncHealth(silent=false) {
 if(syncBusy)return;
 if(!syncConfig.endpoint || !syncConfig.readToken) {if(!silent)showToast('Configura la dirección y READ_TOKEN');return;}
 if(navigator.onLine===false) {if(!silent)setSyncStatus('Sin internet: las mediciones locales siguen disponibles');return;}
 syncBusy=true;setSyncStatus('Consultando mediciones…');
 try {
   const response=await fetch(syncConfig.endpoint+'/v1/measurements',{
     method:'GET',headers:{'Authorization':'Bearer '+syncConfig.readToken,'Accept':'application/json'},
     cache:'no-store',credentials:'omit',redirect:'error'
   });
   if(!response.ok)throw Error(response.status===401?'READ_TOKEN incorrecta':`Error del servicio (${response.status})`);
   const payload=await response.json();
   if(!Array.isArray(payload.rows) || payload.rows.length>10000)throw Error('Formato de respuesta incompatible');
   const daily=new Map();
   for(const row of payload.rows) {
     if(!/^\d{4}-\d{2}-\d{2}$/.test(row.day) || !['weight','bodyFat'].includes(row.metric) || !Number.isFinite(row.value) || !Number.isFinite(Date.parse(row.sampleAt)))throw Error('La respuesta contiene mediciones no válidas');
     if(row.metric==='weight' && (row.value<1||row.value>500))throw Error('Peso fuera de rango');
     if(row.metric==='bodyFat' && (row.value<=0||row.value>100))throw Error('Grasa fuera de rango');
     if(!daily.has(row.day))daily.set(row.day,{date:row.day,healthTimes:{}});
     const measure=daily.get(row.day);
     measure[row.metric]=row.value;
     measure.healthTimes[row.metric]=row.sampleAt;
   }
   const result=applyHealthMeasurements([...daily.values()]);
   syncConfig.lastSync=new Date().toISOString();
   localStorage.setItem(SYNC_KEY,JSON.stringify(syncConfig));
   setSyncStatus(`Sincronización correcta: ${result.added} fechas nuevas, ${result.updated} actualizadas`);
   if(view==='progreso')render();
   if(!silent)showToast(`Salud sincronizada: ${result.added} fechas nuevas`);
 }catch(e){setSyncStatus('Sincronización fallida: '+(e instanceof TypeError?'Problema de red o permiso CORS':e.message));if(!silent)showToast('No se pudo sincronizar Salud');}
 finally {syncBusy=false;}
}
function renderSettings(){return `${title('PERSONALIZA TU REGISTRO','Configuración.','Tú controlas tus datos. No hay cuentas ni pagos.')}
<div class="card"><h2 class="secondary-title">Cronómetro de descanso</h2><p class="note">Tiempo predeterminado cuando completas una serie sin un descanso definido en la rutina.</p><div class="field-grid"><label>Segundos entre series<input type="number" inputmode="numeric" min="10" max="600" step="5" id="rest-seconds" value="${minmax(n(db.restSeconds)||90,10,600)}" data-change="rest-seconds"></label><div style="display:flex;align-items:flex-end">${abtn('start-timer',`${ico('timer',15)} Probar temporizador`,'btn-soft btn-full',`data-seconds="${n(db.restSeconds)||90}"`)}</div></div>${n(db.timerUntil)>Date.now()?timerPanel():''}</div>
${syncSettings()}
${section('Apple Salud · Peso y grasa')}
<div class="card health-card"><div class="row gap8"><span class="activity-icon orange">${ico('heart')}</span><div class="grow"><div class="list-title">Importar historial desde Salud</div><p class="list-sub">Peso, grasa corporal y cintura, con fecha de medición.</p></div></div>
<p class="note mt12">En Salud de tu iPhone: toca tu perfil → <strong>Exportar todos los datos de salud</strong> → Guarda el archivo ZIP en Archivos. Después selecciónalo aquí. Si el ZIP es demasiado grande, descomprímelo e importa <strong>export.xml</strong>.</p>
${abtn('import-health',`${ico('upload',15)} Seleccionar export.zip / export.xml`,'btn-soft btn-full',healthImportBusy?'disabled':'')}
<input type="file" id="health-file" accept=".zip,.xml,application/zip,application/xml,text/xml" style="display:none" aria-label="Seleccionar exportación de Apple Salud">
<div id="health-status" role="status" aria-live="polite" class="note mt12">${esc(healthImportStatus||'Tus datos se procesan dentro de este iPhone y se combinan con tus medidas actuales, sin borrar entrenamientos.')}</div>
<p class="caption mt12">Alternativa para historial antiguo: importa el ZIP o XML. La PWA no tiene acceso directo a HealthKit; Atajos consulta los datos y los envía a tu servicio privado.</p></div>
${section('Tus datos')}<div class="card"><button class="settings-action" data-action="export"><span class="activity-icon">${ico('download')}</span><span class="grow"><strong>Exportar copia de seguridad</strong><small>Archivo JSON con rutinas, entrenamientos y medidas</small></span>${ico('arrow')}</button><button class="settings-action" data-action="import"><span class="activity-icon blue">${ico('upload')}</span><span class="grow"><strong>Restaurar copia de seguridad</strong><small>Reemplaza los datos actuales por un respaldo</small></span>${ico('arrow')}</button><input type="file" id="import-file" accept=".json,application/json" style="display:none" aria-label="Seleccionar respaldo JSON"><button class="settings-action" data-action="delete-all"><span class="activity-icon orange">${ico('trash')}</span><span class="grow"><strong>Eliminar todos mis datos</strong><small>Acción irreversible si no tienes respaldo</small></span>${ico('arrow')}</button></div>
${section('Privacidad y funcionamiento')}<div class="card"><div class="pill ${storageOk?'':'blue'}">${storageOk?'● Almacenamiento local activo':'● No se pudo confirmar el guardado'}</div><p class="note mt12">Tus entrenamientos y rutinas se guardan en este navegador. Si activas Atajos, el peso y el porcentaje de grasa se envían al servicio Cloudflare configurado y se descargan a esta app. No se sincronizan entrenamientos ni rutinas.</p><p class="note">Si eliminas los datos del sitio, reinstalas de otra manera o cambias de iPhone, podrías perderlos. <strong style="color:var(--white)">Exporta respaldos regularmente</strong> y guárdalos en Archivos o iCloud Drive.</p><p class="note">Para funcionar sin conexión debes abrir la aplicación al menos una vez con internet después de publicarla en HTTPS. Las copias y restauraciones no requieren conexión.</p></div><div class="caption mt16">PULSO · Versión 1.2 · Servicio externo opcional para sincronizar medidas.</div>`;}
function render(){el('app').innerHTML=`<div class="layout">${header()}<main id="main">${({inicio:renderHome,entrenar:renderWorkout,rutinas:renderRoutines,progreso:renderProgress,ajustes:renderSettings}[view]||renderHome)()}</main></div>${nav()}${modal?modalHtml():''}`;updateTimer();}
function formField(label,name,type='text',value='',attrs=''){return `<label>${esc(label)}<input name="${esc(name)}" type="${type}" value="${esc(value)}" ${attrs}></label>`;}
function routineLine(x={}){return `<div class="routine-line data-card" style="margin-top:9px"><div class="row between"><strong class="tiny">EJERCICIO</strong><button type="button" class="iconbtn" data-action="routine-remove-line" aria-label="Eliminar ejercicio">${ico('trash',16)}</button></div><div class="form-stack mt8"><label>Nombre<input name="exercise_name" maxlength="90" required placeholder="Ej. Sentadilla" value="${esc(x.name||'')}" list="exercise-list"></label><div class="field-grid cols3">${formField('Series','exercise_sets','number',x.sets||3,'min="1" max="15" required')}${formField('Reps / tiempo','exercise_reps','text',x.reps||'8–12','maxlength="24" required')}${formField('Descanso (s)','exercise_rest','number',x.rest||90,'min="10" max="600" required')}</div></div></div>`;}
const optionsLibrary=()=>`<datalist id="exercise-list">${LIBRARY.map(e=>`<option value="${esc(e)}"></option>`).join('')}</datalist>`;
function modalHtml(){let body='',heading='',footer='';const type=modal.type;
if(type==='exercise'){heading='Agregar ejercicio';body=`<form class="form-stack" id="form-exercise"><label>Ejercicio<input name="name" list="exercise-list" maxlength="90" required autocomplete="off" placeholder="Escribe o elige un ejercicio"></label>${optionsLibrary()}<div class="field-grid">${formField('Series iniciales','sets','number',3,'min="1" max="15" required')}${formField('Descanso (segundos)','rest','number',n(db.restSeconds)||90,'min="10" max="600" required')}</div><button class="btn btn-primary btn-full" type="submit">${ico('plus')} Añadir ejercicio</button></form>`;}
else if(type==='cardio'){heading='Registrar cardio';body=`<form class="form-stack" id="form-cardio"><label>Actividad<select name="type"><option>Caminata</option><option>Carrera</option><option>Bicicleta</option><option>Elíptica</option><option>Remo</option><option>Natación</option><option>Escaladora</option><option>Otra actividad</option></select></label><div class="field-grid">${formField('Duración (min)','minutes','number','','inputmode="decimal" min="0.1" max="1440" step="0.1" required')}${formField('Distancia (km)','distance','number','','inputmode="decimal" min="0" max="1000" step="0.01"')}</div>${formField('Frecuencia cardíaca media (ppm)','hr','number','','inputmode="numeric" min="0" max="250"')}<button class="btn btn-primary btn-full" type="submit">${ico('check')} Guardar actividad</button></form>`;}
else if(type==='measurement'){heading='Medidas corporales';body=`<form class="form-stack" id="form-measurement">${formField('Fecha','date','date',day(),'required')}<div class="field-grid">${formField('Peso (kg)','weight','number','','step="0.1" min="0" max="500" inputmode="decimal"')}${formField('Grasa corporal (%)','bodyFat','number','','step="0.1" min="0" max="100" inputmode="decimal"')}${formField('Cintura (cm)','waist','number','','step="0.1" min="0" max="300" inputmode="decimal"')}</div><label>Nota (opcional)<textarea name="note" maxlength="240" placeholder="Ej. Medición en ayunas"></textarea></label><button type="submit" class="btn btn-primary btn-full">${ico('check')} Guardar medición</button></form>`;}
else if(type==='routine'){let rt=modal.id?db.routines.find(x=>x.id===modal.id):null;heading=rt?'Editar rutina':'Nueva rutina';body=`<form class="form-stack" id="form-routine" data-id="${esc(rt?.id||'')}"><label>Nombre de la rutina<input name="name" maxlength="90" placeholder="Ej. Día de piernas" required value="${esc(rt?.name||'')}"></label><div id="routine-lines">${(rt?.exercises?.length?rt.exercises:[r('',3,'8–12',90)]).map(routineLine).join('')}</div><button class="btn btn-ghost btn-full" type="button" data-action="routine-add-line">${ico('plus')} Otro ejercicio</button><button class="btn btn-primary btn-full" type="submit">${ico('check')} ${rt?'Guardar cambios':'Crear rutina'}</button></form>${optionsLibrary()}`;}
else if(type==='detail'){const w=db.workouts.find(x=>x.id===modal.id);heading=w?workTitle(w):'Entrenamiento';if(w){body=`<p class="note">${fmtDate(w.date)} · ${completedSets(w).length} series · ${num(volume(w))} kg de volumen · ${num(minutes(w))} min cardio</p>${(w.exercises||[]).map(e=>`<div class="data-card mt12"><h3>${esc(e.name)}</h3>${(e.sets||[]).filter(s=>s.done).map((s,i)=>`<div class="row between tiny mt8"><span>Serie ${i+1}</span><strong>${num(n(s.weight),1)} kg × ${num(n(s.reps))} reps</strong></div>`).join('')||'<p class="note">Sin series completadas</p>'}</div>`).join('')}${(w.cardio||[]).map(c=>`<div class="data-card mt12"><h3>${ico('runner',16)} ${esc(c.type)}</h3><p class="note mb0">${num(n(c.minutes),1)} min · ${num(n(c.distance),2)} km ${c.hr?' · '+num(n(c.hr))+' ppm':''}</p></div>`).join('')}<div class="footer-actions">${abtn('delete-workout',`${ico('trash',15)} Eliminar entrenamiento`,'btn-danger btn-full',`data-id="${esc(w.id)}"`)}</div>`;}}
return `<div class="modal" id="modal-backdrop" role="presentation"><section class="modal-pane" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">${esc(heading)}</h2><button class="iconbtn" data-action="close-modal" aria-label="Cerrar">${ico('close',22)}</button></div>${body}</section></div>`;}
function openModal(type,id=null){modal={type,id};render();const first=el('modal-backdrop')?.querySelector('input,select,button');if(first && type!=='detail')first.focus({preventScroll:true});}
function updateTimer(){const counter=el('rest-count');if(!counter)return;const remain=Math.max(0,Math.ceil((n(db.timerUntil)-Date.now())/1000));counter.textContent=`${String(Math.floor(remain/60)).padStart(2,'0')}:${String(remain%60).padStart(2,'0')}`;}
function tick(){if(!db.timerUntil)return;if(Date.now()>=db.timerUntil){if(db.timerUntil!==lastTimerDone){lastTimerDone=db.timerUntil;db.timerUntil=0;persist();if(navigator.vibrate)navigator.vibrate([120,80,120]);showToast('¡Descanso terminado!');if(view==='entrenar'||view==='ajustes')render();}return;}updateTimer();}
function startTimer(seconds){db.timerUntil=Date.now()+minmax(n(seconds),10,600)*1000;lastTimerDone=0;persist();if(view!=='entrenar'&&view!=='ajustes')setView('entrenar');else render();showToast('Cronómetro iniciado');}
function exerciseOf(id){return db.draft?.exercises.find(e=>e.id===id);}
function formData(form){return Object.fromEntries(new FormData(form).entries());}
function downloadBackup(){const backup={app:'PULSO',schema:1,exportedAt:new Date().toISOString(),data:db};const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`pulso-respaldo-${day()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);showToast('Respaldo generado. Guárdalo en Archivos.');}
function validateBackup(raw){const data=raw?.app==='PULSO'?raw.data:raw;if(!data || !Array.isArray(data.workouts)||!Array.isArray(data.routines)||!Array.isArray(data.measurements) ||data.workouts.length>25000 || data.routines.length>500 || data.measurements.length>10000)throw Error('Formato de respaldo no válido');
if(!data.workouts.every(w=>typeof w==='object' && typeof w.date==='string' && Array.isArray(w.exercises) && Array.isArray(w.cardio) && w.exercises.every(e=>Array.isArray(e.sets)))|| !data.routines.every(r=>typeof r.name==='string' && Array.isArray(r.exercises))||!data.measurements.every(m=>typeof m.date==='string'))throw Error('El contenido del respaldo no es compatible');
return {...defaults(),...data,version:1,restSeconds:minmax(n(data.restSeconds)||90,10,600),timerUntil:0,draft:(data.draft&&Array.isArray(data.draft.exercises)&&Array.isArray(data.draft.cardio))?data.draft:null};}
async function importBackup(file){if(!file)return;if(file.size>15*1024*1024){showToast('El archivo supera 15 MB');return;}try{const restored=validateBackup(JSON.parse(await file.text()));if(!confirm('¿Reemplazar TODOS los datos actuales con este respaldo? Se perderán los registros que no estén en el archivo.'))return;const old=db;db=restored;if(!persist()){db=old;return;}modal=null;view='inicio';render();showToast('Datos restaurados correctamente');}catch(e){showToast('No se pudo importar: archivo no válido');}}
function healthState(message) {healthImportStatus = message;const status = el('health-status'); if(status) status.textContent = message;}
function healthTimestamp(value){
 if(typeof value!=='string')return NaN;
 const normalized=value.replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/,(_,date,time,zone,min)=>`${date}T${time}${zone}:${min}`);
 return Date.parse(normalized);
}
function applyHealthMeasurements(rows) {
  const incoming = new Map(rows.map(m=>[m.date,m]));
  // Las medidas manuales se mantienen; solo se actualizan mediciones previas provenientes de Salud.
  const other = db.measurements.filter(m=>m.source!=='apple-health' || !incoming.has(m.date));
  const previous = new Map(db.measurements.filter(m=>m.source==='apple-health').map(m=>[m.date,m]));
  let added=0,updated=0;
  for (const row of incoming.values()) {
    const prev = previous.get(row.date);
    const next = {id:prev?.id||'apple-health:'+row.date,date:row.date,
      source:'apple-health',healthTimes:{...prev?.healthTimes},
      weight:prev?.weight||null,bodyFat:prev?.bodyFat||null,waist:prev?.waist||null,
      note:'',...{}};
    for (const field of ['weight','bodyFat','waist']) {
      if(row[field]==null)continue;
      if(!next.healthTimes[field] || healthTimestamp(row.healthTimes[field]) >= healthTimestamp(next.healthTimes[field]) || !Number.isFinite(healthTimestamp(next.healthTimes[field]))) {
        next[field]=row[field];next.healthTimes[field]=row.healthTimes[field];
      }
    }
    if(!prev)added++;
    else if(['weight','bodyFat','waist'].some(k=>prev[k]!==next[k]))updated++;
    other.push(next);
  }
  if(other.length>10000)throw Error('El historial supera las 10.000 fechas admitidas.');
  const old=db.measurements;
  db.measurements=other;
  if(!persist()) {db.measurements=old;throw Error('Almacenamiento lleno; exporta un respaldo y libera espacio.');}
  return {added,updated,total:incoming.size};
}
function importHealth(file) {
  if(!file || healthImportBusy)return;
  if(typeof Worker==='undefined'){healthState('Este navegador no admite importación en segundo plano.');return;}
  healthImportBusy=true; healthState('Preparando archivo…');
  const worker=new Worker('./health-import-worker.js');
  const done=()=>{healthImportBusy=false;worker.terminate();};
  worker.onmessage=({data})=>{
    if(data.kind==='progress'){healthState(data.message);return;}
    if(data.kind==='error'){done();healthState('Error: '+data.message);showToast('No se pudo importar Salud');return;}
    if(data.kind==='result'){
      done();
      try {
        const {added,updated,total}=applyHealthMeasurements(data.days);
        view='progreso';render();showToast(`Salud importada: ${added} fechas nuevas, ${updated} actualizadas`);
        healthImportStatus=`Última importación: ${total} fechas; ${added} nuevas y ${updated} actualizadas.`;
      }catch(err){healthState('Error al guardar: '+err.message);showToast('No se pudieron guardar las mediciones');}
    }
  };
  worker.onerror=()=>{done();healthState('Error inesperado al procesar el archivo.');};
  worker.postMessage({file});
}
function onAction(action,node){const id=node.dataset.id;
switch(action){
 case 'navigate':setView(node.dataset.view);break;
 case 'go-train':case 'resume':setView('entrenar');break;
 case 'go-progress':setView('progreso');break;
 case 'go-health-import':setView('ajustes');break;
 case 'import-health':if(!healthImportBusy)el('health-file')?.click();break;
 case 'sync-save':saveSync();break;
 case 'sync-now':syncHealth();break;
 case 'sync-clear':if(confirm('¿Borrar la conexión y READ_TOKEN de este navegador? No se eliminan mediciones ya sincronizadas ni datos en Cloudflare.')){syncConfig={endpoint:'',readToken:'',lastSync:''};localStorage.removeItem(SYNC_KEY);syncStatus='Conexión eliminada de este iPhone';render();}break;
 case 'start-free':startWorkout();break;
 case 'start-routine':startWorkout(id);break;
 case 'discard-workout':if(confirm('¿Descartar la sesión actual? Los registros no guardados se perderán.')){db.draft=null;db.timerUntil=0;persist();render();showToast('Sesión descartada');}break;
 case 'open-exercise':openModal('exercise');break;
 case 'open-cardio':openModal('cardio');break;
 case 'open-measurement':openModal('measurement');break;
 case 'new-routine':openModal('routine');break;
 case 'edit-routine':openModal('routine',id);break;
 case 'workout-detail':openModal('detail',id);break;
 case 'close-modal':modal=null;render();break;
 case 'add-set':{const ex=exerciseOf(id);if(!ex)return;ex.sets.push({id:uid(),weight:'',reps:'',done:false});persist();render();break;}
 case 'delete-last-set':{const ex=exerciseOf(id);if(!ex||ex.sets.length<2)return;if(ex.sets.at(-1).done&&!confirm('La última serie está completada. ¿Eliminarla?'))return;ex.sets.pop();persist();render();break;}
 case 'remove-exercise':{const ex=exerciseOf(id);if(!ex)return;if(ex.sets.some(s=>s.done)&&!confirm(`¿Quitar ${ex.name} y sus series?`))return;db.draft.exercises=db.draft.exercises.filter(e=>e.id!==id);persist();render();break;}
 case 'delete-cardio':db.draft.cardio=db.draft.cardio.filter(c=>c.id!==id);persist();render();showToast('Cardio eliminado');break;
 case 'toggle-set':{const ex=exerciseOf(node.dataset.ex);const s=ex?.sets.find(s=>s.id===node.dataset.set);if(!s)return;if(!s.done && !(n(s.reps)>0)){showToast('Ingresa las repeticiones antes de completar la serie');return;}s.done=!s.done;persist();if(s.done)startTimer(n(ex.rest)||n(db.restSeconds));else render();break;}
 case 'start-timer':startTimer(node.dataset.seconds);break;
 case 'timer-add':db.timerUntil=Math.max(n(db.timerUntil),Date.now())+30000;persist();render();break;
 case 'timer-stop':db.timerUntil=0;persist();render();break;
 case 'finish-workout':{const d=db.draft;if(!d)return;if(!d.exercises.some(ex=>ex.sets.some(s=>s.done)) && !d.cardio.length){showToast('Marca al menos una serie o añade cardio');return;}
 if(!confirm('¿Finalizar y guardar este entrenamiento?'))return;
 db.workouts.push({...d,finishedAt:new Date().toISOString()});db.draft=null;db.timerUntil=0;if(!persist())return;setView('progreso');showToast('Entrenamiento guardado ✓');break;}
 case 'metric-fuerza':progressMetric='fuerza';render();break;
 case 'metric-cardio':progressMetric='cardio';render();break;
 case 'measure-range-90':case 'measure-range-365':case 'measure-range-all':measureRange=action.split('-').at(-1);render();break;
 case 'more-measurements':measureHistoryCount+=25;render();break;
 case 'routine-add-line':{const container=el('routine-lines');if(container.querySelectorAll('.routine-line').length>=30){showToast('Máximo 30 ejercicios por rutina');return;}container.insertAdjacentHTML('beforeend',routineLine());const inputs=container.lastElementChild?.querySelector('input');inputs?.focus();break;}
 case 'routine-remove-line':{const row=node.closest('.routine-line');if(el('routine-lines')?.querySelectorAll('.routine-line').length<=1){showToast('La rutina debe incluir al menos un ejercicio');return;}row?.remove();break;}
 case 'delete-routine':{const rt=db.routines.find(r=>r.id===id);if(rt&&confirm(`¿Eliminar la rutina «${rt.name}»? Los entrenamientos ya guardados no se borrarán.`)){db.routines=db.routines.filter(r=>r.id!==id);persist();render();showToast('Rutina eliminada');}break;}
 case 'delete-workout':{if(confirm('¿Eliminar este entrenamiento del historial? Se recalcularán tus estadísticas y récords.')){db.workouts=db.workouts.filter(w=>w.id!==id);persist();modal=null;render();showToast('Entrenamiento eliminado');}break;}
 case 'delete-measurement':{if(confirm('¿Eliminar esta medición corporal?')){db.measurements=db.measurements.filter(m=>m.id!==id);persist();render();}break;}
 case 'export':downloadBackup();break;
 case 'import':el('import-file')?.click();break;
 case 'delete-all':if(confirm('¿Eliminar todos los entrenamientos, rutinas y medidas?')&&confirm('Última confirmación. ¿Continuar?')){db=defaults();persist();setView('inicio');showToast('Datos eliminados');}break;
 }
}
function onForm(form){const data=formData(form);
switch(form.id){
 case 'form-exercise':{const name=(data.name||'').trim().slice(0,90);if(!name){showToast('Escribe un ejercicio');return;}const count=minmax(n(data.sets),1,15),rest=minmax(n(data.rest),10,600);db.draft.exercises.push({id:uid(),name,rest,sets:Array.from({length:count},()=>({id:uid(),weight:'',reps:'',done:false}))});persist();modal=null;render();showToast('Ejercicio añadido');break;}
 case 'form-cardio':{const minutes=n(data.minutes),distance=n(data.distance),hr=n(data.hr);if(!(minutes>0 && minutes<=1440)||distance<0||distance>1000||hr<0||hr>250){showToast('Revisa los valores del cardio');return;}db.draft.cardio.push({id:uid(),type:String(data.type||'Cardio').slice(0,40),minutes,distance,hr});persist();modal=null;render();showToast('Cardio registrado');break;}
 case 'form-measurement':{const weight=n(data.weight),fat=n(data.bodyFat),waist=n(data.waist);if(!weight&&!fat&&!waist){showToast('Ingresa al menos una medición');return;}if(weight<0||weight>500||fat<0||fat>100||waist<0||waist>300){showToast('Revisa los valores de la medición');return;}if(!/^\d{4}-\d{2}-\d{2}$/.test(data.date||'')){showToast('Ingresa una fecha válida');return;}db.measurements.push({id:uid(),date:data.date,weight:weight||null,bodyFat:fat||null,waist:waist||null,note:String(data.note||'').trim().slice(0,240)});persist();modal=null;setView('progreso');showToast('Medición guardada');break;}
 case 'form-routine':{const name=String(data.name||'').trim().slice(0,90),rows=[...form.querySelectorAll('.routine-line')],exercises=rows.map(row=>({id:uid(),name:row.querySelector('[name=exercise_name]').value.trim().slice(0,90),sets:minmax(n(row.querySelector('[name=exercise_sets]').value),1,15),reps:row.querySelector('[name=exercise_reps]').value.trim().slice(0,24),rest:minmax(n(row.querySelector('[name=exercise_rest]').value),10,600)}));if(!name||!exercises.length||exercises.some(ex=>!ex.name||!ex.reps)){showToast('Completa el nombre y los ejercicios');return;}const id=form.dataset.id;if(id){const index=db.routines.findIndex(x=>x.id===id);if(index===-1)return;db.routines[index]={id,name,exercises};}else db.routines.push({id:uid(),name,exercises});persist();modal=null;render();showToast('Rutina guardada');break;}
 }
}
document.addEventListener('click',event=>{if(event.target.id==='modal-backdrop'){modal=null;render();return;}const btn=event.target.closest('[data-action]');if(!btn)return;event.preventDefault();onAction(btn.dataset.action,btn);});
document.addEventListener('submit',event=>{if(!event.target.id?.startsWith('form-'))return;event.preventDefault();onForm(event.target);});
document.addEventListener('change',event=>{const t=event.target;
if(t.id==='import-file'){importBackup(t.files?.[0]);t.value='';return;}
if(t.id==='health-file'){importHealth(t.files?.[0]);t.value='';return;}
if(!t.dataset.change)return;
if(t.dataset.change==='set'){const ex=exerciseOf(t.dataset.ex),s=ex?.sets.find(s=>s.id===t.dataset.set);if(!s)return;const val=t.value;if(val!=='' && (!Number.isFinite(n(val))||n(val)<0||n(val)>(t.dataset.kind==='weight'?2000:999))){showToast('Valor fuera de rango');t.value=s[t.dataset.kind];return;}s[t.dataset.kind]=val===''?'':(t.dataset.kind==='reps'?Math.floor(n(val)):n(val));persist();}
if(t.dataset.change==='draft-name'){db.draft.name=t.value.trim().slice(0,90)||'Entrenamiento libre';persist();}
if(t.dataset.change==='draft-date'){if(/^\d{4}-\d{2}-\d{2}$/.test(t.value)){db.draft.date=t.value;persist();}}
if(t.dataset.change==='rest-seconds'){db.restSeconds=minmax(n(t.value)||90,10,600);persist();render();showToast('Descanso actualizado');}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal){modal=null;render();}});
setupSW();persist();render();setInterval(tick,1000);
setTimeout(()=>syncHealth(true),400);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&syncConfig.readToken && (!syncConfig.lastSync||Date.now()-Date.parse(syncConfig.lastSync)>5*60*1000))syncHealth(true);});
})();
