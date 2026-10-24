import {renderReferenceLayout} from './reference-layouts.js';
import {timelineHTML,fitTimeline,timelineHeight} from './timeline.js';
import {formulaHTML} from './formula.js';
import {richHTML,textStyle} from './rich-text.js';
import {W,SAFE} from './model.js';
import {textModuleHTML} from './text-styles.js';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function themeCSS(t){return ['primary','secondary','accent','emphasis','tint','ink'].map(k=>`--${k}:${t[k]}`).join(';');}
const editable=(edit,attrs)=>edit?`contenteditable="true" spellcheck="false" ${attrs}`:'';
function field(owner,key,fallback=''){return richHTML(owner[key]??fallback,owner.rich?.[key],false,!!owner.paragraphs?.[key]?.length,undefined,owner.paragraphs?.[key]);}
function textBody(p,i,edit){return `<div class="paragraph ${p.chapterId?'toc-note ':''}${p.bullet?'bulleted':''}" data-marker="${esc(p.marker||'•')}" data-text data-part="${i}" data-field="text" ${textStyle(p,'text')} ${editable(edit,'')}>${richHTML(p.text,p.rich?.text,p.bullet,true,p.marker,p.paragraphs?.text)}</div>`;}
export function renderModule(m,edit=false){
 let content='';const cols=Math.min(m.columns||m.parts.length,m.parts.length)||1;
 if(m.type==='timeline')content=timelineHTML(m,{esc,edit});
 if(m.type==='text')content=m.textBox?`<div class="text-parts standalone-text ${m.boxTone==='light'?'standalone-light':'standalone-dark'}" style="--cols:1"><div class="text-part" data-shape>${textBody(m.parts[0],0,edit)}</div></div>`:textModuleHTML(m,{esc,editable,textBody,edit});
 if(m.type==='media')content=`<div class="media-parts" style="--cols:${cols};grid-template-rows:repeat(${Math.ceil(m.parts.length/cols)},minmax(0,1fr))">${m.parts.map((p,i)=>`<figure class="media-part" data-shape><div class="media-window ${p.asset?'has-asset':''}" data-media-part="${i}" data-ratio="${p.asset?.ratio||16/9}">${p.asset?`<div class="media-crop"><${p.asset.kind==='video'?'video controls preload="metadata"':'img'} src="${esc(p.asset.src)}" ${p.asset.kind==='video'?'muted playsinline':''} alt="${esc(p.caption)}" style="object-fit:${p.asset.fit||'cover'};object-position:${p.asset.cx??50}% ${p.asset.cy??50}%;transform:scale(${p.asset.zoom||1});transform-origin:${p.asset.cx??50}% ${p.asset.cy??50}%"></${p.asset.kind==='video'?'video':'img'}></div>`:`<div class="media-placeholder" data-shape><span data-text>＋</span><p data-text>图片 / 视频占位区域</p><small data-text>双击上传，等比裁剪</small></div>`}</div>${p.showCaption!==false&&(Boolean(p.caption?.trim())||(p.captionMode!=="title"&&Boolean(p.note?.trim())))?`<figcaption><div class="figure-title" data-text data-part="${i}" data-field="caption" ${textStyle(p,'caption')} ${editable(edit,'')}>${field(p,'caption')}</div>${p.captionMode!=='title'&&p.note?.trim()?`<div class="figure-note" data-text data-part="${i}" data-field="note" ${textStyle(p,'note')} ${editable(edit,'')}>${field(p,'note')}</div>`:''}</figcaption>`:''}</figure>`).join('')}</div>`;
 if(m.type==='table'){
  const skip=new Set(),merges=m.merges||[];
  for(const a of merges)for(let r=a.top;r<=a.bottom;r++)for(let c=a.left;c<=a.right;c++)if(r!==a.top||c!==a.left)skip.add(`${r},${c}`);
  content=`<div class="table-wrap">${m.tableTitle?`<h3 class="table-title" data-text data-module-field="tableTitle" ${editable(edit,'')}>${richHTML(m.tableTitle,m.rich?.tableTitle)}</h3>`:''}<table data-cell-padding="${Number.isFinite(m.cellPaddingPt)?Math.max(0,Math.min(18,m.cellPaddingPt))/.6:''}" class="data-table ${m.scenarioGroups?'scenario-table':''} ${m.referenceStyle?'reference-table':''} ${m.profileHistory?'profile-history':''}">${m.referenceStyle?'<colgroup><col style="width:45px"><col></colgroup>':m.profileHistory?'<colgroup><col style="width:23%"><col style="width:12px"><col style="width:42%"><col style="width:12px"><col></colgroup>':''}<tbody>${m.rows.map((row,r)=>`<tr${Number(m.rowHeightPt)>0?` style="height:${Math.min(120,Number(m.rowHeightPt))/.6}px"`:''}>${row.map((value,c)=>{if(skip.has(`${r},${c}`))return '';const merge=merges.find(a=>a.top===r&&a.left===c);const tag=!m.referenceStyle&&(r<(m.headerRows??1)||(m.rowHeaders&&c===0))?'th':'td';return `<${tag} ${tag==='th'?`scope="${r<(m.headerRows??1)?'col':'row'}"`:''} data-shape ${merge?`rowspan="${merge.bottom-r+1}" colspan="${merge.right-c+1}"`:''}><div data-text data-row="${r}" data-col="${c}" ${textStyle({lineSpacing:{cell:m.cellLineSpacing?.[r+','+c]}},'cell')} ${editable(edit,'')}>${richHTML(value,m.cellRich?.[r+','+c],false,!!m.cellParagraphs?.[r+','+c],undefined,m.cellParagraphs?.[r+','+c])}</div></${tag}>`;}).join('')}</tr>`).join('')}</tbody></table>${m.tableNote?`<div class="table-note" data-text data-module-field="tableNote" ${editable(edit,'')}>${field(m,'tableNote')}</div>`:''}</div>`;
 }
 if(m.type==='formula')content=`<div class="formula-parts" style="--cols:${cols}">${m.parts.map((p,i)=>{let math;try{math=formulaHTML(p.latex);}catch(error){math='<span class="formula-error">'+esc(error.message)+'</span>';}return `<section class="formula-card" data-shape><h3 data-text data-part="${i}" data-field="title" ${textStyle(p,'title')} ${editable(edit,'')}>${field(p,'title')}</h3><div class="formula-expression" data-formula-part="${i}" data-raster aria-label="双击修改 LaTeX">${math}</div><div class="paragraph" data-text data-part="${i}" data-field="text" ${textStyle(p,'text')} ${editable(edit,'')}>${field(p,'text')}</div></section>`;}).join('')}</div>`;
 if(m.type==='shape')content=`<div class="graphic-shape" data-shape style="background:var(--primary)"></div>`;
 return `<div class="module ${m.type}-module ${m.isToc?'toc-module':''} ${esc(m.role||'')}" data-module="${m.id}" style="left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px"><div class="module-content">${content}</div><span class="module-badge">${{text:'文字',media:'图像 / 视频',table:'表格',shape:'图形',formula:'公式',timeline:'时间轴'}[m.type]}</span></div>`;
}
export function renderSlide(s,theme,index,total,edit=false,project=null){
 if(s.referenceLayout)return renderReferenceLayout(s,theme,index,total,edit,themeCSS(theme),project);
 if(s.kind==='transition')return `<section class="slide transition-slide" data-slide="${s.id}" style="${themeCSS(theme)}"><div class="top-trim" data-shape></div><div class="transition-content"><div class="transition-number" data-text>${esc(s.section)}</div><div class="transition-rule" data-shape></div><h1 data-text data-slide-field="title" ${textStyle(s,'title')} ${editable(edit,'')}>${field(s,'title')}</h1><p data-text data-slide-field="lead" ${textStyle(s,'lead')} ${editable(edit,'')}>${field(s,'lead')}</p></div></section>`;
 if(s.kind==='cover'||s.kind==='closing')return `<section class="slide cover" data-slide="${s.id}" style="${themeCSS(theme)}"><div class="cover-logo">${theme.wordmark?`<img class="wordmark" data-image src="${esc(theme.wordmark)}" alt="校徽与校名">`:`<div class="wordmark-placeholder" data-text>校徽与校名</div>`}</div><div class="cover-band" data-shape><h1 data-text data-slide-field="title" ${textStyle(s,'title')} ${editable(edit,'')}>${field(s,'title')}</h1><p data-text data-slide-field="lead" ${textStyle(s,'lead')} ${editable(edit,'')}>${field(s,'lead')}</p></div><table class="cover-info">${[['presenter','汇报人'],['institute','学院'],['date','日期']].map(([k,n])=>`<tr><th data-text data-slide-field="${k}Label" ${editable(edit,'')}>${field(s,k+'Label',n)}</th><td data-text data-slide-field="${k}" ${textStyle(s,k)} ${editable(edit,'')}>${field(s,k)}</td></tr>`).join('')}</table></section>`;
 const content=`<div class="module-layer">${s.modules.map(m=>renderModule(m,edit)).join('')}</div>`;
 return `<section class="slide body-slide" data-slide="${s.id}" style="${themeCSS(theme)}"><div class="top-trim" data-shape></div><header class="slide-header"><div class="section-line"><span class="section-index" data-text data-shape data-slide-field="section" ${s.kind==='toc'||s.chapterId?'':editable(edit,'')}>${s.kind==='toc'?'目录':esc(s.section)}</span><span data-text data-slide-field="group" ${s.kind==='toc'||s.chapterId?'':editable(edit,'')}>${esc(s.kind==='toc'?'汇报概览':s.group)}</span></div><h2 data-text data-slide-field="title" ${textStyle(s,'title')} ${editable(edit,'')}>${field(s,'title')}</h2>${theme.logo?`<img class="slide-logo" data-image src="${esc(theme.logo)}" alt="校徽">`:`<div class="slide-logo logo-placeholder" data-text>校徽</div>`}<div class="header-rule" data-shape></div></header><div class="slide-lead" data-text data-slide-field="lead" ${textStyle(s,'lead')} ${editable(edit,'')}>${field(s,'lead')}</div>${content}${s.summary?`<div class="slide-summary" data-shape><div data-text data-slide-field="summary" ${textStyle(s,'summary')} ${editable(edit,'')}>${field(s,'summary')}</div></div>`:''}<footer class="slide-footer"><span data-text data-slide-field="footer" ${editable(edit,'')}>${field(s,'footer',theme.name+' · 科研汇报')}</span><span class="source" data-text data-slide-field="source" ${textStyle(s,'source')} ${editable(edit,'')}>${s.sourceUrl?`<a href="${/^(https?:\/\/|#slide-)/.test(s.sourceUrl)?esc(s.sourceUrl):'#'}" target="_blank" rel="noopener">${field(s,'source')}</a>`:esc(s.source)}</span><span data-text>${String(index+1).padStart(2,'0')} / ${total}</span><div class="footer-rule" data-shape></div></footer></section>`;
}
export function fitMedia(el){
 const scope=el.closest('.slide')||el,scale=scope.classList.contains('slide')?scope.getBoundingClientRect().width/W:1;
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
  if(!part.dataset.basePadding){const cs=getComputedStyle(part);part.dataset.basePadding=JSON.stringify([parseFloat(cs.paddingTop)||0,parseFloat(cs.paddingBottom)||0]);}
  const [top,bottom]=JSON.parse(part.dataset.basePadding);part.style.paddingTop=top+'px';part.style.paddingBottom=bottom+'px';
  const excess=Math.max(0,flowHeight(part)-part.clientHeight),reduceBottom=Math.min(excess,Math.max(0,bottom-4));
  part.style.paddingBottom=bottom-reduceBottom+'px';part.style.paddingTop=top-Math.min(Math.max(0,excess-reduceBottom),Math.max(0,top-4))+'px';
 }
 for(const part of el.querySelectorAll('.style-ribbon .text-part,.style-capsule .text-part,.style-arrow .text-part')){
  const wrap=part.querySelector('.part-title-wrap'),title=wrap?.querySelector('.part-title-text');if(!title)continue;
  const ps=getComputedStyle(part),ts=getComputedStyle(title),canvas=document.createElement('canvas').getContext('2d');canvas.font=`${ts.fontWeight} ${ts.fontSize} ${ts.fontFamily}`;
  const available=Math.max(0,part.clientWidth-parseFloat(ps.paddingLeft)-parseFloat(ps.paddingRight)),natural=Math.max(...title.textContent.split('\n').map(line=>canvas.measureText(line).width))+parseFloat(ts.paddingLeft)+parseFloat(ts.paddingRight)+2,preferred=(parseFloat(getComputedStyle(wrap).getPropertyValue('--title-width'))||65)/100*available;
  wrap.style.width=Math.min(available,Math.max(preferred,natural))+'px';
 }
 fitMedia(el);
 const table=el.querySelector('.data-table');if(!table)return;
 const wrap=table.parentElement;
 for(const pt of (table.classList.contains('reference-table')?[12,11,10,8]:[14,12,11,10,8])){table.style.fontSize=`${pt/0.6}px`;table.style.setProperty('--cell-pad',`${table.hasAttribute('data-cell-padding')&&table.dataset.cellPadding!==''?Number(table.dataset.cellPadding):Math.max(3,pt-7)}px`);if(wrap.scrollHeight<=wrap.clientHeight+1&&table.scrollWidth<=wrap.clientWidth+1)break;}
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
 if(m.type==='table')return flowHeight(el.querySelector('.table-wrap'));
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
 const errors=[];if(model.referenceLayout){const footer=slideEl.querySelector('.slide-footer')?.getBoundingClientRect();for(const table of slideEl.querySelectorAll('table'))if(footer&&table.getBoundingClientRect().bottom>footer.top+2)errors.push('表格进入页脚区域，请减小行高或拆页。');for(const node of slideEl.querySelectorAll('[data-slide-field],.formula-card,.math-expression')){if(node.scrollHeight>node.clientHeight+3||node.scrollWidth>node.clientWidth+3)errors.push('文字超出原版式区域，请删改或调整行距。');}return errors;}if(model.kind==='transition'){const content=slideEl.querySelector('.transition-content'),title=content.querySelector('h1');if(title.scrollWidth>title.clientWidth+2)errors.push('\u8fc7\u6e21\u9875\u6807\u9898\u4e0d\u5141\u8bb8\u81ea\u52a8\u6362\u884c\uff0c\u8bf7\u7cbe\u7b80\u6216\u6309\u8bed\u4e49\u624b\u52a8\u5206\u884c\u3002');if(content.scrollHeight>content.clientHeight+2)errors.push('过渡页文字过长，请精简。');return errors;}
 if(model.kind==='cover'||model.kind==='closing'){const band=slideEl.querySelector('.cover-band');if(band.scrollHeight>band.clientHeight+2)errors.push('封面标题过长，请精简或手动分成两行。');const info=slideEl.querySelector('.cover-info');if(info.offsetTop+info.offsetHeight>880)errors.push('署名内容过长，请精简。');return errors;}
 const heading=slideEl.querySelector('h2');if(heading.scrollHeight>heading.clientHeight+2)errors.push('页面标题过长，请精简。');
 const lead=slideEl.querySelector('.slide-lead'),contentTop=Math.max(SAFE.y,model.modules.length?Math.min(...model.modules.map(m=>m.y)):SAFE.y);if(lead.offsetTop+lead.scrollHeight>contentTop-16)errors.push('页首句过长：请精简或分成其他页面。');
 const summary=slideEl.querySelector('.slide-summary');if(summary&&summary.scrollHeight>summary.clientHeight+2)errors.push('页尾总结过长，请精简为一行。');
 for(const m of model.modules){
  if(model.summary&&m.y+m.h>750+.1)errors.push('模块进入页尾总结区域，请缩小或上移。');
  const el=slideEl.querySelector(`[data-module="${m.id}"]`);if(!el)continue;fitTable(el);const target=m.type==='table'?el.querySelector('.table-wrap'):el.querySelector('.module-content');
  const clippedPart=m.type==='text'&&[...el.querySelectorAll('.text-part')].some(part=>flowHeight(part)>part.getBoundingClientRect().height/(el.getBoundingClientRect().width/(el.offsetWidth||1)||1)+2);
  const formulaBad=m.type==='formula'&&[...el.querySelectorAll('.formula-card')].some(c=>c.scrollHeight>c.clientHeight+2||c.querySelector('.formula-expression').scrollWidth>c.querySelector('.formula-expression').clientWidth+2||c.querySelector('.formula-error'));
  const horizontalText=m.type==='text'&&[...el.querySelectorAll('.part-title-text,.paragraph')].some(n=>n.scrollWidth>n.clientWidth+2);
  const overflow=horizontalText||formulaBad||target.scrollHeight>target.clientHeight+2||target.scrollWidth>target.clientWidth+2||measuredHeight(el,m)>m.h+2||clippedPart;
  el.classList.toggle('overflowing',overflow);if(overflow)errors.push(`${m.id}：内容溢出，请删改或扩大模块。`);
 }
 return errors;
}
