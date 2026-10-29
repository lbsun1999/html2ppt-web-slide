import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1500,height:1000}});await page.goto(pathToFileURL(path.resolve('docs/site/index.html')).href);assert.equal(await page.locator('.text-links a').count(),6);assert.equal(await page.locator('.portal img').count(),0);await fs.mkdir('ect',{recursive:true});await page.screenshot({path:'ect/docs-site.png',fullPage:true});
 await page.goto(pathToFileURL(path.resolve('docs/site/README.html')).href);assert.ok(await page.locator('article h1').count());assert.ok(await page.locator('article img').count()>5);assert.ok(await page.locator('article table').count()>2);assert.equal(await page.locator('a[href$=".md"]').count(),0);console.log('PASS offline documentation portal, rendered Markdown, images and tables');
}finally{await browser.close();}
