/* Syntax Hacker OS - 100% simulated. No shell, no network, no real tools. Storage: localStorage only. */
(()=>{"use strict";
const q=(s,e=document)=>e.querySelector(s),R=n=>Math.floor(Math.random()*n),P=a=>a[R(a.length)],pad=n=>String(n).padStart(2,"0"),last=a=>a[a.length-1];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const clk=()=>{const d=new Date();return pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds())};
const el=(h,p)=>{const d=document.createElement("div");d.innerHTML=h.trim();const n=d.firstChild;p&&p.appendChild(n);return n};
const PL=s=>{const m=/^([iowe]):(.*)$/.exec(s);return m?[{i:"INFO",o:"OK",w:"WARN",e:"ALERT"}[m[1]],m[2]]:["",s]};
/* ---------- persistence ---------- */
const KEY="syntaxos:v1",DEF={set:{boot:true,note:true,theme:"",keyboard:true},hist:[],cfg:{},sims:[],fs:null,win:{},open:[]};
let D;try{D=Object.assign({},JSON.parse(JSON.stringify(DEF)),JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){D=JSON.parse(JSON.stringify(DEF))}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}};
const sim=(n,tg,s)=>{D.sims.push({t:Date.now(),n,tg,s});D.sims=D.sims.slice(-40);save()};
/* ---------- fictional data ---------- */
const HASH={"a1b2c3d4e5f60718293a4b5c6d7e8f90":"sunshine42","0f1e2d3c4b5a69788796a5b4c3d2e1f0":"letmein-sim","9a8b7c6d5e4f30211203f4e5d6c7b8a9":"blue-falcon7"};
const H=(p,a)=>a.map(([o,n,os,ports])=>({ip:p+o,n,os,mac:"02:5e:11:a0:00:"+o.toString(16).padStart(2,"0"),p:ports}));
const SC={"Corp LAN":H("10.13.37.",[[1,"gw-core","Aegis OS 4.1",[[22,"ssh"],[443,"https"]]],[10,"fs-01","Nimbus Linux 7",[[22,"ssh"],[445,"smb"],[3306,"mysql"]]],[22,"web-02","Vortex Server 12",[[80,"http"],[443,"https"],[8080,"http-alt"]]],[40,"ws-114","Pane OS 11",[[135,"msrpc"],[3389,"rdp"]]]]),
"Home Network":H("192.168.77.",[[1,"router","FiberOS 2",[[53,"dns"],[80,"http"]]],[20,"media-box","Lumen TV OS",[[8008,"http-alt"],[9000,"cslistener"]]],[31,"laptop-kim","Pane OS 11",[[445,"smb"]]],[44,"cam-front","TinyCam FW 3",[[554,"rtsp"],[80,"http"]]]]),
"Data Center":H("203.0.113.",[[5,"lb-01","Aegis OS 4.1",[[80,"http"],[443,"https"]]],[17,"db-main","Nimbus Linux 7",[[5432,"postgresql"],[22,"ssh"]]],[18,"db-replica","Nimbus Linux 7",[[5432,"postgresql"]]],[60,"cache-02","Vortex Server 12",[[6379,"redis"],[22,"ssh"]]]])};
const AIP=()=>P(P(Object.values(SC))).ip;
/* ---------- the 20 simulated tools (s = script, r = results; tokens {t}{o}{f}{n}{p}{i}{pw}{nh}, @hosts, @ports) ---------- */
const T=[
{id:"nmap",n:"Nmap",d:"Network Scanner",ic:"◎",o:["Profile",["Quick scan","Full port scan","Service + OS detect"]],f:["Ports","1-1024"],s:["i:Starting Nmap (SIMULATED) {o} against {t}","i:Host discovery on scenario network...","@hosts","i:Scanning ports {f}","@ports","o:Done: {nh} hosts up (fictional data)"],r:["@ports"]},
{id:"msf",n:"Metasploit",d:"Exploitation Framework (fictional modules)",ic:"☠",x:1},
{id:"wire",n:"Wireshark",d:"Packet Analyzer (generated packets)",ic:"≋",x:1},
{id:"aircrack",n:"Aircrack-ng",d:"Wi-Fi Security Suite",ic:"⌁",o:["Interface",["wlan0mon (sim)","wlan1mon (sim)"]],f:["ESSID","LabNet-5G"],s:["i:aircrack-ng (SIMULATED) on {o}","i:Scanning channels 1-13: {n} fictional APs","o:Target {f}  BSSID 02:5e:aa:00:10:01  WPA2-PSK","w:Capturing handshake... {n} frames","o:KEY FOUND (sample): [ lab-wifi-pass ]"],r:["ESSID {f}","Encryption WPA2-PSK (fictional)","Sample key: lab-wifi-pass"]},
{id:"john",n:"John the Ripper",d:"Password Recovery Simulator",ic:"⚿",h:1,o:["Hash format",["md5","sha1","ntlm","sha256"]],f:["Sample hash","a1b2c3d4e5f60718293a4b5c6d7e8f90"],s:["i:John the Ripper (SIMULATED) loaded 1 {o} hash","i:Wordlist: fictional-lite.txt (12000 words)","w:Speed {n}K c/s (simulated)","o:Cracked: {pw}"],r:["Hash {f}","Recovered: {pw}"]},
{id:"hashcat",n:"Hashcat",d:"GPU Password Recovery Simulator",ic:"⚙",h:1,o:["Mode",["0 md5","100 sha1","1000 ntlm","1400 sha256"]],f:["Sample hash","0f1e2d3c4b5a69788796a5b4c3d2e1f0"],s:["i:hashcat (SIMULATED) mode {o}","i:Device #1: Fictional GPU X-9000","w:Speed {n} MH/s  Time.Estimated: 00:{p}s","o:Recovered {f}:{pw}"],r:["{f}","{pw}"]},
{id:"burp",n:"Burp Suite",d:"Web Application Testing Simulator",ic:"⛨",o:["Module",["Spider","Scanner","Repeater"]],f:["URL","http://shop.lab.invalid/"],s:["i:Burp Suite (SIMULATED) {o} on {f}","o:Crawled {n} fictional URLs","w:Reflected parameter 'q' flagged (sample)","w:Session cookie missing flags (sample)","o:Report ready: 2 medium, 3 low"],r:["Medium: reflected parameter q","Medium: weak cookie flags","Low: missing headers"]},
{id:"sqlmap",n:"SQLmap",d:"SQL Injection Testing Simulator",ic:"⛁",o:["Level",["1","3","5"]],f:["URL","http://shop.lab.invalid/item?id=1"],s:["i:sqlmap (SIMULATED) testing {f} level {o}","o:parameter 'id' appears injectable (sample)","i:back-end DBMS: FictionalSQL 9","o:Tables: users, orders, sessions (fake)"]},
{id:"hydra",n:"Hydra",d:"Login Security Testing Simulator",ic:"⚔",o:["Service",["ssh","ftp","http-form","rdp"]],f:["User list","fictional-users.txt"],s:["i:Hydra (SIMULATED) {o}://{t} users {f}","w:Attempt {n}/1000 ...","w:Attempt {n}/1000 ...","o:[{p}][{o}] host: {t} login: demo password: sample-pass (fictional)"]},
{id:"medusa",n:"Medusa",d:"Parallel Login Testing Simulator",ic:"☍",o:["Threads",["4","16","64"]],f:["Module","ssh"],s:["i:Medusa (SIMULATED) {f} on {t} threads={o}","w:ACCOUNT CHECK: demo / pass{n} (failed)","w:ACCOUNT CHECK: demo / pass{n} (failed)","o:ACCOUNT FOUND: [{f}] User: demo Password: sample-pass [SUCCESS (fictional)]"]},
{id:"nikto",n:"Nikto",d:"Web Server Scanner",ic:"⚑",o:["Tuning",["Default","Headers only","Full"]],f:["Host","shop.lab.invalid"],s:["i:Nikto (SIMULATED) target {f} tuning {o}","i:Fictional banner: SimHTTPd/2.4","w:Missing header: X-Content-Type-Options","w:Directory listing at /backup/ (sample)","o:{n} items checked, 3 findings"]},
{id:"ettercap",n:"Ettercap",d:"Network Traffic Simulation",ic:"⇄",o:["View",["Flow summary","Host list"]],f:["Filter","tcp"],s:["i:Traffic SIMULATION ({o}) filter={f}","i:Generating sample flows (no live traffic touched)","{i} <-> {i}  {p}/tcp  {n} pkts","{i} <-> {i}  53/udp  {n} pkts","o:Simulation complete"]},
{id:"maltego",n:"Maltego",d:"OSINT and Link Analysis",ic:"⌖",o:["Entity",["Domain","Person","Email","Organization"]],f:["Seed","lab.invalid"],s:["i:OSINT graph (SIMULATED) seed {f}","i:Transform: {o} -> related entities (fictional)","o:Found: mail.{f}, vpn.{f}, dev.{f}","o:Linked person: Alex Doe (fictional)","o:Graph: {n} nodes, {p} edges"]},
{id:"autopsy",n:"Autopsy",d:"Digital Forensics",ic:"⌕",o:["Module",["File carving","Timeline","Keyword search"]],f:["Disk image","sample-disk.img"],s:["i:Forensics (SIMULATED) on {f}","i:Module: {o}","o:Parsed {n} fictional file records","w:Deleted file recovered: report_draft.txt (sample)","o:Report written to /tools/autopsy-report.txt (sim)"]},
{id:"reaver",n:"Reaver",d:"WPS Security Testing Simulator",ic:"⚡",o:["WPS mode",["Pin audit","Status only"]],f:["ESSID","LabNet-2G"],s:["i:WPS audit (SIMULATED) on {f}","w:Testing sample PIN {n}... ({o})","w:AP rate-limit simulated (locked 60s)","o:Audit finished: WPS enabled, weak config (fictional)"]},
{id:"kismet",n:"Kismet",d:"Wireless Network Detection Simulator",ic:"☰",o:["Band",["2.4 GHz","5 GHz","Both"]],f:["SSID filter","*"],s:["i:Wireless detection (SIMULATED) band {o}","o:AP LabNet-5G ch36 -52dBm WPA2","o:AP GuestWiFi ch6 -67dBm Open (fictional)","w:Hidden SSID ch11 -75dBm","o:{n} fictional devices seen"]},
{id:"beef",n:"BeEF",d:"Browser Security Simulation",ic:"✇",o:["Scenario",["Demo page","Training lab"]],f:["Browser name","demo-browser"],s:["i:Browser security simulation (SIMULATED) {o}","o:Fictional browser online: {f}-1","w:Policy check: mixed content warning (sample)","o:Report: 2 findings on training page"]},
{id:"netcat",n:"Netcat",d:"Network Utility Simulator",ic:"⌨",o:["Mode",["listen","connect"]],f:["Port","4444"],s:["i:netcat (SIMULATED local loopback) {o} on port {f}","o:sim-socket://{t}:{f} ready","i:< hello from simulated peer","i:> ack","o:Connection closed"]},
{id:"gobuster",n:"Gobuster",d:"Directory and DNS Discovery Simulator",ic:"⌘",o:["Mode",["dir","dns"]],f:["Wordlist","fictional-common.txt"],s:["i:Gobuster (SIMULATED) mode {o} {t}","o:/admin (Status: 302)","o:/images (Status: 301)","w:/backup (Status: 403)","o:Finished: 3 entries"]},
{id:"responder",n:"Responder",d:"Name-resolution event analysis",ic:"☢",o:["Mode",["Analyze only","Event log"]],f:["Interface","eth0-sim"],s:["i:Name-resolution event stream ({o}) on {f}","w:LLMNR query for 'fileshare' from {i}","w:NBT-NS query for 'printer' from {i}","o:{n} events logged"]},
{id:"zeek",n:"Zeek",d:"Protocol and connection analysis",ic:"⌁",o:["Log",["conn.log","dns.log","http.log"]],f:["Interface","eth0-sim"],s:["i:Loading {o} event stream from {f}","o:{n} connections summarized","i:DNS query host{p}.lab.invalid -> 203.0.113.{n}","w:Unusual connection duration on {i}","o:Session records refreshed"]},
{id:"suricata",n:"Suricata",d:"Rule based alert monitor",ic:"◉",o:["Rule set",["Balanced","Performance","Threat focused"]],f:["Interface","eth0-sim"],s:["i:Starting alert monitor with {o} rules","o:Flow {n} established: {i} -> {t}","w:Rule ET-SAMPLE-{p} threshold event","i:Alert counters updated","o:Monitor cycle complete"]},
{id:"yara",n:"YARA",d:"Pattern matching on sample files",ic:"⌗",o:["Rule pack",["malware-demo","webshell-demo","credential-demo"]],f:["Sample path","/samples/demo.bin"],s:["i:Loading rule pack {o}","i:Reading inert sample {f}","w:Rule SAMPLE_{n} matched a demo marker","o:Scan summary refreshed","i:Watching sample directory"]},
{id:"osquery",n:"osquery",d:"Endpoint query monitor",ic:"▤",o:["Query group",["processes","network","packages"]],f:["Interval","5s"],s:["i:Query group {o} scheduled every {f}","o:Returned {n} fictional rows","i:Process snapshot updated","w:New sample event from syntax-system","o:Monitor cycle complete"]}];
const CORE=[{id:"term",n:"Terminal",d:"Shell emulator",ic:">_"},{id:"files",n:"File Manager",d:"Virtual files",ic:"▤"},{id:"proc",n:"Processes",d:"Process manager",ic:"▦"},{id:"net",n:"Network Monitor",d:"Live traffic graph",ic:"⇅"},{id:"sys",n:"System Info",d:"About this OS",ic:"ⓘ"},{id:"apps",n:"Tool Library",d:"All apps and tools",ic:"▣"},{id:"set",n:"Settings",d:"Preferences",ic:"✱"}];
const ALL=CORE.concat(T);
function expand(A,c){const hs=SC[c.sc]||SC["Corp LAN"],pw=HASH[c.f],v={t:c.t,o:c.o,f:c.f,pw:pw||"NOT FOUND",nh:hs.length},o=[];
 A.forEach(l=>{if(l==="@hosts")hs.forEach(h=>o.push(`o:${h.ip}  (${h.n})  up  MAC ${h.mac}  OS: ${h.os}`));else if(l==="@ports")hs.forEach(h=>h.p.forEach(([p,s])=>o.push(`${h.ip}  ${p}/tcp  open  ${s}`)));
 else o.push(l.replace(/\{(\w+)\}/g,(m,k)=>k==="n"?R(900)+100:k==="p"?P([22,80,443,445,8080]):k==="i"?P(hs).ip:v[k]!==undefined?v[k]:m))});return o}
const gen=(d,c)=>d.h&&!HASH[c.f]?expand(d.s.slice(0,2),c).concat(["w:Wordlist exhausted","e:Status: EXHAUSTED - no match (sample hashes only)"]):expand(d.s,c);
const resL=(d,c)=>expand(d.h&&!HASH[c.f]?["No password recovered (sample hashes only)"]:(d.r||d.s.slice(-2)),c).map(s=>PL(s)[1]);
const TA={nmap:"nmap","aircrack-ng":"aircrack",john:"john",hashcat:"hashcat",sqlmap:"sqlmap",hydra:"hydra",medusa:"medusa",nikto:"nikto",ettercap:"ettercap",maltego:"maltego",autopsy:"autopsy",reaver:"reaver",kismet:"kismet",beef:"beef",netcat:"netcat",nc:"netcat",gobuster:"gobuster",responder:"responder",burpsuite:"burp",zeek:"zeek",suricata:"suricata",yara:"yara",osquery:"osquery"};
const toolCmd=(id,a)=>{const d=T.find(x=>x.id===id),c={sc:"Corp LAN",t:a[0]||SC["Corp LAN"][0].ip,o:d.o[1][0],f:d.f[1]};if(d.h&&a[0])c.f=a[0];return gen(d,c).concat(["i:-- results --"],resL(d,c))};
/* ---------- virtual file system ---------- */
const dir=c=>({c,m:Date.now()-R(8e8)}),fl=t=>({t,m:Date.now()-R(8e8)});
const mkfs=()=>dir({home:dir({syntax:dir({"notes.txt":fl("Sandbox notes. Everything here is simulated.\n"),"targets.lst":fl("10.13.37.10\n10.13.37.22\n")})}),root:dir({}),etc:dir({hostname:fl("syntax-system\n"),"os-release":fl('NAME="Syntax Hacker OS"\nSIMULATION=yes\n')}),var:dir({log:dir({"sim.log":fl("[ok] simulated boot\n")})}),tmp:dir({}),opt:dir({}),usr:dir({bin:dir({})}),bin:dir({}),downloads:dir({"sample-hashes.txt":fl(Object.keys(HASH).join("\n")+"\n")}),documents:dir({"readme.txt":fl("Syntax Hacker OS is a simulation by <Syntax/>.\n")}),tools:dir({})});
if(!D.fs)D.fs=mkfs();
const norm=(p,cwd)=>{const o=[];(p[0]==="/"?p:cwd+"/"+p).split("/").forEach(s=>{if(!s||s===".")return;s===".."?o.pop():o.push(s)});return"/"+o.join("/")};
const get=p=>{let n=D.fs;for(const s of p.split("/").filter(Boolean)){if(!n.c||!n.c[s])return null;n=n.c[s]}return n};
const parent=p=>{const i=p.lastIndexOf("/");return[get(p.slice(0,i)||"/"),p.slice(i+1)]};
const size=n=>n.c?Object.keys(n.c).length*4096:(n.t||"").length;
/* ---------- live simulated system state ---------- */
const T0=Date.now(),upt=()=>{const s=(Date.now()-T0)/1000|0;return pad(s/3600|0)+":"+pad(s/60%60|0)+":"+pad(s%60)};
const SYSL=()=>[["OS","Syntax Hacker OS (SIMULATION)"],["Kernel","6.6.0-sim (simulated)"],["Architecture","x86_64"],["CPU","Vektor X9-9900 8c @ 4.2GHz (fictional)"],["RAM",`${3100+R(400)} / 16384 MB (simulated)`],["Hostname","syntax-system"],["Username","syntax"],["Uptime",upt()],["Terminal","Syntax Terminal"],["Shell","Syntax Shell"]];
const PR=["init","syntaxd","sshd-sim","netmond","packetd","scand","term-session","filemgr","auditd-sim","cron-sim","dbus-sim","msfd-sim","wiresim","nmap-sim"].map((n,i)=>({pid:i?100+i*37+R(20):1,n,cpu:R(15),mem:R(300)+20,st:i%5===3?"S":"R",t:pad(R(24))+":"+pad(R(60))}));
const NET={up:[],dn:[],pk:0,tx:0,rx:0},CONN=[];
const mkc=()=>({d:P(["IN","OUT"]),l:AIP()+":"+(1024+R(60000)),r:AIP()+":"+P([22,53,80,443,8443]),pr:P(["TCP","TCP","UDP","TLS","DNS"]),st:P(["ESTABLISHED","SYN_SENT","TIME_WAIT","LISTEN"])});
for(let i=0;i<9;i++)CONN.push(mkc());
const IPL=()=>["1: lo: <LOOPBACK,UP> mtu 65536","    inet 127.0.0.1/8","2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500","    inet 10.13.37.100/24 brd 10.13.37.255","    link/ether 02:5e:11:a0:00:64","3: wlan0: <BROADCAST,MULTICAST> state DOWN (simulated)"];
/* ---------- shell + desktop ---------- */
const hos=el('<div id="hos"><div class="hb"><b class="brand">&lt;Syntax/&gt; OS</b><span class="badge">SYSTEM</span><button data-o="apps">☰ APPS</button><button data-n="term">+ TERMINAL</button><span class="sp"></span><button id="kbauto" type="button" aria-pressed="true">MOBILE KEYBOARD: ON</button><button id="hfs" type="button">Fullscreen</button><span class="k">UP</span><span class="v" id="hup">00:00:00</span><time class="v" id="hclk"></time><button id="hback">◀ DASHBOARD</button></div><div id="dk"><div id="di"></div></div><div id="tb"></div><div id="nts"></div></div>',document.body);
const kb=q("#kbauto",hos),syncKeyboard=()=>{kb.setAttribute("aria-pressed",D.set.keyboard!==false);kb.textContent="MOBILE KEYBOARD: "+(D.set.keyboard!==false?"ON":"OFF")};syncKeyboard();kb.onclick=()=>{D.set.keyboard=D.set.keyboard===false;save();syncKeyboard()};
q("#hfs",hos).textContent=document.fullscreenElement||document.body.classList.contains("immersive")?"Exit fullscreen":"Fullscreen";
const dk=q("#dk",hos),tb=q("#tb",hos);
q("#di",hos).innerHTML=["term","files","proc","net","sys","apps","wire","msf","set"].map(id=>{const a=ALL.find(x=>x.id===id);return`<button class="ic" data-o="${id}"><b>${a.ic}</b><span>${esc(a.n)}</span></button>`}).join("");
const wp=el('<canvas id="wp"></canvas>');dk.prepend(wp);
{let cols=[];const wx=wp.getContext("2d");setInterval(()=>{if(!hos.classList.contains("on")||document.hidden)return;
 if(wp.width!==dk.clientWidth||wp.height!==dk.clientHeight){wp.width=dk.clientWidth;wp.height=dk.clientHeight;cols=[]}
 const n=Math.ceil(wp.width/16);while(cols.length<n)cols.push(R(40));
 wx.fillStyle="rgba(5,8,10,.12)";wx.fillRect(0,0,wp.width,wp.height);wx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--acc");wx.font="14px monospace";
 cols.forEach((y,i)=>{wx.fillText(String.fromCharCode(33+R(90)),i*16,y*16);cols[i]=y*16>wp.height&&Math.random()>.97?0:y+1})},70)}
const note=t=>{if(!D.set.note)return;const n=el(`<div class="nt">${esc(t)}</div>`,q("#nts",hos));setTimeout(()=>n.remove(),3500)};
/* ---------- window manager ---------- */
const AP={},WS={};let zi=10,act=null;
const place=w=>{const s=w.e.style,g=w.g;if(g.max){s.left=s.top="0";s.width=s.height="100%"}else{s.left=g.x+"px";s.top=g.y+"px";s.width=g.w+"px";s.height=g.h+"px"}};
const persist=w=>{clearTimeout(w.pt);w.pt=setTimeout(()=>{D.win[w.id]={x:w.g.x,y:w.g.y,w:w.g.w,h:w.g.h,max:!!w.g.max};save()},250)};
const sync=()=>{D.open=Object.keys(WS);save()};
function renderTB(){tb.innerHTML=Object.values(WS).map(w=>`<button data-w="${esc(w.id)}" aria-pressed="${!w.min&&w===act}">${w.a.ic} ${esc(w.a.t)}</button>`).join("")||'<span class="k">No open windows</span>'}
function focus(w){act=w;w.e.style.zIndex=++zi;renderTB();if(D.set.keyboard!==false)w.foc&&w.foc()}
function toggleMin(w){w.min=!w.min;w.e.classList.toggle("min",w.min);if(w.min){if(act===w)act=null;renderTB()}else focus(w)}
function closeWin(w){w.close&&w.close();w.e.remove();delete WS[w.id];if(act===w)act=null;renderTB();sync()}
function openApp(key){
 const a=AP[key.split(":")[0]];if(!a)return;const id=a.multi&&!key.includes(":")?key+":"+Date.now().toString(36):key;
 if(WS[id]){WS[id].min&&toggleMin(WS[id]);focus(WS[id]);return WS[id]}
 const s=D.win[id],g=s&&s.w?s:{x:30+R(160),y:20+R(100),w:a.w[0],h:a.w[1]},w=WS[id]={id,a,g:Object.assign({},g),sub:id.split(":")[1]};
 w.e=el(`<div class="win"><div class="wh"><b>${a.ic} ${esc(a.t)}</b><span class="sp"></span><button data-a="m" title="Minimize">_</button><button data-a="x" title="Maximize / Restore">▢</button><button data-a="c" title="Close">✕</button></div><div class="wb"></div></div>`,dk);
 w.b=q(".wb",w.e);place(w);
 w.e.onclick=e=>{const k=e.target.dataset.a;if(!e.target.closest(".wh"))return;if(k==="c")closeWin(w);else if(k==="m")toggleMin(w);else if(k==="x"){w.g.max=!w.g.max;place(w);persist(w)}};
 w.e.addEventListener("pointerdown",()=>{if(act!==w)focus(w)});
 q(".wh",w.e).onpointerdown=ev=>{if(ev.target.closest("button")||w.g.max)return;const sx=ev.clientX-w.g.x,sy=ev.clientY-w.g.y;
  const mv=e=>{w.g.x=Math.max(0,e.clientX-sx);w.g.y=Math.max(0,e.clientY-sy);place(w)},up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);persist(w)};addEventListener("pointermove",mv);addEventListener("pointerup",up)};
 new ResizeObserver(()=>{if(!w.g.max&&!w.min&&w.e.offsetWidth>80){w.g.w=w.e.offsetWidth;w.g.h=w.e.offsetHeight;persist(w)}}).observe(w.e);
 try{a.init(w)}catch(e){w.b.textContent="App error: "+e.message}
 focus(w);sync();return w}
const launch=id=>openApp(T.find(x=>x.id===id&&!x.x)?"tool:"+id:id);
hos.onclick=e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.o)launch(b.dataset.o);else if(b.dataset.n)openApp(b.dataset.n);
 else if(b.dataset.w){const w=WS[b.dataset.w];w&&(w.min||act===w?toggleMin(w):focus(w))}
 else if(b.id==="hfs")window.CyberOps?.toggleFullscreen();else if(b.id==="hback")hos.classList.remove("on")};
hos.addEventListener("keydown",e=>e.stopPropagation());
/* ---------- Terminal ---------- */
AP.term={t:"Terminal",ic:">_",w:[640,380],multi:1,init:termInit};
function termInit(w){
 w.b.innerHTML='<div class="tm"><div class="to"></div><div class="tp"><span class="ps"></span><input spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Terminal input"></div></div>';
 const o=q(".to",w.b),inp=q("input",w.b),ps=q(".ps",w.b);let cwd="/home/syntax",hi=D.hist.length,busy=null;
 const setPs=()=>ps.textContent="syntax@syntax-system:"+(cwd==="/home/syntax"?"~":cwd)+"$";
 const line=(t,c)=>{const d=document.createElement("div");if(c)d.className=c;d.textContent=t;o.appendChild(d);while(o.childNodes.length>500)o.firstChild.remove();o.scrollTop=o.scrollHeight};
 const out=L=>new Promise(r=>{let i=0;busy=setInterval(()=>{if(i>=L.length){clearInterval(busy);busy=null;return r()}const[c,t]=PL(L[i++]);line(t,c)},28)});
 const row=p=>`${String(p.pid).padStart(5)} ${String(p.cpu).padStart(5)} ${String(p.mem).padStart(5)}  ${p.st}  ${p.n}`;
 const C={
  help:()=>["i:Built-in: "+Object.keys(C).join(" "),"i:Simulated tools: "+Object.keys(TA).join(" "),"w:Everything is simulated. Tab completes, Up/Down history, Ctrl+C stops output."],
  clear:()=>{o.innerHTML="";return[]},cls:()=>C.clear(),
  ls:a=>{const n=get(norm(a[0]||".",cwd));return!n?["e:ls: cannot access '"+a[0]+"': No such file or directory"]:n.c?[Object.keys(n.c).sort().map(k=>n.c[k].c?k+"/":k).join("  ")||" "]:[a[0]]},dir:a=>C.ls(a),
  pwd:()=>[cwd],
  cd:a=>{const p=norm(a[0]||"/home/syntax",cwd),n=get(p);if(!n||!n.c)return["e:cd: "+(a[0]||"")+": No such directory"];cwd=p;setPs();return[]},
  cat:a=>{const n=a[0]&&get(norm(a[0],cwd));return!n?["e:cat: "+(a[0]||"")+": No such file"]:n.c?["e:cat: is a directory"]:n.t.split("\n")},
  mkdir:a=>{const[pn,nm]=parent(norm(a[0]||"",cwd));if(!a[0]||!pn||!pn.c||pn.c[nm])return["e:mkdir: cannot create directory"];pn.c[nm]=dir({});save();return[]},
  touch:a=>{const[pn,nm]=parent(norm(a[0]||"",cwd));if(!a[0]||!pn||!pn.c)return["e:touch: cannot touch"];if(!pn.c[nm])pn.c[nm]=fl("");save();return[]},
  rm:a=>{const[pn,nm]=parent(norm(a[0]||"",cwd));if(!a[0]||!pn||!pn.c||!pn.c[nm])return["e:rm: cannot remove: No such file or directory"];delete pn.c[nm];save();return[]},
  echo:a=>[a.join(" ")],whoami:()=>["syntax"],hostname:()=>["syntax-system"],
  uname:a=>[a[0]==="-a"?"Linux syntax-system 6.6.0-sim #1 SMP x86_64 Syntax-OS (simulated)":"Linux"],
  date:()=>[new Date().toString()],time:()=>[clk()],
  ip:a=>a[0]==="addr"||a[0]==="a"?IPL():["w:usage: ip addr"],ifconfig:()=>IPL(),
  netstat:()=>["Proto Dir  Local Address            Foreign Address          State"].concat(CONN.map(c=>`${c.pr.padEnd(5)} ${c.d.padEnd(4)} ${c.l.padEnd(23)} ${c.r.padEnd(24)} ${c.st}`)),
  ping:a=>a[0]?["i:PING "+a[0]+" (SIMULATED - nothing is sent)"].concat([1,2,3,4].map(i=>`64 bytes from ${a[0]}: icmp_seq=${i} ttl=${60+R(4)} time=${(8+Math.random()*30).toFixed(1)} ms`),["o:4 packets transmitted, 4 received, 0% packet loss"]):["w:usage: ping host"],
  traceroute:a=>["i:traceroute to "+(a[0]||"10.13.37.1")+" (SIMULATED)"].concat([1,2,3,4,5].map(i=>` ${i}  ${AIP()}  ${(Math.random()*20).toFixed(1)} ms`)),
  ps:()=>["  PID  CPU%   MEM  ST  COMMAND"].concat(PR.map(row)),
  top:()=>["i:top - "+clk()+" up "+upt()+"  tasks: "+PR.length+" (SIMULATED)","  PID  CPU%   MEM  ST  COMMAND"].concat(PR.slice().sort((a,b)=>b.cpu-a.cpu).slice(0,8).map(row)),htop:()=>C.top(),
  history:()=>D.hist.map((h,i)=>` ${String(i+1).padStart(3)}  ${h}`),
  neofetch:()=>["o:syntax@syntax-system","o:---------------------"].concat(SYSL().map(([k,v])=>k+": "+v)),fastfetch:()=>C.neofetch(),
  msfconsole:()=>{openApp("msf");return["o:[*] Opening simulated Metasploit console window..."]},
  wireshark:()=>{openApp("wire");return["o:[*] Opening simulated Wireshark window..."]},
  exit:()=>{setTimeout(()=>closeWin(w),200);return["w:logout"]}};
 const run=async s=>{s=s.trim();if(!s)return;D.hist.push(s);D.hist=D.hist.slice(-100);save();hi=D.hist.length;const[c,...a]=s.split(/\s+/);
  try{if(C[c])await out(await C[c](a));else if(TA[c])openApp("tool:"+TA[c]);else line(c+": command not found","ALERT")}catch(e){line("error: "+e.message,"ALERT")}};
 const comp=()=>{const v=inp.value,p=v.split(/\s+/),cur=last(p),L=p.length===1?Object.keys(C).concat(Object.keys(TA)):Object.keys((get(cwd)||{}).c||{}),m=L.filter(x=>x.startsWith(cur)).sort();
  if(m.length===1)inp.value=p.slice(0,-1).concat(m[0]).join(" ")+" ";else if(m.length>1){line(ps.textContent+" "+v);line(m.join("  "),"INFO")}};
 inp.onkeydown=e=>{
  if(e.key==="Enter"){if(busy)return;const v=inp.value;inp.value="";line(ps.textContent+" "+v);run(v)}
  else if(e.key==="ArrowUp"){e.preventDefault();if(hi>0)inp.value=D.hist[--hi]||""}
  else if(e.key==="ArrowDown"){e.preventDefault();hi=Math.min(D.hist.length,hi+1);inp.value=D.hist[hi]||""}
  else if(e.key==="Tab"){e.preventDefault();comp()}
  else if(e.ctrlKey&&e.key==="c"&&busy){clearInterval(busy);busy=null;line("^C","WARN")}
  else if(e.ctrlKey&&e.key==="l"){e.preventDefault();o.innerHTML=""}};
 q(".tm",w.b).onclick=()=>{if(!String(getSelection()))inp.focus()};
 w.foc=()=>inp.focus();w.close=()=>clearInterval(busy);
 line("Syntax Terminal - everything here is SIMULATED. Type 'help'.","INFO");setPs();setTimeout(()=>inp.focus(),50);out(C.neofetch().concat(["w:Try: help | nmap | ping 10.13.37.1 | top | netstat | msfconsole | wireshark"]))}
/* ---------- File manager ---------- */
AP.files={t:"File Manager",ic:"▤",w:[640,400],init:filesInit};
function filesInit(w){
 let cwd="/home/syntax",sel=null,ed=null;
 w.b.innerHTML='<div class="fm"><div class="tr"><button data-a="up">↑ Up</button><input class="pa"><button data-a="nd">+ Folder</button><button data-a="nf">+ File</button><button data-a="rn">Rename</button><button data-a="dl">Delete</button><input class="sr" placeholder="search files..."></div><div class="fl"></div><div class="fi"></div></div>';
 const fL=q(".fl",w.b),fI=q(".fi",w.b),pa=q(".pa",w.b),sr=q(".sr",w.b);
 const r=()=>{pa.value=cwd;
  if(ed){const n=get(ed);fL.innerHTML=`<div style="display:flex;flex-direction:column;height:100%;gap:6px;padding:6px"><b>${esc(ed)}</b><textarea></textarea><div class="bt"><button data-a="sv">Save</button><button data-a="cx">Close</button></div></div>`;q("textarea",fL).value=n.t;return}
  const s=sr.value.toLowerCase();let rows=[];
  if(s){const walk=(n,p)=>Object.keys(n.c||{}).forEach(k=>{const c=n.c[k],pp=p+"/"+k;if(k.toLowerCase().includes(s))rows.push([pp,c]);walk(c,pp)});walk(D.fs,"")}
  else{const n=get(cwd);rows=Object.keys(n.c).sort().map(k=>[(cwd==="/"?"":cwd)+"/"+k,n.c[k]])}
  fL.innerHTML="<table><tr><th>Name</th><th>Size</th><th>Modified</th></tr>"+rows.map(([p,n])=>`<tr data-p="${esc(p)}" class="${p===sel?"sel":""}"><td>${n.c?"▸":"·"} ${esc(s?p:p.split("/").pop())}</td><td>${size(n)} B</td><td>${new Date(n.m).toLocaleString()}</td></tr>`).join("")+"</table>";
  const n=sel&&get(sel);fI.textContent=n?`${sel}  |  ${n.c?"directory":"text file"}  |  ${size(n)} bytes  |  modified ${new Date(n.m).toLocaleString()}  |  ${n.c?"drwxr-xr-x":"-rw-r--r--"}`:"Select an item, double-click to open. Browser-simulated storage."};
 const ask=(m,d)=>{const v=prompt(m,d||"");return v&&v.trim()&&!v.includes("/")?v.trim():null};
 const add=(mk,m)=>{const nm=ask(m),n=get(cwd);if(!nm||n.c[nm])return note("Invalid or existing name");n.c[nm]=mk();save();r()};
 w.b.onclick=e=>{const t=e.target,a=t.dataset.a,tr=t.closest("tr[data-p]");
  if(tr){sel=tr.dataset.p;r()}
  else if(a==="up"){cwd=norm("..",cwd);sel=null;ed=null;r()}
  else if(a==="nd")add(()=>dir({}),"New folder name");else if(a==="nf")add(()=>fl(""),"New file name");
  else if(a==="rn"&&sel){const[pn,nm]=parent(sel),nn=ask("Rename to",nm);if(nn&&!pn.c[nn]){pn.c[nn]=pn.c[nm];delete pn.c[nm];sel=null;save();r()}}
  else if(a==="dl"&&sel&&confirm("Delete "+sel+" ?")){const[pn,nm]=parent(sel);delete pn.c[nm];sel=null;save();r()}
  else if(a==="sv"){const n=get(ed);n.t=q("textarea",fL).value;n.m=Date.now();save();note("Saved "+ed)}
  else if(a==="cx"){ed=null;r()}};
 w.b.ondblclick=e=>{const tr=e.target.closest("tr[data-p]");if(!tr)return;const p=tr.dataset.p,n=get(p);if(n.c){cwd=p;sr.value="";sel=null}else ed=p;r()};
 pa.onkeydown=e=>{if(e.key==="Enter"){const p=norm(pa.value,"/"),n=get(p);if(n&&n.c){cwd=p;ed=null;r()}else note("No such directory")}};
 sr.oninput=()=>{ed=null;r()};r()}
/* ---------- Process manager ---------- */
AP.proc={t:"Process Manager",ic:"▦",w:[560,380],init:procInit};
function procInit(w){
 w.b.innerHTML='<div class="pm"><div class="tr"><input class="sr" placeholder="search process..."><button data-a="go">Start</button><button data-a="st">Stop</button></div><div class="fl"></div><div class="fi"></div></div>';
 let sk="cpu",sd=-1,sel=null;
 const r=()=>{const s=q(".sr",w.b).value.toLowerCase(),L=PR.filter(p=>p.n.includes(s)||String(p.pid).includes(s)).sort((a,b)=>(a[sk]>b[sk]?1:-1)*sd);
  q(".fl",w.b).innerHTML="<table><tr>"+[["pid","PID"],["n","NAME"],["cpu","CPU%"],["mem","MEM MB"],["st","STATE"],["t","START"]].map(([k,t])=>`<th data-s="${k}">${t}${k===sk?(sd>0?" ▲":" ▼"):""}</th>`).join("")+"</tr>"+L.map(p=>`<tr data-p="${p.pid}" class="${p.pid===sel?"sel":""}"><td>${p.pid}</td><td>${p.n}</td><td>${p.cpu}</td><td>${p.mem}</td><td>${p.st==="T"?"stopped":p.st==="S"?"sleep":"run"}</td><td>${p.t}</td></tr>`).join("")+"</table>";
  const p=PR.find(x=>x.pid===sel);q(".fi",w.b).textContent=p?`PID ${p.pid} | ${p.n} | user syntax | threads ${1+p.pid%7} | started ${p.t} | simulated process`:"Select a process. Only simulated processes are managed."};
 w.b.onclick=e=>{const t=e.target,th=t.closest("th"),tr=t.closest("tr[data-p]"),a=t.dataset.a;
  if(th){const k=th.dataset.s;sd=k===sk?-sd:-1;sk=k}else if(tr)sel=+tr.dataset.p;else if(a&&sel){const p=PR.find(x=>x.pid===sel);p.st=a==="st"?"T":"R";note((a==="st"?"Stopped ":"Started ")+p.n+" (simulated)")}r()};
 q(".sr",w.b).oninput=r;w.upd=r;r()}
/* ---------- Network monitor ---------- */
AP.net={t:"Network Monitor",ic:"⇅",w:[600,420],init:netInit};
function netInit(w){
 w.b.innerHTML='<div class="nm"><div class="ds"></div><canvas></canvas><div class="fl"></div></div>';
 const c=q("canvas",w.b);
 w.upd=()=>{const cs=getComputedStyle(document.documentElement),r=c.getBoundingClientRect(),x=c.getContext("2d");c.width=Math.max(1,r.width);c.height=Math.max(1,r.height);x.lineWidth=1.5;
  [[NET.up,cs.getPropertyValue("--acc2")],[NET.dn,cs.getPropertyValue("--acc")]].forEach(([a,col])=>{x.strokeStyle=col.trim();x.beginPath();a.forEach((v,i)=>{const px=i/59*c.width,py=c.height-Math.min(v,200)/200*c.height;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke()});
  q(".ds",w.b).textContent=`UP ${last(NET.up)||0} KB/s (cyan)   DOWN ${last(NET.dn)||0} KB/s (green)   packets ${NET.pk}   TX ${(NET.tx/1024).toFixed(1)} MB   RX ${(NET.rx/1024).toFixed(1)} MB   [SIMULATED]`;
  q(".fl",w.b).innerHTML="<table><tr><th>Dir</th><th>Proto</th><th>Local</th><th>Remote</th><th>State</th></tr>"+CONN.map(k=>`<tr><td>${k.d}</td><td>${k.pr}</td><td>${k.l}</td><td>${k.r}</td><td>${k.st}</td></tr>`).join("")+"</table>"};
 w.upd()}
/* ---------- System info ---------- */
AP.sys={t:"System Info",ic:"ⓘ",w:[500,360],init:sysInit};
function sysInit(w){
 w.b.innerHTML='<div class="st sys"><pre> ____  _  _ _  _ _____  _   __  __\n/ ___|| \\| | \\| |_   _|/_\\  \\ \\/ /\n\\___ \\| .` | .` | | | / _ \\  >  &lt; \n|____/|_|\\_|_|\\_| |_|/_/ \\_\\/_/\\_\\</pre><dl></dl><p class="ds"><i>This is a simulated environment. Nothing is scanned, hacked or connected.</i></p></div>';
 w.upd=()=>q("dl",w.b).innerHTML=SYSL().map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join("");w.upd()}
/* ---------- Settings ---------- */
AP.set={t:"Settings",ic:"✱",w:[480,420],init:setInit};
function setInit(w){
 w.b.innerHTML='<div class="st"><label>Theme <select data-k="theme"><option value="green">green</option><option>amber</option><option>blue</option><option>red</option></select></label><label><input type="checkbox" data-k="boot"> Boot animation when opening the environment</label><label><input type="checkbox" data-k="note"> Notifications</label><div class="bt"><button data-a="lay">Reset window layout</button><button data-a="all">Reset environment</button></div><b class="k">SIMULATION HISTORY</b><div class="rp"></div></div>';
 const th=q("[data-k=theme]",w.b);th.value=D.set.theme||document.documentElement.dataset.theme||"green";
 q("[data-k=boot]",w.b).checked=D.set.boot;q("[data-k=note]",w.b).checked=D.set.note;
 w.b.onchange=e=>{const k=e.target.dataset.k;if(!k)return;D.set[k]=e.target.type==="checkbox"?e.target.checked:e.target.value;if(k==="theme")document.documentElement.dataset.theme=D.set.theme;save()};
 w.b.onclick=e=>{const a=e.target.dataset.a;if(a==="lay"){D.win={};save();note("Window layout reset (applies to newly opened windows)")}else if(a==="all"&&confirm("Reset the whole simulated environment?"))resetAll()};
 w.upd=()=>q(".rp",w.b).textContent=D.sims.slice(-12).reverse().map(s=>`${new Date(s.t).toLocaleTimeString()}  ${s.n}  ${s.tg||""}  ${s.s}`).join("\n")||"No simulations run yet.";w.upd()}
function resetAll(){Object.values(WS).forEach(closeWin);try{localStorage.removeItem(KEY)}catch(e){}D=JSON.parse(JSON.stringify(DEF));D.fs=mkfs();save();openApp("term");note("Environment reset")}
/* ---------- Tool library / launcher ---------- */
AP.apps={t:"Tool Library",ic:"▣",w:[620,420],init:appsInit};
function appsInit(w){
 w.b.innerHTML='<div class="ap"><input class="sr" placeholder="Search apps and tools..."><div class="gr"></div></div>';
 const r=()=>{const s=q(".sr",w.b).value.toLowerCase();q(".gr",w.b).innerHTML=ALL.filter(a=>(a.n+a.d).toLowerCase().includes(s)).map(a=>`<button class="ic" data-o="${a.id}" title="${esc(a.d)}"><b>${a.ic}</b><span>${esc(a.n)}</span><small>${esc(a.d)}</small></button>`).join("")};
 q(".sr",w.b).oninput=r;r();w.foc=()=>q(".sr",w.b).focus()}
/* ---------- Generic tool window ---------- */
AP.tool={t:"Tool",ic:"⌗",w:[620,470],init:toolInit};
function toolInit(w){
 const d=T.find(x=>x.id===w.sub);w.a={t:d.n,ic:d.ic};q(".wh b",w.e).textContent=d.ic+" "+d.n;
 const c=D.cfg[d.id]=Object.assign({sc:"Corp LAN",t:SC["Corp LAN"][0].ip,o:d.o[1][0],f:d.f[1]},D.cfg[d.id]);
 w.b.innerHTML=`<div class="tl"><p class="ds">${esc(d.d)} - ${esc(d.n)} <i>SIMULATED</i></p><div class="cg"><label>Scenario<select data-k="sc">${Object.keys(SC).map(k=>`<option>${k}</option>`).join("")}</select></label><label>Target<input data-k="t"></label><label>${esc(d.o[0])}<select data-k="o">${d.o[1].map(v=>`<option>${esc(v)}</option>`).join("")}</select></label><label>${esc(d.f[0])}<input data-k="f"></label></div><div class="bt"><button data-a="go">Start</button><button data-a="st" disabled>Stop</button><button data-a="cl">Clear</button><button data-a="rs">Reset</button><em class="stt">IDLE</em></div><div class="bar"><i></i></div><div class="to"></div><div class="rp"></div></div>`;
 const bind=()=>w.b.querySelectorAll("[data-k]").forEach(e=>{e.value=c[e.dataset.k];e.onchange=e.oninput=()=>{c[e.dataset.k]=e.value;if(e.dataset.k==="sc"){c.t=SC[c.sc][0].ip;q("[data-k=t]",w.b).value=c.t}save()}});bind();w.foc=()=>q("[data-k=t]",w.b)?.focus();
 let iv=null,L,i,cycle=0;const st=q(".stt",w.b),bar=q(".bar i",w.b),o=q(".to",w.b),rp=q(".rp",w.b),go=q("[data-a=go]",w.b),sp=q("[data-a=st]",w.b);
 const status=(t,k)=>{st.textContent=t;st.className="stt "+(k||"")};
 const end=(t,k)=>{clearInterval(iv);iv=null;go.disabled=false;sp.disabled=true;status(t,k)};
 w.close=()=>clearInterval(iv);
 w.b.onclick=e=>{const a=e.target.dataset.a;if(!a)return;
  if(a==="go"&&!iv){o.innerHTML="";rp.textContent="";bar.style.width="0";L=gen(d,c);i=0;cycle=1;go.disabled=true;sp.disabled=false;status("RUNNING · CYCLE 1","WARN");
   iv=setInterval(()=>{if(i<L.length){const[k,t]=PL(L[i++]),n=document.createElement("div");if(k)n.className=k;n.textContent=t;o.appendChild(n);o.scrollTop=o.scrollHeight;bar.style.width=i/L.length*100+"%"}
    else{const f=/^e:Status/.test(last(L));rp.textContent="LATEST RESULTS\n"+resL(d,c).join("\n");if(cycle%10===0)sim(d.n,c.t,f?"FAILED":"CYCLE "+cycle);cycle++;L=gen(d,c);i=0;while(o.childNodes.length>500)o.firstChild.remove();bar.style.width="0";status("RUNNING · CYCLE "+cycle,f?"ALERT":"WARN")}},300)}
  else if(a==="st"&&iv){end("STOPPED","WARN");sim(d.n,c.t,"STOPPED")}
  else if(a==="cl"){o.innerHTML="";rp.textContent="";bar.style.width="0"}
  else if(a==="rs"){clearInterval(iv);iv=null;delete D.cfg[d.id];save();o.innerHTML="";rp.textContent="";bar.style.width="0";Object.assign(c,{sc:"Corp LAN",t:SC["Corp LAN"][0].ip,o:d.o[1][0],f:d.f[1]});bind();go.disabled=false;sp.disabled=true;status("IDLE")}}}
/* ---------- Wireshark simulator ---------- */
AP.wire={t:"Wireshark",ic:"≋",w:[760,460],init:wireInit};
function wireInit(w){
 w.b.innerHTML='<div class="ws"><div class="tr"><button data-a="go">Start capture</button><button data-a="st" disabled>Stop</button><button data-a="cl">Clear</button><input class="ft" placeholder="filter: tcp | dns | ip.addr==10.13.37.22 | text"><em class="stt">STOPPED</em></div><div class="fl"></div><div class="fi"></div><div class="ph"></div></div>';
 let pk=[],iv=null,sel=null,n=0;const t0=Date.now(),hs=SC["Corp LAN"],fL=q(".fl",w.b),go=q("[data-a=go]",w.b),sp=q("[data-a=st]",w.b),st=q(".stt",w.b);
 const mk=()=>{const pr=P(["TCP","TCP","TCP","UDP","DNS","TLSv1.3","HTTP","ARP","ICMP"]),a=P(hs).ip,b=P(hs).ip,l=60+R(1400),sp_=1024+R(60000),dp=P([22,53,80,443,8080]);
  const info={TCP:`${sp_} -> ${dp} [${P(["SYN","ACK","PSH,ACK","FIN,ACK"])}] Seq=${R(9e5)} Win=${R(65535)} Len=${l-54}`,UDP:`${sp_} -> ${dp} Len=${l-42}`,DNS:`Standard query 0x${R(65535).toString(16)} A host${R(20)}.lab.invalid`,"TLSv1.3":"Application Data",HTTP:`GET /${P(["index.html","api/status","login"])} HTTP/1.1`,ARP:`Who has ${b}? Tell ${a}`,ICMP:`Echo (ping) request id=0x${R(9999).toString(16)}`}[pr];
  return{no:++n,t:((Date.now()-t0)/1000).toFixed(6),a,b,pr,l,info}};
 const ok=p=>{const f=q(".ft",w.b).value.trim().toLowerCase();if(!f)return true;const m=/^ip\.addr\s*==\s*(\S+)$/.exec(f);return m?p.a===m[1]||p.b===m[1]:(p.pr+" "+p.a+" "+p.b+" "+p.info).toLowerCase().includes(f)};
 const r=()=>{const L=pk.filter(ok).slice(-150);
  fL.innerHTML="<table><tr><th>No.</th><th>Time</th><th>Source</th><th>Destination</th><th>Protocol</th><th>Length</th><th>Info</th></tr>"+L.map(p=>`<tr data-p="${p.no}" class="${p.no===sel?"sel":""}"><td>${p.no}</td><td>${p.t}</td><td>${p.a}</td><td>${p.b}</td><td>${p.pr}</td><td>${p.l}</td><td>${esc(p.info)}</td></tr>`).join("")+"</table>";if(iv&&!sel)fL.scrollTop=fL.scrollHeight;
  const p=pk.find(x=>x.no===sel);q(".fi",w.b).textContent=p?[`Frame ${p.no}: ${p.l} bytes on wire (generated sample, not real traffic)`,`Ethernet II  Src 02:5e:11:a0:00:${pad(p.no%100)}  Dst 02:5e:11:a0:00:${pad((p.no*7)%100)}`,`Internet Protocol v4  Src ${p.a}  Dst ${p.b}`,`${p.pr}: ${p.info}`,"0000  "+Array.from({length:16},(_,i)=>((p.no*31+i*17)%256).toString(16).padStart(2,"0")).join(" ")].join("\n"):"Select a packet to see details.";
  const c={};pk.forEach(p=>c[p.pr]=(c[p.pr]||0)+1);q(".ph",w.b).textContent="Protocol hierarchy: "+(Object.entries(c).map(([k,v])=>`${k} ${(v/pk.length*100).toFixed(0)}%`).join(" | ")||"-")+"   packets: "+pk.length};
 const stop=()=>{clearInterval(iv);iv=null;go.disabled=false;sp.disabled=true;st.textContent="STOPPED";st.className="stt"};
 w.close=()=>clearInterval(iv);
 w.b.onclick=e=>{const a=e.target.dataset.a,tr=e.target.closest("tr[data-p]");if(tr){sel=+tr.dataset.p;r()}
  else if(a==="go"&&!iv){go.disabled=true;sp.disabled=false;st.textContent="CAPTURING (simulated)";st.className="stt OK";iv=setInterval(()=>{for(let i=0,k=1+R(3);i<k;i++)pk.push(mk());if(pk.length>1000)pk.splice(0,200);r()},400);sim("Wireshark","sample capture","STARTED")}
  else if(a==="st")stop();else if(a==="cl"){pk=[];sel=null;n=0;r()}};
 q(".ft",w.b).oninput=r;r()}
/* ---------- Metasploit simulator ---------- */
AP.msf={t:"Metasploit",ic:"☠",w:[700,520],init:msfInit};
function msfInit(w){
 const MOD={exploit:["sim/ftp/demo_overflow","sim/http/demo_rce","sim/smb/demo_share"],auxiliary:["sim/scanner/demo_portscan","sim/gather/demo_banner"],post:["sim/post/demo_enum"]},PAY=["sim/demo_shell","sim/demo_meterpreter","sim/demo_beacon"];
 const S=D.cfg.msf=Object.assign({cat:"exploit",mod:MOD.exploit[0],pay:PAY[0],host:SC["Corp LAN"][0].ip,port:"4444",ses:[]},D.cfg.msf);
 w.b.innerHTML=`<div class="tl"><p class="ds">Fictional modules and payloads only - no real exploitation capability <i>SIMULATED</i></p><div class="cg"><label>Category<select data-k="cat">${Object.keys(MOD).map(k=>`<option>${k}</option>`).join("")}</select></label><label>Module<select data-k="mod"></select></label><label>Payload<select data-k="pay">${PAY.map(k=>`<option>${k}</option>`).join("")}</select></label><label>RHOSTS<input data-k="host"></label><label>LPORT<input data-k="port"></label></div><div class="bt"><button data-a="go">Run</button><button data-a="st" disabled>Stop</button><button data-a="cl">Clear</button><button data-a="rs">Reset</button><em class="stt">IDLE</em></div><div class="bar"><i></i></div><div class="to"></div><div class="tp"><span class="ps">msf6 &gt;</span><input placeholder="help | show options | use &lt;module&gt; | set RHOSTS &lt;ip&gt; | run | sessions"></div><div class="rp"></div></div>`;
 const o=q(".to",w.b),bar=q(".bar i",w.b),st=q(".stt",w.b),rp=q(".rp",w.b),mod=q("[data-k=mod]",w.b),go=q("[data-a=go]",w.b),stopBtn=q("[data-a=st]",w.b);let iv=null,cycle=0;
 const add=t=>{const[k,x]=PL(t),d=document.createElement("div");if(k)d.className=k;d.textContent=x;o.appendChild(d);o.scrollTop=o.scrollHeight};
 const ses=()=>{rp.innerHTML="<b>SESSIONS</b> "+(S.ses.map(x=>`<div>#${x.id} ${esc(x.pay)} -> ${esc(x.host)} (${x.t}) <button data-a="k" data-i="${x.id}">Kill</button></div>`).join("")||"none")};
 const sync=()=>{if(!MOD[S.cat].includes(S.mod))S.mod=MOD[S.cat][0];mod.innerHTML=MOD[S.cat].map(m=>`<option>${m}</option>`).join("");mod.value=S.mod;w.b.querySelectorAll("[data-k]").forEach(e=>{if(e.dataset.k!=="mod")e.value=S[e.dataset.k]});save()};
 w.b.querySelectorAll("[data-k]").forEach(e=>e.onchange=e.oninput=()=>{S[e.target?e.target.dataset.k:e.dataset.k]=e.value});
 w.b.querySelectorAll("[data-k]").forEach(e=>{e.onchange=()=>{S[e.dataset.k]=e.value;if(e.dataset.k==="cat")sync();else save()}});
 const stop=()=>{clearInterval(iv);iv=null;go.disabled=false;stopBtn.disabled=true;st.textContent="STOPPED";st.className="stt"};
 const run=()=>{if(iv)return;const L=["i:[*] Handler cycle "+(cycle+1)+" initialized on "+S.host+":"+S.port,"i:[*] Module "+S.cat+"/"+S.mod,"i:[*] Payload: "+S.pay,"w:[*] Processing sample event stream...",S.cat==="exploit"?`o:[+] Fictional session activity refreshed (${S.pay} -> ${S.host})`:"o:[+] Module results refreshed"];let i=0;cycle++;go.disabled=true;stopBtn.disabled=false;st.textContent="RUNNING · CYCLE "+cycle;st.className="stt WARN";bar.style.width="0";
  iv=setInterval(()=>{if(i<L.length){add(L[i++]);bar.style.width=i/L.length*100+"%"}else{if(S.cat==="exploit"&&!S.ses.some(x=>x.id===cycle))S.ses.push({id:cycle,pay:S.pay,host:S.host,t:clk()});sim("Metasploit",S.host,"CYCLE "+cycle);save();ses();i=0;cycle++;st.textContent="RUNNING · CYCLE "+cycle;bar.style.width="0"}},350)};
 const cmd=s=>{add("msf6 > "+s);const[c,a,b]=s.trim().split(/\s+/);
  if(c==="help")add("i:show options | use <module> | set <RHOSTS|LPORT|PAYLOAD> <value> | run | sessions");
  else if(c==="show")add(`i:${S.cat}/${S.mod}  RHOSTS=${S.host}  LPORT=${S.port}  PAYLOAD=${S.pay}`);
  else if(c==="use"&&a){const f=Object.entries(MOD).find(([k,v])=>v.some(m=>a.endsWith(m)));if(f){S.cat=f[0];S.mod=f[1].find(m=>a.endsWith(m));sync()}else add("e:Unknown module (only fictional sim/* modules exist)")}
  else if(c==="set"&&b){const k={rhosts:"host",lport:"port",payload:"pay"}[a.toLowerCase()];if(k){S[k]=b;sync()}else add("e:Unknown option")}
  else if(c==="run"||c==="exploit")run();
  else if(c==="sessions"){S.ses.forEach(x=>add(`o:Session ${x.id}  ${x.pay}  ${x.host}  ${x.t}`));if(!S.ses.length)add("w:No active sessions")}
  else if(c)add("e:Unknown command: "+c)};
 q(".tp input",w.b).onkeydown=e=>{if(e.key==="Enter"&&e.target.value.trim()){cmd(e.target.value);e.target.value=""}};
 w.b.onclick=e=>{const a=e.target.dataset.a;if(a==="go")run();else if(a==="st")stop();else if(a==="cl"){o.innerHTML="";bar.style.width="0"}
  else if(a==="rs"){stop();cycle=0;Object.assign(S,{cat:"exploit",mod:MOD.exploit[0],pay:PAY[0],host:SC["Corp LAN"][0].ip,port:"4444",ses:[]});o.innerHTML="";bar.style.width="0";st.textContent="IDLE";st.className="stt";sync();ses()}
  else if(a==="k"){S.ses=S.ses.filter(x=>x.id!==+e.target.dataset.i);save();ses()}};
 w.close=()=>clearInterval(iv);w.foc=()=>q(".tp input",w.b)?.focus();sync();ses();add("i:Syntax Metasploit-style console (SIMULATED). Type 'help'.")}
/* ---------- boot + tick + entry ---------- */
function boot(done){
 const b=el('<div id="bt"><pre></pre><div class="bar"><i></i></div><button>Skip boot animation</button></div>',hos),pre=q("pre",b),bar=q("i",b);
 const L=["Syntax BIOS v4.2 ................ OK","Kernel loading: vmlinuz-6.6.0 ... OK","Hardware detection: 8 cores, 16 GB RAM","Starting services: syntaxd netmond scand ... OK","Network subsystem: eth0 UP 10.13.37.100 ... OK","Loading applications: 24 security tools ... OK","System ready."];let i=0,iv=null;
 const fin=()=>{clearInterval(iv);b.remove();done()};
 iv=setInterval(()=>{if(i>=L.length)return fin();pre.textContent+=L[i++]+"\n";bar.style.width=i/L.length*100+"%"},380);
 q("button",b).onclick=fin;q("button",b).focus()}
function tick(){if(!hos.classList.contains("on")||document.hidden)return;
 PR.forEach(p=>{if(p.st==="T")p.cpu=0;else{p.cpu=Math.max(0,Math.min(99,p.cpu+R(11)-5));p.mem=Math.max(8,p.mem+R(9)-4)}});
 const u=Math.max(5,Math.min(200,(last(NET.up)||50)+R(31)-15)),d=Math.max(5,Math.min(200,(last(NET.dn)||80)+R(41)-20));NET.up.push(u);NET.dn.push(d);if(NET.up.length>60){NET.up.shift();NET.dn.shift()}
 NET.pk+=R(900)+100;NET.tx+=u;NET.rx+=d;CONN[R(CONN.length)]=mkc();
 Object.values(WS).forEach(w=>w.upd&&!w.min&&w.upd());q("#hclk",hos).textContent=clk();q("#hup",hos).textContent=upt()}
let started=false;
function start(){if(D.set.theme)document.documentElement.dataset.theme=D.set.theme;const ids=D.open.slice();
 if(ids.length)ids.forEach(id=>openApp(id));
 else{const at=(w,x,y,ww,hh)=>{if(w){Object.assign(w.g,{x,y,w:ww,h:hh});place(w);persist(w)}},t=openApp("term");
  if(dk.clientWidth>700){at(t,210,20,600,360);const W=dk.clientWidth;at(openApp("net"),210,400,600,250);if(W>1100)at(openApp("sys"),830,20,340,330)}}
 if(!Object.keys(WS).length)openApp("term");note("Syntax Hacker OS ready - simulation only")}
setInterval(tick,1000);
const btn=q("#osbtn");
if(btn)btn.addEventListener("click",()=>{hos.classList.add("on");if(D.set.theme)document.documentElement.dataset.theme=D.set.theme;if(!started){started=true;const mobileKeyboard=D.set.keyboard!==false&&matchMedia("(max-width: 700px)").matches;mobileKeyboard?start():(D.set.boot?boot(start):start())}});
})();
