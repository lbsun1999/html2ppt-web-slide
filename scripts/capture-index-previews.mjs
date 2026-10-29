import {chromium} from 'playwright';
import {pathToFileURL,fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const targets=[['ustb-blue','index-ustb-blue.png'],['ustb-red','index-ustb-red.png'],['lishui-cyan','index-lishui-cyan.png']];
await fs.mkdir(path.join(root,'docs/images'),{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 for(const [folder,file] of targets){
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  await page.goto(pathToFileURL(path.join(root,'templates/template-1',folder,'template.html')).href);await page.waitForFunction(()=>window.slideStudio);await page.locator('#view-mode').selectOption('single');await page.locator('[data-page="0"]').click();if(await page.evaluate(()=>window.slideStudio.getMode())!=='preview')await page.locator('[data-action="mode-text"]').click();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);await page.screenshot({path:path.join(root,'docs/images',file)});await page.close();console.log(file);
 }
}finally{await browser.close();}
