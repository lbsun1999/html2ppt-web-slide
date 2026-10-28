import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await b.newPage({viewport:{width:1720,height:1080}});
 await page.goto(pathToFileURL(path.resolve('index.html')).href);assert.ok(await page.getByText('此入口需要本地服务。',{exact:false}).isVisible());
 await page.goto(pathToFileURL(path.resolve('templates/template-1/ustb-blue/template.html')).href);await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');
 const types=await page.evaluate(()=>window.slideStudio.getProject().slides.map(s=>s.kind));for(let i=0;i<types.length;i++)if(['cover','closing','transition'].includes(types[i])){await page.locator(`[data-page="${i}"]`).click();assert.equal(await page.locator('#canvas .slide-footer').count(),0,'Cover, closing and transition pages have no footer/page number');}
 await page.locator('[data-page="23"]').click();assert.equal(await page.locator('#canvas .summary-cards .text-part').count(),3);
 const style=await page.locator('#canvas .plan-module table').evaluate(t=>({body:[...t.querySelectorAll('tr:not(:first-child) td:first-child')].map(n=>({bg:getComputedStyle(n).backgroundColor,color:getComputedStyle(n).color})),head:[...t.querySelectorAll('tr:first-child th')].map(n=>getComputedStyle(n).backgroundColor),font:parseFloat(getComputedStyle(t).fontSize)*.6,padding:parseFloat(getComputedStyle(t.querySelector('td')).paddingTop)}));
 assert.ok(style.body.every(n=>n.bg!=='rgb(0, 91, 148)'));assert.ok(style.head.every(c=>c==='rgb(0, 91, 148)'));assert.ok(Math.abs(style.font-14)<.01);assert.equal(style.padding,5);
 assert.ok(await page.locator('#canvas .summary-cards .plain-group-title').evaluate(n=>parseFloat(getComputedStyle(n).fontSize)>30));
 await page.locator('[data-page="16"]').click();assert.equal(await page.locator('#canvas .scenario-table tbody tr:nth-child(3) td:first-child').evaluate(n=>getComputedStyle(n).borderRightWidth),'1px');
 await page.locator('[data-action="mode-edit"]').first().click();await page.locator('#canvas .table-module').click();await page.locator('#table-note').fill('只为这张表填写的说明。');await page.locator('.brand').click();assert.equal(await page.locator('#canvas .table-note').innerText(),'只为这张表填写的说明。');await page.locator('#canvas .table-module').click();await page.locator('#table-note').fill('');await page.locator('.brand').click();assert.equal(await page.locator('#canvas .table-note').count(),0);
 console.log('PASS offline entry guidance, original summary geometry and 14pt table, only top header is dark, first-column separator and editable/removable table note');
}finally{await b.close();}
