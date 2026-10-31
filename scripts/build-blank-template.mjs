import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {blankSlide,defaultTheme,makePage,moduleOf,part,SAFE,syncSections,validateProject} from '../src/model.js';
import {profilePage} from '../src/editable-layouts.js';
import {writeDocument} from './build-document.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

function chapter({id,section,group,title,lead}){
 const s=blankSlide();
 Object.assign(s,{id,chapterMode:'manual',section,group,title,lead,source:'',sourceUrl:'',summary:'',notes:'',modules:[]});
 return s;
}

const cover=makePage('cover');
Object.assign(cover,{id:'blank-cover',title:'汇报标题',lead:'副标题／项目名称',presenter:'汇报人姓名',institute:'学院／研究机构',date:'汇报日期'});

const toc=makePage('toc');
Object.assign(toc,{id:'blank-toc',title:'汇报目录',lead:'目录根据后续内容页的章节名称自动生成；附录默认不列入目录。'});

const media=chapter({id:'blank-media-page',section:'01',group:'图片与媒体',title:'图片与视频',lead:'双击占位区域替换素材；并列媒体保持实际等高，图标题与说明可直接编辑。'});
const mediaModule=moduleOf('media',{...SAFE},2);
Object.assign(mediaModule,{id:'blank-media-module',columns:2});
mediaModule.parts.forEach((p,i)=>Object.assign(p,{title:'',text:'',caption:`图 ${i+1}　图片标题`,note:'补充图像说明或数据来源。',showCaption:true,captionMode:'note',asset:null}));
media.modules=[mediaModule];

const table=chapter({id:'blank-table-page',section:'02',group:'表格与数据',title:'数据表格',lead:'替换表头与数据；按内容增减行列，并调整字号、行高和单元格内边距。'});
const tableModule=moduleOf('table',{...SAFE});
Object.assign(tableModule,{id:'blank-table-module',headerRows:1,tableNote:'按实际指标补充单位、统计口径与箭头含义。',rows:[
 ['项目／方法','指标 1 ↑','指标 2 ↓','说明'],
 ['方法 A','00.00 ± 00.00','00.00 ± 00.00','填写实验条件'],
 ['方法 B','00.00 ± 00.00','00.00 ± 00.00','填写实验条件'],
 ['方法 C','00.00 ± 00.00','00.00 ± 00.00','填写实验条件'],
 ['本文方法','00.00 ± 00.00','00.00 ± 00.00','填写主要结论']
]});
table.modules=[tableModule];

const timeline=chapter({id:'blank-timeline-page',section:'03',group:'时间轴',title:'研究进展与里程碑',lead:'增减阶段并替换年份、事件、图片或视频；隐藏时间轴装饰后可改为并列图文卡片。'});
const timelineModule=moduleOf('timeline',{...SAFE},4);
Object.assign(timelineModule,{id:'blank-timeline-module',columns:4});
timelineModule.parts.forEach((p,i)=>Object.assign(p,{year:['阶段一','阶段二','阶段三','阶段四'][i],title:['问题提出','方法设计','实验验证','总结展望'][i],text:'填写本阶段的关键事件、主要证据与阶段结论。',asset:null,showCaption:false}));
timeline.modules=[timelineModule];

const formula=chapter({id:'blank-formula-page',section:'04',group:'公式与符号',title:'公式与符号说明',lead:'双击公式修改 LaTeX；公式名称、解释文字和符号说明均可继续编辑。'});
const formulaModule=moduleOf('formula',{x:58,y:256,w:950,h:554},2);
Object.assign(formulaModule,{id:'blank-formula-module',style:'band',columns:1,groupTitle:''});
formulaModule.parts=[
 {...part(),title:'目标函数',latex:String.raw`J(\theta)=\frac{1}{m}\sum_{i=1}^{m}\ell_i(\theta)`,text:'说明公式的用途、优化目标及适用条件。',useThemeColor:false},
 {...part(),title:'参数更新',latex:String.raw`\theta_{t+1}=\theta_t-\alpha\nabla J(\theta_t)`,text:'解释更新方向、步长和停止条件。',useThemeColor:false}
];
const symbols=moduleOf('table',{x:1032,y:256,w:510,h:554});
Object.assign(symbols,{id:'blank-symbol-table',headerRows:1,tableTitle:'符号说明',rows:[['符号','含义'],[String.raw`$m$`,'样本数量'],[String.raw`$\theta$`,'待优化参数'],[String.raw`$\alpha$`,'学习率'],[String.raw`$t$`,'迭代序号']]});
formula.modules=[formulaModule,symbols];

const profile=profilePage();
Object.assign(profile,{id:'blank-profile-page',section:'附录',group:'作者简介',chapterMode:'manual',source:'请以本人简历和可核实成果为准'});
profile.modules[0].id='blank-profile-history';
profile.modules[1].id='blank-profile-details';

const project={
 version:1,
 inlineMathMode:'source',
 title:'Web Slide 空白工作台模板',
 theme:{...defaultTheme,name:'学校／机构名称',logo:'',wordmark:''},
 grid:20,
 slides:[cover,toc,media,table,timeline,formula,profile]
};

syncSections(project);
project.slides[1].modules[0].id='blank-toc-module';
validateProject(project);
await writeDocument(project,path.join(root,'reference','blank-template.html'));
