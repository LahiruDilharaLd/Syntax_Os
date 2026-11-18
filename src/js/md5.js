/* Minimal MD5 (RFC 1321) – returns lowercase hex. Web Crypto has no MD5, so it is implemented here. */
function md5(str){
 const bytes=new TextEncoder().encode(str);
 const S=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
 const K=new Uint32Array(64);for(let i=0;i<64;i++)K[i]=Math.floor(Math.abs(Math.sin(i+1))*4294967296);
 const n=bytes.length,len=(((n+8)>>6)+1)<<6,buf=new Uint8Array(len);
 buf.set(bytes);buf[n]=0x80;
 const dv=new DataView(buf.buffer);
 dv.setUint32(len-8,(n*8)>>>0,true);dv.setUint32(len-4,Math.floor(n*8/4294967296),true);
 let a0=0x67452301,b0=0xefcdab89|0,c0=0x98badcfe|0,d0=0x10325476;
 for(let o=0;o<len;o+=64){
  const M=new Uint32Array(16);for(let i=0;i<16;i++)M[i]=dv.getUint32(o+i*4,true);
  let A=a0,B=b0,C=c0,D=d0;
  for(let i=0;i<64;i++){
   let F,g;
   if(i<16){F=(B&C)|(~B&D);g=i}
   else if(i<32){F=(D&B)|(~D&C);g=(5*i+1)%16}
   else if(i<48){F=B^C^D;g=(3*i+5)%16}
   else{F=C^(B|~D);g=(7*i)%16}
   F=(F+A+K[i]+M[g])|0;A=D;D=C;C=B;
   B=(B+((F<<S[i])|(F>>>(32-S[i]))))|0;
  }
  a0=(a0+A)|0;b0=(b0+B)|0;c0=(c0+C)|0;d0=(d0+D)|0;
 }
 const out=new DataView(new ArrayBuffer(16));
 [a0,b0,c0,d0].forEach((v,i)=>out.setUint32(i*4,v,true));
 return[...new Uint8Array(out.buffer)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
if(typeof module!=="undefined")module.exports=md5;
