import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createProject} from '../src/model.js';
await fs.mkdir('ect',{recursive:true});
const p=createProject(),base='http://127.0.0.1:4317';
const toc=p.slides[1];for(const s of p.slides.filter(s=>s.kind==='transition'))toc.tocNotes[s.id]='章节说明：研究问题、方法依据与验证思路。';
p.slides[8].summary='本页结论：用图像证据解释结果，并说明方法的适用范围。';p.slides[8].footer='示例研究团队';p.slides[8].modules[0].h=470;
for(const kind of ['pdf','pptx']){const res=await fetch(base+'/api/export/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});assert.equal(res.status,200,res.status!==200?await res.text():undefined);await fs.writeFile('ect/navigation-example.'+kind,Buffer.from(await res.arrayBuffer()));console.log('PASS 10-page '+kind+' export with TOC, transitions and summary');}
