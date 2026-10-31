import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const files=(await fs.readdir('reference')).filter(name=>name.endsWith('.html')).sort();
assert.deepEqual(files,['blank-template.html','example-project.html']);
const records=JSON.parse(await fs.readFile('reference/snapshots.json','utf8'));
assert.equal(records.length,2);
for(const record of records)assert.equal(createHash('sha256').update(await fs.readFile('reference/'+record.file)).digest('hex'),record.sha256);

const html=await fs.readFile('reference/blank-template.html','utf8');
const project=JSON.parse(html.match(/<script id="project-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
assert.equal(project.slides.length,7);
assert.deepEqual(project.slides.map(slide=>slide.kind),['cover','toc','body','body','body','body','body']);
assert.equal(project.theme.logo,'');
assert.equal(project.theme.wordmark,'');
assert.doesNotMatch(JSON.stringify(project),/北京科技大学|丽水学院/);
const toc=project.slides[1],profile=project.slides[6];
assert.equal(toc.modules[0].parts.length,4);
assert.deepEqual(toc.modules[0].parts.map(part=>part.title),['图片与媒体','表格与数据','时间轴','公式与符号']);
assert.ok(!toc.modules[0].parts.some(part=>part.title==='作者简介'));
assert.equal(profile.section,'附录');
assert.equal(profile.title,'作者简介');
assert.deepEqual(project.slides.slice(2,7).map(slide=>slide.modules.map(module=>module.type)),[['media'],['table'],['timeline'],['formula','table'],['table','table']]);
const symbolRows=project.slides[5].modules[1].rows.flat();
assert.ok(symbolRows.includes(String.raw`$\theta$`));
assert.doesNotMatch(JSON.stringify(symbolRows),/\t/);

const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1720,height:1100}});
 await page.goto(pathToFileURL(path.resolve('reference/blank-template.html')).href);
 await page.waitForFunction(()=>window.slideStudio);
 await page.locator('#view-mode').selectOption('single');
 await page.evaluate(()=>document.fonts.ready);
 for(let index=0;index<7;index++){
  await page.locator(`[data-page="${index}"]`).click();
  assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[],`Blank template page ${index+1}`);
 }
 await page.locator('[data-page="2"]').click();
 assert.equal(await page.locator('#canvas .media-placeholder').count(),2);
 await page.locator('[data-page="4"]').click();
 assert.equal(await page.locator('#canvas .timeline-placeholder').count(),4);
 await page.locator('[data-action="mode-edit"]').first().click();
 await page.locator('#canvas .timeline-module').click();
 await page.locator('[data-action="add-part"]').click();
 assert.equal(await page.locator('#canvas .timeline-stage').count(),5);
 await page.locator('[data-stage-remove="4"]').click();
 assert.equal(await page.locator('#canvas .timeline-stage').count(),4);
 assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 console.log('PASS two reference workbenches; blank template has cover, four directory chapters, media, table, timeline, formula and appendix profile');
}finally{await browser.close();}
