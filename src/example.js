import {augmentExample} from './example-pages.js';
import {applyLishuiVariant} from './school-variants.js';
import {blankSlide,makePage,moduleOf,part,syncSections} from './model.js';

// Shared editable guide; school variants are derived from the USTB master.
function baseExample({logo='',wordmark=''}={}){
 const theme={name:'丽水学院',primary:'#0F6674',secondary:'#248B96',accent:'#D8AB64',emphasis:'#A55240',tint:'#EDF6F5',ink:'#18383F',logo,wordmark};
 const pages=[];
 const text=(style,rect,items,columns=items.length)=>{const m=moduleOf('text',rect,items.length);m.style=style;m.columns=columns;m.headerWidth=90;m.parts=items.map(([title,body,extra={}])=>({...part(),title,text:body,bullet:true,...extra}));return m;};
 const whole={x:58,y:256,w:1484,h:554},left={x:58,y:256,w:724,h:554},right={x:806,y:256,w:736,h:554};
 const quadrants=[{x:58,y:256,w:724,h:265},{x:806,y:256,w:736,h:265},{x:58,y:545,w:724,h:265},{x:806,y:545,w:736,h:265}];
 function body(title,lead,modules,notes){const s={...blankSlide(),title,lead,modules,notes,footer:'丽水学院 · Web Slide 使用示例',source:'操作示例 · 内容与数据仅作演示'};pages.push(s);return s;}
 function chapter(title,lead,notes){const s={...makePage('transition'),title,lead,notes,footer:'丽水学院 · Web Slide 使用示例'};pages.push(s);return s;}
 pages.push({...makePage('cover'),title:'把研究讲清楚\nWeb Slide 制作与演示指南',lead:'主题定制 · 模块排版 · 媒体编排 · 备注与放映',presenter:'Web Slide 示例团队',institute:'丽水学院 · 教学与科研演示',date:'2026 年 10 月',notes:'开场说明：这是一套可编辑的工具使用示例，不是学校官方发布的演示模板。配色从用户提供的校徽中取样。先说明需求，再演示编辑、媒体、备注和交付流程。'});
 const toc=makePage('toc');toc.title='从一页内容到完整演示';toc.lead='按制作、编排、演示与交付四个环节组织内容，章节标题与过渡页保持同步。';toc.notes='介绍四个章节。目录名称来自过渡页，章节下面的补充说明可独立修改。单击目录标题可跳转。';pages.push(toc);
 chapter('制作起步','先统一主题与文字口径，再安排每页需要回答的问题。','本章重点不是装饰，而是统一主题、字号和页面结构；让听众能迅速定位当前章节与核心结论。');
 body('先讲清楚，再安排版式','把一页内容压缩成一个问题、几条证据和一句结论，版式随信息结构选择。',[
  text('numbered',whole,[
   ['明确本页任务','先写清这一页回答什么\n确定听众需要了解的背景\n区分核心结论与补充说明\n为每组材料设置分项标题\n避免一页同时讨论多件事\n保留能够支持结论的证据\n将推导细节写进页面备注',{subheading:'从问题开始',showSubheading:true,annotation:'正文固定 16 pt，先减内容再加密。',showAnnotation:true}],
   ['建立信息层级','主标题指出当前研究主题\n页首句交代阅读这页的线索\n分项标题概括各区域内容\n正文逐条解释过程和证据\n图标题说明图像表达的对象\n来源脚注保留可追踪的链接\n总结条提炼这一页的发现',{subheading:'让层级可见',showSubheading:true,annotation:'标题靠字号与位置分层，不只靠加粗。',showAnnotation:true}],
   ['完成阅读检查','检查标题是否清晰且简洁\n确认并列段落的语义一致\n避免末行只剩少量孤字\n复查图注与图像之间的距离\n确认模块没有遮挡和越界\n把长解释转移到讲解备注\n最后预览一次完整的阅读顺序',{subheading:'从听众出发',showSubheading:true,annotation:'每次改动后复查，避免只看局部。',showAnnotation:true}]
  ])],'讲解顺序：先看左栏的内容筛选，再看中栏的信息层级，最后看右栏的检查动作。序号使用 20 pt Times New Roman 加粗；大标题、正文和注释各有明确层级。');
 const fontTable=moduleOf('table',{x:58,y:256,w:860,h:554});fontTable.rows=[['文字角色','PPT 字号','画布 px'],['封面与尾页标题','40 pt','67 px'],['正文页主标题','28 pt','47 px'],['模块大标题 / C3 序号','20 pt','33 px'],['分项标题','18 pt','30 px'],['普通正文 / 总结条','16 pt','27 px'],['图标题 / 章节名称','14 pt','23 px'],['图注补充说明','12 pt','20 px'],['脚注与页码','10 pt','17 px'],['表格内部文字','8–14 pt','13–23 px']];
 body('主题色彩与字号口径','以校徽中的青蓝色为主色，统一标题、表头和强调区域；浅底只用于辅助分组。',[
  fontTable,text('unified',{x:942,y:256,w:600,h:554},[
   ['配色说明','青蓝主色来自所提供的校徽。\n浅底搭配深字，深底搭配白字。',{bullet:false}],
   ['换算说明','PPT pt＝画布 px×0.6。\nCSS pt＝px×0.75，口径不同。',{bullet:false}],
   ['使用原则','正文不因拥挤而自动变小。\n表格可在 8–14 pt 内自适应。',{bullet:false}]
  ],1)
 ],'表格是字号规范示例，px 按常用 PPT 字号折算并四舍五入。这里的青蓝配色是从现有图形资源取样，不声称是学校官方完整 VI 标准。图标题 14 pt，表格 8–14 pt。');
 body('页面结构：引导、证据与结论','页首句可以省略；需要总结时，使用独立的主题色总结条，避免压住正文。',[
  text('ribbon',{x:58,y:256,w:1484,h:410},[
   ['页眉与首句','过渡页决定后续内容页的章节\n左上角章节名称保持单行显示\n正文主标题使用当前主题色\n页首句补充本页的阅读线索\n没有合适首句时可以直接留空\n正文与分割线之间保留呼吸'],
   ['总结与来源','总结条只保留一句关键判断\n启用总结前先给底部预留空间\n左下角脚注可改为团队名称\n右侧来源应说明材料出自何处\n引用网页时保留可点击的链接\n备注承载无需印在页内的细节']
  ]),text('note',{x:58,y:690,w:1484,h:120},[['提示','不要用总结条或注释遮盖正文；内容放不下时应删改、调整模块或另起一页。',{bullet:false}]])
 ],'先说明顶部信息的作用，再强调可选项：页首句、总结条与来源。提示条展示 C1 无标题备注样式，它与演讲者备注不是同一件事。');
 chapter('模块与内容','按信息类型插入模块，再按阅读顺序分配空间。','这一章结合真实控件介绍四种模块、十种文本样式、媒体自定义比例与表格。');
 body('四类模块，各有自己的任务','编辑内容与编辑模块分开进行：先决定区域结构，再填写文字、图像和数据。',[
  text('unified',quadrants[0],[['文字模块','概述问题、解释方法、列出研究结论。\n可设置子区域、列数与列表前导符。\n样式切换保留原有标题和正文。']]),
  text('cards',quadrants[1],[['表格模块','导入 Excel、CSV 或粘贴表格数据。\n表头深底白字，数值保持必要间距。\n表格过密时应扩大区域或拆成两页。']]),
  text('band',quadrants[2],[['图片／视频模块','双击占位区域上传图片或视频。\n先选裁剪比例，再调整取景位置。\n图标题和说明在画面下方独立排布。']]),
  text('plain',quadrants[3],[['几何图形模块','用于表达方向或提供适量强调。\n几何箭头可按网格单向伸缩。\n图片始终等比缩放，不能强行拉长。']])
 ],'这页同时展示默认、A1、A2、A3 四种基本样式。这里均为可编辑文字模块；真正的表格和媒体模块会在后面两页示范。');
 body('标题装饰要服务内容层级','样式编号便于复用：双击文本模块空白处，悬停预览，确认后再应用。',[
  text('ribbon',quadrants[0],[['B1 折角飘带','适合概括一组证据或关键步骤。\n白底文字框与折角边缘保持对齐。\n标题长度可调，正文仍按标准字号。']]),
  text('capsule',quadrants[1],[['B2 圆角标题','适合并列的研究方向或工作任务。\n深色标题建立清晰的视觉入口。\n并列区域应保持相同层级与间隙。']]),
  text('arrow',quadrants[2],[['B3 五角箭头','适合描述推进过程或方法路径。\n箭头表达方向，不替代文字说明。\n控制装饰范围，避免压住正文内容。']]),
  text('numbered',quadrants[3],[['C3 序号标题','适合有先后次序的步骤与检查。\n序号采用 20 pt Times New Roman 粗体。\n正文、子标题和补充注释分层设置。']])
 ],'可演示双击打开样式编号列表：只悬停不会改变当前样式，点击应用才提交。B1 的白框左沿与折角右沿对齐；C3 的数字不是装饰字体。');
 const grouped=text('group',right,[['先解释区域关系','模块大标题概括这一组信息。\n内部小标题说明各自的研究任务。\n不同层级使用不同字号。'],['再安排文字密度','内部固定使用无底色默认分组。\n以留白和细线区分并列内容。\n必要时调整列数，不增加多余白底。']],1);grouped.groupTitle='C2 组合分组：先总后分';
 body('组合分组与备注式说明','同一页可以组合不同样式，但相同角色应保持相同字号、对齐方式和间距。',[
  text('plain',quadrants[0],[['默认样式：直接、清楚','适合正文说明与普通研究条目。\n用小标题和细线组织平行内容。\n浅色卡片是选择，不是每段都要加。']]),
  text('note',quadrants[2],[['C1','备注式浅底适合补充条件与使用范围。\n它没有独立标题，避免争夺阅读焦点。\n说明应与旁边的内容存在明确联系。\n需要长篇讲解时，可写入页面备注。',{bullet:false}]]),grouped
 ],'说明两种“备注”的区别：C1 是幻灯片上的补充文本块，会出现在导出页面里；演讲者页面备注位于画布外，仅在正常视角显示，PPTX 中进入备注页。');
 const mediaGuide=moduleOf('media',left,1);mediaGuide.parts[0].caption='图 1　双击这里，插入自己的图片或视频';mediaGuide.parts[0].note='支持 PNG、JPEG、WebP、MP4、WebM；单个媒体不超过 25 MB。';
 body('从占位区域插入图片或视频','先保留图注所需的空间，再上传材料、选择比例并调整取景，最后复查画面与文字。',[
  mediaGuide,text('numbered',right,[['操作路径','双击左侧占位区域打开媒体弹窗\n选择本地图片或视频文件\n从预设或自定义宽高比中选择\n用水平、垂直取景调整画面位置\n需要时使用等比放大保留重点\n选择仅图标题或图标题加说明\n确认后复查媒体与图注的间隙\n不需要图注时取消保留图标题',{subheading:'保持原始比例，避免单向拉伸',showSubheading:true,annotation:'PDF 显示视频静态帧；PPTX 可内嵌视频。',showAnnotation:true}]])
 ],'实际演示可双击左侧占位符。图片和视频都使用同一个媒体弹窗；只有几何图形允许单向伸缩。视频能否播放取决于目标设备的编解码支持。');
 const logos=moduleOf('media',{x:58,y:256,w:1484,h:280},2);
 if(logo)logos.parts[0].asset={src:logo,kind:'image',ratio:729/755,naturalRatio:729/755,fit:'contain',ratioMode:'original',zoom:1,cx:50,cy:50};
 if(wordmark)logos.parts[1].asset={src:wordmark,kind:'image',ratio:3500/978,naturalRatio:3500/978,fit:'contain',ratioMode:'original',zoom:1,cx:50,cy:50};
 logos.parts[0].caption='图 2　独立校徽：原始比例';logos.parts[1].caption='图 3　组合标识：原始比例';logos.parts.forEach(p=>p.captionMode='title');
 body('比例可以不同，画面高度必须一致','以两份用户提供的校方标识为例：保留各自比例，统一并列画面的实际高度。',[
  logos,text('cards',{x:58,y:560,w:724,h:250},[['自由指定比例','自定义宽、高可使用小数，如 2.35:1。\n输入必须为正数；设置会随 HTML 保存。\n再次打开媒体弹窗仍保留原来的选择。']]),
  text('cards',{x:806,y:560,w:736,h:250},[['等高不等于拉伸','同一行使用所有媒体都能容纳的高度。\n宽度随比例改变，图注在画面下方对齐。\n图注长短不同，也不改变并列画面的高度。']])
 ],'这页实际使用丽水学院的两份资源，既展示标志也验证不同宽高比的等高布局。完整标识不能拉伸；左右画面等高，宽度不同是预期结果。');
 const resultTable=moduleOf('table',{x:58,y:256,w:1484,h:430});resultTable.rows=[['方法','场景一 · 质量 ↑','场景一 · 耗时 ↓','场景二 · 质量 ↑','场景二 · 耗时 ↓'],...['基线方法 A','基线方法 B','对比方法 C','局部搜索','消融版本','完整方法'].map(n=>[n,'00.00 ± 00.00','00.00 ± 00.00','00.00 ± 00.00','00.00 ± 00.00'])];
 body('表格展示结果，也交代实验口径','表内数值均为格式占位，正式汇报应替换为真实结果，并说明指标、单位与统计方式。',[
  resultTable,text('note',{x:58,y:710,w:1484,h:100},[['','实验口径：补齐场景参数、测试集、重复次数及计时范围；统一均值与标准差的计算方式。',{bullet:false}]])
 ],'这里没有真实实验数据。提醒听众：↑ 表示指标越大越好，↓ 表示越小越好；数字两侧要有半个字符以上间距。导入 Excel 时读取已保存的显示值，不执行宏。');
 chapter('预览与演示','浏览时看结构，放映时看节奏，备注只服务演讲者。','这一章介绍单页、多页浏览、逐页备注和手动双窗口演示。本轮不自动检测或指定系统显示屏。');
 body('用三种视图检查同一份内容','编辑时专注当前页，检查时回到整套文稿；视图切换不会改变模块的真实坐标。',[
  text('band',whole,[
   ['单页展示','一次查看当前选中的一页\n适合精修文字、图片和表格\n点击缩略图可快速切换页面\n切换编辑文字或编辑模块\n再次点击已选模式即可取消\n无选中状态方便直接预览\n必要时打开网格检查边距\n最后确认这一页的阅读顺序'],
   ['单列滚动','按顺序纵向查看整套文稿\n适合检查章节之间的过渡\n通过左侧缩略图定位页面\n激活当前页后继续编辑\n观察相邻页面的密度变化\n检查标题、页码和来源口径\n避免连续多页只有零散文字\n也避免某一页突然过度拥挤'],
   ['多页滚动','可选每行一到六页的总览\n适合检查整套文稿的节奏\n比较不同章节的内容占比\n发现重复版式和信息空洞\n双击目标缩略页进入放映\n放映双击可看每行四页总览\n再次双击指定页继续讲解\n预览应覆盖整套而非只看首页']
  ])],'这页适合实际切换工具栏视图。重复点击编辑文字或编辑模块可进入无编辑选中状态，不需要通过放映才能看干净的页面。');
 const notesGroup=text('group',whole,[['页面内放必要内容','正文只写听众需要阅读的信息\n图表说明应与当前研究问题对应\n图标题说明对象，不堆砌背景\n总结条提炼一句清晰的判断\n引用来源保留必要的可追踪链接\n段末孤字可通过改写或分句处理\n保持字号不变，不靠缩小字体硬塞'],['页面外留讲解备注','点击页面备注可显示或隐藏\n每一页的备注独立保存\n补充口头解释与上下页过渡\n记录演示步骤、计时和提问提示\n切换页面后备注随当前页更新\n保存 HTML 会一并保存备注\n导出 PPTX 时备注进入原生备注页']],2);notesGroup.groupTitle='观众阅读与口头讲解，分别安排';
 body('逐页备注：给演讲者留一份讲解线索','画布外的备注可选择性显示；它不占正文安全区，也不会印在 PDF 幻灯片中。',[notesGroup],'演示备注开关。可以把这段内容改成自己的讲解提纲，切换到其他页，再回来确认备注独立保存。PPTX 导出后，可在备注区域继续修改。');
 body('双窗口演示：一个看内容，一个看提示','点击演讲者视图，当前工作台保留备注；新窗口只展示幻灯片，手动移到目标屏幕即可。',[
  text('ribbon',{x:58,y:256,w:1484,h:410},[
   ['演讲者保留正常视角','在工作台打开演讲者视图\n当前页备注自动显示在画布下方\n可以切页，也可选择隐藏备注\n工作台与观众窗口同步页码\n不需要浏览器自动管理显示屏\n结束双窗口后继续正常编辑'],
   ['观众窗口专注画面','允许浏览器打开一次独立窗口\n手动拖到投影屏或第二块屏幕\n点击进入全屏后开始演示\n方向键或普通滚轮用于翻页\nCtrl 加滚轮缩放，左键拖动\n双击总览，再双击指定页面返回']
  ]),text('note',{x:58,y:690,w:1484,h:120},[['','放大时第一次 Esc 恢复原始大小；再按一次结束放映。观众窗口不会接收页面备注。',{bullet:false}]])
 ],'本轮按用户偏好不做自动选屏。若弹出窗口被浏览器拦截，请允许本站弹窗，或者使用原有当前窗口全屏。观众窗口只接收移除了 notes 字段的文稿。');
 chapter('保存与交付','保留可继续编辑的源稿，再生成适合阅读与汇报的输出文件。','最后确认 HTML、PDF 和 PPTX 各自的用途，以及哪些内容会被保存或导出。');
 const delivery=body('三种文件，各自承担一种任务','先保存 HTML 源稿，再导出 PDF 与可编辑 PPTX；交付前至少做一次完整预览。',[
  text('numbered',{x:58,y:256,w:1484,h:470},[
   ['HTML：继续编辑','名称显示在 Web Slide 旁边\n点击名称可修改文稿文件名\n样式、素材和备注均内嵌\n可离线编辑、保存和放映\n需要导出时拖回本地工作台\n不要只依赖浏览器临时草稿\n正式修改后另存一个新版本'],
   ['PDF：稳定阅读','按标准宽屏输出十六比九\n没有 A4 白边或浏览器页眉\n视频在 PDF 中显示静态画面\n演讲者备注不进入可见页面\n检查图表和来源是否清楚\n确认长链接和换行没有越界\n适合打印、发送与归档阅读'],
   ['PPTX：继续汇报','文字与表格单元格保持可编辑\n图片和视频作为独立对象输出\n章节名称明确关闭自动换行\n正文主标题使用当前主题色\n并列媒体保持相同绝对高度\n页面备注写入原生备注区域\n目标电脑仍需核对字体与播放']
  ])
 ],'交付前做一遍从封面到尾页的放映。PDF 关注稳定阅读，PPTX 关注可编辑性和目标设备兼容。不要把浏览器看起来正确当成导出文件一定正确。');delivery.summary='交付前检查：内容准确、层级清楚、无孤字、无越界、媒体等高、来源可追踪。';
 pages.push({...makePage('closing'),title:'清楚表达，留出呼吸',lead:'以内容为中心，用一致的规范完成每一次研究汇报。',presenter:'Web Slide 示例团队',institute:'丽水学院 · 教学与科研演示',date:'制作与演示指南',notes:'结束时总结三个关键词：一致、可读、可编辑。邀请听众提出对内容与工具使用的建议。'});
 const chapters=pages.filter(s=>s.kind==='transition');const descriptions=['主题、字号与页面结构','文字样式、媒体与表格','浏览模式、逐页备注与手动双窗口','HTML、PDF、PPTX 与交付检查'];
 toc.tocNotes=Object.fromEntries(chapters.map((c,i)=>[c.id,descriptions[i]]));
 return syncSections({version:1,title:'丽水学院_WebSlide制作与演示指南',theme,grid:20,slides:pages});
}

export function createExample(options={}){const p=augmentExample(baseExample(options),options);return options.school==='lishui'?applyLishuiVariant(p,options):p;}
