import {richHTML,textStyle} from './rich-text.js';
// Canonical IDs keep projects saved before the A/B/C specification compatible.
export const TEXT_STYLES=[
 ['plain','默认','白底分段','标题与正文分层，子区域之间用细线区分'],
 ['unified','A1','一体浅底','同一块浅底，内部细线分隔'],
 ['cards','A2','分立浅卡','独立浅底卡片，卡片之间保留间隙'],
 ['band','A3','深底标题','浅底卡片搭配深底白字标题'],
 ['ribbon','B1','折角飘带','可调长平行四边形标题、折角与渐变阴影边框'],
 ['capsule','B2','圆角圆点','深色圆角标题居中，叠加白色圆形，正文白底'],
 ['arrow','B3','五角箭头','可调长五角箭头标题、渐变阴影边框'],
 ['note','C1','无标题备注','浅底左侧色条，竖向分隔备注'],
 ['group','C2','组合分组','可调长模块大标题，内部仅用无底色默认分组'],
 ['numbered','C3','序号标题','45° 梯形序号、正文加粗子标题及 14pt 注释']
];
export const styleInfo=id=>TEXT_STYLES.find(s=>s[0]===id)||TEXT_STYLES[0];
export function textModuleHTML(m,{esc,editable,textBody,edit}){
 const style=styleInfo(m.style)[0],cols=Math.max(1,Math.min(m.columns||m.parts.length,m.parts.length));
 const percent=Math.max(1,Math.min(100,Number(m.headerWidth)||(['capsule','group'].includes(style)?90:65)));
 const groupId='decor-'+String(m.id).replace(/[^\w-]/g,'');
 const box=(id,top=22,left=8)=>`<svg class="text-box-decoration" data-decoration aria-hidden="true" width="100%" height="100%"><defs><linearGradient id="${id}-line" x1="0" y1="0" x2="100%" y2="100%"><stop stop-color="var(--primary)" stop-opacity=".24"/><stop offset="1" stop-color="var(--primary)"/></linearGradient><filter id="${id}-shadow" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="var(--primary)" flood-opacity=".28"/></filter></defs><rect x="${left}" y="${top}" width="calc(100% - ${left+10}px)" height="calc(100% - ${top+10}px)" fill="white" stroke="url(#${id}-line)" stroke-width="2" filter="url(#${id}-shadow)"/></svg>`;
 const decoration=(kind)=>{
  if(kind==='ribbon')return `<svg class="title-decoration ribbon-face" data-decoration aria-hidden="true"><rect width="100%" height="100%" fill="var(--primary)"/></svg><svg class="ribbon-fold" viewBox="0 0 14 18" data-decoration aria-hidden="true"><path d="M0 0H14V18Z" fill="var(--primary)"/><path d="M0 0H14V18Z" fill="black" opacity=".45"/></svg>`;
  if(kind==='capsule')return `<svg class="title-decoration" data-decoration aria-hidden="true"><rect width="100%" height="100%" rx="32" fill="var(--primary)"/><circle cx="26" cy="50%" r="12" fill="white"/></svg>`;
  if(kind==='arrow')return `<svg class="title-decoration arrow-face" data-decoration aria-hidden="true"><rect width="100%" height="100%" fill="var(--primary)"/></svg>`;
  if(kind==='group')return `<svg class="title-decoration group-face" data-decoration aria-hidden="true"><rect width="100%" height="100%" fill="var(--primary)"/><path d="M0 34H20V68Z" fill="var(--tint)"/><svg x="calc(100% - 20px)" y="50%" width="20" height="50%" viewBox="0 0 20 34" preserveAspectRatio="none"><path d="M0 0H20L0 34Z" fill="var(--tint)"/></svg></svg>`;
  return '';
 };
 const titleText=(p,i)=>{const tag=m.isToc&&p.chapterId?'a':'h3',label=m.isToc&&p.chapterNumber&&style!=='numbered'?p.chapterNumber+' '+p.title:p.title;return `<${tag} class="part-title-text ${m.isToc?'toc-title':''}" data-text data-part="${i}" data-field="title" ${textStyle(p,'title')} ${tag==='a'?`data-jump="${p.targetIndex}" data-target-index="${p.targetIndex}" href="#slide-${p.chapterId}"`:editable(edit,'')}>${richHTML(label,p.rich?.title)}</${tag}>`;};
 const title=(p,i,kind=style)=>`<div class="part-title-wrap">${decoration(kind)}${titleText(p,i)}</div>`;
 function parts(innerStyle=style){
  return m.parts.map((p,i)=>{
   const row=Math.floor(i/cols),col=i%cols,lastRow=Math.floor((m.parts.length-1)/cols);
   const separators=['plain','unified'].includes(innerStyle)?`${row<lastRow?'<span class="part-divider horizontal" data-shape></span>':''}${col<cols-1&&i<m.parts.length-1?'<span class="part-divider vertical" data-shape></span>':''}`:'';
   // Ribbon starts at x=8; its 14px fold ends at x=22, which is also the box edge.
   const backdrop=['ribbon','arrow'].includes(innerStyle)?box(groupId+'-'+i,22,innerStyle==='ribbon'?22:8):'';
   let heading=innerStyle==='note'?'':innerStyle==='numbered'?`<div class="numbered-heading"><div class="number-tag"><svg class="number-decoration number-decoration-back" data-decoration aria-hidden="true"><rect width="100%" height="100%" fill="var(--primary)" opacity=".16"/></svg><svg class="number-decoration number-decoration-front" data-decoration aria-hidden="true"><rect width="100%" height="100%" fill="var(--primary)"/></svg><span data-text class="number-value">${String(m.isToc?p.chapterNumber||i+1:(Number(m.numberStart)||1)+i).padStart(2,'0')}</span></div>${titleText(p,i)}<span class="number-rule" data-shape></span></div>`:title(p,i,innerStyle);
   const extras=innerStyle==='numbered'||m.preserveExtras?`${p.showSubheading&&p.subheading?`<div class="part-subheading" data-text data-part="${i}" data-field="subheading" ${textStyle(p,'subheading')} ${editable(edit,'')}>${richHTML(p.subheading,p.rich?.subheading)}</div>`:''}${p.showAnnotation&&p.annotation?`<div class="part-annotation" data-text data-part="${i}" data-field="annotation" ${textStyle(p,'annotation')} ${editable(edit,'')}>${richHTML(p.annotation,p.rich?.annotation)}</div>`:''}`:'';
   return `<section class="text-part" data-shape>${backdrop}${innerStyle==='note'?'<span class="note-rule" data-shape></span>':''}${heading}${textBody(p,i,edit)}${extras}${p.takeaway?`<div class="part-takeaway" data-text data-part="${i}" data-field="takeaway" ${editable(edit,'')}>${richHTML(p.takeaway,p.rich?.takeaway)}</div>`:''}${separators}${m.isToc&&p.showPageRange?`<span class="toc-page-range" data-text>p. ${esc(p.pageRange)}</span>`:''}</section>`;
  }).join('');
 }
 const styleAttrs=`--cols:${cols};--title-width:${percent}%`;
 if(style==='group'){
  const inner='plain';
  return `<div class="text-group-shell" style="${styleAttrs}">${box(groupId+'-group',30)}<div class="module-group-title part-title-wrap">${decoration('group')}<h3 class="part-title-text" data-text data-module-field="groupTitle" ${textStyle(m,'groupTitle')} ${editable(edit,'')}>${richHTML(m.groupTitle||'模块大标题',m.rich?.groupTitle)}</h3></div><div data-shape class="text-parts style-${inner} group-inner" style="--cols:${cols}">${parts(inner)}</div></div>`;
 }
 return `<div data-shape class="text-parts style-${style}" style="${styleAttrs}">${parts()}</div>`;
}
