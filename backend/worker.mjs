/** PULSO Sync API 1.2 — Cloudflare Workers + D1.
 * Authentication: separate, randomly generated 256-bit READ_TOKEN / WRITE_TOKEN secrets.
 * Do NOT put either token in the GitHub repository.
 * Stores only weight and body-fat samples in D1; workout data stays on the device.
 */
const jsonHeaders = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
function sameToken(a,b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length < 32 || b.length < 32) return false;
  // Constant work for equally sized token strings; length mismatch cannot authenticate.
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i=0;i<length;i++) difference |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return difference === 0;
}
function cors(request,env) {
  const origin=request.headers.get('origin');
  if(!origin || origin !== env.ALLOWED_ORIGIN) return {};
  return {'access-control-allow-origin':origin,'access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,OPTIONS','access-control-max-age':'3600','vary':'Origin'};
}
function reply(request,env,status,data) {return new Response(JSON.stringify(data),{status,headers:{...jsonHeaders,...cors(request,env)}});}
function parseValue(raw,metric,unit) {
  // Accept plain numbers or Spanish decimal commas, with an optional explicit unit.
  // Do not guess whether fractions represent percents; choose unit=fraction explicitly.
  const str=String(raw??'').trim();
  const allowed=metric==='weight' ? /^(\d{1,3}(?:[.,]\d{1,3})?)\s*(?:kg)?$/i : /^(\d{1,3}(?:[.,]\d{1,3})?)\s*%?$/;
  const match=str.match(allowed);
  if(!match)return null;
  let value=Number(match[1].replace(',','.'));
  if(metric==='bodyFat' && unit==='fraction') value*=100;
  if(metric==='weight' && unit && unit!=='kg')return null;
  if(metric==='bodyFat' && unit && unit!=='percent' && unit!=='fraction')return null;
  if(!Number.isFinite(value) || (metric==='weight' && (value<1 || value>500)) || (metric==='bodyFat' && (value<=0 || value>100)))return null;
  return Math.round(value*1000)/1000;
}
function parseStamp(text) {
  // RFC3339 or Apple Salud export format: "2026-10-25 08:07:21 -0300".
  if(typeof text!=='string')return null;
  const s=text.trim();
  let converted=s;
  const apple=/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/.exec(s);
  if(apple)converted=`${apple[1]}T${apple[2]}${apple[3]}:${apple[4]}`;
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(converted))return null;
  const ms=Date.parse(converted);
  if(!Number.isFinite(ms) || ms<Date.UTC(2000,0,1) || ms>Date.now()+2*86400000)return null;
  const date=s.slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
  return {date,iso:new Date(ms).toISOString()};
}
export default {
 async fetch(request,env) {
  if(!env.DB || !env.ALLOWED_ORIGIN || !env.READ_TOKEN || !env.WRITE_TOKEN || env.READ_TOKEN===env.WRITE_TOKEN || env.READ_TOKEN.length<32 || env.WRITE_TOKEN.length<32) {
   return reply(request,env,503,{error:'Configuración del servicio incompleta'});
  }
  const url=new URL(request.url),path=url.pathname.replace(/\/$/,'');
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{...jsonHeaders,...cors(request,env)}});
  if(path==='/v1/status' && request.method==='GET')return reply(request,env,200,{ok:true,service:'pulso-sync',version:1});
  if(!['/v1/measurements','/v1/ingest/weight','/v1/ingest/bodyFat'].includes(path))return reply(request,env,404,{error:'Ruta inexistente'});
  const token=(request.headers.get('authorization')||'').match(/^Bearer (\S+)$/i)?.[1]||'';
  const isRead=path==='/v1/measurements';
  if(!sameToken(token,isRead?env.READ_TOKEN:env.WRITE_TOKEN))return reply(request,env,401,{error:'Clave incorrecta'});
  if(isRead) {
   if(request.method!=='GET')return reply(request,env,405,{error:'Método no permitido'});
   try {
    const results=await env.DB.prepare('SELECT metric, day, value, sample_at AS sampleAt FROM measurements ORDER BY day DESC, metric LIMIT 10000').all();
    return reply(request,env,200,{rows:results.results||[],version:1});
   }catch(_){return reply(request,env,500,{error:'Error al consultar mediciones'});}
  }
  if(request.method!=='POST')return reply(request,env,405,{error:'Método no permitido'});
  const len=Number(request.headers.get('content-length')||0);
  if(len>2048)return reply(request,env,413,{error:'Cuerpo excesivo'});
  if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))return reply(request,env,415,{error:'Se requiere JSON'});
  let body;
  try {const text=await request.text();if(text.length>2048)throw Error('too big');body=JSON.parse(text);}catch(_){return reply(request,env,400,{error:'JSON no válido o demasiado extenso'});}
  const metric=path.endsWith('/weight')?'weight':'bodyFat';
  const stamp=parseStamp(body?.sampleAt);
  const value=parseValue(body?.value,metric,body?.unit||undefined);
  if(!stamp || value==null)return reply(request,env,422,{error:'Valor o fecha de muestra incorrectos. Revisa unidad y formato RFC3339.'});
  try {
   const result=await env.DB.prepare(`INSERT INTO measurements(metric,day,value,sample_at,updated_at) VALUES(?,?,?,?,?)
    ON CONFLICT(metric,day) DO UPDATE SET value=excluded.value,sample_at=excluded.sample_at,updated_at=excluded.updated_at
    WHERE excluded.sample_at>=measurements.sample_at`)
    .bind(metric,stamp.date,value,stamp.iso,new Date().toISOString()).run();
   return reply(request,env,200,{ok:true,metric,date:stamp.date,updated:(result.meta?.changes||0)>0});
  }catch(_){return reply(request,env,500,{error:'No fue posible guardar la medición'});}
 }
};
export {parseValue,parseStamp};
