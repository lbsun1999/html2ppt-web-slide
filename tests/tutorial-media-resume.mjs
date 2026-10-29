import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {browserPaths} from '../src/server/browser-paths.mjs';

let executablePath;
for(const candidate of browserPaths())try{await fs.access(candidate);executablePath=candidate;break;}catch{}
const browser=await chromium.launch(executablePath?{headless:true,executablePath}:{headless:true});
const page=await browser.newPage({viewport:{width:1600,height:900}});
page.on('pageerror',error=>console.error('PAGE ERROR',error.message));
const url=pathToFileURL(path.resolve('templates/template-1/ustb-blue/tutorial.html'));
url.searchParams.set('tutorial','1');
try{
 await page.goto(url.href);
 await page.locator('.tutorial-guide').waitFor();
 await page.getByRole('button',{name:'我已阅读，继续'}).click();
 while(!/图片与媒体/.test(await page.locator('.tutorial-progress-label').innerText())){
  const group=(await page.locator('.tutorial-progress-label').innerText()).split('·').at(-1).trim();
  await page.locator('.tutorial-actions button').evaluateAll(nodes=>nodes.find(node=>node.textContent==='代我完成本项')?.click());
  await page.waitForFunction(before=>document.querySelector('.tutorial-progress-label')?.textContent.split('·').at(-1).trim()!==before,group,{timeout:30000});
  await page.waitForFunction(()=>[...document.querySelectorAll('.tutorial-actions button')].find(node=>node.textContent==='代我完成本项'&&!node.disabled));
 }
 const assist=()=>page.locator('.tutorial-actions button').evaluateAll(nodes=>nodes.find(node=>node.textContent==='代我完成此步')?.click());
 for(const title of ['打开图片与视频练习页','插入图片／视频模块','增加第二个媒体子区域','打开媒体替换弹窗']){
  await page.waitForFunction(expected=>document.querySelector('.tutorial-guide h2')?.textContent===expected,title,{timeout:10000});
  await page.locator('.tutorial-target').first().waitFor();
  await assist();
 }
 await page.waitForFunction(()=>document.querySelector('.tutorial-guide h2')?.textContent==='选择练习图片');
 await page.locator('#media-file.tutorial-target').waitFor();
 await page.locator('#media-file').setInputFiles('tutorial-assets/media/01-教学图片-结构.svg');
 await page.waitForFunction(()=>document.querySelector('.tutorial-guide h2')?.textContent==='选择媒体原始比例');
 await page.locator('#media-ratio.tutorial-target').waitFor();
 await page.locator('#media-ratio').evaluate(select=>{select.value='original';select.dispatchEvent(new Event('change',{bubbles:true}));});
 await page.waitForFunction(()=>document.querySelector('.tutorial-guide h2')?.textContent==='保留图片标题');
 await page.locator('#media-caption-show.tutorial-target').waitFor();
 const caption=page.locator('#media-caption-show');
 await caption.evaluate(input=>input.dispatchEvent(new Event('change',{bubbles:true})));
 await page.waitForFunction(()=>document.querySelector('.tutorial-guide h2')?.textContent==='应用媒体设置');
 await page.locator('[data-action="media-dialog-apply"].tutorial-target').waitFor();
 await page.locator('[data-action="media-dialog-apply"]').click();
 await page.waitForFunction(()=>document.querySelector('.tutorial-guide h2')?.textContent==='进入图片标题编辑',{timeout:10000});
 assert.equal(await page.locator('.tutorial-guide').count(),1,'应用图片后教学卡片必须继续存在');
 await page.getByRole('button',{name:'退出教学'}).click();
 assert.equal(await page.locator('.tutorial-guide').count(),0,'退出后暂时隐藏教学卡片');
 assert.equal(await page.locator('#tutorial-resume').innerText(),'继续教学');
 await page.locator('#tutorial-resume').click();
 await page.waitForFunction(()=>document.querySelector('.tutorial-guide h2')?.textContent==='进入图片标题编辑',{timeout:10000});
 assert.equal(await page.locator('.tutorial-guide').count(),1,'同一工作台内继续教学恢复到最近步骤');
 await page.getByRole('button',{name:'退出教学'}).click();
 await page.reload();
 await page.waitForFunction(()=>window.slideStudio);
 assert.equal(await page.locator('.tutorial-guide').count(),0,'刷新后不擅自弹出已退出的教学');
 await page.locator('#tutorial-resume').click();
 await page.waitForFunction(()=>document.querySelector('.tutorial-guide h2')?.textContent==='打开图片与视频练习页',{timeout:10000});
 assert.equal(await page.locator('.tutorial-guide').count(),1,'刷新后从最近教学大项入口安全恢复');
 const restoredTarget=page.locator('.slide-thumb.tutorial-target');await restoredTarget.waitFor();assert.match(await restoredTarget.innerText(),/图片与视频练习/);
 await page.screenshot({path:'ect/tutorial-resume-after-media.png'});
 console.log('PASS media apply keeps the tutorial alive and session progress resumes after reload');
}finally{await browser.close();}
