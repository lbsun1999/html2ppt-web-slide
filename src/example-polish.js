import {applyReferenceLayout} from './reference-layouts.js';
import {textBlock,summaryPage,profilePage} from './page-presets.js';

// Shared final layout pass: both schools keep the same evidence and hierarchy.
export function polishExample(project){
 const byTitle=title=>project.slides.find(s=>s.title===title);
 const conclusions=new Map([
  ['页面结构：引导、证据与结论','先给阅读线索，再呈现证据；用页尾判断收束内容，让来源与备注各司其职。'],
  ['AI 生成结构，人工完成精修','协作成果是一份可继续编辑的 HTML：材料可追踪，版式可调整，交付前逐页复核。'],
  ['比例可以不同，画面高度必须一致','保持原始比例，统一实际高度；校徽与组合标识完整呈现，避免拉伸或裁掉必要元素。'],
  ['双图对照与口径检查','比较前先统一对象、单位与范围；取景保留关键标注，避免裁剪改变证据的原意。'],
  ['表格展示结果，也交代实验口径','固定测试集、重复次数与计时范围；报告均值与标准差，让每一项比较都能复查。'],
  ['用三种视图检查同一份内容','单页查细节，单列查叙事，多列查一致性；完成三轮检查后再进入正式放映。'],
  ['逐页备注：给演讲者留一份讲解线索','幻灯片服务听众阅读，备注服务口头讲解；两者围绕同一结论，避免重复堆砌。'],
  ['双窗口演示：一个看内容，一个看提示','观众只看演示画面；放大后第一次 Esc 复位，再按一次退出放映，备注留在工作台。'],
  ['模板资料与协同工作方式','以真实资料为起点，以可编辑源稿为交接；保留来源、人工判断和下一轮修改的入口。']
 ]);
 for(const [title,summary] of conclusions){const s=byTitle(title);if(!s)continue;s.summary=summary;
  s.modules=s.modules.filter(m=>!(m.type==='text'&&m.style==='note'&&m.y>=680&&m.w>1400));
  for(const m of s.modules){m.h=Math.min(m.h,726-m.y);for(const p of m.parts)delete p.takeaway;}
 }
 const ratios=byTitle('比例可以不同，画面高度必须一致');if(ratios){ratios.modules[0].h=220;for(const m of ratios.modules.slice(1)){m.y=500;m.h=226;m.role='ratio-guide';}}
 const results=byTitle('表格展示结果，也交代实验口径');if(results){results.modules[0].h=470;results.modules[0].tableNote='↑ 表示指标越高越优；↓ 表示指标越低越优。00.00 ± 00.00 为均值与标准差的占位符。\n实验设置：补充场景参数、测试集规模与重复次数；各算法使用一致的数据划分和运行环境。\n统计记录：明确预热、推理和计时范围；保留原始日志、随机种子及失败样本，便于复查。';}
 const collab=byTitle('AI 生成结构，人工完成精修');if(collab)collab.modules[0].parts.forEach((p,i)=>Object.assign(p,{showSubheading:true,subheading:'本环节交付',showAnnotation:true,annotation:[
  '交付材料清单，写明来源、版本及缺失信息；区分必须展示与只供查阅的资料。',
  '交付初版 HTML，核对章节顺序与页码；标明证据位置和需人工确认的问题。',
  '交付确认后的源稿与导出文件；逐页试讲，核对字体、媒体播放及引用链接。'
 ][i]}));
 const sources=byTitle('模板资料与协同工作方式');if(sources){sources.modules[0].h=350;
  const checks=textBlock('plain',{x:58,y:630,w:1484,h:96},[['资料交接','记录版本、来源与尚缺材料。'],['人工复核','核对事实、取景和引用链接。'],['下轮修改','标出待改页面和验收标准。']]);checks.role='delivery-checks';sources.modules.push(checks);
 }
 const toc=project.slides.find(s=>s.kind==='toc');if(toc){const descriptions=[
  '明确受众、章节目标与材料来源。\n统一主题、字号和页面信息层级。\n用研究现状建立后续讨论背景。',
  '按问题选择文字、媒体和表格。\n通过公式与伪代码解释方法细节。\n对照证据，说明适用条件和限制。',
  '用三种视图核查细节与阅读顺序。\n为每页补充讲解提示和过渡备注。\n试讲并检查双窗口的画面与翻页。',
  '保存可继续修改的 HTML 源稿。\n复查 PDF 与 PPTX 的实际效果。\n核对字体、媒体与引用链接。'];
  project.slides.filter(s=>s.kind==='transition').forEach((s,i)=>toc.tocNotes[s.id]=descriptions[i]);
  toc.tocBullet=true;
 }
 const s=byTitle('阶段总结与后续计划');if(s){const tpl=summaryPage();s.modules=tpl.modules;delete s.referenceLayout;s.summary='';}
 const p=byTitle('作者简介');if(p){const tpl=profilePage();p.modules=tpl.modules;delete p.referenceLayout;p.summary='';}

 return project;
}
