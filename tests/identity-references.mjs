import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {createProject} from '../src/model.js';
import {profilePage} from '../src/editable-layouts.js';
import {writeDocument} from '../scripts/build-document.mjs';

const source=await fs.readFile('北京科技大学_WebSlide科研汇报示例.html','utf8');
const master=JSON.parse(source.match(/<script id="project-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const p=createProject({withSections:false}),custom=profilePage();
custom.legacy_3='示例作者';custom.legacy_4='研究人员／工程师';custom.legacy_5='研究院／研究中心\n团队／联合实验室';custom.legacy_6='邮箱：contact@example.org';
p.slides=[profilePage(),structuredClone(master.slides.find(s=>s.referenceLayout==='references')),custom];
await fs.mkdir('ect',{recursive:true});await fs.writeFile('ect/identity-references.json',JSON.stringify(p));
const response=await fetch('http://127.0.0.1:4317/api/export/pptx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
assert.equal(response.status,200,response.status===200?'':await response.text());
await fs.writeFile('ect/identity-references.pptx',Buffer.from(await response.arrayBuffer()));
execFileSync('python',['-X','utf8','tests/inspect-identity-references.py','ect/identity-references.pptx','ect/identity-references.json'],{stdio:'inherit'});
await writeDocument(p,'ect/identity-references.html');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1200}});
 await page.goto(pathToFileURL(path.resolve('ect/identity-references.html')).href);await page.waitForFunction(()=>window.slideStudio);
 for(const index of [0,2]){
  await page.locator(`[data-page="${index}"]`).click();
  const unit=page.locator('#canvas .profile-unit');
  assert.equal(await unit.innerText(),p.slides[index].legacy_5);
  assert.equal(await unit.evaluate(el=>getComputedStyle(el).whiteSpace),'pre');
  assert.deepEqual(await page.evaluate(()=>window.slideStudio.check()),[]);
 }
 await page.locator('#canvas .profile-unit').evaluate(el=>el.textContent='研究机构'.repeat(20));
 assert.ok((await page.evaluate(()=>window.slideStudio.check())).some(e=>e.includes('身份信息不允许自动换行')));
 console.log('PASS original and replacement identity fields preserve manual breaks; overwide replacement is reported');
}finally{await browser.close();}
