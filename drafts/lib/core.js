/* Gemeinsame Bausteine für alle Videos (1080×1920).
   Ein Video definiert: window.VIDEO = {DUR, HEADS, LABELS, build(K), render(t,K)}
   und lädt danach diese Datei. */
(function(){
const V=window.VIDEO;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const P=(t,a,b)=>clamp((t-a)/(b-a));
const eOut=x=>1-Math.pow(1-x,3);
const eExpo=x=>x>=1?1:1-Math.pow(2,-10*x);
const eIO=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const eBack=x=>{const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
const lerp=(a,b,x)=>a+(b-a)*x;
const NS="http://www.w3.org/2000/svg";
const el=(tag,attrs={},parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent&&parent.appendChild(e);return e;};
let seed=V.seed||77;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const C={white:"#F5F5F7",grey:"#8E8E93",dim:"#48484A",gold:"#F5B83D",red:"#FF453A",card:"#0d0d0d"};
const txt=(parent,x,y,str,size,attrs={})=>{const e=el("text",Object.assign({x,y,"text-anchor":"middle",fill:C.white,"font-family":"Outfit","font-weight":600,"font-size":size,"letter-spacing":size*.22},attrs),parent);e.textContent=str;return e;};
const mixHex=(a,b,x)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const X=p(a),Y=p(b);return"#"+X.map((v,i)=>Math.round(lerp(v,Y[i],clamp(x))).toString(16).padStart(2,"0")).join("");};
const win=(t,a,b,fi=.45,fo=.35)=>eExpo(P(t,a,a+fi))*(1-eIO(P(t,b,b+fo)));
const pulses=(t,list,decay=9,first=1,rest=.5)=>list.reduce((s,b,i)=>s+(t>=b?Math.exp(-(t-b)*decay)*(i?rest:first):0),0);
const grid=(t,b0,bp,a,b,decay=9,every=1)=>{if(t<a||t>b+.5||t<b0)return 0;const k=Math.floor((t-b0)/bp);if(k%every)return 0;const bt=b0+k*bp;if(bt<a-.01)return 0;return Math.exp(-(t-bt)*decay);};

/* ---- DOM ---- */
document.body.insertAdjacentHTML("afterbegin",`
<div id="wrap"><div id="stage"><div id="bg"></div>
<svg id="g" viewBox="0 0 1080 1920" width="1080" height="1920"><defs>
 <filter id="glow" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="5080" height="5920"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="glowGoldU" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="5080" height="5920"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="glowB" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
 <linearGradient id="spot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="spotGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3A3" stop-opacity=".36"/><stop offset="1" stop-color="#F5B83D" stop-opacity="0"/></linearGradient>
 <linearGradient id="moon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bcd2ff" stop-opacity=".28"/><stop offset="1" stop-color="#bcd2ff" stop-opacity="0"/></linearGradient>
 <linearGradient id="lamp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3A3" stop-opacity=".45"/><stop offset="1" stop-color="#F5B83D" stop-opacity="0"/></linearGradient>
 <radialGradient id="halo"><stop offset="0" stop-color="#F5B83D" stop-opacity=".45"/><stop offset="1" stop-color="#F5B83D" stop-opacity="0"/></radialGradient>
 <radialGradient id="headShade" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#ececf0"/><stop offset="1" stop-color="#c9c9d0"/></radialGradient>
 <radialGradient id="haloW"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
 <clipPath id="floorClip"><rect x="-2000" y="1442" width="5080" height="2000"/></clipPath>
</defs><g id="cam"><g id="bgfx"></g><g id="stars"></g><g id="scene"></g></g></svg>
<div id="dim"></div><div id="flash"></div><div id="heads"></div>
<div id="safe"><div style="left:0;top:0;right:0;height:230px"></div><div style="left:0;bottom:0;right:0;height:384px"></div><div style="right:0;top:230px;bottom:384px;width:130px"></div></div>
</div></div>
<div id="ui"><button id="play">Play ▶</button><button id="restart">↺</button><input id="scrub" type="range" min="0" max="${V.DUR}" step="0.01" value="0"><span id="time">0.00 s</span><button id="safeBtn">Safe Zone</button></div>
<audio id="vo" src="${V.audio||""}" preload="auto"></audio>`);
const style=document.createElement("style");style.textContent=`
@font-face{font-family:"Outfit";src:url("../materials/fonts/Outfit-latin.woff2") format("woff2");font-weight:100 900;font-display:block}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#000;overflow:hidden;font-family:"Outfit",system-ui,sans-serif}
#wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
#stage{position:relative;width:1080px;height:1920px;background:#070707;overflow:hidden;transform-origin:center center;flex:none}
#bg{position:absolute;inset:0;background:radial-gradient(ellipse 70% 45% at 50% 52%,#161616 0%,#0c0c0c 45%,#070707 75%)}
svg{position:absolute;inset:0}
.hl{position:absolute;left:70px;width:880px;text-align:center;color:#F5F5F7;font-weight:800;font-size:84px;line-height:1.06;letter-spacing:-.5px;text-shadow:0 0 28px rgba(255,255,255,.18)}
.hl .ln{display:block;white-space:nowrap}
.hl .w{display:inline-block;margin:0 .13em;will-change:transform,opacity,filter}
.hl .gold{color:#F5B83D;text-shadow:0 0 32px rgba(245,184,61,.45)}
.hl .red{color:#FF453A;text-shadow:0 0 32px rgba(255,69,58,.4)}
.hl .mark{position:relative;padding:0 .16em}
.hl .mark i{position:absolute;left:0;top:.08em;bottom:.02em;width:100%;background:#F5B83D;border-radius:.12em;transform-origin:left center;z-index:-1;box-shadow:0 0 40px rgba(245,184,61,.45)}
.hl .mark span{position:relative}
.label{position:absolute;left:70px;width:880px;text-align:center;color:#8E8E93;font-weight:600;font-size:30px;letter-spacing:.3em;text-transform:uppercase}
#dim{position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 60%,rgba(0,0,0,0) 0%,rgba(0,0,0,.85) 70%);opacity:0;pointer-events:none}
#flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
#safe{position:absolute;inset:0;pointer-events:none;display:none}
#safe div{position:absolute;background:rgba(255,69,58,.18);border:2px dashed rgba(255,69,58,.6)}
#ui{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:8px;align-items:center;background:rgba(30,30,32,.85);backdrop-filter:blur(12px);padding:8px 12px;border-radius:999px;color:#ddd;font:500 14px system-ui;z-index:9}
#ui button{background:#3a3a3c;color:#fff;border:0;border-radius:999px;padding:6px 12px;font:inherit;cursor:pointer}
#ui input{width:200px}
body.export #ui{display:none}`;document.head.appendChild(style);

const scene=document.getElementById("scene"),bgfx=document.getElementById("bgfx"),cam=document.getElementById("cam");
const GY=1440;
/* backdrop */
const STARS=[];const stars=document.getElementById("stars");
for(let i=0;i<80;i++)STARS.push({c:el("circle",{cx:rnd()*1080,cy:rnd()*1920,r:.8+rnd()*1.6,fill:"#fff"},stars),o:.08+rnd()*.25,ph:rnd()*6.28,sp:.4+rnd()*.8});
const dots=el("g",{},bgfx);for(let x=60;x<1080;x+=60)for(let y=60;y<1440;y+=60)el("circle",{cx:x,cy:y,r:1.6,fill:"#fff",opacity:.055},dots);
const floor=el("g",{"clip-path":"url(#floorClip)"},bgfx);
const FLOORH=[...Array(10)].map(()=>el("line",{x1:-2000,x2:3080,stroke:"#fff",opacity:.09,"stroke-width":2},floor));
for(let x=-1400;x<=2480;x+=140)el("line",{x1:540,y1:GY-240,x2:x,y2:1920,stroke:"#fff",opacity:.07,"stroke-width":2},floor);
const ground=el("line",{x1:110,y1:GY,x2:950,y2:GY,stroke:C.white,"stroke-width":5,"stroke-linecap":"round",filter:"url(#glow)"},scene);
const spot=(x,gold)=>el("path",{d:`M${x-35},-300 L${x+35},-300 L${x+200},1440 L${x-200},1440 Z`,fill:gold?"url(#spotGold)":"url(#spot)",opacity:0},bgfx);
const raysG=(cx,cy,n=34)=>{const g=el("g",{opacity:0},bgfx);for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,L=500+rnd()*900,r0=100+rnd()*60;
  el("line",{x1:Math.cos(a)*r0,y1:Math.sin(a)*r0,x2:Math.cos(a)*L,y2:Math.sin(a)*L,stroke:i%4===0?C.gold:"#fff",opacity:.15+rnd()*.3,"stroke-width":1.5+rnd()*2.5,"stroke-linecap":"round"},g);}g.cx=cx;g.cy=cy;return g;};

/* figure with knees/elbows */
function makeFig(parent){
  /* Detaillierte Figur: Glieder in 2 Abschnitten mit Kontur, Hände, Füße, Rumpf, schattierter Kopf, Bodenschatten */
  const P0=parent||scene;
  const shadow=el("ellipse",{rx:60,ry:11,fill:"#000",opacity:.55,filter:"url(#blur8)"},P0);
  const g=el("g",{filter:"url(#glow)"},P0);
  const mk=(tag,a)=>el(tag,Object.assign({fill:"none","stroke-linecap":"round","stroke-linejoin":"round"},a),g);
  const limb=()=>({o:mk("polyline",{}),f:mk("polyline",{}),j:el("circle",{r:0},g)});
  const legB=limb(),armB=limb();
  const torsoO=mk("polyline",{}),torsoF=mk("polyline",{}),torsoS=mk("polyline",{opacity:.18});
  const neckL=mk("line",{});
  const head=el("circle",{r:36},g);const headHi=el("circle",{r:12,fill:"#fff",opacity:.55},g);
  const legF=limb(),armF=limb();
  const feet=[0,1].map(()=>el("path",{},g)),hands=[0,1].map(()=>el("circle",{},g));
  const F={g,head,shadow,hand:[0,0]};
  const setPL=(e,pts)=>e.setAttribute("points",pts.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" "));
  F.draw=o=>{const s=o.sc||1,x=o.x,yF=o.y,ph=o.ph||0,droop=o.droop||0,look=o.look||0,col=o.col||C.white,lean=o.lean||0,sit=o.sit||0,run=o.run||0;
    const face=o.face??(look<-.2?-1:1);
    const hipY=yF-lerp(118,o.chair?112:70,sit)*s, hip=[x,hipY];
    const neck=[x+(droop*8+look*4+lean*30)*s,hipY-(118-droop*6)*s];
    const legs=[0,1].map(i=>{const sg=i?-1:1, sw=Math.sin(ph+(i?Math.PI:0))*(o.stride||1);
      const sk=[x+sg*-12*s+sw*14*s,hipY+60*s], sf=[x+sg*-24*s+sw*30*s,yF-13*s-Math.max(0,sw)*(o.lift||0)*s];
      const ck=o.chair?[x+(70+i*8)*s,hipY]:[x+(46+i*10)*s,hipY-30*s], cf=o.chair?[x+(78+i*8)*s,yF-13*s]:[x+(70+i*10)*s,yF-13*s];
      const rk=[x+sw*42*s,hipY+52*s-Math.max(0,sw)*22*s], rf=[x+sw*30*s-Math.max(0,-sw)*40*s,yF-13*s-Math.max(0,sw)*46*s];
      const k=[lerp(lerp(sk[0],ck[0],sit),rk[0],run),lerp(lerp(sk[1],ck[1],sit),rk[1],run)], f=[lerp(lerp(sf[0],cf[0],sit),rf[0],run),lerp(lerp(sf[1],cf[1],sit),rf[1],run)];
      return [hip,k,f];});
    const hx=neck[0]+(droop*16+look*12+lean*12)*s, hy=neck[1]-(50-droop*14)*s;
    const sh=[neck[0],neck[1]+20*s];const rs=Math.sin(ph)*run;
    const arm=(side,raise)=>{let a=side<0?lerp(Math.PI/2+.38,-Math.PI+Math.PI/5.2,raise):lerp(Math.PI/2-.38,-Math.PI/5.2,raise);a+=side*rs*.9*-1;
      let e=[sh[0]+Math.cos(a+side*.12)*55*s,sh[1]+Math.sin(a+side*.12)*55*s],h=[sh[0]+Math.cos(a)*104*s,sh[1]+Math.sin(a)*104*s];
      const mix=(k,E,H)=>{if(!k)return;e=[lerp(e[0],E[0],k),lerp(e[1],E[1],k)];h=[lerp(h[0],H[0],k),lerp(h[1],H[1],k)];};
      mix(o.cover||0,[sh[0]+side*48*s,sh[1]+30*s],[hx+side*12*s,hy+6*s]);
      mix(o.work||0,[sh[0]+40*s,sh[1]+50*s],[sh[0]+95*s,sh[1]+40*s+Math.sin((o.t||0)*20+side)*8*s]);
      mix(o.chin&&side>0?o.chin:0,[sh[0]+40*s,sh[1]+50*s],[hx+14*s,hy+34*s]);
      if(side>0){mix(o.point||0,[sh[0]+55*s,sh[1]-5*s],[sh[0]+110*s,sh[1]-15*s]);
        mix(o.headTouch||0,[sh[0]+55*s,sh[1]-20*s],[hx+28*s,hy-18*s]);
        mix(o.write||0,[sh[0]+45*s,sh[1]+45*s],[sh[0]+90*s+Math.sin((o.t||0)*14)*10*s,sh[1]+70*s]);
        mix(o.hold||0,[sh[0]+50*s,sh[1]+40*s],[sh[0]+88*s,sh[1]+10*s]);}
      if(side<0)mix(o.holdL||0,[sh[0]-50*s,sh[1]+40*s],[sh[0]-88*s,sh[1]+10*s]);
      return [sh,e,h];};
    const aL=arm(-1,o.raiseL||0),aR=arm(1,o.raise||0);F.hand=aR[2];F.handL=aL[2];
    const back=mixHex(col,"#000000",.22), rim=mixHex(col,"#000000",.55), W=24*s, O=W+6*s;
    const styleLimb=(L,pts,c)=>{setPL(L.o,pts);setPL(L.f,pts);L.o.setAttribute("stroke",rim);L.o.setAttribute("stroke-width",O);L.f.setAttribute("stroke",c);L.f.setAttribute("stroke-width",W);
      L.j.setAttribute("cx",pts[1][0]);L.j.setAttribute("cy",pts[1][1]);L.j.setAttribute("r",(W*.5).toFixed(1));L.j.setAttribute("fill",c);};
    styleLimb(legB,legs[0],back);styleLimb(armB,aL,back);
    const tp=[hip,[lerp(hip[0],neck[0],.5),lerp(hip[1],neck[1],.5)],[neck[0],neck[1]+8*s]];
    setPL(torsoO,tp);setPL(torsoF,tp);torsoO.setAttribute("stroke",rim);torsoO.setAttribute("stroke-width",44*s);torsoF.setAttribute("stroke",col);torsoF.setAttribute("stroke-width",38*s);
    setPL(torsoS,[[hip[0]+10*s*face*-1,hip[1]-4*s],[neck[0]+10*s*face*-1,neck[1]+16*s]]);torsoS.setAttribute("stroke","#000");torsoS.setAttribute("stroke-width",12*s);
    neckL.setAttribute("x1",neck[0]);neckL.setAttribute("y1",neck[1]+6*s);neckL.setAttribute("x2",lerp(neck[0],hx,.6));neckL.setAttribute("y2",lerp(neck[1],hy,.6));neckL.setAttribute("stroke",col);neckL.setAttribute("stroke-width",16*s);
    styleLimb(legF,legs[1],col);styleLimb(armF,aR,col);
    [[legs[0][2],back],[legs[1][2],col]].forEach(([p,c],i)=>{const fx=p[0],fy=p[1]+4*s;const L2=26*s*face;
      feet[i].setAttribute("d",`M${fx-8*s*face},${fy-9*s} L${fx+L2*.7},${fy-9*s} Q${fx+L2},${fy-9*s} ${fx+L2},${fy} Q${fx+L2},${fy+8*s} ${fx+L2*.7},${fy+8*s} L${fx-8*s*face},${fy+8*s} Q${fx-14*s*face},${fy} ${fx-8*s*face},${fy-9*s} Z`);
      feet[i].setAttribute("fill",c);feet[i].setAttribute("stroke",rim);feet[i].setAttribute("stroke-width",3*s);});
    [[aL[2],back],[aR[2],col]].forEach(([p,c],i)=>{hands[i].setAttribute("cx",p[0]);hands[i].setAttribute("cy",p[1]);hands[i].setAttribute("r",(15*s).toFixed(1));hands[i].setAttribute("fill",c);hands[i].setAttribute("stroke",rim);hands[i].setAttribute("stroke-width",3*s);});
    head.setAttribute("cx",hx);head.setAttribute("cy",hy);head.setAttribute("r",36*s);
    head.setAttribute("fill",o.blush?mixHex(col,"#FF6B5E",o.blush*.75):(col===C.white?"url(#headShade)":col));head.setAttribute("stroke",rim);head.setAttribute("stroke-width",4*s);
    headHi.setAttribute("cx",hx-12*s*face);headHi.setAttribute("cy",hy-14*s);headHi.setAttribute("r",9*s);headHi.setAttribute("opacity",col===C.white?.0:.25);
    const air=Math.max(0,GY-yF);shadow.setAttribute("cx",x);shadow.setAttribute("cy",GY+4);shadow.setAttribute("rx",(64*s*(1-Math.min(.6,air/400))).toFixed(1));
    shadow.setAttribute("opacity",(yF>GY+20||yF<GY-400?0:.5*(1-Math.min(.8,air/300))).toFixed(3));
  };
  return F;}
function pill(parent,x,y,str,col,w,size=22,h=52){const g=el("g",{opacity:0},parent);
  el("rect",{x:-w/2,y:-h/2,width:w,height:h,rx:h/2,fill:col===C.gold?"rgba(245,184,61,.08)":col===C.red?"rgba(255,69,58,.07)":"rgba(255,255,255,.04)",stroke:col,"stroke-width":3.5},g);
  txt(g,0,size*.36,str,size,{fill:col,"letter-spacing":size*.2,"font-weight":700});g.x=x;g.y=y;return g;}
const popAt=(g,t,a,b,base=1)=>{const k=eBack(P(t,a,a+.4))*(1-eIO(P(t,b,b+.3)));g.setAttribute("opacity",clamp(k).toFixed(3));g.setAttribute("transform",`translate(${g.x},${g.y}) scale(${(base*(.6+.4*clamp(k))).toFixed(3)})`);return k;};

/* headlines */
const heads=document.getElementById("heads");
V.HEADS.forEach(h=>{const d=document.createElement("div");d.className="hl";d.style.top=(h.top||290)+"px";h.words=[];
  h.lines.forEach(line=>{const ln=document.createElement("span");ln.className="ln";
    line.forEach(tok=>{const o=typeof tok==="string"?{t:tok}:tok;const w=document.createElement("span");w.className="w"+(o.gold?" gold":"")+(o.red?" red":"")+(o.mark?" mark":"");
      if(o.mark){w.innerHTML='<i></i><span>'+o.t+'</span>';w.bar=w.querySelector("i");w.txt=w.querySelector("span");}else w.textContent=o.t;
      ln.appendChild(w);h.words.push(w);});d.appendChild(ln);});heads.appendChild(d);});
(V.LABELS||[]).forEach(l=>{const d=document.createElement("div");d.className="label";d.style.top=(l.top||540)+"px";d.textContent=l.text;heads.appendChild(d);l.el=d;});

/* camera helpers: call inside render(t,K) */
const camFX={
  // ruhiges Handkamera-Schweben (immer an, ausschaltbar mit VIDEO.noDrift)
  drift(t,c,amt=1){c.dx+=(Math.sin(t*.7)*6+Math.sin(t*1.9)*2.5)*amt;c.dy+=(Math.cos(t*.53)*5+Math.sin(t*1.3)*2)*amt;c.rot=(c.rot||0)+Math.sin(t*.41)*.35*amt;},
  // Wackeln ab Zeitpunkten (Aufprall, Drop, Schock)
  shake(t,c,list,str=16,decay=6){list.forEach(a=>{if(t>=a){const k=Math.exp(-(t-a)*decay);c.dx+=Math.sin(t*93)*str*k;c.dy+=Math.cos(t*71)*str*.65*k;c.rot=(c.rot||0)+Math.sin(t*57)*1.2*k*str/16;}});},
  // Zoom-Stoß (Punch-in)
  punch(t,c,list,amt=.12,decay=6){list.forEach(a=>{if(t>=a)c.sc+=Math.exp(-(t-a)*decay)*amt;});},
  // Kamerafahrt zu einem Punkt (a→b Sekunden)
  dolly(t,c,a,b,to){const k=eIO(P(t,a,b));if(k<=0)return;c.sc=lerp(c.sc,to.sc||c.sc,k);c.cx=lerp(c.cx,to.cx??c.cx,k);c.cy=lerp(c.cy,to.cy??c.cy,k);c.rot=lerp(c.rot||0,to.rot||0,k);},
  // Reißschwenk (Whip-Pan) mit Bewegungsunschärfe-Gefühl
  whip(t,c,at,dir=1,dur=.35){const k=P(t,at-dur/2,at+dur/2);if(k>0&&k<1){const s=Math.sin(k*Math.PI);c.dx+=dir*s*420;c.rot=(c.rot||0)+dir*s*3;K.flash+=s*.15;}},
  // Kamera kippt leicht (Dutch angle) für Unruhe/Spannung
  tilt(t,c,a,b,deg=4){c.rot=(c.rot||0)+deg*win(t,a,b,.4,.4);},
};
const K={camFX,clamp,P,eOut,eExpo,eIO,eBack,lerp,el,txt,rnd,C,mixHex,win,pulses,grid,scene,bgfx,GY,makeFig,pill,popAt,spot,raysG,ground,FLOORH,dots,
  cam:{sc:1,cx:540,cy:1150,dx:0,dy:0}, flash:0, dim:0};
V.build(K);

function seek(t){t=clamp(t,0,V.DUR);
  STARS.forEach(s=>s.c.setAttribute("opacity",(s.o*(.6+.4*Math.sin(t*s.sp+s.ph))).toFixed(3)));
  V.HEADS.forEach(h=>h.words.forEach((w,i)=>{const p=eExpo(P(t,h.a+i*.05,h.a+i*.05+.7)),q=eIO(P(t,h.b,h.b+.3));
    w.style.opacity=(p*(1-q)).toFixed(3);w.style.transform=`translateY(${(1-p)*44-q*22}px)`;w.style.filter=`blur(${((1-p)*13+q*9).toFixed(2)}px)`;
    if(w.bar){const m=eIO(P(t,h.a+.2,h.a+.7));w.bar.style.transform=`scaleX(${m})`;w.txt.style.color=m>.5?"#070707":"";w.style.textShadow=m>.5?"none":"";}}));
  (V.LABELS||[]).forEach(l=>{const p=eOut(P(t,l.a,l.a+.4)),q=P(t,l.b,l.b+.3);l.el.style.opacity=(p*(1-q)).toFixed(3);l.el.style.transform=`translateY(${(1-p)*18}px)`;});
  K.cam={sc:1,cx:540,cy:1150,dx:0,dy:0,rot:0};K.flash=0;K.dim=0;K.floorScroll=0;
  K.endFade=1-eIO(P(t,V.DUR-.6,V.DUR));
  V.render(t,K);
  FLOORH.forEach((l,k)=>{const y=GY+14*Math.pow(1.48,k+(K.floorScroll?((t*K.floorScroll)%1):0));l.setAttribute("y1",y);l.setAttribute("y2",y);});
  const c=K.cam;if(!V.noDrift)camFX.drift(t,c,V.drift??1);
  cam.setAttribute("transform",`translate(${(c.cx+c.dx).toFixed(2)},${(c.cy+c.dy).toFixed(2)}) rotate(${(c.rot||0).toFixed(3)}) scale(${(c.sc*1.02).toFixed(4)}) translate(${-c.cx},${-c.cy})`);
  document.getElementById("flash").style.opacity=Math.min(.6,K.flash).toFixed(3);
  document.getElementById("dim").style.opacity=clamp(K.dim).toFixed(3);
}
const stage=document.getElementById("stage"),vo=document.getElementById("vo");
const isExport=/export/.test(location.search);if(isExport)document.body.classList.add("export");
function fit(){if(isExport){stage.style.transform="none";return;}const s=Math.min(innerWidth/1080,(innerHeight-60)/1920);stage.style.transform=`scale(${s})`;}
addEventListener("resize",fit);fit();
let playing=false,t0=performance.now(),cur=0;
const scrub=document.getElementById("scrub"),tl=document.getElementById("time"),pb=document.getElementById("play");
function frame(now){if(playing){cur=(now-t0)/1000;if(cur>=V.DUR){cur=0;t0=now;vo.currentTime=0;}}seek(cur);scrub.value=cur;tl.textContent=cur.toFixed(2)+" s";requestAnimationFrame(frame);}
pb.onclick=()=>{playing=!playing;pb.textContent=playing?"Pause":"Play ▶";t0=performance.now()-cur*1000;if(playing){vo.currentTime=cur;vo.play().catch(()=>{});}else vo.pause();};
document.getElementById("restart").onclick=()=>{cur=0;t0=performance.now();vo.currentTime=0;};
scrub.oninput=()=>{cur=+scrub.value;t0=performance.now()-cur*1000;vo.currentTime=cur;};
document.getElementById("safeBtn").onclick=()=>{const s=document.getElementById("safe");s.style.display=s.style.display==="block"?"none":"block";};
window.seek=seek;window.DUR=V.DUR;
function fitHeads(){document.querySelectorAll(".hl").forEach(d=>{d.style.fontSize="";let w=0;d.querySelectorAll(".ln").forEach(l=>w=Math.max(w,l.scrollWidth));if(w>860)d.style.fontSize=(84*860/w).toFixed(1)+"px";});}
document.fonts.ready.then(()=>{fitHeads();window.READY=true;if(!isExport)requestAnimationFrame(frame);else seek(0);});
})();
