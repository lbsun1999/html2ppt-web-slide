import layouts from './reference-layouts.json' with {type:'json'};
import {richHTML,textStyle} from './rich-text.js';
import {formulaHTML} from './formula.js';
import {applyTextPositions} from './free-text-position.js';
import {themedPortrait,themedMathImage} from './theme-assets.js';
import {addProfilePhone} from './profile-phone.js';
const cache=new Map();
export function applyReferenceLayout(slide,name){
 const source=layouts[name];Object.assign(slide,source.fields,{referenceLayout:name,modules:[]});
 return slide;
}
export function renderReferenceLayout(s,theme,index,total,edit,themeStyle,project){
 const source=layouts[s.referenceLayout],symbolColor=s.symbolUseThemeColor===false?'#000000':theme.primary;
 if(!cache.has(s.referenceLayout)){const t=document.createElement('template');t.innerHTML=source.html;cache.set(s.referenceLayout,t.content.firstElementChild);}
 const el=cache.get(s.referenceLayout).cloneNode(true);el.dataset.slide=s.id;el.setAttribute('style',themeStyle);
 if(s.referenceLayout==='profile')addProfilePhone(el);
 for(const table of el.querySelectorAll('table')){
  if(Number(s.referenceRowHeightPt)>0)for(const row of table.rows)row.style.height=Math.min(120,Number(s.referenceRowHeightPt))/.6+'px';
  if(Number.isFinite(s.referenceCellPaddingPt))for(const cell of table.querySelectorAll('th,td')){if(cell.classList.contains('profile-spacer'))continue;cell.style.paddingTop=cell.style.paddingBottom=Math.max(0,Math.min(18,s.referenceCellPaddingPt))/.6+'px';}
 }
 for(const p of el.querySelectorAll('p[data-slide-field]')){const div=document.createElement('div');for(const a of p.attributes)div.setAttribute(a.name,a.value);div.append(...p.childNodes);p.replaceWith(div);}
 for(const node of el.querySelectorAll('[data-slide-field]')){
  const key=node.dataset.slideField;
  if(s[key]!==undefined&&(s[key]!==source.fields[key]||s.rich?.[key]))node.innerHTML=richHTML(s[key],s.rich?.[key],false,!!s.paragraphs?.[key],undefined,s.paragraphs?.[key]);
  if(edit){node.contentEditable='true';node.spellcheck=false;}
  const style=textStyle(s,key).match(/style="([^"]*)"/)?.[1];if(style)node.style.cssText+=';'+style;
 }
 const logo=el.querySelector('.slide-logo');if(logo&&theme.logo)logo.src=theme.logo;
 if(s.referenceImages)el.querySelectorAll('.history-image').forEach((image,i)=>{if(s.referenceImages[i])image.src=s.referenceImages[i];});
 if(theme.monochrome){el.dataset.monochrome='';el.querySelectorAll('[style*="--stage-color"]').forEach(node=>node.style.setProperty('--stage-color',theme.primary));}
 if(s.referenceLayout==='history'&&s.source){const node=el.querySelector('.footer-source');if(node){node.dataset.text='';node.dataset.slideField='source';node.innerHTML=richHTML(s.source,s.rich?.source);if(edit)node.contentEditable='true';}}
 el.querySelectorAll('.math-expression[data-tex]').forEach((node,i)=>{node.dataset.referenceFormula=i;if(s.referenceLatex?.[i]){node.innerHTML=formulaHTML(s.referenceLatex[i]);node.dataset.raster='';}});
 const symbols=el.querySelector('dl.symbols');if(symbols){const table=document.createElement('table');table.className='symbols symbol-table';const body=document.createElement('tbody'),items=[...symbols.children];for(let i=0;i<items.length;i+=2){const tr=document.createElement('tr'),symbol=document.createElement('td'),description=document.createElement('td'),math=items[i].querySelector('[data-tex]');symbol.dataset.referenceSymbol=String(i/2);symbol.dataset.tex=s.referenceSymbolLatex?.[i/2]??math?.dataset.tex??'';symbol.title='双击用LaTeX编辑符号';symbol.setAttribute('aria-label','双击编辑符号LaTeX');if(s.referenceSymbolLatex?.[i/2]){symbol.innerHTML=formulaHTML(symbol.dataset.tex);symbol.dataset.raster='';}else symbol.append(...items[i].childNodes);for(const attribute of items[i+1].attributes)description.setAttribute(attribute.name,attribute.value);description.append(...items[i+1].childNodes);tr.append(symbol,description);body.append(tr);}table.append(body);symbols.replaceWith(table);}
 const symbolTable=el.querySelector('.symbol-table');if(symbolTable)symbolTable.style.setProperty('--symbol-color',symbolColor);
 for(const image of el.querySelectorAll('.formula-image'))image.src=themedMathImage(image.getAttribute('src'),image.closest('[data-reference-symbol]')?symbolColor:theme.ink);
 const portrait=el.querySelector('.profile-portrait');if(portrait){portrait.dataset.referencePortrait='';const image=portrait.matches('img')?portrait:portrait.querySelector('img');if(image)image.src=themedPortrait(s.referencePortrait||image.getAttribute('src'),theme);}
 el.querySelectorAll('.page-number').forEach(n=>n.textContent=String(index+1).padStart(2,'0'));
 el.querySelectorAll('.page-total').forEach(n=>n.textContent=total);
 const pagination=el.querySelector('.footer-pagination');if(pagination)pagination.dataset.text='';
 const sourceField=el.querySelector('[data-slide-field="source"]');if(sourceField&&s.sourceUrl&&/^(https?:\/\/|#slide-)/.test(s.sourceUrl)){const a=document.createElement('a');a.href=s.sourceUrl;a.append(...sourceField.childNodes);sourceField.append(a);}
 for(const anchor of el.querySelectorAll('a[href^="#p"]')){const target=project?.slides.find(slide=>slide.referenceLayout==='references');if(target)anchor.href='#slide-'+target.id;}
 applyTextPositions(el,s);return el.outerHTML;
}
