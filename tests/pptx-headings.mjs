import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createProject,blankSlide} from '../src/model.js';

// Validate the exported OOXML, rather than just checking browser CSS.
await fs.mkdir('ect',{recursive:true});
for(const primary of ['#005894','#812C3C']){
 const p=createProject({withSections:false});p.theme.primary=primary;
 p.slides=['研究背景','研究\n方法','研究现状与关键问题分析'.repeat(20)].map(group=>({...blankSlide(),group,title:'研究背景与问题定义',lead:''}));
 const res=await fetch('http://127.0.0.1:4317/api/export/pptx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
 assert.equal(res.status,200,res.status===200?undefined:await res.text());
 const file=`ect/headings-${primary.slice(1)}.pptx`;await fs.writeFile(file,Buffer.from(await res.arrayBuffer()));
 const result=execFileSync('python',['tests/inspect-headings.py',file,primary.slice(1)],{encoding:'utf8'});process.stdout.write(result);
}
