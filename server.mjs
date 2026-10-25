import {schoolOptions} from './src/server/schools.mjs';
import {sharedCSS} from './src/server/shared-css.mjs';
import {createExample} from './src/example.js';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {build} from 'esbuild';
import ExcelJS from 'exceljs';
import {chromium} from 'playwright';
import pptxgen from 'pptxgenjs';
import {validateProject,slideBounds,occupiedItems} from './src/model.js';
import {inside,intersects} from './src/layout.js';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||4317),HOST='127.0.0.1';
const bundle=await build({absWorkingDir:ROOT,entryPoints:['src/app.js'],bundle:true,write:false,format:'iife',target:'chrome110',charset:'utf8'});
const code=bundle.outputFiles[0].text;
const sessions=new Map();let browserPromise,exportQueue=Promise.resolve();
async function browser(){if(!browserPromise)browserPromise=(async()=>{
 const candidates=[process.env.CHROME_PATH,...['PROGRAMFILES','PROGRAMFILES(X86)','LOCALAPPDATA'].flatMap(k=>process.env[k]?[path.join(process.env[k],'Google/Chrome/Application/chrome.exe'),path.join(process.env[k],'Microsoft/Edge/Application/msedge.exe')]:[]),...(process.platform==='darwin'?['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']:['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'])].filter(Boolean);
 for(const candidate of candidates){try{await fs.access(candidate);return await chromium.launch({executablePath:candidate,headless:true});}catch{}}
 try{return await chromium.launch({headless:true});}catch{browserPromise=null;throw Error('未找到 Chrome / Edge。请安装浏览器，或运行 npx playwright install chromium。');}
 })();return browserPromise;}
function json(res,body,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));}
async function body(req,max=100*1024*1024){const parts=[];let bytes=0;for await(const part of req){bytes+=part.length;if(bytes>max)throw Error('请求超过 100 MB，请减少媒体文件或拆分项目。');parts.push(part);}try{return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw Error('请求不是有效的 JSON。');}}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
async function excel(data){
 if(!/^data:.*;base64,/.test(data||''))throw Error('Excel 数据格式错误。');const bytes=Buffer.from(data.split(',')[1],'base64');if(bytes.length>10*1024*1024)throw Error('Excel 文件不能超过 10 MB。');
 const wb=new ExcelJS.Workbook();await wb.xlsx.load(bytes);
 const sheets=wb.worksheets.filter(s=>s.rowCount>0).map(sheet=>{
  if(sheet.rowCount>100||sheet.columnCount>30)throw Error(`工作表“${sheet.name}”超过 100 行或 30 列，请先拆分。`);
  const value=c=>{let v=c.value;if(v===null||v===undefined)return '';if(v instanceof Date)return v.toISOString().slice(0,10);if(typeof v==='object'){if(v.richText)return v.richText.map(t=>t.text).join('');if(v.text)return String(v.text);if(v.formula||v.sharedFormula)return String(v.result??'');if(v.error)return v.error;}return String(v);};
  const rows=Array.from({length:sheet.rowCount},(_,r)=>Array.from({length:sheet.columnCount},(_,c)=>value(sheet.getCell(r+1,c+1))));
  const merges=Object.values(sheet._merges||{}).map(range=>({top:range.top-1,left:range.left-1,bottom:range.bottom-1,right:range.right-1}));
  return {name:sheet.name,rows,merges};
 });if(!sheets.length)throw Error('文件中没有可导入的非空工作表。');return {sheets};
}
async function capture(page){return await page.evaluate(async()=>{
 const color=s=>{if(/^#[\da-f]{6}$/i.test(s.trim()))return s.trim().slice(1).toUpperCase();const a=s.match(/[\d.]+/g);return a&&(!a[3]||Number(a[3])>0)?a.slice(0,3).map(v=>Math.round(Number(v)).toString(16).padStart(2,'0')).join('').toUpperCase():null;};
 const richRuns=el=>{if(!el.querySelector('[data-rich-run],span[style],var,i,em,strong,b'))return null;const runs=[];const add=(text,node)=>{if(!text)return;const cs=getComputedStyle(node.nodeType===1?node:node.parentElement);runs.push({text,bold:Number(cs.fontWeight)>=600,italic:cs.fontStyle==='italic',fontSize:parseFloat(cs.fontSize)*.6,color:color(cs.color)});};const walk=node=>{if(node.nodeType===3){add(node.nodeValue.replace(/\u00a0/g,' '),node);return;}if(node.nodeType!==1)return;if(node.tagName==='BR'){add('\n',node);return;}const block=node!==el&&['DIV','P','LI'].includes(node.tagName);if(block&&runs.length&&!runs.at(-1).text.endsWith('\n'))add('\n',node);for(const c of node.childNodes)walk(c);if(block&&node.nextSibling&&!runs.at(-1)?.text.endsWith('\n'))add('\n',node);};for(const node of el.childNodes)walk(node);return runs;};
 return await Promise.all([...document.querySelectorAll('.slide')].map(async slide=>{
  const box=slide.getBoundingClientRect(),geometry=el=>{const r=el.getBoundingClientRect();return {x:r.x-box.x,y:r.y-box.y,w:r.width,h:r.height};};
  const paintOrder=new Map([...slide.querySelectorAll('*')].map((el,i)=>[el,i*2]));
  const shapes=[...slide.querySelectorAll('[data-shape]')].flatMap(el=>{
   const cs=getComputedStyle(el),g=geometry(el),cell=/^(TD|TH)$/.test(el.tagName),trim=el.classList.contains('top-trim')||el.classList.contains('cover-band');
   const edge=cell?'Bottom':'Top',lineWidth=parseFloat(cs['border'+edge+'Width'])||0;
   const s={...g,order:paintOrder.get(el),fill:color(cs.backgroundColor)||(cell?color(getComputedStyle(el.parentElement).backgroundColor)||'FFFFFF':null),line:lineWidth?color(cs['border'+edge+'Color']):null,lineWidth,arrow:el.classList.contains('graphic-shape')};
   if(cell){const sides=['Top','Bottom','Left','Right'].flatMap(side=>{const width=parseFloat(cs['border'+side+'Width'])||0,fill=color(cs['border'+side+'Color']);if(!width||!fill)return [];const horizontal=['Top','Bottom'].includes(side);return [{x:g.x+(side==='Right'?g.w-width:0),y:g.y+(side==='Bottom'?g.h-width:0),w:horizontal?g.w:width,h:horizontal?width:g.h,order:paintOrder.get(el)+.5,fill,line:null,lineWidth:0}];});return [{...s,line:null,lineWidth:0},...sides];}
   if(trim&&parseFloat(cs.borderRightWidth)>0){const w=parseFloat(cs.borderRightWidth);return [{...s,w:g.w-w},{x:g.x+g.w-w,y:g.y,w,h:g.h,order:paintOrder.get(el),fill:color(cs.borderRightColor),line:null,lineWidth:0}];}
   return [s];
  }).filter(s=>s.fill||s.line);
  const texts=[...slide.querySelectorAll('[data-text]')].flatMap(root=>{const lines=[...root.children].filter(n=>n.hasAttribute('data-paragraph'));return (lines.length?lines:[root]).map(el=>{
   const cs=getComputedStyle(el),g=geometry(el),chapter=!!el.closest('.section-line'),pageTitle=el.matches('.slide-header h2');
   const pL=parseFloat(cs.paddingLeft),pR=parseFloat(cs.paddingRight),pT=parseFloat(cs.paddingTop),pB=parseFloat(cs.paddingBottom);
   const transitionHeading=el.matches('.transition-content h1,.transition-number'),pageSummary=!!el.closest('.slide-summary');
   // A tight browser glyph box is not a reliable text width in PowerPoint.
   if(transitionHeading){const area=geometry(el.closest('.transition-content'));g.x=area.x;g.w=area.w;}
   if(pageSummary){const frame=el.closest('.slide-summary'),area=geometry(frame),style=getComputedStyle(frame),left=parseFloat(style.paddingLeft)||0,right=parseFloat(style.paddingRight)||0;g.x=area.x+left;g.w=area.w-left-right;}
   const singleLine=chapter||cs.whiteSpace==='nowrap'||pageSummary,noWrap=singleLine||transitionHeading||el.matches('.cover-band h1,.slide-header h2');let text=el.innerText;
   // CSS nowrap/ellipsis does not survive conversion to a native PowerPoint textbox.
   // Preserve a single line explicitly, with room for different font metrics in Office.
   if(singleLine){
    text=text.replace(/[\r\n]+/g,' ').trim();
    if(chapter&&!el.classList.contains('section-index')){
     const context=document.createElement('canvas').getContext('2d');context.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
     const available=Math.max(0,(g.w-pL-pR)*.96-6);if(context.measureText(text).width>available){const chars=Array.from(text);while(chars.length&&context.measureText(chars.join('')+'…').width>available)chars.pop();text=chars.join('')+'…';}
    }
   }
   const anchor=el.matches('a')?el:el.querySelector('a'),target=anchor?.hash?document.getElementById(anchor.hash.slice(1))?.closest('.slide'):null;
   return {...g,role:el.matches('.transition-number')?'transition-number':el.dataset.slideField||'',order:paintOrder.get(el)+1,x:g.x+(el.dataset.bullet==='true'?0:pL),y:g.y+pT,w:g.w-(el.dataset.bullet==='true'?0:pL)-pR,h:g.h-pT-pB,text,runs:singleLine&&!pageSummary?null:richRuns(el),singleLine,noWrap,fontFace:cs.fontFamily.split(',')[0].replace(/["']/g,''),paragraphGap:el.classList.contains('paragraph')&&el.children.length?6:0,bullet:el.matches('li')?'•':el.classList.contains('bulleted')?el.dataset.marker:null,color:pageTitle?color(cs.getPropertyValue('--primary')):color(cs.color),fontSize:parseFloat(cs.fontSize),fontWeight:Number(cs.fontWeight),lineHeight:parseFloat(cs.lineHeight)/parseFloat(cs.fontSize),align:cs.textAlign,link:anchor?.href||null,targetIndex:el.dataset.targetIndex!==undefined?Number(el.dataset.targetIndex):target?[...document.querySelectorAll('.slide')].indexOf(target):null};
  });}).filter(t=>t.text.trim()&&t.w>0&&t.h>0);
  // Isolate SVG artwork; element screenshots would also bake overlapping text into it.
  const decorations=await Promise.all([...slide.querySelectorAll('svg[data-decoration]')].map(async el=>{
   const g=geometry(el),cs=getComputedStyle(el),copy=el.cloneNode(true);copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.setAttribute('width',g.w);copy.setAttribute('height',g.h);copy.style.cssText=`width:${g.w}px;height:${g.h}px;overflow:visible;clip-path:${cs.clipPath};`;
   const markup=new XMLSerializer().serializeToString(copy).replace(/var\(--([a-z-]+)\)/g,(_,name)=>cs.getPropertyValue('--'+name).trim());
   const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(markup);await im.decode();const canvas=document.createElement('canvas');canvas.width=Math.ceil(g.w);canvas.height=Math.ceil(g.h);canvas.getContext('2d').drawImage(im,0,0,g.w,g.h);
   return {...g,order:paintOrder.get(el),data:canvas.toDataURL('image/png')};
  }));
  const media=[...slide.querySelectorAll('[data-image],.media-window.has-asset,[data-raster]')].map((el,i)=>{el.dataset.captureId=String(i);const video=el.querySelector('video');return {...geometry(el),order:paintOrder.get(el),id:i,video:video?{src:video.src,mime:video.src.slice(5,video.src.indexOf(';'))}:null};});
  return {shapes,texts,media,decorations};
 }));
});}
async function pptxExport(page,project){
 const deck=new pptxgen();deck.defineLayout({name:'RESEARCH',width:13.333333,height:7.5});deck.layout='RESEARCH';deck.author='Web Slide';deck.subject='本地模块化科研汇报';deck.title=project.title;deck.company=project.theme.name;deck.lang='zh-CN';deck.theme={headFontFace:'Microsoft YaHei',bodyFontFace:'Microsoft YaHei',lang:'zh-CN'};
 const pages=await capture(page),px=v=>v/120;
 const nativeText=t=>{if(!t.runs?.length)return t.bullet?t.text.split('\n').map(line=>t.bullet+'　'+line).join('\n'):t.text;let start=true;return t.runs.map(run=>{let text=run.text;if(t.bullet){text=text.split('\n').map((line,i)=>{if(i)start=true;const value=(start&&line?t.bullet+'　':'')+line;if(line)start=false;return value;}).join('\n');}return {text,options:{bold:run.bold,italic:run.italic,fontSize:run.fontSize,color:run.color||t.color||'000000'}};});};
 for(let n=0;n<pages.length;n++){
  const source=pages[n],slide=deck.addSlide();slide.background={color:'FFFFFF'};if(project.slides[n].notes)slide.addNotes(project.slides[n].notes);
  if(project.slides[n].kind==='transition')for(const t of source.texts)if(['title','transition-number'].includes(t.role)){t.noWrap=true;if(t.role==='title'){t.text=project.slides[n].title;if(t.runs?.map(r=>r.text).join('')!==t.text)t.runs=null;}}
  if(project.slides[n].referenceLayout){const el=page.locator('.slide').nth(n);await el.evaluate(n=>n.classList.add('export-mask'));const background=await el.screenshot({type:'png'});await el.evaluate(n=>n.classList.remove('export-mask'));slide.addImage({data:'image/png;base64,'+background.toString('base64'),x:0,y:0,w:13.333333,h:7.5});source.shapes=[];}
  const layers=[...source.shapes.map(s=>({...s,kind:'shape'})),...source.texts.map(t=>({...t,kind:'text'})),...source.decorations.map(d=>({...d,kind:'decoration'})),...source.media.map(m=>({...m,kind:'media'}))].sort((a,b)=>a.order-b.order);
  for(const item of layers){
   if(item.kind==='shape'){const s=item,opts={x:px(s.x),y:px(s.y),w:px(s.w),h:px(s.h),line:{color:s.line||s.fill||'FFFFFF',transparency:s.line?0:100,width:s.lineWidth*.6},fill:{color:s.fill||'FFFFFF',transparency:s.fill?0:100}};slide.addShape(s.arrow?deck.ShapeType.chevron:deck.ShapeType.rect,opts);}
   if(item.kind==='text'){const t=item;slide.addText(nativeText(t),{x:px(t.x),y:px(t.y),w:px(t.w),h:px(t.h),fontFace:t.fontFace||'Microsoft YaHei',fontSize:t.fontSize*.6,bold:t.fontWeight>=600,color:t.color||'000000',margin:0,breakLine:false,wrap:!t.noWrap,fit:'none',vertAnchor:'top',align:['center','right','justify'].includes(t.align)?t.align:'left',paraSpaceAfter:t.paragraphGap,lineSpacing:t.fontSize*t.lineHeight*.6,hyperlink:t.targetIndex!==null?{slide:t.targetIndex+1}:t.link?{url:t.link}:undefined});}
   if(item.kind==='decoration')slide.addImage({data:item.data,x:px(item.x),y:px(item.y),w:px(item.w),h:px(item.h)});
   if(item.kind==='media'){const m=item,element=page.locator('.slide').nth(n).locator(`[data-capture-id="${m.id}"]`);const png=await element.screenshot({type:'png'});const data='image/png;base64,'+png.toString('base64');if(m.video){slide.addMedia({type:'video',data:m.video.src,extn:m.video.mime.includes('webm')?'webm':'mp4',cover:data,x:px(m.x),y:px(m.y),w:px(m.w),h:px(m.h)});}else slide.addImage({data,x:px(m.x),y:px(m.y),w:px(m.w),h:px(m.h)});}
  }
 }
 return Buffer.from(await deck.write({outputType:'nodebuffer'}));
}
async function exportProject(project,kind){
 validateProject(project);
 for(const slide of project.slides)for(const m of slide.modules){if(!inside(m,slideBounds(slide))||occupiedItems(slide).some(n=>n.id!==m.id&&intersects(m,n)))throw Error(`“${slide.title}”中有模块越界或相互遮挡，请先调整。`);}
 const token=randomUUID();sessions.set(token,project);const b=await browser();const context=await b.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1});const page=await context.newPage();
 try{
  await page.goto(`http://${HOST}:${PORT}/export.html?token=${token}`);await page.waitForFunction(()=>window.exportReady===true||window.exportError,{},{timeout:45000});
  const failure=await page.evaluate(()=>window.exportError);if(failure)throw Error('导出页面初始化失败：'+failure);
  const errors=await page.evaluate(()=>window.exportErrors);if(errors.length)throw Error('导出前检查发现溢出：'+errors[0]);
  if(kind==='pdf')return await page.pdf({preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false,margin:{top:0,right:0,bottom:0,left:0}});
  return await pptxExport(page,project);
 }finally{sessions.delete(token);await context.close();}
}
const server=http.createServer(async(req,res)=>{try{
 const host=req.headers.host;if(![`127.0.0.1:${PORT}`,`localhost:${PORT}`].includes(host)){json(res,{error:'仅允许本机访问。'},403);return;}
 if(req.method==='POST'&&req.headers.origin&&!['http://127.0.0.1:'+PORT,'http://localhost:'+PORT].includes(req.headers.origin)){json(res,{error:'不允许跨站请求。'},403);return;}
 res.setHeader('X-Content-Type-Options','nosniff');const url=new URL(req.url,`http://${HOST}:${PORT}`),route=url.pathname;
 if(req.method==='GET'&&route==='/health')return json(res,{ok:true});
 if(req.method==='GET'&&route==='/app.bundle.js'){res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store'});res.end(code);return;}
 if(req.method==='GET'&&(route==='/api/default-logos'||route==='/api/example-project')){const options=await schoolOptions(url.searchParams.get('school')==='lishui'?'lishui':'ustb',ROOT);return json(res,route==='/api/default-logos'?{logo:options.logo,wordmark:options.wordmark}:createExample(options));}
 if(req.method==='GET'&&route.startsWith('/api/render/')){const p=sessions.get(route.split('/').pop());return json(res,p||{error:'导出会话已过期。'},p?200:404);}
 if(req.method==='POST'&&route==='/api/excel')return json(res,await excel((await body(req,15*1024*1024)).data));
 if(req.method==='POST'&&/^\/api\/export\/(pdf|pptx)$/.test(route)){
  const project=await body(req),kind=route.split('/').pop();const job=exportQueue.then(()=>exportProject(project,kind));exportQueue=job.catch(()=>{});const result=await job;res.writeHead(200,{'Content-Type':kind==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.presentationml.presentation','Content-Disposition':`attachment; filename="slides.${kind}"`,'Cache-Control':'no-store'});res.end(result);return;
 }
 if(req.method==='GET'&&route==='/styles.css'){res.writeHead(200,{'Content-Type':'text/css; charset=utf-8','Cache-Control':'no-store'});res.end(await sharedCSS(ROOT));return;}
 const files={'/':'index.html','/index.html':'index.html','/export.html':'index.html','/text-styles.html':'文本块样式展示.html'};
 if(req.method==='GET'&&files[route]){const file=files[route];res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store'});res.end(await fs.readFile(path.join(ROOT,file)));return;}
 json(res,{error:'找不到该资源。'},404);
 }catch(e){console.error('[request]',e.message);if(!res.headersSent)json(res,{error:e.message},400);else res.end();}});
server.listen(PORT,HOST,()=>{const url=`http://${HOST}:${PORT}`;console.log(`\nWeb Slide 已启动：${url}\n仅本机访问。按 Ctrl+C 停止。\n`);if(process.argv.includes('--open')){if(process.platform==='win32')spawn('cmd.exe',['/c','start','',url],{windowsHide:true,stdio:'ignore'});else spawn(process.platform==='darwin'?'open':'xdg-open',[url],{stdio:'ignore'});}});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`端口 ${PORT} 已被使用，请关闭旧服务或设置 PORT。`:e.message);process.exitCode=1;});
async function stop(){server.close();if(browserPromise)try{(await browserPromise).close();}catch{}setTimeout(()=>process.exit(0),300).unref();}process.on('SIGINT',stop);process.on('SIGTERM',stop);
