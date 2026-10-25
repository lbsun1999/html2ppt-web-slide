import {clone,createProject,makePage,blankSlide,moduleOf,SAFE,validateProject,documentSections} from './model.js';
import {duplicatePages} from './page-operations.js';

export const OUTLINE_EXAMPLE='# 研究进展汇报\n\n## 问题背景与意义\n### 研究问题与应用场景\n### 现有方法与关键不足\n\n## 方法与实验\n### 方法框架与参数更新\n这里可以补充本页需要使用的材料，生成后保存在备注中。\n### 对照实验与结果分析\n\n## 总结与计划\n### 阶段结论与后续工作\n\n## 附录\n### 参考文献\n';
const headingText=s=>s.replace(/\s+#+\s*$/,'').trim().replace(/<br\s*\/?>|\\n/gi,'\n');
export function parseOutline(input){
 const text=String(input??'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n'),result={title:'',intro:'',sections:[],errors:[],warnings:[]};
 let section=null,page=null,fence=null;
 for(const [index,line]of text.split('\n').entries()){
  const start=line.match(/^\s{0,3}(`{3,}|~{3,})/);
  if(start){if(!fence)fence={char:start[1][0],length:start[1].length};else if(start[1][0]===fence.char&&start[1].length>=fence.length)fence=null;if(page)page.body+=line+'\n';continue;}
  if(fence){if(page)page.body+=line+'\n';continue;}
  const match=line.match(/^\s{0,3}(#{1,6})(?!#)\s*(.*?)\s*$/);
  if(!match||match[1].length>3){const owner=page||section;if(owner)owner.body+=line+'\n';else result.intro+=line+'\n';continue;}
  const level=match[1].length,value=headingText(match[2]),at=index+1;if(!value){result.errors.push(`第${at}行的标题为空。`);continue;}
  if(level===1){if(result.title)result.errors.push(`第${at}行：总标题只能有一个，请用##或###表示章节与页面。`);else result.title=value;section=null;page=null;}
  if(level===2){if(!result.title)result.errors.push(`第${at}行：请先写#总标题。`);section={title:value,body:'',pages:[],line:at,key:'chapter-'+result.sections.length};result.sections.push(section);page=null;}
  if(level===3){if(!section){result.errors.push(`第${at}行：页面标题前需要有##章节标题。`);continue;}page={title:value,body:'',line:at,key:section.key+'-page-'+section.pages.length};section.pages.push(page);}
 }
 if(!result.title)result.errors.push('缺少#总标题。');
 if(!result.sections.length)result.errors.push('至少需要一个##章节。');
 if(!result.sections.some(s=>s.pages.length))result.errors.push('至少需要一个###页面标题。');
 if(fence)result.errors.push('代码围栏未结束，请补上对应的```或~~~。');
 for(const s of result.sections){s.body=s.body.trim();if(!s.pages.length)result.errors.push('章节“'+s.title+'”尚未列出###页面。');for(const p of s.pages)p.body=p.body.trim();}
 result.intro=result.intro.trim();return result;
}

export function decodeOutline(buffer){
 const bytes=new Uint8Array(buffer);let encoding='utf-8';
 if(bytes[0]===0xff&&bytes[1]===0xfe)encoding='utf-16le';else if(bytes[0]===0xfe&&bytes[1]===0xff)encoding='utf-16be';
 try{return new TextDecoder(encoding,{fatal:true}).decode(bytes);}catch{throw Error('文件编码无法识别，请另存为UTF-8，或直接复制文字到输入框。');}
}
export function outlineIsAppendix(outline,section,{lastAppendix,chapters={}}={}){
 if(outline.sections.at(-1)===section&&typeof lastAppendix==='boolean')return lastAppendix;
 return /^(附录|appendix)/i.test(section.title)||chapters[section.key]?.section==='附录';
}
export function outlinePageCount(outline,{toc=true,closing=true,transitions=true,lastAppendix,chapters={},preserveTransitions=false}={}){
 return 1+Number(toc)+Number(closing)+outline.sections.reduce((n,s)=>n+s.pages.length+Number(!outlineIsAppendix(outline,s,{lastAppendix,chapters})&&!chapters[s.key]?.prelude&&(preserveTransitions&&chapters[s.key]?!!chapters[s.key].transitionId:transitions)),0);
}
export function outlineMatches(project,title){return project.slides.filter(s=>s.kind==='body'&&s.title===title);}
export function describeCurrentOutline(project){
 const groups=[];let active;
 for(const s of project.slides){
  if(s.kind==='transition'){active={title:s.title,pages:[],source:s};groups.push(active);}
  if(s.kind!=='body')continue;
  if(!active||s.chapterMode==='manual'&&active.title!==s.group||s.chapterId&&active.source?.id!==s.chapterId||!s.chapterId&&s.group&&active.title!==s.group){active={title:s.group||'未分章内容',pages:[],source:null,first:s};groups.push(active);}
  active.pages.push(s);
 }
 const text=['# '+(project.slides.find(s=>s.kind==='cover')?.title||project.title).replace(/\n/g,'<br>'),...groups.flatMap(g=>['','## '+g.title.replace(/\n/g,'<br>'),...g.pages.map(s=>'### '+s.title.replace(/\n/g,'<br>'))])].join('\n'),parsed=parseOutline(text),bindings={},chapters={};
 parsed.sections.forEach((s,i)=>{const group=groups[i];chapters[s.key]={id:group.source?.id||group.first?.id,transitionId:group.source?.id||null,section:group.source?.section||group.first?.section,prelude:!group.source&&group.first?.section==='00'};s.pages.forEach((p,j)=>bindings[p.key]=group.pages[j].id);});
 return {text,parsed,bindings,chapters};
}
// Exact headings track reordered items; remaining rows track renames by position.
export function reconcileOutlineBindings(previous,next,values,chapters=false){
 const items=o=>chapters?o.sections:o.sections.flatMap(s=>s.pages),old=items(previous),fresh=items(next),out={},used=new Set();
 for(const item of fresh){const matches=old.filter(p=>p.title===item.title);if(matches.length===1&&matches[0].key in values){out[item.key]=values[matches[0].key];used.add(matches[0].key);}}
 for(const item of fresh)if(!(item.key in out)){const prior=old.find(p=>p.key===item.key&&!used.has(p.key));if(prior&&prior.key in values){out[item.key]=values[prior.key];used.add(prior.key);}}
 return out;
}
function newContent(title){
 const s=blankSlide();s.title=title;s.lead='';s.source='大纲草稿 · 请补充真实材料';
 const m=moduleOf('text',{...SAFE},2);m.style='cards';m.columns=2;
 Object.assign(m.parts[0],{title:'本页要回答的问题',text:'明确本页的核心问题与判断依据。\n补充背景、条件和必要的术语说明。',bullet:true});
 Object.assign(m.parts[1],{title:'证据与来源',text:'添加实际图表、公式、数据或文献。\n区分已有结论、待验证假设和后续计划。',bullet:true});
 s.modules=[m];return s;
}
export function buildOutlineProject(current,outline,{toc=true,closing=true,transitions=true,lastAppendix,reuse={},sourceText=''}={}){
 if(outline.errors.length)throw Error(outline.errors.join('\n'));
 if(outlinePageCount(outline,{toc,closing,transitions,lastAppendix})>100)throw Error('生成后超过100页，请精简大纲或分成多份文稿。');
 const next=createProject({withSections:false});next.title=outline.title.replace(/\n/g,' ').replace(/[<>:"/\\|?*]/g,' ').trim()||'大纲文稿';next.theme=clone(current.theme);next.grid=current.grid;next.slides=[];
 const ids=new Map(),take=(original,fallback)=>{const s=original?duplicatePages([original])[0]:fallback();if(original&&!ids.has(original.id))ids.set(original.id,s.id);return s;};
 const cover=take(current.slides.find(s=>s.kind==='cover'),()=>makePage('cover')),intro=outline.intro.split('\n').find(s=>s.trim())||'';cover.title=outline.title;cover.lead=intro.length<=80?intro:'';cover.notes=[outline.intro,cover.notes].filter(Boolean).join('\n\n');next.slides.push(cover);
 let contents;
 if(toc){contents=take(current.slides.find(s=>s.kind==='toc'),()=>makePage('toc'));Object.assign(contents,{title:'汇报目录',lead:'',tocNotes:{},tocRich:{},tocExtras:[],tocExcluded:[],tocIncludeAppendix:false});next.slides.push(contents);}
 const chapterNotes=new Map();let number=0,reused=0;
 for(const section of outline.sections){
  const appendix=outlineIsAppendix(outline,section,{lastAppendix}),sectionNumber=appendix?'附录':String(++number).padStart(2,'0');
  let chapter;
  if(transitions&&!appendix){
   const matches=current.slides.filter(s=>s.kind==='transition'&&s.title===section.title);
   chapter=take(matches.length===1?matches[0]:null,()=>makePage('transition'));chapter.title=section.title;chapter.lead='';chapter.notes=[section.body,chapter.notes].filter(Boolean).join('\n\n');next.slides.push(chapter);
  }
  for(const page of section.pages){
   const original=current.slides.find(s=>s.id===reuse[page.key]&&s.kind==='body');
   const s=take(original,()=>newContent(page.title));if(original)reused++;
   s.title=page.title;s.lead=original?s.lead:'';delete s.chapterId;delete s.chapterMode;
   if(!chapter){s.chapterMode='manual';s.section=sectionNumber;s.group=section.title;}
   s.outlineDraft=true;s.notes=['【大纲草稿】已按大纲建立页面题目及章节，正文仍需按真实材料加工。',original?'本页复制了现有版式和内容；请核对正文、图表、引用与新题目是否一致。':'本页为结构占位，尚未填写实际研究结论。',!chapter&&page===section.pages[0]?section.body:'',page.body,s.notes].filter(Boolean).join('\n\n');
   next.slides.push(s);if(!chapter)chapterNotes.set(s.id,section.body);
  }
  if(chapter)chapterNotes.set(chapter.id,section.body);
 }
 if(closing){const end=take(current.slides.find(s=>s.kind==='closing'),()=>makePage('closing'));next.slides.push(end);}
 const remap=value=>{
  if(typeof value==='string')return value.replace(/#slide-([\w-]+)/g,(all,id)=>ids.has(id)?'#slide-'+ids.get(id):all);
  if(Array.isArray(value))return value.map(remap);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,remap(v)]));return value;
 };
 next.slides=remap(next.slides);next.outline={format:'hash-outline-v1',status:'structure-confirmed',text:sourceText};
 validateProject(next);
 if(contents){const actual=next.slides.find(s=>s.id===contents.id);for(const chapter of documentSections(next)){const body=chapterNotes.get(chapter.id)||'',first=body.split('\n').find(s=>s.trim());if(first&&first.length<=70)actual.tocNotes[chapter.id]=first;}validateProject(next);}
 return {project:next,reused,created:outline.sections.reduce((n,s)=>n+s.pages.length,0)-reused};
}

export function updateProjectOutline(current,outline,{toc=true,closing=true,transitions=true,lastAppendix,reuse={},chapters={},preserveTransitions=true,sourceText=''}={}){
 if(outline.errors.length)throw Error(outline.errors.join('\n'));
 const next=clone(current),result=[],used=new Set(),take=(source,factory)=>{if(!source)return factory();if(used.has(source.id))return duplicatePages([source])[0];used.add(source.id);return clone(source);};
 const cover=current.slides.find(s=>s.kind==='cover');if(cover){const copy=take(cover);copy.title=outline.title;result.push(copy);}else next.title=outline.title.replace(/\n/g,' ');
 let sequence=0,reused=0,created=0;const sectionNotes=new Map();
 for(const section of outline.sections){
  const binding=chapters[section.key],appendix=outlineIsAppendix(outline,section,{lastAppendix,chapters}),prelude=binding?.prelude&&!appendix,original=current.slides.find(s=>s.id===binding?.transitionId&&s.kind==='transition');
  const showTransition=!appendix&&!prelude&&(binding&&preserveTransitions?!!original:transitions),number=appendix?'附录':prelude?'00':String(++sequence).padStart(2,'0');
  let chapter;
  if(showTransition){chapter=take(original,()=>makePage('transition'));chapter.title=section.title;if(section.body)chapter.notes=[chapter.notes,'【大纲补充】\n'+section.body].filter(Boolean).join('\n\n');result.push(chapter);}
  let first;
  for(const page of section.pages){
   const source=current.slides.find(s=>s.id===reuse[page.key]&&s.kind==='body'),s=take(source,()=>newContent(page.title));
   if(source)reused++;else{created++;s.outlineDraft=true;}
   s.title=page.title;delete s.chapterId;if(s.chapterMode==='manual'||!chapter)delete s.chapterMode;
   if(!chapter){if(!prelude)s.chapterMode='manual';s.section=number;s.group=section.title;}
   if(page.body)s.notes=[s.notes,'【大纲补充】\n'+page.body].filter(Boolean).join('\n\n');
   if(!first){first=s;if(!chapter&&section.body)s.notes=[s.notes,'【章节补充】\n'+section.body].filter(Boolean).join('\n\n');}
   result.push(s);
  }
  if(chapter||first)sectionNotes.set(chapter?.id||first.id,section.body);
 }
 if(toc){
  const original=current.slides.find(s=>s.kind==='toc'),contents=take(original,()=>makePage('toc'));
  const before=current.slides.slice(0,current.slides.indexOf(original)).reverse(),previous=before.find(s=>result.some(n=>n.id===s.id));
  const at=previous?result.findIndex(s=>s.id===previous.id)+1:cover?1:0;result.splice(at,0,contents);
 }
 if(closing)result.push(take(current.slides.find(s=>s.kind==='closing'),()=>makePage('closing')));
 if(result.length>100)throw Error('应用后超过100页，请精简大纲或拆分文稿。');
 next.slides=result;next.outline={format:'hash-outline-v1',status:'structure-confirmed',text:sourceText};validateProject(next);
 const contents=next.slides.find(s=>s.kind==='toc');if(contents){for(const [id,body]of sectionNotes){const line=body.split('\n').find(s=>s.trim());if(line&&line.length<=70)(contents.tocNotes??={})[id]=line;}validateProject(next);}
 return {project:next,reused,created,removed:current.slides.filter(s=>!result.some(n=>n.id===s.id)).length};
}
