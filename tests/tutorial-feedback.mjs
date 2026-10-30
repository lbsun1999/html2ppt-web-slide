import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {tutorialFeedbackKind} from '../src/tutorial.js';

assert.equal(tutorialFeedbackKind({groupName:'模块编辑',isGroupEnd:false}),'cue','ordinary manual steps use the standard cue');
assert.equal(tutorialFeedbackKind({groupName:'文字编辑',isGroupEnd:false,assisted:true}),'cue','ordinary assisted steps also use the standard cue');
assert.equal(tutorialFeedbackKind({groupName:'表格编辑',isGroupEnd:true}),'correct','manual completion of the final step uses regular Jerry');
assert.equal(tutorialFeedbackKind({groupName:'公式编辑',isGroupEnd:true,assisted:true}),'assist','assisted completion of the final step uses devil Jerry');
assert.equal(tutorialFeedbackKind({skipGroup:true}),'skip','skipping the entire section uses Tom');

const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1720,height:1080}});
 await page.addInitScript(()=>{window.__tutorialAudio=[];HTMLMediaElement.prototype.play=function(){window.__tutorialAudio.push(decodeURI(this.src));return Promise.resolve();};});
 await page.goto(pathToFileURL(path.resolve('templates/template-1/ustb-blue/tutorial.html')).href+'?tutorial=1');
 await page.waitForFunction(()=>window.slideStudio);
 const guide=page.locator('.tutorial-guide'),reward=page.locator('.tutorial-reward'),imageSource=async()=>decodeURI(await reward.locator('img').getAttribute('src'));await guide.waitFor();
 await page.locator('[data-tutorial-full]').click();
 await guide.locator('h2').filter({hasText:'欢迎进入交互训练场'}).waitFor();

 await page.getByRole('button',{name:'我已阅读，继续'}).click();
 await page.waitForTimeout(240);
 assert.equal(await reward.count(),0,'the welcome step uses only the standard cue');
 assert.equal((await page.evaluate(()=>window.__tutorialAudio.length)),0,'the standard cue does not start a voice pack');
 await page.getByRole('button',{name:'代我完成此步'}).click();
 await page.waitForTimeout(240);
 assert.equal(await reward.count(),0,'assisting a non-final step still uses only the standard cue');
 assert.equal((await page.evaluate(()=>window.__tutorialAudio.length)),0,'a non-final assisted step does not start devil Jerry');
 await page.getByRole('button',{name:'代我完成本项'}).click();
 await page.locator('.tutorial-reward[data-feedback="skip"]').waitFor();
 assert.match(await imageSource(),/你还挺厉害-汤姆\.png/);
 assert.match((await reward.innerText()).trim(),/汤姆/,'skipped-section feedback restores its short explanation');
 assert.match((await page.evaluate(()=>window.__tutorialAudio.at(-1)))||'',/你还挺厉害-汤姆\.mp3/);
 await page.waitForTimeout(520);
 await page.screenshot({path:'ect/tutorial-feedback-skip.png'});

 for(let guard=0;guard<12&&!/训练完成/.test(await guide.locator('h2').innerText());guard++){
  await page.waitForFunction(()=>{const button=[...document.querySelectorAll('.tutorial-guide button')].find(node=>node.textContent==='代我完成本项');return button&&!button.disabled&&!button.hidden;},{timeout:20000});
  const before=await page.locator('.tutorial-progress-label').innerText();
  await page.getByRole('button',{name:'代我完成本项'}).evaluate(button=>button.click());
  await page.waitForFunction(value=>document.querySelector('.tutorial-progress-label')?.textContent!==value,before,{timeout:20000}).catch(async error=>{throw Error(`本项没有推进：${before}；当前=${await guide.locator('h2').innerText()}；${(await page.locator('.tutorial-notice').allTextContents()).join(' | ')}；${error.message}`);});
  await page.waitForTimeout(900);
  const failure=await page.locator('.tutorial-notice').filter({hasText:'自动完成失败'}).allTextContents();if(failure.length)throw Error(`${before}: ${failure.join(' ')}`);
 }
 assert.match(await guide.locator('h2').innerText(),/训练完成/);
 const completed=await page.evaluate(()=>{const project=window.slideStudio.getProject(),titles=project.slides.map(slide=>slide.title),media=project.slides.find(slide=>slide.title==='图片与视频练习'),alignment=project.slides.find(slide=>slide.title==='高级对齐练习'),boxes=[...alignment.modules].sort((a,b)=>a.x-b.x),a=boxes.find(module=>module.parts?.[0]?.title==='板块 A'),gaps=boxes.slice(0,-1).map((module,i)=>boxes[i+1].x-(module.x+module.w)),ringSlide=project.slides.find(slide=>slide.title==='环形文字排版练习'),ring=ringSlide.modules.find(module=>module.type==='group'),absolute=(ring?.items||[]).map(item=>({x:ring.x+item.x,y:ring.y+item.y,w:item.w,h:item.h})),overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;return {titles,caption:media?.modules?.[0]?.parts?.[0]?.caption||'',alignA:{x:a.x,y:a.y,w:a.w,h:a.h},gaps,ringCount:ring?.items?.length||0,ringSafe:absolute.every(rect=>rect.x>=58&&rect.y>=256&&rect.x+rect.w<=1542&&rect.y+rect.h<=810)&&absolute.every((rect,i)=>absolute.slice(i+1).every(other=>!overlap(rect,other)))};});
 assert.ok(completed.titles.indexOf('高级对齐练习')<completed.titles.indexOf('环形文字排版练习')&&completed.titles.indexOf('环形文字排版练习')<completed.titles.indexOf('时间轴与图文练习'),'practice pages follow the teaching order');
 assert.equal(completed.caption,'图 1　教学图片的结构与信息层级','completing media teaching writes a real image title');
 assert.deepEqual(completed.alignA,{x:70,y:300,w:490,h:290},'reference-line teaching visibly moves left/top and stretches right/bottom');
 assert.ok(Math.abs(completed.gaps[0]-completed.gaps[1])<.001,'multi-select teaching equalizes the two horizontal gaps');
 assert.equal(completed.ringCount,4,'radial teaching creates four copies from one line of text');
 assert.equal(completed.ringSafe,true,'the four-item radial example stays inside the content area without overlap');
 await page.getByRole('button',{name:'完成全部教程'}).click();
 await page.locator('.tutorial-reward[data-feedback="complete"]').waitFor();
 assert.match(await imageSource(),/做完全部教程\.png/);
 assert.equal(await reward.getAttribute('data-audio'),'synthetic-applause');
 await page.waitForTimeout(520);
 await page.screenshot({path:'ect/tutorial-feedback-complete.png'});
 await page.locator('[data-tutorial-full]').waitFor({timeout:5000});
 assert.equal(await guide.count(),1,'completion returns to the tutorial home instead of discarding the catalog');
 console.log('PASS standard step cue, group-end reward rules, Tom skip feedback and final applause');
}finally{await browser.close();}
