import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defaultTheme,moduleOf} from '../src/model.js';
import {TEXT_STYLES} from '../src/text-styles.js';
import {renderModule,themeCSS,esc} from '../src/render.js';
import {build} from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const css=(await fs.readFile(path.join(root,'styles.css'),'utf8'))+'\n'+await fs.readFile(path.join(root,'text-styles.css'),'utf8');
const pickerBundle=(await build({absWorkingDir:root,stdin:{contents:"import {OrthogonalColorPicker} from './src/color-picker.js';new OrthogonalColorPicker();",resolveDir:root},bundle:true,write:false,format:'iife',target:'chrome110',charset:'utf8'})).outputFiles[0].text;
function sample(id,index){
 const common=index<4,w=common?680:900,h=common?320:330;
 const m=moduleOf('text',{x:10,y:10,w:w-20,h:h-20},2);m.id='gallery-'+id;m.columns=id==='group'?2:1;m.style=id;m.headerWidth=id==='capsule'?95:65;m.groupTitle=id==='group'?'模块大标题':'';m.innerStyle='plain';
 const pair=(left,right)=>[left,right].forEach((value,i)=>Object.assign(m.parts[i],value));
 const commonSamples={plain:[{title:'要点一',text:'细线区分。'},{title:'要点二',text:'层级清楚。'}],unified:[{title:'同一浅底',text:'内部细分。'},{title:'第二部分',text:'整体连续。'}],cards:[{title:'独立浅卡',text:'彼此留白。'},{title:'第二张卡',text:'边界明确。'}],band:[{title:'深底标题',text:'浅色正文。'},{title:'并列标题',text:'层级醒目。'}]};
 if(common)pair(...commonSamples[id]);
 else if(id==='ribbon')pair({title:'飘带一',text:'标题醒目。'},{title:'飘带二',text:'正文简洁。'});
 else if(id==='capsule')pair({title:'圆角一',text:'正文置于标题下方。'},{title:'圆角二',text:'两个子区域纵向排列。'});
 else if(id==='arrow')pair({title:'方向一',text:'强调重点。'},{title:'方向二',text:'引导阅读。'});
 else if(id==='note')pair({text:'补充条件。'},{text:'解释边界。'});
 else if(id==='group')pair({title:'内部一',text:'无底分组。'},{title:'内部二',text:'结构清楚。'});
 else if(id==='numbered')pair({title:'第一项',text:'简洁正文。'},{title:'第二项',text:'并列说明。'});
 const code=TEXT_STYLES[index][1],description=TEXT_STYLES[index][3];
 return `<article class="gallery-example" data-style="${id}" title="${esc(description)}"><div class="gallery-frame" data-native-width="${w}" data-native-height="${h}"><div class="gallery-native" style="width:${w}px;height:${h}px;${themeCSS(defaultTheme)}">${renderModule(m)}</div></div><h3>${code} <span>${TEXT_STYLES[index][2]}</span></h3></article>`;
}
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>文本块样式 · HTML 复刻与复用</title><style>${css}
body{background:#f7f9fc;padding:12px 3vw;color:#172e40}.gallery-top{max-width:1780px;margin:0 auto 6px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}.gallery-top h1{font-size:27px;margin:0 auto 0 0}.gallery-top a{font-size:14px;color:#005894}.gallery-top label{display:flex;align-items:center;gap:8px}.gallery-top input[type=color]{width:48px;height:32px;padding:3px}.gallery-section{max-width:1780px;margin:6px auto 8px}.gallery-section>h2{font-size:18px;margin:0 0 5px;color:#005894}.gallery-grid{display:grid;gap:8px 18px}.gallery-grid.common{grid-template-columns:repeat(4,minmax(0,1fr))}.gallery-grid.more{grid-template-columns:repeat(3,minmax(0,1fr))}.gallery-example{min-width:0}.gallery-frame{position:relative;overflow:hidden;background:white;border:2px solid #15394b}.gallery-native{position:absolute;left:0;top:0;transform-origin:top left;font:26.6667px/1.55 'Microsoft YaHei',sans-serif;color:var(--ink)}.gallery-native .module-badge{display:none}.gallery-example>h3{font:19px Georgia,'Times New Roman',serif;margin:3px 0 0;text-align:center}.gallery-example>h3 span{font:11px 'Microsoft YaHei',sans-serif;color:#526e80}.gallery-notes{max-width:1780px;margin:auto;font-size:10px;line-height:1.35;color:#536d80}.gallery-native .paragraph{color:var(--ink)}@media(max-width:1250px){.gallery-grid.common,.gallery-grid.more{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.gallery-grid.common,.gallery-grid.more{grid-template-columns:1fr}body{padding:18px}}
</style></head><body><header class="gallery-top"><h1>文本块样式 · HTML 复刻</h1><a href="http://127.0.0.1:4317">进入编辑器 →</a><label title="打开项目取色器，可使用 RGB／HSV、拖拽、数值输入、色相预览与 Shift 正交约束">主题色 <input id="gallery-color" type="color" value="${defaultTheme.primary}" aria-label="主题色"></label><label>装饰标题长度 <input id="gallery-length" type="range" min="25" max="100" step="5" value="65"><span id="length-label">65%</span></label></header><section class="gallery-section"><h2>常用文段模块的双子区域排版</h2><div class="gallery-grid common">${TEXT_STYLES.slice(0,4).map(([id],i)=>sample(id,i)).join('')}</div></section><section class="gallery-section"><h2>其余六类文段模块的双子区域排版</h2><div class="gallery-grid more">${TEXT_STYLES.slice(4).map(([id],i)=>sample(id,i+4)).join('')}</div></section><footer class="gallery-notes">A、B 系列示例不设模块标题；C1 无子标题，C2 有模块大标题，C3 子标题带序号。主题色使用与工作台一致的项目取色器，可切换 RGB／HSV、拖拽选色、输入数值并查看色相；按住 Shift 拖动取色点可锁定水平或垂直方向。十类样式复用工作台渲染器，可离线打开。</footer><script>
${pickerBundle}
function resize(){document.querySelectorAll('.gallery-frame').forEach(frame=>{const w=Number(frame.dataset.nativeWidth),h=Number(frame.dataset.nativeHeight),s=(frame.clientWidth-0)/w;frame.style.height=h*s+'px';frame.firstElementChild.style.transform='scale('+s+')';});}window.addEventListener('resize',resize);resize();
document.querySelector('#gallery-color').addEventListener('input',e=>{document.querySelectorAll('.gallery-native').forEach(el=>{el.style.setProperty('--primary',e.target.value);const rgb=e.target.value.slice(1).match(/../g).map(v=>parseInt(v,16));const tint='#'+rgb.map(v=>Math.round(v*.06+255*.94).toString(16).padStart(2,'0')).join('');el.style.setProperty('--tint',tint);});});
document.querySelector('#gallery-length').addEventListener('input',e=>{document.querySelector('#length-label').textContent=e.target.value+'%';document.querySelectorAll('.text-parts,.text-group-shell').forEach(el=>el.style.setProperty('--title-width',e.target.value+'%'));});
</script></body></html>`;
await fs.writeFile(path.join(root,'文本块样式展示.html'),html,'utf8');console.log('Generated 文本块样式展示.html from shared components.');
