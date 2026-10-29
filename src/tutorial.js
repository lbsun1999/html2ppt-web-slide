const OUTLINE=`# 研究进展汇报

## 01 问题背景与意义

### 研究背景与问题定义
### 当前研究现状
### 目标与技术路线

## 02 方法设计与实现

### 研究方法与总体框架
### 目标函数与参数更新
### 算法流程与实现要点

## 03 实验结果与分析

### 实验设置与评价指标
### 实验结果与方法比较
### 消融实验与误差分析

## 04 总结与计划

### 阶段总结与后续计划

## 附录

### 参考文献
### 作者简介`;

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
 {title:'最后一章作为附录',text:'当末章是参考文献、作者简介或补充材料时勾选。系统会使用“附录”标签，并默认从目录排除。',target:'#outline-appendix',notice:'章节标题不必手写“附录”二字，勾选项负责语义与目录规则。'},
 {title:'结束页开关',text:'勾选后保留或生成结束页。封面、过渡页和结束页不显示页脚及页码。',target:'#outline-closing',notice:'正式答辩通常保留；内部短会可按需要关闭。'},
 {title:'点击“应用到当前文稿”',text:'确认应用方式为“更新当前文稿”，再点击界面中的“应用到当前文稿”。页面标题和章节关系会更新，后续教学仍在当前页面中继续。',target:'#outline-apply',event:'click'},
 {group:'页面设置',title:'点击“标题、页首句与来源”',text:'在右侧“当前页设置”中点击“标题、页首句与来源”，打开标题、页首句、页尾总结、脚注与备注。若当前不是正文页，也可以先在左侧切换一页。',target:'[data-action="page-settings"]',event:'click'},
 {title:'写一条演讲备注',text:'把下面提示复制到“本页备注”。备注不会出现在画面或导出页中，但会在演讲者视图自动跟随。',target:'#page-notes',input:'#page-notes',copy:'本页先交代研究问题，再说明证据来源；结尾用一句话过渡到下一页。'},
 {title:'点击“应用”',text:'点击弹窗中的“应用”，让标题、脚注与备注写回当前页。',target:'[data-action="page-dialog-apply"]',event:'click'},
 {title:'切换到正文练习页',text:'请在左侧缩略图中选择一张普通正文页。后面的模块、图文和对齐练习都在正文安全区内完成。',target:'.slide-thumb[data-page="3"]',event:'click'},
 {group:'模块与内容',title:'学习模块编辑',text:'点击“编辑模块”，再点击画布中的任意模块。右侧可以调整样式、子区域、尺寸与位置。',target:'[data-action="mode-edit"]',event:'click'},
 {title:'选中一个真实模块',text:'请点击画布里的任意模块。选中后会出现轮廓和右侧属性。',target:'#canvas .module',event:'click'},
 {title:'多子区域不是固定截图',text:'右侧“＋ 子区域”会在当前模块内新增一项；每项都能单独编辑、排序或删除。请新增一个练习子区域，之后可用撤销恢复。',target:'[data-action="add-part"]',event:'click'},
 {title:'网格就是吸附开关',text:'勾选网格后，拖动与参考线自动吸附；关闭网格则自由移动。请切换一次网格。',target:'#grid-visible',event:'change'},
 {title:'文字可逐段精调',text:'点击“编辑文字”，随后可选中文字调整字号、粗细、颜色、行距、段后距和对齐。Shift 可多选文字块。',target:'[data-action="mode-text"]',event:'click'},
 {title:'插入表格、公式与图文模块',text:'顶部“＋”统一收纳文字、表格、图片／视频和更多模块。表格支持粘贴或导入；公式保留 LaTeX；图像支持 SVG、裁剪和图注。',target:'#insert-menu',notice:'插入前先找连续空白区；有多个空白区时由用户选择。表格、公式和图片都是真实模块，插入后仍可移动、缩放、增减子区域。'},
 {title:'图文混排与图片替换',text:'媒体模块可包含多个等高子区域。双击图片或占位符即可上传 PNG、JPEG、WebP、SVG 或视频，并调整比例、缩放、取景和图注。',target:'#canvas',notice:'没有图注时不保留多余图注高度；并列图片保持实际等高。图片只是占位符时，也应明确可双击替换。'},
 {title:'同一区域也可放多个模块',text:'先用“圈定范围”划出空白区域，再从“＋”插入独立模块；模块之间不能遮挡，边缘与间距应有明确关系。',target:'[data-action="draw"]',notice:'模块数量不是越多越好。一个文字板块一般不超过4点；超过时先凝练、拆分或换版式。'},
 {group:'高级对齐',title:'进入高级对齐',text:'重新选中一个模块后，点击右侧“高级对齐与分布”。参考线可平移或单边拉伸，多选模式可做等距与环形分布。',target:'[data-action="advanced-align"]',event:'click'},
 {title:'多选、等距与环形分布',text:'点击“多选开关”，再在画布中选择多个模块。可固定最外边界后平均间隙，也可把文本块组成可整体移动的环形组。',target:'[data-align-mode="multi"]',event:'click'},
 {title:'高级排版的边界',text:'纵／横参考线负责对齐或拉伸；垂直／水平等距会展开多子区域参与计算；环形分布可设置数量、半径与角度。',target:'#alignment-panel',notice:'对齐只改变几何关系，不替代内容判断。必须复查安全区、遮挡、模块边缘、留白和阅读顺序；越界结果不能直接导出。'},
 {group:'时间轴与图文',title:'时间轴也能变成图文卡片',text:'请在左侧打开“研究现状分析”页。时间轴本质上是可增减、排序的图文子区域，不是固定图片。',target:'.slide-thumb',targetText:'研究现状分析',event:'click'},
 {title:'重新进入模块编辑',text:'点击“编辑模块”，准备选中时间轴本身，而不是修改卡片里的文字。',target:'[data-action="mode-edit"]',event:'click'},
 {title:'选中时间轴模块',text:'点击时间轴中的任意卡片，右侧会显示阶段排序、删除、添加以及“隐藏时间轴装饰”。',target:'#canvas .timeline-grid',event:'click'},
 {title:'切换为普通并列图文',text:'勾选“隐藏时间轴装饰”，年份、连线、圆点和箭头会隐藏，同一组内容立即退化为普通并列图文卡片；再次取消即可恢复。请切换一次。',target:'#hide-timeline',event:'change'},
 {group:'备注与放映',title:'页面备注与双窗口放映',text:'请点击“页面备注”查看刚才的内容。演讲者视图适合双屏：观众窗口只显示画面，工作台保留备注并同步翻页。',target:'[data-action="notes"]',event:'click'},
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
 let index=0,target=null,cleanup=()=>{},waitTimer=0;
 const root=el('section','tutorial-guide');root.setAttribute('role','dialog');root.setAttribute('aria-live','polite');
 const progress=el('div','tutorial-progress'),progressLabel=el('div','tutorial-progress-label'),majorRuler=el('div','tutorial-ruler major'),minorRuler=el('div','tutorial-ruler minor'),title=el('h2'),text=el('p'),copyBox=el('div','tutorial-copy'),actions=el('div','tutorial-actions');
 progress.append(progressLabel,majorRuler,minorRuler);
 const exit=el('button','tutorial-exit','退出教学'),skipStep=el('button','','代我完成此步'),skipGroup=el('button','','代我完成本大项'),next=el('button','primary','我已阅读，继续');actions.append(exit,skipStep,skipGroup,next);root.append(progress,title,text,copyBox,actions);document.body.append(root);
 const groupOf=i=>{for(let n=i;n>=0;n--)if(steps[n].group)return steps[n].group;return '开始';};
 const groupNames=[...new Set(steps.map((_,i)=>groupOf(i)))].filter(name=>name!=='开始');
 const groupMeta=i=>{const name=groupOf(i),indices=steps.map((_,n)=>n).filter(n=>groupOf(n)===name),position=indices.indexOf(i)+1,number=groupNames.indexOf(name)+1;return {name,indices,position,number,total:indices.length};};
 const renderRuler=(meta)=>{
  progressLabel.textContent=meta.number>0?`第 ${meta.number}.${meta.position} 步 · ${meta.name}`:`导览 · ${meta.name}`;
  majorRuler.replaceChildren(...groupNames.map((name,n)=>{const dot=el('span','tutorial-tick major-tick');dot.dataset.label=name;dot.title=name;if(n+1<meta.number)dot.classList.add('done');else if(n+1===meta.number)dot.classList.add('active');return dot;}));
  minorRuler.replaceChildren(...meta.indices.map((stepIndex,n)=>{const dot=el('span','tutorial-tick minor-tick');dot.title=steps[stepIndex].title;if(n+1<meta.position)dot.classList.add('done');else if(n+1===meta.position)dot.classList.add('active');return dot;}));
  minorRuler.hidden=meta.name==='开始';
 };
 const clear=()=>{clearTimeout(waitTimer);cleanup();cleanup=()=>{};document.querySelectorAll('.tutorial-target').forEach(node=>node.classList.remove('tutorial-target'));target=null;};
 const find=(selector,contains)=>{if(!selector)return null;const items=[...document.querySelectorAll(selector)];return contains?items.find(node=>(node.textContent||node.getAttribute('aria-label')||'').includes(contains)):items[0];};
 const leaveModal=()=>{const modal=root.closest('dialog');if(modal){document.body.append(root);modal.close();}};
 const go=(nextIndex,{closeModal=false,reward=false}={})=>{if(closeModal)leaveModal();clear();index=Math.max(0,Math.min(steps.length-1,nextIndex));playCue();if(reward)burst();setTimeout(show,120);};
 const waitFor=selector=>new Promise((resolve,reject)=>{let tries=0;const check=()=>{const node=document.querySelector(selector);if(node)return resolve(node);if(++tries>40)return reject(Error('教学控件未出现'));setTimeout(check,100);};check();});
 const setValue=(node,value)=>{node.value=value;node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));};
 const autoStep=()=>{const step=steps[index];if(step.input){const input=find(step.input);setValue(input,step.copy??'');return;}if(step.fileStep){onSkipTheme?.();go(index+1,{reward:true});return;}if(step.event&&target){target.click();return;}go(index+1,{reward:true});};
 const autoGroup=async()=>{const meta=groupMeta(index),nextIndex=meta.indices.at(-1)+1;try{
  if(meta.name==='主题换肤')onSkipTheme?.();
  else if(meta.name==='大纲教学'){
   let dialog=document.querySelector('#outline-dialog');if(!dialog){document.querySelector('[data-action="outline"]')?.click();dialog=await waitFor('#outline-dialog');}
   setValue(dialog.querySelector('#outline-text'),OUTLINE);dialog.querySelector('#outline-mode').value='current';dialog.querySelector('#outline-mode').dispatchEvent(new Event('change',{bubbles:true}));for(const id of ['outline-toc','outline-transitions','outline-appendix','outline-closing']){const box=dialog.querySelector('#'+id);if(!box.checked)box.click();}await new Promise(resolve=>setTimeout(resolve,180));dialog.querySelector('#outline-apply')?.click();await new Promise(resolve=>setTimeout(resolve,180));
  }else if(meta.name==='页面设置'){
   let dialog=document.querySelector('#page-dialog');if(!dialog){document.querySelector('[data-action="page-settings"]')?.click();dialog=await waitFor('#page-dialog');}setValue(dialog.querySelector('#page-notes'),'本页先交代研究问题，再说明证据来源；结尾用一句话过渡到下一页。');dialog.querySelector('[data-action="page-dialog-apply"]')?.click();
  }else if(meta.name==='模块与内容')document.querySelector('[data-action="mode-text"]')?.click();
  else if(meta.name==='高级对齐')document.querySelector('[data-action="advanced-close"]')?.click();
  else if(meta.name==='时间轴与图文'){const toggle=document.querySelector('#hide-timeline');if(toggle&&!toggle.checked)toggle.click();}
  else if(meta.name==='备注与放映'){const notes=document.querySelector('#notes-toggle');if(notes?.getAttribute('aria-pressed')!=='true')notes?.click();}
  go(nextIndex,{closeModal:true,reward:true});
 }catch(error){const n=el('aside','tutorial-notice');n.innerHTML='<strong>自动完成失败</strong><span></span>';n.querySelector('span').textContent=error.message+'，请完成当前控件或退出后重新进入教学。';copyBox.append(n);}};
 const show=()=>{
  clear();const step=steps[index],meta=groupMeta(index);renderRuler(meta);title.textContent=step.title;text.textContent=step.text;copyBox.replaceChildren();
  skipStep.hidden=step.finish;skipGroup.hidden=step.finish||meta.name==='开始';next.hidden=!!step.event;next.textContent=step.finish?'完成并退出':step.input?'完成填写，继续':'我已阅读，继续';
  if(step.notice){const n=el('aside','tutorial-notice');n.innerHTML='<strong>必读告示</strong><span></span>';n.querySelector('span').textContent=step.notice;copyBox.append(n);}
  if(step.copy){const pre=el('pre','tutorial-copy-text',step.copy),button=el('button','','复制练习内容');button.type='button';button.onclick=async()=>{try{await navigator.clipboard.writeText(step.copy);button.textContent='已复制 ✓';}catch{pre.focus();const range=document.createRange();range.selectNodeContents(pre);getSelection().removeAllRanges();getSelection().addRange(range);button.textContent='已选中，请按 Ctrl+C';}};copyBox.append(pre,button);}
  const bind=()=>{
   if(index>=steps.length)return;target=find(step.target,step.targetText);if(!target){waitTimer=setTimeout(bind,180);return;}const modal=target.closest('dialog[open]');if(modal&&!modal.contains(root))modal.append(root);else if(!modal&&!document.body.contains(root))document.body.append(root);document.querySelectorAll('.tutorial-target').forEach(node=>node.classList.remove('tutorial-target'));target.classList.add('tutorial-target');target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});
   if(step.event){const watched=target,done=()=>advance();watched.addEventListener(step.event,done,{once:true});cleanup=()=>watched.removeEventListener(step.event,done);}
   if(step.input){const input=find(step.input),done=()=>{if(step.allowEmpty||input.value.trim())advance();};input.addEventListener('change',done,{once:true});input.addEventListener('paste',()=>setTimeout(done,30),{once:true});cleanup=()=>input.removeEventListener('change',done);}
  };bind();
 };
 const advance=()=>{if(root.closest('dialog'))document.body.append(root);clear();playCue();burst();if(index>=steps.length-1){root.remove();history.replaceState(null,'',location.pathname+location.hash);return;}index++;setTimeout(show,280);};
 next.onclick=advance;
 skipStep.onclick=autoStep;
 skipGroup.onclick=autoGroup;
 exit.onclick=()=>{leaveModal();clear();root.remove();history.replaceState(null,'',location.pathname+location.hash);};show();
}
