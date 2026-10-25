import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createProject,blankSlide,moduleOf} from '../src/model.js';
const p=createProject({withSections:false}),s=blankSlide();p.theme.primary='#005B94';s.title='原生对象导出检查';s.lead='检查A3深色标题底与页尾总结的原生文字。';
s.summary='统一实验条件、评价口径与验收标准，核对材料来源和适用范围，再据此形成清晰、可复查的研究结论。';
const m=moduleOf('text',{x:58,y:256,w:1484,h:350});m.style='band';m.parts[0].title='A3 标题深色底';m.parts[0].text='正文和标题分层显示，PPTX仍保留独立可编辑对象。';s.modules=[m];p.slides=[s];
await fs.mkdir('ect',{recursive:true});await fs.writeFile('ect/native-styles-project.json',JSON.stringify(p));
const response=await fetch('http://127.0.0.1:4317/api/export/pptx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});assert.equal(response.status,200,response.status===200?'':await response.text());await fs.writeFile('ect/native-styles.pptx',Buffer.from(await response.arrayBuffer()));execFileSync('python',['-X','utf8','tests/inspect-native-styles.py','ect/native-styles.pptx','ect/native-styles-project.json'],{stdio:'inherit'});
