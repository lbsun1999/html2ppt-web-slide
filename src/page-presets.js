import {blankSlide,moduleOf,part,SAFE} from './model.js';
import {applyReferenceLayout} from './reference-layouts.js';

export function textBlock(style,rect,items,columns=null,extra={}){
 const m=moduleOf('text',rect,items.length);
 Object.assign(m,{style,columns:columns??items.length,headerWidth:90,...extra});
 m.parts=items.map(([title,text,opts={}])=>({...part(),title,text,bullet:false,...opts}));
 return m;
}

function tableModule(rect,rows,opts={}){
 const m=moduleOf('table',rect,1);
 m.rows=rows.map(r=>[...r]);
 m.headerRows=opts.headerRows??1;
 m.columns=rows[0]?.length||2;
 m.tableTitle=opts.tableTitle||'';
 m.tableNote=opts.tableNote||'';
 m.rowHeightPt=opts.rowHeightPt??0;
 m.cellPaddingPt=opts.cellPaddingPt;
 m.profileHistory=opts.profileHistory??false;
 m.bandTitle=opts.bandTitle??false;
 m.borderless=opts.borderless??false;
 return m;
}

// ——— 阶段总结与后续计划 ———
// 左栏：A2 / cards 文本模块（3 个子区域，单列，可增删）
// 右栏上：表格模块（下一步计划表，bandTitle 深底标题）
// 右栏下：C1 / note 备注模块
export function summaryPage(){
 const s=blankSlide();
 Object.assign(s,{
  title:'阶段总结与后续计划',
  group:'总结与计划',
  section:'04',
  lead:'总结已经获得证据支持的进展，并将尚未解决的问题落实到可检查的后续工作。',
  source:'阶段总结与任务安排示例，以实际工作记录为准',
  sourceUrl:'',
  summary:'',
 });
 const x=SAFE.x,y=SAFE.y,w=SAFE.w,h=SAFE.h;
 const gap=36;
 const leftW=(w-gap)/2;
 const rightW=w-leftW-gap;
 // 左：A2 / cards 文本模块（3 个子区域，单列堆叠）
 s.modules.push(textBlock('cards',
  {x,y,w:leftW,h},
  [
   ['已完成的工作','列出已实现的方法与完成的实验，注明代码版本、数据范围和记录位置。',{bullet:false}],
   ['证据支持的结论','关联对应图表，写明结论适用的场景与条件；初步观察需标明尚待复核。',{bullet:false}],
   ['仍待解决的问题','指出未覆盖的场景、失败情形及主要限制，说明其对当前判断的影响。',{bullet:false}],
  ],
  1
 ));
 // 右上：表格模块（计划表，带深底标题栏）
 const tableH=Math.round(h*0.72);
 s.modules.push(tableModule(
  {x:x+leftW+gap,y,w:rightW,h:tableH},
  [
   ['工作阶段','关键任务','验收产出'],
   ['近期','统一实验设置\n固定数据划分','参数清单、数据版本\n及可复现的实验脚本'],
   ['随后','补充对照实验\n开展关键消融','均值 ± 标准差\n重复次数及原始日志'],
   ['并行','分析异常结果\n归纳失败案例','差异解释与边界条件\n可定位的典型样例'],
   ['下次汇报','汇总新增证据\n逐项回应问题','更新图表与问题清单\n逐项修订研究结论'],
  ],
  {
   tableTitle:'下一步计划',
   tableNote:'',
   headerRows:1,
   bandTitle:true,
  }
 ));
 // 右下：C1 / note 备注模块
 const noteY=y+tableH+20;
 const noteH=h-tableH-20;
 s.modules.push(textBlock('note',
  {x:x+leftW+gap,y:noteY,w:rightW,h:Math.max(60,noteH)},
  [['','<b>本次讨论：</b>确认实验优先级和验收标准。\n各阶段时间按实际进展填写。',{}]],
  1
 ));
 return s;
}

// ——— 作者简介 / 简历页 ———
// 左侧：头像 + 个人信息卡片（保留特殊结构）
// 右侧：3 个独立模块堆叠（每个带 A3 深底标题，内容可以是表格或文本）
export function profilePage(){
 const s=blankSlide();
 Object.assign(s,{
  title:'作者简介',
  group:'参考与作者',
  section:'附录',
  chapterMode:'manual',
  lead:'个人基本信息、研究方向与主要经历一览。',
  source:'个人简介示例，请根据实际情况替换内容',
  sourceUrl:'',
  summary:'',
 });
 const x=SAFE.x,y=SAFE.y,w=SAFE.w,h=SAFE.h;
 const leftW=340;
 const gap=32;
 const rightX=x+leftW+gap;
 const rightW=w-leftW-gap;
 const sectionGap=20;
 // 左上：头像（媒体模块）
 const portraitH=300;
 const portraitModule=moduleOf('media',{x,y,w:leftW,h:portraitH},1);
 portraitModule.captionMode='title';
 portraitModule.parts[0].showCaption=false;
 portraitModule.parts[0].asset=null;
 portraitModule.parts[0].caption='';
 portraitModule.parts[0].note='';
 s.modules.push(portraitModule);
 // 左下：个人信息（A2 / cards 浅卡样式）
 const infoY=y+portraitH+20;
 const infoH=h-portraitH-20;
 s.modules.push(textBlock('cards',
  {x,y:infoY,w:leftW,h:infoH},
  [
   ['作者姓名','职称／学位\n学院／研究机构\n团队／实验室\n邮箱：name@example.com',{bullet:false}],
  ],
  1
 ));
 // 右 1：教育和工作经历（表格模块，深底标题栏，profile-history 有框线）
 const sec1H=Math.round((h-2*sectionGap)*0.38);
 s.modules.push(tableModule(
  {x:rightX,y,w:rightW,h:sec1H},
  [
   ['起止时间','','学校／工作单位','','学位／专业／职务'],
   ['20XX—20XX','','学校及院系','','学位与专业'],
   ['20XX—20XX','','研究机构／工作单位','','科研岗位'],
   ['20XX—至今','','现工作单位','','现任职务'],
  ],
  {
   tableTitle:'教育和工作经历',
   headerRows:1,
   profileHistory:true,
   bandTitle:true,
  }
 ));
 // 右 2：学术任职 / 代表性项目（A3 / band 样式，2 列）
 const sec2H=Math.round((h-2*sectionGap)*0.28);
 const sec2Y=y+sec1H+sectionGap;
 s.modules.push(textBlock('band',
  {x:rightX,y:sec2Y,w:rightW,h:sec2H},
  [
   ['学术任职','学术组织／期刊：职务\n任期／服务事项：时间',{bullet:true}],
   ['代表性项目与奖项','项目：名称、本人角色\n奖项：名称、年份／排名',{bullet:true}],
  ],
  2
 ));
 // 右 3：主要研究方向（表格模块，无框线样式，第一行主题色粗体）
 const sec3H=h-sec1H-sec2H-2*sectionGap;
 const sec3Y=sec2Y+sec2H+sectionGap;
 s.modules.push(tableModule(
  {x:rightX,y:sec3Y,w:rightW,h:sec3H},
  [
   ['研究方向一','研究方向二','研究方向三'],
   ['研究对象：\n核心问题：','主要方法：\n技术特点：','应用场景：\n研究目标：'],
  ],
  {
   tableTitle:'主要研究方向',
   headerRows:1,
   bandTitle:true,
   borderless:true,
  }
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
 return blankSlide();
}
