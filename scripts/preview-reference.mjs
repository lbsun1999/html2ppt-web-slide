import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const examples=[
 {name:'example-project',columns:2,width:1920,focus:1,inspect:true},
 {name:'media-layout',columns:1,width:1720,focus:0,inspect:true},
 {name:'navigation',columns:3,width:1920,focus:1},
 {name:'notes-presenter',columns:5,width:2400,focus:21,notes:true},
 {name:'text-styles-example',columns:3,width:1920,focus:4,inspect:true}
];
const manifest=path.join(root,'reference/snapshots.json');
const expected=JSON.parse(await fs.readFile(manifest,'utf8'));
// Verify all approved HTML files before replacing derived previews.
for(const {name} of examples){const file=name+'.html',bytes=await fs.readFile(path.join(root,'reference',file)),record=expected.find(r=>r.file===file);assert.ok(record,'Missing reviewed hash: '+file);assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256,'Reviewed snapshot changed: '+file);}
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 await fs.mkdir(path.join(root,'reference/images'),{recursive:true});const records=[];
 for(const item of examples){
  const {name,columns,width,focus}=item,page=await browser.newPage({viewport:{width,height:1200},deviceScaleFactor:1});
  try{
   await page.goto(pathToFileURL(path.join(root,'reference',name+'.html')).href);await page.waitForFunction(()=>window.slideStudio);
   await page.evaluate(()=>document.fonts.ready);const count=await page.evaluate(()=>window.slideStudio.getProject().slides.length);
   await page.locator('#view-mode').selectOption('grid');await page.locator('#view-columns').selectOption(String(columns));
   await page.locator(`[data-page="${focus}"]`).click();
   if(item.inspect){if(await page.evaluate(()=>window.slideStudio.getMode())!=='edit')await page.locator('[data-action="mode-edit"]').first().click();await page.locator('#canvas .module').first().click();}
   else if(await page.evaluate(()=>window.slideStudio.getMode())!=='preview')await page.locator('[data-action="mode-text"]').first().click();
   if(item.notes&&!await page.locator('#notes-panel').isVisible())await page.locator('[data-action="notes"]').first().click();
   await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.pages-surface img')].map(im=>im.decode().catch(()=>{})));for(const video of document.querySelectorAll('video')){video.pause();if(video.readyState>=2&&Number.isFinite(video.duration))video.currentTime=Math.min(.1,video.duration/2);}});
   // Grow the real viewport until the entire page grid fits inside the workbench.
   for(let attempt=0;attempt<3;attempt++){
    await page.evaluate(()=>document.querySelector('.workspace').scrollTo({top:0,behavior:'instant'}));
    const needed=await page.evaluate(()=>{const w=document.querySelector('.workspace');return Math.ceil(document.querySelector('.shell').getBoundingClientRect().top+w.scrollHeight+12);});
    if(needed<=page.viewportSize().height)break;
    await page.setViewportSize({width,height:needed});
   }
   await page.evaluate(()=>{document.querySelector('.workspace').scrollTo({top:0,behavior:'instant'});window.scrollTo(0,0);});await page.waitForTimeout(150);
   const state=await page.evaluate(()=>({view:document.querySelector('#view-mode').value,columns:Number(document.querySelector('#view-columns').value),pages:window.slideStudio.getProject().slides.length,visible:[...document.querySelectorAll('.view-page')].filter(n=>{const r=n.getBoundingClientRect(),w=document.querySelector('.workspace').getBoundingClientRect();return r.top>=w.top-1&&r.bottom<=w.bottom+1;}).length,notesVisible:!!document.querySelector('#notes-panel')&&!document.querySelector('#notes-panel').hidden}));
   assert.equal(state.view,'grid');assert.equal(state.columns,columns);assert.equal(state.visible,count,'All pages must appear: '+name);if(item.notes)assert.equal(state.notesVisible,true);
   const viewport=page.viewportSize();await page.screenshot({path:path.join(root,'reference/images',name+'.png'),fullPage:true});
   records.push({...expected.find(r=>r.file===name+'.html'),view:'grid',columns,pages:count,focusPage:focus+1,notesVisible:state.notesVisible,viewport});
   console.log(`${name}: ${count} pages, ${columns} columns, full workbench ${viewport.width}x${viewport.height}`);
  }finally{await page.close();}
 }
 await fs.writeFile(manifest,JSON.stringify(records,null,2)+'\n');
}finally{await browser.close();}
