import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {browserPaths} from '../src/server/browser-paths.mjs';

let executablePath;
for(const candidate of browserPaths())try{await fs.access(candidate);executablePath=candidate;break;}catch{}
const browser=await chromium.launch(executablePath?{headless:true,executablePath}:{headless:true});
const page=await browser.newPage({viewport:{width:1600,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
const title=page.locator('.tutorial-guide h2'),assist=page.getByRole('button',{name:'代我完成此步'}),skip=page.getByRole('button',{name:'代我完成本项'});
const changed=async before=>page.waitForFunction(value=>document.querySelector('.tutorial-guide h2')?.textContent!==value,before,{timeout:8000}).catch(async error=>{throw Error(`教学停在“${before}”；目标=${await page.locator('.tutorial-target').count()}；当前=${await title.innerText()}；${error.message}`);});
const tutorialURL=pathToFileURL(path.resolve('templates/template-1/ustb-blue/tutorial.html'));tutorialURL.searchParams.set('tutorial','1');
const reachTableStep=async()=>{
 if(page.url().startsWith('file:'))await page.evaluate(()=>sessionStorage.clear());
 await page.goto(tutorialURL.href);await title.waitFor();await page.getByRole('button',{name:'我已阅读，继续'}).click();
 for(const next of ['先建立文档骨架','打开页面信息练习页','进入空白正文练习页']){await skip.click();await title.filter({hasText:next}).waitFor({timeout:15000});}
 assert.equal(await title.innerText(),'进入空白正文练习页');
 for(let guard=0;guard<40&&!/打开已经放好表格的练习页/.test(await title.innerText());guard++){
  const before=await title.innerText();await assist.click();await changed(before);
 }
 assert.equal(await title.innerText(),'打开已经放好表格的练习页');
 const target=page.locator('.slide-thumb.tutorial-target');await target.waitFor();assert.match(await target.innerText(),/表格练习/);
 return target;
};
try{
 let target=await reachTableStep(),before=await title.innerText();await page.waitForTimeout(700);const box=await target.boundingBox();assert.ok(box,'highlighted table thumbnail remains visible');await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await changed(before);
 assert.equal(await title.innerText(),'进入模块编辑模式');
 assert.match(await page.locator('.slide-thumb.current .thumb-caption').innerText(),/表格练习/);
 target=await reachTableStep();
 before=await title.innerText();await assist.click();await changed(before);
 assert.equal(await title.innerText(),'进入模块编辑模式');
 assert.match(await page.locator('.slide-thumb.current .thumb-caption').innerText(),/表格练习/);
 await reachTableStep();await skip.click();await title.filter({hasText:'打开公式练习页'}).waitFor({timeout:20000});
 const tableState=await page.evaluate(()=>{const slide=window.slideStudio.getProject().slides.find(slide=>slide.title==='表格练习'),table=slide.modules.find(module=>module.type==='table');return {rows:table.rows,fontPt:table.fontPt,rowHeightPt:table.rowHeightPt,fixedFont:table.fixedFont,borderless:!!table.borderless};});
 assert.equal(tableState.rows.length,5,'completing the table section keeps the replacement data');
 assert.equal(tableState.rows[0].length,4,'bulk replacement determines the final table columns');
 assert.equal(tableState.fontPt,12);assert.equal(tableState.rowHeightPt,30);assert.equal(tableState.fixedFont,true);assert.equal(tableState.borderless,false);
 assert.deepEqual(errors,[]);
 console.log('PASS table thumbnail opens manually or by assistance; completing the section preserves the edited table state');
}finally{await browser.close();}
