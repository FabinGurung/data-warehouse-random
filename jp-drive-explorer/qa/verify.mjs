// JP Spider Radar QA: public directory contract and standalone source asset integrity.
// No Google Drive credential, no private source fetch, and no runtime database.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const read=f=>readFileSync(join(root,f),"utf8");
const page=read("index.html"),style=read("radar.css"),script=read("radar.js");
const manifest=JSON.parse(read("data/approved-roots.json"));
assert.equal(manifest.schema,"jp-drive-radar/1.0");
assert.equal(manifest.public_projection,true);
assert.equal(manifest.is_live_sync,false);
assert.equal(manifest.repositories.length,10);
assert.equal(manifest.repositories.reduce((sum,r)=>sum+r.folders.length,0),45);
assert.match(manifest.snapshot_date,/^20\d{2}-\d{2}-\d{2}$/);
assert.match(manifest.root.id,/^[\w-]+$/);
const ids=new Set();
for(const [index,repo] of manifest.repositories.entries()){
 assert.equal(repo.id,"JP-"+String(index+1).padStart(2,"0"));
 assert.match(repo.name,/^[a-z][a-z0-9-]+$/);
 assert.match(repo.drive_id,/^[\w-]+$/);
 assert.ok(repo.summary.length>15,"Each module needs a human-readable description");
 assert.ok(!ids.has(repo.drive_id),"Duplicate Drive repository ID");ids.add(repo.drive_id);
 for(const folder of repo.folders){
  assert.match(folder.drive_id,/^[\w-]+$/);
  assert.ok(folder.name&&folder.name.length<200);
  assert.ok(!ids.has(folder.drive_id),"Duplicate Drive folder ID");ids.add(folder.drive_id);
 }
}
for(const file of ["radar.css","radar.js","data/approved-roots.json"])assert.ok(read(file).length>1000);
assert.ok(page.includes('href="radar.css"'));
assert.ok(page.includes('src="radar.js"'));
assert.ok(script.includes('fetch("data/approved-roots.json"'));
assert.ok(script.includes('state.pointers.size===2'),"Pinch zoom absent");
assert.ok(script.includes('addEventListener("wheel"'),"Wheel zoom absent");
assert.ok(script.includes("replaceState"),"Deep-linking absent");
assert.ok(style.includes("prefers-reduced-motion:reduce"));
assert.ok(style.includes("@media(max-width:650px)"));
for(const id of ["toc","search","searchCount","radarViewport","radarWorld","radarGrid","repositoryNodes","rootButton","zoomIn","zoomOut","fitView","resetView","zoomValue","selectedTitle","selectedDescription","inspectorActions","folderList","trail"])assert.ok(page.includes('id="'+id+'"'),"Missing element "+id);
assert.ok(!page.includes("Pilates Studio website prototype retained"),"Outdated source label leaked");
console.log("JP Spider Radar QA PASS · 10 repository nodes · 45 source folders · wheel/pinch · responsive · public-safe");
