import {part} from './model.js';
import {richHTML,textStyle} from './rich-text.js';
export const tableParts=m=>m.sectionedTable?m.parts:[m];
export const tableOwner=(m,index=0)=>m.sectionedTable?m.parts[index]:m;
export function tablePart(title='新分组',rows=[['主题一','主题二'],['说明内容','说明内容']]){return {...part(),title,text:'',rows,headerRows:1,cellPaddingPt:3,fontPt:12,borderless:true};}
export function renderTables(m,{esc,editable,edit}){
 const field=(owner,key)=>richHTML(owner[key]||'',owner.rich?.[key],false,!!owner.paragraphs?.[key],undefined,owner.paragraphs?.[key]);
 const render=(p,index)=>{
  const rows=p.rows||[],skip=new Set(),merges=p.merges||[],history=m.profileHistory&&!m.sectionedTable;
  for(const a of merges)for(let r=a.top;r<=a.bottom;r++)for(let c=a.left;c<=a.right;c++)if(r!==a.top||c!==a.left)skip.add(`${r},${c}`);
  const title=m.showTitle!==false&&p.showTitle!==false?(m.sectionedTable?p.title:m.tableTitle):'',headers=p.headerRows??1,padding=p.cellPaddingPt??m.cellPaddingPt;
  const titleAttrs=m.sectionedTable?`data-part="${index}" data-field="title"`:'data-module-field="tableTitle"';
  const heading=title?`<h3 class="table-title" data-text data-shape ${titleAttrs} ${editable(edit,'')}>${field(p,m.sectionedTable?'title':'tableTitle')}</h3>`:'';
  const colgroup=m.referenceStyle?'<colgroup><col style="width:45px"><col></colgroup>':history?`<colgroup>${rows[0].map((_,i)=>`${i?'<col class="history-spacer">':''}<col>`).join('')}</colgroup>`:m.columnWidths?`<colgroup>${m.columnWidths.map(w=>`<col style="width:${w}%">`).join('')}</colgroup>`:'';
  const body=rows.map((row,r)=>`<tr${Number(p.rowHeightPt||m.rowHeightPt)>0?` style="height:${(p.rowHeightPt||m.rowHeightPt)/.6}px"`:''}>${row.map((value,c)=>{
   if(skip.has(`${r},${c}`))return '';
   const merge=merges.find(a=>a.top===r&&a.left===c),tag=!m.referenceStyle&&(r<headers||(m.rowHeaders&&c===0))?'th':'td',key=r+','+c;
   return `${history&&c?'<td class="history-spacer" aria-hidden="true"></td>':''}<${tag} ${tag==='th'?`scope="${r<headers?'col':'row'}"`:''} data-shape ${merge?`rowspan="${merge.bottom-r+1}" colspan="${merge.right-c+1}"`:''}><div data-text data-row="${r}" data-col="${c}" ${m.sectionedTable?`data-table-part="${index}"`:''} ${textStyle({lineSpacing:{cell:p.cellLineSpacing?.[key]},fontSizes:{cell:p.cellFontSizes?.[key]}},'cell')} ${editable(edit,'')}>${richHTML(value,p.cellRich?.[key],false,!!p.cellParagraphs?.[key],undefined,p.cellParagraphs?.[key])}</div></${tag}>`;
  }).join('')}</tr>`).join('');
  const note=p.tableNote?`<div class="table-note" data-text ${m.sectionedTable?`data-part="${index}" data-field="tableNote"`:'data-module-field="tableNote"'} ${editable(edit,'')}>${field(p,'tableNote')}</div>`:'';
  return `<section data-shape class="table-section ${m.sectionedTable||m.frame?'framed-table':''} ${m.bandTitle||m.sectionedTable?'band-title':''} ${m.titleLevel==='group'?'group-table-title':''}">${heading}<table data-cell-padding="${Number.isFinite(padding)?padding/.6:''}" ${p.fontPt||m.fontPt?`data-base-font="${p.fontPt||m.fontPt}"`:''} ${p.fixedFont||m.fixedFont?'data-fixed-font':''} style="--table-heading-size:${((p.fontPt||m.fontPt||12)+2)/.6}px" class="data-table ${m.scenarioGroups?'scenario-table':''} ${m.referenceStyle?'reference-table':''} ${history?'profile-history logical-history':''} ${p.borderless||m.borderless||m.sectionedTable?'borderless':''}">${colgroup}<tbody>${body}</tbody></table>${note}</section>`;
 };
 return `<div class="table-wrap ${m.sectionedTable?'sectioned-tables':''}">${tableParts(m).map(render).join('')}</div>`;
}

export function resizeTable(p,axis,delta){
 const rows=p.rows,cols=Math.max(...rows.map(r=>r.length));
 if(axis==='row'){if(delta<0&&rows.length<=1)return false;if(delta>0&&rows.length>=100)return false;if(delta>0)rows.push(Array(cols).fill(''));else rows.pop();}
 else{if(delta<0&&cols<=1)return false;if(delta>0&&cols>=12)return false;for(const row of rows){while(row.length<cols)row.push('');if(delta>0)row.push('');else row.pop();}}
 p.merges=(p.merges||[]).filter(a=>a.top<rows.length&&a.left<rows[0].length).map(a=>({...a,bottom:Math.min(a.bottom,rows.length-1),right:Math.min(a.right,rows[0].length-1)}));p.headerRows=Math.min(p.headerRows??1,rows.length);
 for(const key of ['cellRich','cellParagraphs','cellLineSpacing','cellFontSizes'])if(p[key])for(const cell of Object.keys(p[key])){const [r,c]=cell.split(',').map(Number);if(r>=rows.length||c>=rows[0].length)delete p[key][cell];}
 return true;
}

export function tableControls(m,index,esc,spacing){
 const p=tableOwner(m,index),count=p.rows[0]?.length||1;
 return `${m.sectionedTable?sectionControls(m,index,esc):''}<h3>行与列</h3><p class="hint">当前 ${p.rows.length} 行 × ${count} 列${m.profileHistory?'，间隔列自动生成，不计入列数':''}。首行是字段标题，内容可逐格编辑。</p><div class="size-grid"><button data-table-size="row:1">＋ 行</button><button data-table-size="row:-1" ${p.rows.length<=1?'disabled':''}>－ 末行</button><button data-table-size="col:1">＋ 列</button><button data-table-size="col:-1" ${count<=1?'disabled':''}>－ 末列</button></div><label>????<select id="table-font-size">${[10,12,14,16].map(n=>`<option value="${n}" ${(p.fontPt||m.fontPt||14)===n?'selected':''}>${n} pt</option>`).join('')}</select></label>${spacing(p)}${!m.sectionedTable?`<label><input id="band-title" type="checkbox" ${m.bandTitle?'checked':''}> 深底分组标题</label><label><input id="borderless-table" type="checkbox" ${m.borderless?'checked':''}> 无框线，首行主题色加粗</label><label><input id="history-table" type="checkbox" ${m.profileHistory?'checked':''}> 履历表，表头下分段横线</label>`:''}<h3>表格内容</h3><label>表格注释（可选）<textarea id="table-note" rows="2">${esc(p.tableNote||'')}</textarea></label><button data-action="excel">替换 Excel / CSV</button><button data-action="paste-table">粘贴替换当前表格</button><label>表头行数<input id="header-rows" type="number" min="0" max="${p.rows.length}" value="${p.headerRows??1}"></label><p class="hint">无框线表格左对齐，首行主题色加粗；履历正文居中。增减行列和分组后保持原有内容，仍需检查真实溢出。</p>`;
}

function sectionControls(m,index,esc){return '<h3>无框线表格子区域</h3><p class="hint">点击分组名查看对应行列设置。箭头排序时，该组标题、内容和格式一起移动。</p><div class="timeline-stage-controls">'+m.parts.map((p,i)=>'<div class="field-line"><button class="stage-label table-part-name" data-table-select="'+i+'" aria-pressed="'+(i===index)+'" title="'+esc(p.title)+'">'+esc(p.title)+'</button><button data-table-part-move="-1" data-table-from="'+i+'" '+(i===0?'disabled':'')+' title="分组上移" aria-label="分组上移">↑</button><button data-table-part-move="1" data-table-from="'+i+'" '+(i===m.parts.length-1?'disabled':'')+' title="分组下移" aria-label="分组下移">↓</button><button data-table-remove="'+i+'" '+(m.parts.length<=1?'disabled':'')+'>删除</button></div>').join('')+'</div><button data-action="table-part-add" '+(m.parts.length>=8?'disabled':'')+'>＋ 分组</button>';}
