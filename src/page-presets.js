import {summaryPage,profilePage} from './editable-layouts.js';
import {blankSlide,moduleOf,part,SAFE} from './model.js';
import {applyReferenceLayout} from './reference-layouts.js';

export function textBlock(style,rect,items,columns=null,extra={}){
 const m=moduleOf('text',rect,items.length);
 Object.assign(m,{style,columns:columns??items.length,headerWidth:90,...extra});
 m.parts=items.map(([title,text,opts={}])=>({...part(),title,text,bullet:false,...opts}));
 return m;
}

export {summaryPage,profilePage};

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
