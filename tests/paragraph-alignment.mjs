import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createProject,blankSlide,moduleOf} from '../src/model.js';
import JSZip from 'jszip';
await fs.mkdir('ect',{recursive:true});
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await b.newPage({viewport:{width:1720,height:1080},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.showSaveFilePicker=undefined;});await page.goto('http://127.0.0.1:4317');await page.waitForFunction(()=>window.slideStudio);
 const p=createProject(),s=blankSlide(),m=moduleOf('text',{x:58,y:256,w:1484,h:500});m.parts[0].text='首段保持原有格式。\n第二段用于测试右对齐。\n第三段说明实际应用条件，必要时根据语义调整文字，并通过足够长的段落验证两端对齐的换行效果。';s.modules=[m];p.slides=[s];
 await page.locator('#html-file').setInputFiles({name:'alignment.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(p)+'</script>')});
 const state=()=>page.evaluate(()=>window.slideStudio.getProject()),field=page.locator('#canvas .paragraph');
 async function caret(index,end=false){await field.evaluate((el,[i,end])=>{el.focus();const node=el.children[i],r=document.createRange();r.selectNodeContents(node);r.collapse(!end);getSelection().removeAllRanges();getSelection().addRange(r);document.dispatchEvent(new Event('selectionchange'));},[index,end]);}
 await caret(1);assert.equal(await page.locator('[name="paragraph-align"]').count(),4);await page.locator('[name="paragraph-align"][value="right"] + span').click();let part=(await state()).slides[0].modules[0].parts[0];assert.deepEqual(part.paragraphs.text.map(p=>p.align||null),[null,'right',null]);assert.equal(await page.locator('[name="paragraph-align"][value="right"]').isChecked(),true);
 await caret(1);await page.keyboard.press('Control+r');await caret(2);await page.keyboard.press('Control+j');part=(await state()).slides[0].modules[0].parts[0];assert.equal(part.paragraphs.text[2].align,'justify');await caret(0);await page.keyboard.press('Control+e');await page.keyboard.press('Control+l');part=(await state()).slides[0].modules[0].parts[0];assert.deepEqual(part.paragraphs.text.map(p=>p.align),['left','right','justify']);
 const rects=await field.locator('[data-paragraph]').evaluateAll(ns=>ns.map(n=>({align:getComputedStyle(n).textAlign,last:getComputedStyle(n).textAlignLast})));assert.equal(rects[2].last,'auto');assert.deepEqual(rects.map(r=>r.align),['left','right','justify']);assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 const download=page.waitForEvent('download');await page.locator('[data-action="html"]').click();await(await download).saveAs('ect/paragraph-alignment.html');const offline=await b.newPage();await offline.goto(new URL('../ect/paragraph-alignment.html',import.meta.url).href);await offline.waitForFunction(()=>window.slideStudio);assert.deepEqual((await offline.evaluate(()=>window.slideStudio.getProject())).slides[0].modules[0].parts[0].paragraphs.text.map(p=>p.align),['left','right','justify']);await offline.close();
 const response=await page.request.post('http://127.0.0.1:4317/api/export/pptx',{data:await state()});assert.equal(response.ok(),true,await response.text().then(s=>s.slice(0,100)));const zip=await JSZip.loadAsync(await response.body()),xml=await zip.file('ppt/slides/slide1.xml').async('string');assert.match(xml,/algn="r"/);assert.match(xml,/algn="just"/);await fs.writeFile('ect/paragraph-alignment.pptx',await response.body());assert.deepEqual(errors,[]);
 console.log('PASS four sidebar radios, caret paragraph scope, Ctrl+L/E/R/J, persisted HTML and native PPTX paragraph alignment');
}finally{await b.close();}
