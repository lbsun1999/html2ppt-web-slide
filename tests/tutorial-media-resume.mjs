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
 await page.locator('[data-tutorial-group="8"]').click();
 await page.waitForFunction(()=>document.querySelector('.tutorial-guide h2')?.textContent==='打开图片与视频练习页',null,{timeout:30000});
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
 await page.getByRole('button',{name:'返回教程目录'}).click();
 const progress=Number((await page.locator('[data-tutorial-group="8"] em').innerText()).replace('%',''));assert.ok(progress>0&&progress<100,'returning to the catalog preserves this run\'s section progress');
 await page.getByRole('button',{name:'退出教学'}).click();
 assert.equal(await page.locator('.tutorial-guide').count(),0,'退出后关闭教学');
 assert.equal(await page.locator('#tutorial-resume').innerText(),'开始教学');
 await page.locator('#tutorial-resume').click();
 assert.equal(await page.locator('[data-tutorial-group="8"] em').innerText(),'0%','re-entering after exit clears section progress');
 await page.getByRole('button',{name:'退出教学'}).click();
 await page.reload();
 await page.waitForFunction(()=>window.slideStudio);
 assert.equal(await page.locator('.tutorial-guide').count(),0,'刷新后不擅自弹出已退出的教学');
 await page.locator('#tutorial-resume').click();
 assert.equal(await page.locator('[data-tutorial-group="8"] em').innerText(),'0%','refreshing starts a fresh tutorial session');
 await page.screenshot({path:'ect/tutorial-resume-after-media.png'});
 console.log('PASS media apply keeps the tutorial alive; catalog progress lasts only for the current run');
}finally{await browser.close();}
