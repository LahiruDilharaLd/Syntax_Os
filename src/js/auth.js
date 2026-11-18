/* Device passkey login (WebAuthn) plus the configured password fallback. */
(()=>{
"use strict";
const $=id=>document.getElementById(id), form=$("lf"), msg=$("lmsg"), bgm=$("bgm"), mus=$("mus");
let users=[],fails=0,lockUntil=0,wasPlaying=false,musicCtx=null,synthTimer=null,musicEnabled=true,noteIndex=0;
const track=$("music-track");track.value=localStorage.getItem("syntax:music-track")||"default";
const enc=new TextEncoder(), dec=new TextDecoder();
const b64u=b=>{let s="";new Uint8Array(b).forEach(x=>s+=String.fromCharCode(x));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")};
const un64=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((s.length+3)%4)),c=>c.charCodeAt(0));
const rand=n=>crypto.getRandomValues(new Uint8Array(n));
fetch("src/data/user.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(j=>{users=j.users||[];if(!users.some(u=>u.passkey)&&location.hash==="#setup")$("setup-fingerprint").hidden=false})
 .catch(()=>msg.textContent="Cannot load user.json. Serve this folder over HTTPS or localhost.");
function tab(which){const fp=which==="finger";$("finger-panel").hidden=!fp;$("password-panel").hidden=fp;$("finger-tab").classList.toggle("selected",fp);$("password-tab").classList.toggle("selected",!fp);$("finger-tab").setAttribute("aria-selected",fp);$("password-tab").setAttribute("aria-selected",!fp);msg.textContent=""}
$("finger-tab").onclick=()=>tab("finger");$("password-tab").onclick=()=>tab("password");
function allowed(){if(!users.length)throw Error("User database is not loaded.");const wait=Math.ceil((lockUntil-Date.now())/1000);if(wait>0)throw Error(`Too many attempts. Try again in ${wait}s.`)}
form.addEventListener("submit",e=>{e.preventDefault();try{allowed();const p=md5($("lp").value);const hit=users.find(x=>x.password===p);if(hit)ok(hit);else bad()}catch(e){msg.textContent=e.message}});
$("setup-fingerprint").onclick=async()=>{try{allowed();if(!window.PublicKeyCredential||!navigator.credentials)throw Error("Passkeys are not supported in this browser.");if(!isSecureContext)throw Error("Device sign-in requires HTTPS (or localhost).");
 const challenge=rand(32),userId=enc.encode("syntax-operator");
 const cred=await navigator.credentials.create({publicKey:{challenge,rp:{name:"<Syntax> Console",id:location.hostname},user:{id:userId,name:"syntax",displayName:"<Syntax>"},pubKeyCredParams:[{type:"public-key",alg:-7}],authenticatorSelection:{authenticatorAttachment:"platform",residentKey:"preferred",userVerification:"required"},timeout:60000,attestation:"none"}});
 const spki=cred.response.getPublicKey?.();if(!spki)throw Error("This authenticator did not provide an exportable public key; use the password tab.");
 const previous=users.find(u=>u.password)||{};
 const cfg={display:"<Syntax>",...(previous.username?{username:previous.username}:{}),...(previous.password?{password:previous.password}:{}),passkey:{id:b64u(cred.rawId),publicKey:b64u(spki),algorithm:"ES256"}};
 const blob=new Blob([JSON.stringify({users:[cfg]},null,2)+"\n"],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="user.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 msg.textContent="Passkey created. Replace src/data/user.json with the downloaded file, then upload it with your site.";
 }catch(e){msg.textContent=e.name==="NotAllowedError"?"Setup cancelled or the device could not verify you.":e.message}}
$("finger-login").onclick=async()=>{try{allowed();const user=users.find(u=>u.passkey);if(!user)throw Error("No passkey is configured. Use PASSWORD, then set up this device.");if(!isSecureContext)throw Error("Fingerprint sign-in requires HTTPS (or localhost).");const challenge=rand(32),origin=location.origin,rpHash=await crypto.subtle.digest("SHA-256",enc.encode(location.hostname));
 const assertion=await navigator.credentials.get({publicKey:{challenge,rpId:location.hostname,allowCredentials:[{type:"public-key",id:un64(user.passkey.id)}],userVerification:"required",timeout:60000}});
 const cd=JSON.parse(dec.decode(assertion.response.clientDataJSON));if(cd.type!=="webauthn.get"||cd.origin!==origin||cd.challenge!==b64u(challenge))throw Error("Passkey response did not match this sign-in request.");
 const auth=new Uint8Array(assertion.response.authenticatorData);if(auth.length<37||(auth[32]&1)===0||!equal(auth.slice(0,32),new Uint8Array(rpHash)))throw Error("Device verification failed.");
 const key=await crypto.subtle.importKey("spki",un64(user.passkey.publicKey),{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
 const signed=new Uint8Array(await crypto.subtle.digest("SHA-256",assertion.response.clientDataJSON)),payload=new Uint8Array(auth.length+signed.length);payload.set(auth);payload.set(signed,auth.length);
 if(!await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},key,derToRaw(new Uint8Array(assertion.response.signature)),payload))throw Error("Passkey signature check failed.");
 ok(user);
 }catch(e){bad(e.name==="NotAllowedError"?"Sign-in cancelled or verification failed.":e.message)}};
function equal(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i])}
function derToRaw(d){if(d[0]!==0x30)throw Error("Unsupported passkey signature.");let i=2;if(d[i++]!==2)throw Error("Unsupported passkey signature.");let rl=d[i++],r=d.slice(i,i+rl);i+=rl;if(d[i++]!==2)throw Error("Unsupported passkey signature.");let sl=d[i++],s=d.slice(i,i+sl);const out=new Uint8Array(64);r=r[0]===0?r.slice(1):r;s=s[0]===0?s.slice(1):s;if(r.length>32||s.length>32)throw Error("Unsupported passkey signature.");out.set(r,32-r.length);out.set(s,64-s.length);return out}
function ok(user){$("op").textContent="<Syntax>";document.body.classList.remove("locked");$("lp").value="";playMusic();window.CyberOps.start()}
function bad(){fails++;msg.innerHTML="Restricted Access - <strong>If you're not &lt;Syntax&gt;, you're not getting in.</strong>";form.classList.remove("shake");void form.offsetWidth;form.classList.add("shake");if(fails>=5){lockUntil=Date.now()+30000;fails=0}$("lp").value=""}
function stopSynth(){clearInterval(synthTimer);synthTimer=null}
function startSynth(){stopSynth();musicCtx=musicCtx||new(window.AudioContext||window.webkitAudioContext)();musicCtx.resume();noteIndex=0;const scales={pulse:[110,146.83,164.81,220],drone:[55,82.41,110],arpeggio:[220,261.63,329.63,392,329.63,261.63]};const seq=scales[track.value]||scales.pulse;synthTimer=setInterval(()=>{const t=musicCtx.currentTime,osc=musicCtx.createOscillator(),gain=musicCtx.createGain();osc.type=track.value==="drone"?"sine":"triangle";osc.frequency.value=seq[noteIndex++%seq.length];gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(track.value==="drone"?0.045:0.035,t+.06);gain.gain.exponentialRampToValueAtTime(.0001,t+(track.value==="drone"?1.6:.45));osc.connect(gain);gain.connect(musicCtx.destination);osc.start(t);osc.stop(t+(track.value==="drone"?1.65:.5))},track.value==="drone"?1200:track.value==="arpeggio"?240:420)}
function playMusic(){musicEnabled=true;if(track.value==="default"){stopSynth();bgm.volume=.5;bgm.play().then(()=>setMus(true)).catch(()=>setMus(false))}else{bgm.pause();startSynth();setMus(true)}}
function setMus(on){mus.setAttribute("aria-pressed",on);mus.textContent=on?"Music":"Music off"}
function toggleMusic(){if(musicEnabled){musicEnabled=false;bgm.pause();stopSynth();setMus(false)}else playMusic()}
track.onchange=()=>{localStorage.setItem("syntax:music-track",track.value);if(musicEnabled)playMusic()};mus.onclick=toggleMusic;
addEventListener("keydown",e=>{if(e.key.toLowerCase()==="m"&&!e.ctrlKey&&!e.metaKey&&!document.body.classList.contains("locked")&&!/INPUT/.test(e.target.tagName))toggleMusic()});
document.addEventListener("visibilitychange",()=>{if(document.hidden){wasPlaying=musicEnabled;bgm.pause();stopSynth()}else if(wasPlaying)playMusic()});
$("out").onclick=()=>{bgm.pause();location.reload()};
})();
