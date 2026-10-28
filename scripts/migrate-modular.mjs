import fs from 'node:fs';
import {summaryPage, profilePage} from '../src/page-presets.js';

const file = 'templates/template-1/ustb-blue/template.html';
let html = fs.readFileSync(file, 'utf8');

const match = html.match(/<script\b(?=[^>]*\bid=["']project-data["'])[^>]*>([\s\S]*?)<\/script>/i);
if (!match) {
  console.error('找不到 project-data');
  process.exit(1);
}

const data = JSON.parse(match[1]);
const slides = data.slides;

let changed = 0;

for (let i = 0; i < slides.length; i++) {
  const s = slides[i];
  if (s.title === '阶段总结与后续计划') {
    const tpl = summaryPage();
    s.modules = tpl.modules;
    delete s.referenceLayout;
    s.summary = '';
    changed++;
    console.log(`第 ${i+1} 页: 阶段总结 → 已模块化 (${s.modules.length} 个模块)`);
  }
  if (s.title === '作者简介') {
    const tpl = profilePage();
    s.modules = tpl.modules;
    delete s.referenceLayout;
    s.summary = '';
    changed++;
    console.log(`第 ${i+1} 页: 作者简介 → 已模块化 (${s.modules.length} 个模块)`);
  }
}

if (changed === 0) {
  console.log('没找到需要改的页');
  process.exit(0);
}

const newJson = JSON.stringify(data);
html = html.replace(match[1], newJson);
fs.writeFileSync(file, html, 'utf8');
console.log(`已更新 ${changed} 页，写入 ${file}`);
