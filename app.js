const $=s=>document.querySelector(s);
let Z,R={res:{},gpool:[]},M,CLS=[];
const TABS={info:'מידע',lay:'מסכים (Layouts)',cls:'מחלקות',files:'קבצים'};
$('#tabs').innerHTML=Object.entries(TABS).map(([k,v])=>`<button data-k="${k}">${v}</button>`).join('');
$('#tabs').onclick=e=>{const k=e.target.dataset.k;if(!k)return;
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.k==k));
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.id=='t-'+k))};
$('#tabs button').click();
$('#f').onchange=e=>load(e.target.files[0]);
document.body.ondragover=e=>e.preventDefault();
document.body.ondrop=e=>{e.preventDefault();load(e.dataTransfer.files[0])};
const walk=(e,f)=>{f(e);e.kids.forEach(k=>walk(k,f))};

async function load(file){
  if(!file)return;$('#st').textContent='טוען…';
  try{
    Z=await JSZip.loadAsync(file);
    M=parseAXML(await Z.file('AndroidManifest.xml').async('arraybuffer'));
    const ar=Z.file('resources.arsc');R=ar?parseARSC(await ar.async('arraybuffer')):{res:{},gpool:[]};
    await preload();await info();layouts();await classes();files();$('#st').textContent=file.name;
  }catch(err){$('#st').textContent='שגיאה: '+err.message}
}
async function info(){
  const app=M.kids.find(k=>k.tag=='application'),perms=[],acts=[];
  walk(M,e=>{if(e.tag=='uses-permission')perms.push(at(e,'name'));if(e.tag=='activity')acts.push(at(e,'name'))});
  const sdk=M.kids.find(k=>k.tag=='uses-sdk');
  let ic=null;if(app&&app.attrs.icon){ic=await blobUrl(at(app,'icon'))}
  $('#t-info').innerHTML=`<img id="icon" ${ic?`src="${ic}"`:''}><dl>
  <dt>Package</dt><dd>${esc(at(M,'package'))}</dd>
  <dt>Name</dt><dd>${esc(app&&at(app,'label')||'')}</dd>
  <dt>Version</dt><dd>${esc(at(M,'versionName')||'')} (${esc(at(M,'versionCode')||'')})</dd>
  <dt>minSdk</dt><dd>${esc(sdk&&at(sdk,'minSdkVersion')||'')}</dd>
  <dt>targetSdk</dt><dd>${esc(sdk&&at(sdk,'targetSdkVersion')||'')}</dd>
  <dt>Permissions</dt><dd>${perms.map(esc).join('<br>')}</dd>
  <dt>Activities</dt><dd>${acts.map(esc).join('<br>')}</dd></dl>`;
}
function layouts(){
  const L=Object.keys(Z.files).filter(n=>/^res\/layout[^/]*\/[^/]+\.xml$/.test(n)).sort();
  $('#t-lay').innerHTML=L.map(n=>`<div class="row" data-p="${esc(n)}">${esc(n)}</div>`).join('')||'לא נמצאו קבצי layout';
  $('#t-lay').onclick=e=>e.target.dataset.p&&show(e.target.dataset.p);
}
async function show(p){
  try{
    const root=parseAXML(await Z.file(p).async('arraybuffer')),d=await renderNode(root,null);
    d.style.width='100%';d.style.height='100%';$('#phone').replaceChildren(d);
  }catch(err){$('#phone').textContent='שגיאה בתצוגה: '+err.message}
}
async function classes(){
  CLS=[];
  for(const n of Object.keys(Z.files).filter(n=>/^classes\d*\.dex$/.test(n)))
    CLS.push(...parseDex(await Z.file(n).async('arraybuffer')));
  const draw=()=>{const q=$('#q').value.toLowerCase(),r=CLS.filter(c=>c.toLowerCase().includes(q));
    $('#cls').innerHTML=`<div>${r.length} / ${CLS.length}</div>`+r.slice(0,1500).map(c=>`<div class="row">${esc(c)}</div>`).join('')};
  $('#q').oninput=draw;draw();
}
function files(){
  $('#t-files').innerHTML=Object.keys(Z.files).filter(n=>!Z.files[n].dir).map(n=>`<div class="row">${esc(n)}</div>`).join('');
}

let vm;
$('#run').onclick=async()=>{
  if(!Z)return;$('#log').textContent='';
  try{
    const bufs=[];for(const n of Object.keys(Z.files).filter(n=>/^classes\d*\.dex$/.test(n)))bufs.push(await Z.file(n).async('arraybuffer'));
    const pkg=at(M,'package');let act=null;
    walk(M,e=>{if(e.tag=='activity'&&!act){let ok=0;walk(e,x=>{if(x.tag=='action'&&at(x,'name')=='android.intent.action.MAIN')ok=1});if(ok)act=at(e,'name')}});
    if(!act)throw new Error('לא נמצאה Activity ראשית');
    const n=act[0]=='.'?pkg+act:act.includes('.')?act:pkg+'.'+act;
    $('#phone').replaceChildren();vm=new DexVM(bufs);vm.launch('L'+n.replace(/\./g,'/')+';');
  }catch(e){$('#log').textContent+='⚠ '+(e.message||String(e.o||e))+'\n'}
};
