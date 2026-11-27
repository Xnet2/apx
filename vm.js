// מפרש Dalvik (DEX) ב-JavaScript. אוגרים לא-טיפוסיים; long/double מיוצגים כ-Number (דיוק עד 2^53).
const D=t=>'ZBSCIJFD'.includes(t[0])?0:null,S16=x=>x<<16>>16;
const toInt=x=>x!=x?0:x>=2147483647?2147483647:x<=-2147483648?-2147483648:Math.trunc(x);
const U1=[x=>-x|0,x=>~x,x=>-x,x=>-x-1,x=>-x,x=>-x,x=>x,x=>Math.fround(x),x=>x,x=>Number(BigInt.asIntN(32,BigInt(x))),x=>Math.fround(x),x=>x,toInt,x=>Math.trunc(x)||0,x=>x,toInt,x=>Math.trunc(x)||0,x=>Math.fround(x),x=>x<<24>>24,x=>x&65535,x=>x<<16>>16];
class JT{constructor(o){this.o=o}}
class Dex{
 constructor(b){this.v=new DataView(b);this.u=new Uint8Array(b);this.sc={};this.mc={};const g=this.g=o=>this.v.getUint32(o,true);this.h=[0x3c,0x44,0x4c,0x54,0x5c,0x60,0x64].map(g)}
 u16(o){return this.v.getUint16(o,true)}
 str(i){return this.sc[i]??(this.sc[i]=(()=>{let p=this.g(this.h[0]+i*4);while(this.u[p++]&128);let e=p;while(this.u[e])e++;return new TextDecoder().decode(this.u.subarray(p,e))})())}
 type(i){return this.str(this.g(this.h[1]+i*4))}
 tl(o){if(!o)return[];const n=this.g(o),a=[];for(let i=0;i<n;i++)a.push(this.type(this.u16(o+4+i*2)));return a}
 proto(i){const o=this.h[2]+i*12,params=this.tl(this.g(o+8)),ret=this.type(this.g(o+4));return{params,ret,sig:'('+params.join('')+')'+ret}}
 field(i){const o=this.h[3]+i*8;return{cls:this.type(this.u16(o)),type:this.type(this.u16(o+2)),name:this.str(this.g(o+4))}}
 method(i){return this.mc[i]||(this.mc[i]=(o=>({cls:this.type(this.u16(o)),proto:this.proto(this.u16(o+2)),name:this.str(this.g(o+4))}))(this.h[4]+i*8))}
 uleb(p){let r=0,s=0,b;do{b=this.u[p.i++];r|=(b&127)<<s;s+=7}while(b&128);return r>>>0}
 sleb(p){let r=0,s=0,b;do{b=this.u[p.i++];r|=(b&127)<<s;s+=7}while(b&128);if(s<32&&(b&64))r|=-1<<s;return r}
 ev(p){const h=this.u[p.i++],t=h&31,n=(h>>5)+1;if(t==0x1e)return null;if(t==0x1f)return h>>5;
  if(t==0x1c){const k=this.uleb(p),a=[];for(let i=0;i<k;i++)a.push(this.ev(p));return a}
  let x=0;for(let i=0;i<n;i++)x+=this.u[p.i++]*2**(8*i);
  if(t==0x17)return this.str(x);
  if(t==0||t==2||t==4||t==6){const b=8*n;if(x>=2**(b-1))x-=2**b}
  return x}
 code(o){const g=this.g,regs=this.u16(o),ins=this.u16(o+2),nt=this.u16(o+6),sz=g(o+12),insns=new Uint16Array(this.u.slice(o+16,o+16+sz*2).buffer),tr=[];
  if(nt){const tb=o+16+sz*2+(sz&1)*2,hb=tb+nt*8;for(let i=0;i<nt;i++){const t=tb+i*8,p={i:hb+this.u16(t+6)},z=this.sleb(p),h=[];for(let k=0;k<Math.abs(z);k++){const ty=this.uleb(p);h.push([this.type(ty),this.uleb(p)])}if(z<=0)h.push([null,this.uleb(p)]);tr.push({s:g(t),n:this.u16(t+4),h})}}
  return{regs,ins,insns,tr}}
 classes(){const[,,,,,cn,co]=this.h,g=this.g,out=[];
  for(let i=0;i<cn;i++){const o=co+i*32,sup=g(o+8),c={name:this.type(g(o)),sup:sup==0xFFFFFFFF?null:this.type(sup),ifs:this.tl(g(o+12)),m:{},sf:[],sv:[]},cd=g(o+24);
   if(cd){const p={i:cd},U=()=>this.uleb(p),ns=U(),ni=U(),nd=U(),nv=U();let x=0;
    for(let k=0;k<ns;k++){x+=U();U();c.sf.push(this.field(x))}
    for(let k=0;k<ni;k++){U();U()}
    for(const n of[nd,nv]){x=0;for(let k=0;k<n;k++){x+=U();const acc=U(),cf=U(),mr=this.method(x);
     c.m[mr.name+mr.proto.sig]={name:mr.name,params:mr.proto.params,ret:mr.proto.ret,static:!!(acc&8),cls:c,d:this,code:cf?this.code(cf):null}}}}
   const sv=g(o+28);if(sv){const p={i:sv},n=this.uleb(p);for(let k=0;k<n;k++)c.sv.push(this.ev(p))}
   out.push(c)}
  return out}
}
const ARITH='Ljava/lang/ArithmeticException;',NPE='Ljava/lang/NullPointerException;',AIOOBE='Ljava/lang/ArrayIndexOutOfBoundsException;';
class DexVM{
 constructor(bufs){this.C={};this.S={};this.ids=0;for(const b of bufs)for(const c of new Dex(b).classes())this.C[c.name]=c}
 thr(d,m){const e=new Lib[d]();e.$init(m);throw new JT(e)}
 nope(mr){throw new Error('לא נתמך עדיין: '+mr.cls+'->'+mr.name)}
 init(n){const c=this.C[n];if(!c||c.done)return;c.done=1;if(c.sup)this.init(c.sup);const s=this.S[n]={};c.sf.forEach((f,i)=>s[f.name]=c.sv[i]!==undefined?c.sv[i]:D(f.type));const m=c.m['<clinit>()V'];if(m)this.run(m,[])}
 sref(cls,name){for(let n=cls;n;n=this.C[n]?this.C[n].sup:null){this.init(n);if(this.S[n]&&name in this.S[n])return this.S[n];const c=this.C[n];if(c)for(const i of c.ifs){this.init(i);if(this.S[i]&&name in this.S[i])return this.S[i]}}
  if(Lib[cls]&&name in Lib[cls])return Lib[cls];throw new Error('שדה סטטי לא נתמך: '+cls+'.'+name)}
 mk(n){this.init(n);const o={$c:this.C[n],f:{},id:++this.ids};let d=n;while(this.C[d])d=this.C[d].sup;const L=Lib[d];o.$b=L?new L():null;if(o.$b)o.$b.$app=o;return o}
 mk2(n){if(this.C[n])return this.mk(n);const L=Lib[n];if(!L)throw new Error('מחלקה לא נתמכת: '+n);return new L()}
 findM(c,k){for(;c;c=this.C[c.sup])if(c.m[k])return c.m[k]}
 isa(d,t){for(;d;d=this.C[d]?this.C[d].sup:LibSup[d]){if(d==t||t=='Ljava/lang/Object;')return 1;const c=this.C[d];if(c&&c.ifs.includes(t))return 1}return 0}
 inst(o,t){return o==null?0:this.isa(o.$c?o.$c.name:typeof o=='string'?'Ljava/lang/String;':typeof o=='number'?'Ljava/lang/Integer;':o.$cn||'Ljava/lang/Object;',t)}
 safe(f){try{f()}catch(e){log('⚠ '+(e instanceof JT?'חריגה: '+e.o:e.message))}}
 callApp(o,name,args){if(!o.$c)return o[name]&&o[name](...args);for(let k=o.$c;k;k=this.C[k.sup])for(const key in k.m){const m=k.m[key];if(m.name==name&&m.params.length==args.length)return this.run(m,[o,...args])}}
 launch(d){const o=this.mk(d),pr=(s,p)=>({cls:d,name:s,proto:{sig:'('+p.join('')+')V',params:p}});
  this.inv('direct',pr('<init>',[]),[o]);this.inv('virtual',pr('onCreate',['Landroid/os/Bundle;']),[o,null]);this.inv('virtual',pr('onStart',[]),[o]);this.inv('virtual',pr('onResume',[]),[o])}
 inv(kind,mr,args){const key=mr.name+mr.proto.sig;let m;
  if(kind=='static'){this.init(mr.cls);m=this.findM(this.C[mr.cls],key);return m?this.run(m,args):this.lib(mr,null,args,1)}
  const o=args[0];if(o==null)this.thr(NPE,mr.name);
  if(o.$c){m=this.findM(kind=='virtual'||kind=='interface'?o.$c:this.C[mr.cls],key);if(m)return this.run(m,args);
   const b=o.$b,a=args.slice(1);if(mr.name=='<init>')return b&&b.$init?b.$init(...a):undefined;
   if(b&&typeof b[mr.name]=='function')return this.fx(b[mr.name](...a));return this.objM(o,mr,a)}
  return this.lib(mr,o,args.slice(1))}
 fx(x){return typeof x=='boolean'?+x:x===undefined?0:x}
 objM(o,mr,a){const n=mr.name;if(n=='equals')return+(o===a[0]);if(n=='hashCode')return o.id||(o.id=++this.ids);if(n=='toString')return o.$c?o.$c.name+'@'+o.id:String(o);if(n=='getClass')return o;this.nope(mr)}
 lib(mr,o,a,st){const n=mr.name;
  if(st){const L=Lib[mr.cls];if(!L||!L[n])this.nope(mr);return this.fx(L[n](...a))}
  if(typeof o=='string'){const f=Str[n];if(!f)this.nope(mr);return this.fx(f(o,...a))}
  if(typeof o=='number'){const f=Num[n];if(!f)this.nope(mr);return this.fx(f(o,...a))}
  if(Array.isArray(o)){if(n=='clone')return o.slice();this.nope(mr)}
  if(n=='<init>')return o.$init&&o.$init(...a);
  if(typeof o[n]=='function'&&n!='toString'||n=='toString'&&o.toString!==Object.prototype.toString)return this.fx(o[n](...a));
  return this.objM(o,mr,a)}
 bin(i,a,b){
  if(i<11)switch(i){case 0:return a+b|0;case 1:return a-b|0;case 2:return Math.imul(a,b);case 3:if(!b)this.thr(ARITH,'/ by zero');return a/b|0;case 4:if(!b)this.thr(ARITH,'/ by zero');return a%b|0;case 5:return a&b;case 6:return a|b;case 7:return a^b;case 8:return a<<b;case 9:return a>>b;default:return a>>>b|0}
  if(i<22){i-=11;const B=BigInt,N=x=>Number(B.asIntN(64,x)),s=B(b&63);
   switch(i){case 0:return a+b;case 1:return a-b;case 2:return N(B(a)*B(b));case 3:if(!b)this.thr(ARITH,'/ by zero');return Math.trunc(a/b);case 4:if(!b)this.thr(ARITH,'/ by zero');return a%b;
    case 5:return N(B(a)&B(b));case 6:return N(B(a)|B(b));case 7:return N(B(a)^B(b));case 8:return N(B(a)<<s);case 9:return N(B(a)>>s);default:return N(B.asUintN(64,B(a))>>s)}}
  const f=i<27?Math.fround:x=>x;i=(i-22)%5;return f([a+b,a-b,a*b,a/b,a%b][i])}
 catchAt(c,pc,e){for(const t of c.tr)if(pc>=t.s&&pc<t.s+t.n)for(const[ty,ad]of t.h)if(ty==null||this.inst(e,ty))return ad;return-1}
 run(m,args){
  const c=m.code;if(!c)throw new Error('מתודה native/abstract: '+m.cls.name+'.'+m.name);
  const r=new Array(c.regs).fill(0),I=c.insns,d=m.d;let k=c.regs-c.ins,ai=0,pc=0,ret,exc;
  if(!m.static)r[k++]=args[ai++];for(const p of m.params){r[k++]=args[ai++];if(p=='J'||p=='D')k++}
  const L32=o=>I[o]|(I[o+1]<<16),CM=[(a,b)=>a==b,(a,b)=>a!=b,(a,b)=>a<b,(a,b)=>a>=b,(a,b)=>a>b,(a,b)=>a<=b];
  for(;;){try{for(;;){
   const w=I[pc],op=w&255,A=(w>>8)&15,B=w>>12,AA=w>>8;
   switch(op){
    case 0:pc++;break;
    case 1:case 4:case 7:r[A]=r[B];pc++;break;
    case 2:case 5:case 8:r[AA]=r[I[pc+1]];pc+=2;break;
    case 3:case 6:case 9:r[I[pc+1]]=r[I[pc+2]];pc+=3;break;
    case 10:case 11:case 12:r[AA]=ret;pc++;break;
    case 13:r[AA]=exc;pc++;break;
    case 14:return;
    case 15:case 16:case 17:return r[AA];
    case 0x12:r[A]=B<<28>>28;pc++;break;
    case 0x13:case 0x16:r[AA]=S16(I[pc+1]);pc+=2;break;
    case 0x14:case 0x17:r[AA]=L32(pc+1);pc+=3;break;
    case 0x15:r[AA]=I[pc+1]<<16;pc+=2;break;
    case 0x18:r[AA]=Number(BigInt.asIntN(64,BigInt(L32(pc+1)>>>0)|(BigInt(L32(pc+3))<<32n)));pc+=5;break;
    case 0x19:r[AA]=S16(I[pc+1])*2**48;pc+=2;break;
    case 0x1a:r[AA]=d.str(I[pc+1]);pc+=2;break;
    case 0x1b:r[AA]=d.str(L32(pc+1));pc+=3;break;
    case 0x1c:r[AA]=d.type(I[pc+1]);pc+=2;break;
    case 0x1d:case 0x1e:pc++;break;
    case 0x1f:pc+=2;break;
    case 0x20:r[A]=this.inst(r[B],d.type(I[pc+1]));pc+=2;break;
    case 0x21:if(r[B]==null)this.thr(NPE,'array');r[A]=r[B].length;pc++;break;
    case 0x22:r[AA]=this.mk2(d.type(I[pc+1]));pc+=2;break;
    case 0x23:r[A]=new Array(r[B]).fill(D(d.type(I[pc+1]).slice(1)));pc+=2;break;
    case 0x24:case 0x25:{const rg=op==0x25,n=rg?AA:B,cr=I[pc+2];ret=Array.from({length:n},(_,i)=>r[rg?cr+i:[cr&15,(cr>>4)&15,(cr>>8)&15,cr>>12,A][i]]);pc+=3;break}
    case 0x26:{const q=pc+L32(pc+1),ww=I[q+1],n=L32(q+2),dv=new DataView(I.buffer),a=r[AA];for(let i=0;i<n;i++){const o=(q+4)*2+i*ww;a[i]=ww==1?dv.getInt8(o):ww==2?dv.getInt16(o,true):ww==4?dv.getInt32(o,true):Number(dv.getBigInt64(o,true))}pc+=3;break}
    case 0x27:throw new JT(r[AA]);
    case 0x28:pc+=w>>8<<24>>24;break;
    case 0x29:pc+=S16(I[pc+1]);break;
    case 0x2a:pc+=L32(pc+1);break;
    case 0x2b:case 0x2c:{const q=pc+L32(pc+1),n=I[q+1],v=r[AA];let t=3;
     if(op==0x2b){const i=v-L32(q+2);if(i>=0&&i<n)t=L32(q+4+2*i)}else for(let i=0;i<n;i++)if(L32(q+2+2*i)==v){t=L32(q+2+2*n+2*i);break}
     pc+=t;break}
    case 0x2d:case 0x2e:case 0x2f:case 0x30:case 0x31:{const a=r[I[pc+1]&255],b=r[I[pc+1]>>8];r[AA]=a>b?1:a<b?-1:a==b?0:(op&1?-1:1);pc+=2;break}
    default:
     if(op>=0x32&&op<=0x37){pc+=CM[op-0x32](r[A],r[B])?S16(I[pc+1]):2;break}
     if(op>=0x38&&op<=0x3d){const x=r[AA]==null?0:r[AA];pc+=CM[op-0x38](x,0)?S16(I[pc+1]):2;break}
     if(op>=0x44&&op<=0x51){const a=r[I[pc+1]&255],i=r[I[pc+1]>>8];if(a==null)this.thr(NPE,'array');if(i<0||i>=a.length)this.thr(AIOOBE,'index '+i);
      if(op<0x4b)r[AA]=a[i];else a[i]=r[AA];pc+=2;break}
     if(op>=0x52&&op<=0x5f){const f=d.field(I[pc+1]),o=r[B];if(o==null)this.thr(NPE,f.name);
      if(op<0x59){const v=o.f[f.name];r[A]=v===undefined?D(f.type):v}else o.f[f.name]=r[A];pc+=2;break}
     if(op>=0x60&&op<=0x6d){const f=d.field(I[pc+1]),s=this.sref(f.cls,f.name);if(op<0x67)r[AA]=s[f.name];else s[f.name]=r[AA];pc+=2;break}
     if(op>=0x6e&&op<=0x78&&op!=0x73){
      const rg=op>=0x74,kind=['virtual','super','direct','static','interface'][op-(rg?0x74:0x6e)],mr=d.method(I[pc+1]),cr=I[pc+2];
      const rs=rg?Array.from({length:AA},(_,i)=>cr+i):[cr&15,(cr>>4)&15,(cr>>8)&15,cr>>12,A].slice(0,B),a=[];let j=0;
      if(kind!='static')a.push(r[rs[j++]]);for(const p of mr.proto.params){a.push(r[rs[j++]]);if(p=='J'||p=='D')j++}
      ret=this.inv(kind,mr,a);pc+=3;break}
     if(op>=0x7b&&op<=0x8f){r[A]=U1[op-0x7b](r[B]);pc++;break}
     if(op>=0x90&&op<=0xaf){const a=r[I[pc+1]&255],b=r[I[pc+1]>>8];r[AA]=this.bin(op-0x90,a,b);pc+=2;break}
     if(op>=0xb0&&op<=0xcf){r[A]=this.bin(op-0xb0,r[A],r[B]);pc++;break}
     if(op>=0xd0&&op<=0xd7){const l=S16(I[pc+1]),i=op-0xd0;r[A]=i==1?this.bin(1,l,r[B]):this.bin(i,r[B],l);pc+=2;break}
     if(op>=0xd8&&op<=0xe2){const l=I[pc+1]>>8<<24>>24,x=r[I[pc+1]&255],i=op-0xd8;r[AA]=i==1?this.bin(1,l,x):this.bin(i,x,l);pc+=2;break}
     throw new Error('פקודה לא נתמכת: 0x'+op.toString(16)+' ב-'+m.cls.name+'.'+m.name);
   }
  }}catch(e){if(!(e instanceof JT))throw e;const h=this.catchAt(c,pc,e.o);if(h<0)throw e;exc=e.o;pc=h}}
 }
}
