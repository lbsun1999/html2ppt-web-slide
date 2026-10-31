import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createProject,documentSections} from '../src/model.js';
import fs from 'node:fs';
import {parseOutline,decodeOutline,buildOutlineProject,outlinePageCount,describeCurrentOutline,updateProjectOutline,reconcileOutlineBindings} from '../src/outline.js';

test('hash outline preserves chapter order, manual title breaks and per-page notes',()=>{
 const o=parseOutline('\uFEFF# 总标题\r\n## 问题背景\r\n### 页面一<br>第二行\r\n材料说明\r\n```txt\r\n# 代码里的标题\r\n```\r\n## 附录\r\n### 参考资料');
 assert.deepEqual(o.errors,[]);assert.equal(o.title,'总标题');assert.equal(o.sections.length,2);assert.equal(o.sections[0].pages[0].title,'页面一\n第二行');assert.match(o.sections[0].pages[0].body,/# 代码里的标题/);
 assert.equal(outlinePageCount(o),6);
});
test('invalid hierarchy, extra document heading and unfinished fence are reported',()=>{
 for(const text of ['### 无章节页面','# 总标题\n## 空章','# 一\n# 二\n## 章\n### 页','# 一\n## 章\n### 页\n```','# 总标题\n## 章\n### '])assert.ok(parseOutline(text).errors.length,text);
});
test('UTF-8 and UTF-16 files decode without corrupting Chinese headings',()=>{
 const text='# 科研汇报\n## 研究方法\n### 参数更新';
 assert.equal(decodeOutline(Buffer.from(text,'utf8')),text);
 assert.equal(decodeOutline(Buffer.concat([Buffer.from([0xff,0xfe]),Buffer.from(text,'utf16le')])),text);
 assert.throws(()=>decodeOutline(new Uint8Array([0xff,0,0xff])),/UTF-8/);
});
test('reuse copies authored content, formatting and positions; source is unchanged',()=>{
 const current=createProject({withSections:false}),source=current.slides[1];source.notes='原有讲解备注';source.modules[0].parts[0].rich={text:[{text:source.modules[0].parts[0].text,bold:true,color:'#A31418'}]};
 const before=structuredClone(current),o=parseOutline('# 新课题\n## 研究方法\n### 方法分析\n本页用户材料\n### 方案复用\n## 附录\n### 补充材料');
 const reuse=Object.fromEntries(o.sections[0].pages.map(page=>[page.key,source.id]));
 const {project,reused}=buildOutlineProject(current,o,{reuse,sourceText:'原始大纲'});
 assert.deepEqual(current,before);assert.equal(reused,2);assert.equal(project.slides.length,7);
 const copies=project.slides.filter(s=>['方法分析','方案复用'].includes(s.title));assert.equal(new Set(copies.map(s=>s.id)).size,2);
 for(const s of copies){assert.notEqual(s.id,source.id);assert.deepEqual(s.modules[0].parts,source.modules[0].parts);assert.equal(s.modules[0].x,source.modules[0].x);assert.equal(s.modules[0].w,source.modules[0].w);assert.equal(s.group,'研究方法');assert.equal(s.notes,'原有讲解备注');assert.ok(s.outlineDraft);}
 assert.equal(copies[0].lead,'本页用户材料');assert.equal(documentSections(project).length,1);assert.equal(project.slides.find(s=>s.title==='补充材料').section,'附录');assert.equal(project.outline.status,'structure-confirmed');
});
test('manual chapters work without transition pages and retain TOC numbering',()=>{
 const o=parseOutline('# 总标题\n## 背景\n### 问题\n## 方法\n### 模型'),{project}=buildOutlineProject(createProject(),o,{transitions:false,closing:false});
 assert.equal(project.slides.length,4);assert.equal(project.slides.filter(s=>s.kind==='transition').length,0);assert.deepEqual(documentSections(project).map(s=>s.number),['01','02']);
});
test('page limit rejects an oversized outline before building a document',()=>{
 const o=parseOutline('# 大纲\n## 章节\n'+Array.from({length:100},(_,i)=>'### 页面'+i).join('\n'));
 assert.throws(()=>buildOutlineProject(createProject(),o),/100页/);
});
test('outline body paragraphs become lead and summary while quote blocks become notes',()=>{
 const o=parseOutline('# 新文稿\n## 章节\n### 待制作页面\n第一段作为页首句。\n\n第二段作为页尾总结。\n\n> 核对数据来源。\n> 提醒 AI 保留术语。'),{project}=buildOutlineProject(createProject(),o);const s=project.slides.find(s=>s.kind==='body');assert.deepEqual(s.modules,[]);assert.equal(s.lead,'第一段作为页首句。');assert.equal(s.summary,'第二段作为页尾总结。');assert.equal(s.source,'');assert.match(s.notes,/核对数据来源。\n提醒 AI 保留术语。/);assert.equal(s.title,'待制作页面');
});
test('outline content updates only fields explicitly supplied for an existing page',()=>{
 const current=createProject(),described=describeCurrentOutline(current),body=current.slides.find(s=>s.kind==='body'),next=parseOutline(`# ${current.title}\n## ${body.group}\n### ${body.title}\n新的页首句\n\n新的页尾句\n\n> 新的讲解备注`),reuse={[next.sections[0].pages[0].key]:body.id};
 const {project}=updateProjectOutline(current,next,{reuse,transitions:false,toc:false,closing:false}),updated=project.slides.find(s=>s.kind==='body');assert.equal(updated.lead,'新的页首句');assert.equal(updated.summary,'新的页尾句');assert.match(updated.notes,/新的讲解备注/);assert.deepEqual(updated.modules,body.modules);
});
test('empty outline payload preserves copied page content, guidance and notes unchanged',()=>{
 const current=createProject(),source=current.slides.find(s=>s.kind==='body');source.lead='原页首句';source.summary='原页尾句';source.notes='原页面备注';const outline=parseOutline('# 新文稿\n## 新章节\n### 复用页面'),key=outline.sections[0].pages[0].key;
 const copied=buildOutlineProject(current,outline,{reuse:{[key]:source.id},toc:false,closing:false,transitions:false}).project.slides.find(s=>s.kind==='body'),withoutIds=modules=>modules.map(({id,...module})=>module);assert.equal(copied.lead,'原页首句');assert.equal(copied.summary,'原页尾句');assert.equal(copied.notes,'原页面备注');assert.deepEqual(withoutIds(copied.modules),withoutIds(source.modules));
});
test('extra outline paragraphs are preserved in notes instead of being discarded',()=>{
 const page=parseOutline('# 文稿\n## 章节\n### 页面\n页首\n\n页尾\n\n补充条件一\n\n补充条件二').sections[0].pages[0];assert.equal(page.lead,'页首');assert.equal(page.summary,'页尾');assert.match(page.notes,/补充条件一\n\n补充条件二/);
});

const master=()=>JSON.parse(fs.readFileSync('templates/template-1/ustb-blue/template.html','utf8').match(/<script[^>]*id="project-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
test('current outline roundtrip retains authored pages, IDs, notes, formats and appendix',()=>{
 const current=master(),before=structuredClone(current),o=describeCurrentOutline(current);assert.deepEqual(o.parsed.errors,[]);
 const {project}=updateProjectOutline(current,o.parsed,{reuse:o.bindings,chapters:o.chapters});
 assert.equal(project.slides.length,current.slides.length);assert.deepEqual(project.slides.map(s=>s.id),current.slides.map(s=>s.id));
 for(const s of project.slides.filter(s=>s.kind!=='toc'))assert.deepEqual(s,current.slides.find(old=>old.id===s.id),s.title);
 assert.deepEqual(current,before);assert.equal(project.title,current.title);assert.equal(project.slides.at(-2).section,'附录');
 assert.equal(outlinePageCount(o.parsed,{chapters:o.chapters,preserveTransitions:true}),current.slides.length);
});
test('rename and reorder current headings keeps original page contents; insertion is a new ID',()=>{
 const current=createProject(),o=describeCurrentOutline(current),next=parseOutline(o.text.replace('## 研究背景','## 背景与意义').replace('### 研究背景与问题定义','### 研究背景与问题定义（修订）\n### 新增材料'));
 const bindings=reconcileOutlineBindings(o.parsed,next,o.bindings),chapters=reconcileOutlineBindings(o.parsed,next,o.chapters,true),{project}=updateProjectOutline(current,next,{reuse:bindings,chapters});
 const source=current.slides.find(s=>s.kind==='body'),same=project.slides.find(s=>s.id===source.id);assert.equal(same.title,'研究背景与问题定义（修订）');assert.deepEqual(same.modules,source.modules);assert.equal(same.group,'背景与意义');assert.equal(same.outlineDraft,undefined);
 assert.ok(project.slides.find(s=>s.title==='新增材料').outlineDraft);assert.equal(project.slides.length,current.slides.length+1);
});
test('explicit final appendix checkbox overrides the chapter name in both application modes',()=>{
 const current=createProject(),o=parseOutline('# 汇报\n## 背景\n### 问题\n## 补充资料\n### 文献');
 const fresh=buildOutlineProject(current,o,{lastAppendix:true}).project;assert.equal(fresh.slides.find(s=>s.title==='文献').section,'附录');assert.equal(documentSections(fresh).length,1);
 const described=describeCurrentOutline(fresh),updated=updateProjectOutline(fresh,described.parsed,{reuse:described.bindings,chapters:described.chapters,lastAppendix:false,preserveTransitions:false}).project;
 assert.equal(updated.slides.find(s=>s.kind==='body'&&s.title==='文献').section,'02');assert.equal(documentSections(updated).length,2);
});
test('current page reorder follows IDs instead of replacing contents',()=>{
 const current=createProject(),before=structuredClone(current),o=describeCurrentOutline(current),next=structuredClone(o.parsed);next.sections.reverse();next.sections.forEach((ch,i)=>{ch.key='chapter-'+i;ch.pages.reverse();ch.pages.forEach((p,j)=>p.key=ch.key+'-page-'+j);});
 const reuse=reconcileOutlineBindings(o.parsed,next,o.bindings),chapters=reconcileOutlineBindings(o.parsed,next,o.chapters,true),{project}=updateProjectOutline(current,next,{reuse,chapters});
 assert.deepEqual(project.slides.filter(s=>s.kind==='body').map(s=>s.id),current.slides.filter(s=>s.kind==='body').reverse().map(s=>s.id));for(const s of project.slides.filter(s=>s.kind==='body'))assert.deepEqual(s.modules,current.slides.find(x=>x.id===s.id).modules);assert.deepEqual(current,before);
});
test('adding a transitioned chapter after a manual chapter continues numbering',()=>{
 const base=buildOutlineProject(createProject(),parseOutline('# 汇报\n## 背景\n### 问题'),{transitions:false}).project,o=describeCurrentOutline(base),next=parseOutline(o.text+'\n## 新章\n### 新页');
 const {project}=updateProjectOutline(base,next,{reuse:reconcileOutlineBindings(o.parsed,next,o.bindings),chapters:reconcileOutlineBindings(o.parsed,next,o.chapters,true)});assert.deepEqual(documentSections(project).map(s=>s.number),['01','02']);
});
