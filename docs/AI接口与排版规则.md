# AI 生成与复用接口

先读根目录[SKILL.md](../SKILL.md)。本文的所有源码、样式、快照和素材都在本项目内，不依赖其他已安装的学校skill或作者聊天记录。固定画布1600×900，预览只做整体缩放。

模块外正文文字可保存`slide.textPositions[field] = {x,y,w,h,dx,dy}`：`field`对应实际可移动的`data-slide-field`，如`lead`、公式页`legacy_5`；`dx,dy`为相对原版式的平移，`x,y,w,h`为实测占用范围。UI以光标所在块更新，不修改原字段的文字与富文本。页眉、页脚、身份卡和表格单元格不接受此映射；独立文本框仍使用模块坐标。迭代保留已有映射，服务器还会用真实DOM校验边界与遮挡。

从 `src/example.js` 的 `createExample(options)` 创建学校示例，或从 `src/model.js` 的 `newDocument(title)` 创建空白文稿。`src/server/schools.mjs` 提供学校标志与图片数据；交付媒体使用 data URL，确保 HTML 自包含。

项目为 `{version:1,title,theme,grid,slides}`。主题包括 `name,primary,secondary,accent,emphasis,tint,ink,logo,wordmark`。页面用 `blankSlide()`／`makePage(kind)` 创建，kind 为 cover、closing、transition、toc、body。ID 必须唯一。

## 文档大纲

`src/outline.js`提供`parseOutline(text)`与`describeCurrentOutline(project)`，后者从实际页面生成当前三级大纲及页面／章节绑定。新建使用`buildOutlineProject`，继续制作使用`updateProjectOutline`，均在副本上操作；不能用新建函数覆盖当前文稿。配置含`reuse`（页key到旧页ID）、`chapters`、`toc/closing/transitions`及`lastAppendix`。末章明确勾选为附录时按附录处理，即使章名为“补充资料”；取消后按普通章处理。已有过渡结构默认逐章保留，显式修改开关后统一调整。

可选`project.outline={format:'hash-outline-v1',status:'structure-confirmed',text}`记录最近应用的结构，非研究事实审批状态；之后编辑以slides为准，不从旧outline强行重放。新增／复制草稿页可有`outlineDraft:true`，AI完成真实内容加工与检查后再清除。解析大纲时，普通说明放备注，标题内`<br>`或字面量`\n`转换为手动换行。UI入口与流程见[AI制作与迭代流程](AI制作与迭代流程.md)。

## 普通模块

正文默认区域`{x:58,y:256,w:1484,h:554}`。建议模块间隙12px，可按空间缩小，不把建议留白作为错误。用`moduleOf(type,rect,count)`创建模块，type为text、media、table、shape、formula、timeline。实际可用边界用`contentBounds(!!slide.summary)`取得：普通正文底边834px、启用summary时750px，均不得遮挡真实页脚或总结。`lead`可空，`footer,source,sourceUrl`可编辑；通用正文示例可用`hideLogo:true`去掉页眉标识及其占位文字。

独立文本块仍为text模块，设置`textBox:true,boxTone:'dark'|'light'`，仅使用parts[0].text，不附带标题。深底白字或白底深字，圈定范围与移动／缩放吸附网格；最小高40px，真实文本溢出仍报错。默认上下内边距在紧凑时可适当收减，不能自动缩字号或行距。

文字子区域含 `title,text,bullet,marker`，可选 `subheading,annotation,takeaway`。`rich[field]` 为 `{text,bold,italic,color,fontSize}` 运行段数组，拼接必须与字段纯文本一致。颜色为 theme、emphasis 或六位十六进制颜色，字号选10／12／14／16pt；`fontSizes[field]`、`lineSpacing[field]` 控制当前字段字号和行距倍数。保留人工格式改动。

`paragraphs[field]` 为逐段数组，顺序对应纯文本的换行，单项 `{bullet,marker,after,align}`。`after` 为 PPT pt，缺省 6；`align`为`left/center/right/justify`，未设置时继承原版式，两端对齐末行不分散。例如首行 `{bullet:false,align:'left'}`，后三行 `{bullet:true,marker:'•',after:12}`。字符级加粗／颜色／字号仍写入 rich，不用整字段格式覆盖选区。表格单元格的逐段格式为 `cellParagraphs['行,列']`。模块级统一列表是初始设置，人工可继续逐段修改。右栏单选与Ctrl+L/E/R/J共用同一提交路径，HTML和原生PPTX同时保留逐段对齐。

每块通常不超过四点，分段间距至少 6pt；末行只余一两个字必须修整，三四字也检查。先改文案和组织，再调模块，不自动缩字号硬塞。伪代码保留缩进与清楚的步骤间隔。

单个普通内容子区域不选C3编号样式，避免孤立“01”；优先默认、A3或B1。由C3转换后若需继续显示原`subheading`及`annotation`，设置`preserveExtras:true`，保留启用标记、文字及富文本，不将补充说明丢掉。

## 时间轴模块

用`moduleOf('timeline',rect,count)`创建，支持1–6阶段；常用2–5阶段。`parts[i]`包含`year,title,text,asset`，资产格式与媒体模块相同；可通过`timelinePart(i)`生成新阶段。`columns`随阶段数保持一致，当前一行排列，无需手工计算各列。年份深底、圆点、连线和短名统一使用`theme.primary`；不设置逐阶段颜色，增减和重排保持配色一致。照片／视频双击走统一媒体上传入口。

```js
const m = moduleOf('timeline', {x:58,y:306,w:1484,h:508}, 4);
m.parts[0].year = '2026年';
m.parts[0].title = '方法提出';
m.parts[0].text = '说明代表工作、证据与贡献，并交代适用范围及未解决的问题。';
m.parts[0].asset = {kind:'image',src:imageDataUrl,fit:'cover',zoom:1,cx:50,cy:50};
slide.modules = [m];
```

渲染按数量均分卡片，统一实际媒体高度，按段落占用压缩媒体高度，最低72px；不缩文字字号。默认年份24pt、段落14pt、箭头短名18pt。图文连续浅底、图片上下16px间距、圆心与卡片左沿对齐，连接线直达年份块顶端，箭头超出内容两端各32px。长首句需要相应下移模块，逐页检查真实间隙。内容无法容纳时报溢出，不能裁掉说明、覆盖页脚或通过缩字硬塞。

已有`history`快照可用`modularizeHistory(slide,assets)`一次性迁移：沿用该页已修改的年份、短名、介绍、媒体及格式，不重新套默认文案。正式两校第8页已迁移；本地打开 `reference/navigation.html`，第10页是可直接操作的例子，具体位置见[参考示例库说明](../reference/README.md)。迁移后使用标准`modules[].parts`迭代，不再修改`legacy_*`。

## 媒体、表格与格式编辑

媒体子区域含 `asset:{src,kind,ratio,naturalRatio,fit,zoom,cx,cy}` 与 `caption,note,showCaption`。同排画面实际等高、图注底沿对齐；无图注设置 `showCaption:false`，不预留图注高度。表格用 `rows,headerRows,merges`，数字单元格左右各至少半字符间距。

`tableNote` 默认为空，按表格的实际需要填写；支持直接编辑与删除，不把指标箭头说明追加给所有表格。场景族表设置 `scenarioGroups:true`，第一列右侧及场景之间保留分隔线。`rowHeaders:true`只赋予首列行标题语义，不赋予深色底；深底只属于顶部表头行。成熟计划页优先使用summary快照。

表格`rowHeightPt`控制整表统一最小行高（0自动），`cellPaddingPt`控制上下内边距（缺省自动），不改变左右半字符间距。成熟页对应`referenceRowHeightPt`、`referenceCellPaddingPt`。内容超出所设行高时自然增高，不能裁切；调整后以实际表格底边检查模块、说明和页脚。

编辑工具栏根据当前字符／段落的计算样式回显字号、行距、段后距、颜色、粗细和列表，混合值显示“混合”。回显不修改数据，也不覆盖正在输入的控件。选区格式保持字符级，段落间距保持段落级；不能用历史操作值代替当前值。

## 成熟特殊页面

作者与阶段计划现以`src/editable-layouts.js`的`profilePage()`、`summaryPage()`为默认，`src/page-presets.js`继续导出构造器。旧快照作外观参照。作者页`contentTop:192`且无页首句；`profileIdentity:{x,y,w,h}`是左侧固定身份卡，保留`legacy_3`至`legacy_10`及`referencePortrait`，右侧使用普通模块。编辑、插入和导出统一用`slideBounds(slide)`、`occupiedItems(slide)`，不能因默认SAFE.y=256误判作者页越界，也不能让自动避让移动身份卡。

履历表为`type:'table',profileHistory:true,bandTitle:true`，`rows`只写真实内容列，半字符间隔列自动生成；正文默认14pt居中，表头16pt且下方为分段横线。无框线分组表为`type:'table',sectionedTable:true`，每个`parts[i]`含`title,text:'',rows,headerRows,cellRich,cellParagraphs,cellLineSpacing`，用`tablePart(title,rows)`生成。默认两组为任职／项目、研究方向，每组可独立增删、重排、调整行列或替换Excel。第一行默认16pt主题色加粗，正文14pt全部左对齐。

分组单元格额外标记`data-table-part`，富文本、行距及段后距写入对应`parts[i]`，不能写错到模块级rows或另一个分组。普通表格仍用模块级rows。行列增减保留范围内的单元格及格式，删除后清除越界格式，合并区域随之缩减。

`fontPt`为整表／子表默认字号，`fixedFont:true`表示手动指定10／12／14／16pt后保持该档位。`cellFontSizes['行,列']`存单元格整块字号；字符级字号仍存`cellRich`。作者页默认正文14pt，专用字段标题高一档16pt。批量文字选择由`src/text-block-selection.js`管理临时键，不进入project-data；格式应用通过同一`commit`路径分别写回各字段，一次保存撤销点，不能只改DOM或覆盖未选块。

阶段计划默认三个模块：`role:'summary-cards'`为20pt总标题、18pt分项题目、16pt正文的A2模块；`role:'plan-module'`是14pt纯表格；`role:'plan-discussion'`是C1文字模块。第四张总结卡片自动两列。计划表与讨论各占实际高度，不把分组标题变成整块深底大条带。

标题显隐用`showTitle:false`，文字总标题用`groupTitle`、普通表格用`tableTitle`；标题数据继续保存。`cardPaddingPt`是PPT pt，1–24、缺省自动，仅压缩不影响阅读的留白。统一插入菜单使用`findSpaces`寻找不相交空白，多个区域先展示位置供选择。

通过 `applyReferenceLayout(slide,name)` 复用 history、formula、summary、references、profile。快照在`src/reference-layouts.json`，局部CSS在`reference-layouts.css`，运行不依赖外部模板目录。文字映射为页面`legacy_*`字段；页标题、首句和来源使用标准字段。字段未变时保留原数学字形与链接。此函数会写入快照默认字段并清空modules，仅用于新页或明确重建的页面；迭代已有页直接修改相应字段，不能重复应用默认值覆盖人工内容。

优先保留成熟信息关系：时间轴用上述原生模块复现共底色、统一裁剪与对齐连接线；公式深色标题贴浅色解释框；参考文献无表头两列且顶端对齐；作者页五列履历与对齐身份区。不能简化成几个普通卡片。结构性修改同步调整对应渲染与局部样式；快照及局部样式已内置，生成文稿不调用旧模板导入脚本。

公式预设`formulaPage()`现在生成三个模块，左侧`type:'formula',style:'band',columns:1`含两个子区域，源码在`parts[index].latex`，解释在`text`；右侧为`role:'formula-symbols'`的白底表与`role:'formula-styles'`的浅底表。表格`cardStyle`可为plain/unified/cards/band，保持模块独立位置及尺寸。标题统一18pt；`fontPt:14,fixedFont:false`使表格在8–14pt范围适配，实际选择固定字号时设为true。

表格`rows`中的`$LaTeX$`渲染为可双击的行内数学内容；编辑器读取时还原源码，不保存KaTeX内部字形。`mathUseThemeColor`为模块默认，公式子区域`useThemeColor`及表格`cellMathColors['行,列,公式序号']`可覆盖。LaTeX弹窗可选主题色／纯黑。统一切换模块颜色时清除这些覆盖。旧`referenceLayout:'formula'`在验证载入时迁移为真实模块，保留页ID、用户解释文字和已编辑LaTeX，清除已迁入模块的旧自由文字占位。头像覆盖仍为`referencePortrait`。

公式容器清除 KaTeX 默认展示段的外边距，解释文字保持正常流，不用绝对定位压入公式区域。提交前检查公式和解释的实际高度；超过当前版式时保留编辑框、提示精简或拆行，原公式保持不变。

## 章节与交付

正文自动继承最近过渡页；无过渡页附录用 `chapterMode:'manual',section:'附录',group:'参考与作者'`。连续同组形成一个目录范围。修改后调用 `syncSections(project)`；目录说明存 `tocNotes[章节ID]`，不手工写死页码。

把中间模型写入 ect，再运行：

```powershell
node scripts/build-document.mjs ect/文稿.json 正式文稿.html --export
```

先启动本地服务。正式 HTML 在根目录或指定正式目录，PDF/PPTX 在 output，检查产物在 ect。等待字体、媒体加载，逐页检查 `window.slideStudio.check()`，目视复核单页与总览，保存重开后检查富文本、公式及备注。PPTX 保留原生文字，公式与复杂装饰为独立图像，不承诺 Office 原生公式。

目录配置：tocIncludeAppendix 默认 false；tocExcluded 保存隐藏章节 ID，tocExtras 保存具有 tocCustomId 的自定义子区域。同步只更新自动章节，不能覆盖用户的增删与自定义文本。

页面复制通过`duplicatePages(pages)`克隆，重新生成页面／模块ID并重映射副本内章节引用、目录说明键和`#slide-ID`链接；复制范围外的链接保持指向原页面。拖排用`movePages`保持选中页相对顺序，修改后调用`syncSections`重新派生章节及目录。多选和剪贴板属于工作台临时状态，不写进HTML项目数据。


学校变体：先生成北科共同底稿，再用 applyLishuiVariant 替换丽水主题、校徽与学校介绍。学校变体不能删除标准页或改变公共模块几何结构。reference目录为人工认可的完整HTML快照，未经要求不重做；当前仅保留example-project、text-styles-example和navigation三份HTML；时间轴放在navigation第10页，移除学校标识，媒体使用占位符。更新实例时同步其哈希、实际多页截图与该目录README。
