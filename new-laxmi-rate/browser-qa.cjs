const { chromium }=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
const RELEASE='orange-graph-v2-20261127';const base=process.argv[2];const tag=process.argv[3]||'local';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await chromium.launch({headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:960}});const errors=[];page.on('pageerror',e=>errors.push(e.message));let matched=false;
for(let i=0;i<(tag==='live'?24:1);i++){try{await page.goto(base+'?qa='+Date.now(),{waitUntil:'domcontentloaded',timeout:15000});matched=await page.locator('meta[name="catalogue-release"]').getAttribute('content',{timeout:3000})===RELEASE;if(matched)break}catch(e){console.log('Waiting for release',i+1,e.message.slice(0,180))}await sleep(5000)}
assert.ok(matched,'Public release marker not visible: '+RELEASE);
await page.locator('.graph-node.root').waitFor();assert.equal(await page.locator('.graph-node.product').count(),6);assert.equal(await page.locator('.graph-edge').count(),6);
assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
assert.equal(await page.locator('.graph-node.root circle').evaluate(e=>getComputedStyle(e).fill),'rgb(194, 65, 12)');
await page.screenshot({path:'qa-output/'+tag+'-graph.png',fullPage:true});
await page.locator('.graph-node.product[aria-label^="Classic cotton shirt"]').locator('circle').click();assert.equal(await page.locator('.graph-node.field').count(),5);
await page.locator('.graph-node.field[aria-label^="Wholesale Value"]').locator('circle').click();assert.match(await page.locator('.note-value').innerText(),/850/);
await page.screenshot({path:'qa-output/'+tag+'-expanded.png',fullPage:true});
await page.getByRole('button',{name:'Return to catalogue',exact:true}).click();await page.getByRole('button',{name:'Collapse',exact:true}).click();assert.equal(await page.locator('.graph-node').count(),1);await page.getByRole('button',{name:'Expand',exact:true}).click();assert.equal(await page.locator('.graph-node.product').count(),6);
await page.locator('#table').click();assert.deepEqual(await page.locator('thead th').allTextContents(),['Item Name','EXIM Code','Description','Wholesale Value','Retail Value','Photo']);assert.equal(await page.locator('tbody tr').count(),6);
await page.locator('#grid').click();assert.equal(await page.locator('.product').count(),6);await page.locator('#query').fill('kurti');assert.equal(await page.locator('.product').count(),1);await page.locator('#query').fill('');await page.locator('#graph').click();
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'qa-output/'+tag+'-mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile page overflow');
assert.deepEqual(errors,[]);console.log('PASS '+tag+': '+RELEASE+'; orange/white, graph expansion, note value, collapse, six-column table, gallery, search, mobile width; URL '+page.url());
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
