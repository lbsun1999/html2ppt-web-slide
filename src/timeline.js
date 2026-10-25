import layouts from './reference-layouts.json' with {type:'json'};
import {moduleOf,timelinePart} from './model.js';
import {richHTML,textStyle} from './rich-text.js';

// Migrate a fixed history page without resetting its edited text or page metadata.
export function modularizeHistory(s,assets={}){
 if(s.referenceLayout!=='history')return s;
 const fallback=[...layouts.history.html.matchAll(/<img\b[^>]*>/g)].filter(m=>/history-image/.test(m[0])).map(m=>m[0].match(/src="([^"]+)"/)?.[1]);
 const names=['1952Beike.jpg','1960Beike.png','1988Beike.png','2008Beike.png'];
 const m=moduleOf('timeline',{x:58,y:306,w:1484,h:508},4);m.schoolHistory=true;
 m.parts=names.map((name,i)=>{
  const im=assets[name],src=s.referenceImages?.[i]||im?.src||fallback[i];
  const p={...timelinePart(i),year:s['legacy_'+(4+i*2)]??layouts.history.fields['legacy_'+(4+i*2)],title:s['legacy_'+(12+i)]??layouts.history.fields['legacy_'+(12+i)],text:s['legacy_'+(5+i*2)]??layouts.history.fields['legacy_'+(5+i*2)]};
  for(const key of ['rich','paragraphs','lineSpacing','fontSizes'])for(const [to,from] of [['year',4+i*2],['title',12+i],['text',5+i*2]])if(s[key]?.['legacy_'+from]!==undefined)(p[key]??={})[to]=structuredClone(s[key]['legacy_'+from]);
  if(src)p.asset={kind:'image',name,src,ratio:16/9,naturalRatio:im?.width/im?.height||16/9,fit:'cover',zoom:1,cx:50,cy:50};
  return p;
 });
 s.modules=[m];delete s.referenceLayout;delete s.referenceImages;
 for(const key of Object.keys(s))if(/^legacy_\d+$/.test(key)){delete s[key];for(const format of ['rich','paragraphs','lineSpacing','fontSizes'])if(s[format])delete s[format][key];}
 return s;
}

export function timelineHTML(m,{esc,edit}){
 const n=m.parts.length;
 const field=(p,i,key)=>`data-text data-part="${i}" data-field="${key}" ${textStyle(p,key)} ${edit?'contenteditable="true" spellcheck="false"':''}`;
 const value=(p,key)=>richHTML(p[key],p.rich?.[key],false,!!p.paragraphs?.[key]?.length,undefined,p.paragraphs?.[key]);
 const hide=m.hideTimeline;
 const gridClass=`timeline-grid${hide?' hide-timeline':''}`;
 const arrowSVG=hide?'':`<svg class="timeline-arrow" data-decoration viewBox="0 0 1484 62" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H1446L1484 31L1446 62H0Z" fill="var(--tint)"/><path d="M0 0H1446L1484 31L1446 62H0Z" fill="var(--primary)" opacity=".08"/></svg>`;
 return `<div class="${gridClass}" style="--stages:${n}">${arrowSVG}${m.parts.map((p,i)=>{
  const lineSVG=hide?'':`<svg class="timeline-line" data-decoration viewBox="0 0 4 100" preserveAspectRatio="none" aria-hidden="true"><path d="M2 0V100" stroke="var(--stage-color)" stroke-width="2"/></svg>`;
  const dotSVG=hide?'':`<svg class="timeline-dot" data-decoration viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="white" stroke="var(--stage-color)" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="var(--stage-color)"/></svg>`;
  const eventHTML=hide?'':`<div class="timeline-event"><div class="timeline-event-title" ${field(p,i,'title')}>${value(p,'title')}</div></div>`;
  return `<section class="timeline-stage" style="--stage-color:var(--primary)"><div class="timeline-card" data-shape><div class="timeline-year" data-shape><div ${field(p,i,'year')}>${value(p,'year')}</div></div><div class="media-window timeline-media ${p.asset?'has-asset':''}" data-media-part="${i}" title="双击替换照片或视频"><div class="media-crop">${p.asset?`<${p.asset.kind==='video'?'video controls preload="metadata" muted playsinline':'img'} src="${esc(p.asset.src)}" alt="${esc(p.title)}" style="object-fit:${p.asset.fit||'cover'};object-position:${p.asset.cx??50}% ${p.asset.cy??50}%;transform:scale(${p.asset.zoom||1});transform-origin:${p.asset.cx??50}% ${p.asset.cy??50}%"></${p.asset.kind==='video'?'video':'img'}>`:'<div class="timeline-placeholder" data-text>＋ 照片 / 视频<br>双击替换媒体</div>'}</div></div><div class="timeline-copy" ${field(p,i,'text')}>${value(p,'text')}</div></div>${eventHTML}${lineSVG}${dotSVG}</section>`;
 }).join('')}</div>`;
}

export function fitTimeline(el){
 const grid=el.querySelector('.timeline-grid');if(!grid)return;
 const stages=[...grid.querySelectorAll('.timeline-stage')],width=grid.clientWidth,n=stages.length;
 const hide=grid.classList.contains('hide-timeline');
 const padX=hide?32:64;
 const bottomGap=hide?0:78;
 const cardWidth=(width-padX-Math.max(0,n-1)*16)/n,preferred=Math.min(190,Math.max(90,(cardWidth-32)/2.05));
 grid.style.setProperty('--timeline-media-height',preferred+'px');
 const copies=stages.map(s=>s.querySelector('.timeline-copy'));
 grid.style.setProperty('--timeline-year-height','0px');
 const yearHeight=Math.max(...stages.map(s=>s.querySelector('.timeline-year').offsetHeight));
 grid.style.setProperty('--timeline-year-height',yearHeight+'px');
 const textHeight=Math.max(...copies.map(copyHeight));
 const available=grid.clientHeight-bottomGap-yearHeight-32-textHeight;
 grid.style.setProperty('--timeline-media-height',Math.max(72,Math.min(preferred,available))+'px');
}

export function timelineHeight(el){
 const grid=el.querySelector('.timeline-grid');if(!grid)return 0;
 const hide=grid.classList.contains('hide-timeline');
 const bottomGap=hide?32:78;
 return Math.max(...[...grid.querySelectorAll('.timeline-stage')].map(s=>s.querySelector('.timeline-year').offsetHeight+copyHeight(s.querySelector('.timeline-copy'))+72+32+bottomGap));
}
function copyHeight(el){const range=document.createRange();range.selectNodeContents(el);const scale=el.getBoundingClientRect().width/(el.offsetWidth||1)||1;return range.getBoundingClientRect().height/scale+15;}
