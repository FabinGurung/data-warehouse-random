"use strict";
(function(){
const FIELD_NAMES=["Description","EXIM Code","Wholesale Value","Retail Value","Photo"];
const PAGE=8;
const pos=(label,type,x,y,extra={})=>({label,type,x,y,...extra});
function model(items,selected=null,expanded=true,page=0){
 const root=pos("New Laxmi Store","root",450,290),nodes=[root],edges=[];
 const add=(n,parent)=>{nodes.push(n);edges.push([parent,n]);return n};
 if(!expanded)return {nodes,edges};
 if(selected&&items.includes(selected)){
   root.x=135;root.y=290;
   const product=add(pos(selected["Item Name"],"product",410,290,{product:selected}),root);
   FIELD_NAMES.forEach((key,i)=>{const a=-Math.PI/2+i*Math.PI/4;add(pos(key,"field",650+165*Math.cos(a),290+205*Math.sin(a),{product:selected,field:key}),product)});
 }else{
   const slice=items.slice(page*PAGE,(page+1)*PAGE);
   slice.forEach((p,i)=>{const a=-Math.PI/2+i*2*Math.PI/Math.max(slice.length,1);add(pos(p["Item Name"],"product",450+300*Math.cos(a),290+210*Math.sin(a),{product:p}),root)});
 }
 return {nodes,edges};
}
if(typeof module!=="undefined"&&module.exports){module.exports={model,FIELD_NAMES,PAGE};return}
let selected=null,field=null,expanded=true,page=0;
const S="http://www.w3.org/2000/svg";
const html=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!=null)n.textContent=txt;if(cls)n.className=cls;return n};
const svg=(tag,attrs={})=>{const n=document.createElementNS(S,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n};
function value(p,k){const v=p[k];return v==null||v===""?"Not supplied":k.endsWith("Value")?"Rs. "+Number(v).toLocaleString("en-IN",{maximumFractionDigits:2}):String(v)}
function labelLines(s){const words=s.split(/\s+/),out=[];let line="";for(const word of words){if(line&&line.length+word.length>23){out.push(line);line=word}else line+=(line?" ":"")+word}if(line)out.push(line);return out.slice(0,3).map((x,i)=>i===2&&out.length>3?x+"…":x)}
window.renderCatalogueGraph=function(host,items){
 if(selected&&!items.includes(selected)){selected=null;field=null}
 page=Math.min(page,Math.max(0,Math.ceil(items.length/PAGE)-1));
 const shell=html("section",null,"graph-shell"),work=html("div",null,"graph-work"),bar=html("div",null,"graph-bar"),canvas=html("div",null,"graph-canvas"),note=html("aside",null,"graph-note");
 const rerender=()=>window.renderCatalogueGraph(host,items);
 const button=(label,fn)=>{const b=html("button",label);b.onclick=fn;return b};
 bar.append(button("All items",()=>{selected=null;field=null;expanded=true;page=0;rerender()}),button(expanded?"Collapse":"Expand",()=>{expanded=!expanded;selected=null;field=null;rerender()}));
 if(!selected&&expanded&&items.length>PAGE){const prev=button("Previous",()=>{page--;rerender()}),next=button("Next",()=>{page++;rerender()});prev.disabled=page===0;next.disabled=(page+1)*PAGE>=items.length;bar.append(prev,html("span",(page+1)+" / "+Math.ceil(items.length/PAGE)),next)}
 const scene=svg("svg",{viewBox:"0 0 900 580",role:"group","aria-label":"Expandable catalogue graph"});
 const m=model(items,selected,expanded,page);
 const pick=n=>{if(n.type==="root"){if(selected){selected=null;field=null;expanded=true}else expanded=!expanded}else if(n.type==="product"){selected=n.product;field=null;expanded=true}else{selected=n.product;field=n.field}rerender()};
 for(const [a,b] of m.edges)scene.append(svg("line",{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:"graph-edge"}));
 for(const n of m.nodes){const active=n.type==="field"&&field===n.field||n.type==="product"&&selected===n.product;const g=svg("g",{class:"graph-node "+n.type+(active?" active":""),transform:"translate("+n.x+" "+n.y+")",tabindex:"0",role:"button","aria-label":n.label+(n.type==="root"?" — expand or return":n.type==="product"?" — open item":" — read note")});g.append(svg("circle",{r:n.type==="root"?28:n.type==="product"?18:12}));const title=svg("title");title.textContent=n.label;g.append(title);const t=svg("text",{y:n.type==="root"?47:35,"text-anchor":"middle"});labelLines(n.label).forEach((l,i)=>{const sp=svg("tspan",{x:0,dy:i?17:0});sp.textContent=l;t.append(sp)});g.append(t);g.onclick=()=>pick(n);g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(n)}};scene.append(g)}
 canvas.append(scene);
 work.append(bar,canvas);
 note.append(html("div","NOTE EXPLORER","note-kicker"));
 if(!selected){
   note.append(html("h2","Catalogue"),html("p","Select a product bubble to reveal its connected fields. Click a field to inspect its note."));
   note.append(html("p","Product data follows the approved six-column Google Sheet. Missing information remains blank. The operating guide defines review before publication.","note-muted"));
   const nav=html("div",null,"note-links");items.slice(page*PAGE,(page+1)*PAGE).forEach(p=>nav.append(button(p["Item Name"],()=>{selected=p;field=null;expanded=true;rerender()})));note.append(nav);
 }else{
   note.append(html("h2",selected["Item Name"]));
   const makeImage=()=>{const src=selected.Photo;if(src&&(/^https:\/\//i.test(src)||/^photos\/[a-z0-9_./-]+\.(png|jpe?g|webp|gif|avif)$/i.test(src)&&!src.split("/").includes(".."))){const img=html("img",null,"note-photo");img.src=src;img.alt=selected["Item Name"];img.referrerPolicy="no-referrer";img.onerror=()=>img.replaceWith(html("p","Photo unavailable"));return img}return html("p","No photo supplied","note-muted")};
   if(field){note.append(html("div",field,"note-kicker"));note.append(field==="Photo"?makeImage():html("p",value(selected,field),"note-value"));note.append(button("Back to item note",()=>{field=null;rerender()}))}
   else{note.append(makeImage(),html("p",selected.Description||"No description supplied"));const dl=html("dl");for(const k of FIELD_NAMES.filter(k=>k!=="Description"&&k!=="Photo")){dl.append(html("dt",k),html("dd",value(selected,k)))}note.append(dl)}
   const links=html("div",null,"note-links");FIELD_NAMES.forEach(k=>links.append(button(k,()=>{field=k;rerender()})));note.append(links,button("Return to catalogue",()=>{selected=null;field=null;rerender()}));
 }
 shell.append(work,note);host.replaceChildren(shell);
};
})();
