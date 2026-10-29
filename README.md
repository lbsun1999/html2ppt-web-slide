# Web Slide：AI 与人工协作的科研幻灯片工作台

当前稳定版本：**v0.2.0**。

Web Slide 把 AI 内容加工、浏览器人工精修、演讲备注和 PDF／PPTX 交付放在同一份可继续编辑的 HTML 中。AI 可以整理材料和选择版式，用户继续修改文字、公式、表格、图片与模块；保存后的 HTML 还能交回 AI 迭代，不必从头制作。

> ## 主入口：[打开 `index.html`](index.html)
>
> **`index.html` 是项目的主入口、离线导航页和使用说明入口。** 下载并解压后优先双击它，再从图文导航进入主模板、交互教学、说明文档和参考页面。

[![Web Slide 多页工作台：顶部控件、左侧缩略图、中央画布和右侧设置](docs/images/workbench-overview.png)](docs/images/workbench-overview.png)

## 三分钟开始

1. 下载[完整项目 ZIP](https://github.com/lbsun1999/html2ppt-web-slide/archive/refs/heads/main.zip)，解压到普通本地文件夹。
2. 双击根目录的 [`index.html`](index.html)。
3. 第一次使用选择“交互式入门教学”；已有经验可直接进入北科科技蓝主模板。
4. 在工作台中先确定文档大纲，再修改页面、模块、文字、图表和备注。
5. 保存 HTML；需要 PDF／PPTX 时运行 [`启动.cmd`](启动.cmd)，在本地工作台中导出。

直接编辑和放映 HTML 不需要安装环境。导出、Excel 导入及完整自检需要 Node.js 20.10+、Chrome／Edge和项目依赖；不要求 Microsoft Office 或 Python。

## 入口怎么选

| 需求 | 打开这里 |
| --- | --- |
| 浏览整个项目 | **[`index.html`：主入口与图文导航](index.html)** |
| 第一次学习 | [`文本块样式展示.html`：交互式入门教学](文本块样式展示.html) |
| 制作北科科研汇报 | [北科科技蓝主模板](templates/template-1/ustb-blue/template.html) |
| 制作北科党政汇报 | [北科钢铁红模板](templates/template-1/ustb-red/template.html) |
| 查看学校主题迁移 | [丽水学院主题青模板](templates/template-1/lishui-cyan/template.html) |
| 查完整说明 | [离线图文说明中心](docs/site/index.html) |
| 让 AI 制作或续改 | [SKILL.md](SKILL.md) |

GitHub 中的 HTML 链接用于查看源文件。要运行完整工作台，请下载后从本地打开。

## 核心工作流

```text
原始材料 → AI/人工确认大纲 → 选择现有页面与模块 → 浏览器精修
        → 保存可继续编辑的 HTML → 备注与放映 → PDF/PPTX → 人工终审
```

- **大纲先行**：使用 `# 总标题`、`## 章节`、`### 页面标题`建立结构；可更新当前文稿，也可另建正文干净的新文稿。
- **模块化制作**：支持文字、表格、公式、图片／视频、时间轴、伪代码、参考文献、作者简介和总结计划。
- **人工精修**：逐字符调整字号、粗细和颜色，逐段调整列表、对齐、行距及段后距；Shift 可多选文字块统一修改。
- **结构调整**：模块和子区域可增删、排序、移动、缩放；网格显示时自动吸附，关闭后自由移动。
- **高级对齐**：参考线平移／拉伸、多模块等距分布和环形组合；多子区域会展开参与间隙计算。
- **连续迭代**：人工保存的最新版 HTML 是下一轮 AI 加工的源稿，已有内容和位置不能被无故重置。

详细操作见[控件与编辑说明](docs/site/README.html)，AI 与人工的责任边界见[AI制作与迭代流程](docs/AI制作与迭代流程.md)。

[![文档大纲：总标题、章节、页面、附录和对应页面设置](docs/images/outline-manager.png)](docs/images/outline-manager.png)

[![模块编辑：尺寸、位置、样式和子区域控件](docs/images/module-controls.png)](docs/images/module-controls.png)

## 模板与交互教学

北科科技蓝是当前主模板。北科钢铁红演示同一版式如何迁移到党政主题；丽院青用于验证学校、主题和素材的增量扩展。模板之间共享工作台能力，但各自携带独立 HTML、素材、说明和导出快照。

| 模板 | HTML源稿 | 导出快照 | 预览 |
| --- | --- | --- | --- |
| 北科科研·科技蓝 | [打开](templates/template-1/ustb-blue/template.html) | [PDF](templates/template-1/ustb-blue/output/template.pdf) · [PPTX](templates/template-1/ustb-blue/output/template.pptx) | [30页总览](docs/images/ustb-preview.png) |
| 北科党政·钢铁红 | [打开](templates/template-1/ustb-red/template.html) | [PDF](templates/template-1/ustb-red/output/template.pdf) · [PPTX](templates/template-1/ustb-red/output/template.pptx) | [公式页](docs/images/red-formula-theme.png) |
| 丽水学院·主题青 | [打开](templates/template-1/lishui-cyan/template.html) | [PDF](templates/template-1/lishui-cyan/output/template.pdf) · [PPTX](templates/template-1/lishui-cyan/output/template.pptx) | 同版式族换肤示例 |

交互教学统一从北科科技蓝主模板进入，逐项练习：

1. 手动改成钢铁红主题，并上传独立校徽与组合标志 SVG；
2. 编写、粘贴和应用文档大纲；
3. 修改页面标题、页首句、页尾总结、来源和备注；
4. 操作多子区域、表格、公式、图片和图文混排；
5. 将时间轴切换为普通并列图文卡片；
6. 使用参考线、等距和环形分布；
7. 学习多页浏览、演讲者视图、全屏放映与导出。

每个教学大项可单独跳过。跳过主题教学时才自动补齐完整钢铁红状态；正常教学要求用户手动操作真实控件。

[![时间轴模块：阶段排序、增删与普通并列图文切换](docs/images/timeline-controls.png)](docs/images/timeline-controls.png)

## 放映、备注与导出

### 两种正式放映方式

- **演讲者视图**：适合投影仪或第二块屏幕。观众窗口只显示画面，工作台保留当前页备注并同步翻页；窗口由用户拖到目标屏幕。
- **全屏放映**：适合单屏。方向键或滚轮翻页，双击进入总览；Ctrl＋滚轮缩放，放大后左键拖动；Esc 第一次复位、再次退出。

[![全屏放映画面与操作提示](docs/images/presentation-fullscreen.png)](docs/images/presentation-fullscreen.png)

工作台另有单页、单列滚动和可指定列数的多页滚动视图，用于制作与检查，不等同于正式放映。

### 本地导出

Windows 双击 [`启动.cmd`](启动.cmd)，或在项目目录运行：

```powershell
node scripts/start.mjs --open
```

服务启动后访问 `http://127.0.0.1:4317`，选择“打开 HTML”，再导出到指定路径。无需拖拽文件。遇到 Windows 来源提醒、启动闪退、缺少依赖或端口占用时，查看[启动与导出排障](docs/启动与导出排障.md)。

[![离线 HTML 连接本地导出服务](docs/images/local-export-connection.png)](docs/images/local-export-connection.png)

> **PPTX 必须人工逐页审核。** 导出结果已尽量保持标题单行、手动换行、中文标点规则、列表、页脚和参考文献顶端对齐，但不同 PowerPoint 环境仍可能出现字体替代、局部颜色或标点断行差异。

## 主入口与文件列表

根目录中最重要的文件按使用顺序如下：

| 重要级别 | 文件／目录 | 作用 |
| --- | --- | --- |
| **首先打开** | **[`index.html`](index.html)** | **项目主入口、离线导航页；集中链接模板、教学、说明和参考资料** |
| 新手教学 | [`文本块样式展示.html`](文本块样式展示.html) | 交互式操作训练，不再是静态样式展板 |
| AI入口 | [`SKILL.md`](SKILL.md) | AI读取的完整制作、排版、迭代和验收规范 |
| 使用说明 | [`README.md`](README.md) | 当前项目总览与最短使用路径 |
| 本地服务 | [`启动.cmd`](启动.cmd) | 启动工作台、PDF/PPTX导出与Excel导入服务 |
| 模板包 | [`templates/`](templates/) | 独立学校／主题HTML、素材、说明和可选输出 |
| 图文文档 | [`docs/`](docs/) | 操作说明、排版规则、排障、验收记录和截图 |
| 参考示例 | [`reference/`](reference/) | 综合示例、文字样式与导航／时间轴测试页 |
| 公共代码 | `src/`、`styles.css`、`server.mjs` | 编辑、放映、导出和模块运行时；普通用户无需先读 |
| 维护脚本 | `scripts/`、`tests/` | 模板构建、文档生成、截图和自动检查 |
| 可再生产物 | `ect/` | 日志、测试结果和中间文件，不属于正式源稿 |

新增模板时复制最接近的模板包，替换主题、标志、图片和学校内容即可；只有新增通用模块或工作台能力时才修改公共代码。完整约定见[模板包说明](templates/README.md)。

## 文档索引

| 文档 | 用途 |
| --- | --- |
| [完整图文说明](docs/site/index.html) | 从浏览器离线查看所有主要说明 |
| [AI制作与迭代流程](docs/AI制作与迭代流程.md) | 材料、大纲、逐页制作、人机边界和续改流程 |
| [AI接口与排版规则](docs/AI接口与排版规则.md) | project-data、模块、富文本、章节和特殊页面接口 |
| [版式细则与错误复盘](docs/版式细则与错误复盘.md) | 内容密度、短尾行、表格、公式、图文和常见错误 |
| [文本块组件说明](docs/文本块组件说明.md) | A／B／C文本样式及编辑规则 |
| [板块对齐与附加功能](docs/板块对齐与附加功能需求.md) | 参考线、等距、环形分布与验收标准 |
| [启动与导出排障](docs/启动与导出排障.md) | Windows提醒、启动失败、端口、依赖和导出问题 |
| [导出实现说明](docs/导出实现说明.md) | PDF/PPTX转换机制与当前边界 |
| [项目结构与清理记录](docs/项目结构与清理记录.md) | 目录职责、运行依赖与可清理内容 |
| [验收记录](docs/验收记录.md) | 自动检查范围、回归结果和已知限制 |
| [CHANGELOG](CHANGELOG.md) | v0.1.0至v0.2.0的主要变化 |

## 维护与验证

恢复依赖并启动服务后运行：

```powershell
npm.cmd ci
npm.cmd run test:all
```

测试日志写入 `ect/self-check/`。自动检查覆盖结构、边界、编辑、主题、公式、表格、时间轴、放映和导出，但不能替代逐页目视检查和真实 PowerPoint 环境终审。

## 许可与资料来源

本仓库临时公开，仅供查看、学习与参考，不授予复制、分发、修改、再许可、公开传播或商业使用许可。后续重大功能更新将迁移至私有仓库维护，完整条款见[LICENSE](LICENSE)。

学校标识、校园图片及其他第三方材料受各自权利人的权利限制。校徽检索可参考[中国高校校徽（LOGO）官方下载资源汇总](https://www.cnblogs.com/cdz-111/articles/22432508)，最终以学校官方原件为准。示例中的校史、数据和占位文字仅用于版式展示，真实汇报必须替换为可核查材料。
