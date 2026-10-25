/* PULSO · Importador de Apple Salud, ejecutado sin red en un Web Worker.
 * Lee export.xml por fragmentos y export.zip con JSZip local (solo export.xml).
 * No se recopilan ni transmiten datos a ningún servidor. */
'use strict';
const types = {
  HKQuantityTypeIdentifierBodyMass: 'weight',
  HKQuantityTypeIdentifierBodyFatPercentage: 'bodyFat',
  HKQuantityTypeIdentifierWaistCircumference: 'waist'
};
let buffer = '', decoder = new TextDecoder('utf-8'), days = new Map(), parsed = 0, matched = 0;
function attr(opening, name) {
  const m = opening.match(new RegExp('(?:^|\\s)' + name + '="([^"]*)"'));
  return m ? m[1] : '';
}
function convert(field, raw, unit) {
  let v = Number(String(raw).replace(',', '.'));
  if (!Number.isFinite(v) || v <= 0) return null;
  const u = unit.trim().toLowerCase();
  if (field === 'weight') {
    if (u === 'lb' || u === 'lbs') v *= 0.45359237;
    else if (u === 'g') v /= 1000;
    else if (u === 'st') v *= 6.35029318;
    else if (u !== 'kg') return null;
    if (v < 1 || v > 500) return null;
  }
  if (field === 'bodyFat') {
    if (u !== '%' && u !== 'percent' && u !== 'count') return null;
    // HealthKit percent values normally export as 23.5%; tolerate fractional exports (0.235).
    if (v <= 1) v *= 100;
    if (v <= 0 || v > 100) return null;
  }
  if (field === 'waist') {
    if (u === 'in') v *= 2.54;
    else if (u === 'm') v *= 100;
    else if (u !== 'cm') return null;
    if (v < 10 || v > 300) return null;
  }
  return Math.round(v * 1000) / 1000;
}
function record(tag) {
  parsed++;
  const typ = attr(tag, 'type');
  const field = types[typ];
  if (!field) return;
  const stamp = attr(tag, 'endDate') || attr(tag, 'startDate');
  if (!/^\d{4}-\d{2}-\d{2}[ T]/.test(stamp)) return;
  const date = stamp.slice(0, 10);
  const val = convert(field, attr(tag, 'value'), attr(tag, 'unit'));
  if (val === null) return;
  matched++;
  let m = days.get(date);
  if (!m) { m = {date, healthTimes: {}}; days.set(date, m); }
  if (!m.healthTimes[field] || stamp >= m.healthTimes[field]) {
    m[field] = val;
    m.healthTimes[field] = stamp;
  }
}
function scan(text, done = false) {
  buffer += text;
  let cursor = 0;
  while (true) {
    const i = buffer.indexOf('<Record', cursor);
    if (i < 0) { buffer = buffer.slice(Math.max(0, buffer.length - 7)); break; }
    const next = buffer[i + 7];
    if (next && next !== ' ' && next !== '\t' && next !== '\n' && next !== '\r' && next !== '>' && next !== '/') {
      cursor = i + 7;
      continue;
    }
    const j = buffer.indexOf('>', i + 7);
    if (j < 0) {
      buffer = buffer.slice(i);
      if (buffer.length > 40000) throw Error('Registro XML demasiado extenso o corrupto');
      break;
    }
    record(buffer.slice(i, j + 1));
    cursor = j + 1;
    if (cursor >= buffer.length) { buffer = ''; break; }
  }
  if (done) buffer = '';
}
async function fromXML(file) {
  const chunkSize = 384 * 1024;
  for (let start = 0; start < file.size; start += chunkSize) {
    const ab = await file.slice(start, Math.min(start + chunkSize, file.size)).arrayBuffer();
    scan(decoder.decode(ab, {stream:true}));
    if (start % (chunkSize * 24) === 0) postMessage({kind:'progress',message:`Procesando XML… ${Math.min(100,Math.round((start+ab.byteLength)*100/file.size))}%`});
  }
  scan(decoder.decode(),true);
}
async function fromZIP(file) {
  if (file.size > 250 * 1024 * 1024) throw Error('ZIP superior a 250 MB. Descomprímelo y selecciona únicamente export.xml (puede ser más grande).');
  importScripts('./vendor/jszip.min.js');
  postMessage({kind:'progress',message:'Abriendo ZIP local…'});
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const list = Object.values(zip.files).filter(f => !f.dir && /(?:^|\/)export\.xml$/i.test(f.name));
  if (!list.length) throw Error('El ZIP no contiene export.xml de Apple Salud.');
  const selected = list.sort((a,b)=>a.name.length-b.name.length)[0];
  if (selected._data && selected._data.uncompressedSize > 1.5 * 1024 * 1024 * 1024) throw Error('XML comprimido demasiado grande para este importador. Extrae export.xml y selecciónalo directamente.');
  postMessage({kind:'progress',message:'Leyendo mediciones de export.xml…'});
  await new Promise((resolve,reject) => {
    selected.internalStream('uint8array')
      .on('data', chunk => {
        try { scan(decoder.decode(chunk,{stream:true})); }
        catch(err) { reject(err); }
      })
      .on('error',reject)
      .on('end',() => {
        try { scan(decoder.decode(),true); resolve(); }
        catch(err) { reject(err); }
      })
      .resume();
  });
}
onmessage = async ({data}) => {
  const file = data.file;
  try {
    if (!file) throw Error('No se seleccionó ningún archivo');
    buffer = ''; decoder = new TextDecoder('utf-8'); days = new Map(); parsed = 0; matched = 0;
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.zip')) await fromZIP(file);
    else if (name.endsWith('.xml')) await fromXML(file);
    else throw Error('Selecciona export.zip o export.xml de Apple Salud.');
    if (!matched) throw Error('No se encontraron registros válidos de peso, grasa o cintura.');
    postMessage({kind:'result',days:[...days.values()],parsed,matched});
  } catch(err) { postMessage({kind:'error',message:String(err.message || err)}); }
};
