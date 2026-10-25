import {blankSlide,moduleOf,part,SAFE} from './model.js';
import {applyReferenceLayout} from './reference-layouts.js';

export function textBlock(style,rect,items,columns=null,extra={}){
 const m=moduleOf('text',rect,items.length);
 Object.assign(m,{style,columns:columns??items.length,headerWidth:90,...extra});
 m.parts=items.map(([title,text,opts={}])=>({...part(),title,text,bullet:false,...opts}));
 return m;
}

function tableModule(rect,rows,headerRows=1,note=''){
 const m=moduleOf('table',rect,1);
 m.rows=rows.map(r=>[...r]);
 m.headerRows=headerRows;
 m.columns=rows[0]?.length||2;
 m.tableNote=note;
 m.rowHeightPt=0;
 m.cellPaddingPt=undefined;
 return m;
}

// ——— 阶段总结与后续计划 ———
export function summaryPage(){
 const s=blankSlide();
 Object.assign(s,{
  title:'阶段总结与后续计划',
  group:'总结与计划',
  section:'04',
  lead:'汇总当前阶段关键结论与遗留问题，并说明下一阶段的目标、路径与里程碑。',
  source:'',
  sourceUrl:'',
  summary:'',
 });
 const safe={...SAFE};
 // 顶部：两个标题式文本块（group / C2），左右并排
 const topH=108;
 const topGap=24;
 const topW=(safe.w-topGap)/2;
 s.modules.push(textBlock('group',
  {x:safe.x,y:safe.y,w:topW,h:topH},
  [['阶段总结','列出本阶段取得的三项主要进展，每条用一句话说明问题、方法与结果。',{}]],
  1,
  {groupTitle:'阶段总结'}
 ));
 s.modules.push(textBlock('group',
  {x:safe.x+topW+topGap,y:safe.y,w:topW,h:topH},
  [['后续计划','说明下一阶段的研究路线、关键节点与预期产出。',{}]],
  1,
  {groupTitle:'后续计划'}
 ));
 // 中部：左边卡片文本，右边表格
 const midY=safe.y+topH+24;
 const midH=264;
 const leftW=820;
 const rightW=safe.w-leftW-24;
 s.modules.push(textBlock('cards',
  {x:safe.x,y:midY,w:leftW,h:midH},
  [
   ['主要进展一','说明本阶段的核心问题、采用方法与得到的结论。结合数据或证据指出贡献所在与仍存在的局限。',{bullet:false}],
   ['主要进展二','说明第二项工作的研究问题、技术路线与实验结论。段落结构保持匀称，避免一侧过重。',{bullet:false}],
   ['主要进展三','说明第三项工作的目标、思路与结果。三列内容尽量均衡，可配合数据或证据增强说服力。',{bullet:false}],
  ],
  1
 ));
 s.modules.push(tableModule(
  {x:safe.x+leftW+24,y:midY,w:rightW,h:midH},
  [
   ['里程碑','时间节点','交付物','状态'],
   ['M1：方案验证','第1–2月','原型系统 + 基线实验','进行中'],
   ['M2：方法迭代','第3–5月','改进算法 + 消融实验','待开始'],
   ['M3：系统集成','第6–7月','完整系统 + 用户研究','待开始'],
   ['M4：总结发表','第8–9月','论文撰写 + 答辩准备','待开始'],
  ],
  1,
  '表格行高与内边距可在模块编辑中调整。'
 ));
 // 底部：C1 / note 样式的总结备注（单子区域）
 const botY=midY+midH+24;
 const botH=safe.h-(topH+24+midH+24+24);
 s.modules.push(textBlock('note',
  {x:safe.x,y:botY,w:safe.w,h:Math.max(60,botH)},
  [['','用一句话总结本阶段的核心结论和下一阶段的重点方向。备注样式适合作为页内总结、补充说明或注意事项。',{}]],
  1
 ));
 return s;
}

// ——— 作者简介 / 简历页 ———
export function profilePage(){
 const s=blankSlide();
 Object.assign(s,{
  title:'作者简介',
  group:'参考与作者',
  section:'附录',
  chapterMode:'manual',
  lead:'个人基本信息、研究方向与主要经历一览。',
  source:'',
  sourceUrl:'',
  summary:'',
 });
 const safe={...SAFE};
 // 左侧：头像 + 基本信息（用 media + text 两个模块）
 const leftW=360;
 // 头像
 const portraitH=300;
 const portraitModule=moduleOf('media',{x:safe.x,y:safe.y,w:leftW,h:portraitH},1);
 portraitModule.captionMode='title';
 portraitModule.parts[0].showCaption=false;
 portraitModule.parts[0].asset=null;
 portraitModule.parts[0].caption='';
 portraitModule.parts[0].note='';
 s.modules.push(portraitModule);
 // 基本信息文本
 const infoY=safe.y+portraitH+24;
 const infoH=safe.h-portraitH-24-24;
 s.modules.push(textBlock('cards',
  {x:safe.x,y:infoY,w:leftW,h:infoH},
  [
   ['个人信息','姓名：\n学号 / 工号：\n所属学院：\n研究方向：\n电子邮箱：',{bullet:false}],
  ],
  1
 ));
 // 右侧上方：3 个子区域的卡片式文本
 const rightX=safe.x+leftW+24;
 const rightW=safe.w-leftW-24;
 const topH=200;
 s.modules.push(textBlock('cards',
  {x:rightX,y:safe.y,w:rightW,h:topH},
  [
   ['教育经历','按时间倒序列举学历背景，包括学校、专业、学位与时间。',{bullet:false}],
   ['研究方向','概括主要研究兴趣、技术领域与关注的学术问题。',{bullet:false}],
   ['荣誉奖项','列举代表性奖项、奖学金或学术竞赛成果。',{bullet:false}],
  ],
  3
 ));
 // 右侧下方：表格（经历 / 技能等）
 const tableY=safe.y+topH+24;
 const tableH=safe.h-topH-24;
 s.modules.push(tableModule(
  {x:rightX,y:tableY,w:rightW,h:tableH},
  [
   ['项目 / 经历','时间','角色','主要贡献'],
   ['项目名称一','2024 – 至今','核心成员','负责算法设计与实验验证，提出 XXX 方法，在 YYY 数据集上取得 ZZZ 结果。'],
   ['项目名称二','2023 – 2024','参与','参与系统开发与数据分析，完成 XXX 模块的设计与实现。'],
   ['实习 / 工作经历','2022 – 2023','实习生','参与产品研发，负责 XXX 功能的设计与落地。'],
  ],
  1,
  '可根据需要增删行、改列数，或替换为技能矩阵、发表论文等内容。'
 ));
 return s;
}

// 公式页和参考文献页排版特殊，继续用 reference layout
export function formulaPage(){return applyReferenceLayout(blankSlide(),'formula');}
export function referencePage(){const s=applyReferenceLayout(blankSlide(),'references');Object.assign(s,{chapterMode:'manual',section:'附录',group:'参考与作者'});return s;}

export function sourcePage(){
 const s=blankSlide();
 Object.assign(s,{
  title:'模板资料与协同工作方式',
  lead:'先保留可追踪资料，再请 AI 生成结构化页面；人工端负责精修与最终确认。',
  chapterMode:'manual',
  section:'附录',
  group:'参考与作者'
 });
 s.modules=[textBlock('cards',{...SAFE},[
  ['给 AI 的材料','学校标识与需要遵循的主题色。\n论文、图表、公式、结果及引用来源。\n受众、时长、章节目标与必须保留的信息。\n已有 HTML 可直接作为修改起点。',{bullet:true}],
  ['人工端的操作','先检查内容与章节顺序，再调整模块。\n文字可局部加粗、改色和手动改行距。\n媒体可换素材、改比例并保持并列等高。\n备注用于口头解释，导出前逐页复查。',{bullet:true}],
  ['可复用的资源','本项目 SKILL.md 说明 AI 工作流程。\n根目录 HTML 可继续编辑。\n学校标识优先核对学校官方网站。\n下方链接汇总各校官方资源入口。',{bullet:true}]
 ])];
 s.source='中国高校校徽（LOGO）官方下载资源汇总';
 s.sourceUrl='https://www.cnblogs.com/cdz-111/articles/22432508';
 s.notes='资源索引链接按用户指定名称提供，发布时间标注由用户提供；实际标识文件应优先核对学校官方来源。不要把这个第三方索引视为学校官方 VI 规范。';
 return s;
}

export function makePreset(kind){
 if(kind==='formula-page')return formulaPage();
 if(kind==='references-page')return referencePage();
 if(kind==='profile-page')return profilePage();
 if(kind==='summary-page')return summaryPage();
 return blankSlide();
}
