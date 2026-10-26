import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createProject,blankSlide,moduleOf} from '../src/model.js';
await fs.mkdir('ect',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const source=await browser.newPage({viewport:{width:1720,height:1080},acceptDownloads:true}),errors=[];await source.addInitScript(()=>window.showSaveFilePicker=undefined);source.on('pageerror',e=>errors.push(e.message));
 await source.goto(new URL('../北京科技大学_WebSlide科研汇报示例.html',import.meta.url).href);await source.waitForFunction(()=>window.slideStudio);
 const p=createProject(),body=blankSlide(),m=moduleOf('text',{x:58,y:256,w:1484,h:500});m.parts[0].text='当前修改直接传入本机工作台，不需要拖动文件。';body.modules=[m];p.slides=[p.slides[0],body];p.slides[0].presenter='传送测试';
 await source.locator('#html-file').setInputFiles({name:'local-export-test.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(p)+'</script>')});await source.locator('#canvas [data-slide-field="presenter"]').fill('尚未保存的修改');
 const original=await source.evaluate(()=>window.slideStudio.getProject());await source.locator('[data-action="export-pdf"]').first().click();assert.equal(await source.locator('#local-export-dialog').isVisible(),true);
 await source.locator('#local-workbench-url').fill('https://example.com');await source.locator('#local-export-connect').click();assert.match(await source.locator('#local-export-status').innerText(),/仅支持本机/);
 await source.locator('#local-workbench-url').fill('http://127.0.0.1:4317');const popup=source.waitForEvent('popup');await source.locator('#local-export-connect').click();const target=await popup;target.on('pageerror',e=>errors.push(e.message));await target.waitForFunction(()=>window.slideStudio?.getProject().slides[0].presenter==='尚未保存的修改');
 assert.deepEqual(await target.evaluate(()=>window.slideStudio.getProject()),original);assert.deepEqual(await source.evaluate(()=>window.slideStudio.getProject()),original);assert.equal(new URL(target.url()).hash,'');assert.match(await source.locator('#local-export-status').innerText(),/已传送/);
 await target.evaluate(()=>window.showSaveFilePicker=undefined);for(const kind of ['pdf','pptx']){const wait=target.waitForEvent('download',{timeout:120000});await target.locator(`[data-action="export-${kind}"]`).first().click();const item=await wait;await item.saveAs('ect/local-handoff.'+kind);assert.equal(await item.failure(),null);const bytes=await fs.readFile('ect/local-handoff.'+kind);assert.equal(bytes.subarray(0,kind==='pdf'?4:2).toString(),kind==='pdf'?'%PDF':'PK');}
 await target.close();assert.deepEqual(errors,[]);console.log('PASS offline dialog, external-address rejection, source/token-bound popup transfer of unsaved content, unchanged original and real PDF/PPTX downloads');
}finally{await browser.close();}
