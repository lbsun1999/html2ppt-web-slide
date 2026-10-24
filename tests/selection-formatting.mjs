import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createProject,blankSlide,moduleOf} from '../src/model.js';
import {formulaPage} from '../src/page-presets.js';
await fs.mkdir('ect',{recursive:true});
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await b.newPage({viewport:{width:1720,height:1080},acceptDownloads:true});await page.addInitScript(()=>{window.showSaveFilePicker=undefined;});await page.goto('http://127.0.0.1:4317');await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');
 const p=createProject(),s=blankSlide(),m=moduleOf('text',{x:58,y:256,w:1484,h:470});m.parts[0].text='首行保持普通段落。\n第二行列出研究发现。\n第三行提供支撑证据。\n第四行说明适用范围。';s.modules=[m];p.slides=[s,formulaPage()];
 await page.locator('#html-file').setInputFiles({name:'selection.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(p)+'</script>')});
 const state=()=>page.evaluate(()=>window.slideStudio.getProject());
 async function select(a,start,z,end){await page.locator('#canvas .paragraph').evaluate((el,[a,start,z,end])=>{el.focus();const children=[...el.children],texts=node=>{const w=document.createTreeWalker(node,NodeFilter.SHOW_TEXT),all=[];while(w.nextNode())all.push(w.currentNode);return all;};const first=texts(children[a])[0],last=texts(children[z]).at(-1),r=document.createRange();r.setStart(first,start);r.setEnd(last,end??last.length);getSelection().removeAllRanges();getSelection().addRange(r);document.dispatchEvent(new Event('selectionchange'));},[a,start,z,end]);await page.waitForTimeout(40);}
 await select(1,0,1,3);await page.locator('#format-color').click();await page.locator('#format-color').selectOption('emphasis');let part=(await state()).slides[0].modules[0].parts[0];assert.equal(part.rich.text.filter(r=>r.color==='emphasis').map(r=>r.text).join(''),'第二行');
 await select(2,0,2,3);await page.locator('#format-bold').click();part=(await state()).slides[0].modules[0].parts[0];assert.equal(part.rich.text.filter(r=>r.bold).map(r=>r.text).join(''),'第三行');
 await select(3,0,3,3);await page.locator('#format-font-size').click();await page.locator('#format-font-size').selectOption('14');part=(await state()).slides[0].modules[0].parts[0];assert.equal(part.rich.text.filter(r=>r.fontSize===14).map(r=>r.text).join(''),'第四行');
 await select(1,0,3,null);await page.locator('#format-list').click();await page.locator('#format-list').selectOption('•');part=(await state()).slides[0].modules[0].parts[0];assert.deepEqual(part.paragraphs.text.map(p=>p.bullet),[false,true,true,true]);
 await page.locator('#format-paragraph-after').fill('12');await page.locator('#page-label').click();part=(await state()).slides[0].modules[0].parts[0];assert.deepEqual(part.paragraphs.text.map(p=>p.after??6),[6,12,12,12]);
 await page.locator('[data-page="1"]').click();await page.locator('#canvas [data-reference-formula]').first().dblclick();const latex=await page.locator('#formula-latex').inputValue();await page.locator('#formula-latex').fill(latex);await page.locator('[data-action="formula-dialog-apply"]').click();assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 const clipped=await page.locator('#canvas .formula-card').evaluateAll(cs=>cs.some(c=>{const a=c.getBoundingClientRect(),p=c.querySelector('.equation-explanation').getBoundingClientRect();return p.bottom>a.bottom+1;}));assert.equal(clipped,false);
 await page.locator('[data-page="0"]').click();const wait=page.waitForEvent('download');await page.locator('[data-action="html"]').first().click();await(await wait).saveAs('ect/selection-formatting.html');const saved=await b.newPage();await saved.goto(new URL('../ect/selection-formatting.html',import.meta.url).href);await saved.waitForFunction(()=>window.slideStudio);assert.deepEqual(await saved.evaluate(()=>window.slideStudio.getProject().slides[0].modules[0].parts[0].paragraphs.text.map(p=>p.bullet)),[false,true,true,true]);
 console.log('PASS real toolbar clicks preserve partial color/bold/size; mixed paragraphs and 12pt after-spacing persist offline; unchanged LaTeX replacement does not overflow');
}finally{await b.close();}
