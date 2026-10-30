import {renderTables} from './table-blocks.js';
import {profileCardHTML} from './profile-card.js';
import {mixColor,resolveThemeAsset,alignHue} from './theme-assets.js';
import {renderReferenceLayout} from './reference-layouts.js';
import {timelineHTML,fitTimeline,timelineHeight} from './timeline.js';
import {formulaHTML} from './formula.js';
import {richHTML,textStyle} from './rich-text.js';
import {W,SAFE} from './model.js';
import {textModuleHTML} from './text-styles.js';
import {titleErrors} from './title-policy.js';
import {auditTextPositions,positionedMarkup} from './free-text-position.js';
import {inlineMathHTML} from './inline-math.js';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function themeCSS(t,legacy=false){return [...['primary','secondary','accent','emphasis','tint','ink'].map(k=>`--${k}:${t[k]}`),`--muted:${alignHue(legacy?'#526b7d':'#617b8b',t.primary)}`,`--line:${mixColor(t.primary,'#FFFFFF',.8)}`,`--line-light:${mixColor(t.primary,'#FFFFFF',.9)}`].join(';');}
const editable=(edit,attrs)=>edit?`contenteditable="true" spellcheck="false" ${attrs}`:'';
function field(owner,key,fallback=''){return richHTML(owner[key]??fallback,owner.rich?.[key],false,!!owner.paragraphs?.[key]?.length,undefined,owner.paragraphs?.[key]);}
function textBody(p,i,edit,inlineMathMode){const html=richHTML(p.text,p.rich?.text,p.bullet,true,p.marker,p.paragraphs?.text),mode=inlineMathMode??(p.markdownMath?'render':'source'),body=mode==='render'&&!edit?inlineMathHTML(html,{source:p.inlineMathExport==='latex'}):html;return `<div class="paragraph ${p.chapterId?'toc-note ':''}${p.bullet?'bulleted':''}" data-marker="${esc(p.marker||'•')}" data-text data-part="${i}" data-field="text" ${textStyle(p,'text')} ${editable(edit,'')}>${body}</div>`;}
export function renderModule(m,edit=false,theme,inlineMathMode){
 if(m.type==='media'&&theme)m={...m,parts:m.parts.map(p=>({...p,asset:resolveThemeAsset(p.asset,theme)}))};
 let content='';const cols=Math.min(m.columns||m.parts.length,m.parts.length)||1;
 if(m.type==='group')content=`<div class="ring-group-content">${m.items.map((item,i)=>renderModule(item,edit,theme,inlineMathMode).replace('class="module ','class="ring-item module ').replace(`data-module="${item.id}"`,`data-ring-item="${i}"`)).join('')}</div>`;
 if(m.type==='timeline')content=timelineHTML(m,{esc,edit});
 if(m.type==='text')content=m.textBox?`<div class="text-parts standalone-text ${m.boxTone==='light'?'standalone-light':'standalone-dark'}" style="--cols:1"><div class="text-part" data-shape>${textBody(m.parts[0],0,edit,inlineMathMode)}</div></div>`:textModuleHTML(m,{esc,editable,textBody:(p,i,currentEdit)=>textBody(p,i,currentEdit,inlineMathMode),edit});
 if(m.type==='media')content=`<div class="media-parts" style="--cols:${cols};grid-template-rows:repeat(${Math.ceil(m.parts.length/cols)},minmax(0,1fr))">${m.parts.map((p,i)=>`<figure class="media-part" data-shape><div class="media-window ${p.asset?'has-asset':''}" data-media-part="${i}" data-ratio="${p.asset?.ratio||16/9}">${p.asset?`<div class="media-crop"><${p.asset.kind==='video'?'video controls preload="metadata"':'img'} src="${esc(p.asset.src)}" ${p.asset.kind==='video'?'muted playsinline':''} alt="${esc(p.caption)}" style="object-fit:${p.asset.fit||'cover'};object-position:${p.asset.cx??50}% ${p.asset.cy??50}%;transform:scale(${p.asset.zoom||1});transform-origin:${p.asset.cx??50}% ${p.asset.cy??50}%"></${p.asset.kind==='video'?'video':'img'}></div>`:`<div class="media-placeholder" data-shape><span data-text>＋</span><p data-text>图片 / 视频占位区域</p><small data-text>双击上传，等比裁剪</small></div>`}</div>${p.showCaption!==false&&(Boolean(p.caption?.trim())||(p.captionMode!=="title"&&Boolean(p.note?.trim())))?`<figcaption><div class="figure-title" data-text data-part="${i}" data-field="caption" ${textStyle(p,'caption')} ${editable(edit,'')}>${field(p,'caption')}</div>${p.captionMode!=='title'&&p.note?.trim()?`<div class="figure-note" data-text data-part="${i}" data-field="note" ${textStyle(p,'note')} ${editable(edit,'')}>${field(p,'note')}</div>`:''}</figcaption>`:''}</figure>`).join('')}</div>`;
 if(m.type==='table')content=renderTables(m,{esc,editable,edit});
 if(m.type==='formula')content=textModuleHTML(m,{esc,editable,edit,textBody:(p,i)=>{let math;try{math=formulaHTML(p.latex);}catch(error){math='<span class="formula-error">'+esc(error.message)+'</span>';}return '<div class="formula-body"><div class="formula-expression" data-formula-part="'+i+'" data-raster aria-label="双击修改 LaTeX" style="--math-color:'+((p.useThemeColor??m.mathUseThemeColor)?'var(--primary)':'#000000')+'">'+math+'</div>'+textBody(p,i,edit,inlineMathMode)+'</div>';}});
 if(m.type==='shape')content=`<div class="graphic-shape" data-shape style="background:var(--primary)"></div>`;
 return `<div class="module ${m.type}-module ${m.type==='formula'&&m.parts.length===2&&cols===1?'paired-formulas':''} ${m.isToc?'toc-module':''} ${esc(m.role||'')}" data-module="${m.id}" ${Number.isFinite(m.cardPaddingPt)?'data-card-padding':''} style="${Number.isFinite(m.cardPaddingPt)?'--card-pad:'+m.cardPaddingPt/.6+'px;':''}${Number.isFinite(m.partGap)?'--part-gap:'+m.partGap+'px;':''}left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px"><div class="module-content">${content}</div><span class="module-badge">${{text:'文字',media:'图像 / 视频',table:'表格',shape:'图形',formula:'公式',timeline:'时间轴',group:'环形组合'}[m.type]}</span></div>`;
}
export function renderSlide(s,theme,index,total,edit=false,project=null){
 if(s.referenceLayout)return renderReferenceLayout(s,theme,index,total,edit,themeCSS(theme,true),project);
 if(s.kind==='transition')return `<section class="slide transition-slide" data-slide="${s.id}" style="${themeCSS(theme)}"><div class="top-trim" data-shape></div><div class="transition-content"><div class="transition-number" data-text>${esc(s.section)}</div><div class="transition-rule" data-shape></div><h1 data-text data-slide-field="title" ${textStyle(s,'title')} ${editable(edit,'')}>${field(s,'title')}</h1><p data-text data-slide-field="lead" ${textStyle(s,'lead')} ${editable(edit,'')}>${field(s,'lead')}</p></div></section>`;
 if(s.kind==='cover'||s.kind==='closing')return `<section class="slide cover" data-slide="${s.id}" style="${themeCSS(theme)}"><div class="cover-logo">${theme.wordmark?`<img class="wordmark" data-image src="${esc(theme.wordmark)}" alt="校徽与校名">`:`<div class="wordmark-placeholder" data-text>校徽与校名</div>`}</div><div class="cover-band" data-shape><h1 data-text data-slide-field="title" ${textStyle(s,'title')} ${editable(edit,'')}>${field(s,'title')}</h1><p data-text data-slide-field="lead" ${textStyle(s,'lead')} ${editable(edit,'')}>${field(s,'lead')}</p></div><table class="cover-info">${[['presenter','汇报人'],['institute','学院'],['date','日期']].map(([k,n])=>`<tr><th data-text data-slide-field="${k}Label" ${editable(edit,'')}>${field(s,k+'Label',n)}</th><td data-text data-slide-field="${k}" ${textStyle(s,k)} ${editable(edit,'')}>${field(s,k)}</td></tr>`).join('')}</table></section>`;
 const content=profileCardHTML(s,edit,themeCSS(theme,true),theme)+`<div class="module-layer">${s.modules.map(m=>renderModule(m,edit,theme,project?.inlineMathMode)).join('')}</div>`;
 return positionedMarkup(`<section class="slide body-slide" data-slide="${s.id}" style="${themeCSS(theme)}"><div class="top-trim" data-shape></div><header class="slide-header"><div class="section-line"><span class="section-index" data-text data-shape data-slide-field="section" ${s.kind==='toc'||s.chapterId?'':editable(edit,'')}>${s.kind==='toc'?'目录':esc(s.section)}</span><span data-text data-slide-field="group" ${s.kind==='toc'||s.chapterId?'':editable(edit,'')}>${esc(s.kind==='toc'?'汇报概览':s.group)}</span></div><h2 data-text data-slide-field="title" ${textStyle(s,'title')} ${editable(edit,'')}>${field(s,'title')}</h2>${s.hideLogo?'':theme.logo?`<img class="slide-logo" data-image src="${esc(theme.logo)}" alt="校徽">`:`<div class="slide-logo logo-placeholder" data-text>校徽</div>`}<div class="header-rule" data-shape></div></header><div class="slide-lead" data-text data-slide-field="lead" ${textStyle(s,'lead')} ${editable(edit,'')}>${field(s,'lead')}</div>${content}${s.summary?`<div class="slide-summary" data-shape><div data-text data-slide-field="summary" ${textStyle(s,'summary')} ${editable(edit,'')}>${field(s,'summary')}</div></div>`:''}<footer class="slide-footer"><span data-text data-slide-field="footer" ${editable(edit,'')}>${field(s,'footer',theme.name+' · 科研汇报')}</span><span class="source" data-text data-slide-field="source" ${textStyle(s,'source')} ${editable(edit,'')}>${s.sourceUrl?`<a href="${/^(https?:\/\/|#slide-)/.test(s.sourceUrl)?esc(s.sourceUrl):'#'}" target="_blank" rel="noopener">${field(s,'source')}</a>`:esc(s.source)}</span><span data-text>${String(index+1).padStart(2,'0')} / ${total}</span><div class="footer-rule" data-shape></div></footer></section>`,s);
}
export function fitMedia(el){
 // Media fitting is local to one module. Using the whole slide as the scope made
 // unrelated media modules share a row and re-fit each other after alignment.
 const scope=el.matches?.('.module')?el:(el.closest?.('.module')||el),slide=scope.closest?.('.slide'),scale=slide?slide.getBoundingClientRect().width/W:1;
 const windows=[...scope.querySelectorAll('.media-window:not(.timeline-media)')];
 // Reset first: an earlier fit must not constrain the next fit after editing captions.
 for(const window of windows){window.closest('figure').style.height='100%';const cap=window.closest('figure').querySelector('figcaption');if(cap)cap.style.minHeight='';window.style.width='100%';window.style.height='';window.style.flex='1 1 0';window.style.minHeight='80px';}
 const rows=[];
 for(const window of windows){
  const rect=window.getBoundingClientRect(),ratio=Number(window.dataset.ratio)||16/9,top=rect.top/(scale||1);
  let row=rows.find(r=>Math.abs(r.top-top)<1);if(!row){row={top,items:[]};rows.push(row);}
  row.items.push({window,ratio,w:rect.width/(scale||1),h:rect.height/(scale||1)});
 }
 for(const row of rows){
  const captions=row.items.map(({window})=>window.closest('figure').querySelector('figcaption')).filter(Boolean);const captionHeight=Math.max(0,...captions.map(c=>c.getBoundingClientRect().height/(scale||1)));for(const c of captions)c.style.minHeight=captionHeight+'px';
  // Match the actual visible crop height, even with different ratios or caption lengths.
  // The narrowest/shortest slot limits the whole row; no media is stretched.
  const height=Math.max(0,Math.min(...row.items.map(item=>Math.min(item.h,item.w/item.ratio))));
  for(const {window,ratio} of row.items){
   const fig=window.closest('figure'),cap=fig.querySelector('figcaption');if(!cap)fig.style.height=(height+32)+'px';
   const width=height*ratio;window.style.width=width+'px';window.style.height=height+'px';window.style.flex='0 0 '+height+'px';window.style.minHeight='0';window.style.alignSelf='center';
   const crop=window.querySelector('.media-crop');if(crop){crop.style.width=width+'px';crop.style.height=height+'px';}
  }
 }
}
export function fitTable(el){
 fitTimeline(el);
 for(const part of el.querySelectorAll('.text-part')){
  const cs=getComputedStyle(part);if(!part.dataset.basePadding)part.dataset.basePadding=JSON.stringify(['Top','Bottom','Left','Right'].map(k=>parseFloat(cs['padding'+k])||0));
  const [top,bottom,left,right]=JSON.parse(part.dataset.basePadding);Object.assign(part.style,{paddingTop:top+'px',paddingBottom:bottom+'px',paddingLeft:left+'px',paddingRight:right+'px'});
  if(part.closest('.style-cards,.style-unified,.style-note'))for(let cut=2;flowHeight(part)>part.clientHeight+1&&cut<=Math.max(left,right)-4;cut+=2){part.style.paddingLeft=Math.max(part.closest('.style-note')?10:4,left-cut)+'px';part.style.paddingRight=Math.max(4,right-cut)+'px';}
  const excess=Math.max(0,flowHeight(part)-part.clientHeight),reduceBottom=Math.min(excess,Math.max(0,bottom-(part.querySelector('.toc-page-range')?32:2)));part.style.paddingBottom=bottom-reduceBottom+'px';part.style.paddingTop=top-Math.min(Math.max(0,excess-reduceBottom),Math.max(0,top-2))+'px';
 }
 for(const part of el.querySelectorAll('.style-ribbon .text-part,.style-capsule .text-part,.style-arrow .text-part')){
  const wrap=part.querySelector('.part-title-wrap'),title=wrap?.querySelector('.part-title-text');if(!title)continue;
  const ps=getComputedStyle(part),ts=getComputedStyle(title),canvas=document.createElement('canvas').getContext('2d');canvas.font=`${ts.fontWeight} ${ts.fontSize} ${ts.fontFamily}`;
  const available=Math.max(0,part.clientWidth-parseFloat(ps.paddingLeft)-parseFloat(ps.paddingRight)),natural=Math.max(...title.textContent.split('\n').map(line=>canvas.measureText(line).width))+parseFloat(ts.paddingLeft)+parseFloat(ts.paddingRight)+2,preferred=(parseFloat(getComputedStyle(wrap).getPropertyValue('--title-width'))||65)/100*available;
  wrap.style.width=Math.min(available,Math.max(preferred,natural))+'px';
 }
 fitMedia(el);
 for(const table of el.querySelectorAll('.data-table')){
 const wrap=table.closest('.table-wrap'),base=table.hasAttribute('data-fixed-font')?(Number(table.dataset.baseFont)||14):Math.min(14,Number(table.dataset.baseFont)||14);
 for(const pt of (table.hasAttribute('data-fixed-font')?[base]:[base,...[14,12,11,10,8].filter(n=>n<base)])){table.style.fontSize=pt/.6+'px';table.style.setProperty('--cell-pad',table.dataset.cellPadding!==''?Number(table.dataset.cellPadding)+'px':Math.max(3,pt-7)+'px');if(wrap.scrollHeight<=wrap.clientHeight+1&&table.scrollWidth<=wrap.clientWidth+1&&[...wrap.querySelectorAll('.table-card')].every(section=>flowHeight(section)<=section.clientHeight+1))break;}
 }

}
// Measure natural flow, not rounded scrollHeight of grid tracks already stretched to fill a box.
function flowHeight(element){
 const style=getComputedStyle(element),scale=element.getBoundingClientRect().width/(element.offsetWidth||1)||1;
 const children=[...element.children].filter(child=>{const c=getComputedStyle(child);return c.position!=='absolute'&&c.position!=='fixed'&&c.display!=='none';});
 const gap=parseFloat(style.rowGap)||0;
 return children.reduce((sum,child)=>sum+child.getBoundingClientRect().height/scale+(parseFloat(getComputedStyle(child).marginTop)||0)+(parseFloat(getComputedStyle(child).marginBottom)||0),0)+Math.max(0,children.length-1)*gap+(parseFloat(style.paddingTop)||0)+(parseFloat(style.paddingBottom)||0)+(parseFloat(style.borderTopWidth)||0)+(parseFloat(style.borderBottomWidth)||0);
}
export function measuredHeight(el,m){
 if(m.type==='timeline')return timelineHeight(el);
 if(m.type==='table'){const wrap=el.querySelector('.table-wrap');return [...wrap.querySelectorAll('.table-section')].reduce((n,p)=>n+flowHeight(p),0)+Math.max(0,wrap.children.length-1)*(parseFloat(getComputedStyle(wrap).rowGap)||0);}
 if(m.type==='text'){
  const grid=el.querySelector('.text-parts'),cols=Number(getComputedStyle(grid).getPropertyValue('--cols'))||1,parts=[...grid.querySelectorAll('.text-part')];let height=0;
  for(let row=0;row<Math.ceil(parts.length/cols);row++)height+=Math.max(...parts.slice(row*cols,(row+1)*cols).map(flowHeight));
  const gap=parseFloat(getComputedStyle(grid).rowGap)||0,shell=el.querySelector('.text-group-shell');
  const extra=shell?(el.querySelector('.module-content').getBoundingClientRect().height-grid.getBoundingClientRect().height)/(el.getBoundingClientRect().width/(el.offsetWidth||1)||1):0;
  return height+Math.max(0,Math.ceil(parts.length/cols)-1)*gap+Math.max(0,extra);
 }
 if(m.type==='media'){
  const grid=el.querySelector('.media-parts'),cols=Number(getComputedStyle(grid).getPropertyValue('--cols'))||1,figures=[...el.querySelectorAll('figure')];let height=0;
  const needed=f=>{const style=getComputedStyle(f),scale=f.getBoundingClientRect().width/(f.offsetWidth||1)||1,caption=f.querySelector('figcaption');return (caption?caption.getBoundingClientRect().height/scale+(parseFloat(style.rowGap)||0):0)+80+(parseFloat(style.paddingTop)||0)+(parseFloat(style.paddingBottom)||0);};
  for(let row=0;row<Math.ceil(figures.length/cols);row++)height+=Math.max(...figures.slice(row*cols,(row+1)*cols).map(needed));
  return height+Math.max(0,Math.ceil(figures.length/cols)-1)*(parseFloat(getComputedStyle(grid).rowGap)||0);
 }
 return 80;
}
export function audit(slideEl,model){
 for(const m of model.modules||[]){const element=slideEl.querySelector(`[data-module="${m.id}"]`);if(element)fitTable(element);}
 const errors=[...titleErrors(slideEl),...auditTextPositions(slideEl,model)];if(model.referenceLayout){const symbols=slideEl.querySelector('.symbol-table'),note=slideEl.querySelector('.symbols-panel .symbol-note');if(symbols){if([...symbols.querySelectorAll('[data-reference-symbol]')].some(n=>n.scrollWidth>n.clientWidth+2))errors.push('符号过宽，请精简LaTeX或调整说明布局。');if(note&&symbols.getBoundingClientRect().bottom>note.getBoundingClientRect().top-6)errors.push('符号表与下方说明重叠，请精简或拆页。');}const footer=slideEl.querySelector('.slide-footer')?.getBoundingClientRect();for(const table of slideEl.querySelectorAll('table'))if(footer&&table.getBoundingClientRect().bottom>footer.top+2)errors.push('表格进入页脚区域，请减小行高或拆页。');for(const node of slideEl.querySelectorAll('[data-slide-field],.formula-card,.math-expression')){const shiftedCard=node.matches('.formula-card')&&[...node.querySelectorAll('[data-slide-field]')].some(n=>model.textPositions?.[n.dataset.slideField]);if(!shiftedCard&&(node.scrollHeight>node.clientHeight+3||node.scrollWidth>node.clientWidth+3))errors.push('文字超出原版式区域，请删改或调整行距。');}return errors;}if(model.kind==='transition'){const content=slideEl.querySelector('.transition-content'),title=content.querySelector('h1');if(title.scrollWidth>title.clientWidth+2)errors.push('\u8fc7\u6e21\u9875\u6807\u9898\u4e0d\u5141\u8bb8\u81ea\u52a8\u6362\u884c\uff0c\u8bf7\u7cbe\u7b80\u6216\u6309\u8bed\u4e49\u624b\u52a8\u5206\u884c\u3002');if(content.scrollHeight>content.clientHeight+2)errors.push('过渡页文字过长，请精简。');return errors;}
 if(model.kind==='cover'||model.kind==='closing'){const band=slideEl.querySelector('.cover-band');if(band.scrollHeight>band.clientHeight+2)errors.push('封面标题过长，请精简或手动分成两行。');const info=slideEl.querySelector('.cover-info');if(info.offsetTop+info.offsetHeight>880)errors.push('署名内容过长，请精简。');return errors;}
 const identity=slideEl.querySelector('.profile-fixed .profile-identity');if(identity&&(identity.scrollHeight>identity.clientHeight+2||identity.scrollWidth>identity.clientWidth+2))errors.push('Author card overflow.');
 const heading=slideEl.querySelector('h2');if(heading.scrollHeight>heading.clientHeight+2)errors.push('页面标题过长，请精简。');
 const lead=slideEl.querySelector('.slide-lead'),contentTop=Math.max(SAFE.y,model.modules.length?Math.min(...model.modules.map(m=>m.y)):SAFE.y);if(!model.textPositions?.lead&&lead.offsetTop+lead.scrollHeight>contentTop-16)errors.push('页首句过长：请精简或分成其他页面。');
 const summary=slideEl.querySelector('.slide-summary');if(summary&&summary.scrollHeight>summary.clientHeight+2)errors.push('页尾总结过长，请精简为一行。');
 for(const m of model.modules){
  if(model.summary&&m.y+m.h>750+.1)errors.push('模块进入页尾总结区域，请缩小或上移。');
  const el=slideEl.querySelector(`[data-module="${m.id}"]`);if(!el)continue;fitTable(el);const target=m.type==='table'?el.querySelector('.table-wrap'):el.querySelector('.module-content');
  const clippedPart=m.type==='text'&&[...el.querySelectorAll('.text-part')].some(part=>flowHeight(part)>part.getBoundingClientRect().height/(el.getBoundingClientRect().width/(el.offsetWidth||1)||1)+2);
  const formulaBad=m.type==='formula'&&[...el.querySelectorAll('.text-part')].some(c=>c.scrollHeight>c.clientHeight+2||c.querySelector('.formula-body').scrollHeight>c.querySelector('.formula-body').clientHeight+2||flowHeight(c)>c.getBoundingClientRect().height/(el.getBoundingClientRect().width/(el.offsetWidth||1)||1)+2||c.querySelector('.formula-expression').scrollWidth>c.querySelector('.formula-expression').clientWidth+2||c.querySelector('.formula-error'));
  const horizontalText=m.type==='text'&&[...el.querySelectorAll('.part-title-text,.paragraph')].some(n=>n.scrollWidth>n.clientWidth+2);
  const overflow=horizontalText||formulaBad||target.scrollHeight>target.clientHeight+2||target.scrollWidth>target.clientWidth+2||measuredHeight(el,m)>m.h+2||clippedPart;
  el.classList.toggle('overflowing',overflow);if(overflow)errors.push(`${m.id}：内容溢出，请删改或扩大模块。`);
 }
 return errors;
}
