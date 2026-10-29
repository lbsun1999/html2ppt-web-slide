import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {parseTableText} from '../src/table-text.js';

const workbookPath=new URL('../tutorial-assets/table-import-demo.xlsx',import.meta.url);
const textPath=new URL('../tutorial-assets/table-replace-demo.txt',import.meta.url);

const bytes=await fs.readFile(workbookPath);
const response=await fetch('http://127.0.0.1:4317/api/excel',{
 method:'POST',
 headers:{'Content-Type':'application/json'},
 body:JSON.stringify({
  data:`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${bytes.toString('base64')}`
 })
});
const payload=await response.json();
assert.equal(response.ok,true,payload.error||'教学 Excel 导入接口失败');
assert.equal(payload.sheets.length,1);
assert.equal(payload.sheets[0].name,'实验结果');
assert.deepEqual(payload.sheets[0].rows[0],['方法','准确率 / % ↑','RMSE ↓','耗时 / ms ↓']);
assert.deepEqual(payload.sheets[0].rows.at(-1),['本文方法','91.2','0.164','35.7']);

const replacement=await fs.readFile(textPath,'utf8');
const rows=parseTableText(replacement.trimEnd());
assert.equal(rows.length,5);
assert.equal(rows[0].length,4);
assert.deepEqual(rows[0],['方法','准确率 / % ↑','RMSE ↓','耗时 / ms ↓']);
assert.deepEqual(rows.at(-1),['本文方法','91.2','0.164','35.7']);

console.log('tutorial table assets ok in local service and Tab/newline text; offline XLSX is covered by tutorial-dialog-flow');
