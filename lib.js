// מימוש חלקי של ספריות Java/Android מעל ה-DOM
const Lib={},Str={},Num={};
const log=(...a)=>{const e=document.getElementById('log');e.textContent+=a.join(' ')+'\n'};
const LibSup={'Ljava/lang/Throwable;':'Ljava/lang/Object;','Ljava/lang/Exception;':'Ljava/lang/Throwable;','Ljava/lang/RuntimeException;':'Ljava/lang/Exception;'};
class JEx{constructor(){this.$cn='Ljava/lang/Throwable;'}$init(m){this.m=typeof m=='string'?m:null}getMessage(){return this.m??null}
 toString(){return this.$cn.slice(1,-1).replace(/\//g,'.')+(this.m?': '+this.m:'')}printStackTrace(){log(this.toString())}}
for(const n of['Throwable','Exception','RuntimeException','IllegalArgumentException','IllegalStateException','NullPointerException','ArithmeticException','NumberFormatException','ArrayIndexOutOfBoundsException','IndexOutOfBoundsException','UnsupportedOperationException','ClassCastException']){
 const d='Ljava/lang/'+n+';';Lib[d]=class extends JEx{constructor(){super();this.$cn=d}};
 if(!LibSup[d])LibSup[d]='Ljava/lang/RuntimeException;'}
Lib['Ljava/lang/Object;']=class{$init(){}};
const wrap=e=>e.$w||new View(e),txt=t=>typeof t=='number'?(resolve(1,t,R)??''):t===null?'null':String(t);
class View{
 constructor(e){this.el=e;e.$w=this}
 setText(t){const e=this.el;if(e.tagName=='INPUT')e.value=txt(t);else e.textContent=txt(t)}
 getText(){return this.el.tagName=='INPUT'?this.el.value:this.el.textContent}
 setHint(t){this.el.placeholder=txt(t)}
 setOnClickListener(l){this.el.onclick=l?()=>vm.safe(()=>vm.callApp(l,'onClick',[this])):null}
 performClick(){this.el.click()}
 setVisibility(v){this.el.style.display=v==8?'none':'';this.el.style.visibility=v==4?'hidden':''}
 getVisibility(){return this.el.style.display=='none'?8:this.el.style.visibility=='hidden'?4:0}
 setEnabled(b){this.el.disabled=!b;this.el.style.opacity=b?'':'.5'}
 isEnabled(){return!this.el.disabled}
 getId(){return+(this.el.dataset.id||-1)}
 setTextColor(c){const h=(c>>>0).toString(16).padStart(8,'0');this.el.style.color='#'+h.slice(2)+h.slice(0,2)}
 setBackgroundColor(c){const h=(c>>>0).toString(16).padStart(8,'0');this.el.style.background='#'+h.slice(2)+h.slice(0,2)}
 setTextSize(a,b){this.el.style.fontSize=(b??a)+'px'}
}
class Activity{
 $init(){}onCreate(){}onStart(){}onResume(){}onPause(){}onStop(){}onDestroy(){}setTitle(){}getSystemService(){return null}
 setContentView(x){const p=document.getElementById('phone');
  if(typeof x=='number'){const r=R.res[x],path=r&&R.gpool[r.d],root=LAY[path];if(!root)throw new Error('layout לא נמצא: '+x);
   const e=renderNode(root,null);e.style.width=e.style.height='100%';p.replaceChildren(e)}else p.replaceChildren(x.el);
  p.querySelectorAll('[data-onclick]').forEach(e=>e.onclick=()=>vm.safe(()=>vm.callApp(this.$app,e.dataset.onclick,[wrap(e)])))}
 findViewById(id){const e=document.querySelector(`#phone [data-id="${id}"]`);return e?wrap(e):null}
 getString(id){return resolve(1,id,R)??''}
 finish(){log('[finish]')}
 runOnUiThread(r){vm.callApp(r,'run',[])}
 getApplicationContext(){return this}
}
for(const n of['Landroid/app/Activity;','Landroidx/appcompat/app/AppCompatActivity;','Landroidx/fragment/app/FragmentActivity;','Landroidx/activity/ComponentActivity;'])Lib[n]=Activity;
class Toast{static makeText(c,t){const x=new Toast();x.t=txt(t);return x}show(){const e=document.createElement('div');e.textContent=this.t;
 e.style.cssText='position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 16px;border-radius:20px;z-index:9';document.body.append(e);setTimeout(()=>e.remove(),2000)}}
Lib['Landroid/widget/Toast;']=Toast;
Lib['Landroid/util/Log;']=Object.fromEntries('dieswv'.split('').map(k=>[k,(t,m)=>{log(k.toUpperCase()+'/'+t+': '+m);return 0}]));
class PS{println(x){log(x===undefined?'':txt(x))}print(x){log(txt(x))}}
Lib['Ljava/io/PrintStream;']=PS;
Lib['Ljava/lang/System;']={out:new PS(),err:new PS(),currentTimeMillis:()=>Date.now(),nanoTime:()=>Math.round(performance.now()*1e6)};
const fmt=(...a)=>{if(typeof a[0]!='string')a.shift();const[f,v]=a;let i=0;return f.replace(/%(\.\d+)?([sdf%])/g,(m,p,t)=>t=='%'?'%':t=='f'?(+v[i++]).toFixed(p?+p.slice(1):6):txt(v[i++]))};
Lib['Ljava/lang/String;']={valueOf:x=>txt(x),format:fmt};
Lib['Ljava/lang/Integer;']={valueOf:x=>typeof x=='string'?Lib['Ljava/lang/Integer;'].parseInt(x):x,parseInt:s=>{if(!/^[+-]?\d+$/.test(s))vm.thr('Ljava/lang/NumberFormatException;','For input string: "'+s+'"');return+s|0},toString:x=>String(x),compare:(a,b)=>a<b?-1:a>b?1:0,MAX_VALUE:2147483647,MIN_VALUE:-2147483648};
Lib['Ljava/lang/Long;']={valueOf:x=>+x,parseLong:s=>+s,toString:x=>String(x)};
Lib['Ljava/lang/Double;']={valueOf:x=>+x,parseDouble:s=>+s,toString:x=>String(x)};
Lib['Ljava/lang/Boolean;']={valueOf:x=>x};
Lib['Ljava/lang/Math;']=Object.fromEntries(['abs','max','min','pow','sqrt','floor','ceil','round','sin','cos','random'].map(k=>[k,Math[k]]));
Object.assign(Str,{length:s=>s.length,charAt:(s,i)=>s.charCodeAt(i),equals:(s,o)=>+(s===o),isEmpty:s=>+(s.length==0),toString:s=>s,substring:(s,a,b)=>s.substring(a,b),
 indexOf:(s,x)=>s.indexOf(typeof x=='number'?String.fromCharCode(x):x),contains:(s,x)=>+s.includes(x),toUpperCase:s=>s.toUpperCase(),toLowerCase:s=>s.toLowerCase(),trim:s=>s.trim(),
 concat:(s,x)=>s+x,equalsIgnoreCase:(s,o)=>+(o!=null&&s.toLowerCase()==o.toLowerCase()),startsWith:(s,x)=>+s.startsWith(x),endsWith:(s,x)=>+s.endsWith(x),
 replace:(s,a,b)=>s.split(typeof a=='number'?String.fromCharCode(a):a).join(typeof b=='number'?String.fromCharCode(b):b),split:(s,x)=>s.split(new RegExp(x)),
 compareTo:(s,o)=>s<o?-1:s>o?1:0,hashCode:s=>[...s].reduce((h,c)=>Math.imul(h,31)+c.charCodeAt(0)|0,0),toCharArray:s=>[...s].map(c=>c.charCodeAt(0)),getClass:s=>s});
Object.assign(Num,{intValue:x=>x|0,longValue:x=>x,doubleValue:x=>x,floatValue:x=>x,booleanValue:x=>x,toString:x=>String(x),equals:(x,o)=>+(x===o),hashCode:x=>x|0,compareTo:(a,b)=>a<b?-1:a>b?1:0});
Lib['Ljava/lang/StringBuilder;']=class{$init(x){this.s=typeof x=='string'?x:''}append(x){this.s+=txt(x);return this}toString(){return this.s}length(){return this.s.length}
 reverse(){this.s=[...this.s].reverse().join('');return this}insert(i,x){this.s=this.s.slice(0,i)+txt(x)+this.s.slice(i);return this}};
Lib['Ljava/lang/StringBuffer;']=Lib['Ljava/lang/StringBuilder;'];
class Iter{constructor(a){this.a=a;this.i=0}hasNext(){return this.i<this.a.length}next(){return this.a[this.i++]}}
class AL{$init(){this.a=[]}add(x,y){if(y===undefined)this.a.push(x);else this.a.splice(x,0,y);return 1}get(i){if(i<0||i>=this.a.length)vm.thr('Ljava/lang/IndexOutOfBoundsException;','Index: '+i);return this.a[i]}
 set(i,x){const o=this.a[i];this.a[i]=x;return o}size(){return this.a.length}isEmpty(){return this.a.length==0}clear(){this.a=[]}contains(x){return this.a.includes(x)}indexOf(x){return this.a.indexOf(x)}
 remove(x){if(typeof x=='number')return this.a.splice(x,1)[0];const i=this.a.indexOf(x);if(i>=0)this.a.splice(i,1);return i>=0}iterator(){return new Iter(this.a)}toString(){return'['+this.a.map(txt).join(', ')+']'}}
Lib['Ljava/util/ArrayList;']=AL;Lib['Ljava/util/List;']=AL;
Lib['Ljava/util/HashMap;']=class{$init(){this.m=new Map()}put(k,v){const o=this.m.get(k);this.m.set(k,v);return o??null}get(k){return this.m.get(k)??null}containsKey(k){return this.m.has(k)}
 remove(k){const o=this.m.get(k);this.m.delete(k);return o??null}size(){return this.m.size}isEmpty(){return this.m.size==0}clear(){this.m.clear()}
 keySet(){const l=new AL();l.a=[...this.m.keys()];return l}values(){const l=new AL();l.a=[...this.m.values()];return l}};
