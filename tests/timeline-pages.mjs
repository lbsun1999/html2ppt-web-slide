import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {duplicatePages,movePages} from '../src/page-operations.js';
import {createProject,validateProject} from '../src/model.js';

const p=createProject(),copies=duplicatePages(p.slides);
validateProject({...p,slides:[...p.slides,...copies]});assert.notEqual(copies[2].id,p.slides[2].id);
assert.equal(copies[3].chapterId,copies[2].id);assert.ok(copies[1].tocNotes!==p.slides[1].tocNotes);
const reordered=movePages(p.slides,new Set([p.slides[3].id,p.slides[4].id]),8);assert.equal(reordered[6].id,p.slides[3].id);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({viewport:{width:1720,height:1050},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const ui=a=>page.locator(`[data-action="${a}"]`).first(),state=()=>page.evaluate(()=>window.slideStudio.getProject());
const go=n=>page.locator(`[data-page="${n}"]`).click();
const load=async(data,name='测试')=>{await page.locator('#html-file').setInputFiles({name:name+'.html',mimeType:'text/html',buffer:Buffer.from(`<script id="project-data" type="application/json">${JSON.stringify(data)}</script>`)});};
const formal=JSON.parse((await fs.readFile('北京科技大学_WebSlide科研汇报示例.html','utf8')).match(/<script id="project-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const geometry=()=>page.locator('#canvas .timeline-media').evaluateAll(els=>els.map(el=>({w:el.clientWidth,h:el.clientHeight})));
try{
 await fs.mkdir('ect',{recursive:true});await page.goto('http://127.0.0.1:4317');await page.waitForFunction(()=>window.slideStudio);await load(formal);await page.locator('#view-mode').selectOption('single');await go(7);await page.evaluate(()=>document.fonts.ready);
 assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 await ui('mode-edit').click();await page.locator('#canvas .timeline-module').click();
 const before=await geometry();assert.equal(before.length,4);assert.equal(new Set(before.map(r=>r.h)).size,1);
 const colors=await page.locator('#canvas .timeline-year').evaluateAll(els=>els.map(el=>getComputedStyle(el).backgroundColor));assert.deepEqual([...new Set(colors)],['rgb(0, 91, 148)']);
 assert.equal(await page.locator('#canvas .timeline-line path').evaluateAll(els=>new Set(els.map(el=>getComputedStyle(el).stroke)).size),1);
 await ui('add-part').click();let sizes=await geometry();assert.equal(sizes.length,5);assert.ok(sizes[0].w<before[0].w);assert.equal(new Set(sizes.map(r=>r.h)).size,1);assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 await page.locator('[data-stage-move="4"][data-direction="-1"]').click();assert.equal((await state()).slides[7].modules[0].parts[3].title,'阶段事件');await page.locator('[data-stage-remove="3"]').click();assert.equal((await geometry()).length,4);
 await ui('mode-text').click();await page.locator('#canvas [data-part="0"][data-field="year"]').fill('1953年');await page.locator('#canvas [data-part="0"][data-field="title"]').fill('第一阶段');
 await page.locator('#canvas [data-media-part="0"]').dblclick();await page.locator('#media-file').setInputFiles('tests/fixtures/flower.mp4');await ui('media-dialog-apply').click();assert.equal(await page.locator('#canvas .timeline-media video').count(),1);assert.equal((await state()).slides[7].modules[0].parts[0].year,'1953年');assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 const single=await state();single.slides=[single.slides[7]];const exported=await fetch('http://127.0.0.1:4317/api/export/pptx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(single)});assert.equal(exported.status,200,await exported.status!==200?await exported.text():'');await fs.writeFile('ect/timeline-video.pptx',Buffer.from(await exported.arrayBuffer()));
 await ui('mode-edit').click();await page.locator('#canvas .timeline-module').click();await page.screenshot({path:'ect/timeline-controls.png'});
 // Fixed bottom controls stay visible while only the thumbnail list scrolls.
 for(const height of [720,1050]){await page.setViewportSize({width:1720,height});await page.locator('#slides').evaluate(el=>el.scrollTop=el.scrollHeight);const r=await ui('copy-pages').boundingBox();assert.ok(r.y>0&&r.y+r.height<=height);assert.ok(await ui('paste-pages').isVisible());const d=await ui('delete-slide').boundingBox();assert.ok(d.y+d.height<=height);}
 await page.setViewportSize({width:1720,height:1050});
 const original=await state();await go(6);await page.locator('[data-page="7"]').click({modifiers:['Shift']});assert.equal(await page.locator('.slide-thumb.is-selected').count(),2);
 await ui('copy-pages').click();await ui('paste-pages').click();let after=await state();assert.equal(after.slides.length,32);assert.equal(after.slides[8].title,original.slides[6].title);assert.equal(after.slides[9].modules[0].parts[0].asset.kind,'video');assert.notEqual(after.slides[9].id,original.slides[7].id);validateProject(after);
 assert.equal(await page.locator('.slide-thumb.is-selected').count(),2);await ui('delete-slide').click();await ui('delete-slide-dialog-apply').click();assert.equal((await state()).slides.length,30);await ui('undo').click();assert.equal((await state()).slides.length,32);
 // Drag page 10 before page 7, including its complete media and notes.
 await go(9);const moved=(await state()).slides[9].id;await page.locator('[data-page="6"]').scrollIntoViewIfNeeded();
 await page.locator('[data-page="9"]').evaluate(el=>{const dt=new DataTransfer();window.testDrag=dt;el.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:dt}));});
 await page.locator('[data-page="6"]').evaluate(el=>{const r=el.getBoundingClientRect();el.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:window.testDrag,clientY:r.top+2}));el.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:window.testDrag}));});
 assert.equal((await state()).slides[6].id,moved);validateProject(await state());
 // Copy/paste shortcuts are scoped to the sidebar, not text selection on canvas.
 await go(6);await page.locator('[data-page="6"]').press('Control+c');await page.locator('[data-page="6"]').press('Control+v');await page.waitForTimeout(250);assert.equal((await state()).slides.length,33);
 await page.locator('.slide-thumb.current').press('Delete');await ui('delete-slide-dialog-apply').click();assert.equal((await state()).slides.length,32);
 await page.locator('.slide-thumb.current').press('Control+a');assert.equal(await page.locator('.slide-thumb.is-selected').count(),32);await ui('delete-slide').click();assert.equal(await page.locator('dialog[open]').count(),0);assert.equal((await state()).slides.length,32);
 await load(formal);await go(7);await page.evaluate(()=>window.showSaveFilePicker=undefined);const download=page.waitForEvent('download');await ui('html-as').click();const saved=await download;await saved.saveAs('ect/timeline-saved.html');
 await page.goto(pathToFileURL(path.resolve('ect/timeline-saved.html')).href);await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');await go(7);assert.equal(await page.locator('#canvas .timeline-stage').count(),4);assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);assert.ok(await ui('copy-pages').isVisible());
 await go(0);const realDragged=(await state()).slides[2].id;await page.locator('[data-page="2"]').dragTo(page.locator('[data-page="1"]'),{targetPosition:{x:30,y:3}});assert.equal((await state()).slides[1].id,realDragged,'Native mouse drag reorders an unselected thumbnail');
 assert.deepEqual(errors,[]);console.log('PASS timeline add/remove/reorder, editable years/events, video replacement, automatic sizes, saved offline; fixed sidebar, multiselect, copy/paste, drag, delete, undo and shortcuts');
}finally{await browser.close();}
