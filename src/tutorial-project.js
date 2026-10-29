import {blankSlide,clone,makePage,moduleOf,SAFE,syncSections} from './model.js';

const body=(title,lead='',modules=[],notes='')=>({...blankSlide(),title,lead,modules,notes,footer:'北京科技大学 · Web Slide 交互教学',source:'教学练习页 · 操作结果仅保存在当前 HTML'});
const text=(style,rect,title,content)=>{const module=moduleOf('text',rect,1);module.style=style;module.parts[0].title=title;module.parts[0].text=content;return module;};

export function createTutorialProject(master){
 const cover={...makePage('cover'),title:'Web Slide 交互教学',lead:'从页面结构到模块排版，逐项完成真实操作',presenter:'练习者',institute:'北京科技大学 · 教学练习',date:'按步骤完成后保存练习副本',notes:'本文件是独立教学文稿，不是正式科研示例。每页对应一个教学单元。'};
 const toc=makePage('toc');toc.title='教学单元';toc.lead='每页练习一类操作：先确定页面，再布置模块，最后填写内容。';
 const pageInfo=body('页面信息与备注练习','先填写当前页标题、页首句、来源和备注，再学习显示与隐藏备注。',[], '在页面设置中填写备注，应用后点击顶部“页面备注”显示底部停靠区。');
 const blank=body('空白正文与卡片排版','本页正文区保持空白：先插入卡片，再调整尺寸、位置、间距与留白。',[], '练习顺序：插入文字模块 → 调整尺寸 → 按网格移动 → 增加子区域 → 编辑文字。');
 const demoRect={x:58,y:286,w:700,h:480};
 const table=moduleOf('table',{x:58,y:286,w:1484,h:430});table.rows=[['方法','准确率 / % ↑','RMSE ↓','耗时 / ms ↓'],['基线方法','84.6','0.218','42.3'],['改进方法 A','87.9','0.193','39.8'],['改进方法 B','89.4','0.181','37.5'],['本文方法','91.2','0.164','35.7']];table.tableTitle='实验结果与方法比较';
 const tablePage=body('表格练习','本页已经放好一张可编辑表格：选中它后直接练习导入、批量改值、行列、字号、行高和样式。',[table],'首行才是表头，不要把第一列误设为深色；离线 HTML 可以直接读取 XLSX／CSV，也可用 Tab 和回车批量替换。');
 const formula=moduleOf('formula',demoRect,1);formula.style='band';formula.parts[0].title='目标函数示范';
 const formulaPage=body('公式练习','左侧公式展示标题、LaTeX 与解释的组合；右侧插入含两个子区域的公式模块并修改内容。',[formula],'建议选择2个子区域，分别承载目标函数与参数更新；LaTeX 语法错误时不会覆盖原公式。');
 const media=moduleOf('media',demoRect,1);media.parts[0].caption='图 1　双击替换练习图片';
 const mediaPage=body('图片与视频练习','左侧保留媒体示范，右侧插入图片／视频模块，再练习替换、比例、取景、缩放和图注。',[media],'练习素材位于 tutorial-assets/media；没有图注时取消图标题，不保留无意义的图注空白。');
 const timeline=moduleOf('timeline',{...SAFE},4);timeline.parts.forEach((part,i)=>{part.year=['阶段一','阶段二','阶段三','阶段四'][i];part.title='阶段事件 '+(i+1);part.text='填写本阶段的进展、证据与边界。';});
 const timelinePage=body('时间轴与图文练习','练习增减、排序和替换阶段媒体；隐藏时间轴装饰后转为普通并列图文卡片。',[timeline],'阶段数量改变后，卡片宽度与媒体高度自动重新分配。');
 const alignModules=[
  text('cards',{x:58,y:286,w:430,h:230},'板块 A','移动到参考位置。'),
  text('cards',{x:585,y:330,w:430,h:230},'板块 B','练习边缘对齐。'),
  text('cards',{x:1112,y:270,w:430,h:230},'板块 C','练习等距分布。')
 ];
 const alignPage=body('高级对齐练习','先对板块 A 做左／上平移与右／下拉伸，再直接切换多选模式完成三板块等距。',alignModules,'参考线与多选等距属于同一个高级对齐大项；环形分布另起一项并重新打开插件。');
 const ringSeed=moduleOf('text',{x:640,y:470,w:320,h:72},1);ringSeed.textBox=true;ringSeed.boxTone='light';ringSeed.parts[0].title='';ringSeed.parts[0].text='研究目标';
 const ringPage=body('环形文字排版练习','选择中央的一行文字，复制为4份并在-45°至45°的小扇形内排布，确保组合完整落在正文安全区。',[ringSeed],'本页使用单一文字块演示“单项复制数量”：4份、半径180 px、起始-45°、结束45°。');
 const presentPage=body('备注、放映与导出练习','显示当前页备注，比较演讲者视图与全屏放映，最后保存 HTML 并检查 PDF／PPTX。',[text('band',{...SAFE},'完成前检查','页面备注随当前页切换。\n演讲者视图适合双屏。\n全屏放映适合单屏专注画面。\n导出后仍需人工复核字体与断行。')],'本页备注用于验证停靠区、双窗口同步和导出保留。');
 const closing={...makePage('closing'),title:'教学完成',lead:'保存练习副本，回到正式模板开始制作自己的汇报',presenter:'Web Slide',institute:'北京科技大学 · 交互教学',date:'完成后可重复练习'};
 const project={version:1,title:'北京科技大学_WebSlide交互教学',theme:clone(master.theme),grid:20,slides:[cover,toc,pageInfo,blank,tablePage,formulaPage,mediaPage,alignPage,ringPage,timelinePage,presentPage,closing]};
 project.theme.name='北京科技大学';project.theme.presets=clone(master.theme.presets||{});
 return syncSections(project);
}
