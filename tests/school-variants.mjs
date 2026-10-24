import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createExample} from '../src/example.js';
import {schoolOptions} from '../src/server/schools.mjs';
import {validateProject} from '../src/model.js';
import {schoolAssetsFromProject} from '../src/school-variants.js';
const ustb=createExample(await schoolOptions('ustb')),options=await schoolOptions('lishui'),lsu=createExample(options);validateProject(ustb);validateProject(lsu);
assert.equal(ustb.slides.length,30);assert.equal(lsu.slides.length,30);assert.deepEqual(lsu.slides.map(s=>s.kind),ustb.slides.map(s=>s.kind));
const geometry=p=>p.slides.map(s=>({layout:s.referenceLayout,modules:s.modules.map(m=>({type:m.type,style:m.style,x:m.x,y:m.y,w:m.w,h:m.h,count:m.parts.length,columns:m.columns}))}));assert.deepEqual(geometry(lsu),geometry(ustb));
assert.equal(new Set(['primary','secondary','accent','emphasis'].map(key=>lsu.theme[key])).size,1);assert.equal(lsu.theme.logo,options.logo);assert.equal(lsu.theme.wordmark,options.wordmark);
const images=new Set(Object.values(options.assets).map(a=>a.src));for(const s of lsu.slides)for(const m of s.modules)for(const p of m.parts)if(p.asset)assert.ok(images.has(p.asset.src),'All Lishui media must use its own assets');
const history=lsu.slides.find(s=>s.modules.some(m=>m.type==='timeline'&&m.schoolHistory)),stages=history.modules[0].parts;assert.equal(stages.length,4);for(const p of stages)assert.ok(images.has(p.asset.src));assert.match(history.lead,/处州/);assert.doesNotMatch(JSON.stringify(history),/1952|六校矿冶|北京钢铁|雄安/);
const regenerated=createExample({school:'lishui',logo:lsu.theme.logo,wordmark:lsu.theme.wordmark,assets:schoolAssetsFromProject(lsu)});assert.equal(regenerated.slides.length,30);assert.deepEqual(regenerated.slides.find(s=>s.modules.some(m=>m.type==='timeline')).modules[0].parts.map(p=>p.asset.src),stages.map(p=>p.asset.src));
const list=JSON.parse(await fs.readFile('reference/snapshots.json','utf8'));assert.equal(list.length,5);for(const r of list){const data=await fs.readFile('reference/'+r.file);assert.equal(createHash('sha256').update(data).digest('hex'),r.sha256);await fs.access('reference/'+r.preview);}
const saved=[];for(const file of ['北京科技大学_WebSlide科研汇报示例.html','丽水学院_WebSlide制作与演示指南.html']){const html=await fs.readFile(file,'utf8');saved.push(JSON.parse(html.match(/<script id="project-data"[^>]*>([\s\S]*?)<\/script>/)[1]));}
assert.deepEqual(geometry(saved[0]),geometry(saved[1]),'Saved school variants must share the manually edited master geometry');
assert.deepEqual(saved[0].slides.map(s=>s.id),saved[1].slides.map(s=>s.id),'School conversion preserves stable page IDs');
console.log('PASS both 30-page schools share identical layout geometry; Lishui monochrome and school-only media; five approved references preserved');
