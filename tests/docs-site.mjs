import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

async function markdownFiles(dir){const found=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){if(['node_modules','ect','.git'].includes(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory())found.push(...await markdownFiles(file));else if(entry.name.endsWith('.md'))found.push(file);}return found;}

const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1500,height:1000}});await page.goto(pathToFileURL(path.resolve('docs/site/index.html')).href);assert.equal(await page.locator('.text-links a').count(),6);assert.ok(await page.getByRole('link',{name:/交互式练习/}).count());assert.equal(await page.locator('.portal img').count(),0);const destinations=await page.locator('.text-links a').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));assert.equal(new Set(destinations).size,destinations.length,'task portal links each point to a distinct document');const cardHeights=await page.locator('.text-links a').evaluateAll(nodes=>nodes.map(node=>Math.round(node.getBoundingClientRect().height)));assert.equal(new Set(cardHeights).size,1,'task portal cards share one aligned height');await fs.mkdir('ect',{recursive:true});await page.screenshot({path:'ect/docs-site.png',fullPage:true});
 await page.goto(pathToFileURL(path.resolve('docs/site/README.html')).href);assert.ok(await page.locator('article h1').count());assert.ok(await page.locator('article img').count()>5);assert.equal(await page.locator('article img[src$="presentation-presenter.png"]').count(),1,'README shows the presenter and audience window example');assert.ok(await page.locator('article table').count()>2);assert.equal(await page.locator('a[href$=".md"]').count(),0);
 const bad=[];for(const file of await markdownFiles(path.resolve('.'))){const text=await fs.readFile(file,'utf8');if(/\[[^\]]+\]\([^)]*\.html(?:[#?][^)]*)?\)/i.test(text))bad.push(path.relative('.',file));}assert.deepEqual(bad,[],'Markdown must describe local HTML paths as code, not link to source files');console.log('PASS offline documentation portal, rendered Markdown, images and tables; no Markdown links to HTML source');
}finally{await browser.close();}
