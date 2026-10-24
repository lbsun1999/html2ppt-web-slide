import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createProject,blankSlide,moduleOf,SAFE} from '../src/model.js';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await b.newPage({viewport:{width:1600,height:1000},acceptDownloads:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const ui=k=>page.locator(`[data-action="${k}"]`).first();const state=()=>page.evaluate(()=>window.slideStudio.getProject());
async function load(p){await page.locator('#html-file').setInputFiles({name:'媒体等高.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(p)+'</script>')});await page.waitForTimeout(100);}
async function dimensions(){return await page.locator('#canvas .media-window').evaluateAll(nodes=>nodes.map(n=>{const scale=n.closest('.slide').getBoundingClientRect().width/1600,r=n.getBoundingClientRect(),caption=n.parentElement.querySelector('figcaption');return {h:r.height/scale,w:r.width/scale,y:r.top/scale,caption:caption?.getBoundingClientRect().top/scale};}));}
const equal=row=>{assert.ok(Math.max(...row.map(r=>r.h))-Math.min(...row.map(r=>r.h))<.04);assert.ok(Math.max(...row.map(r=>r.y))-Math.min(...row.map(r=>r.y))<.04);};
try{
 await fs.mkdir('ect',{recursive:true});await page.addInitScript(()=>{window.showSaveFilePicker=undefined;});await page.goto('http://127.0.0.1:4317');await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');
 const p=createProject(),s=blankSlide(),m=moduleOf('media',{...SAFE},3);s.title='自定义媒体比例与等高编排';s.modules=[m];m.parts[1].note='这是一段更长的图注，用于检查图注多行时，画面仍然严格等高。';p.slides=[s];await load(p);
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=960;c.height=640;const g=c.getContext('2d');g.fillStyle='#005894';g.fillRect(0,0,960,640);g.fillStyle='#2BA3C0';g.fillRect(0,0,320,640);g.fillStyle='white';g.font='bold 70px Arial';g.fillText('MEDIA',330,340);return c.toDataURL('image/png');});
 for(let i=0;i<2;i++){
  await page.locator(`#canvas [data-media-part="${i}"]`).dblclick();assert.equal(await page.locator('#media-custom-fields').isVisible(),false);
  await page.locator('#media-file').setInputFiles({name:'sample.png',mimeType:'image/png',buffer:Buffer.from(png.split(',')[1],'base64')});await page.locator('#crop-box img').waitFor();
  await page.locator('#media-ratio').selectOption('custom');assert.equal(await page.locator('#media-custom-fields').isVisible(),true);
  await page.locator('#media-custom-w').fill(i===0?'3':'2.35');await page.locator('#media-custom-h').fill(i===0?'2':'0');
  if(i===1){await ui('media-dialog-apply').click();assert.equal(await page.locator('#media-dialog').evaluate(e=>e.open),true);assert.match(await page.locator('#toast').innerText(),/大于 0/);await page.locator('#media-custom-h').fill('1');}
  await ui('media-dialog-apply').click();
 }
 await page.locator('#canvas [data-media-part="2"]').dblclick();await page.locator('#media-file').setInputFiles('tests/fixtures/flower.mp4');await page.locator('#crop-box video').waitFor();await page.locator('#media-ratio').selectOption('custom');await page.locator('#media-custom-w').fill('4');await page.locator('#media-custom-h').fill('3');await ui('media-dialog-apply').click();
 const a=await dimensions();equal(a);assert.ok(Math.abs(a[0].w/a[0].h-1.5)<.001);assert.ok(Math.abs(a[1].w/a[1].h-2.35)<.001);assert.ok(Math.abs(a[2].w/a[2].h-4/3)<.001);assert.ok(Math.max(...a.map(r=>r.caption))-Math.min(...a.map(r=>r.caption))<.04);assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 console.log('PASS custom image/video ratios and equal visible heights with unequal captions');
 await page.locator('#canvas [data-media-part="0"]').dblclick();assert.equal(await page.locator('#media-ratio').inputValue(),'custom');assert.equal(await page.locator('#media-custom-w').inputValue(),'3');assert.equal(await page.locator('#media-custom-h').inputValue(),'2');await page.locator('#media-ratio').selectOption('original');await ui('media-dialog-apply').click();equal(await dimensions());
 await page.locator('#canvas [data-media-part="0"]').dblclick();assert.equal(await page.locator('#media-ratio').inputValue(),'original');await ui('media-dialog-apply').click();console.log('PASS ratio selection restored, including original-ratio mode');
 const exported=await state();await page.screenshot({path:'ect/media-layout.png'});
 const download=page.waitForEvent('download');await ui('html').click();await(await download).saveAs('ect/media-layout.html');
 const offline=await b.newPage();await offline.goto(new URL('../ect/media-layout.html',import.meta.url).href);await offline.waitForFunction(()=>window.slideStudio);const hs=await offline.locator('#canvas .media-window').evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().height));assert.ok(Math.max(...hs)-Math.min(...hs)<.04);await offline.close();console.log('PASS self-contained HTML retains ratios and equal heights');
 const res=await page.request.post('http://127.0.0.1:4317/api/export/pptx',{data:exported,timeout:120000});assert.equal(res.status(),200,res.status()===200?'':await res.text());await fs.writeFile('ect/media-layout.pptx',await res.body());
 execFileSync('python',['tests/inspect-media.py','ect/media-layout.pptx'],{stdio:'inherit'});
 // Independently positioned media modules still share the height if their tops align.
 const separate=createProject();const bs=blankSlide();bs.modules=[moduleOf('media',{x:58,y:256,w:724,h:500}),moduleOf('media',{x:806,y:256,w:736,h:400})];bs.modules.forEach((n,i)=>{n.parts[0].asset=exported.slides[0].modules[0].parts[i].asset;});separate.slides=[bs];await load(separate);equal(await dimensions());
 // Multiple rows are fitted independently, including an incomplete final row.
 const rows=createProject();const rs=blankSlide();rs.modules=[moduleOf('media',{...SAFE},3)];rs.modules[0].columns=2;rs.modules[0].parts.forEach((part,i)=>{part.asset=exported.slides[0].modules[0].parts[i].asset;part.showCaption=false;});rows.slides=[rs];await load(rows);const d=await dimensions();equal(d.slice(0,2));assert.ok(d[2].y>d[0].y);assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);console.log('PASS independent aligned modules and multi-row layout');
 const noCaption=await page.locator('#canvas .media-part').evaluateAll(figures=>figures.map(f=>{const scale=f.closest('.slide').getBoundingClientRect().width/1600;return {caption:!!f.querySelector('figcaption'),extra:(f.getBoundingClientRect().height-f.querySelector('.media-window').getBoundingClientRect().height)/scale};}));for(const f of noCaption){assert.equal(f.caption,false);assert.ok(Math.abs(f.extra-32)<.05,'caption-free figure reserves only its padding');}
 assert.deepEqual(errors,[]);
}finally{await b.close();}
