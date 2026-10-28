import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const file='templates/template-1/ustb-red/template.html',html=await fs.readFile(file,'utf8'),original=JSON.parse(html.match(/<script[^>]*id="project-data"[^>]*>([\s\S]*?)<\/script>/)[1]),b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await b.newPage({viewport:{width:1920,height:1200}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(new URL('../'+file,import.meta.url).href);await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');
 async function open(title){const i=original.slides.findIndex(s=>s.title===title);await page.locator(`[data-page="${i}"]`).click();await page.evaluate(()=>document.fonts.ready);return i;}
 const rgb=hex=>'rgb('+[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(', ')+')';
 await open('目标函数与参数更新');for(const selector of ['.formula-module .style-band .text-part','.formula-styles .table-card','.section-index'])assert.ok((await page.locator('#canvas '+selector).evaluateAll(ns=>ns.map(n=>getComputedStyle(n).backgroundColor))).every(c=>c===rgb(original.theme.tint)),selector);
 await page.locator('#canvas').screenshot({path:'docs/images/red-formula-theme.png'});
 await open('作者简介');assert.equal(await page.locator('#canvas .profile-identity').evaluate(n=>getComputedStyle(n).backgroundColor),rgb(original.theme.tint));let avatar=await page.locator('#canvas .profile-portrait').getAttribute('src');assert.ok(decodeURIComponent(avatar.split(',').slice(1).join(',')).includes(original.theme.primary));assert.ok(!decodeURIComponent(avatar).includes('#8aafc6'));
 await page.locator('#canvas').screenshot({path:'docs/images/red-profile-theme.png'});
 await page.locator('[data-action="theme"]').click();await page.locator('#theme-primary').fill('#5A2E89');await page.locator('#theme-tint').fill('#FFF6DF');await page.locator('[data-action="theme-dialog-apply"]').click();assert.equal(await page.locator('#canvas .profile-identity').evaluate(n=>getComputedStyle(n).backgroundColor),rgb('#FFF6DF'));avatar=await page.locator('#canvas .profile-portrait').getAttribute('src');assert.ok(decodeURIComponent(avatar).includes('#5A2E89'));
 await open('目标函数与参数更新');assert.equal(await page.locator('#canvas .formula-module .text-part').first().evaluate(n=>getComputedStyle(n).backgroundColor),rgb('#FFF6DF'));
 const branding=original.slides.find(s=>s.title==='比例可以不同，画面高度必须一致').modules.find(m=>m.type==='media');assert.equal(branding.parts[0].asset.src,original.theme.logo);assert.equal(branding.parts[1].asset.src,original.theme.wordmark);
 await page.goto(new URL('../'+file,import.meta.url).href);await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');for(let i=0;i<original.slides.length;i++){await page.locator(`[data-page="${i}"]`).click();assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[],'Red page '+(i+1));}
 assert.deepEqual((await page.evaluate(()=>window.slideStudio.getProject())).theme,original.theme);assert.deepEqual(errors,[]);console.log('PASS red formula/profile fills, theme-colored placeholder and brand media, arbitrary custom theme changes, all 30 red layouts; original saved palette retained');
}finally{await b.close();}
