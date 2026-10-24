import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1720,height:1080}});page.on('pageerror',e=>console.log('JS ERROR',e.message));
try{
 const school=process.argv.includes('--lishui')?'lishui':'ustb';const folder='ect/'+school+'-pages';
 await page.goto(pathToFileURL(path.resolve(school==='ustb'?'北京科技大学_WebSlide科研汇报示例.html':'丽水学院_WebSlide制作与演示指南.html')).href);await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');await page.evaluate(()=>document.fonts.ready);
 const model=await page.evaluate(()=>window.slideStudio.getProject());console.log('Pages:',model.slides.length);const errors=[];
 await fs.mkdir(folder,{recursive:true});
 for(let i=0;i<model.slides.length;i++){
  await page.locator(`[data-page="${i}"]`).click();await page.waitForTimeout(30);
  const messages=await page.evaluate(()=>window.slideStudio.check());
  if(messages.length){errors.push({page:i+1,title:model.slides[i].title,messages});console.log('FAIL',i+1,model.slides[i].title,messages);console.log(await page.locator('#canvas .module.overflowing').evaluateAll(ms=>ms.map(m=>({id:m.dataset.module,h:m.clientHeight,parts:[...m.querySelectorAll('.text-part')].map(p=>({h:p.clientHeight,scroll:p.scrollHeight,text:p.innerText}))}))));}
  if(process.argv.includes('--screenshots'))await page.locator('#canvas').screenshot({path:`${folder}/${String(i+1).padStart(2,'0')}.png`});
 }
 await fs.writeFile('ect/'+school+'-audit.json',JSON.stringify(errors,null,2));console.log('Layout errors:',errors.length);if(errors.length)process.exitCode=1;
}finally{await browser.close();}
