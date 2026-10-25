import {TEXT_STYLES} from './text-styles.js';
export const W=1600,H=900,GAP=12,SAFE={x:58,y:256,w:1484,h:554};
export const contentBounds=(summary=false)=>({...SAFE,h:(summary?750:834)-SAFE.y});
export const STYLES=TEXT_STYLES;
export const clone=x=>structuredClone(x);
export const uid=()=>globalThis.crypto?.randomUUID?.()||`m${Date.now()}${Math.random().toString(16).slice(2)}`;
export const defaultTheme={name:'北京科技大学',primary:'#005894',secondary:'#1766A9',accent:'#2BA3C0',emphasis:'#A31418',tint:'#EEF5F9',ink:'#000000',logo:'',wordmark:''};
export function part(){return {title:'分项标题',text:'在此输入正文。按完整语义组织内容，明确本段的证据与结论。',bullet:false,marker:'•',subheading:'',annotation:'',showSubheading:false,showAnnotation:false,caption:'图 1　图片标题',note:'',showCaption:true,captionMode:'note',asset:null,latex:String.raw`J(\theta)=\frac{1}{m}\sum_{i=1}^{m} \ell_i(\theta)`};}
export function timelinePart(i=0){return {...part(),year:String(2020+i),title:'阶段事件',text:'说明本阶段的代表工作、主要进展与适用条件。结合证据指出仍需解决的问题。',showCaption:false,bullet:false};}
export function moduleOf(type,rect,count=1){const m={id:uid(),type,style:'plain',...rect,parts:Array.from({length:count},(_,i)=>type==='timeline'?timelinePart(i):part()),columns:count,rows:[['算法','场景一 / ↑','场景二 / ↓'],['方法 A','00.00 ± 00.00','00.00 ± 00.00'],['方法 B','00.00 ± 00.00','00.00 ± 00.00']],merges:[],headerRows:1};if(type==='timeline')m.hideTimeline=false;return m;}
export function blankSlide(){return {id:uid(),kind:'body',section:'01',group:'研究背景',title:'新的研究页面',lead:'用一句话说明本页研究问题、证据或结论。',source:'',sourceUrl:'',summary:'',notes:'',modules:[]};}
export function makePage(kind='body'){
 const s={...blankSlide(),kind};
 if(kind==='toc')Object.assign(s,{title:'汇报目录',group:'汇报概览',lead:'围绕研究问题、方法设计与实验结果展开汇报。',tocNotes:{}});
 if(kind==='transition')Object.assign(s,{title:'新章节',lead:'本章概览'});
 if(kind==='cover'||kind==='closing')Object.assign(s,{title:kind==='cover'?'科研汇报':'感谢聆听，恳请批评指正',lead:'研究问题 · 方法设计 · 实验验证',presenter:'汇报人姓名',institute:'学院 / 研究团队',date:'汇报日期'});
 return s;
}
export function documentSections(p,{includeAppendix=false}={}){
 const chapters=p.slides.flatMap((s,index)=>s.kind==='transition'?[{id:s.id,title:s.title,number:s.section,index}]:s.kind==='body'&&s.chapterMode==='manual'&&!(p.slides[index-1]?.chapterMode==='manual'&&p.slides[index-1]?.section===s.section&&p.slides[index-1]?.group===s.group)?[{id:s.id,title:s.group,number:s.section,index}]:[]);
 return chapters.map((ch,i)=>{let end=(chapters[i+1]?.index??p.slides.length)-1;while(end>ch.index&&['cover','closing'].includes(p.slides[end].kind))end--;return {...ch,appendix:/^(附录|appendix)/i.test(ch.number)||/^(附录|appendix)/i.test(ch.title),startPage:ch.index+1,endPage:end+1,pageRange:ch.index===end?String(end+1).padStart(2,'0'):`${String(ch.index+1).padStart(2,'0')}–${String(end+1).padStart(2,'0')}`};}).filter(ch=>includeAppendix||!ch.appendix);
}
export function syncSections(p){
 let active=null,n=0;for(const s of p.slides){if(s.kind==='transition'){s.section=String(++n).padStart(2,'0');s.group=s.title;active=s;}else if(s.kind==='body'&&s.chapterMode==='manual'){delete s.chapterId;}else if(s.kind==='body'&&active){s.section=active.section;s.group=active.title;s.chapterId=active.id;}else if(s.kind==='body'&&s.chapterId){delete s.chapterId;s.section='00';s.group='未分章';}}
 for(const s of p.slides.filter(s=>s.kind==='toc')){
  const sections=documentSections(p,{includeAppendix:!!s.tocIncludeAppendix}).filter(ch=>!s.tocExcluded?.includes(ch.id));
  const m=s.modules.find(m=>m.isToc)||moduleOf('text',{...SAFE},1);m.isToc=true;m.type='text';m.style=m.style==='note'?'cards':m.style;
  if(!s.modules.length){m.style='cards';m.columns=2;m.groupTitle='章节安排';m.showPageRanges=true;}
  m.parts=[...sections.map(ch=>({...part(),title:ch.title,text:s.tocNotes?.[ch.id]||'',chapterId:ch.id,chapterNumber:ch.number,targetIndex:ch.index,pageRange:ch.pageRange,showPageRange:m.showPageRanges!==false,bullet:!!s.tocBullet,...s.tocRich?.[ch.id]})),...(s.tocExtras||[])];
  if(!m.parts.length)m.parts=[{...part(),tocPlaceholder:true,title:'章节安排',text:'添加目录子区域，或插入过渡页自动生成章节。'}];
  m.columns=Math.min(m.columns||2,m.parts.length);
  s.modules=[m];
 }
 return p;
}
export function newDocument(title='未命名文稿',examples=false){const p=createProject();p.title=title;if(!examples){const t=makePage('transition');t.title='研究背景';p.slides=[makePage('cover'),makePage('toc'),t,blankSlide(),makePage('closing')];}return syncSections(p);}
export function createProject({withSections=true}={}){
 const background=blankSlide();background.title='研究背景与问题定义';
 const a=moduleOf('text',{x:58,y:256,w:724,h:554},3);a.columns=1;a.style='unified';
 a.parts=[{...part(),title:'问题定义',text:'说明研究对象、输入与输出，以及需要解决的核心约束。\n研究问题应能对应后续实验的评价指标。'},{...part(),title:'现有方法的局限',text:'现有方案在动态环境或资源约束下仍存在不足。\n用具体证据描述局限，避免笼统评价。',bullet:true},{...part(),title:'本页结论',text:'明确当前工作的切入点，为方法设计建立依据。'}];
 const b=moduleOf('media',{x:806,y:256,w:736,h:554},1);b.parts[0].caption='图 1　研究对象与应用场景';b.parts[0].note='上传自己的研究图片，替换占位区域。';background.modules=[a,b];
 const methods=blankSlide();methods.section='02';methods.group='研究方法';methods.title='方法框架与模块协同';methods.lead='分别说明各模块的目标、关键操作及输出，形成可验证的方法链条。';
 const c=moduleOf('text',{...SAFE},3);c.style='band';c.parts=[{...part(),title:'01　输入与表征',text:'明确研究对象与样本构成。\n统一训练、验证与测试口径。\n说明数据清洗和特征选择依据。\n标注缺失数据的处理方式。\n记录资源预算与环境约束。\n输出可追踪的标准化表征。',bullet:true},{...part(),title:'02　策略与优化',text:'将研究目标写成可计算的指标。\n说明核心策略与决策变量。\n解释约束如何进入求解过程。\n给出迭代步骤与终止条件。\n讨论计算开销及适用范围。\n保留关键参数与配置记录。',bullet:true},{...part(),title:'03　输出与验证',text:'对应研究问题选择评价指标。\n明确统计口径与重复次数。\n利用消融实验核验关键模块。\n给出不同场景的对比结果。\n记录运行环境与资源消耗。\n分析误差来源和方法边界。',bullet:true}];methods.modules=[c];
 const results=blankSlide();results.section='03';results.group='实验与分析';results.title='实验结果与方法比较';results.lead='统一实验口径，用可编辑的表格呈现结果；↑ 表示越大越好，↓ 表示越小越好。';
 const t=moduleOf('table',{...SAFE});t.rows=[['算法','场景一 / 质量 ↑','场景一 / 耗时 ↓','场景二 / 质量 ↑','场景二 / 耗时 ↓'],...['随机策略','启发式方法','基线方法 A','基线方法 B','对比方法 C','局部搜索','传统优化','轻量模型','消融模型','本文方法'].map(n=>[n,...Array(4).fill('00.00 ± 00.00')])];results.modules=[t];
 const figures=blankSlide();figures.section='03';figures.group='实验与分析';figures.title='图像证据与结果解释';figures.lead='并列呈现图像或视频，图标题和说明占用独立空间，不覆盖媒体区域。';const f=moduleOf('media',{...SAFE},2);f.parts[0].caption='图 2　对比实验';f.parts[1].caption='图 3　运行过程';figures.modules=[f];
 const p={version:1,title:'科研汇报',theme:{...defaultTheme},grid:20,slides:[{...blankSlide(),kind:'cover',title:'科研汇报\n研究进展与方法讨论',lead:'研究问题 · 方法设计 · 实验验证',presenter:'汇报人姓名',institute:'学院 / 研究团队',date:'汇报日期'},background,methods,results,figures,{...blankSlide(),kind:'closing',title:'感谢聆听，恳请批评指正',lead:'Thank you for your attention',presenter:'汇报人姓名',institute:'学院 / 研究团队',date:'汇报日期'}]};
 if(withSections){const toc=makePage('toc'),transitions=['研究背景','研究方法','实验与分析'].map(title=>({...makePage('transition'),title}));p.slides=[p.slides[0],toc,transitions[0],background,transitions[1],methods,transitions[2],results,figures,p.slides[5]];}
 return syncSections(p);
}
export function validateProject(p){
 if(!p||p.version!==1||!Array.isArray(p.slides)||!p.slides.length||p.slides.length>100)throw Error('项目格式不正确，需为本编辑器保存的 HTML 文稿（1–100 页）。');
 const ids=new Set();const checkId=id=>{if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id)||ids.has(id))throw Error('页面或模块标识无效、重复。');ids.add(id);};
 for(const key of ['primary','secondary','accent','emphasis','tint','ink'])if(!/^#[\da-f]{6}$/i.test(p.theme?.[key]||''))throw Error('主题色格式不正确。');
 for(const key of ['logo','wordmark'])if(p.theme[key]&&!/^data:image\/(png|jpeg|webp);base64,/i.test(p.theme[key]))throw Error('标志必须是内嵌的 PNG/JPEG/WebP 图片。');
 for(const s of p.slides){checkId(s.id);if(!['body','cover','closing','toc','transition'].includes(s.kind)||typeof s.title!=='string'||typeof s.lead!=='string')throw Error('页面类型或标题格式无效。');if(!Array.isArray(s.modules)||s.modules.length>40)throw Error('每页最多 40 个模块。');for(const m of s.modules){checkId(m.id);if(m.type==='text'&&m.style==='group')m.innerStyle='plain';if(!['text','table','media','shape','formula','timeline'].includes(m.type)||!Array.isArray(m.parts)||!m.parts.length||m.parts.length>12)throw Error('模块类型或子区域数量无效。');for(const k of ['x','y','w','h'])if(!Number.isFinite(m[k]))throw Error('模块坐标无效。');if(m.type==='table'&&(!Array.isArray(m.rows)||!m.rows.length||m.rows.length>100||m.rows.some(r=>!Array.isArray(r)||!r.length||r.length>30)))throw Error('表格最多 100 行、30 列，且不能为空。');if(m.type==='timeline'){if(m.hideTimeline===undefined)m.hideTimeline=false;if(m.parts.length>6||m.parts.some(p=>typeof p.year!=='string')||(m.stageColors&&(!Array.isArray(m.stageColors)||!m.stageColors.length||m.stageColors.length>6||m.stageColors.some(c=>!/^#[\da-f]{6}$/i.test(c)))))throw Error('Invalid timeline stages, year labels or colors.');}for(const a of m.parts){if(typeof a.text!=='string'||typeof a.title!=='string')throw Error('子区域文字格式无效。');if(a.asset&&!/^data:(image\/(png|jpeg|webp)|video\/(mp4|webm));base64,/i.test(a.asset.src||''))throw Error('媒体格式不受支持。');}}}
 return syncSections(p);
}
