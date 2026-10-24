# AI 生成与复用接口

先读根目录[SKILL.md](../SKILL.md)。本文的所有源码、样式、快照和素材都在本项目内，不依赖其他已安装的学校skill或作者聊天记录。固定画布1600×900，预览只做整体缩放。

从 `src/example.js` 的 `createExample(options)` 创建学校示例，或从 `src/model.js` 的 `newDocument(title)` 创建空白文稿。`src/server/schools.mjs` 提供学校标志与图片数据；交付媒体使用 data URL，确保 HTML 自包含。

项目为 `{version:1,title,theme,grid,slides}`。主题包括 `name,primary,secondary,accent,emphasis,tint,ink,logo,wordmark`。页面用 `blankSlide()`／`makePage(kind)` 创建，kind 为 cover、closing、transition、toc、body。ID 必须唯一。

## 普通模块

正文默认区域`{x:58,y:256,w:1484,h:554}`。建议模块间隙12px，可按空间缩小，不把建议留白作为错误。用`moduleOf(type,rect,count)`创建模块，type为text、media、table、shape、formula、timeline。实际可用边界用`contentBounds(!!slide.summary)`取得：普通正文底边834px、启用summary时750px，均不得遮挡真实页脚或总结。`lead`可空，`footer,source,sourceUrl`可编辑；通用正文示例可用`hideLogo:true`去掉页眉标识及其占位文字。

独立文本块仍为text模块，设置`textBox:true,boxTone:'dark'|'light'`，仅使用parts[0].text，不附带标题。深底白字或白底深字，圈定范围与移动／缩放吸附网格；最小高40px，真实文本溢出仍报错。默认上下内边距在紧凑时可适当收减，不能自动缩字号或行距。

文字子区域含 `title,text,bullet,marker`，可选 `subheading,annotation,takeaway`。`rich[field]` 为 `{text,bold,italic,color,fontSize}` 运行段数组，拼接必须与字段纯文本一致。颜色为 theme、emphasis 或六位十六进制颜色，字号选 14／16pt；`fontSizes[field]`、`lineSpacing[field]` 控制当前字段字号和行距倍数。保留人工格式改动。

`paragraphs[field]` 为逐段数组，顺序对应纯文本的换行，单项 `{bullet,marker,after}`。`after` 为 PPT pt，缺省 6；例如首行 `{bullet:false}`，后三行 `{bullet:true,marker:'•',after:12}`。字符级加粗／颜色／字号仍写入 rich，不用整字段格式覆盖选区。表格单元格的逐段格式为 `cellParagraphs['行,列']`。模块级统一列表是初始设置，人工可继续逐段修改。

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

已有`history`快照可用`modularizeHistory(slide,assets)`一次性迁移：沿用该页已修改的年份、短名、介绍、媒体及格式，不重新套默认文案。正式两校第8页已迁移；[reference/navigation.html](../reference/navigation.html)第10页是可直接操作的例子。迁移后使用标准`modules[].parts`迭代，不再修改`legacy_*`。

## 媒体、表格与格式编辑

媒体子区域含 `asset:{src,kind,ratio,naturalRatio,fit,zoom,cx,cy}` 与 `caption,note,showCaption`。同排画面实际等高、图注底沿对齐；无图注设置 `showCaption:false`，不预留图注高度。表格用 `rows,headerRows,merges`，数字单元格左右各至少半字符间距。

`tableNote` 默认为空，按表格的实际需要填写；支持直接编辑与删除，不把指标箭头说明追加给所有表格。场景族表设置 `scenarioGroups:true`，第一列右侧及场景之间保留分隔线。`rowHeaders:true`只赋予首列行标题语义，不赋予深色底；深底只属于顶部表头行。成熟计划页优先使用summary快照。

表格`rowHeightPt`控制整表统一最小行高（0自动），`cellPaddingPt`控制上下内边距（缺省自动），不改变左右半字符间距。成熟页对应`referenceRowHeightPt`、`referenceCellPaddingPt`。内容超出所设行高时自然增高，不能裁切；调整后以实际表格底边检查模块、说明和页脚。

编辑工具栏根据当前字符／段落的计算样式回显字号、行距、段后距、颜色、粗细和列表，混合值显示“混合”。回显不修改数据，也不覆盖正在输入的控件。选区格式保持字符级，段落间距保持段落级；不能用历史操作值代替当前值。

## 成熟特殊页面

通过 `applyReferenceLayout(slide,name)` 复用 history、formula、summary、references、profile。快照在`src/reference-layouts.json`，局部CSS在`reference-layouts.css`，运行不依赖外部模板目录。文字映射为页面`legacy_*`字段；页标题、首句和来源使用标准字段。字段未变时保留原数学字形与链接。此函数会写入快照默认字段并清空modules，仅用于新页或明确重建的页面；迭代已有页直接修改相应字段，不能重复应用默认值覆盖人工内容。

优先保留成熟信息关系：时间轴用上述原生模块复现共底色、统一裁剪与对齐连接线；公式深色标题贴浅色解释框；参考文献无表头两列且顶端对齐；作者页五列履历与对齐身份区。不能简化成几个普通卡片。结构性修改同步调整对应渲染与局部样式；快照及局部样式已内置，生成文稿不调用旧模板导入脚本。

公式用 `referenceLatex[index]` 修改，普通公式模块用 `parts[index].latex`。头像覆盖为 `referencePortrait` 图片 data URL。原矢量公式与修改后的 KaTeX 只显示一份；变量、函数、单位、向量与矩阵样式按材料统一。

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
