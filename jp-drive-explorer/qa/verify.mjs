import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const html=readFileSync(join(root,"index.html"),"utf8");
const manifest=JSON.parse(readFileSync(join(root,"data/approved-roots.json"),"utf8"));
assert.equal(manifest.schema,"jp-drive-radar/1.0");
assert.equal(manifest.public_projection,true);
assert.equal(manifest.is_live_sync,false);
assert.equal(manifest.repositories.length,10);
assert.equal(manifest.repositories.reduce((n,r)=>n+r.folders.length,0),45);
assert.equal((html.match(/data-repo="/g)||[]).length,10);
assert.equal((html.match(/data-folder(?![a-z])/g)||[]).length,45);
for(const r of manifest.repositories){
 assert.ok(html.includes("https://drive.google.com/drive/folders/"+r.drive_id));
 assert.ok(html.includes("https://github.com/FabinGurung/"+r.name));
 for(const f of r.folders)assert.ok(html.includes("https://drive.google.com/drive/folders/"+f.drive_id));
}
for(const term of ["--bg:#f5f8fc","--repo:#1967b3","--folder:#147d53","--restricted:#a15b15","--archive:#617285",
  "treeSearch","expandAll","collapseAll","clearSearch","<details","<summary","color indicates","01_JP — Folder Tree"]){
 assert.ok(html.toLowerCase().includes(term.toLowerCase()),"Missing "+term);
}
assert.ok(!html.includes('src="radar.js"'));
assert.ok(!html.includes('href="radar.css"'));
assert.ok(!html.includes("Private financial records"));
console.log("01_JP light-color tree QA PASS: 10 owner roots, 45 source folders, preserving all exact Drive links.");
