import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defaultTheme,moduleOf} from '../src/model.js';
import {TEXT_STYLES} from '../src/text-styles.js';
import {renderModule,themeCSS,esc} from '../src/render.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const css=(await fs.readFile(path.join(root,'styles.css'),'utf8'))+'\n'+await fs.readFile(path.join(root,'text-styles.css'),'utf8');
const commonTitles=['板块标题1','标题30px≈18pt','标题颜色 #005894'];
const commonBody=['正文内容两端对齐。\n正文允许无序列表。','正文内容约27px。\n对应 PPT 16pt。','正文使用微软雅黑。\n黑色常规字重。'];
function sample(id,index){
 const common=index<4,w=common?360:500,h=common?650:330;
 const m=moduleOf('text',{x:10,y:10,w:w-20,h:h-20},common?3:id==='note'?2:1);m.id='gallery-'+id;m.columns=1;m.style=id;m.headerWidth=id==='capsule'?95:65;m.groupTitle='模块大标题';m.innerStyle='plain';
 if(common)m.parts.forEach((p,i)=>Object.assign(p,{title:commonTitles[i],text:commonBody[i]}));
 else if(id==='ribbon')Object.assign(m.parts[0],{title:'文段标题',text:'平行四边形标题长度可调。\n三角折角搭配渐变边线。\n白底文本框保留轻微阴影。'});
 else if(id==='capsule')Object.assign(m.parts[0],{title:'文段标题',text:'标题深色底居中，正文白色底卡片，无额外修饰。'});
 else if(id==='arrow')Object.assign(m.parts[0],{title:'文段标题',text:'五角形箭头标题长度可调。\n渐变边线搭配轻微阴影。\n白底正文保持清晰与简洁。'});
 else if(id==='note')m.parts.forEach((p,i)=>p.text=i?'多项文字块竖向保留间距排版。':'浅底无标题备注型文字。');
 else if(id==='group')Object.assign(m.parts[0],{title:'内部板块标题',text:'深色标题搭载可变长顶层矩形。\n内部仅保留无底色默认分组。'});
 else if(id==='numbered')Object.assign(m.parts[0],{title:'带序号的文段标题',text:'正文内容16pt，白底黑字。',subheading:'正文16pt，加粗可做子标题',annotation:'14pt 注释信息，可以分点。',showSubheading:true,showAnnotation:true});
 const code=TEXT_STYLES[index][1],description=TEXT_STYLES[index][3];
 return `<article class="gallery-example" data-style="${id}"><div class="gallery-frame" data-native-width="${w}" data-native-height="${h}"><div class="gallery-native" style="width:${w}px;height:${h}px;${themeCSS(defaultTheme)}">${renderModule(m)}</div></div><h3>${code} <span>${TEXT_STYLES[index][2]}</span></h3><p>${esc(description)}</p></article>`;
}
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>文本块样式 · HTML 复刻与复用</title><style>${css}
body{background:#f7f9fc;padding:34px 4vw;color:#172e40}.gallery-top{max-width:1700px;margin:0 auto 28px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}.gallery-top h1{font-size:28px;margin:0 auto 0 0}.gallery-top a{font-size:14px;color:#005894}.gallery-top label{display:flex;align-items:center;gap:8px}.gallery-top input[type=color]{width:48px;height:32px;padding:3px}.gallery-section{max-width:1700px;margin:26px auto 45px}.gallery-section>h2{font-size:21px;margin-bottom:20px;color:#005894}.gallery-grid{display:grid;gap:24px}.gallery-grid.common{grid-template-columns:repeat(4,minmax(0,1fr))}.gallery-grid.more{grid-template-columns:repeat(3,minmax(0,1fr))}.gallery-example{min-width:0}.gallery-frame{position:relative;overflow:hidden;background:white;border:2px solid #15394b}.gallery-native{position:absolute;left:0;top:0;transform-origin:top left;font:26.6667px/1.55 'Microsoft YaHei',sans-serif;color:var(--ink)}.gallery-native .module-badge{display:none}.gallery-example>h3{font:26px Georgia,'Times New Roman',serif;margin:12px 0 6px;text-align:center}.gallery-example>h3 span{font:13px 'Microsoft YaHei',sans-serif;color:#526e80}.gallery-example>p{font-size:12px;line-height:1.7;margin:0;color:#657b8d}.gallery-notes{max-width:1700px;margin:auto;font-size:13px;line-height:1.9;color:#536d80}.gallery-native .paragraph{color:var(--ink)}@media(max-width:1050px){.gallery-grid.common{grid-template-columns:repeat(2,minmax(0,1fr))}.gallery-grid.more{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.gallery-grid.common,.gallery-grid.more{grid-template-columns:1fr}body{padding:20px}}
</style></head><body><header class="gallery-top"><h1>文本块样式 · HTML 复刻</h1><a href="http://127.0.0.1:4317">进入编辑器 →</a><label>主题色 <input id="gallery-color" type="color" value="${defaultTheme.primary}"></label><label>装饰标题长度 <input id="gallery-length" type="range" min="25" max="100" step="5" value="65"><span id="length-label">65%</span></label></header><section class="gallery-section"><h2>常用文段模块的子区域排版样式</h2><div class="gallery-grid common">${TEXT_STYLES.slice(0,4).map(([id],i)=>sample(id,i)).join('')}</div></section><section class="gallery-section"><h2>其余六类文段模块的排版样式</h2><div class="gallery-grid more">${TEXT_STYLES.slice(4).map(([id],i)=>sample(id,i+4)).join('')}</div></section><footer class="gallery-notes">参考：文本块样式规范.pdf。边框用于标明组件范围，原文与本展示分离。标题 30px≈18pt，正文 26.67px≈16pt，正文行距 1.55；C3 注释 23.33px≈14pt。<br>本页与工作台复用同一份渲染器和 CSS，不是 PDF 截图；可离线打开。定制主题时，标题与装饰跟随主色，正文保持深色。修改源组件后运行 npm run build:styles 更新本展示。</footer><script>
function resize(){document.querySelectorAll('.gallery-frame').forEach(frame=>{const w=Number(frame.dataset.nativeWidth),h=Number(frame.dataset.nativeHeight),s=(frame.clientWidth-0)/w;frame.style.height=h*s+'px';frame.firstElementChild.style.transform='scale('+s+')';});}window.addEventListener('resize',resize);resize();
document.querySelector('#gallery-color').addEventListener('input',e=>{document.querySelectorAll('.gallery-native').forEach(el=>{el.style.setProperty('--primary',e.target.value);const rgb=e.target.value.slice(1).match(/../g).map(v=>parseInt(v,16));const tint='#'+rgb.map(v=>Math.round(v*.06+255*.94).toString(16).padStart(2,'0')).join('');el.style.setProperty('--tint',tint);});});
document.querySelector('#gallery-length').addEventListener('input',e=>{document.querySelector('#length-label').textContent=e.target.value+'%';document.querySelectorAll('.text-parts,.text-group-shell').forEach(el=>el.style.setProperty('--title-width',e.target.value+'%'));});
</script></body></html>`;
await fs.writeFile(path.join(root,'文本块样式展示.html'),html,'utf8');console.log('Generated 文本块样式展示.html from shared components.');
