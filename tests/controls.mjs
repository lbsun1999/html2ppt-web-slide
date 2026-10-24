import {createProject} from '../src/model.js';
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1720,height:1080}});
await fs.mkdir('ect',{recursive:true});
try{
 await page.addInitScript(()=>{window.showSaveFilePicker=undefined;});await page.goto('http://127.0.0.1:4317');await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');await page.locator('#html-file').setInputFiles({name:'controls.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(createProject({withSections:false}))+'</script>')});await page.waitForTimeout(150);
 await page.locator('[data-page="1"]').click();
 await page.screenshot({path:'ect/controls-preview.png'});
 await page.locator('[data-action="mode-edit"]').first().click();await page.locator('#canvas .text-module').click();
 await page.locator('#bullet-custom').fill('✓');await page.locator('#bullet-custom').press('Tab');
 assert.equal((await page.evaluate(()=>window.slideStudio.getProject())).slides[1].modules[0].parts[0].marker,'✓');
 const glyph=await page.locator('#canvas .paragraph.bulleted>div').first().evaluate(e=>getComputedStyle(e,'::before').content);assert.ok(glyph.includes('✓'));
 await page.locator('[data-action="undo"]').click();assert.equal((await page.evaluate(()=>window.slideStudio.getProject())).slides[1].modules[0].parts[0].bullet,false);
 await page.locator('[data-action="redo"]').click();assert.equal((await page.evaluate(()=>window.slideStudio.getProject())).slides[1].modules[0].parts[0].marker,'✓');
 console.log('PASS custom markers and project undo/redo');
 await page.locator('[data-action="present"]').click();await page.waitForTimeout(100);assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('presenting')),true);await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#page-label').innerText().then(t=>t.startsWith('03')),true);await page.keyboard.press('Escape');assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('presenting')),false);
 console.log('PASS fullscreen navigation and exit');
}finally{await browser.close();}
