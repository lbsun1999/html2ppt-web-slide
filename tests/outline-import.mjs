import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';

await fs.mkdir('ect',{recursive:true});
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await b.newPage({viewport:{width:1920,height:1200},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.showSaveFilePicker=undefined;});
 await page.goto(pathToFileURL(path.resolve('北京科技大学_WebSlide科研汇报示例.html')).href);await page.waitForFunction(()=>window.slideStudio);
 const original=await page.evaluate(()=>window.slideStudio.getProject()),formula=original.slides.find(s=>s.modules.some(m=>m.role==='objective-formulas')),refs=original.slides.find(s=>s.referenceLayout==='references');
 const manager=()=>page.locator('[data-action="outline"]').click();
 await manager();assert.equal(await page.locator('#outline-dialog').isVisible(),true);assert.equal(await page.locator('#outline-apply').isEnabled(),true);assert.ok((await page.locator('#outline-text').inputValue()).includes('### '+formula.title));assert.equal(await page.locator('#outline-appendix').isChecked(),true);assert.match(await page.locator('#outline-status').innerText(),/预计30页/);
 const initial=await page.locator('#outline-text').inputValue();await page.locator('#outline-text').fill('### 未完成输入');assert.equal(await page.locator('#outline-apply').isDisabled(),true);
 await page.locator('#outline-text').fill(initial.replace('### '+formula.title,'### 目标函数与迭代过程'));
 await page.locator('#outline-apply').click();let edited=await page.evaluate(()=>window.slideStudio.getProject());assert.deepEqual(edited.slides.map(s=>s.id),original.slides.map(s=>s.id));const editedFormula=edited.slides.find(s=>s.id===formula.id);assert.equal(editedFormula.title,'目标函数与迭代过程');assert.deepEqual(editedFormula.modules,formula.modules);assert.equal(editedFormula.legacy_5,formula.legacy_5);assert.equal(editedFormula.notes,formula.notes);assert.equal(editedFormula.outlineDraft,undefined);assert.equal(edited.title,original.title);
 await manager();assert.ok((await page.locator('#outline-text').inputValue()).includes('### 目标函数与迭代过程'));await page.locator('#outline-dialog button[value="cancel"]').last().click();assert.deepEqual(await page.evaluate(()=>window.slideStudio.getProject()),edited);
 await page.locator('[data-action="undo"]').first().click();assert.deepEqual(await page.evaluate(()=>window.slideStudio.getProject()),original);
 await manager();
 await page.locator('#outline-text').fill('### 错误层级');assert.match(await page.locator('#outline-status').innerText(),/章节/);assert.equal(await page.locator('#outline-apply').isDisabled(),true);
 await page.locator('#outline-example').click();assert.ok(await page.locator('.outline-page-row').count()>3);assert.equal(await page.locator('#outline-apply').isEnabled(),true);
 await page.locator('#outline-text').fill('# 新课题汇报\n## 研究方法\n### '+formula.title+'\n本页需补充参数与适用条件。\n### 新的方法说明\n## 附录\n### 参考文献');
 assert.equal(await page.locator('[data-outline-page="chapter-0-page-0"]').inputValue(),'','New documents default to clean body pages, even for same titles');await page.locator('[data-outline-page="chapter-0-page-0"]').selectOption(formula.id);
 await page.locator('[data-outline-page="chapter-1-page-0"]').selectOption(refs.id);
 assert.match(await page.locator('#outline-status').innerText(),/预计7页/);assert.equal(await page.locator('#outline-appendix').isChecked(),true);
 await page.locator('#outline-apply').click();assert.equal(await page.locator('#outline-dialog').count(),0);
 const p=await page.evaluate(()=>window.slideStudio.getProject());assert.equal(p.title,'新课题汇报');assert.equal(p.slides.length,7);assert.deepEqual(p.theme,original.theme);
 const copied=p.slides.find(s=>s.modules.some(m=>m.role==='objective-formulas'));assert.notEqual(copied.id,formula.id);assert.equal(copied.legacy_5,formula.legacy_5);assert.match(copied.notes,/本页需补充参数/);assert.ok(copied.outlineDraft);
 assert.equal(p.slides.find(s=>s.referenceLayout==='references').section,'附录');assert.equal(p.slides.find(s=>s.kind==='toc').modules[0].parts.length,1);
 await page.locator('#view-mode').selectOption('single');
 for(let i=0;i<p.slides.length;i++){await page.locator(`[data-page="${i}"]`).click();assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[],'Generated page '+(i+1));}
 const download=page.waitForEvent('download');await page.locator('[data-action="html"]').first().click();await(await download).saveAs('ect/outline-import-saved.html');
 const offline=await b.newPage();await offline.goto(pathToFileURL(path.resolve('ect/outline-import-saved.html')).href);await offline.waitForFunction(()=>window.slideStudio);assert.deepEqual((await offline.evaluate(()=>window.slideStudio.getProject())).outline,p.outline);await offline.close();
 await page.locator('[data-action="undo"]').first().click();assert.deepEqual(await page.evaluate(()=>window.slideStudio.getProject()),original,'Undo restores the original draft');
 await manager();await page.locator('#outline-mode').selectOption('new');
 const text='# 文件导入测试\n## 背景\n### 问题定义';await page.locator('#outline-file').setInputFiles({name:'outline.txt',mimeType:'text/plain',buffer:Buffer.concat([Buffer.from([0xff,0xfe]),Buffer.from(text,'utf16le')])});
 await page.waitForFunction(()=>document.querySelector('#outline-text').value.startsWith('# 文件导入测试'));assert.equal(await page.locator('#outline-apply').isEnabled(),true);
 await page.locator('#outline-transitions').uncheck();await page.locator('#outline-apply').click();assert.equal((await page.evaluate(()=>window.slideStudio.getProject())).slides.filter(s=>s.kind==='transition').length,0);
 assert.deepEqual(errors,[]);console.log('PASS guided paste/write/file outline import, hierarchy preview, existing-page reuse, appendix/TOC, safe new document, undo and offline save');
}finally{await b.close();}
