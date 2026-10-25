const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const validColor=c=>/^#[\da-f]{6}$/i.test(c||'')||['theme','emphasis'].includes(c);
export function richHTML(text,runs,bullet=false,paragraphs=false,marker="•",paragraphFormats=[]){
 text=String(text??'');if(!Array.isArray(runs)||runs.map(r=>r.text).join('')!==text)runs=[{text}];
 const lines=[''];
 for(const r of runs){const css=[typeof r.bold==='boolean'?`font-weight:${r.bold?700:400}`:'',r.italic?'font-style:italic':'',[10,12,14,16].includes(r.fontSize)?`font-size:${r.fontSize/.6}px`:'',validColor(r.color)?`color:${r.color==='theme'?'var(--primary)':r.color==='emphasis'?'var(--emphasis)':r.color}`:''].filter(Boolean).join(';');
  const chunks=String(r.text).split('\n');chunks.forEach((chunk,i)=>{if(i)lines.push('');lines[lines.length-1]+=css?`<span class="rich-run" data-rich-run style="${css}">${esc(chunk)}</span>`:esc(chunk);});
 }
 return bullet||paragraphs?lines.map((line,i)=>{const p=paragraphFormats?.[i]||{},list=p.bullet??bullet,after=Number(p.after);return `<div data-paragraph data-bullet="${!!list}" data-marker="${esc(p.marker||marker)}"${Number.isFinite(after)?` style="margin-bottom:${Math.max(0,after)/.6}px"`:''}>${line||'<br>'}</div>`;}).join(''):lines.join('<br>');
}
export function textStyle(owner,key){const v=Number(owner.lineSpacing?.[key]),size=owner.fontSizes?.[key],css=[Number.isFinite(v)&&v>=.5&&v<=5?`line-height:${v}`:'',[10,12,14,16].includes(size)?`font-size:${size/.6}px`:''].filter(Boolean).join(';');return css?`style="${css}"`:'';}
export function readRich(el){
 const runs=[];function add(text,format){if(!text)return;const prev=runs.at(-1);if(prev&&prev.bold===format.bold&&prev.italic===format.italic&&prev.color===format.color&&prev.fontSize===format.fontSize)prev.text+=text;else runs.push({text,...format});}
 function visit(node,format={}){
  if(node.nodeType===3){add(node.nodeValue.replace(/\u00a0/g,' '),format);return;}if(node.nodeType!==1)return;
  if(node.tagName==='BR'){add('\n',format);return;}
  const next={...format};if(['VAR','I','EM'].includes(node.tagName)||node.style.fontStyle==='italic')next.italic=true;const weight=node.style.fontWeight,color=node.style.color||node.getAttribute('color');
  if(weight)next.bold=weight==='bold'||Number(weight)>=600;else if(['B','STRONG'].includes(node.tagName))next.bold=true;
  if(node.style.fontSize){const pt=parseFloat(node.style.fontSize)*.6;if([10,12,14,16].some(v=>Math.abs(v-pt)<.05))next.fontSize=Math.round(pt);}
  if(color){if(color.includes('--primary'))next.color='theme';else if(color.includes('--emphasis'))next.color='emphasis';else{const rgb=color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);next.color=rgb?'#'+rgb.slice(1).map(n=>Number(n).toString(16).padStart(2,'0')).join(''):color;}}
  const block=['DIV','P','LI'].includes(node.tagName)&&node!==el;if(block&&runs.length&&!runs.at(-1).text.endsWith('\n'))add('\n',format);
  for(const child of node.childNodes)visit(child,next);
  if(block&&node.nextSibling&&!runs.at(-1)?.text.endsWith('\n'))add('\n',format);
 }
 for(const node of el.childNodes)visit(node);
 const paragraphs=[...el.children].filter(n=>['DIV','P','LI'].includes(n.tagName)).map(n=>({bullet:n.dataset.bullet!==undefined?n.dataset.bullet==='true':el.classList.contains('bulleted'),marker:n.dataset.marker||el.dataset.marker||'•',...(n.style.marginBottom?{after:parseFloat(n.style.marginBottom)*.6}:{})}));
 return {text:runs.map(r=>r.text).join(''),runs,paragraphs};
}

export class TextFormatting{
 constructor({getTheme,commit,savePoint,toast,getBatchFields=()=>[]}){
  Object.assign(this,{getTheme,commit,savePoint,toast,getBatchFields});
  document.addEventListener('selectionchange',()=>this.remember());
  document.addEventListener('pointerdown',e=>{if(e.target.closest('#text-formatbar')){this.remember();this.toolbarActive=true;if(e.target.closest('#format-bold'))e.preventDefault();}else this.toolbarActive=false;},true);
  document.addEventListener('click',e=>{if(e.target.closest('#format-bold'))this.apply('bold');});
  document.addEventListener('change',e=>{
   if(e.target.id==='format-color'){const c=e.target.value;if(c==='custom')this.apply('color',document.querySelector('#format-custom-color').value);else this.apply('color',c);}
   if(e.target.id==='format-custom-color'){document.querySelector('#format-color').value='custom';this.apply('color',e.target.value);}
   if(e.target.id==='format-line-spacing')this.apply('line',e.target.value);
   if(e.target.id==='format-paragraph-after')this.apply('after',e.target.value);
   if(e.target.id==='format-font-size')this.apply('size',e.target.value);
   if(e.target.id==='format-list')this.apply('list',e.target.value);
  });
  document.addEventListener('paste',e=>{if(e.target.closest('[contenteditable=true]')){e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));}});
 }
 remember(){if(this.toolbarActive&&document.activeElement?.closest('#text-formatbar'))return;const selection=getSelection();if(!selection.rangeCount)return;const node=selection.anchorNode,el=(node?.nodeType===1?node:node?.parentElement)?.closest('[data-text][contenteditable]');if(!el||!el.closest('#canvas'))return;const range=selection.getRangeAt(0);if(!el.contains(range.endContainer))return;this.field=el;this.range=range.cloneRange();this.refresh();}
 selectedNodes(){
  const fields=this.getBatchFields();if(fields.length)return fields.flatMap(field=>{const nodes=[],walker=document.createTreeWalker(field,NodeFilter.SHOW_TEXT);while(walker.nextNode())if(walker.currentNode.length)nodes.push(walker.currentNode.parentElement);return nodes.length?nodes:[field];});
  const field=this.field,range=this.range;if(!field?.isConnected||!range)return [];
  if(range.collapsed){let node=range.startContainer;if(node.nodeType===1)node=node.childNodes[Math.min(range.startOffset,node.childNodes.length-1)]||node;return [node.nodeType===1?node:node.parentElement];}
  const walker=document.createTreeWalker(field,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode()){const node=walker.currentNode;if(!node.length||!range.intersectsNode(node))continue;const clipped=range.cloneRange(),nr=document.createRange();nr.selectNodeContents(node);if(clipped.compareBoundaryPoints(Range.START_TO_START,nr)<0)clipped.setStart(node,0);if(clipped.compareBoundaryPoints(Range.END_TO_END,nr)>0)clipped.setEnd(node,node.length);if(clipped.toString().length)nodes.push(node.parentElement);}
  return nodes.length?nodes:[field];
 }
 refresh(){
  const fields=this.getBatchFields();if(fields.length)this.field=fields.at(-1);
  if(!this.field?.isConnected)return;
  const nodes=this.selectedNodes(),unique=values=>[...new Set(values)],round=n=>Math.round(n*100)/100;
  const setSelect=(id,values,suffix='')=>{const select=document.getElementById(id);if(!select||document.activeElement===select)return;select.querySelectorAll('[data-current-format]').forEach(o=>o.remove());const value=values.length===1?String(values[0]):'__mixed__';if(![...select.options].some(o=>o.value===value)){const o=document.createElement('option');o.value=value;o.textContent=values.length===1?value+suffix:'混合';o.disabled=true;o.dataset.currentFormat='';select.append(o);}select.value=value;};
  const setNumber=(id,values)=>{const input=document.getElementById(id);if(!input||document.activeElement===input)return;input.value=values.length===1?String(values[0]):'';input.placeholder=values.length===1?'':'混合';};
  setSelect('format-font-size',unique(nodes.map(n=>round(parseFloat(getComputedStyle(n).fontSize)*.6))),' pt');
  const paragraphs=unique(nodes.map(n=>n.closest('[data-paragraph]')||n.closest('[data-text][contenteditable]')||this.field));
  setNumber('format-line-spacing',unique(paragraphs.map(n=>{const cs=getComputedStyle(n);return round(parseFloat(cs.lineHeight)/parseFloat(cs.fontSize)||1.55);})));
  setNumber('format-paragraph-after',unique(paragraphs.map(n=>round((parseFloat(getComputedStyle(n).marginBottom)||0)*.6))));
  setSelect('format-list',unique(paragraphs.map(n=>n.dataset.bullet==='true'?(n.dataset.marker||'•'):'')));
  const weights=unique(nodes.map(n=>Number(getComputedStyle(n).fontWeight)>=600));document.querySelector('#format-bold')?.setAttribute('aria-pressed',weights.length===1?String(weights[0]):'mixed');
  const colors=unique(nodes.map(n=>getComputedStyle(n).color)),theme=this.getTheme();
  const toHex=color=>{const rgb=color.match(/\d+/g);return rgb?'#'+rgb.slice(0,3).map(n=>Number(n).toString(16).padStart(2,'0')).join(''):color;};
  if(colors.length===1){const color=toHex(colors[0]);setSelect('format-color',[color.toLowerCase()===theme.primary.toLowerCase()?'theme':color.toLowerCase()===theme.emphasis.toLowerCase()?'emphasis':colors[0]===getComputedStyle(this.field).color?'original':'custom']);const input=document.querySelector('#format-custom-color');if(input&&document.activeElement!==input)input.value=color;}
  else setSelect('format-color',[]);
 }
 apply(kind,value){
  const fields=this.getBatchFields();if(fields.length){this.applyBatch(fields,kind,value);return;}
  if(!this.field?.isConnected||!this.range){this.toast('请先在画布中选中文字或点击需要调整的段落。',true);return;}
  const range=this.range.cloneRange();this.field.focus();const selected=getSelection();selected.removeAllRanges();selected.addRange(range);this.range=range;
  if(kind==='line'){
   const n=Number(value);if(!Number.isFinite(n)||n<.5||n>5){this.toast('行距请输入 0.5–5 之间的倍数，如 1.3 或 1.55。',true);return;}
   this.savePoint();this.field.style.lineHeight=String(n);this.commit(this.field,n);this.refresh();return;
  }
  if(kind==='list'||kind==='after'){
   if(kind==='after'){const n=Number(value);if(!Number.isFinite(n)||n<0||n>48){this.toast('段后距请输入 0–48 pt。',true);return;}}
   if(kind==='list'&&(this.field.dataset.field!=='text'||!this.field.closest('.text-module'))){this.toast('列表设置用于当前文字块的正文，请先点击正文。',true);return;}
   const blocks=[...this.field.children].filter(n=>['DIV','P','LI'].includes(n.tagName));
   if(!blocks.length){const content=readRich(this.field);this.field.innerHTML=richHTML(content.text,content.runs,false,true);this.range.selectNodeContents(this.field);}
   const targets=[...this.field.children].filter(n=>{if(!['DIV','P','LI'].includes(n.tagName))return false;if(this.range.collapsed)return n.contains(this.range.startContainer);if(!this.range.intersectsNode(n))return false;const r=this.range.cloneRange();r.selectNodeContents(n);return this.range.compareBoundaryPoints(Range.END_TO_START,r)<0&&this.range.compareBoundaryPoints(Range.START_TO_END,r)>0;});
   this.savePoint();for(const node of targets){if(kind==='list'){node.dataset.bullet=String(!!value);node.dataset.marker=value||'•';}else node.style.marginBottom=Number(value)/.6+'px';}
   this.commit(this.field);this.refresh();return;
  }
  if(kind==='size'){
   const pt=Number(value);if(![10,12,14,16].includes(pt))return;this.savePoint();
   if(this.range.collapsed){this.field.style.fontSize=pt/.6+'px';this.commit(this.field,null,null,{fontSize:pt});this.refresh();return;}
   document.execCommand('styleWithCSS',false,false);document.execCommand('fontSize',false,'7');const spans=[];for(const font of this.field.querySelectorAll('font[size="7"]')){const span=document.createElement('span');span.style.fontSize=pt/.6+'px';span.append(...font.childNodes);font.replaceWith(span);spans.push(span);}if(spans.length){const next=document.createRange();next.setStart(spans[0],0);next.setEnd(spans.at(-1),spans.at(-1).childNodes.length);selected.removeAllRanges();selected.addRange(next);}this.range=selected.rangeCount?selected.getRangeAt(0).cloneRange():this.range;this.commit(this.field);this.refresh();return;
  }
  this.savePoint();this.field.focus();const selection=getSelection();selection.removeAllRanges();selection.addRange(this.range);document.execCommand('styleWithCSS',false,true);
  if(kind==='bold')document.execCommand('bold');
  else{const theme=this.getTheme(),color=value==='theme'?theme.primary:value==='emphasis'?theme.emphasis:value==='original'?getComputedStyle(this.field).color:value;document.execCommand('foreColor',false,color);}
  this.range=selection.rangeCount?selection.getRangeAt(0).cloneRange():this.range;
  this.commit(this.field,null,kind==='color'?value:null);this.refresh();
 }
 applyBatch(fields,kind,value){
  if(kind==='size'&&![10,12,14,16].includes(Number(value)))return;
  if(kind==='line'&&(!Number.isFinite(Number(value))||Number(value)<.5||Number(value)>5)){this.toast('行距请输入0.5–5之间的倍数。',true);return;}
  if(kind==='after'&&(!Number.isFinite(Number(value))||Number(value)<0||Number(value)>48)){this.toast('段后距请输入0–48pt。',true);return;}
  if(kind==='list'&&fields.some(f=>f.dataset.field!=='text'||!f.closest('.text-module'))){this.toast('列表设置用于文字模块正文，请仅多选正文文字块。',true);return;}
  const makeBold=kind==='bold'?!this.selectedNodes().every(n=>Number(getComputedStyle(n).fontWeight)>=600):false;
  this.savePoint();
  for(const field of fields){
   if(kind==='size'){
    field.style.fontSize=Number(value)/.6+'px';for(const n of field.querySelectorAll('[style]'))n.style.fontSize='';
    this.commit(field,null,null,{fontSize:Number(value)});continue;
   }
   if(kind==='line'){field.style.lineHeight=String(Number(value));this.commit(field,Number(value));continue;}
   const data=readRich(field),runs=data.runs.map(r=>({...r}));let formats=data.paragraphs;
   if(kind==='bold')for(const r of runs)r.bold=makeBold;
   if(kind==='color')for(const r of runs){if(value==='original')delete r.color;else r.color=value;}
   if(kind==='after'||kind==='list'){
    formats=Array.from({length:data.text.split('\n').length},(_,i)=>({...formats[i],bullet:formats[i]?.bullet??field.classList.contains('bulleted'),marker:formats[i]?.marker||field.dataset.marker||'•',...(kind==='after'?{after:Number(value)}:{bullet:!!value,marker:value||'•'})}));
   }
   field.innerHTML=richHTML(data.text,runs,false,formats.length>0,field.dataset.marker||'•',formats);
   this.commit(field,null,kind==='color'?value:null);
  }
  this.refresh();
 }
}
