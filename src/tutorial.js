const OUTLINE=`# Web Slide 交互教学

## 基础设置

### 页面信息与备注练习
### 空白正文与卡片排版
### 文字层级与列表练习

## 内容模块

### 表格练习
### 公式练习
### 图片与视频练习
### 时间轴与图文练习

## 排版与交付

### 高级对齐练习
### 环形文字排版练习
### 备注、放映与导出练习`;

const steps=[
 {group:'开始',title:'欢迎进入交互训练场',text:'这不是视频教程：接下来请直接操作真实工作台。完成一个动作，系统才会带你进入下一步。',notice:'教学统一使用北科科技蓝主模板。红色主题和其他学校版本由同一主模板增量换肤，不重复建设教学。'},
 {group:'主题换肤',title:'从蓝色主模板开始换肤',text:'点击“主题与标志”。接下来把科技蓝主模板改成钢铁红，同时保持页面结构和编辑能力不变。',target:'[data-action="theme"]',event:'click'},
 {title:'先清空第二主题色',text:'第二主题色是可选项。请删除原值，让它在应用时自动跟随新的主色，避免旧蓝色残留。',target:'#theme-secondary',input:'#theme-secondary',allowEmpty:true},
 {title:'清空装饰色',text:'装饰色也是可选项。没有独立配色需求时，让它从主色派生最稳定。',target:'#theme-accent',input:'#theme-accent',allowEmpty:true},
 {title:'清空可选强调色',text:'删除原强调色。以后确有警示、对比或品牌规范时，再单独填写。',target:'#theme-emphasis',input:'#theme-emphasis',allowEmpty:true},
 {title:'设置钢铁红主题色',text:'复制并填写主题色。主题色负责标题、深色卡片、线条和强调关系。',target:'#theme-primary',input:'#theme-primary',copy:'#A31418'},
 {title:'设置配套浅底',text:'继续填写卡片浅底。换主题不能只改深色，浅色卡片也必须联动。',target:'#theme-tint',input:'#theme-tint',copy:'#FCF1EE'},
 {title:'正文保持纯黑',text:'把正文颜色设为纯黑，避免灰字继续带有原科技蓝色相。',target:'#theme-ink',input:'#theme-ink',copy:'#000000'},
 {title:'上传红色独立校徽',text:'点击文件框，在项目根目录进入 tutorial-assets，选择“01-钢铁红-独立校徽.svg”。使用 SVG 才能在放映和放大时保持清晰。',target:'#theme-logo',event:'change',fileStep:true,notice:'确认文件真实存在：tutorial-assets/01-钢铁红-独立校徽.svg'},
 {title:'上传红色校名组合标志',text:'继续在同一目录选择“02-钢铁红-校名组合标志.svg”。封面和需要校名组合标识的页面会使用它。',target:'#theme-wordmark',event:'change',fileStep:true,notice:'确认文件真实存在：tutorial-assets/02-钢铁红-校名组合标志.svg'},
 {title:'点击“应用”',text:'点击弹窗中的“应用”。工作台会用同一套模块结构重绘为钢铁红；校徽和组合标志也可在这个弹窗上传 SVG。',target:'[data-action="theme-dialog-apply"]',event:'click'},
 {group:'大纲教学',title:'先建立文档骨架',text:'点击顶部“文档大纲”。建议先和 AI 确认章节与每页标题，再开始填充正文。',target:'[data-action="outline"]',event:'click'},
 {title:'粘贴练习大纲',text:'复制下面的示例，粘贴到大纲编辑框。# 是总标题，## 是章节，### 是页面。',target:'#outline-text',input:'#outline-text',copy:OUTLINE},
 {title:'选择“更新当前文稿”',text:'本次练习请选择界面中的“更新当前文稿”，让大纲直接作用于当前页面，后续教学才能连续衔接。完成教学后如需一份正文干净的新稿，再单独使用界面中的“另建文稿，沿用当前主题”。',target:'#outline-mode',notice:'工作台中的修改不会自动覆盖磁盘上的蓝色模板；只有你主动执行“保存 HTML”才会写文件。因此退出或刷新后，仍可从原始模板重新进入教学。'},
 {title:'目录开关',text:'勾选后根据章节顺序自动生成目录，章节名与页码范围随页面变化更新。',target:'#outline-toc',notice:'目录条目之后仍可单独隐藏、恢复或补充说明；附录默认不进入目录。'},
 {title:'章节过渡页',text:'勾选后，每个普通章节前生成过渡页；正文左上角的章节标签也由过渡页继承。',target:'#outline-transitions',notice:'没有过渡页的短汇报也可以关闭；附录通常不生成过渡页。'},
 {title:'最后一章作为附录',text:'本练习最后一章仍是正文，请保持未勾选。正式文稿若末章是参考文献、作者简介或补充材料，再勾选此项。',target:'#outline-appendix',notice:'章节标题不必手写“附录”二字，勾选项负责语义与目录规则。'},
 {title:'结束页开关',text:'勾选后保留或生成结束页。封面、过渡页和结束页不显示页脚及页码。',target:'#outline-closing',notice:'正式答辩通常保留；内部短会可按需要关闭。'},
 {title:'点击“应用到当前文稿”',text:'确认应用方式为“更新当前文稿”，再点击界面中的“应用到当前文稿”。页面标题和章节关系会更新，后续教学仍在当前页面中继续。',target:'#outline-apply',event:'click'},
 {group:'页面设置',title:'打开页面信息练习页',text:'请在左侧打开“页面信息与备注练习”。这页专门练习标题、页首句、来源和备注，不与其他内容混在一起。',target:'.slide-thumb',targetText:'页面信息与备注练习',event:'click'},
 {title:'点击“标题、页首句与来源”',text:'在右侧“当前页设置”中点击“标题、页首句与来源”，打开标题、页首句、页尾总结、脚注与备注。',target:'[data-action="page-settings"]',event:'click'},
 {title:'写一条演讲备注',text:'把下面提示复制到“本页备注”。备注不会出现在画面或导出页中，但会在演讲者视图自动跟随。',target:'#page-notes',input:'#page-notes',copy:'本页先交代研究问题，再说明证据来源；结尾用一句话过渡到下一页。'},
 {title:'点击“应用”',text:'点击弹窗中的“应用”，让标题、脚注与备注写回当前页。',target:'[data-action="page-dialog-apply"]',event:'click'},
 {title:'点击“页面备注”',text:'备注保存后不会自动占用画面。点击顶部工具栏中的“页面备注”，在工作台底部显示当前页备注。',target:'[data-action="notes"]',event:'click'},
 {title:'确认备注已经载入',text:'底部停靠区显示当前页备注，可继续直接编辑。单列滚动停到其他页面后，这里会自动切换为对应页面的备注。',target:'#speaker-notes',notice:'备注只供演讲者查看，不印入 PDF 幻灯片；导出 PPTX 时会写入对应页面的原生备注。'},
 {title:'再次点击“页面备注”收起',text:'再次点击同一个“页面备注”按钮即可隐藏停靠区。备注内容仍保存在当前页面中，之后随时可以重新显示。',target:'[data-action="notes"]',event:'click'},
 {group:'模块与内容',title:'进入空白正文练习页',text:'请打开“空白正文与卡片排版”。正文安全区没有预置模块，便于清楚观察插入、缩放和移动如何共同形成可用留白。',target:'.slide-thumb',targetText:'空白正文与卡片排版',event:'click'},
 {title:'从“＋”插入文字卡片',text:'打开顶部“＋”并选择“文字模块”。系统会优先放入连续空白区；若存在多个互不相连的空白区，会让你选择。',target:'#insert-menu',event:'change',selectValue:'text'},
 {title:'选中刚插入的卡片',text:'点击新卡片进入模块编辑。右侧会显示固定锚点、尺寸、位置和子区域设置。',target:'#canvas .module',event:'click'},
 {title:'开启网格与自动吸附',text:'先勾选顶部“网格”。显示网格时，拖动、移动和参考线会自动吸附；关闭网格后才是自由拖动。',target:'#grid-visible',event:'change',selectValue:true},
 {title:'调整网格间距',text:'把网格间距调到24 px。网格越小越适合精调，网格越大越适合快速建立整齐的页面骨架。',target:'#grid-step',event:'input',selectValue:'24'},
 {title:'选择五格快调',text:'在右侧“单次步进”中选择“5格”。尺寸和位置按钮会按“网格间距 × 步进格数”快速调整；也可以长按按钮连续变化，或用 Shift＋单击临时调整5格。',target:'#adjust-multiplier',event:'change',selectValue:'5'},
 {title:'选择缩放锚点',text:'缩放可以固定四角，也可以固定中心。先选择“中心”，观察卡片向两侧同时扩展，便于快速对齐页面中心。',target:'#resize-anchor',event:'change',selectValue:'center'},
 {title:'快速收窄卡片',text:'自动插入会优先使用当前最大的连续空白区，因此卡片初始通常已经最宽。点击一次“收窄”，用5格快调观察卡片围绕中心明显收缩。',target:'[data-resize="w-"]',event:'click'},
 {title:'恢复一格精调',text:'把“单次步进”改回“1格”。大范围关系确定后，使用1格逐步修正边缘、间距和对齐，避免一次跨得太远。',target:'#adjust-multiplier',event:'change',selectValue:'1'},
 {title:'移动卡片位置',text:'点击向右箭头，让卡片按当前网格移动一格。此时24 px网格仍开启，所以卡片位置会保持在网格线上。',target:'[data-move="right"]',event:'click'},
 {title:'增加第二个子区域',text:'点击右侧“＋ 子区域”。同一模块的每个子区域都能独立编辑、排序和删除，适合表达并列关系。',target:'[data-action="add-part"]',event:'click'},
 {title:'增加第三个子区域',text:'再增加一个子区域，使当前文字模块包含3项内容。一个模块通常不超过4个并列要点；更多内容应拆分或换页。',target:'[data-action="add-part"]',event:'click'},
 {title:'观察一列纵向排布',text:'现在已有3个子区域，但列数仍为1，所以它们从上到下排列。子区域数量决定内容项，列数决定这些内容项如何换行。',target:'#module-columns',notice:'先观察画布中的纵向堆叠，再继续改变列数。'},
 {title:'改成两列观察换行',text:'把“列数”改成2列。前两项并排，第三项自动换到下一行；这种形式适合三项内容需要更宽正文时使用。',target:'#module-columns',event:'change',selectValue:'2'},
 {title:'改成三列并排',text:'再把“列数”改成3列。三个子区域会在同一行均分宽度，适合文字长度和信息层级接近的并列内容。',target:'#module-columns',event:'change',selectValue:'3'},
 {title:'选择文本块样式',text:'在“文本块样式”中选择“B2 深色标题带”。样式只负责视觉层级，内容结构和子区域仍可继续调整。',target:'#module-style',event:'change',selectValue:'band'},
 {title:'进入文字编辑',text:'点击“编辑文字”。之后可逐段修改标题与正文，也可以选中局部文字调整字号、粗细、颜色、行距、段后距和对齐。',target:'[data-action="mode-text"]',event:'click'},
 {title:'粘贴一段含公式的正文',text:'点击第一个子区域正文，把示例文字粘贴进去。正文中的 $...$ 会按行内 LaTeX 公式显示。',target:'#canvas [data-field="text"]',input:'#canvas [data-field="text"]',copy:'以目标函数 $J(\\theta)$ 为例，先说明变量含义，再给出优化方向与适用条件。'},
 {title:'选择需要强调的文字',text:'在刚才的正文中拖动选择一句或几个词。文字格式只作用于当前选区；按住 Shift 还可选择多个文字块统一调整。',target:'#canvas [data-field="text"]',event:'mouseup',notice:'选区建立后教学会自动继续，避免点击“继续”时取消文字选择。'},
 {title:'修改选中文字颜色',text:'打开颜色选项并选择“主题色”。也可保留原色、使用强调色或自选颜色；修改只作用于当前选中的文字。',target:'#format-color',event:'change',selectValue:'theme'},
 {title:'修改选中文字字号',text:'将选中文字设为14 pt。文字编辑支持10、12、14、16 pt，并可继续调整粗体、列表、行距、段后距和左中右／两端对齐。',target:'#format-font-size',event:'change',selectValue:'14'},
 {title:'插入表格、公式与图文模块',text:'顶部“＋”统一收纳文字、表格、图片／视频和更多模块。表格支持粘贴或导入；公式保留 LaTeX；图像支持 SVG、裁剪和图注。',target:'#insert-menu',notice:'插入前先找连续空白区；有多个空白区时由用户选择。表格、公式和图片都是真实模块，插入后仍可移动、缩放、增减子区域。'},
 {title:'图文混排与图片替换',text:'媒体模块可包含多个等高子区域。双击图片或占位符即可上传 PNG、JPEG、WebP、SVG 或视频，并调整比例、缩放、取景和图注。',target:'#canvas',notice:'没有图注时不保留多余图注高度；并列图片保持实际等高。图片只是占位符时，也应明确可双击替换。'},
 {title:'同一区域也可放多个模块',text:'先用“圈定范围”划出空白区域，再从“＋”插入独立模块；模块之间不能遮挡，边缘与间距应有明确关系。',target:'[data-action="draw"]',notice:'模块数量不是越多越好。一个文字板块一般不超过4点；超过时先凝练、拆分或换版式。'},
 {group:'表格与公式',title:'打开表格练习页',text:'请打开“表格练习”。这页没有预置正文模块，先插入一张表格，再学习行列、字号、单元格高度和批量替换。',target:'.slide-thumb',targetText:'表格练习',event:'click'},
 {title:'插入表格',text:'从“＋”选择“表格”。表格使用一个区域；插入后可在右侧统一增减行列、调整单元格高度或打开粘贴替换。',target:'#insert-menu',event:'change',selectValue:'table'},
 {title:'打开公式练习页',text:'请打开“公式练习”。公式模块可以有多个子区域，每个子区域包含公式标题、LaTeX 公式和解释文字。',target:'.slide-thumb',targetText:'公式练习',event:'click'},
 {title:'打开“更多模块”',text:'从“＋”选择“更多模块：公式、时间轴等”，打开完整插入弹窗。',target:'#insert-menu',event:'change',selectValue:'more'},
 {title:'选择 LaTeX 公式',text:'把模块类型改为“LaTeX 公式”。',target:'#insert-type',event:'change',selectValue:'formula'},
 {title:'设置两个公式子区域',text:'子区域数量填写2，分别用于目标函数和参数更新。公式较多时可以继续增加，但要同步检查页面高度。',target:'#insert-count',input:'#insert-count',copy:'2'},
 {title:'确认插入公式模块',text:'点击“插入”。之后双击任一公式即可复制或修改 LaTeX；语法错误时系统会要求重新填写。',target:'[data-action="insert-dialog-apply"]',event:'click'},
 {title:'双击打开公式编辑器',text:'双击第一个公式。编辑器会显示可复制的 LaTeX 源码、实时预览和主题色开关。',target:'#canvas [data-formula-part="0"]',event:'dblclick'},
 {title:'修改公式 LaTeX',text:'把示例源码粘贴到编辑框。这里不需要外层 $；若语法错误，系统会保留输入并提示重新修改。',target:'#formula-latex',input:'#formula-latex',copy:'J(\\theta)=\\frac{1}{2m}\\sum_{i=1}^{m}(\\theta^T x_i-y_i)^2'},
 {title:'确认公式修改',text:'检查实时预览后点击“确定”。公式会回到原模块，不会转成不可编辑的截图。',target:'[data-action="formula-dialog-apply"]',event:'click'},
 {title:'编辑公式介绍文字',text:'点击“编辑文字”，然后可修改公式标题和公式下方的解释。公式页不能只有公式，必须说明含义、作用或适用条件。',target:'[data-action="mode-text"]',event:'click'},
 {title:'补充公式解释',text:'在第一条公式下方粘贴说明，交代该式计算什么以及正则项或参数的作用。',target:'#canvas .formula-module [data-field="text"]',input:'#canvas .formula-module [data-field="text"]',copy:'该目标函数衡量预测误差，并通过参数约束控制模型复杂度。'},
 {group:'图片与媒体',title:'打开图片与视频练习页',text:'请打开“图片与视频练习”。这里从空白正文插入含两个子区域的媒体模块。',target:'.slide-thumb',targetText:'图片与视频练习',event:'click'},
 {title:'插入图片／视频模块',text:'从“＋”选择“图片／视频”。插入后可增加子区域；并列媒体必须保持绝对等高。',target:'#insert-menu',event:'change',selectValue:'media'},
 {title:'增加第二个媒体子区域',text:'点击“＋ 子区域”，把媒体模块改为两个并列区域。系统会重新分配宽度，并保持两张画面的绝对高度一致。',target:'[data-action="add-part"]',event:'click'},
 {title:'打开媒体替换弹窗',text:'双击第一个媒体占位区。教学卡片会进入媒体弹窗，继续说明上传、比例、取景和图注设置。',target:'#canvas .media-window',event:'dblclick'},
 {title:'选择练习图片',text:'点击“上传媒体”，从 tutorial-assets/media 选择“01-教学图片-结构.svg”。选择完成后继续设置裁剪比例。',target:'#media-file',event:'change',notice:'练习目录还准备了“02-教学图片-数据.svg”。图片、视频和 SVG 都支持替换。'},
 {title:'选择媒体比例',text:'将裁剪比例改为4:3并观察预览。也可选16:9、1:1、原始比例或自定义比例；并列媒体最终仍需保持实际画面等高。',target:'#media-ratio',event:'change',selectValue:'1.3333333333333333'},
 {title:'应用媒体设置',text:'点击“确定”返回页面。没有图注时应取消“保留图标题”，不要留下无意义的图注高度。',target:'[data-action="media-dialog-apply"]',event:'click'},
 {group:'高级对齐',title:'打开高级对齐练习页',text:'请打开“高级对齐练习”。本页故意放置了三个尺寸相近但位置不齐的板块，便于观察对齐前后的真实差异。',target:'.slide-thumb',targetText:'高级对齐练习',event:'click'},
 {title:'进入模块编辑',text:'点击“编辑模块”，再选择需要作为基准的板块。',target:'[data-action="mode-edit"]',event:'click'},
 {title:'选择一个练习板块',text:'点击画布中的任意练习板块，右侧会出现“高级对齐与分布”。',target:'#canvas .module',event:'click'},
 {title:'进入高级对齐',text:'点击右侧“高级对齐与分布”。参考线可平移或单边拉伸，多选模式可做等距与环形分布。',target:'[data-action="advanced-align"]',event:'click'},
 {title:'关闭参考线吸附',text:'先关闭顶部“网格”。此时拖动纵向或横向参考线不会吸附到网格，适合自由寻找视觉位置。',target:'#grid-visible',event:'change',selectValue:false},
 {title:'重新开启参考线吸附',text:'再次开启“网格”。参考线现在会按当前网格间距吸附，适合建立可重复、可检查的对齐基准。',target:'#grid-visible',event:'change',selectValue:true},
 {title:'多选与等距分布',text:'点击“多选开关”，再在画布中选择多个模块。左／中／右、顶／中／底对齐用于统一边缘，水平／垂直等距用于固定最外边界后平均分配间隙。',target:'[data-align-mode="multi"]',event:'click'},
 {title:'高级排版的边界',text:'纵／横参考线可用于对齐或拉伸；等距分布会展开多子区域参与计算。对齐完成后仍须检查安全区、遮挡、留白和阅读顺序。',target:'#alignment-panel',notice:'对齐只改变几何关系，不替代内容判断；越界或文字溢出的结果不能直接导出。'},
 {title:'最后练习环形分布',text:'完成基础对齐后，再打开“环形文字排版练习”。本页从空白正文开始，先插入独立文字块，再进行环形分布。',target:'.slide-thumb',targetText:'环形文字排版练习',event:'click'},
 {title:'插入第一个独立文字块',text:'从“＋”选择“独立文字块 · 白底深字”。重复插入时先为每个文字块保留近似相同的尺寸。',target:'#insert-menu',event:'change',selectValue:'textbox-light'},
 {title:'为环形准备多个文字块',text:'请继续插入若干独立文字块，建议总数为6。每个文字块只放一个短概念，避免长段文字绕成难读的圆环。',target:'#insert-menu',notice:'可以使用“代我完成本大项”跳过重复插入。进入环形分布前，先统一尺寸并把文字块移动到正文安全区内。'},
 {title:'多选后执行环形分布',text:'进入“编辑模块”，选择一个文字块后打开高级对齐，启用多选并选择全部文字块，再设置环形中心、半径与角度。',target:'[data-action="mode-edit"]',notice:'环形排版完成后仍需检查标题、页首句和页尾区域，不能让文字块越过正文安全区。'},
 {group:'时间轴与图文',title:'时间轴也能变成图文卡片',text:'请在左侧打开“时间轴与图文练习”页。时间轴本质上是可增减、排序的图文子区域，不是固定图片。',target:'.slide-thumb',targetText:'时间轴与图文练习',event:'click'},
 {title:'重新进入模块编辑',text:'点击“编辑模块”，准备选中时间轴本身，而不是修改卡片里的文字。',target:'[data-action="mode-edit"]',event:'click'},
 {title:'选中时间轴模块',text:'点击时间轴中的任意卡片，右侧会显示阶段排序、删除、添加以及“隐藏时间轴装饰”。',target:'#canvas .timeline-grid',event:'click'},
 {title:'切换为普通并列图文',text:'勾选“隐藏时间轴装饰”，年份、连线、圆点和箭头会隐藏，同一组内容立即退化为普通并列图文卡片；再次取消即可恢复。请切换一次。',target:'#hide-timeline',event:'change'},
 {group:'备注与放映',title:'打开放映练习页',text:'请打开“备注、放映与导出练习”。这页集中说明演讲者视图、全屏放映、保存与导出。',target:'.slide-thumb',targetText:'备注、放映与导出练习',event:'click'},
 {title:'页面备注与双窗口放映',text:'请点击“页面备注”查看本页内容。演讲者视图适合双屏：观众窗口只显示画面，工作台保留备注并同步翻页。',target:'[data-action="notes"]',event:'click'},
 {title:'三种浏览与两种正式放映',text:'视图菜单提供单页、单列滚动和多页滚动；正式演示可选“演讲者视图”或“全屏放映”。',target:'#view-mode',notice:'双屏优先演讲者视图：独立观众窗口可拖到投影屏，工作台保留备注并同步翻页。单屏专注画面时用全屏放映；双击进入总览，Ctrl＋滚轮缩放，放大后左键拖动，Esc先复位再退出。'},
 {title:'保存与导出须知',text:'保存 HTML 优先覆盖当前文件，“另存为”保留副本。PDF/PPTX 导出需运行本地服务；PPTX 已尽量贴近 HTML，但仍须人工复核字体、标点断行与引用。',notice:'“演讲者视图”和“全屏放映”是两种并列方式。教学不会替你启动窗口或导出文件，避免打断当前练习。'},
 {title:'训练完成',text:'你已经走完模板、大纲、页面、模块、文字、备注与导出的完整路径。接下来可继续编辑，也可退出教学回到正常工作台。',finish:true}
];

function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
function burst(){const box=el('div','tutorial-reward');box.innerHTML='<strong>✓ 完成</strong><span>操作已掌握</span>';document.body.append(box);for(let i=0;i<18;i++){const p=el('i');p.style.setProperty('--x',`${(Math.random()-.5)*260}px`);p.style.setProperty('--r',`${Math.random()*540}deg`);p.style.background=['#f1b82d','#2ba3c0','#a31418','#005b94'][i%4];box.append(p);}setTimeout(()=>box.remove(),950);}
let cueContext;
function playCue(){
 try{
  cueContext??=new (window.AudioContext||window.webkitAudioContext)();
  const now=cueContext.currentTime,gain=cueContext.createGain();gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.055,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.22);gain.connect(cueContext.destination);
  [620,930].forEach((frequency,i)=>{const tone=cueContext.createOscillator();tone.type=i?'triangle':'sine';tone.frequency.setValueAtTime(frequency,now+i*.045);tone.connect(gain);tone.start(now+i*.045);tone.stop(now+.22);});
 }catch{/* 用户稍后可用自定义音频替换；不让音频能力影响教学流程。 */}
}

export function startTutorial({onSkipTheme}={}){
 if(new URLSearchParams(location.search).get('tutorial')!=='1')return;
 let index=0,target=null,cleanups=[],waitTimer=0;
 const root=el('section','tutorial-guide');root.setAttribute('role','dialog');root.setAttribute('aria-live','polite');
 const progress=el('div','tutorial-progress'),progressLabel=el('div','tutorial-progress-label'),majorRuler=el('div','tutorial-ruler major'),minorRuler=el('div','tutorial-ruler minor'),title=el('h2'),text=el('p'),copyBox=el('div','tutorial-copy'),actions=el('div','tutorial-actions');
 progress.title='按住此处可拖动教学卡片';
 progress.append(progressLabel,majorRuler,minorRuler);
 const exit=el('button','tutorial-exit','退出教学'),skipStep=el('button','','代我完成此步'),skipGroup=el('button','','代我完成本大项'),next=el('button','primary','我已阅读，继续');actions.append(exit,skipStep,skipGroup,next);root.append(progress,title,text,copyBox,actions);document.body.append(root);
 const groupOf=i=>{for(let n=i;n>=0;n--)if(steps[n].group)return steps[n].group;return '开始';};
 const groupNames=[...new Set(steps.map((_,i)=>groupOf(i)))].filter(name=>name!=='开始');
 const groupMeta=i=>{const name=groupOf(i),indices=steps.map((_,n)=>n).filter(n=>groupOf(n)===name),position=indices.indexOf(i)+1,number=groupNames.indexOf(name)+1;return {name,indices,position,number,total:indices.length};};
 let manualPosition=false;
 const placeGuide=control=>{
  if(!control||manualPosition)return;
  const gap=18,pad=16,rect=control.getBoundingClientRect(),w=root.offsetWidth,h=Math.min(root.offsetHeight,innerHeight-pad*2),clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const contextNodes=[control],add=node=>{if(node&&!contextNodes.includes(node))contextNodes.push(node);};
  const owner=control.closest('label,.field-line,.size-grid,.outline-options,.view-controls');add(owner);
  if(owner?.nextElementSibling?.matches('.hint,.file-note,.tutorial-notice'))add(owner.nextElementSibling);
  const inspector=control.closest('.inspector');
  if(inspector){
   const headings=[...inspector.querySelectorAll('h3')],heading=headings.filter(node=>node.compareDocumentPosition(control)&Node.DOCUMENT_POSITION_FOLLOWING).at(-1);
   if(heading){add(heading);for(let node=heading.nextElementSibling;node&&!node.matches('h3,hr');node=node.nextElementSibling)add(node);}
  }
  const boxes=contextNodes.map(node=>node.getBoundingClientRect()).filter(box=>box.width&&box.height),avoid=boxes.reduce((all,box)=>({left:Math.min(all.left,box.left),top:Math.min(all.top,box.top),right:Math.max(all.right,box.right),bottom:Math.max(all.bottom,box.bottom)}),{left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom});
  avoid.left-=8;avoid.top-=8;avoid.right+=8;avoid.bottom+=8;
  const candidates=[
   {x:avoid.right+gap,y:avoid.top},
   {x:avoid.right+gap,y:avoid.bottom-h},
   {x:avoid.right+gap,y:(avoid.top+avoid.bottom-h)/2},
   {x:avoid.left-w-gap,y:avoid.top},
   {x:avoid.left-w-gap,y:avoid.bottom-h},
   {x:avoid.left-w-gap,y:(avoid.top+avoid.bottom-h)/2},
   {x:clamp(rect.left,pad,innerWidth-w-pad),y:avoid.bottom+gap},
   {x:clamp(rect.left,pad,innerWidth-w-pad),y:avoid.top-h-gap}
  ];
  const overlap=(box,bounds)=>Math.max(0,Math.min(box.x+w,bounds.right)-Math.max(box.x,bounds.left))*Math.max(0,Math.min(box.y+h,bounds.bottom)-Math.max(box.y,bounds.top));
  const visible=box=>Math.max(0,Math.min(box.x+w,innerWidth)-Math.max(box.x,0))*Math.max(0,Math.min(box.y+h,innerHeight)-Math.max(box.y,0));
  const distance=box=>Math.hypot(box.x+w/2-(rect.left+rect.right)/2,box.y+h/2-(rect.top+rect.bottom)/2);
  const best=candidates.map(box=>({...box,x:clamp(box.x,pad,Math.max(pad,innerWidth-w-pad)),y:clamp(box.y,pad,Math.max(pad,innerHeight-h-pad))})).map(box=>({...box,score:visible(box)-overlap(box,avoid)*12-overlap(box,rect)*80-distance(box)*3})).sort((a,b)=>b.score-a.score)[0];
  root.style.left=`${clamp(best.x,pad,Math.max(pad,innerWidth-w-pad))}px`;root.style.top=`${clamp(best.y,pad,Math.max(pad,innerHeight-h-pad))}px`;root.style.right='auto';root.style.bottom='auto';
 };
 const startDrag=event=>{if(event.button!==0)return;event.preventDefault();manualPosition=true;const box=root.getBoundingClientRect(),dx=event.clientX-box.left,dy=event.clientY-box.top,move=e=>{const x=Math.max(8,Math.min(innerWidth-root.offsetWidth-8,e.clientX-dx)),y=Math.max(8,Math.min(innerHeight-root.offsetHeight-8,e.clientY-dy));root.style.left=`${x}px`;root.style.top=`${y}px`;root.style.right='auto';root.style.bottom='auto';},up=()=>{removeEventListener('pointermove',move);removeEventListener('pointerup',up);};addEventListener('pointermove',move);addEventListener('pointerup',up,{once:true});};
 progress.addEventListener('pointerdown',startDrag);
 const renderRuler=(meta)=>{
  progressLabel.textContent=meta.number>0?`第 ${meta.number}.${meta.position} 步 · ${meta.name}`:`导览 · ${meta.name}`;
  majorRuler.replaceChildren(...groupNames.map((name,n)=>{const dot=el('span','tutorial-tick major-tick');dot.dataset.label=name;dot.title=name;if(n+1<meta.number)dot.classList.add('done');else if(n+1===meta.number)dot.classList.add('active');return dot;}));
  minorRuler.replaceChildren(...meta.indices.map((stepIndex,n)=>{const dot=el('span','tutorial-tick minor-tick');dot.title=steps[stepIndex].title;if(n+1<meta.position)dot.classList.add('done');else if(n+1===meta.position)dot.classList.add('active');return dot;}));
  minorRuler.hidden=meta.name==='开始';
 };
 const clear=()=>{clearTimeout(waitTimer);for(const dispose of cleanups.splice(0))dispose();document.querySelectorAll('.tutorial-target').forEach(node=>node.classList.remove('tutorial-target'));target=null;};
 const find=(selector,contains)=>{if(!selector)return null;const items=[...document.querySelectorAll(selector)];if(!contains)return items[0];return items.find(node=>{const label=node.matches?.('.slide-thumb')?(node.getAttribute('aria-label')||node.querySelector('.thumb-caption')?.textContent||''):(node.getAttribute('aria-label')||node.textContent||'');return label.includes(contains);});};
 const leaveModal=()=>{const modal=root.closest('dialog');root.classList.remove('tutorial-modal');if(modal){document.body.append(root);modal.close();}};
 const go=(nextIndex,{closeModal=false,reward=false}={})=>{if(closeModal)leaveModal();clear();index=Math.max(0,Math.min(steps.length-1,nextIndex));playCue();if(reward)burst();setTimeout(show,120);};
 const waitFor=selector=>new Promise((resolve,reject)=>{let tries=0;const check=()=>{const node=document.querySelector(selector);if(node)return resolve(node);if(++tries>40)return reject(Error('教学控件未出现'));setTimeout(check,100);};check();});
 const setValue=(node,value)=>{if(node.isContentEditable)node.textContent=value;else node.value=value;node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));};
 const autoStep=()=>{const step=steps[index];if(step.input){const input=find(step.input);setValue(input,step.copy??'');return;}if(step.fileStep){onSkipTheme?.();go(index+1,{reward:true});return;}if(step.selectValue!==undefined&&target){if(target.type==='checkbox')target.checked=Boolean(step.selectValue);else target.value=step.selectValue;target.dispatchEvent(new Event(step.event||'change',{bubbles:true}));return;}if(step.event&&target){target.click();return;}go(index+1,{reward:true});};
 const autoGroup=async()=>{const meta=groupMeta(index),nextIndex=meta.indices.at(-1)+1;try{
  if(meta.name==='主题换肤')onSkipTheme?.();
  else if(meta.name==='大纲教学'){
   let dialog=document.querySelector('#outline-dialog');if(!dialog){document.querySelector('[data-action="outline"]')?.click();dialog=await waitFor('#outline-dialog');}
   setValue(dialog.querySelector('#outline-text'),OUTLINE);dialog.querySelector('#outline-mode').value='current';dialog.querySelector('#outline-mode').dispatchEvent(new Event('change',{bubbles:true}));for(const id of ['outline-toc','outline-transitions','outline-closing']){const box=dialog.querySelector('#'+id);if(!box.checked)box.click();}const appendix=dialog.querySelector('#outline-appendix');if(appendix.checked)appendix.click();await new Promise(resolve=>setTimeout(resolve,180));dialog.querySelector('#outline-apply')?.click();await new Promise(resolve=>setTimeout(resolve,180));
  }else if(meta.name==='页面设置'){
   let dialog=document.querySelector('#page-dialog');if(!dialog){document.querySelector('[data-action="page-settings"]')?.click();dialog=await waitFor('#page-dialog');}setValue(dialog.querySelector('#page-notes'),'本页先交代研究问题，再说明证据来源；结尾用一句话过渡到下一页。');dialog.querySelector('[data-action="page-dialog-apply"]')?.click();
  }else if(meta.name==='模块与内容')document.querySelector('[data-action="mode-text"]')?.click();
  else if(meta.name==='高级对齐')document.querySelector('[data-action="advanced-close"]')?.click();
  else if(meta.name==='时间轴与图文'){const toggle=document.querySelector('#hide-timeline');if(toggle&&!toggle.checked)toggle.click();}
  else if(meta.name==='备注与放映'){const notes=document.querySelector('#notes-toggle');if(notes?.getAttribute('aria-pressed')!=='true')notes?.click();}
  go(nextIndex,{closeModal:true,reward:true});
 }catch(error){const n=el('aside','tutorial-notice');n.innerHTML='<strong>自动完成失败</strong><span></span>';n.querySelector('span').textContent=error.message+'，请完成当前控件或退出后重新进入教学。';copyBox.append(n);}};
 const show=()=>{
  clear();manualPosition=false;root.style.removeProperty('left');root.style.removeProperty('top');root.style.removeProperty('right');root.style.removeProperty('bottom');const step=steps[index],meta=groupMeta(index);renderRuler(meta);title.textContent=step.title;text.textContent=step.text;copyBox.replaceChildren();
  skipStep.hidden=step.finish;skipGroup.hidden=step.finish||meta.name==='开始';next.hidden=!!step.event;next.textContent=step.finish?'完成并退出':step.input?'完成填写，继续':'我已阅读，继续';
  if(step.notice){const n=el('aside','tutorial-notice');n.innerHTML='<strong>必读告示</strong><span></span>';n.querySelector('span').textContent=step.notice;copyBox.append(n);}
  if(step.copy){const pre=el('pre','tutorial-copy-text',step.copy),button=el('button','','复制练习内容');button.type='button';button.onclick=async()=>{try{await navigator.clipboard.writeText(step.copy);button.textContent='已复制 ✓';}catch{pre.focus();const range=document.createRange();range.selectNodeContents(pre);getSelection().removeAllRanges();getSelection().addRange(range);button.textContent='已选中，请按 Ctrl+C';}};copyBox.append(pre,button);}
  const bind=()=>{
   if(index>=steps.length)return;target=find(step.target,step.targetText);if(!target){waitTimer=setTimeout(bind,180);return;}const modal=target.closest('dialog[open]');root.classList.toggle('tutorial-modal',!!modal);if(modal&&!modal.contains(root))modal.append(root);else if(!modal&&!document.body.contains(root))document.body.append(root);document.querySelectorAll('.tutorial-target').forEach(node=>node.classList.remove('tutorial-target'));target.classList.add('tutorial-target');target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});requestAnimationFrame(()=>placeGuide(target));const reposition=()=>placeGuide(target);addEventListener('resize',reposition);addEventListener('scroll',reposition,true);cleanups.push(()=>{removeEventListener('resize',reposition);removeEventListener('scroll',reposition,true);});
   if(step.event){const watched=target,done=()=>advance();watched.addEventListener(step.event,done,{once:true});cleanups.push(()=>watched.removeEventListener(step.event,done));}
   if(step.input){const input=find(step.input),done=()=>{if(step.allowEmpty||input.value.trim())advance();},paste=()=>setTimeout(done,30);input.addEventListener('change',done,{once:true});input.addEventListener('paste',paste,{once:true});cleanups.push(()=>{input.removeEventListener('change',done);input.removeEventListener('paste',paste);});
    if(step.input==='#outline-text'){const file=document.querySelector('#outline-file'),stepIndex=index,onFile=()=>{const timer=setTimeout(()=>{if(index===stepIndex&&input.value.trim())advance();},120);cleanups.push(()=>clearTimeout(timer));};file?.addEventListener('change',onFile,{once:true});if(file)cleanups.push(()=>file.removeEventListener('change',onFile));}
   }
   if(meta.name==='大纲教学'){const apply=document.querySelector('#outline-apply'),finish=()=>{const nextIndex=meta.indices.at(-1)+1;setTimeout(()=>{if(groupOf(index)==='大纲教学')go(nextIndex,{closeModal:true,reward:true});},0);};apply?.addEventListener('click',finish,{once:true});if(apply)cleanups.push(()=>apply.removeEventListener('click',finish));}
  };bind();
 };
 const advance=()=>{if(root.closest('dialog'))document.body.append(root);clear();playCue();burst();if(index>=steps.length-1){root.remove();history.replaceState(null,'',location.pathname+location.hash);return;}index++;setTimeout(show,280);};
 next.onclick=advance;
 skipStep.onclick=autoStep;
 skipGroup.onclick=autoGroup;
 exit.onclick=()=>{leaveModal();clear();root.remove();history.replaceState(null,'',location.pathname+location.hash);};show();
}
