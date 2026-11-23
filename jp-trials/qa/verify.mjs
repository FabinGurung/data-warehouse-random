import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = file => readFileSync(resolve(root, file), 'utf8');
const galleryPath = 'jp-trials/index.html';
const html = read(galleryPath);
assert.match(html, /Website design trials/);
assert.match(html, /perspective:1150px/);
assert.match(html, /pointermove/);
assert.match(html, /prefers-reduced-motion/);
assert.match(html, /aria-label="Draggable three-dimensional gallery/);
const paths = [
  'jp-trials/zoom-pan/index.html',
  'jp-trials/spider-radar/index.html',
  'jp-trials/spider-radar/radar.js',
  'jp-trials/spider-radar/radar.css',
  'jp-trials/spider-radar/data/approved-roots.json',
  'jp-trials/drive-gallery/index.html',
  'jp-drive-explorer/index.html',
  'gis/index.html',
  'index.html',
  'source-gallery.js'
];
for (const path of paths) assert.ok(existsSync(resolve(root, path)), 'Missing trial asset: ' + path);
assert.equal((html.match(/class="trial"/g) || []).length, 6, 'Exactly six gallery cards');
for (const link of ['zoom-pan/', 'spider-radar/', '../jp-drive-explorer/', 'drive-gallery/', '../gis/', '../']) {
  const target = resolve(root, 'jp-trials', link, 'index.html');
  assert.ok(existsSync(target), 'Broken trial route: ' + link);
}
for (const path of [galleryPath, 'jp-trials/zoom-pan/index.html', 'jp-drive-explorer/index.html']) {
 const source = read(path);
 const inlineScripts = [...source.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)];
 for (const [,body] of inlineScripts) if(body.trim()) new Script(body, {filename:path});
}
new Script(read('jp-trials/spider-radar/radar.js'), {filename:'spider-radar/radar.js'});
new Script(read('source-gallery.js'), {filename:'source-gallery.js'});
const manifest = JSON.parse(read('jp-trials/spider-radar/data/approved-roots.json'));
assert.equal(manifest.public_projection, true);
assert.equal(manifest.is_live_sync, false);
assert.equal(manifest.repositories.length, 10);
assert.match(read('index.html'), /href="jp-trials\/"/);
assert.match(read('jp-drive-explorer/index.html'), /href="\.\.\/jp-trials\/"/);
console.log('OK: gallery has 6 linked trials, 2 archived designs, current directory, local assets, syntactically valid JavaScript and no claim of live Drive synchronization.');
