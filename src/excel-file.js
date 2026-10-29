import JSZip from 'jszip';

const REL_NS='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const nodes=(root,name)=>[...root.getElementsByTagNameNS('*',name)];
const first=(root,name)=>root.getElementsByTagNameNS('*',name)[0];
const columnIndex=address=>{const letters=(address.match(/^[A-Z]+/i)||['A'])[0].toUpperCase();let value=0;for(const letter of letters)value=value*26+letter.charCodeAt(0)-64;return value-1;};
const cellRange=ref=>{const [start,end=start]=ref.split(':'),decode=address=>{const match=address.match(/^([A-Z]+)(\d+)$/i);return {row:Number(match[2])-1,column:columnIndex(match[1])};},a=decode(start),b=decode(end);return {top:a.row,left:a.column,bottom:b.row,right:b.column};};
const xml=text=>{const document=new DOMParser().parseFromString(text,'application/xml'),failure=document.querySelector('parsererror');if(failure)throw Error('工作簿 XML 损坏或无法解析。');return document;};
const sheetPath=target=>{let value=target.replace(/^\/+/, '');if(value.startsWith('xl/'))return value;value=value.replace(/^(\.\.\/)+/,'');return 'xl/'+value;};

export async function parseExcelBuffer(buffer,{maxRows=100,maxColumns=30}={}){
 const zip=await JSZip.loadAsync(buffer),read=async name=>{const entry=zip.file(name);if(!entry)throw Error(`工作簿缺少 ${name}。`);return await entry.async('string');};
 const workbook=xml(await read('xl/workbook.xml')),relationships=xml(await read('xl/_rels/workbook.xml.rels'));
 const paths=new Map(nodes(relationships,'Relationship').map(node=>[node.getAttribute('Id'),sheetPath(node.getAttribute('Target')||'')]));
 const sharedEntry=zip.file('xl/sharedStrings.xml'),shared=sharedEntry?nodes(xml(await sharedEntry.async('string')),'si').map(item=>nodes(item,'t').map(node=>node.textContent||'').join('')):[];
 const sheets=[];
 for(const sheet of nodes(workbook,'sheet')){
  const name=sheet.getAttribute('name')||`工作表 ${sheets.length+1}`,id=sheet.getAttributeNS(REL_NS,'id')||sheet.getAttribute('r:id'),path=paths.get(id);if(!path)continue;
  const document=xml(await read(path)),cells=nodes(document,'c');if(!cells.length)continue;
  let rowCount=0,columnCount=0;const values=new Map();
  for(const cell of cells){const address=cell.getAttribute('r')||'A1',row=Math.max(0,Number((address.match(/\d+$/)||['1'])[0])-1),column=columnIndex(address),type=cell.getAttribute('t'),valueNode=first(cell,'v'),inline=first(cell,'is');let value='';
   if(type==='s')value=shared[Number(valueNode?.textContent||0)]??'';
   else if(type==='inlineStr'||inline)value=nodes(inline||cell,'t').map(node=>node.textContent||'').join('');
   else if(type==='b')value=valueNode?.textContent==='1'?'TRUE':'FALSE';
   else value=valueNode?.textContent??'';
   values.set(`${row},${column}`,value);rowCount=Math.max(rowCount,row+1);columnCount=Math.max(columnCount,column+1);
  }
  if(rowCount>maxRows||columnCount>maxColumns)throw Error(`工作表“${name}”超过 ${maxRows} 行或 ${maxColumns} 列，请先拆分。`);
  const rows=Array.from({length:rowCount},(_,row)=>Array.from({length:columnCount},(_,column)=>values.get(`${row},${column}`)??''));
  const merges=nodes(document,'mergeCell').map(node=>cellRange(node.getAttribute('ref')));
  sheets.push({name,rows,merges});
 }
 if(!sheets.length)throw Error('文件中没有可导入的非空工作表。');
 return sheets;
}
