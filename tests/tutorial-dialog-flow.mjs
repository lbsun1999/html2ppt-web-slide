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
const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
const title=page.locator('.tutorial-guide h2');
const waitTitle=text=>title.filter({hasText:text}).waitFor({timeout:8000});
const tutorialURL=pathToFileURL(path.resolve('templates/template-1/ustb-blue/tutorial.html'));tutorialURL.searchParams.set('tutorial','1');
try{
 await page.goto(tutorialURL.href);
 await waitTitle('欢迎进入交互训练场');
 await page.getByRole('button',{name:'我已阅读，继续'}).click();
 for(const next of ['先建立文档骨架','打开页面信息练习页','进入空白正文练习页','进入文字编辑','打开已经放好表格的练习页']){
  await page.getByRole('button',{name:'代我完成本项'}).click();
  await waitTitle(next);
 }

 const completedGroups=await page.evaluate(()=>{const slides=window.slideStudio.getProject().slides,info=slides.find(slide=>slide.title==='页面信息与备注练习'),blank=slides.find(slide=>slide.title==='空白正文与卡片排版'),module=blank?.modules[0];return {notes:info?.notes||'',moduleCount:blank?.modules.length||0,parts:module?.parts?.length||0,style:module?.style||'',text:module?.parts?.[0]?.text||''};});
 assert.match(completedGroups.notes,/研究问题/,'completing the page-settings section writes the practice notes');
 assert.equal(completedGroups.moduleCount,1,'completing the module section inserts the practice module');
 assert.equal(completedGroups.parts,3,'completing the module section leaves three editable subregions');
 assert.equal(completedGroups.style,'band','completing the module section applies the A3 card style');
 assert.match(completedGroups.text,/J_\{\\theta\}/,'completing the text section writes the inline-formula practice copy');

 assert.equal(await page.locator('.slide-thumb.tutorial-target').count(),1,'打开表格页时应高亮唯一的表格练习缩略图');
 assert.match(await page.locator('.slide-thumb.tutorial-target').innerText(),/表格练习/);
 await page.waitForTimeout(950);
 const thumbVisibility=await page.locator('.slide-thumb.tutorial-target').evaluate(node=>{const target=node.getBoundingClientRect(),list=node.closest('#slides').getBoundingClientRect();return {top:target.top-list.top,bottom:list.bottom-target.bottom};});
 assert.ok(thumbVisibility.top>=0&&thumbVisibility.bottom>=0,'表格页高亮缩略图应完整滚动到左栏可见区域');
 await page.screenshot({path:'ect/tutorial-open-table-highlight.png'});
 await page.locator('.tutorial-target').click();
 await waitTitle('进入模块编辑模式');
 await page.locator('.tutorial-target').click();
 await waitTitle('选中预置练习表格');
 await page.locator('.tutorial-target').click();
 await waitTitle('离线导入练习 Excel');
 await page.screenshot({path:'ect/tutorial-offline-table-page.png'});
 await page.locator('#excel-file').setInputFiles('tutorial-assets/table-import-demo.xlsx');
 await page.locator('#excel-dialog[open]').waitFor().catch(async error=>{console.error('offline excel diagnostics',{toast:await page.locator('#toast').innerText(),pageErrors});throw error;});
 await waitTitle('选择 Excel 工作表');
 assert.equal(await page.locator('#excel-dialog .tutorial-guide').count(),1,'Excel 弹窗应继续承载教学卡片');
 assert.equal(await page.locator('#excel-sheet option:checked').textContent(),'实验结果（5 行）');
 await page.getByRole('button',{name:'我已阅读，继续'}).click();
 await waitTitle('确认导入 Excel');
 await page.locator('.tutorial-target').click();

 await waitTitle('调整表格基准字号');
 await page.locator('#table-font-size').waitFor({timeout:8000}).catch(async error=>{
  console.error('table inspector diagnostics',await page.evaluate(()=>({mode:window.slideStudio?.getMode(),current:document.querySelector('.slide-thumb.current')?.textContent,inspector:document.querySelector('#inspector')?.innerText,project:window.slideStudio?.getProject().slides.map((slide,i)=>({i,title:slide.title,modules:slide.modules.map(module=>module.type)}))})));
  throw error;
 });
 await page.locator('#table-font-size').selectOption('12');
 await waitTitle('调整单元格高度');
 await page.locator('#table-row-height').fill('30');
 await page.locator('#table-row-height').dispatchEvent('change');
 await waitTitle('体验无框线表格样式');
 await page.locator('#borderless-table').check();
 await waitTitle('恢复标准表格样式');
 await page.locator('#borderless-table').uncheck();
 await waitTitle('增加一行');
 await page.locator('.tutorial-target').click();
 await waitTitle('增加一列');
 await page.locator('.tutorial-target').click();
 await waitTitle('打开表格批量编辑');
 await page.locator('.tutorial-target').click();
 await page.locator('#table-dialog[open]').waitFor();
 await waitTitle('用 Tab 和回车修改表格');
 assert.equal(await page.locator('#table-dialog .tutorial-guide').count(),1,'表格编辑弹窗应继续承载教学卡片');
 await page.screenshot({path:'ect/tutorial-table-dialog-guide.png'});
 const replacement=await fs.readFile('tutorial-assets/table-replace-demo.txt','utf8');
 await page.locator('#table-data').fill(replacement.trimEnd());
 await page.locator('#table-data').dispatchEvent('change');
 await waitTitle('应用批量替换');
 await page.locator('.tutorial-target').click();

 await waitTitle('打开公式练习页');
 await page.locator('.tutorial-target').click();
 await waitTitle('打开“更多模块”');
 await page.locator('#insert-menu').selectOption('more');
 await waitTitle('选择 LaTeX 公式');
 await page.locator('#insert-type').selectOption('formula');
 await waitTitle('设置两个公式子区域');
 await page.locator('#insert-count').fill('2');
 await page.locator('#insert-count').dispatchEvent('change');
 await waitTitle('确认插入公式模块');
 await page.locator('.tutorial-target').click();
 await waitTitle('双击打开公式编辑器');
 await page.locator('.tutorial-target').dblclick();
 await page.locator('#formula-dialog[open]').waitFor();
 await waitTitle('修改公式 LaTeX');
 assert.equal(await page.locator('#formula-dialog .tutorial-guide').count(),1,'公式弹窗应继续承载教学卡片');
 assert.equal(await page.locator('#formula-latex.tutorial-target').count(),1,'LaTeX 输入框应获得当前步骤高亮');
 await page.screenshot({path:'ect/tutorial-formula-dialog-guide.png'});
 console.log('PASS Excel/table teaching flow and formula-dialog guide continuity');
}finally{
 await browser.close();
}
