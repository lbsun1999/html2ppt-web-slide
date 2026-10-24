import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createProject,makePage} from '../src/model.js';
const p=createProject();p.slides=['研究背景','研究现状与关键科学问题分析','方法设计与实现\n实验验证与结果分析'].map(title=>({...makePage('transition'),title,lead:'章节标题只按手动语义分行。'}));
await fs.mkdir('ect',{recursive:true});await fs.writeFile('ect/transitions-project.json',JSON.stringify(p));
const response=await fetch('http://127.0.0.1:4317/api/export/pptx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});assert.equal(response.status,200,response.status===200?'':await response.text());await fs.writeFile('ect/transitions-nowrap.pptx',Buffer.from(await response.arrayBuffer()));execFileSync('python',['-X','utf8','tests/inspect-transitions.py','ect/transitions-nowrap.pptx','ect/transitions-project.json'],{stdio:'inherit'});
p.slides=[{...makePage('transition'),title:'研究现状与方法设计'.repeat(15),lead:''}];const bad=await fetch('http://127.0.0.1:4317/api/export/pptx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});assert.equal(bad.status,400);assert.match(await bad.text(),/不允许自动换行/);console.log('PASS overwide title requires semantic manual line breaks instead of automatic wrapping');
