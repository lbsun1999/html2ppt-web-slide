import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'北京科技大学_WebSlide科研汇报示例.html'),out=path.join(root,'docs/images');
const digest=async()=>createHash('sha256').update(await fs.readFile(file)).digest('hex'),before=await digest();
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 await fs.mkdir(out,{recursive:true});const records=[];
 const page=await browser.newPage({viewport:{width:1920,height:1200},deviceScaleFactor:1});
 const ui=action=>page.locator(`[data-action="${action}"]`).first();
 async function open(title){
  await page.goto(pathToFileURL(file).href);await page.waitForFunction(()=>window.slideStudio);await page.evaluate(()=>document.fonts.ready);
  await page.locator('#view-mode').selectOption('single');
  const index=await page.evaluate(t=>window.slideStudio.getProject().slides.findIndex(s=>s.title===t),title);assert.ok(index>=0,'Page title missing: '+title);
  await page.locator(`[data-page="${index}"]`).click();
  await page.evaluate(async()=>Promise.all([...document.querySelectorAll('#canvas img')].map(im=>im.decode().catch(()=>{}))));
  return index;
 }
 async function mode(value){if(await page.evaluate(()=>window.slideStudio.getMode())===value)return;if(value==='preview'){const active=await page.evaluate(()=>window.slideStudio.getMode());await ui(active==='edit'?'mode-edit':'mode-text').click();}else await ui(value==='edit'?'mode-edit':'mode-text').click();assert.equal(await page.evaluate(()=>window.slideStudio.getMode()),value);}
 async function shot(name,description){await page.waitForTimeout(120);await page.screenshot({path:path.join(out,name+'.png')});records.push({image:'images/'+name+'.png',description,...await page.evaluate(()=>({view:window.slideStudio.getView(),mode:window.slideStudio.getMode(),currentPage:Number(document.querySelector('#page-label')?.textContent.match(/^\d+/)?.[0])||null}))});console.log('Captured '+name);}

 await open('AI 生成结构，人工完成精修');await mode('preview');await page.locator('#view-mode').selectOption('grid');await page.locator('#view-columns').selectOption('3');await page.evaluate(()=>document.querySelector('.workspace').scrollTo({top:0,behavior:'instant'}));
 await shot('workbench-overview','多页工作台：顶部文件与编辑控件、左侧导航、中央多页视图和右侧当前页设置。');

 await open('AI 生成结构，人工完成精修');await mode('text');
 await page.locator('#canvas .paragraph').first().evaluate(el=>{el.focus();const text=document.createTreeWalker(el,NodeFilter.SHOW_TEXT).nextNode(),range=document.createRange();range.setStart(text,0);range.setEnd(text,Math.min(text.length,8));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);});
 assert.equal(await page.locator('#text-formatbar').isVisible(),true);await shot('text-controls','文字模式：选区、14/16pt、段落列表、加粗、颜色、行距和段后距控件。');

 await open('主图与关键信息');await mode('edit');await page.locator('#canvas .text-module').click();assert.equal(await page.locator('#adjust-multiplier').count(),1);
 await shot('module-controls','模块模式：固定顶点、网格步进、尺寸和位置，以及文本样式与子区域。');

 await open('目标函数与参数更新');await mode('preview');await page.locator('#canvas [data-reference-formula]').first().dblclick();assert.equal(await page.locator('#formula-dialog').isVisible(),true);
 await shot('formula-editor','公式编辑框：LaTeX源码、复制按钮、数学预览、取消和确定。');await page.locator('#formula-dialog button[value="cancel"]').last().click();

 await open('逐页备注：给演讲者留一份讲解线索');await mode('preview');await ui('page-settings').click();await page.locator('#page-notes').scrollIntoViewIfNeeded();assert.equal(await page.locator('#page-notes').isVisible(),true);
 await shot('page-settings-notes','当前页设置弹窗：页尾总结、脚注、本页备注和来源；备注保存后由页面备注面板自动载入。');await page.locator('#page-dialog button[value="cancel"]').last().click();

 await open('主图与关键信息');await mode('preview');await ui('present').click();await page.waitForFunction(()=>window.slideStudio.getView().present);assert.equal(await page.locator('.topbar').isVisible(),false);
 await shot('presentation-fullscreen','全屏放映的实际画面与底部操作提示。');await page.locator('#canvas').dblclick();await page.waitForFunction(()=>window.slideStudio.getView().overview);
 await page.evaluate(()=>document.querySelector('.workspace').scrollTo({top:0,behavior:'instant'}));
 assert.equal(await page.locator('.presentation-overview .view-page').count(),30);await shot('presentation-overview','放映中双击进入每行4页的总览，滚动查找并双击目标页继续放映。');await page.keyboard.press('Escape');
 assert.equal(await digest(),before,'Screenshots must not modify the source HTML');
 await fs.writeFile(path.join(root,'docs/工作台截图记录.json'),JSON.stringify({source:path.basename(file),sha256:before,viewport:page.viewportSize(),screenshots:records},null,2)+'\n');
}finally{await browser.close();}
