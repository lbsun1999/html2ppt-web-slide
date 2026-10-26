import {formulaHTML} from './formula.js';
export function mathTokens(text){return [...String(text).matchAll(/\$([^$\n]+)\$/g)];}
export function replaceMath(text,index,latex){const token=mathTokens(text)[index];if(!token)throw Error('公式单元格已改变，请重新打开。');return text.slice(0,token.index)+'$'+latex+'$'+text.slice(token.index+token[0].length);}
export function replaceMathRuns(runs,index,latex){
 const token=mathTokens(runs.map(r=>r.text).join(''))[index];if(!token)return runs;
 const start=token.index,end=start+token[0].length,next=[];let offset=0,inserted=false;
 for(const run of runs){const lo=offset,hi=lo+run.text.length;if(lo<start)next.push({...run,text:run.text.slice(0,Math.min(run.text.length,start-lo))});if(!inserted&&lo<=start&&hi>start){next.push({...run,text:'$'+latex+'$'});inserted=true;}if(hi>end)next.push({...run,text:run.text.slice(Math.max(0,end-lo))});offset=hi;}
 return next.filter(r=>r.text);
}
export function tableMathHTML(html,{r,c,owner,module}){
 const template=document.createElement('template');template.innerHTML=html;
 const walker=document.createTreeWalker(template.content,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 let i=0;for(const node of nodes){const tokens=mathTokens(node.nodeValue);if(!tokens.length)continue;const fragment=document.createDocumentFragment();let start=0;for(const token of tokens){fragment.append(node.nodeValue.slice(start,token.index));const span=document.createElement('span');span.className='cell-math';span.dataset.cellFormula=i;span.dataset.latex=token[1];span.dataset.raster='';span.contentEditable='false';span.title='双击编辑 LaTeX 与颜色';const useTheme=owner.cellMathColors?.[r+','+c+','+i]??module.mathUseThemeColor??false;span.style.color=useTheme?'var(--primary)':'#000000';try{span.innerHTML=formulaHTML(token[1],false);}catch{span.classList.add('formula-error');span.textContent=token[0];}fragment.append(span);start=token.index+token[0].length;i++;}fragment.append(node.nodeValue.slice(start));node.replaceWith(fragment);}
 return template.innerHTML;
}
