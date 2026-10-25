// Excel-compatible tabular text. Quoting preserves tabs, newlines and empty cells.
export function tableToText(rows){
 return rows.map(row=>row.map(value=>{const text=String(value??'');return /[\t\r\n"]/.test(text)?'"'+text.replace(/"/g,'""')+'"':text;}).join('\t')).join('\n');
}
export function parseTableText(value){
 const text=String(value??'').replace(/^\uFEFF/,'');if(!text.length)throw Error('表格不能为空，请至少填写一个单元格。');
 const rows=[],row=[];let cell='',quoted=false,start=true;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(quoted){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else quoted=false;}else cell+=ch;continue;}
  if(ch==='"'&&start){quoted=true;start=false;continue;}
  if(ch==='\t'){row.push(cell);cell='';start=true;continue;}
  if(ch==='\r'||ch==='\n'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row.splice(0));cell='';start=true;continue;}
  cell+=ch;start=false;
 }
 if(quoted)throw Error('单元格的双引号尚未闭合，请补齐后重试。');
 if(cell!==''||row.length||!/[\r\n]$/.test(text)){row.push(cell);rows.push(row);}
 const width=Math.max(...rows.map(r=>r.length));
 if(rows.length>100||width>30)throw Error('单模块最多100行、30列，更多数据请拆页。');
 return rows.map(r=>[...r,...Array(width-r.length).fill('')]);
}
export function replaceTableText(owner,text,{maxColumns=30}={}){
 const rows=parseTableText(text),width=rows[0].length;if(width>maxColumns)throw Error(`当前表格最多${maxColumns}列，请拆分为多个分组。`);
 const old=owner.rows;owner.rows=rows;if(Math.max(...old.map(r=>r.length))!==width)delete owner.columnWidths;
 owner.merges=(owner.merges||[]).filter(a=>a.top<rows.length&&a.left<width).map(a=>({...a,bottom:Math.min(a.bottom,rows.length-1),right:Math.min(a.right,width-1)}));
 owner.headerRows=Math.min(owner.headerRows??1,rows.length);
 for(const key of ['cellRich','cellParagraphs','cellLineSpacing','cellFontSizes'])if(owner[key])for(const cell of Object.keys(owner[key])){
  const [r,c]=cell.split(',').map(Number);if(r>=rows.length||c>=width||(key==='cellRich'||key==='cellParagraphs')&&old[r]?.[c]!==rows[r][c])delete owner[key][cell];
 }
 return rows;
}
