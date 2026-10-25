import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createProject,blankSlide,moduleOf} from '../src/model.js';
import {tableToText} from '../src/table-text.js';
await fs.mkdir('ect',{recursive:true});const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await b.newPage({viewport:{width:1720,height:1080},acceptDownloads:true});await page.addInitScript(()=>{window.showSaveFilePicker=undefined;});await page.goto(new URL('../北京科技大学_WebSlide科研汇报示例.html',import.meta.url).href);await page.waitForFunction(()=>window.slideStudio);
 const p=createProject(),s=blankSlide(),m=moduleOf('table',{x:58,y:256,w:1484,h:500});m.rows=[['场景一',''],['算法','数值'],['测试方法','1.23']];m.headerRows=2;m.merges=[{top:0,left:0,bottom:0,right:1}];s.modules=[m];p.slides=[s];
 await page.locator('#html-file').setInputFiles({name:'table.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(p)+'</script>')});await page.locator('[data-action="mode-edit"]').first().click();await page.locator('#canvas .table-module').click();const state=()=>page.evaluate(()=>window.slideStudio.getProject());
 await page.locator('[data-action="paste-table"]').click();assert.equal(await page.locator('#table-data').inputValue(),tableToText(m.rows));assert.equal(await page.locator('.table-tab').count(),3);assert.ok(await page.locator('.table-tab').first().evaluate(n=>n.getBoundingClientRect().width>0&&getComputedStyle(n).backgroundImage.includes('172, 168, 8')));
 await page.locator('#table-data').focus();await page.keyboard.press('Control+End');await page.keyboard.press('Tab');await page.keyboard.press('Tab');assert.equal(await page.locator('#table-data').evaluate(n=>document.activeElement===n&&n.value.endsWith('\t\t')),true);assert.equal(await page.locator('.table-tab').count(),5);assert.ok(await page.locator('.table-tab').last().evaluate(n=>getComputedStyle(n).backgroundImage.includes('2px')&&getComputedStyle(n).backgroundImage.includes('rgba(0, 0, 0, 0)')));
 await page.locator('#table-dialog button[value="cancel"]').last().click();assert.deepEqual((await state()).slides[0].modules[0].rows,m.rows);
 await page.locator('[data-action="paste-table"]').click();await page.locator('#table-data').fill('场景一\t\t场景二\n算法\t数值\t质量\n测试方法\t2.34\t6.78\n新增方法\t5.67\t9.01');await page.locator('[data-action="table-dialog-apply"]').click();let table=(await state()).slides[0].modules[0];assert.equal(table.rows.length,4);assert.equal(table.rows[0].length,3);assert.equal(table.rows[2][1],'2.34');assert.equal(table.merges.length,1);
 await page.locator('[data-action="undo"]').first().click();table=(await state()).slides[0].modules[0];assert.deepEqual(table.rows,m.rows);assert.deepEqual(table.merges,m.merges);
 console.log('PASS table dialog preloads current cells, cancel is inert, bulk numeric edits/add rows/columns retain merged headers and undo');
}finally{await b.close();}
