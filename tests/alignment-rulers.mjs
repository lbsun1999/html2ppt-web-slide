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
 await page.goto(pathToFileURL(path.resolve('templates/template-1/ustb-blue/tutorial.html')).href);
 await page.waitForFunction(()=>window.slideStudio);
 await page.locator('.slide-thumb').filter({hasText:'高级对齐练习'}).click();
 await page.locator('[data-action="mode-edit"]').click();
 await page.locator('#canvas .module').filter({hasText:'板块 A'}).click();
 await page.locator('[data-action="advanced-align"]').click();
 await page.locator('[data-align-mode="v-move"]').click();
 await page.locator('#alignment-ruler').check();
 const x=page.locator('.alignment-ruler.x-axis');await x.waitFor();
 assert.deepEqual(await x.locator('span').allTextContents(),['0','400','800','1200','1600']);
 assert.equal(await page.locator('.alignment-ruler.y-axis').count(),0);
 await page.locator('[data-align-mode="h-move"]').click();
 const y=page.locator('.alignment-ruler.y-axis');await y.waitFor();
 assert.deepEqual(await y.locator('span').allTextContents(),['0','225','450','675','900']);
 assert.equal(await page.locator('.alignment-ruler.x-axis').count(),0);
 await y.evaluate(node=>node.classList.add('tutorial-target'));
 const geometry=await y.evaluate(node=>{const box=node.getBoundingClientRect(),slide=node.closest('.slide').getBoundingClientRect();return {position:getComputedStyle(node).position,heightRatio:box.height/slide.height};});
 assert.equal(geometry.position,'absolute','tutorial highlighting must not replace ruler absolute positioning');
 assert.ok(geometry.heightRatio>.95,'highlighted Y ruler still spans the full slide height');
 await page.screenshot({path:'ect/tutorial-alignment-y-ruler.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS alignment ruler switches between top X axis and left Y axis');
}finally{await browser.close();}
