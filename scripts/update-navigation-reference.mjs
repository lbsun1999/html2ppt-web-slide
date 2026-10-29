import fs from 'node:fs/promises';
import {validateProject,moduleOf,blankSlide} from '../src/model.js';
import {writeDocument} from './build-document.mjs';

const target='reference/navigation.html';
const html=await fs.readFile(target,'utf8');
const match=html.match(/<script\b(?=[^>]*\bid=["']project-data["'])[^>]*>([\s\S]*?)<\/script>/i);
if(!match)throw Error('navigation.html 缺少 project-data。');
const project=validateProject(JSON.parse(match[1]));
const slideId='reference-advanced-alignment';
project.slides=project.slides.filter(s=>s.id!==slideId);

const slide=blankSlide();
Object.assign(slide,{id:slideId,kind:'body',section:'附录',group:'操作练习',title:'高级对齐与分布练习',lead:'先选择上方操作模式，再直接点击图形按钮；参考线可在画布中拖动，多选模式下点击板块即可增减选择。',footer:'Web Slide · 交互功能示例',source:'练习页保留有意设置的错位与不同尺寸，请使用高级对齐功能调整。',notes:'切换“编辑模块”，选择任一板块并打开“高级对齐与分布”。尝试参考线平移、边缘拉伸、多选等距和环形分布；操作前可复制本页保留原始练习。',summary:'练习目标：用更少的按钮完成边缘对齐、等距分布和环形组合，并观察多子区域参与计算时的变化。'});
const specs=[
 {id:'align-practice-a',x:78,y:320,w:440,h:330,count:2,title:'双子区域',text:'观察两个子区域如何参与间距计算。'},
 {id:'align-practice-b',x:590,y:278,w:240,h:300,count:1,title:'研究条件',text:'拖动参考线，尝试贴边或居中。'},
 {id:'align-practice-c',x:930,y:370,w:260,h:250,count:1,title:'证据说明',text:'固定一侧边缘，再调整尺寸。'},
 {id:'align-practice-d',x:1290,y:300,w:220,h:330,count:1,title:'结论模块',text:'多选板块，比较横向与纵向等距。'}
];
slide.modules=specs.map(spec=>{const m=moduleOf('text',{x:spec.x,y:spec.y,w:spec.w,h:spec.h},spec.count);m.id=spec.id;m.style='cards';m.columns=spec.count;for(let i=0;i<m.parts.length;i++){m.parts[i].title=spec.count>1?`${spec.title} ${i+1}`:spec.title;m.parts[i].text=spec.text;m.parts[i].bullet=false;}return m;});
const closingIndex=project.slides.findIndex(s=>s.kind==='closing');
project.slides.splice(closingIndex<0?project.slides.length:closingIndex,0,slide);
project.title='功能导航与交互练习';
await writeDocument(validateProject(project),target);
console.log(`navigation reference: ${project.slides.length} pages`);
