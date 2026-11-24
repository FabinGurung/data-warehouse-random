import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve('web-design-skills');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const registry=JSON.parse(read('registry.json'));
assert.equal(registry.schema_version,1);assert.ok(registry.skills.length>=2);
assert.equal(new Set(registry.skills.map(s=>s.id)).size,registry.skills.length);
for(const s of registry.skills){for(const p of [s.skill,s.prompt,s.demo])assert.ok(fs.existsSync(path.join(root,p)),p);const html=read(s.demo);assert.ok(html.includes('../../assets/three.min.js'));assert.ok(html.includes('prefers-reduced-motion'));for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);}
new vm.Script(read('gallery.js'));assert.ok(read('assets/three.min.js').length>600000);assert.ok(read('LICENSE-MengTo.txt').includes('MIT License'));assert.ok(read('assets/Three-LICENSE.txt').includes('MIT License'));console.log('Validated '+registry.skills.length+' registered demos, local dependency, licenses and JavaScript syntax.');
