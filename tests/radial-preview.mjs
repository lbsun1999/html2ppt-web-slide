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
try{
 await page.goto(pathToFileURL(path.resolve('templates/template-1/ustb-blue/tutorial.html')).href);await page.waitForFunction(()=>window.slideStudio);
 await page.locator('.slide-thumb').filter({hasText:'环形文字排版练习'}).click();
 await page.locator('[data-action="mode-edit"]').click();await page.locator('#canvas .module').filter({hasText:'研究目标'}).click();
 await page.locator('[data-action="advanced-align"]').click();await page.locator('[data-align-mode="multi"]').click();await page.locator('#canvas .module').filter({hasText:'研究目标'}).click();
 await page.locator('[data-action="radial-options"]').click();await page.locator('#radial-dialog[open]').waitFor();
 const setRange=async(id,value)=>page.locator(`[data-radial-for="${id}"]`).evaluate((input,next)=>{input.value=next;input.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
 await setRange('radial-radius',180);await setRange('radial-start',-45);await setRange('radial-end',45);
 assert.equal(await page.locator('.radial-live-preview .radial-preview-item').count(),4,'drag controls preview four copies before committing');
 assert.match(await page.locator('#radial-preview-status').innerText(),/全部位于正文安全区/);
 assert.equal(await page.locator('.radial-live-preview.invalid').count(),0,'the teaching arc preview is valid');
 await page.screenshot({path:'ect/tutorial-radial-live-preview.png'});
 await page.locator('[data-action="radial-dialog-apply"]').click();
 let state=await page.evaluate(()=>{const slide=window.slideStudio.getProject().slides.find(slide=>slide.title==='环形文字排版练习'),group=slide.modules.find(module=>module.type==='group');return {groups:slide.modules.filter(module=>module.type==='group').length,count:group?.items?.length||0,id:group?.id,titles:group?.items?.map(item=>item.parts?.[0]?.title),nested:group?.items?.some(item=>item.type==='group')};});
 assert.equal(state.groups,1);assert.equal(state.count,4);assert.equal(state.nested,false);
 await page.locator('[data-action="advanced-align"]').click();await page.locator('[data-align-mode="multi"]').click();await page.locator('#canvas .group-module').click();await page.locator('[data-action="radial-options"]').click();
 assert.equal(await page.locator('#radial-count').isDisabled(),true,'re-editing locks the existing member count instead of copying the whole group');
 assert.equal(await page.locator('#radial-count').inputValue(),'4');assert.match(await page.locator('#radial-preview-status').innerText(),/4 个原成员/);
 await setRange('radial-radius',220);await page.screenshot({path:'ect/tutorial-radial-reedit.png'});await page.locator('[data-action="radial-dialog-apply"]').click();
 const updated=await page.evaluate(()=>{const slide=window.slideStudio.getProject().slides.find(slide=>slide.title==='环形文字排版练习'),group=slide.modules.find(module=>module.type==='group');return {groups:slide.modules.filter(module=>module.type==='group').length,count:group?.items?.length||0,id:group?.id,titles:group?.items?.map(item=>item.parts?.[0]?.title),nested:group?.items?.some(item=>item.type==='group'),radius:group?.radialOptions?.radius};});
 assert.deepEqual(updated,{...state,radius:220},'second radial edit updates the same group and preserves its original members');assert.deepEqual(errors,[]);
 console.log('PASS radial sliders create and re-edit one group without cloning or nesting the group');
}finally{await browser.close();}
