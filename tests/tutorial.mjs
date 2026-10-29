import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1720,height:1080}});
 await page.goto(pathToFileURL(path.resolve('文本块样式展示.html')).href);
 assert.equal(await page.locator('a[href*="tutorial=1"]').count(),1,'launcher offers one main-template tutorial');
 await page.locator('a[href*="ustb-blue"]').click();
 await page.waitForFunction(()=>window.slideStudio);
 await page.locator('.tutorial-guide').waitFor();
 assert.match(await page.locator('.tutorial-guide').innerText(),/欢迎进入交互训练场/);
 await page.getByRole('button',{name:'我已阅读，继续'}).click();
 await page.locator('[data-action="theme"].tutorial-target').waitFor();
 await page.locator('[data-action="theme"]').click();
 for(const id of ['theme-secondary','theme-accent','theme-emphasis']){await page.locator(`#${id}.tutorial-target`).waitFor();await page.locator('#'+id).fill('');await page.locator('#'+id).press('Tab');}
 await page.locator('#theme-primary.tutorial-target').waitFor();
 await page.locator('#theme-primary').fill('#A31418');await page.locator('#theme-primary').press('Tab');
 await page.locator('#theme-tint.tutorial-target').waitFor();
 await page.locator('#theme-tint').fill('#FCF1EE');await page.locator('#theme-tint').press('Tab');
 await page.locator('#theme-ink.tutorial-target').waitFor();
 await page.locator('#theme-ink').fill('#000000');await page.locator('#theme-ink').press('Tab');
 if(await page.getByRole('button',{name:'完成填写，继续'}).isVisible())await page.getByRole('button',{name:'完成填写，继续'}).click();
 await page.locator('#theme-logo.tutorial-target').setInputFiles('templates/template-1/ustb-blue/assets/red-logo-solo.svg');
 await page.locator('#theme-wordmark.tutorial-target').setInputFiles('templates/template-1/ustb-blue/assets/logo-full-steel-red.svg');
 assert.equal(await page.locator('#theme-primary').inputValue(),'#A31418');
 await page.locator('[data-action="theme-dialog-apply"].tutorial-target').click();
 await page.waitForFunction(()=>window.slideStudio.getProject().theme.primary==='#A31418');
 const redTheme=await page.evaluate(()=>window.slideStudio.getProject().theme);assert.equal(redTheme.primary,'#A31418');assert.match(redTheme.logo,/^data:image\/svg\+xml;base64,/);assert.match(redTheme.wordmark,/^data:image\/svg\+xml;base64,/);
 await page.locator('[data-action="outline"].tutorial-target').waitFor();await page.locator('[data-action="outline"]').click();
 await page.locator('#outline-text.tutorial-target').waitFor();
 assert.match(await page.locator('.tutorial-copy-text').innerText(),/# 智能 Slide 入门练习/);
 await page.screenshot({path:'ect/tutorial-onboarding.png'});
 console.log('PASS interactive onboarding launcher and real-control guidance');
}finally{await browser.close();}
