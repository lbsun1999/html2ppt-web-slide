import fs from 'node:fs/promises';
import {createExample} from '../src/example.js';
import {schoolOptions} from '../src/server/schools.mjs';
import {writeDocument} from './build-document.mjs';
import {validateProject,clone} from '../src/model.js';
import {applyLishuiVariant} from '../src/school-variants.js';
await fs.mkdir('ect',{recursive:true});
// The saved USTB HTML is the authoring source: never discard manual edits on rebuild.
let master;
try{
 const html=await fs.readFile('北京科技大学_WebSlide科研汇报示例.html','utf8');
 const match=html.match(/<script\b(?=[^>]*\bid=["']project-data["'])[^>]*>([\s\S]*?)<\/script>/i);
 if(!match)throw Error('北科HTML缺少project-data，已停止，避免覆盖人工成稿。');
 master=validateProject(JSON.parse(match[1]));
}catch(error){if(error.code!=='ENOENT')throw error;master=createExample(await schoolOptions('ustb'));}
for(const school of ['ustb','lishui']){
 const project=clone(master);if(school==='lishui')applyLishuiVariant(project,await schoolOptions('lishui'));
 project.title=school==='ustb'?'北京科技大学_WebSlide科研汇报示例':'丽水学院_WebSlide制作与演示指南';
 await fs.writeFile('ect/'+school+'-project.json',JSON.stringify(project));
 await writeDocument(project,project.title+'.html',{exportFiles:process.argv.includes('--export')});
 console.log(`${school}: ${project.slides.length} pages`);
}
