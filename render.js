// המרת Layout של אנדרואיד ל-HTML/CSS (קירוב, ללא הרצת קוד)
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const at=(e,n)=>{const a=e.attrs[n];return a?(a.t==3?a.v:resolve(a.t,a.v,R)):null};
const imgCache={},LAY={};
function blobUrl(p){return p&&imgCache[p]||null}
async function preload(){
  for(const k in imgCache)delete imgCache[k];
  for(const n of Object.keys(Z.files)){
    if(/^res\/.*\.(png|jpe?g|webp|gif)$/i.test(n))imgCache[n]=URL.createObjectURL(await Z.files[n].async('blob'));
    else if(/^res\/layout[^/]*\/[^/]+\.xml$/.test(n))try{LAY[n]=parseAXML(await Z.files[n].async('arraybuffer'))}catch(e){}
  }
}
const px=x=>x&&/^-?[\d.]+(dp|sp|px|pt)$/.test(x)?parseFloat(x)+'px':null;
const HB={1:'center',3:'flex-start',5:'flex-end'},VB={16:'center',48:'flex-start',80:'flex-end'};
function renderNode(el,parent){
  const tag=el.tag.split('.').pop(),d=document.createElement(/Edit/.test(el.tag)?'input':'div'),s=d.style,A=n=>at(el,n);
  const lin=/LinearLayout/.test(tag),pl=parent&&/LinearLayout/.test(parent.tag);
  const pv=pl&&parent.attrs.orientation&&parent.attrs.orientation.v==1,vert=el.attrs.orientation&&el.attrs.orientation.v==1;
  const isText=/Text|Button|Switch|CheckBox|Radio|Chip/.test(tag);
  s.boxSizing='border-box';if(el.attrs.id&&el.attrs.id.t==1)d.dataset.id=el.attrs.id.v;if(A('onClick')){d.dataset.onclick=A('onClick');s.cursor='pointer'}s.display=isText?'block':'flex';s.flexDirection=lin&&!vert?'row':'column';s.alignItems='flex-start';
  for(const k of['width','height']){const x=A('layout_'+k);if(x=='-1')s[k]='100%';else if(x&&x!='-2')s[k]=px(x)||''}
  const w=parseFloat(A('layout_weight'));if(w>0)s.flex=w+' 1 0px';
  const g=parseInt(A('gravity'))||0,h=HB[g&7],vv=VB[g&112];
  if(lin){if(vert){h&&(s.alignItems=h);vv&&(s.justifyContent=vv)}else{vv&&(s.alignItems=vv);h&&(s.justifyContent=h)}}
  else if(!isText){h&&(s.alignItems=h);vv&&(s.justifyContent=vv)}
  const lg=parseInt(A('layout_gravity'))||0;
  if(pl){const c=pv?HB[lg&7]:VB[lg&112];if(c)s.alignSelf=c}
  if(isText){
    let t=A('text')||'';const hint=A('hint');
    if(!t&&hint){t=hint;s.opacity='.55'}
    if(/CheckBox/.test(tag))t='☐ '+t;if(/Radio/.test(tag))t='◯ '+t;if(/Switch|Toggle/.test(tag))t+='  ⬤';
    if(d.tagName=='INPUT'){d.value=A('text')||'';d.placeholder=hint||'';s.opacity=''}else d.textContent=t;s.fontSize=px(A('textSize'))||'14px';
    const c=A('textColor');if(c&&c[0]=='#')s.color=c;
    const ts=+A('textStyle')||0;if(ts&1)s.fontWeight='bold';if(ts&2)s.fontStyle='italic';
    s.textAlign=h=='center'?'center':h=='flex-end'?'right':'left';
    if(/Button/.test(tag)){Object.assign(s,{background:'#6750a4',color:c&&c[0]=='#'?c:'#fff',padding:'10px 16px',borderRadius:'4px',textAlign:'center',textTransform:'uppercase',cursor:'pointer',userSelect:'none'})}
    if(/Edit/.test(tag)){s.borderBottom='1px solid #888';s.minWidth='120px'}
  }
  for(const[p,css]of[['padding','padding'],['layout_margin','margin']]){
    const all=px(A(p));if(all)s[css]=all;
    for(const[a,b]of[['Left','Left'],['Top','Top'],['Right','Right'],['Bottom','Bottom'],['Start','Left'],['End','Right']]){const x=px(A(p+a));if(x)s[css+b]=x}
  }
  const bg=A('background');
  if(bg){if(bg[0]=='#')s.background=bg;else{const u=blobUrl(bg);if(u){s.backgroundImage=`url(${u})`;s.backgroundSize='cover'}else s.background='#0001'}}
  if(/Image/.test(tag)){
    const u=blobUrl(A('src')||A('srcCompat'));
    if(u){const i=new Image();i.src=u;i.style.cssText='width:100%;height:100%;object-fit:contain';d.append(i)}
    else{d.textContent='🖼';s.background=s.background||'#e3e3e3';s.alignItems='center';s.justifyContent='center'}
    s.width=s.width||'48px';s.height=s.height||'48px';
  }
  if(/Scroll/.test(tag))s.overflow='auto';
  const vis=A('visibility');if(vis=='2')s.display='none';if(vis=='1')s.visibility='hidden';
  for(const k of el.kids)d.append(renderNode(k,el));
  return d;
}
