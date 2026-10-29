import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {blankSlide,moduleOf,createProject} from '../src/model.js';

const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1720,height:1080}});
try{
 await page.goto('http://127.0.0.1:4317');await page.waitForFunction(()=>window.slideStudio);
 const project=createProject({withSections:false}),s=blankSlide();project.theme.primary='#A51C30';project.theme.tint='#FCEFF1';s.lead='';s.modules=[58,400,800].map((x,i)=>{const m=moduleOf('text',{x,y:300,w:200,h:240},i===0?2:1);m.parts.forEach((p,j)=>{p.title=`板块 ${i+1}-${j+1}`;p.text='用于对齐测试。';});m.columns=m.parts.length;return m;});project.slides=[s];
 await page.locator('#html-file').setInputFiles({name:'alignment.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(project)+'</script>')});await page.waitForTimeout(150);
 await page.locator('[data-action="mode-edit"]').click();await page.locator('#canvas .module').first().click();await page.locator('[data-action="advanced-align"]').click();await page.getByRole('button',{name:'纵向参考线平移'}).click();
 assert.equal(await page.locator('.alignment-tool svg').count(),3,'Active tab exposes three icon actions');
 assert.equal(await page.locator('#alignment-panel').evaluate(el=>el.style.getPropertyValue('--primary')),'#A51C30','Alignment controls inherit the document theme');
 await page.screenshot({path:'ect/alignment-tabs.png'});
 const slideBox=await page.locator('#canvas .slide').boundingBox(),guideBox=await page.locator('.alignment-guide.vertical').boundingBox();await page.mouse.move(guideBox.x,guideBox.y+guideBox.height/2);await page.mouse.down();await page.mouse.move(slideBox.x+slideBox.width*300/1600,guideBox.y+guideBox.height/2);await page.mouse.up();await page.getByRole('button',{name:'水平居中'}).click();
 let state=await page.evaluate(()=>window.slideStudio.getProject());assert.equal(state.slides[0].modules[0].x,200);
 await page.getByRole('button',{name:'纵向参考线平移'}).click();await page.getByRole('button',{name:'多选开关'}).click();for(const module of await page.locator('#canvas .module').all())await module.click();await page.getByRole('button',{name:'水平等距'}).click();state=await page.evaluate(()=>window.slideStudio.getProject());assert.equal(state.slides[0].modules[1].x,500);assert.ok(Number.isFinite(state.slides[0].modules[0].partGap));
 await page.getByRole('button',{name:'环形分布'}).click();await page.locator('#radial-radius').fill('120');await page.locator('[data-action="radial-dialog-apply"]').click();state=await page.evaluate(()=>window.slideStudio.getProject());assert.equal(state.slides[0].modules.length,1);assert.equal(state.slides[0].modules[0].type,'group');assert.equal(state.slides[0].modules[0].items.length,3);
 const learning=await browser.newPage({viewport:{width:1720,height:1080}});await learning.goto(pathToFileURL(path.resolve('reference/navigation.html')).href);await learning.waitForFunction(()=>window.slideStudio);const learningIndex=await learning.evaluate(()=>window.slideStudio.getProject().slides.findIndex(s=>s.id==='reference-advanced-alignment'));assert.equal(learningIndex,10,'Interactive alignment lesson remains page 11 of navigation.html');await learning.locator(`[data-page="${learningIndex}"]`).click();await learning.locator('[data-action="mode-edit"]').click();await learning.locator('#canvas .module').first().click();await learning.locator('[data-action="advanced-align"]').click();assert.equal(await learning.locator('.alignment-mode-grid button').count(),5);assert.equal(await learning.locator('#canvas .module').count(),4);await learning.close();
 console.log('PASS advanced guide alignment, expanded subregion distribution and radial group');
}finally{await browser.close();}
