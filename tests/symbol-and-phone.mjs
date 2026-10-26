import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{const page=await b.newPage({viewport:{width:1920,height:1200},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.showSaveFilePicker=undefined);await page.goto(new URL('../北京科技大学红色政务_WebSlide科研汇报示例.html',import.meta.url).href);await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');
 assert.ok((await page.locator('#canvas .cover-info [data-text]').evaluateAll(ns=>ns.map(n=>getComputedStyle(n).color))).every(c=>c==='rgb(0, 0, 0)'));
 const p=await page.evaluate(()=>window.slideStudio.getProject()),profile=p.slides.findIndex(s=>s.profileIdentity);
 await page.locator(`[data-page="${profile}"]`).click();await page.locator('#canvas [data-slide-field="profilePhone"]').fill('电话：010-12345678');assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);assert.equal((await page.evaluate(()=>window.slideStudio.getProject())).slides[profile].profilePhone,'电话：010-12345678');
 const wait=page.waitForEvent('download');await page.locator('[data-action="html"]').click();await(await wait).saveAs('ect/symbol-phone.html');await page.goto(new URL('../ect/symbol-phone.html',import.meta.url).href);await page.waitForFunction(()=>window.slideStudio);const saved=await page.evaluate(()=>window.slideStudio.getProject());assert.equal(saved.slides[profile].profilePhone,'电话：010-12345678');assert.deepEqual(errors,[]);console.log('PASS pure-black cover information, borderless editable LaTeX symbols with syntax validation, phone editing and offline persistence');
}finally{await b.close();}
