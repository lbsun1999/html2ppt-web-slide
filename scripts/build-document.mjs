import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {sharedCSS} from '../src/server/shared-css.mjs';
import {validateProject} from '../src/model.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');let runtime;
export async function writeDocument(project,filename,{exportFiles=false,exportDir='output'}={}){
 validateProject(project);if(!/\.html?$/i.test(filename))throw Error('输出路径需要以 .html 结尾。');
 if(!runtime)runtime=Promise.all([sharedCSS(root),build({absWorkingDir:root,entryPoints:['src/app.js'],bundle:true,write:false,format:'iife',target:'chrome110',charset:'utf8',loader:{'.png':'dataurl'}})]);
 const [css,bundle]=await runtime,code=bundle.outputFiles[0].text.replace(/[ \t]+$/gm,'').replace(/<\/script/gi,'<\\/script');
 const safeTitle=String(project.title).replace(/[<>&"]/g,'');const html=`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeTitle}</title><style id="app-style">${css}</style></head><body><div id="app"></div><script id="project-data" type="application/json">${JSON.stringify(project).replace(/</g,'\\u003c')}</script><script id="app-code">${code}</script></body></html>`;
 await fs.mkdir(path.dirname(path.resolve(filename)),{recursive:true});await fs.writeFile(filename,html);console.log('HTML: '+filename);
 if(exportFiles){const output=path.resolve(root,exportDir);await fs.mkdir(output,{recursive:true});for(const kind of ['pdf','pptx']){const res=await fetch('http://127.0.0.1:4317/api/export/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(project),signal:AbortSignal.timeout(240000)});if(!res.ok)throw Error(await res.text());const dest=path.join(output,path.basename(filename).replace(/\.html?$/i,'.'+kind));await fs.writeFile(dest,Buffer.from(await res.arrayBuffer()));console.log(kind.toUpperCase()+': '+dest);}}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [input,output]=process.argv.slice(2);if(!input||!output){console.error('用法: node scripts/build-document.mjs project.json document.html [--export]');process.exitCode=1;}else await writeDocument(JSON.parse(await fs.readFile(input,'utf8')),output,{exportFiles:process.argv.includes('--export')});
}
