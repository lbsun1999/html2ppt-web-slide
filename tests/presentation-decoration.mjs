import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {createProject,blankSlide,moduleOf} from '../src/model.js';
import {writeDocument} from '../scripts/build-document.mjs';

const out='ect/presentation-decoration';await fs.mkdir(out,{recursive:true});
const p=createProject({withSections:false});
p.slides=['ribbon','arrow','group'].map(style=>{
 const s=blankSlide(),m=moduleOf('text',{x:58,y:256,w:1484,h:500},2);
 s.title='边框与阴影放映检查';m.style=style;m.headerWidth=80;m.groupTitle='模块总标题';m.columns=2;
 for(const [i,part]of m.parts.entries()){part.title='板块 '+(i+1);part.text='白色文本框保留主题色边框。\n全屏和演讲者视图使用相同阴影。';}
 s.modules=[m];return s;
});
await writeDocument(p,out+'/fixture.html');
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],ui=(page,action)=>page.locator(`[data-action="${action}"]`).first();
async function localReferences(page,selector='#canvas'){
 const result=await page.locator(selector).evaluate(root=>{
  const refs=[];
  for(const svg of root.querySelectorAll('svg[data-decoration]'))for(const n of svg.querySelectorAll('[stroke],[filter]'))for(const attr of ['stroke','filter']){
   const id=n.getAttribute(attr)?.match(/^url\(#([^)]*)\)$/)?.[1];if(!id)continue;
   const matches=[...document.querySelectorAll('[id]')].filter(el=>el.id===id),target=document.getElementById(id);
   refs.push({id,count:matches.length,own:svg.contains(target)});
  }
  return refs;
 });
 assert.ok(result.length,'Expected decorated white text boxes');
 assert.ok(result.every(r=>r.count===1&&r.own),JSON.stringify(result));
}
try{
 const page=await b.newPage({viewport:{width:1920,height:1200}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(out+'/fixture.html')).href);await page.waitForFunction(()=>window.slideStudio);
 const before=await page.evaluate(()=>window.slideStudio.getProject());
 const menu=page.locator('#insert-menu');assert.equal(await menu.locator('option[value=""]').textContent(),'＋');
 assert.equal(await menu.getAttribute('aria-label'),'插入内容');assert.equal((await menu.boundingBox()).width,48);
 assert.equal(await menu.locator('option[value="textbox-dark"]').textContent(),'独立文字块 · 深底白字');
 await page.locator('#view-mode').selectOption('grid');await page.locator('#view-columns').selectOption('3');await localReferences(page,'#pages-surface');
 await page.locator('#view-mode').selectOption('single');
 for(const [index,style]of ['ribbon','arrow','group'].entries()){
  await page.locator(`[data-page="${index}"]`).click();await localReferences(page);
  await ui(page,'present').click();await page.waitForFunction(()=>!!document.fullscreenElement);
  assert.equal(await page.locator('.sidebar').evaluate(el=>getComputedStyle(el).display),'none');await localReferences(page);
  const viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight}));
  await page.locator('#canvas').screenshot({path:`${out}/${style}-direct.png`});
  await page.locator('#canvas').dblclick();await page.waitForFunction(()=>window.slideStudio.getView().overview);await localReferences(page,'#pages-surface');
  await page.locator(`[data-view-page="${index}"] .canvas-frame`).dblclick();await page.waitForFunction(()=>!window.slideStudio.getView().overview);
  await page.locator('#canvas').dispatchEvent('wheel',{ctrlKey:true,deltaY:-200,clientX:700,clientY:450});await localReferences(page);
  await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.slideStudio.getView().present);
  const waiting=page.waitForEvent('popup');await ui(page,'presenter').click();const audience=await waiting;
  audience.on('pageerror',e=>errors.push(e.message));await audience.setViewportSize(viewport);
  await audience.waitForSelector('#canvas .text-box-decoration');await audience.evaluate(()=>document.fonts.ready);await localReferences(audience);
  await audience.locator('#canvas').screenshot({path:`${out}/${style}-audience.png`});
  await audience.locator('#audience-fullscreen').click();await audience.waitForFunction(()=>!!document.fullscreenElement);await localReferences(audience);
  await audience.close();await page.waitForFunction(()=>!document.body.classList.contains('has-audience'));
  console.log('PASS '+style+': preview, hidden thumbnails in fullscreen, overview, zoom and presenter window use their own SVG resources');
 }
 assert.deepEqual(await page.evaluate(()=>window.slideStudio.getProject()),before,'Viewing must not change project data');
 for(const file of ['templates/template-1/ustb-blue/template.html','templates/template-1/lishui-cyan/template.html','reference/example-project.html','reference/blank-template.html']){
  await page.goto(pathToFileURL(path.resolve(file)).href);await page.waitForFunction(()=>window.slideStudio);
  let index=await page.evaluate(()=>window.slideStudio.getProject().slides.findIndex(s=>s.modules.some(m=>['ribbon','arrow','group'].includes(m.style))));
  if(index<0){await page.locator('#html-file').setInputFiles({name:'decoration-check.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(p)+'</script>')});await page.waitForFunction(()=>window.slideStudio.getProject().slides[0].modules[0]?.style==='ribbon');index=0;}
  await page.locator('#view-mode').selectOption('single');await page.locator(`[data-page="${index}"]`).click();
  await ui(page,'present').click();await page.waitForFunction(()=>!!document.fullscreenElement);await localReferences(page);await page.keyboard.press('Escape');
  console.log('PASS standalone fullscreen decorations: '+file);
 }
 assert.deepEqual(errors,[]);
 execFileSync('python',['-X','utf8','tests/inspect-presentation-decoration.py',out],{stdio:'inherit'});
}finally{await b.close();}
