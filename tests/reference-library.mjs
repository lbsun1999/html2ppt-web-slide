import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const files=(await fs.readdir('reference')).filter(n=>n.endsWith('.html')).sort();
assert.deepEqual(files,['example-project.html','navigation.html','text-styles-example.html']);
const records=JSON.parse(await fs.readFile('reference/snapshots.json','utf8'));assert.equal(records.length,3);
for(const r of records)assert.equal(createHash('sha256').update(await fs.readFile('reference/'+r.file)).digest('hex'),r.sha256);
const html=await fs.readFile('reference/navigation.html','utf8'),p=JSON.parse(html.match(/<script id="project-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
assert.equal(p.slides.length,12);const timeline=p.slides[9],alignment=p.slides[10];assert.ok(timeline.hideLogo);assert.equal(timeline.modules[0].type,'timeline');assert.ok(timeline.modules[0].parts.every(p=>p.asset===null));assert.doesNotMatch(JSON.stringify(timeline),/北京科技大学|丽水学院|六校矿冶|1952/);assert.equal(alignment.id,'reference-advanced-alignment');assert.equal(alignment.modules.length,4);assert.equal(alignment.modules[0].parts.length,2);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1720,height:1100}});await page.goto(pathToFileURL(path.resolve('reference/navigation.html')).href);await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');await page.evaluate(()=>document.fonts.ready);
 for(let i=0;i<12;i++){await page.locator(`[data-page="${i}"]`).click();assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[],`Navigation page ${i+1}`);}
 await page.locator('[data-page="9"]').click();assert.equal(await page.locator('#canvas .slide-logo,#canvas .logo-placeholder,#canvas img').count(),0);assert.equal(await page.locator('#canvas .timeline-placeholder').count(),4);
 await page.locator('[data-action="mode-edit"]').first().click();await page.locator('#canvas .timeline-module').click();await page.locator('[data-action="add-part"]').click();assert.equal(await page.locator('#canvas .timeline-stage').count(),5);assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 await page.locator('[data-stage-remove="4"]').click();assert.equal(await page.locator('#canvas .timeline-stage').count(),4);assert.ok(await page.locator('[data-action="copy-pages"]').isVisible());
 console.log('PASS exactly three reference HTMLs, matching hashes, twelve navigation pages, unbranded timeline, interactive alignment lesson and working controls');
}finally{await browser.close();}
