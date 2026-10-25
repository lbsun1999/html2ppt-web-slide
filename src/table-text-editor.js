import {tableToText} from './table-text.js';
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
export function initTableTextEditor(textarea,rows){
 const shell=document.createElement('div');shell.className='table-text-editor';textarea.before(shell);
 const mirror=document.createElement('pre');mirror.className='table-text-mirror';mirror.setAttribute('aria-hidden','true');shell.append(mirror,textarea);
 const sync=()=>{mirror.innerHTML=esc(textarea.value).replace(/\t/g,'<mark class="table-tab">\t</mark>')+'\n';mirror.scrollTop=textarea.scrollTop;mirror.scrollLeft=textarea.scrollLeft;};
 textarea.value=tableToText(rows);textarea.wrap='off';
 textarea.addEventListener('input',sync);textarea.addEventListener('scroll',()=>{mirror.scrollTop=textarea.scrollTop;mirror.scrollLeft=textarea.scrollLeft;});
 textarea.addEventListener('keydown',e=>{if(e.key==='Tab'&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();if(!document.execCommand('insertText',false,'\t')){textarea.setRangeText('\t',textarea.selectionStart,textarea.selectionEnd,'end');textarea.dispatchEvent(new Event('input',{bubbles:true}));}}});
 sync();return {sync};
}
