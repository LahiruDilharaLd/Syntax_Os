/* CYBEROPS console engine – all data is fictional. Started by auth.js after login. */
(()=>{
"use strict";
/* ---------- helpers ---------- */
const $=id=>document.getElementById(id), R=n=>Math.floor(Math.random()*n), P=a=>a[R(a.length)];
const pad=n=>String(n).padStart(2,"0"), clock=()=>{const d=new Date();return pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds())};
// only reserved/private ranges: 10.x, 192.168.x, 203.0.113.x
const ip=()=>P([()=>`10.${R(256)}.${R(256)}.${1+R(254)}`,()=>`192.168.${R(256)}.${1+R(254)}`,()=>`203.0.113.${1+R(254)}`])();
const hex=n=>Array.from({length:n},()=>pad(R(256).toString(16)).slice(-2).padStart(2,"0")).join(" ");
const S={paused:false,mult:1,sound:false,themes:["green","amber","blue","red"],ti:0,t0:Date.now(),booted:false};
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* ---------- sound (Web Audio, off by default) ---------- */
let ac=null,lastB=0;
function beep(f=880,d=.04,v=.03){
 if(!S.sound||S.paused)return; const n=performance.now(); if(n-lastB<60)return; lastB=n;
 try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();
 o.frequency.value=f;o.type="square";g.gain.value=v;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d);}catch(e){}
}

/* ---------- event log ---------- */
const logf=$("logf"), pktf=$("pktf");
const T=[
 ["INFO",()=>`Handshake completed with node ${ip()}`],["INFO",()=>`Port scan ${P([22,80,443,3306,8080,5432])}/tcp open on ${ip()}`],
 ["INFO",()=>`Resolving gateway-${pad(R(30))}.lab.invalid`],["INFO",()=>`Tunnel ${hex(2).replace(" ","")} established via proxy-${R(9)}`],
 ["OK",()=>"Credential vault decrypted (SIMULATED)"],["OK",()=>`Firewall rule bypassed on gateway-${pad(R(20))}`],
 ["OK",()=>`Session token accepted by ${ip()}`],["OK",()=>`Payload staged: ${R(900)+100} KB (fake)`],
 ["WARN",()=>`Latency spike ${R(400)+120} ms on hop ${R(12)}`],["WARN",()=>`IDS signature match on ${ip()}`],["WARN",()=>`Retrying auth, attempt ${R(5)+2}/8`],
 ["ALERT",()=>`Intrusion countermeasure triggered at ${ip()}`],["ALERT",()=>`Trace detected, rotating proxy chain`]
];
function addLine(box,cls,txt,max){
 const d=document.createElement("div");d.className=cls;d.textContent=txt;box.appendChild(d);
 while(box.childNodes.length>max)box.removeChild(box.firstChild);box.scrollTop=box.scrollHeight;
}
function logLine(){
 const w=R(100),t=w<40?P(T.filter(x=>x[0]=="INFO")):w<75?P(T.filter(x=>x[0]=="OK")):w<93?P(T.filter(x=>x[0]=="WARN")):P(T.filter(x=>x[0]=="ALERT"));
 const d=document.createElement("div");d.className=t[0];d.innerHTML=`<span class="ts">[${clock()}]</span> ${t[0].padEnd(5," ")} `;
 d.appendChild(document.createTextNode(t[1]()));logf.appendChild(d);
 while(logf.childNodes.length>200)logf.removeChild(logf.firstChild);logf.scrollTop=logf.scrollHeight;
 if(t[0]=="ALERT")beep(300,.1);else if(t[0]=="OK")beep(1200,.03);
}
function pktLine(){
 const pr=P(["TCP","TCP","UDP","TLS","DNS"]);
 addLine(pktf,Math.random()<.18?"PACKET-HOT":"INFO",`${ip()}:${1024+R(60000)} -> ${ip()}:${P([22,53,80,443,8443])} ${pr} ${R(1400)+40}B [${P(["SYN","ACK","PSH","FIN","SYN,ACK"])}] ${hex(6)}`,80);
 thr.push(R(100));if(thr.length>90)thr.shift();
}
// self-rescheduling loops: random delay, scaled by intensity, stop while paused
function loop(fn,min,max){(function go(){if(!S.paused&&S.booted)fn();setTimeout(go,(min+R(max-min))*S.mult)})()}

/* ---------- throughput graph ---------- */
const thr=[],pg=$("pktg");
function fit(c){const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);c.width=Math.max(1,r.width*d);c.height=Math.max(1,r.height*d);return d}
function drawThr(){
 const c=pg,x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);x.fillStyle=css("--acc");
 const w=c.width/90;thr.forEach((v,i)=>{const h=v/100*c.height;x.globalAlpha=.4+v/170;x.fillRect(i*w,c.height-h,w-1,h)});x.globalAlpha=1;
}

/* ---------- radar / network map ---------- */
const rc=$("radar"),rx=rc.getContext("2d");let nodes=[],links=[],ang=0,scans=0,compromised=0;
function addNode(){
 if(nodes.length>=26)nodes.shift();
 const a=Math.random()*6.283,r=.12+Math.random()*.85;
 nodes.push({a,r,ip:ip(),life:0,flash:0,bad:false});
 const n=nodes[nodes.length-1];if(nodes.length>1)links.push({a:n,b:P(nodes.slice(0,-1)),p:0});
 links=links.filter(l=>nodes.includes(l.a)&&nodes.includes(l.b));
}
function radar(){
 const d=rc.width,h=rc.height,cx=d/2,cy=h/2,R0=Math.min(cx,cy)-14,ac1=css("--acc"),ln=css("--line");
 rx.clearRect(0,0,d,h);rx.lineWidth=1;rx.strokeStyle=ln;
 for(let i=1;i<=4;i++){rx.beginPath();rx.arc(cx,cy,R0*i/4,0,6.283);rx.stroke()}
 rx.beginPath();rx.moveTo(cx-R0,cy);rx.lineTo(cx+R0,cy);rx.moveTo(cx,cy-R0);rx.lineTo(cx,cy+R0);rx.stroke();
 if(!S.paused)ang+=.025/Math.max(S.mult,.4);
 // sweep trail
 for(let i=0;i<24;i++){rx.strokeStyle=ac1;rx.globalAlpha=(1-i/24)*.35;rx.beginPath();rx.moveTo(cx,cy);rx.lineTo(cx+Math.cos(ang-i*.025)*R0,cy+Math.sin(ang-i*.025)*R0);rx.stroke()}
 rx.globalAlpha=1;
 const pos=n=>[cx+Math.cos(n.a)*n.r*R0,cy+Math.sin(n.a)*n.r*R0];
 links.forEach(l=>{const[a,b]=[pos(l.a),pos(l.b)];if(!S.paused&&l.p<1)l.p+=.02;
  rx.strokeStyle=css("--acc2");rx.globalAlpha=.55;rx.setLineDash([4,4]);rx.lineDashOffset=-performance.now()/60;
  rx.beginPath();rx.moveTo(a[0],a[1]);rx.lineTo(a[0]+(b[0]-a[0])*l.p,a[1]+(b[1]-a[1])*l.p);rx.stroke();rx.setLineDash([]);rx.globalAlpha=1});
 rx.font=Math.max(9,d/70)+"px monospace";
 nodes.forEach(n=>{
  const[x,y]=pos(n);const diff=((ang-n.a)%6.283+6.283)%6.283;
  if(!S.paused&&diff<.05&&n.flash<=0){n.flash=1;scans++}
  n.flash=Math.max(0,n.flash-.02);
  rx.fillStyle=n.bad?css("--bad"):ac1;rx.shadowColor=rx.fillStyle;rx.shadowBlur=6+n.flash*18;
  rx.beginPath();rx.arc(x,y,3+n.flash*4,0,6.283);rx.fill();rx.shadowBlur=0;
  rx.fillStyle=css("--fg");rx.globalAlpha=.7;rx.fillText(n.ip,x+7,y+3);rx.globalAlpha=1});
 $("cN").textContent=nodes.length;$("cL").textContent=links.length;$("cS").textContent=scans;$("cF").textContent=nodes.filter(n=>n.bad).length;
}

/* ---------- local system (REAL) ---------- */
function sys(){
 const rows=[["Status",navigator.onLine?"online":"offline"],["Language",navigator.language],["Screen",`${screen.width}x${screen.height}`],
 ["Window",`${innerWidth}x${innerHeight}`],["Timezone",Intl.DateTimeFormat().resolvedOptions().timeZone],
 ["Platform",navigator.userAgentData?.platform||navigator.platform||"n/a"],["Pixel ratio",devicePixelRatio],["CPU threads",navigator.hardwareConcurrency||"n/a"],["Memory hint",navigator.deviceMemory?`${navigator.deviceMemory} GB`:"n/a"],["Touch points",navigator.maxTouchPoints??0],["Cookies",navigator.cookieEnabled?"enabled":"disabled"],["Color depth",`${screen.colorDepth}-bit`],["Connection",navigator.connection?.effectiveType||"n/a"]];
 $("sys").innerHTML=rows.map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join("");
}

/* ---------- remote telemetry (SIMULATED random walk) ---------- */
const G=[{n:"CPU",v:55,u:"%",min:0,max:100,step:8},{n:"RAM",v:48,u:"%",min:0,max:100,step:5},{n:"NET",v:30,u:"Mb/s",min:0,max:100,step:10},{n:"LAT",v:40,u:"ms",min:10,max:250,step:22},{n:"GPU",v:34,u:"%",min:0,max:100,step:11},{n:"TEMP",v:56,u:"°C",min:35,max:90,step:2.5},{n:"LOSS",v:0.6,u:"%",min:0,max:8,step:.75},{n:"DISK",v:68,u:"%",min:0,max:100,step:3},{n:"VRAM",v:42,u:"%",min:0,max:100,step:9}].map(g=>({...g,h:[]}));
$("gs").innerHTML=G.map((g,i)=>`<div class="g"><span>${g.n}</span><canvas id="sp${i}"></canvas><span id="gv${i}" class="v"></span></div>`).join("");
function tele(){
 G.forEach((g,i)=>{g.v=Math.min(g.max,Math.max(g.min,g.v+(Math.random()-.5)*g.step*(S.mult<.7?2:1)));g.h.push(g.v);if(g.h.length>60)g.h.shift();
  $("gv"+i).textContent=(g.n==="TEMP"?g.v.toFixed(1):g.v.toFixed(g.n==="LOSS"?1:0))+g.u;
  const c=$("sp"+i),x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);x.strokeStyle=css("--acc");x.lineWidth=1.5;x.beginPath();
  g.h.forEach((v,k)=>{const px=k/59*c.width,py=c.height-(v-g.min)/(g.max-g.min)*c.height;k?x.lineTo(px,py):x.moveTo(px,py)});x.stroke()});
}

/* ---------- active operations ---------- */
const NAMES=["Subnet sweep","Hash crack","Data exfil (fake)","Proxy chain rotate","Port enumeration","Cert forge (sim)","Mesh handshake","Log scrub (fake)","Packet replay","Vault unseal (sim)","Signal triangulation","Key rotation","Cache flush (sim)","Route optimization","Integrity audit"];
let jobs=[];
function newJob(){return{n:P(NAMES),p:0,s:.15+Math.random()*.9,done:0}}
function renderJobs(){
 $("jobs").innerHTML=jobs.map(j=>`<div class="job ${j.done?"done":""}"><span>${j.n}</span><div class="bar"><i style="width:${j.p}%"></i></div><em>${j.done?"COMPLETE":j.p.toFixed(0)+"%"}</em></div>`).join("");
}
function tickJobs(){
 jobs.forEach((j,i)=>{
  if(j.done){if(--j.done<=0)jobs[i]=newJob()}   // show COMPLETE ~2 s, then swap in a new random job
  else{j.p+=j.s/S.mult;if(j.p>=100){j.p=100;j.done=8;logRaw("OK",`Job finished: ${j.n}`)}}});
 renderJobs();
}
function logRaw(c,t){const d=document.createElement("div");d.className=c;d.innerHTML=`<span class="ts">[${clock()}]</span> ${c.padEnd(5," ")} `;d.appendChild(document.createTextNode(t));logf.appendChild(d);logf.scrollTop=logf.scrollHeight}

/* ---------- random events every 20-40 s ---------- */
const ban=$("banner");
function banner(cls,txt){ban.className="show "+cls;ban.textContent=txt;setTimeout(()=>ban.className="",1800)}
function event(){
 if(!S.paused){
  const k=R(3);
  if(k==0){banner("ALERT","!! ALERT !!");logRaw("ALERT","Perimeter breach flagged (SIMULATED)");beep(220,.4,.05)}
  else if(k==1){banner("OK","ACCESS GRANTED");logRaw("OK","Root session granted (SIMULATED)");beep(1000,.15);setTimeout(()=>beep(1500,.2),160);const n=P(nodes);if(n)n.bad=true}
  else{const j=P(jobs);if(j&&!j.done)j.p=99.5}
 }
 setTimeout(event,(20000+R(20000)));
}

/* ---------- boot sequence (typewriter ~3 s) ---------- */
function boot(){
 const lines=["CYBEROPS kernel 4.2","mounting virtual interfaces ........ OK","loading security modules ........... OK","calibrating radar array ............. OK","synchronizing event stream .......... OK","operator: <Syntax>","starting console..."];
 const b=$("boot");let li=0,ci=0;
 const iv=setInterval(()=>{
  if(li>=lines.length){clearInterval(iv);setTimeout(start,250);return}
  b.textContent+=lines[li][ci++]||"";
  if(ci>lines[li].length){b.textContent+="\n";li++;ci=0}
 },3000/lines.join("").length);
}
function start(){
 $("boot").remove();S.booted=true;S.t0=Date.now();
 $("target").textContent=`10.${R(256)}.${R(256)}.0/24`;
 for(let i=0;i<8;i++)addNode();jobs=Array.from({length:7},newJob);
 for(let i=0;i<14;i++)logLine();
 loop(logLine,150,900);loop(pktLine,40,160);loop(()=>addNode(),1500,4000);
 setInterval(()=>{if(!S.paused)tickJobs()},250);setInterval(()=>{if(!S.paused)tele()},300);
 setTimeout(event,20000+R(20000));
}

/* ---------- controls ---------- */
const con=$("console");
async function fullscreen(){try{if(document.fullscreenElement){await document.exitFullscreen();document.body.classList.remove("immersive")}else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen();document.body.classList.remove("immersive")}else document.body.classList.toggle("immersive");}catch(e){document.body.classList.toggle("immersive")}const label=document.fullscreenElement||document.body.classList.contains("immersive")?"Exit fullscreen":"Fullscreen";$("fs").textContent=label;const envButton=$("hfs");if(envButton)envButton.textContent=label}
function theme(){S.ti=(S.ti+1)%4;document.documentElement.dataset.theme=S.themes[S.ti]}
function pause(){S.paused=!S.paused;$("badge").textContent=S.paused?"PAUSED":"ONLINE";$("pause").setAttribute("aria-pressed",S.paused);$("pause").textContent=S.paused?"Resume":"Pause"}
function intensity(n){S.mult=[2.2,1,.35][n-1]}
$("fs").onclick=fullscreen;$("thm").onclick=theme;$("pause").onclick=pause;$("speed").onchange=e=>intensity(+e.target.value);$("export").onclick=()=>{const rows=[...logf.children].map(x=>x.innerText);const blob=new Blob(["CYBEROPS SIMULATION LOG (fictional)"+String.fromCharCode(10)+rows.join(String.fromCharCode(10))],{type:"text/plain"});const a=document.createElement("a"),u=URL.createObjectURL(blob);a.href=u;a.download="cyberops-simulated-log-"+new Date().toISOString().replace(/[:.]/g,"-")+".txt";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
$("snd").onclick=e=>{S.sound=!S.sound;e.target.setAttribute("aria-pressed",S.sound);beep(900)};
addEventListener("keydown",e=>{
 if(e.key==="Escape"&&document.body.classList.contains("immersive")){document.body.classList.remove("immersive");$("fs").textContent="Fullscreen";const envButton=$("hfs");if(envButton)envButton.textContent="Fullscreen";return}
 if(document.body.classList.contains("locked")||/INPUT|TEXTAREA/.test(e.target.tagName))return;
 if(e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();
 if(k=="f")fullscreen();else if(k=="p")pause();else if(k=="t")theme();else if(k=="h")document.body.classList.toggle("nohead");
 else if("123".includes(k)&&k)intensity(+k);
});
// hide cursor after 3 s of inactivity while fullscreen
let ct;addEventListener("mousemove",()=>{document.body.classList.remove("nocursor");clearTimeout(ct);
 if(document.fullscreenElement)ct=setTimeout(()=>document.body.classList.add("nocursor"),3000)});
document.addEventListener("fullscreenchange",()=>{document.body.classList.remove("nocursor");if(!document.fullscreenElement)document.body.classList.remove("immersive");const label=document.fullscreenElement||document.body.classList.contains("immersive")?"Exit fullscreen":"Fullscreen";$("fs").textContent=label;const envButton=$("hfs");if(envButton)envButton.textContent=label});
// pause everything when tab hidden
let wasP=false;document.addEventListener("visibilitychange",()=>{if(document.hidden){wasP=S.paused;S.paused=true}else{S.paused=wasP}});
setInterval(()=>{const d=new Date();$("localclock").textContent=pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds());if(!S.paused&&S.booted){const s=Math.floor((Date.now()-S.t0)/1000);$("timer").textContent=pad(s/3600|0)+":"+pad(s/60%60|0)+":"+pad(s%60)}},500);
addEventListener("online",sys);addEventListener("offline",sys);

/* ---------- render loop (requestAnimationFrame) ---------- */
function resize(){fit(rc);fit(pg);G.forEach((_,i)=>fit($("sp"+i)));sys()}
addEventListener("resize",resize);
(function frame(){if(S.booted){radar();drawThr()}requestAnimationFrame(frame)})();
resize();
window.CyberOps={start(){resize();boot()},toggleFullscreen:fullscreen}; // called by auth.js after a successful login
})();
