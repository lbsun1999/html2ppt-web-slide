import fs from 'node:fs/promises';
import {createExample} from '../src/example.js';
import {schoolOptions} from '../src/server/schools.mjs';
import {writeDocument} from './build-document.mjs';
import {validateProject,clone} from '../src/model.js';
import {applyLishuiVariant} from '../src/school-variants.js';
import {svgDataURL} from '../src/svg.js';
await fs.mkdir('ect',{recursive:true});
const family='templates/template-1';
const blueFile=family+'/ustb-blue/template.html';
const redFile=family+'/ustb-red/template.html';
const lishuiFile=family+'/lishui-cyan/template.html';
// The saved USTB HTML is the authoring source: never discard manual edits on rebuild.
let master;
try{
 const html=await fs.readFile(blueFile,'utf8');
 const match=html.match(/<script\b(?=[^>]*\bid=["']project-data["'])[^>]*>([\s\S]*?)<\/script>/i);
 if(!match)throw Error('北科HTML缺少project-data，已停止，避免覆盖人工成稿。');
 master=validateProject(JSON.parse(match[1]));
}catch(error){if(error.code!=='ENOENT')throw error;master=createExample(await schoolOptions('ustb'));}
for(const school of (process.argv.includes('--lishui-only')?['lishui']:['ustb'])){
 const project=clone(master);if(school==='lishui')applyLishuiVariant(project,await schoolOptions('lishui'));
 if(school==='ustb')project.theme.presets={...(project.theme.presets||{}),ustbRed:{name:'北京科技大学 · 钢铁红',primary:'#A31418',secondary:'#851014',accent:'#C53A3F',emphasis:'#A31418',tint:'#FCF1EE',ink:'#000000',logo:svgDataURL(await fs.readFile(family+'/ustb-blue/assets/red-logo-solo.svg','utf8')),wordmark:svgDataURL(await fs.readFile(family+'/ustb-blue/assets/logo-full-steel-red.svg','utf8'))}};
 project.title=school==='ustb'?'北京科技大学_WebSlide科研汇报示例':'丽水学院_WebSlide制作与演示指南';
 await fs.writeFile('ect/'+school+'-project.json',JSON.stringify(project));
 const target=school==='lishui'?lishuiFile:blueFile;
 const exportDir=family+'/'+(school==='lishui'?'lishui-cyan':'ustb-blue')+'/output';
 await writeDocument(project,target,{exportFiles:process.argv.includes('--export'),exportDir});
 console.log(`${school}: ${project.slides.length} pages`);
}
// A user-authored color variant keeps its own content and palette on runtime updates.
if(!process.argv.includes('--lishui-only'))try{const html=await fs.readFile(redFile,'utf8'),match=html.match(/<script\b(?=[^>]*\bid=["']project-data["'])[^>]*>([\s\S]*?)<\/script>/i);if(!match)throw Error('红色文稿缺少project-data，已停止，避免覆盖人工成稿。');await writeDocument(validateProject(JSON.parse(match[1])),redFile,{exportFiles:process.argv.includes('--export'),exportDir:family+'/ustb-red/output'});}catch(error){if(error.code!=='ENOENT')throw error;}
