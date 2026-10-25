import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tableToText,parseTableText,replaceTableText} from '../src/table-text.js';
test('tabular text roundtrip preserves blank cells, quoted newlines, tabs and quotes',()=>{
 const rows=[['','单位',''],['A\tB','第一行\n第二行','带"引号'],['  前后空格  ','','']];
 assert.deepEqual(parseTableText(tableToText(rows)),rows);assert.deepEqual(parseTableText('A\t\r\n1\t2\r\n'),[['A',''],['1','2']]);
 assert.throws(()=>parseTableText('"未闭合'),/闭合/);assert.throws(()=>parseTableText(''),/不能为空/);
});
test('bulk edits retain valid merged headers and untouched formatting; resized coordinates are removed',()=>{
 const p={rows:[['场景',''],['方法','1']],headerRows:1,merges:[{top:0,left:0,bottom:0,right:1}],cellRich:{'0,0':[{text:'场景',bold:true}],'1,1':[{text:'1',bold:true}],'4,4':[]},cellParagraphs:{'1,1':[{align:'right'}]},cellFontSizes:{'1,1':12,'4,4':14}};
 replaceTableText(p,'场景\t\n方法\t2\n新增\t3');assert.equal(p.rows.length,3);assert.equal(p.merges.length,1);assert.ok(p.cellRich['0,0']);assert.equal(p.cellRich['1,1'],undefined);assert.equal(p.cellParagraphs['1,1'],undefined);assert.equal(p.cellFontSizes['1,1'],12);assert.equal(p.cellFontSizes['4,4'],undefined);
});
