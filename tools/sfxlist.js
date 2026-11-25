// Sammelt alle Soundeffekt-Ereignisse eines Videos: node tools/sfxlist.js <html>  → JSON auf stdout
const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.resolve(process.argv[2])+'?export=1');await p.waitForFunction(()=>window.seek);
const ev=await p.evaluate(()=>{const D=window.DUR,out=[];let prev=0;
  for(let i=0;i<=D*60;i++){const t=i/60;window.seek(t);const f=window.__K.flash||0;if(f>.3&&prev<.18)out.push({n:"shimmer",at:t,v:.7});prev=f;}
  Object.values(window.SFXLOG).forEach(e=>out.push(e));
  (window.VIDEO.SFX||[]).forEach(([at,n,v])=>out.push({n,at,v:v??1}));
  return out;});
await b.close();
// doppelte Ereignisse (gleiches Geräusch < 0,12 s) zusammenfassen
ev.sort((a,b)=>a.at-b.at);const res=[];ev.forEach(e=>{if(!res.some(r=>r.n===e.n&&Math.abs(r.at-e.at)<.12))res.push(e);});
console.log(JSON.stringify(res));})();
