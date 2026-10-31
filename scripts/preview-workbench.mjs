import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'templates/template-1/ustb-blue/template.html'),out=path.join(root,'docs/images');
const digest=async()=>createHash('sha256').update(await fs.readFile(file)).digest('hex'),before=await digest();
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 await fs.mkdir(out,{recursive:true});const records=[];
 const page=await browser.newPage({viewport:{width:1920,height:1200},deviceScaleFactor:1});
 const ui=action=>page.locator(`[data-action="${action}"]`).first();
 async function open(title){
  await page.goto(pathToFileURL(file).href);await page.waitForFunction(()=>window.slideStudio);await page.evaluate(()=>document.fonts.ready);
  await page.locator('#view-mode').selectOption('single');
  const index=await page.evaluate(t=>window.slideStudio.getProject().slides.findIndex(s=>s.title===t),title);assert.ok(index>=0,'Page title missing: '+title);
  await page.locator(`[data-page="${index}"]`).click();
  await page.evaluate(async()=>Promise.all([...document.querySelectorAll('#canvas img')].map(im=>im.decode().catch(()=>{}))));
  return index;
 }
 async function mode(value){if(await page.evaluate(()=>window.slideStudio.getMode())===value)return;if(value==='preview'){const active=await page.evaluate(()=>window.slideStudio.getMode());await ui(active==='edit'?'mode-edit':'mode-text').click();}else await ui(value==='edit'?'mode-edit':'mode-text').click();assert.equal(await page.evaluate(()=>window.slideStudio.getMode()),value);}
 async function shot(name,description,{target,clip,maxHeight,demo=false}={}){
  await page.waitForTimeout(120);if(target){clip=await page.locator(target).boundingBox();assert.ok(clip,'Screenshot target missing: '+target);if(maxHeight)clip.height=Math.min(clip.height,maxHeight);}
  await page.screenshot({path:path.join(out,name+'.png'),...(clip?{clip}:{})});records.push({image:'images/'+name+'.png',description,capture:clip?{kind:'detail',...(target?{target}:{}),clip}:{kind:'workbench'},...(demo?{temporaryDemoInput:true}:{}),...await page.evaluate(()=>({view:window.slideStudio.getView(),mode:window.slideStudio.getMode(),currentPage:Number(document.querySelector('#sidebar-page-count')?.textContent.match(/^\d+/)?.[0])||null}))});console.log('Captured '+name);
 }
 async function presenterShot(name,description,audience,{demo=false}={}){
  await page.setViewportSize({width:1360,height:860});await audience.setViewportSize({width:960,height:640});await page.waitForTimeout(180);
  const speaker=await page.screenshot({type:'png'}),viewer=await audience.screenshot({type:'png'}),composite=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  const speakerSrc='data:image/png;base64,'+speaker.toString('base64'),viewerSrc='data:image/png;base64,'+viewer.toString('base64');
  await composite.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:38px 42px;background:linear-gradient(135deg,#edf4f8,#f8fbfd);color:#15384d;font-family:"Microsoft YaHei","PingFang SC",sans-serif}header{display:flex;align-items:end;justify-content:space-between;margin-bottom:24px}h1{margin:0;color:#005894;font-size:38px}header p{margin:0;color:#5d7687;font-size:18px}.stage{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(0,.86fr);gap:24px;align-items:start}.panel{overflow:hidden;background:#fff;border:1px solid #cbdde8;border-radius:16px;box-shadow:0 18px 50px #173c5320}.panel-head{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;background:#005894;color:#fff}.panel-head strong{font-size:21px}.panel-head span{font-size:14px;color:#dff2ff}.panel img{display:block;width:100%;height:auto;background:#eef3f6}.note{margin-top:20px;padding:17px 20px;border-left:5px solid #005894;border-radius:7px;background:#fff;font-size:17px;line-height:1.7}.note b{color:#005894}</style></head><body><header><div><h1>演讲者视图：双窗口同步放映</h1><p>演讲者保留工作台与备注，观众窗口只显示当前幻灯片。</p></div><p>页面和备注随翻页同步更新</p></header><main class="stage"><section class="panel"><div class="panel-head"><strong>演讲者端</strong><span>编辑工作台 · 本页备注</span></div><img src="${speakerSrc}" alt="演讲者端工作台"></section><section class="panel"><div class="panel-head"><strong>观众端</strong><span>独立窗口 · 不显示备注</span></div><img src="${viewerSrc}" alt="观众端放映画面"></section></main><aside class="note"><b>推荐用于拓展屏：</b>将右侧观众窗口拖到投影屏并进入全屏；左侧工作台继续查看备注、切页和掌握讲解节奏。</aside></body></html>`);
  await composite.screenshot({path:path.join(out,name+'.png')});await composite.close();
  records.push({image:'images/'+name+'.png',description,capture:{kind:'presenter-composite',speakerViewport:{width:1360,height:860},audienceViewport:{width:960,height:640}},...(demo?{temporaryDemoInput:true}:{}),...await page.evaluate(()=>({view:window.slideStudio.getView(),mode:window.slideStudio.getMode(),currentPage:Number(document.querySelector('#sidebar-page-count')?.textContent.match(/^\d+/)?.[0])||null}))});console.log('Captured '+name);
  await audience.close();await page.setViewportSize({width:1920,height:1200});
 }

 await open('AI 生成结构，人工完成精修');await mode('preview');await page.locator('#view-mode').selectOption('grid');await page.locator('#view-columns').selectOption('3');await page.evaluate(()=>document.querySelector('.workspace').scrollTo({top:0,behavior:'instant'}));
 await shot('workbench-overview','多页工作台：顶部文件与编辑控件、左侧导航、中央多页视图和右侧当前页设置。');
 const first=await ui('new').boundingBox(),last=await ui('export-pptx').boundingBox(),header=await page.locator('.topbar').boundingBox();
 await shot('document-controls','当前文档管理入口：新建HTML、文档大纲、主题、打开、另存为、保存及导出。',{clip:{x:first.x-6,y:header.y,width:last.x+last.width-first.x+12,height:header.height}});

 await open('AI 生成结构，人工完成精修');await mode('text');
 await ui('outline').click();assert.equal(await page.locator('#outline-appendix').isChecked(),true);await shot('outline-manager','文档大纲：从当前页面载入标题及章节，支持现写／粘贴／文件、对应页映射、当前稿／另建及最后一章为附录。',{target:'#outline-dialog'});await page.locator('#outline-dialog button[value="cancel"]').last().click();
 await page.locator('#canvas .paragraph').first().evaluate(el=>{el.focus();const text=document.createTreeWalker(el,NodeFilter.SHOW_TEXT).nextNode(),range=document.createRange();range.setStart(text,0);range.setEnd(text,Math.min(text.length,8));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);});
 assert.equal(await page.locator('#text-formatbar').isVisible(),true);await shot('text-controls','文字模式：选区、14/16pt、段落列表、加粗、颜色、行距和段后距控件。');
 assert.equal(await page.locator('[name="paragraph-align"]').count(),4);await shot('paragraph-alignment','右侧段落对齐：L左对齐、E居中、R右对齐、J两端对齐；选项读取当前段落。',{target:'#inspector [data-text-alignment]'});

 await open('主图与关键信息');await mode('edit');await page.locator('#canvas .text-module').click();assert.equal(await page.locator('#adjust-multiplier').count(),1);
 await page.locator('#resize-anchor').selectOption('center');
 await shot('module-controls','模块模式：固定中心或四角、网格步进、尺寸和位置，以及文本样式与子区域。');

 await open('作者简介');await mode('edit');await page.locator('#canvas .profile-details').click();
 await shot('profile-modules','作者简介：固定身份卡、履历横线表和含两个可增减分组的无框线表格。');
 await page.locator('[data-action="paste-table"]').click();assert.ok((await page.locator('#table-data').inputValue()).length>10);await shot('table-bulk-edit','表格批量编辑：当前作者页分组的内容预填，可直接改值或从Excel粘贴；确认前不修改原表。',{target:'#table-dialog'});
 await page.locator('#table-data').fill('名称\t\t\t数值\n方法一\t\t\t12.34\n方法二\t\t\t56.78');assert.equal(await page.locator('.table-tab').count(),9);
 await shot('table-tab-markers','临时演示输入：每行三个Tab以#ACA808显示，细白缝分隔，相邻内容之间保留两个空单元格。未应用到原表。',{target:'.table-text-editor',maxHeight:106,demo:true});await page.locator('#table-dialog button[value="cancel"]').last().click();
 await open('阶段总结与后续计划');await mode('edit');await page.locator('#canvas .summary-cards').click();
 await shot('summary-modules','阶段计划：三个A2子区域，右侧独立计划表及C1讨论区；按名称用箭头排序及删除。');

 await open('研究现状分析');await mode('edit');await page.locator('#canvas .timeline-module').click();
 await shot('timeline-controls','第8页原生时间轴：年份、共底图文、箭头和连线；右侧可添加、删除或重排阶段。');

 await page.locator('[data-page="6"]').click();await page.locator('[data-page="7"]').click({modifiers:['Shift']});
 await page.locator('#canvas .timeline-module').click();
 assert.equal(await page.locator('.slide-thumb.is-selected').count(),2);
 assert.ok(await ui('copy-pages').isVisible());await shot('page-controls','左侧多选页面，底部固定复制、粘贴、上移、下移和删除；缩略图列表独立滚动。');

 await open('主图与关键信息');await mode('text');await page.locator('#canvas .slide-lead').focus();assert.equal(await page.locator('#free-text-x').isVisible(),true);
 await page.locator('[data-free-text-move="down"]').click();assert.equal(await page.locator('#free-text-reset').isVisible(),true);
 await shot('free-text-controls','文字光标定位正文块：右侧坐标、1px／5px／网格步进、平移箭头及恢复原位。');
 await open('目标函数与参数更新');await mode('preview');await page.locator('#canvas [data-formula-part]').first().dblclick();assert.equal(await page.locator('#formula-dialog').isVisible(),true);
 await shot('formula-editor','公式编辑框：LaTeX源码、复制按钮、数学预览、取消和确定。',{target:'#formula-dialog'});await page.locator('#formula-dialog button[value="cancel"]').last().click();

 await open('目标函数与参数更新');await mode('preview');await ui('export-pdf').click();await shot('local-export-connection','从离线文稿传送当前编辑内容到本机服务，无需拖动文件。',{target:'#local-export-dialog'});await page.locator('#local-export-dialog button[value="cancel"]').last().click();
 await open('逐页备注：给演讲者留一份讲解线索');await mode('preview');await ui('page-settings').click();await page.locator('#page-notes').scrollIntoViewIfNeeded();assert.equal(await page.locator('#page-notes').isVisible(),true);
 await shot('page-settings-notes','当前页设置弹窗：页尾总结、脚注、本页备注和来源；备注保存后由页面备注面板自动载入。',{target:'#page-dialog'});await page.locator('#page-dialog button[value="cancel"]').last().click();

 await open('逐页备注：给演讲者留一份讲解线索');await mode('preview');const popup=page.waitForEvent('popup');await ui('presenter').click();const audience=await popup;await audience.locator('#canvas').waitFor();await page.locator('#notes-panel').waitFor();
 let presenterDemo=false;if(!(await page.locator('#speaker-notes').inputValue()).trim()){presenterDemo=true;await page.locator('#speaker-notes').fill('先交代本页结论，再提醒听众关注右侧图表；翻页前用一句话完成过渡。');}
 await presenterShot('presentation-presenter','演讲者视图：原工作台保留当前页备注并同步切页，独立观众窗口只显示幻灯片，可拖到拓展屏后进入全屏。',audience,{demo:presenterDemo});

 await open('主图与关键信息');await mode('preview');await ui('present').click();await page.waitForFunction(()=>window.slideStudio.getView().present);assert.equal(await page.locator('.topbar').isVisible(),false);
 await shot('presentation-fullscreen','全屏放映的实际画面与底部操作提示。');await page.locator('#canvas').dblclick();await page.waitForFunction(()=>window.slideStudio.getView().overview);
 await page.evaluate(()=>document.querySelector('.workspace').scrollTo({top:0,behavior:'instant'}));
 assert.equal(await page.locator('.presentation-overview .view-page').count(),30);await shot('presentation-overview','放映中双击进入每行4页的总览，滚动查找并双击目标页继续放映。');await page.keyboard.press('Escape');
 assert.equal(await digest(),before,'Screenshots must not modify the source HTML');
 await fs.writeFile(path.join(root,'docs/工作台截图记录.json'),JSON.stringify({source:path.relative(root,file).replaceAll('\\','/'),sha256:before,viewport:page.viewportSize(),screenshots:records},null,2)+'\n');
}finally{await browser.close();}
