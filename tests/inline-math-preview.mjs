import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createProject,blankSlide,moduleOf} from '../src/model.js';

const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1720,height:1080}});
 await page.goto('http://127.0.0.1:4317');
 await page.waitForFunction(()=>window.slideStudio);
 const project=createProject({withSections:false}),slide=blankSlide(),module=moduleOf('text',{x:58,y:256,w:1484,h:360});
 module.parts[0].title='行内公式说明';
 module.parts[0].text='以目标函数 $J_{\\theta}$ 为例，说明参数更新与收敛条件。\n错误示例 $\\badcommand{x}$ 应保留源码并给出提示。';
 slide.modules=[module];project.slides=[slide];
 await page.locator('#html-file').setInputFiles({name:'inline-math.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(project)+'</script>')});
 await page.locator('#view-mode').selectOption('single');
 const toggle=page.locator('#document-markdown-preview'),paragraph=page.locator('#canvas .paragraph');
 assert.equal(await toggle.isChecked(),false);
 assert.match(await paragraph.innerText(),/\$J_\{\\theta\}\$/);
 assert.equal(await page.locator('#canvas .inline-math').count(),0);
 await page.locator('[data-action="export-pptx"]').click();
 assert.equal(await page.locator('#pptx-export-dialog[open]').count(),1,'源码模式也必须识别行内公式并显示导出方式');
 await page.locator('#pptx-export-dialog').getByRole('button',{name:'取消',exact:true}).click();

 await toggle.check();
 assert.equal((await page.evaluate(()=>window.slideStudio.getProject())).inlineMathMode,'render');
 assert.equal(await page.locator('#canvas .inline-math').count(),1);
 assert.equal(await page.locator('#canvas .inline-math-error').count(),1);
 assert.doesNotMatch(await paragraph.innerText(),/\$J_\{\\theta\}\$/);
 const inlineMetrics=await page.locator('#canvas .inline-math').evaluate(node=>{const style=getComputedStyle(node);return {height:parseFloat(style.height),fontSize:parseFloat(style.fontSize),lineHeight:parseFloat(style.lineHeight)};});
 assert.ok(inlineMetrics.height<=inlineMetrics.fontSize*1.05,'inline math must not enlarge the paragraph line box');
 assert.ok(inlineMetrics.lineHeight<=inlineMetrics.fontSize*1.05,'inline math keeps a compact internal line height');
 await page.screenshot({path:'ect/inline-math-compact.png'});

 await toggle.uncheck();
 assert.equal((await page.evaluate(()=>window.slideStudio.getProject())).inlineMathMode,'source');
 assert.equal(await page.locator('#canvas .inline-math').count(),0);
 assert.match(await paragraph.innerText(),/\$J_\{\\theta\}\$/);

 await toggle.check();
 await page.locator('[data-action="mode-text"]').click();
 assert.equal(await page.evaluate(()=>window.slideStudio.getMode()),'text');
 assert.match(await paragraph.innerText(),/\$J_\{\\theta\}\$/,'文字编辑时应显示可修改源码');
 assert.equal((await page.evaluate(()=>window.slideStudio.getProject())).inlineMathMode,'render','退出编辑后仍沿用文档级预览模式');

 const legacy=createProject({withSections:false});delete legacy.inlineMathMode;legacy.slides[1].modules[0].parts[0].markdownMath=true;
 await page.locator('#html-file').setInputFiles({name:'legacy-inline-math.html',mimeType:'text/html',buffer:Buffer.from('<script id="project-data" type="application/json">'+JSON.stringify(legacy)+'</script>')});
 assert.equal((await page.evaluate(()=>window.slideStudio.getProject())).inlineMathMode,'render');
 assert.equal(await toggle.isChecked(),true);
 console.log('PASS document-wide Markdown/inline-math source toggle, rendering, error fallback and edit-source view');
}finally{await browser.close();}
