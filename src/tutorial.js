const TUTORIAL_PROGRESS_VERSION=7;
const TUTORIAL_RUNTIME_ID=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
let tutorialMemoryProgress=null;
function readTutorialProgress(){const saved=tutorialMemoryProgress;return saved?.version===TUTORIAL_PROGRESS_VERSION&&Number.isInteger(saved.index)?saved:null;}
function writeTutorialProgress(index,state={}){tutorialMemoryProgress={version:TUTORIAL_PROGRESS_VERSION,index,runtimeId:TUTORIAL_RUNTIME_ID,updatedAt:Date.now(),...state};}
function clearTutorialProgress(){tutorialMemoryProgress=null;}
export function hasTutorialProgress(){return !!readTutorialProgress();}
let activeTutorialDestroy=null;

const OUTLINE=`# Web Slide 交互教学

## 基础设置

### 页面信息与备注练习
### 空白正文与卡片排版

## 内容模块

### 表格练习
### 公式练习
### 图片与视频练习

## 排版与交付

### 高级对齐练习
### 环形文字排版练习
### 时间轴与图文练习
### 备注、放映与导出练习`;

const TABLE_TEXT=`方法\t准确率 / % ↑\tRMSE ↓\t耗时 / ms ↓
基线方法\t84.6\t0.218\t42.3
改进方法 A\t87.9\t0.193\t39.8
改进方法 B\t89.4\t0.181\t37.5
本文方法\t91.2\t0.164\t35.7`;

const groupCatalog=[
 {name:'主题换肤',page:'主题与标志',summary:'逐项修改主题色、浅底、正文色与学校标志。'},
 {name:'大纲教学',page:'文档大纲',summary:'粘贴三级大纲，建立章节、目录和页面标题。'},
 {name:'页面设置',page:'页面信息与备注练习',summary:'设置标题、页首句、来源、页尾总结和备注。'},
 {name:'模块编辑',page:'空白正文与卡片排版',summary:'插入卡片，调整网格、尺寸、位置、样式与子区域。'},
 {name:'文字编辑',page:'空白正文与卡片排版',summary:'局部修改字号、颜色、列表、间距、对齐和行内公式。'},
 {name:'表格编辑',page:'表格练习',summary:'导入与批量替换数据，调整行列、字号、行高和样式。'},
 {name:'公式编辑',page:'公式练习',summary:'插入公式模块，编辑 LaTeX、解释文字和公式颜色。'},
 {name:'图片与媒体',page:'图片与视频练习',summary:'上传素材，调整比例、取景、并列等高与图标题。'},
 {name:'高级对齐',page:'高级对齐练习',summary:'练习参考线、标尺、吸附、单边拉伸和多选等距。'},
 {name:'环形分布',page:'环形文字排版练习',summary:'实时调整半径与角度，并二次编辑已有环形组合。'},
 {name:'时间轴与图文',page:'时间轴与图文练习',summary:'增删与排序阶段，并切换为普通并列图文卡片。'},
 {name:'备注与放映',page:'备注、放映与导出练习',summary:'使用备注、演讲者视图、全屏放映、保存和导出。'}
];

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
 {title:'选择“更新当前文稿”',text:'本次练习请选择界面中的“更新当前文稿”，让大纲直接作用于当前页面，后续教学才能连续衔接。需要独立新稿时，可选“另建文稿并复制旧页”保留已匹配版式，或选“另建空白页原稿”只建立干净结构。',target:'#outline-mode',notice:'工作台中的修改不会自动覆盖磁盘上的蓝色模板；只有你主动执行“保存 HTML”才会写文件。因此退出或刷新后，仍可从原始模板重新进入教学。'},
 {title:'目录开关',text:'勾选后根据章节顺序自动生成目录，章节名与页码范围随页面变化更新。',target:'#outline-toc',notice:'目录条目之后仍可单独隐藏、恢复或补充说明；附录默认不进入目录。'},
 {title:'本练习不生成章节过渡页',text:'确认“章节过渡页”保持未勾选，避免教学文稿增加不参与练习的页面。正式长汇报可按需要开启，正文左上角的章节标签仍会跟随大纲。',target:'#outline-transitions',notice:'短汇报或操作教学通常不需要过渡页；附录一般也不生成过渡页。'},
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
 {group:'模块编辑',title:'进入空白正文练习页',text:'请打开“空白正文与卡片排版”。正文安全区没有预置模块，便于清楚观察插入、缩放和移动如何共同形成可用留白。',target:'.slide-thumb',targetText:'空白正文与卡片排版',event:'click'},
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
 {title:'改成三列并排',text:'把“列数”改成3列。三个子区域会在同一行均分宽度，适合文字长度和信息层级接近的并列内容；两列仍可按实际内容随时选择，不再单列教学步骤。',target:'#module-columns',event:'change',selectValue:'3'},
 {title:'切换为 A3 卡片样式',text:'自动插入使用的默认样式只是起点，并非必须保留。打开“文本块样式”，切换为“A3 深底标题”，观察深色标题带、白字标题和浅底正文形成的层级；内容结构与子区域仍可继续调整。',target:'#module-style',event:'change',selectValue:'band'},
 {group:'文字编辑',title:'进入文字编辑',text:'点击“编辑文字”。之后可逐段修改标题与正文，也可以选中局部文字调整字号、粗细、颜色、行距、段后距和对齐。',target:'[data-action="mode-text"]',event:'click'},
 {title:'粘贴一段含公式的正文',text:'点击第一个子区域正文，把示例文字粘贴进去。先观察 $...$ 仍以可复制、可修改的 LaTeX 源码显示；行内公式只承担符号提示，不宜写成会撑高行距的复杂推导。',target:'#canvas [data-field="text"]',input:'#canvas [data-field="text"]',copy:'以目标函数 $J_{\\theta}$ 为例，先说明变量含义，再给出优化方向与适用条件。'},
 {title:'同一位置预览行内公式',text:'勾选顶部的小型“MD”开关。当前文字会在原位置由 $...$ 源码变成排版公式，整份文档中的说明文字也会统一切换；系统同时暂时退出文字编辑，便于检查真实版面。',target:'#document-markdown-preview',event:'change',selectValue:true,notice:'请对照刚才的源码：句子内容和位置保持不变，只有 $...$ 部分变成数学排版。'},
 {title:'切回源码核对可编辑性',text:'取消勾选“MD”，同一位置重新显示完整 $...$ 源码。这个开关属于整个文档并随 HTML 保存，不需要逐个模块或子区域重复设置。',target:'#document-markdown-preview',event:'change',selectValue:false},
 {title:'返回文字编辑',text:'再次点击“编辑文字”，源码可继续修改。以后需要检查放映效果时再勾选“MD”；继续编辑时取消勾选即可。',target:'[data-action="mode-text"]',event:'click'},
 {title:'选择需要强调的文字',text:'在刚才的正文中拖动选择一句或几个词。文字格式只作用于当前选区；按住 Shift 还可选择多个文字块统一调整。',target:'#canvas [data-field="text"]',event:'mouseup',notice:'选区建立后教学会自动继续，避免点击“继续”时取消文字选择。'},
 {title:'修改选中文字颜色',text:'打开颜色选项并选择“主题色”。也可保留原色、使用强调色或自选颜色；修改只作用于当前选中的文字。',target:'#format-color',event:'change',selectValue:'theme'},
 {title:'修改选中文字字号',text:'将选中文字设为14 pt。文字编辑支持10、12、14、16 pt，并可继续调整粗体、列表、行距、段后距和左中右／两端对齐。',target:'#format-font-size',event:'change',selectValue:'14'},
 {group:'表格编辑',title:'打开已经放好表格的练习页',text:'请打开“表格练习”。本页只有一张真实、可编辑的练习表格，不再保留“左侧示范＋右侧重复插入”的冗余结构。',target:'.slide-thumb',targetText:'表格练习',event:'click'},
 {title:'进入模块编辑模式',text:'点击“编辑模块”。预置表格已经存在，先进入模块编辑，才能在右侧看到它的导入、行列、字号、行高和样式控件。',target:'[data-action="mode-edit"]',event:'click'},
 {title:'选中预置练习表格',text:'点击页面中的表格进入模块编辑。右侧会显示字号、行高、行列、样式、Excel／CSV 导入和批量替换；新建正式页面时仍可从顶部“＋”插入另一张表格。',target:'#canvas .table-module',event:'click',notice:'这张预置表格就是后续所有操作的对象，不需要先插入第二张表。'},
 {title:'离线导入练习 Excel',text:'点击右侧“替换 Excel / CSV”，选择 tutorial-assets/table-import-demo.xlsx。XLSX 解析器已经打包进当前 HTML，双击离线 HTML 也能直接读取，不需要启动.cmd。',target:'[data-action="excel"]',watch:'#excel-file',event:'change',notice:'本地服务只负责 PDF／PPTX 导出；表格的 XLSX、CSV 与粘贴替换均可离线使用。'},
 {title:'选择 Excel 工作表',text:'示例文件只有“实验结果”一张工作表。确认下拉框中的工作表名称和行数，导入后只读取单元格值与合并关系，并按当前幻灯片主题重新排版。',target:'#excel-sheet'},
 {title:'确认导入 Excel',text:'点击“导入”。实验方法、准确率、RMSE 和耗时会替换当前占位表格。',target:'[data-action="excel-dialog-apply"]',event:'click'},
 {title:'调整表格基准字号',text:'在右侧把表格基准字号设为12 pt。也可选择10、14或16 pt；开启自适应时，系统会在8–14 pt范围内压缩，避免溢出。',target:'#table-font-size',event:'change',selectValue:'12'},
 {title:'调整单元格高度',text:'把单元格高度改为30 pt，输入后点到框外应用。行高要服务阅读，不用靠过宽的上下边距制造虚假丰满。',target:'#table-row-height',input:'#table-row-height',copy:'30'},
 {title:'体验无框线表格样式',text:'勾选“无框线，首行主题色加粗”。无框线表格仍保留清晰的表头层级；深色应作用于第一行表头，而不是错误地涂深第一列。',target:'#borderless-table',event:'change',selectValue:true},
 {title:'恢复标准表格样式',text:'再次取消“无框线”，回到标准主题表格。这里示范的是可切换样式，不要求所有数据表都使用同一种外观。',target:'#borderless-table',event:'change',selectValue:false},
 {title:'增加一行',text:'点击“＋ 行”增加一条记录。右侧的行列按钮只改变表格结构，不会要求回到 Excel 重做。',target:'[data-table-size="row:1"]',event:'click'},
 {title:'增加一列',text:'点击“＋ 列”增加一个新字段。下一步批量替换会按粘贴文本重新确定最终行列数。',target:'[data-table-size="col:1"]',event:'click'},
 {title:'打开表格批量编辑',text:'点击“粘贴替换当前表格”。弹窗会自动载入当前表格内容，可直接改多个数字、增加记录或整体粘贴。',target:'[data-action="paste-table"]',event:'click'},
 {title:'用 Tab 和回车修改表格',text:'把练习文本粘贴到编辑框。每个土黄色短块代表一个 Tab 分列符，连续 Tab 仍保留间隔；每次回车开始新行。也可以直接从 Excel 复制一块区域粘贴。',target:'#table-data',input:'#table-data',copy:TABLE_TEXT},
 {title:'应用批量替换',text:'点击“确认”，表格会按 Tab 和回车重新解析行列。确认前不会改动原表，之后仍可在右侧继续调整字号、行高、注释和样式。',target:'[data-action="table-dialog-apply"]',event:'click'},
 {group:'公式编辑',title:'打开公式练习页',text:'请打开“公式练习”。公式模块可以有多个子区域，每个子区域包含公式标题、LaTeX 公式和解释文字。',target:'.slide-thumb',targetText:'公式练习',event:'click'},
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
 {title:'选择媒体原始比例',text:'将媒体比例改为“原始比例”，完整保留练习图片，不做强制裁剪。只有版式确实要求统一画幅时，再选择16:9、4:3、1:1或自定义比例；并列媒体最终仍需保持实际画面等高。',target:'#media-ratio',event:'change',selectValue:'original'},
 {title:'保留图片标题',text:'确认“保留图标题”处于勾选状态。正式页面没有图题时才取消，不能无意义地保留一条空白图注高度。',target:'#media-caption-show',event:'change',selectValue:true},
 {title:'应用媒体设置',text:'点击“确定”返回页面。图片保持原始比例，图标题会独立排在媒体区域下方，不覆盖画面。',target:'[data-action="media-dialog-apply"]',event:'click'},
 {title:'进入图片标题编辑',text:'点击“编辑文字”，准备直接修改画布中的图标题。图标题建议14 pt，序号与标题之间保留清晰间隔。',target:'[data-action="mode-text"]',event:'click'},
 {title:'填写第一张图片标题',text:'把练习标题粘贴到第一张图片下方。图题要说明图片表达的对象或证据，不能只写“示意图”。',target:'#canvas .media-part [data-field="caption"]',input:'#canvas .media-part [data-field="caption"]',copy:'图 1　教学图片的结构与信息层级'},
 {group:'高级对齐',title:'打开高级对齐练习页',text:'请打开“高级对齐练习”。本大项先处理板块 A 的参考线平移与反向拉伸，再直接切换多选模式完成三板块等距。',target:'.slide-thumb',targetText:'高级对齐练习',event:'click'},
 {title:'进入模块编辑',text:'点击“编辑模块”，再选择需要作为基准的板块。',target:'[data-action="mode-edit"]',event:'click'},
 {title:'选择板块 A',text:'点击画布中的“板块 A”，右侧会出现“高级对齐与分布”。参考线与多选等距都在本大项内完成。',target:'#canvas .module',targetText:'板块 A',event:'click'},
 {title:'打开高级对齐',text:'点击右侧“高级对齐与分布”。本大项只打开一次插件：先完成左／上平移和右／下拉伸，再切换多选等距。',target:'[data-action="advanced-align"]',event:'click'},
 {title:'选择纵向参考线平移',text:'点击插件中的“纵向参考线平移”。画布会出现一条竖向参考线，下方按钮用于左对齐、水平居中或右对齐。',target:'[data-align-mode="v-move"]',event:'click'},
 {title:'显示横向坐标标尺',text:'勾选“显示坐标标尺”。纵向参考线控制左右位置，因此画布顶部显示0–1600的横坐标；标尺只用于编辑，不进入导出画面。',target:'#alignment-ruler',event:'change',selectValue:true},
 {title:'关闭参考线吸附',text:'先关闭顶部“网格”。此时拖动纵向或横向参考线不会吸附到网格，适合自由寻找视觉位置。',target:'#grid-visible',event:'change',selectValue:false},
 {title:'重新开启参考线吸附',text:'再次开启“网格”。参考线现在会按当前网格间距吸附，适合建立可重复、可检查的对齐基准。',target:'#grid-visible',event:'change',selectValue:true},
 {title:'填写纵向参考线位置',text:'把纵向参考线位置设为70 px。数值输入和直接拖动参考线等效；开启网格时会按网格吸附。',target:'#alignment-guide-value',input:'#alignment-guide-value',copy:'70'},
 {title:'执行左对齐',text:'点击插件中的“左对齐”。板块 A 的左边缘会贴到纵向参考线。',target:'[data-align-action="left"]',event:'click'},
 {title:'选择横向参考线平移',text:'切换到“横向参考线平移”，画布改为横线参考，可执行上贴边、垂直居中或下贴边。',target:'[data-align-mode="h-move"]',event:'click'},
 {title:'观察纵向坐标标尺',text:'横向参考线控制上下位置，标尺会自动切换到画布左侧，显示0–900的纵坐标。后面的上平移和下拉伸都按这条Y轴读取位置。',target:'#alignment-ruler',notice:'参考线方向与读数轴互相垂直：竖参考线读取顶部X轴，横参考线读取左侧Y轴。教学高亮保留在标尺开关上，不改变画布标尺的几何位置。'},
 {title:'填写横向参考线位置',text:'把横向参考线位置设为300 px，让板块 A 的顶部落在正文区域内。',target:'#alignment-guide-value',input:'#alignment-guide-value',copy:'300'},
 {title:'执行上贴边',text:'点击“上贴边”，把板块 A 的上边缘对齐横向参考线。',target:'[data-align-action="top"]',event:'click'},
 {title:'切换到纵向参考线拉伸',text:'选择“纵向参考线拉伸”。左边缘刚刚已经平移到位，这次固定左边缘，把右边缘拉到另一条参考位置。',target:'[data-align-mode="v-stretch"]',event:'click'},
 {title:'设置右侧拉伸位置',text:'把纵向参考线改为560 px。它位于板块 A 当前右边缘之外，同时仍与板块 B 保留安全间隙。',target:'#alignment-guide-value',input:'#alignment-guide-value',copy:'560'},
 {title:'向右拉伸到参考线',text:'点击“向右拉伸”。板块 A 的左边缘保持70 px不动，右边缘扩展到560 px，因此能清楚观察单边拉伸。',target:'[data-align-action="right"]',event:'click'},
 {title:'切换到横向参考线拉伸',text:'选择“横向参考线拉伸”。上边缘已经平移到300 px，这次固定上边缘并改变下边缘。',target:'[data-align-mode="h-stretch"]',event:'click'},
 {title:'设置下侧拉伸位置',text:'把横向参考线改为590 px，使板块向下增高，但仍完整留在正文安全区内。',target:'#alignment-guide-value',input:'#alignment-guide-value',copy:'590'},
 {title:'向下拉伸到参考线',text:'点击“向下拉伸”。板块 A 的上边缘保持300 px不动，下边缘延伸到590 px，和前面的上平移形成相反方向的练习。',target:'[data-align-action="bottom"]',event:'click'},
 {title:'单板块对齐的边界',text:'平移负责改变整体位置，拉伸只改变参考线一侧的边缘。接下来不退出插件，直接切换多选模式。',target:'#alignment-panel',notice:'本大项刻意使用“左平移→右拉伸、上平移→下拉伸”，避免参考线与原边缘重合而看不出变化。'},
 {title:'打开多选模式',text:'点击“多选开关”。进入多选后，画布中的候选板块会弱化，选中的板块以高亮边框显示。',target:'[data-align-mode="multi"]',event:'click'},
 {title:'多选板块 A',text:'点击板块 A，将它加入本次等距分布。',target:'#canvas .module',targetText:'板块 A',event:'click'},
 {title:'多选板块 B',text:'点击板块 B，将它加入多选集合。',target:'#canvas .module',targetText:'板块 B',event:'click'},
 {title:'多选板块 C',text:'点击板块 C，凑齐三个待分布板块。',target:'#canvas .module',targetText:'板块 C',event:'click'},
 {title:'执行水平等距',text:'点击插件中的“水平等距”。系统固定最左和最右边界，再平分中间间隙。',target:'[data-align-distribute="x"]',event:'click'},
 {title:'多选对齐的边界',text:'多选等距固定最外侧边界，只平移中间板块并平均分配净空；它不会替代内容顺序和版面判断。',target:'#alignment-panel',notice:'即使只有两个板块，多选对齐仍可使用；若其中含多个子区域，系统会按可见子区域参与间距计算。'},
 {title:'退出高级对齐',text:'点击插件底部“退出”，结束包含参考线与多选等距的高级对齐大项。下一大项会在环形页重新打开插件。',target:'[data-action="advanced-close"]',event:'click'},
 {group:'环形分布',title:'打开环形文字排版练习',text:'打开“环形文字排版练习”。页面中央已经准备好一个单行独立文本块，接下来把它复制为4份并做小角度扇形分布。',target:'.slide-thumb',targetText:'环形文字排版练习',event:'click'},
 {title:'选中单行文字块',text:'点击页面中央的“研究目标”文字块。只选择一个板块时，环形工具会按设定数量复制它。',target:'#canvas .module',targetText:'研究目标',event:'click'},
 {title:'重新打开环形页高级对齐',text:'点击右侧“高级对齐与分布”。环形分布作为独立大项，也从打开插件开始，不默认继承多选对齐的状态。',target:'[data-action="advanced-align"]',event:'click'},
 {title:'开启环形页多选模式',text:'点击“多选开关”，然后把当前文字块加入环形分布选择。',target:'[data-align-mode="multi"]',event:'click'},
 {title:'选择待复制文字块',text:'再次点击“研究目标”，将唯一源文字块加入选择集合。',target:'#canvas .module',targetText:'研究目标',event:'click'},
 {title:'打开环形分布设置',text:'点击插件中的“环形分布”图标。单项选择时，“复制数量”决定生成多少份。',target:'[data-action="radial-options"]',event:'click'},
 {title:'设置复制数量',text:'把单项复制数量设为4，得到四个完全一致的一行文字块。',target:'#radial-count',input:'#radial-count',copy:'4'},
 {title:'拖动半径并实时预览',text:'拖动半径滑杆到180 px。画布会实时显示四份文字的位置；预览不会改动页面，状态栏会提示是否越界或重叠。',target:'[data-radial-for="radial-radius"]',event:'input',selectValue:'180'},
 {title:'拖动起始角度',text:'把起始角度滑杆拖到-45°，观察扇形从页面右上侧开始。',target:'[data-radial-for="radial-start"]',event:'input',selectValue:'-45'},
 {title:'拖动结束角度',text:'把结束角度滑杆拖到45°。四项只覆盖90°的小扇形，并保持足够的垂直间距。',target:'[data-radial-for="radial-end"]',event:'input',selectValue:'45'},
 {title:'生成环形组合',text:'点击“生成组合”。四个文字块会合成一个可整体移动和缩放的组合模块，并全部保持在页面内。',target:'[data-action="radial-dialog-apply"]',event:'click'},
 {title:'结束环形分布练习',text:'再次点击“编辑模块”退出模块编辑状态。下一大项会在时间轴页重新进入模块编辑。',target:'[data-action="mode-edit"]',event:'click'},
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
const feedbackFiles={
 correct:{image:'干的真棒-杰瑞.png',audio:'干的真棒-杰瑞.mp3',alt:'杰瑞成功反馈',title:'干得真棒！',note:'操作正确，杰瑞来给你庆祝。'},
 assist:{image:'呵呵你还挺厉害-杰瑞.png',audio:'呵呵你还挺厉害-杰瑞.mp3',alt:'恶魔杰瑞代为完成反馈',title:'呵呵，你还挺厉害',note:'恶魔杰瑞已经代你完成此步。'},
 skip:{image:'你还挺厉害-汤姆.png',audio:'你还挺厉害-汤姆.mp3',alt:'汤姆代为完成本项反馈',title:'你还挺厉害',note:'汤姆已经替你完成本项剩余操作。'},
 complete:{image:'做完全部教程.png',alt:'完成全部教程',title:'全部教程完成！',note:'掌声送给完成训练的你。'}
};
export function tutorialFeedbackKind({groupName='',isGroupEnd=false,assisted=false,skipGroup=false,complete=false}={}){
 if(complete)return 'complete';
 if(skipGroup)return 'skip';
 if(groupName!=='开始'&&isGroupEnd)return assisted?'assist':'correct';
 return 'cue';
}
const feedbackURL=file=>new URL((location.protocol==='file:'?'../../../tutorial-assets/media/sounds/':'/tutorial-assets/media/sounds/')+file,location.href).href;
let cueContext,feedbackAudio;
function fallbackCue(){
 try{
  cueContext??=new (window.AudioContext||window.webkitAudioContext)();
  const now=cueContext.currentTime,gain=cueContext.createGain();gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.055,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.22);gain.connect(cueContext.destination);
  [620,930].forEach((frequency,i)=>{const tone=cueContext.createOscillator();tone.type=i?'triangle':'sine';tone.frequency.setValueAtTime(frequency,now+i*.045);tone.connect(gain);tone.start(now+i*.045);tone.stop(now+.22);});
 }catch{/* 不让音频能力影响教学流程。 */}
}
function playApplause(){
 try{
  cueContext??=new (window.AudioContext||window.webkitAudioContext)();cueContext.resume?.();const sampleRate=cueContext.sampleRate,duration=2.25,buffer=cueContext.createBuffer(1,Math.ceil(sampleRate*duration),sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){const time=i/sampleRate;let value=0;for(let clap=0;clap<18;clap++){const start=.06+clap*.105+(clap%3)*.017,age=time-start;if(age>=0&&age<.075)value+=(Math.random()*2-1)*Math.exp(-age*48)*(clap%2?.72:1);}data[i]=Math.max(-1,Math.min(1,value*.34));}
  const source=cueContext.createBufferSource(),filter=cueContext.createBiquadFilter(),gain=cueContext.createGain();filter.type='bandpass';filter.frequency.value=1450;filter.Q.value=.72;gain.gain.value=.42;source.buffer=buffer;source.connect(filter).connect(gain).connect(cueContext.destination);source.start();
  [523,659,784].forEach((frequency,i)=>{const tone=cueContext.createOscillator(),voice=cueContext.createGain(),now=cueContext.currentTime;tone.type='triangle';tone.frequency.setValueAtTime(frequency,now+i*.08);tone.frequency.exponentialRampToValueAtTime(frequency*1.18,now+1.3+i*.08);voice.gain.setValueAtTime(.0001,now+i*.08);voice.gain.exponentialRampToValueAtTime(.028,now+.14+i*.08);voice.gain.exponentialRampToValueAtTime(.0001,now+1.55+i*.08);tone.connect(voice).connect(cueContext.destination);tone.start(now+i*.08);tone.stop(now+1.6+i*.08);});
 }catch{fallbackCue();}
}
function reward(kind='correct'){
 const config=feedbackFiles[kind]||feedbackFiles.correct;document.querySelector('.tutorial-reward')?.remove();if(feedbackAudio){feedbackAudio.pause();feedbackAudio=null;}
 const box=el('div',`tutorial-reward tutorial-reward-${kind}`);box.dataset.feedback=kind;box.dataset.audio=config.audio||'synthetic-applause';const image=el('img');image.src=feedbackURL(config.image);image.alt=config.alt;const words=el('div','tutorial-reward-copy');words.append(el('strong','',config.title),el('span','',config.note));box.append(image,words);document.body.append(box);
 const count=kind==='complete'?36:22;for(let i=0;i<count;i++){const p=el('i');p.style.setProperty('--x',`${(Math.random()-.5)*(kind==='complete'?560:340)}px`);p.style.setProperty('--r',`${Math.random()*720}deg`);p.style.background=['#f1b82d','#2ba3c0','#a31418','#005b94','#58a65c'][i%5];box.append(p);}
 if(config.audio){feedbackAudio=new Audio(feedbackURL(config.audio));feedbackAudio.volume=.82;feedbackAudio.play().catch(()=>{/* 语音被浏览器拦截时保持安静，不再冒充播放旧提示音。 */});}else playApplause();
 setTimeout(()=>box.remove(),kind==='complete'?3600:2100);
}

export function startTutorial({onSkipTheme,onResetTutorial,force=false,onStateChange}={}){
 const requested=new URLSearchParams(location.search).get('tutorial')==='1',existing=document.querySelector('.tutorial-guide');
 if(existing){existing.focus({preventScroll:false});return {active:true};}
 if(!requested&&!force)return null;
 activeTutorialDestroy?.();
 const saved=readTutorialProgress();
 let index=Math.max(0,Math.min(steps.length-1,saved?.index??0)),target=null,cleanups=[],waitTimer=0,resuming=!!saved,menuMode=!saved||saved.view==='menu',preparing=false,flowMode=saved?.flowMode||'catalog';
 const completedGroups=new Set((saved?.completedGroups||[]).filter(name=>groupCatalog.some(group=>group.name===name)));
 const groupProgress=new Map(Object.entries(saved?.groupProgress||{}).filter(([name])=>groupCatalog.some(group=>group.name===name)));
 const root=el('section','tutorial-guide');root.setAttribute('role','dialog');root.setAttribute('aria-live','polite');
 root.tabIndex=-1;
 const catalog=el('div','tutorial-catalog-screen'),progress=el('div','tutorial-progress'),progressLabel=el('div','tutorial-progress-label'),majorRuler=el('div','tutorial-ruler major'),minorRuler=el('div','tutorial-ruler minor'),title=el('h2'),text=el('p'),copyBox=el('div','tutorial-copy'),actions=el('div','tutorial-actions');
 progress.title='按住此处可拖动教学卡片';
 progress.append(progressLabel,majorRuler,minorRuler);
 const home=el('button','tutorial-home','返回教程目录'),back=el('button','tutorial-back','上一步'),skipStep=el('button','','代我完成此步'),skipGroup=el('button','','代我完成本项'),next=el('button','primary','我已阅读，继续');actions.append(home,back,skipStep,skipGroup,next);root.append(catalog,progress,title,text,copyBox,actions);document.body.append(root);
 const groupOf=i=>{for(let n=i;n>=0;n--)if(steps[n].group)return steps[n].group;return '开始';};
 const groupNames=groupCatalog.map(group=>group.name);
 const groupMeta=i=>{const name=groupOf(i),indices=steps.map((_,n)=>n).filter(n=>groupOf(n)===name),position=indices.indexOf(i)+1,number=groupNames.indexOf(name)+1;return {name,indices,position,number,total:indices.length};};
 if(saved&&saved.runtimeId!==TUTORIAL_RUNTIME_ID)index=groupMeta(index).indices[0];
 const emitStepFeedback=(mode,stepIndex=index)=>{const meta=groupMeta(stepIndex),kind=tutorialFeedbackKind({groupName:meta.name,isGroupEnd:meta.indices.at(-1)===stepIndex,assisted:mode==='assist'});if(kind==='cue')fallbackCue();else reward(kind);};
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
 const remember=(view=menuMode?'menu':'step')=>{writeTutorialProgress(index,{view,flowMode,completedGroups:[...completedGroups],groupProgress:Object.fromEntries(groupProgress)});onStateChange?.({active:true,index,view,flowMode});};
 const markProgress=(meta,count=meta.position)=>{if(meta.number<1||preparing)return;const percent=Math.max(0,Math.min(100,Math.round(count/meta.total*100))),before=Number(groupProgress.get(meta.name)||0);groupProgress.set(meta.name,Math.max(before,percent));};
 const clear=()=>{clearTimeout(waitTimer);for(const dispose of cleanups.splice(0))dispose();document.querySelectorAll('.tutorial-target').forEach(node=>node.classList.remove('tutorial-target'));target=null;};
 const find=(selector,contains)=>{if(!selector)return null;const items=[...document.querySelectorAll(selector)];if(!contains)return items[0];return items.find(node=>{const label=node.matches?.('.slide-thumb')?(node.getAttribute('aria-label')||node.querySelector('.thumb-caption')?.textContent||''):(node.getAttribute('aria-label')||node.textContent||'');return label.includes(contains);});};
 const leaveModal=()=>{const modal=root.closest('dialog');root.classList.remove('tutorial-modal');if(modal){document.body.append(root);modal.close();}};
 const stop=({forget=false,removeQuery=false}={})=>{leaveModal();clear();root.remove();if(forget)clearTutorialProgress();if(removeQuery)history.replaceState(null,'',location.pathname+location.hash);if(activeTutorialDestroy===destroy)activeTutorialDestroy=null;onStateChange?.({active:false,index,complete:forget});};
 const destroy=()=>stop();activeTutorialDestroy=destroy;
 let feedbackOverride=null,groupRunning=false,automationDelay=280;
 const go=(nextIndex,{closeModal=false,feedback=null,delay=120}={})=>{const completedIndex=index;if(nextIndex>completedIndex)markProgress(groupMeta(completedIndex));if(closeModal)leaveModal();clear();menuMode=false;index=Math.max(0,Math.min(steps.length-1,nextIndex));remember('step');if(feedback==='skip')reward('skip');else if(feedback)emitStepFeedback(feedback,completedIndex);waitTimer=setTimeout(show,delay);};
 const waitFor=selector=>new Promise((resolve,reject)=>{let tries=0;const check=()=>{const node=document.querySelector(selector);if(node)return resolve(node);if(++tries>40)return reject(Error('教学控件未出现'));setTimeout(check,100);};check();});
 const setValue=(node,value)=>{if(node.isContentEditable)node.textContent=value;else node.value=value;node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));};
 const autoStep=()=>{const step=steps[index],feedback=groupRunning?null:'assist';feedbackOverride=groupRunning?'silent':'assist';if(step.input){const input=find(step.input);setValue(input,step.copy??'');return;}if(step.fileStep){feedbackOverride=null;onSkipTheme?.();go(index+1,{feedback});return;}if(step.selectValue!==undefined&&target){if(target.type==='checkbox')target.checked=Boolean(step.selectValue);else target.value=step.selectValue;target.dispatchEvent(new Event(step.event||'change',{bubbles:true}));return;}if(step.event&&target){if(step.event==='mouseup'){if(target.isContentEditable){const range=document.createRange();range.selectNodeContents(target);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);}target.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));}else if(step.event==='dblclick')target.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));else target.click();return;}feedbackOverride=null;go(index+1,{feedback});};
 const autoGroup=async({silent=false,delay=340,returnHome=true,markComplete=!silent}={})=>{const meta=groupMeta(index),nextIndex=meta.indices.at(-1)+1,finishSkipped=()=>{if(markComplete){completedGroups.add(meta.name);groupProgress.set(meta.name,100);}if(silent||!returnHome)go(nextIndex,{closeModal:true,delay});else if(flowMode==='section'){index=meta.indices.at(-1);showSettlement(meta,{assisted:true});}else go(nextIndex,{closeModal:true,feedback:'skip',delay});};try{
   skipGroup.disabled=true;skipStep.disabled=true;back.disabled=true;next.disabled=true;feedbackOverride=null;
   if(meta.name==='主题换肤'){clear();onSkipTheme?.();finishSkipped();return;}
  else if(meta.name==='大纲教学'){
   clear();
   let dialog=document.querySelector('#outline-dialog');if(!dialog){document.querySelector('[data-action="outline"]')?.click();dialog=await waitFor('#outline-dialog');}
   setValue(dialog.querySelector('#outline-text'),OUTLINE);dialog.querySelector('#outline-mode').value='current';dialog.querySelector('#outline-mode').dispatchEvent(new Event('change',{bubbles:true}));for(const id of ['outline-toc','outline-closing']){const box=dialog.querySelector('#'+id);if(!box.checked)box.click();}for(const id of ['outline-transitions','outline-appendix']){const box=dialog.querySelector('#'+id);if(box.checked)box.click();}await new Promise(resolve=>setTimeout(resolve,180));dialog.querySelector('#outline-apply')?.click();await new Promise(resolve=>setTimeout(resolve,180));
    finishSkipped();return;
  }
   groupRunning=true;automationDelay=delay;
  const waitState=(test,message)=>new Promise((resolve,reject)=>{let tries=0;const check=()=>{if(test())return resolve();if(++tries>80)return reject(Error(message));setTimeout(check,80);};check();});
  while(groupOf(index)===meta.name&&!steps[index].finish){
   const before=index,step=steps[index];
   await waitState(()=>index!==before||title.textContent===step.title&&(!step.target||target),'教学控件未准备好');
   if(step.title==='离线导入练习 Excel'){
    const resume=steps.findIndex((item,n)=>n>index&&item.title==='调整表格基准字号');go(resume,{closeModal:true});
   }else if(step.target==='#media-file'){
    go(index+1);
   }else if(step.title==='选中时间轴模块'){
    document.querySelector('#inspector [data-select-module]')?.click();go(index+1);
   }else autoStep();
   await waitState(()=>index!==before,'自动操作没有推进教学');
    await new Promise(resolve=>setTimeout(resolve,delay));
  }
    groupRunning=false;feedbackOverride=null;if(markComplete){completedGroups.add(meta.name);groupProgress.set(meta.name,100);}if(!silent&&returnHome){if(flowMode==='section')showSettlement(meta,{assisted:true});else reward('skip');}
   }catch(error){groupRunning=false;feedbackOverride=null;const n=el('aside','tutorial-notice');n.innerHTML='<strong>自动完成失败</strong><span></span>';n.querySelector('span').textContent=error.message+'，请完成当前控件或退出后重新进入教学。';copyBox.append(n);if(silent)throw error;}finally{skipGroup.disabled=false;skipStep.disabled=false;back.disabled=false;next.disabled=false;}};
 const showMenu=(message='')=>{
   leaveModal();clear();menuMode=true;preparing=false;flowMode='catalog';root.style.visibility='';root.classList.add('catalog-mode');root.classList.remove('settlement-mode');catalog.hidden=false;for(const node of [progress,title,text,copyBox,actions])node.hidden=true;
   const heading=el('div','tutorial-catalog-heading');heading.append(el('span','tutorial-catalog-kicker','WEB SLIDE · 交互教程'),el('h2','',message||'选择学习方式'),el('p','',message?'可以继续完整学习，也可单独练习任意板块。系统会自动准备每个分项需要的前置状态。':'从头完成完整教学，或按需进入单个板块。进入第 N 项前，系统会自动还原至第 N−1 项完成后的标准状态。'));
   const full=el('button','tutorial-full-course');full.type='button';full.dataset.tutorialFull='true';const fullIcon=el('b','','▶'),fullCopy=el('span'),fullTitle=el('strong','','完整教学流程'),fullText=el('small','','按原有顺序从主题换肤一直练到备注、放映与导出，板块之间自动衔接。'),fullAction=el('i','','从头开始');fullCopy.append(fullTitle,fullText);full.append(fullIcon,fullCopy,fullAction);full.onclick=startFullFlow;
   const grid=el('div','tutorial-catalog-grid');groupCatalog.forEach((group,n)=>{const button=el('button','tutorial-catalog-card');button.type='button';button.dataset.tutorialGroup=String(n+1);const percent=completedGroups.has(group.name)?100:Number(groupProgress.get(group.name)||0);if(percent===100)button.classList.add('completed');const number=el('b','',String(n+1).padStart(2,'0')),body=el('span','tutorial-catalog-card-copy'),name=el('strong','',group.name),meter=el('span','tutorial-card-progress'),fill=el('i'),status=el('em','',`${percent}%`);fill.style.width=`${percent}%`;meter.append(fill);body.append(name,meter);button.append(number,body,status);button.title=`${group.page}：${group.summary}`;button.onclick=()=>prepareGroup(n+1);grid.append(button);});
   const foot=el('div','tutorial-catalog-foot'),hint=el('p','',`本次已完成 ${completedGroups.size} / ${groupCatalog.length} 项。刷新页面或退出后重新进入，进度会清零。`),close=el('button','','退出教学');close.onclick=()=>stop({forget:true,removeQuery:true});foot.append(hint,close);catalog.replaceChildren(heading,full,grid,foot);remember('menu');onStateChange?.({active:true,index,view:'menu'});root.focus({preventScroll:true});
  };
 const showSettlement=(meta,{assisted=false}={})=>{
   leaveModal();clear();menuMode=true;preparing=false;flowMode='catalog';root.style.visibility='';root.classList.remove('catalog-mode','catalog-preparing');root.classList.add('settlement-mode');catalog.hidden=false;for(const node of [progress,title,text,copyBox,actions])node.hidden=true;
   const panel=el('section','tutorial-settlement'),image=el('img'),copy=el('div','tutorial-settlement-copy'),kicker=el('span','','SECTION COMPLETE'),heading=el('h2','',`${meta.name} · 通关`),message=el('p','',assisted?'本项剩余操作已经自动完成，当前页面保留在该板块的完成状态。':'本项练习已经完成，当前页面保留你的操作结果。'),buttons=el('div','tutorial-settlement-actions'),done=el('button','primary','返回教程目录');
   image.src=feedbackURL('做完全部教程.png');image.alt='汤姆手持奖杯的通关结算图';copy.append(kicker,heading,message);done.onclick=()=>showMenu(`${meta.name}已完成`);buttons.append(done);panel.append(image,copy,buttons);catalog.replaceChildren(panel);remember('settlement');root.focus({preventScroll:true});
  };
 const startFullFlow=async()=>{
   if(preparing)return;preparing=true;clear();root.classList.add('catalog-mode','catalog-preparing');catalog.hidden=false;for(const node of [progress,title,text,copyBox,actions])node.hidden=true;const loading=el('div','tutorial-catalog-loading');loading.append(el('strong','','正在恢复完整教学母稿'),el('p','','完成后将从主题换肤开始，按原有顺序连续学习。'));catalog.replaceChildren(loading);
   try{await onResetTutorial?.();await new Promise(resolve=>setTimeout(resolve,80));completedGroups.clear();groupProgress.clear();index=0;flowMode='full';menuMode=false;preparing=false;root.classList.remove('catalog-mode','catalog-preparing','settlement-mode');catalog.hidden=true;for(const node of [progress,title,text,copyBox,actions])node.hidden=false;remember('step');show();}catch(error){preparing=false;showMenu();const notice=el('aside','tutorial-catalog-error');notice.textContent=`完整教学准备失败：${error.message}`;catalog.prepend(notice);}
  };
 const prepareGroup=async number=>{
   const targetGroup=groupCatalog[number-1];if(!targetGroup||preparing)return;preparing=true;clear();flowMode='section';root.classList.add('catalog-mode','catalog-preparing');root.classList.remove('settlement-mode');catalog.hidden=false;for(const node of [progress,title,text,copyBox,actions])node.hidden=true;const loading=el('div','tutorial-catalog-loading'),meter=el('div','tutorial-catalog-meter'),fill=el('i'),label=el('strong','',`正在准备：${targetGroup.name}`),detail=el('p','',number===1?'正在恢复教学母稿，请稍候…':'正在后台重建本项所需的前置状态，请稍候…');meter.append(fill);loading.append(label,detail,meter);catalog.replaceChildren(loading);
  try{
   await onResetTutorial?.();await new Promise(resolve=>setTimeout(resolve,80));
   for(let n=0;n<number-1;n++){
     const name=groupNames[n],meta=groupMeta(steps.findIndex(step=>step.group===name));fill.style.width=`${((n+1)/(number-1))*100}%`;index=meta.indices[0];menuMode=false;show();await autoGroup({silent:true,delay:24,returnHome:false});clear();
   }
    fill.style.width='100%';const targetIndex=steps.findIndex(step=>step.group===targetGroup.name);index=targetIndex;flowMode='section';menuMode=false;preparing=false;root.classList.remove('catalog-mode','catalog-preparing','settlement-mode');catalog.hidden=true;for(const node of [progress,title,text,copyBox,actions])node.hidden=false;remember('step');waitTimer=setTimeout(show,80);
  }catch(error){preparing=false;root.classList.remove('catalog-preparing');showMenu();const notice=el('aside','tutorial-catalog-error');notice.textContent=`前置状态准备失败：${error.message}`;catalog.prepend(notice);}
 };
 const show=()=>{
   clear();menuMode=false;remember('step');manualPosition=false;if(!preparing){root.classList.remove('catalog-mode','catalog-preparing');catalog.hidden=true;for(const node of [progress,title,text,copyBox,actions])node.hidden=false;root.style.visibility='';}root.style.removeProperty('left');root.style.removeProperty('top');root.style.removeProperty('right');root.style.removeProperty('bottom');const step=steps[index],meta=groupMeta(index);renderRuler(meta);title.textContent=step.title;text.textContent=step.text;copyBox.replaceChildren();
   back.hidden=index===0||meta.position===1;skipStep.hidden=step.finish;skipGroup.hidden=step.finish||meta.name==='开始';next.hidden=!!step.event;next.textContent=step.finish?(flowMode==='full'?'完成全部教程':'完成本项并查看结算'):step.input?'完成填写，继续':'我已阅读，继续';
  if(step.notice){const n=el('aside','tutorial-notice');n.innerHTML='<strong>必读告示</strong><span></span>';n.querySelector('span').textContent=step.notice;copyBox.append(n);}
  if(step.copy){const pre=el('pre','tutorial-copy-text',step.copy),button=el('button','','复制练习内容');button.type='button';button.onclick=async()=>{try{await navigator.clipboard.writeText(step.copy);button.textContent='已复制 ✓';}catch{pre.focus();const range=document.createRange();range.selectNodeContents(pre);getSelection().removeAllRanges();getSelection().addRange(range);button.textContent='已选中，请按 Ctrl+C';}};copyBox.append(pre,button);}
  let bindAttempts=0;
  const bind=()=>{
    if(index>=steps.length||!step.target){resuming=false;return;}target=find(step.target,step.targetText);const containingDialog=target?.closest('dialog');if(!target||(containingDialog&&!containingDialog.open)){if(resuming&&++bindAttempts>20){const fallback=meta.indices[0];if(fallback!==index){index=fallback;resuming=false;remember('step');setTimeout(show,0);return;}}waitTimer=setTimeout(bind,preparing?30:180);return;}resuming=false;const modal=!preparing&&containingDialog?.open&&!containingDialog.classList.contains('radial-dialog-floating')?containingDialog:null;root.classList.toggle('tutorial-modal',!!modal);if(modal&&!modal.contains(root))modal.append(root);else if(!modal&&!document.body.contains(root))document.body.append(root);document.querySelectorAll('.tutorial-target').forEach(node=>node.classList.remove('tutorial-target'));if(!preparing){target.classList.add('tutorial-target');target.scrollIntoView({block:target.matches('.slide-thumb')?'center':'nearest',inline:'nearest',behavior:'smooth'});requestAnimationFrame(()=>placeGuide(target));const reposition=()=>placeGuide(target);addEventListener('resize',reposition);addEventListener('scroll',reposition,true);cleanups.push(()=>{removeEventListener('resize',reposition);removeEventListener('scroll',reposition,true);});}
   if(step.event){
    const done=()=>{if(step.selectValue!==undefined){const actual=target.type==='checkbox'?target.checked:String(target.value),expected=target.type==='checkbox'?Boolean(step.selectValue):String(step.selectValue);if(actual!==expected)return;}advance();};
    if(step.event==='click'&&target.matches('.slide-thumb')){
     const list=document.querySelector('#slides'),matches=node=>node?.matches?.('.slide-thumb')&&(!step.targetText||(node.getAttribute('aria-label')||node.textContent||'').includes(step.targetText));
     const onClick=event=>{const thumb=event.target.closest?.('.slide-thumb');if(matches(thumb))done();};
     list.addEventListener('click',onClick);cleanups.push(()=>list.removeEventListener('click',onClick));
     const observer=new MutationObserver(()=>{const fresh=find(step.target,step.targetText);if(!fresh)return;document.querySelectorAll('.tutorial-target').forEach(node=>node.classList.remove('tutorial-target'));target=fresh;target.classList.add('tutorial-target');});
     observer.observe(list,{childList:true});cleanups.push(()=>observer.disconnect());
    }else if(target.closest('#alignment-panel')||containingDialog){
     const onEvent=event=>{if(event.target===target||target.contains(event.target))done();};document.addEventListener(step.event,onEvent,true);cleanups.push(()=>document.removeEventListener(step.event,onEvent,true));
    }else{
     const watched=find(step.watch)||target;watched.addEventListener(step.event,done,{once:true});cleanups.push(()=>watched.removeEventListener(step.event,done));
    }
   }
   if(step.input){const input=find(step.input),inputValue=()=>input.isContentEditable?input.textContent||'':input.value||'',done=()=>{if(step.allowEmpty||inputValue().trim())advance();},paste=()=>setTimeout(done,30),dynamic=input.closest('#alignment-panel');if(dynamic){const delegated=event=>{if(event.target===input)done();};document.addEventListener('change',delegated,true);cleanups.push(()=>document.removeEventListener('change',delegated,true));}else{input.addEventListener('change',done,{once:true});input.addEventListener('paste',paste,{once:true});cleanups.push(()=>{input.removeEventListener('change',done);input.removeEventListener('paste',paste);});}
    if(step.input==='#outline-text'){const file=document.querySelector('#outline-file'),stepIndex=index,onFile=()=>{const timer=setTimeout(()=>{if(index===stepIndex&&input.value.trim())advance();},120);cleanups.push(()=>clearTimeout(timer));};file?.addEventListener('change',onFile,{once:true});if(file)cleanups.push(()=>file.removeEventListener('change',onFile));}
   }
   if(meta.name==='大纲教学'){const apply=document.querySelector('#outline-apply'),finish=()=>setTimeout(()=>{if(groupOf(index)!=='大纲教学')return;index=meta.indices.at(-1);feedbackOverride='correct';advance();},0);apply?.addEventListener('click',finish,{once:true});if(apply)cleanups.push(()=>apply.removeEventListener('click',finish));}
  };bind();
 };
 const advance=()=>{const ownerDialog=root.closest('dialog'),applying=target?.matches?.('[data-action$="-apply"],#outline-apply');if(ownerDialog){if(applying)leaveModal();else document.body.append(root);}clear();const completedIndex=index,meta=groupMeta(completedIndex),groupEnd=meta.name!=='开始'&&meta.indices.at(-1)===completedIndex,mode=feedbackOverride||'correct';feedbackOverride=null;markProgress(meta);if(groupEnd&&!groupRunning){completedGroups.add(meta.name);groupProgress.set(meta.name,100);if(flowMode==='section'){remember('settlement');showSettlement(meta);return;}const finalGroup=meta.name===groupNames.at(-1);if(flowMode==='full'&&finalGroup){reward('complete');remember('menu');waitTimer=setTimeout(()=>showMenu('完整教学流程已完成'),1100);return;}if(mode!=='silent')emitStepFeedback(mode,completedIndex);index=Math.min(steps.length-1,index+1);remember('step');waitTimer=setTimeout(show,groupRunning?automationDelay:320);return;}if(mode!=='silent')emitStepFeedback(mode,completedIndex);index=Math.min(steps.length-1,index+1);remember('step');waitTimer=setTimeout(show,groupRunning?automationDelay:280);};
 next.onclick=advance;
 back.onclick=()=>{feedbackOverride=null;const previous=steps[index-1],node=find(previous?.target,previous?.targetText),modal=root.closest('dialog'),closeModal=!!modal&&node?.closest('dialog')!==modal;go(index-1,{closeModal});};
  skipStep.onclick=autoStep;
  skipGroup.onclick=()=>autoGroup();
   home.onclick=()=>showMenu();
   if(menuMode)showMenu();else show();return {active:true};
}
