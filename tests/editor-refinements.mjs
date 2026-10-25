import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {createProject,blankSlide,moduleOf} from '../src/model.js';
import {makePreset} from '../src/page-presets.js';
await fs.mkdir('ect',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1720,height:1080},acceptDownloads:true});
 await page.addInitScript(()=>{window.showSaveFilePicker=undefined;});
 await page.goto('http://127.0.0.1:4317');await page.waitForFunction(()=>window.slideStudio);
 const p=createProject(),s=blankSlide(),m=moduleOf('text',{x:58,y:256,w:700,h:250}),n=moduleOf('text',{x:766,y:256,w:776,h:250});
 m.parts[0].text='第一段读取当前字号与间距。\n第二段保留自己的段后设置。';m.parts[0].fontSizes={text:14};m.parts[0].lineSpacing={text:1.2};m.parts[0].paragraphs={text:[{after:12},{after:9}]};
 n.parts[0].text='另一块文字使用不同的字号和行距。';n.parts[0].lineSpacing={text:1.7};n.parts[0].paragraphs={text:[{after:8}]};s.modules=[m,n];
 const boxes=blankSlide();boxes.lead='';boxes.summary='独立文本块可紧凑排版，真实遮挡仍需修正。';
 const tables=blankSlide(),t=moduleOf('table',{x:58,y:256,w:1484,h:400});t.rows=[['方法','指标'],['算法甲','12.34'],['算法乙','56.78']];tables.modules=[t];
 p.grid=8;p.slides=[s,boxes,tables,makePreset('references-page')];
 await page.locator('#html-file').setInputFiles({name:'editor-refinements.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(p)+'</script>')});
 await page.locator('#view-mode').selectOption('single');
 const select=async(moduleIndex,paragraph=0)=>{
  await page.locator('#canvas .text-module').nth(moduleIndex).locator('.paragraph').evaluate((el,i)=>{el.focus();const block=el.children[i]||el,r=document.createRange();r.selectNodeContents(block);getSelection().removeAllRanges();getSelection().addRange(r);document.dispatchEvent(new Event('selectionchange'));},paragraph);
 };
 await select(0);assert.equal(await page.locator('#format-font-size').inputValue(),'14');assert.equal(await page.locator('#format-line-spacing').inputValue(),'1.2');assert.equal(await page.locator('#format-paragraph-after').inputValue(),'12');
 await select(0,1);assert.equal(await page.locator('#format-paragraph-after').inputValue(),'9');
 await select(1);assert.equal(await page.locator('#format-font-size').inputValue(),'16');assert.equal(await page.locator('#format-line-spacing').inputValue(),'1.7');assert.equal(await page.locator('#format-paragraph-after').inputValue(),'8');
 await page.locator('#canvas .text-module').nth(1).locator('.paragraph').evaluate(el=>{el.focus();const node=el.querySelector('[data-paragraph]').firstChild,r=document.createRange();r.setStart(node,0);r.setEnd(node,5);getSelection().removeAllRanges();getSelection().addRange(r);document.dispatchEvent(new Event('selectionchange'));});
 await page.locator('#format-font-size').selectOption('14');await select(1);assert.equal(await page.locator('#format-font-size').inputValue(),'__mixed__');
 await page.locator('#format-font-size').selectOption('14');assert.equal(await page.locator('#canvas .text-module').nth(1).locator('.paragraph span').evaluate(el=>Math.round(parseFloat(getComputedStyle(el).fontSize)*.6)),14);
 await select(0);assert.equal(await page.locator('#format-font-size').inputValue(),'14');
 await page.locator('[data-page="1"]').click();
 const draw=async(x,y,w,h,tone)=>{
  await page.locator('[data-action="draw"]').click();const b=await page.locator('#canvas').boundingBox(),k=b.width/1600;
  await page.mouse.move(b.x+x*k,b.y+y*k);await page.mouse.down();await page.mouse.move(b.x+(x+w)*k,b.y+(y+h)*k,{steps:8});await page.mouse.up();
  await page.locator('#insert-type').selectOption('textbox-'+tone);await page.locator('[data-action="insert-dialog-apply"]').click();
 };
 await draw(58,688,600,56,'dark');await draw(666,688,600,56,'light');
 const state=await page.evaluate(()=>window.slideStudio.getProject());
 for(const m of state.slides[1].modules){assert.equal(m.textBox,true);assert.equal((m.x-58)%8,0);assert.equal((m.y-256)%8,0);assert.equal(m.w%8,0);assert.equal(m.h%8,0);assert.ok(m.y+m.h>726&&m.y+m.h<=750);}
 assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 const paint=await page.locator('#canvas .standalone-text .paragraph').evaluateAll(es=>es.map(el=>({color:getComputedStyle(el).color,bg:getComputedStyle(el.parentElement).backgroundColor})));
 assert.equal(paint[0].color,'rgb(255, 255, 255)');assert.equal(paint[1].bg,'rgb(255, 255, 255)');assert.notEqual(paint[1].color,paint[0].color);
 await page.locator('[data-page="2"]').click();if(await page.evaluate(()=>window.slideStudio.getMode())!=='edit')await page.locator('[data-action="mode-edit"]').first().click();await page.locator('#canvas .table-module').click();
 await page.locator('#table-cell-padding').fill('2');await page.locator('.brand').click();await page.locator('#table-row-height').fill('48');await page.locator('.brand').click();const tall=await page.locator('#canvas table tr').first().evaluate(el=>el.offsetHeight);
 await page.locator('#table-row-height').fill('32');await page.locator('.brand').click();const compact=await page.locator('#canvas table tr').first().evaluate(el=>el.offsetHeight);assert.ok(tall>compact+20);
 assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 await draw(58,776,600,56,'light');assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 await page.locator('[data-page="3"]').click();await page.locator('#reference-cell-padding').fill('3');await page.locator('.brand').click();assert.ok(await page.locator('#canvas table td').first().evaluate(el=>Math.abs(parseFloat(getComputedStyle(el).paddingTop)-5)<.1));
 const saved=page.waitForEvent('download');await page.locator('[data-action="html"]').first().click();const download=await saved;await download.saveAs('ect/editor-refinements.html');
 const offline=await browser.newPage();await offline.goto(new URL('../ect/editor-refinements.html',import.meta.url).href);await offline.waitForFunction(()=>window.slideStudio);
 const restored=await offline.evaluate(()=>window.slideStudio.getProject());assert.equal(restored.slides[1].modules[1].boxTone,'light');assert.equal(restored.slides[2].modules[0].rowHeightPt,32);assert.equal(restored.slides[2].modules[0].cellPaddingPt,2);assert.equal(restored.slides[3].referenceCellPaddingPt,3);
 await offline.locator('[data-page="1"]').click();await offline.locator('#canvas .standalone-text .paragraph').first().fill('真实超量内容需要继续提示。'.repeat(100));assert.ok((await offline.evaluate(()=>window.slideStudio.check())).length>0,'Actual clipped text must still fail');
 await page.locator('[data-page="1"]').click();await page.locator('#canvas').screenshot({path:'ect/editor-refinements.png'});
 console.log('PASS selection reflects actual size/line/paragraph spacing; one-step 14pt change; snapped dark/light text boxes near summary; table and bibliography spacing; offline round trip');
}finally{await browser.close();}
