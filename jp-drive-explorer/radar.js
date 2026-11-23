/* 01_JP Spider Radar: public-safe Drive folder navigation, no privileged API calls. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const WORLD={width:1050,height:850,x:525,y:425,radius:318};
const OUTER=309;
const DRIVE="https://drive.google.com/drive/folders/";
const GITHUB="https://github.com/FabinGurung/";
const PAGES="https://fabingurung.github.io/";
const NAMES=[
 "A7 Registry","Site Operations","Field & Desk","Estimating & BOQ","Scheduling",
 "Drawing Coordination","Structural Analysis","Research Lab","Study Hub","Test Sandbox"
];
const TINTS=["#9bdbef","#8ff3c9","#e7c08e","#ffbd8f","#9dcaee","#d0b9f0","#a8e4fd","#f1b2cf","#86dfd6","#e5c9a5"];
const state={data:null,nodes:[],active:0,scale:1,pan:{x:0,y:0},match:null,expanded:true,pointers:new Map(),drag:null,pinch:null};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;};
const validId=s=>typeof s==="string"&&/^[\w-]+$/.test(s);
const safeHref=(kind,s)=>validId(s)?(kind==="drive"?DRIVE+encodeURIComponent(s):kind==="repo"?GITHUB+encodeURIComponent(s):PAGES+encodeURIComponent(s)+"/"):null;
const link=(label,href,cls)=>{const n=el("a",label,cls);if(href){n.href=href;n.target="_blank";n.rel="noopener noreferrer";}else{n.removeAttribute("href");n.setAttribute("aria-disabled","true");}return n;};
const angleAt=i=>(-90+i*36)*Math.PI/180;
const point=(angle,r)=>[WORLD.x+Math.cos(angle)*r,WORLD.y+Math.sin(angle)*r];
const polygon=r=>Array.from({length:10},(_,i)=>point(angleAt(i),r).map(v=>v.toFixed(1)).join(",")).join(" ");
function drawGrid(){
 const svg=$("radarGrid");
 const a=[];
 a.push('<defs><radialGradient id="radial-haze"><stop offset="0" stop-color="#72e8c3" stop-opacity=".17"/><stop offset="1" stop-color="#72e8c3" stop-opacity="0"/></radialGradient><linearGradient id="radar-beam"><stop offset="0" stop-color="#68efda" stop-opacity=".22"/><stop offset="1" stop-color="#68efda" stop-opacity="0"/></linearGradient></defs>');
 a.push('<circle class="radar-halo" cx="525" cy="425" r="315"/>');
 for(const r of [76,135,193,251,309])a.push('<polygon class="webring'+(r===309?' outer':'')+'" points="'+polygon(r)+'"/>');
 for(let i=0;i<10;i++){const [x,y]=point(angleAt(i),309);a.push('<line class="spoke" x1="525" y1="425" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>');}
 a.push('<circle class="radar-arc" cx="525" cy="425" r="334"/>');
 a.push('<g class="scan-sweep"><path d="M525 425 L525 122 A303 303 0 0 1 720 193 Z" fill="url(#radar-beam)"/></g>');
 a.push('<line id="activeRoute" class="selected-path" x1="525" y1="425" x2="525" y2="425"/>');
 svg.innerHTML=a.join("");
}
function makeNode(item,i){
 const button=el("button",undefined,"radar-node");
 button.type="button";button.dataset.index=String(i);
 const [x,y]=point(angleAt(i),OUTER);
 button.style.left=x+"px";button.style.top=y+"px";
 const ball=el("span",undefined,"node-ball");
 ball.style.setProperty("--tone",TINTS[i]);
 const strong=el("strong",item.symbol);ball.append(strong);
 const number=el("span",String(i+1).padStart(2,"0"),"node-number");
 const label=el("span",NAMES[i]||item.name,"node-title");
 button.setAttribute("aria-label","Open "+item.name+"; "+item.folders.length+" source folders");
 button.append(ball,number,label);
 button.addEventListener("click",()=>choose(i,true));
 return button;
}
function paintTableOfContents(){
 const toc=$("toc");toc.replaceChildren();
 state.data.repositories.forEach((r,i)=>{
  const button=el("button",undefined);
  button.type="button";button.dataset.index=String(i);
  const idx=el("span",String(i+1).padStart(2,"0"),"serial");
  const text=el("span",undefined,"toc-label");
  text.append(el("span",NAMES[i]||r.name),el("span",r.folders.length+" source folders","toc-count"));
  button.append(idx,text);button.addEventListener("click",()=>choose(i,true));
  toc.append(button);
 });
}
function makeAction(href,title){
 return link(title+" ↗",href);
}
function showOverview(){
 const root=state.data.root;
 $("selectedSymbol").textContent="JP";
 $("selectedTitle").textContent="01_JP Source Directory";
 $("selectedSub").textContent="Central Drive root";
 $("selectedDescription").textContent="Root of the verified repository folder directory. Ten independent repositories retain their own sources, revisions and approval rules.";
 $("inspectorActions").replaceChildren(
  makeAction(safeHref("drive",root.id),"Open root in Drive"),
  makeAction(root.start_here,"Read 00 START HERE"),
  makeAction(safeHref("drive",root.archive_folder_id),"Archive gallery")
 );
 $("folderCount").textContent="10";
 $("folderList").replaceChildren();
 state.data.repositories.forEach((r,i)=>{
  const b=el("button",undefined,"folder-card");b.type="button";
  b.append(el("span","◎","folder-icon"),el("span",NAMES[i]||r.name,"folder-name"),el("span","↗"));
  b.addEventListener("click",()=>choose(i,true));
  $("folderList").append(b);
 });
 $("trail").replaceChildren(el("span","01_JP"),el("span","/"),el("b","Directory overview"));
}
function showRepository(i){
 const r=state.data.repositories[i],list=$("folderList");
 $("selectedSymbol").textContent=r.symbol;
 $("selectedTitle").textContent=NAMES[i]||r.name;
 $("selectedSub").textContent="Repository "+String(i+1).padStart(2,"0")+" / 10";
 $("selectedDescription").textContent=r.summary;
 $("inspectorActions").replaceChildren(
  makeAction(safeHref("drive",r.drive_id),"Open original Drive"),
  makeAction(safeHref("repo",r.name),"GitHub source"),
  makeAction(safeHref("site",r.name),"Pages website")
 );
 $("folderCount").textContent=String(r.folders.length);
 list.replaceChildren();
 const q=$("search").value.trim().toLowerCase();
 const filtered=r.folders.filter(f=>!q||r.name.toLowerCase().includes(q)||(NAMES[i]||"").toLowerCase().includes(q)||r.summary.toLowerCase().includes(q)||f.name.toLowerCase().includes(q));
 filtered.forEach((f,j)=>{
  const a=link("",safeHref("drive",f.drive_id),"folder-card");a.setAttribute("aria-label","Open source folder "+f.name);
  a.append(el("span","⌑","folder-icon"));
  const content=el("span",undefined,"folder-name");content.append(el("span",f.name),el("small","Google Drive · Original folder"));
  a.append(content,el("span","↗"));
  list.append(a);
 });
 if(!filtered.length)list.append(el("p","No matching source folders for this repository.","empty-state"));
 $("trail").replaceChildren(el("span","01_JP"),el("span","/"),el("b",r.name));
}
function refreshHighlights(){
 const buttons=$("repositoryNodes").querySelectorAll(".radar-node");
 const q=$("search").value.trim().toLowerCase();
 let hits=0;
 buttons.forEach((b,i)=>{
   const r=state.data.repositories[i];
   const matched=!q||[r.name,NAMES[i],r.summary,...r.folders.map(f=>f.name)].some(s=>s.toLowerCase().includes(q));
   if(matched)hits++;
   b.classList.toggle("is-muted",!matched);
   b.classList.toggle("is-match",!!q&&matched);
   b.classList.toggle("is-active",state.active===i);
   b.setAttribute("aria-pressed",String(state.active===i));
 });
 $("toc").querySelectorAll("button").forEach((b,i)=>b.setAttribute("aria-current",String(i===state.active)));
 $("searchCount").textContent=q?(hits+" / 10 nodes match"):"10 nodes indexed";
 const route=$("activeRoute");
 if(state.active===null){route.setAttribute("x2","525");route.setAttribute("y2","425");route.style.opacity="0";}
 else{const [x,y]=point(angleAt(state.active),OUTER);route.setAttribute("x2",x.toFixed(1));route.setAttribute("y2",y.toFixed(1));route.style.opacity="1";}
}
function choose(index,scroll=false){
 state.active=index;
 if(index===null)showOverview();else showRepository(index);
 refreshHighlights();
 const slug=index===null?"all":state.data.repositories[index].name;
 try{const url=new URL(location.href);url.searchParams.set("repo",slug);history.replaceState(null,"",url);}catch{}
 if(scroll&&window.matchMedia("(max-width:650px)").matches)$("inspector").scrollIntoView({behavior:"smooth",block:"start"});
}
function apply(){
 $("radarWorld").style.transform="translate("+state.pan.x.toFixed(1)+"px,"+state.pan.y.toFixed(1)+"px) scale("+state.scale.toFixed(4)+")";
 $("zoomValue").textContent=Math.round(state.scale*100)+"%";
}
function zoomTo(next,xx,yy){
 const old=state.scale;
 const value=Math.max(.22,Math.min(2.8,next));
 state.pan.x=xx-(xx-state.pan.x)*(value/old);
 state.pan.y=yy-(yy-state.pan.y)*(value/old);
 state.scale=value;
 apply();
}
function fit(){
 const v=$("radarViewport");
 const scale=Math.max(.24,Math.min(1.08,(v.clientWidth-24)/WORLD.width,(v.clientHeight-28)/WORLD.height));
 state.scale=scale;
 state.pan={x:(v.clientWidth-WORLD.width*scale)/2,y:(v.clientHeight-WORLD.height*scale)/2};
 apply();
}
function bindGestures(){
 const v=$("radarViewport");
 v.addEventListener("wheel",e=>{e.preventDefault();const b=v.getBoundingClientRect();zoomTo(state.scale*(e.deltaY>0?.87:1.15),e.clientX-b.left,e.clientY-b.top)},{passive:false});
 v.addEventListener("pointerdown",e=>{
   if(e.target.closest("a,button"))return;
   v.setPointerCapture(e.pointerId);
   state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(state.pointers.size===1){state.drag={x:e.clientX,y:e.clientY,px:state.pan.x,py:state.pan.y};state.pinch=null;}
   if(state.pointers.size===2){const [a,b]=[...state.pointers.values()];state.pinch={dist:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),scale:state.scale};state.drag=null;}
 });
 v.addEventListener("pointermove",e=>{
   if(!state.pointers.has(e.pointerId))return;
   state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(state.pointers.size===2&&state.pinch){
     const [a,b]=[...state.pointers.values()];
     const dist=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),rect=v.getBoundingClientRect();
     zoomTo(state.pinch.scale*dist/state.pinch.dist,(a.x+b.x)/2-rect.left,(a.y+b.y)/2-rect.top);
   }else if(state.drag&&state.pointers.size===1){
     state.pan.x=state.drag.px+e.clientX-state.drag.x;
     state.pan.y=state.drag.py+e.clientY-state.drag.y;apply();
   }
 });
 const release=e=>{state.pointers.delete(e.pointerId);state.drag=null;state.pinch=null;};
 v.addEventListener("pointerup",release);
 v.addEventListener("pointercancel",release);
 v.addEventListener("lostpointercapture",release);
 $("zoomIn").addEventListener("click",()=>zoomTo(state.scale*1.22,v.clientWidth/2,v.clientHeight/2));
 $("zoomOut").addEventListener("click",()=>zoomTo(state.scale/1.22,v.clientWidth/2,v.clientHeight/2));
 $("fitView").addEventListener("click",fit);
 $("resetView").addEventListener("click",()=>{$("search").value="";choose(null);fit();});
 window.addEventListener("resize",()=>{if(state.pointers.size===0)fit()});
}
function attachSearch(){
 $("search").addEventListener("input",()=>{
   refreshHighlights();
   if(state.active!==null)showRepository(state.active);
   const q=$("search").value.trim().toLowerCase();
   if(!q)return;
   const matched=state.data.repositories.map((r,i)=>({r,i})).filter(({r,i})=>[r.name,NAMES[i],r.summary,...r.folders.map(f=>f.name)].some(s=>s.toLowerCase().includes(q)));
   if(matched.length===1&&state.active!==matched[0].i)choose(matched[0].i);
 });
 document.addEventListener("keydown",e=>{
   if(e.target.closest("input,textarea,select"))return;
   if(e.key==="Escape"){choose(null);return}
   if(e.key==="0"){fit();return}
   if(e.key==="+"){e.preventDefault();$("zoomIn").click();return}
   if(e.key==="-"){e.preventDefault();$("zoomOut").click();return}
   if(["ArrowRight","ArrowLeft"].includes(e.key)){e.preventDefault();choose((Number(state.active??0)+(e.key==="ArrowRight"?1:9))%10);}
 });
}
async function init(){
 try{
  const result=await fetch("data/approved-roots.json",{cache:"no-store"});
  if(!result.ok)throw Error("HTTP "+result.status);
  const data=await result.json();
  if(data.schema!=="jp-drive-radar/1.0"||data.public_projection!==true||data.repositories.length!==10||data.repositories.reduce((n,r)=>n+r.folders.length,0)!==45)throw Error("Unsupported directory manifest");
  if(!data.repositories.every(r=>validId(r.drive_id)&&/^[\w-]+$/.test(r.name)&&r.folders.every(f=>validId(f.drive_id))))throw Error("Unsafe source identifier");
  state.data=data;
  $("snapshot").textContent="Observed "+data.snapshot_date+" · Snapshot, not live";
  $("folderTotal").textContent=data.repositories.reduce((n,r)=>n+r.folders.length,0);
  drawGrid();
  const nodes=$("repositoryNodes");
  data.repositories.forEach((r,i)=>{const n=makeNode(r,i);nodes.append(n);state.nodes.push(n);});
  paintTableOfContents();
  bindGestures();attachSearch();
  $("rootButton").addEventListener("click",()=>choose(null));
  const query=new URL(location.href).searchParams.get("repo");
  const selectedIndex=data.repositories.findIndex(x=>x.name===query);
  choose(query==="all"?null:selectedIndex>=0?selectedIndex:0);
  requestAnimationFrame(fit);
  $("loading").hidden=true;
  $("radarViewport").setAttribute("aria-busy","false");
 }catch(error){
   $("loading").textContent="Explorer data unavailable ("+error.message+"). Open the verified 01_JP Drive directory from the link above.";
   $("loading").setAttribute("role","alert");
   $("search").disabled=true;
   ["zoomIn","zoomOut","fitView","resetView"].forEach(id=>$(id).disabled=true);
 }
}
init();
})();
