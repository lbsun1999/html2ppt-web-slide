import {applyReferenceLayout} from './reference-layouts.js';
import {polishExample} from './example-polish.js';
import {blankSlide,moduleOf,SAFE,syncSections} from './model.js';
import {textBlock,formulaPage,referencePage,profilePage,sourcePage} from './page-presets.js';

export function augmentExample(p,{assets={}}={}){
 const name='北京科技大学';
 Object.assign(p.theme,{name,primary:'#005B94',secondary:'#1766A9',accent:'#2BA3C0',emphasis:'#A31418',tint:'#EEF5F9',ink:'#000000'});
 p.title=name+'_科研汇报与平台指南';
 for(const s of p.slides){if(s.footer)s.footer=s.footer.replaceAll('丽水学院',name);if(s.institute)s.institute=s.institute.replaceAll('丽水学院',name);if(s.notes)s.notes=s.notes.replaceAll('丽水学院',name);}
 const make=(title,lead,modules,notes)=>({...blankSlide(),title,lead,modules,notes,footer:name+' · Web Slide 示例',source:'版式及操作示例，使用真实材料时请核对数据与来源。'});
 const collab=make('AI 生成结构，人工完成精修','AI 负责内容组织与初始布局，人工负责专业判断与最后一轮阅读检查；两端使用同一份 HTML。',[
  textBlock('numbered',{...SAFE},[
   ['整理输入资料','明确受众、汇报时长与章节目标。\n提供真实图表、公式、研究结果与来源。\n标出必须保留的内容和已知限制。\n已有 HTML 可直接交给 AI 修改。',{bullet:true}],
   ['生成并逐页审查','AI 先确定本页问题与信息层级。\n每个文字板块通常控制在四点以内。\n按内容选择公式、表格和图文版式。\n检查边缘对齐、密度、孤字与遮挡。',{bullet:true}],
   ['打开 HTML 继续编辑','手动调整加粗、颜色与行距。\n替换图像素材，设置媒体的裁剪比例。\n补充每页讲解备注并试讲一遍。\n保存源稿，再导出 PDF 与 PPTX。',{bullet:true}]
  ])
 ],'本项目不是把 AI 和编辑器分成两套互不相通的文件。AI 使用结构化模块生成可编辑 HTML，人工修改后仍可把 HTML 交给 AI 继续加工。不要把截图当作可编辑源文件。');
 p.slides.splice(p.slides.findIndex(s=>s.kind==='transition'&&s.title==='模块与内容'),0,collab);
 const formula=formulaPage();formula.footer=name+' · 科研汇报示例';p.slides.splice(p.slides.findIndex(s=>s.kind==='transition'&&s.title==='预览与演示'),0,formula);
 const source=sourcePage(),refs=referencePage(),profile=profilePage();for(const s of [source,refs,profile])s.footer=name+' · 附录';
 formula.source='推导与符号约定示例；参考文献见附录';formula.sourceUrl='#slide-'+refs.id;
 p.slides.splice(p.slides.length-1,0,source,refs,profile);
 const toc=p.slides.find(s=>s.kind==='toc');toc.tocNotes[source.id]='资料来源、参考文献与个人介绍';
 // Existing marks on the aspect-ratio demonstration keep their true source dimensions.
 for(const s of p.slides)for(const m of s.modules)for(const part of m.parts){const file=part.asset?.src===p.theme.logo?'校徽独立.png':part.asset?.src===p.theme.wordmark?'校名校徽.png':null;if(file&&assets[file]){const im=assets[file];part.asset.ratio=part.asset.naturalRatio=im.width/im.height;}}
 {
  const image=(file,ratio=null)=>{const im=assets[file];return im?{src:im.src,name:im.name||file,kind:'image',ratio:ratio||im.width/im.height,naturalRatio:im.width/im.height,fit:ratio?'cover':'contain',zoom:1,cx:50,cy:50,ratioMode:ratio?'custom':'original'}:null;};
  const historyPage=make('\u7814\u7a76\u73b0\u72b6\u5206\u6790','',[], '\u6821\u53f2\u56fe\u6587\u7528\u4e8e\u56db\u9636\u6bb5\u7248\u5f0f\u5c55\u793a\uff0c\u5b9e\u9645\u7814\u7a76\u8bf7\u66ff\u6362\u4e3a\u6587\u732e\u3001\u65b9\u6cd5\u4e0e\u7814\u7a76\u5dee\u8ddd\u3002');
  p.slides.splice(p.slides.findIndex(s=>s.title==='四类模块，各有自己的任务'),0,historyPage);
  const algorithm=textBlock('band',{x:58,y:256,w:956,h:554},[['算法 1　梯度下降（示意）','输入：参数 θ₀、学习率 α、迭代上限 T\n1  初始化 θ ← θ₀，t ← 0\n2  while t < T do\n3      计算梯度 g ← ∇J(θ)\n4      更新参数 θ ← θ − αg\n5      if ‖g‖ ≤ ε then break\n6      令 t ← t + 1\n7  end while\n输出：参数 θ 与目标值 J(θ)']]);algorithm.role='code-example';
  const algorithmPage=make('算法伪代码与实现边界','沿用目标函数和符号命名，明确输入、更新步骤、停止条件及最终输出。',[algorithm,textBlock('unified',{x:1038,y:256,w:504,h:554},[['符号一致','参数、学习率和目标函数\n应与公式页保持一致。'],['条件清楚','说明步长选择和停止阈值，\n避免把示意代码当作定理。'],['实现可复查','补充版本、随机种子和环境，\n结果应能对应实验记录。']],1)],'伪代码是教学示意，不代表适用于所有目标函数的收敛保证。实际算法应提供约束处理、初始化依据和复杂度说明。');
  p.slides.splice(p.slides.indexOf(formula)+1,0,algorithmPage);
  const mainImage=moduleOf('media',{x:58,y:256,w:956,h:554});mainImage.parts[0].asset=image('example-campus.png');mainImage.parts[0].caption='图 4　校园图像：主图版式示例';mainImage.parts[0].note='图像沿用原北科模板，可替换为研究场景、系统界面或实验结果。';
  const mainPage=make('主图与关键信息','用一张主图建立共同语境，右侧分别交代观察对象、证据解释和适用范围。',[mainImage,textBlock('unified',{x:1038,y:256,w:504,h:554},[['观察对象','先说明图像对象与坐标。\n解释它与本页问题的关系。'],['证据解释','点明关键区域与变化趋势。\n用具体事实支持当前判断。'],['适用范围','说明材料的来源和条件。\n把额外背景放进页面备注。']],1)],'此页参考原北科主图布局，右侧采用三个实质说明区，避免只放两个短段造成大块空白。');
  const pair=moduleOf('media',{x:58,y:256,w:1484,h:420},2);pair.parts[0].asset=image('example-campus.png');pair.parts[1].asset=image('example-motto.png');pair.parts[0].caption='图 5　场景图像';pair.parts[1].caption='图 6　细节与说明';pair.parts.forEach(part=>part.note='并列画面保持实际等高，保留必要图注。');
  const pairPage=make('双图对照与口径检查','比较图像之前先统一对象、单位、范围与标注；等高布局不能替代实验口径的一致性。',[pair,textBlock('note',{x:58,y:700,w:1484,h:110},[['','复查原图中的必要标注，不为美观裁掉证据；图像与解释各占独立区域，不互相覆盖。']])],'本页以原模板图像展示双图版式，不构成实验对比。实际研究中应统一坐标、时间范围和颜色映射，不能截取不利部分以改变解释。');
  p.slides.splice(p.slides.findIndex(s=>s.title==='表格展示结果，也交代实验口径'),0,mainPage,pairPage);
  const plan=moduleOf('table',{x:806,y:256,w:736,h:350});plan.tableTitle='下一步计划';plan.rows=[['阶段','工作任务','交付依据'],['近期','补齐基线与消融','配置及结果表'],['中期','覆盖边界场景','误差与失败记录'],['后续','整理方法与材料','可复查实验包']];
  const summary=make('阶段总结与后续计划','总结以证据为依据，计划以可检验的任务和交付物为单位，避免只列时间节点。',[textBlock('plain',{x:58,y:256,w:724,h:554},[['已完成的工作','说明方法、实现与实验范围。\n标注代码版本和记录位置。'],['证据支持的结论','关联对应图表与统计口径。\n说明结论成立的条件。'],['仍待解决的问题','指出未覆盖场景及限制。\n说明其对当前判断的影响。']],1),plan,textBlock('note',{x:806,y:630,w:736,h:180},[['','计划表与下方说明保留独立间隙。\n验收标准写具体，便于下一次汇报复查。']])],'此页参考原北科的总结／计划排布。表格与下方文字块不能覆盖，左右整体下沿对齐；条目保持通常不超过四点。');
  p.slides.splice(p.slides.findIndex(s=>s.kind==='transition'&&s.title==='保存与交付'),0,summary);
 }
 // Condense adjacent, semantically related clauses into at most four bullets per block.
 for(const s of p.slides)for(const m of s.modules)for(const part of m.parts){if(part.bullet){const lines=part.text.split('\n').filter(Boolean);if(lines.length>4){const groups=Array.from({length:4},()=>[]);lines.forEach((line,i)=>groups[Math.floor(i*4/lines.length)].push(line.replace(/[。；]$/,'')));part.text=groups.map(g=>g.join('；')+'。').join('\n');}}}
 for(const slide of [formula,refs,profile]){slide.footer=name+' · 科研汇报示例';if(slide!==formula){slide.section='附录';slide.group='参考与作者';}}
 {const s=p.slides.find(s=>s.title==='研究现状分析');applyReferenceLayout(s,'history');p.slides.splice(p.slides.indexOf(s),1);p.slides.splice(p.slides.findIndex(s=>s.kind==='transition'&&s.title==='模块与内容'),0,s);}
 // Short stacked notes read as continuous paragraphs; avoid artificial two-line fragments.
 for(const s of p.slides)for(const m of s.modules)if(m.type==='text'&&m.columns===1&&m.parts.length===3)for(const part of m.parts)if(!part.bullet)part.text=part.text.replaceAll('\n','');
 const color=p.slides.find(s=>s.title==='主题色彩与字号口径');if(color){const detail=color.modules.find(m=>m.type==='text');for(const part of detail.parts){part.bullet=false;part.text=part.text.replaceAll('\n','');}color.lead='以科技蓝建立标题与图表层级，使用钢铁红强调关键判断；浅底与字号遵循统一口径。';detail.parts[0].text='科技蓝用于标题、表头与重点线条，浅蓝底用于分组；钢铁红适量强调结论。';}
 const edits=new Map([
  ['PPT pt＝画布 px×0.6。CSS pt＝px×0.75，口径不同。','PPT pt＝画布 px×0.6；CSS pt＝px×0.75，两者口径有差异。'],
  ['页首句补充本页的阅读线索；没有合适首句时可以直接留空。','页首句补充阅读线索；没有合适内容时可以留空。'],
  ['总结条只保留一句关键判断；启用总结前先给底部预留空间。','总结条提炼关键判断；启用前应给底部预留空间。'],
  ['提供真实图表、公式、研究结果与来源。','提供图表、公式与可核验来源。'],
  ['每个文字板块通常控制在四点以内。','每个板块通常不超过四点。'],
  ['按内容选择公式、表格和图文版式。','按内容选择公式或图表版式。'],
  ['检查边缘对齐、密度、孤字与遮挡。','复查对齐、孤字与文字遮挡。'],
  ['替换图像素材，设置媒体的裁剪比例。','换图后检查裁剪比例与取景。'],
  ['双击左侧占位区域打开媒体弹窗；选择本地图片或视频文件。','双击占位区域打开弹窗；选择本地图片或视频。'],
  ['需要时使用等比放大保留重点；选择仅图标题或图标题加说明。','等比放大突出重点；图注可选标题或标题加说明。'],
  ['确认后复查媒体与图注的间隙；不需要图注时取消保留图标题。','确认图注与画面的间隙；无需图注时关闭图标题。'],
  ['参数、学习率和目标函数应与公式页保持一致。','参数与目标函数沿用公式页命名，避免同一符号具有不同含义。'],
  ['图标题说明对象，不堆砌背景；总结条提炼一句清晰的判断。','图标题交代对象；总结条提炼本页的关键判断。'],
  ['补充口头解释与上下页过渡；记录演示步骤、计时和提问提示。','补充口头解释与过渡；记录演示步骤和计时提示。'],
  ['切换页面后备注随当前页更新；保存 HTML 会一并保存备注。','备注随当前页更新；保存 HTML 时一并保留备注。'],
  ['在工作台打开演讲者视图；当前页备注自动显示在画布下方。','打开演讲者视图；当前页备注显示在画布下方。'],
  ['工作台与观众窗口同步页码；不需要浏览器自动管理显示屏。','两个窗口同步页码；目标屏幕由用户手动选择。'],
  ['方向键或普通滚轮用于翻页；Ctrl 加滚轮缩放，左键拖动。','方向键翻页；Ctrl 滚轮缩放，左键拖动查看。'],
  ['论文、图表、公式、结果及引用来源。','论文、图表、公式及引用来源。'],
  ['已有 HTML 可直接作为修改起点。','已有 HTML 可作为修改起点。'],
  ['先检查内容与章节顺序，再调整模块。','检查内容顺序，再调整模块。'],
  ['文字可局部加粗、改色和手动改行距。','文字可加粗、改色与调整行距。'],
  ['媒体可换素材、改比例并保持并列等高。','替换媒体，复查取景与等高。'],
  ['备注用于口头解释，导出前逐页复查。','备注补充讲解，导出前复查。'],
  ['本项目 SKILL.md 说明 AI 工作流程。','SKILL.md 规定 AI 工作流程。'],
  ['学校标识优先核对学校官方网站。','学校标识应核对官网原件。'],
  ['下方链接汇总各校官方资源入口。','下方汇总高校官方资源入口。']
 ]);
 for(const s of p.slides)for(const m of s.modules)for(const part of m.parts)part.text=part.text.split('\n').map(line=>edits.get(line)||line).join('\n');
 collab.modules[0].parts.forEach((part,i)=>part.takeaway=['输入成果：一份标明来源、受众与重点的材料清单。','AI 成果：章节有序、证据可查的初版 HTML。','最终成果：保存 HTML，并复查 PDF 与 PPTX。'][i]);
 source.modules[0].parts.forEach((part,i)=>part.takeaway=['材料不足时先标明缺口，不虚构研究结果或文献。','人工修改后保存 HTML，可继续交给 AI 加工。','资源索引便于检索，最终仍应核对学校官方文件。'][i]);
 const mediaPage=p.slides.find(s=>s.title==='从占位区域插入图片或视频');if(mediaPage)mediaPage.modules.find(m=>m.type==='text').parts[0].takeaway='取景检查：保留图中关键标注与坐标；说明裁剪范围，确保不会改变原始证据的含义。';
 const results=p.slides.find(s=>s.title==='表格展示结果，也交代实验口径');if(results){const m=results.modules.find(m=>m.type==='table');m.headerRows=2;m.scenarioGroups=true;m.rows=[['算法','场景一','','场景二','','场景三',''],['','质量 / % ↑','耗时 / s ↓','质量 / % ↑','耗时 / s ↓','质量 / % ↑','耗时 / s ↓'],...['随机策略','启发式方法','基线方法 A','基线方法 B','局部搜索','消融版本 A','消融版本 B','完整方法'].map(n=>[n,...Array(6).fill('00.00 ± 00.00')])];m.merges=[{top:0,left:0,bottom:1,right:0},...[1,3,5].map(c=>({top:0,left:c,bottom:0,right:c+1}))];}
 return syncSections(polishExample(p));
}
