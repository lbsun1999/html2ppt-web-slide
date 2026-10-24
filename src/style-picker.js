import {TEXT_STYLES,styleInfo} from './text-styles.js';
import {renderModule,esc,themeCSS,fitTable} from './render.js';
import {part} from './model.js';
export function styleControls(m){
 return `<button data-action="choose-style" style="width:100%;margin-top:10px">样式编号与悬停预览</button>${['ribbon','capsule','arrow','group'].includes(m.style)?`<label>标题装饰长度 <span id="header-width-value">${m.headerWidth||70}%</span></label><input id="module-header-width" type="range" min="1" max="100" step="1" value="${m.headerWidth||70}">`:''}${m.style==='group'?'<p class="hint">C2 内部固定为无底色默认分组，以标题、正文及细线区分。</p>':''}${m.style==='numbered'?`<label>起始序号</label><input id="number-start" type="number" min="1" max="99" value="${m.numberStart||1}"><label><input id="show-subheading" type="checkbox" ${m.parts.some(p=>p.showSubheading)?'checked':''}> 正文加粗子标题（16pt）</label><label><input id="show-annotation" type="checkbox" ${m.parts.some(p=>p.showAnnotation)?'checked':''}> 补充注释（14pt）</label>`:''}`;
}
export function stylePickerBody(m){
 return `<div class="style-picker"><div class="style-list" role="group" aria-label="文本块样式编号">${TEXT_STYLES.filter(([id])=>!m.isToc||id!=='note').map(([id,code,name,description])=>`<button type="button" class="style-option" data-style-id="${id}" aria-pressed="${m.style===id}" title="${esc(description)}"><span class="style-code">${code}</span><span>${name}</span></button>`).join('')}</div><div class="style-live-preview"><div class="style-preview-frame" id="style-preview-frame"><div class="style-preview-canvas" id="style-preview-canvas"></div></div><div id="style-preview-copy" class="style-preview-copy"></div><p class="hint">悬停编号或用键盘聚焦可预览，单击选择，点击“应用样式”才修改模块。原文字会保留。</p></div></div><div class="style-picker-options"><label>标题装饰长度 <input id="style-header-width" type="range" min="1" max="100" step="1" value="${m.headerWidth||70}"><span id="style-header-label">${m.headerWidth||70}%</span></label></div>`;
}
export function drawStylePreview(id,theme,width=70){
 const frame=document.querySelector('#style-preview-frame'),canvas=document.querySelector('#style-preview-canvas');if(!frame||!canvas)return;
 const count=id==='numbered'?1:2;
 const m={id:'style-preview',type:'text',style:id,x:0,y:0,w:600,h:520,columns:1,headerWidth:Number(width),groupTitle:'模块大标题',innerStyle:'plain',parts:Array.from({length:count},(_,i)=>({...part(),title:`${i?'分项':'文段'}标题${i+1}`,text:id==='note'?'浅底无标题备注文字。\n多项文字块竖向保持间距。':'正文内容两端对齐。\n标题与内容保留清晰层级。',subheading:'正文加粗子标题',annotation:'14pt 注释信息，可分点说明。',showSubheading:id==='numbered',showAnnotation:id==='numbered'}))};
 canvas.style.cssText=themeCSS(theme);canvas.innerHTML=renderModule(m);fitTable(canvas.querySelector('.module'));
 const s=Math.min(1,(frame.parentElement.clientWidth-34)/600);frame.style.width=600*s+'px';frame.style.height=520*s+'px';canvas.style.transform=`scale(${s})`;
 const spec=styleInfo(id);document.querySelector('#style-preview-copy').textContent=`${spec[1]} · ${spec[2]}：${spec[3]}。标题 18pt，正文 16pt；示意文字仅用于预览。`;
}
