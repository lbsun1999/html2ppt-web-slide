import {clone} from './model.js';
import {duplicatePages,movePages,validateClipboard} from './page-operations.js';

export class SidebarPages{
 constructor({getProject,getIndex,activate,savePoint,render,persist,toast,confirmDelete}){
  Object.assign(this,{getProject,getIndex,activate,savePoint,render,persist,toast,confirmDelete});
  this.ids=new Set();this.anchor=null;this.clipboard=null;
  const sidebar=document.querySelector('.sidebar');
  sidebar.addEventListener('keydown',e=>this.key(e));
  sidebar.addEventListener('dragstart',e=>this.dragStart(e));
  sidebar.addEventListener('dragover',e=>this.dragOver(e));
  sidebar.addEventListener('drop',e=>this.drop(e));
  sidebar.addEventListener('dragend',()=>this.clearDrag());
 }
 sync(){
  const p=this.getProject();this.ids=new Set([...this.ids].filter(id=>p.slides.some(s=>s.id===id)));
  if(!this.ids.size)this.ids.add(p.slides[this.getIndex()].id);
  for(const b of document.querySelectorAll('.slide-thumb')){
   const selected=this.ids.has(p.slides[Number(b.dataset.page)]?.id);b.classList.toggle('is-selected',selected);b.setAttribute('aria-pressed',String(selected));b.draggable=true;
  }
  document.querySelector('#page-selection-info').textContent=`已选 ${this.ids.size} 页 · Ctrl 多选，Shift 连选；拖动缩略图排序`;
  document.querySelector('[data-action="delete-slide"]').textContent=this.ids.size>1?`删除所选 ${this.ids.size} 页`:'删除当前页';
 }
 reset(){this.ids=new Set([this.getProject().slides[this.getIndex()].id]);this.anchor=this.getIndex();this.sync();}
 click(e,n){
  const p=this.getProject();
  if(e.shiftKey){const anchor=Math.min(this.anchor??this.getIndex(),p.slides.length-1);if(!e.ctrlKey&&!e.metaKey)this.ids.clear();for(let i=Math.min(anchor,n);i<=Math.max(anchor,n);i++)this.ids.add(p.slides[i].id);}
  else if(e.ctrlKey||e.metaKey){const id=p.slides[n].id;if(this.ids.has(id)&&this.ids.size>1)this.ids.delete(id);else this.ids.add(id);this.anchor=n;}
  else{this.ids=new Set([p.slides[n].id]);this.anchor=n;}
  this.activate(n);this.sync();document.querySelector(`.slide-thumb[data-page="${n}"]`)?.focus({preventScroll:true});
 }
 async copy(){
  this.sync();const slides=this.getProject().slides.filter(s=>this.ids.has(s.id));this.clipboard=clone(slides);
  try{await navigator.clipboard.writeText(JSON.stringify({format:'web-slide-pages-v1',slides}));}catch{}
  this.toast(`已复制 ${slides.length} 页，点击粘贴将插入当前页之后。`);
 }
 async paste(){
  let pages=this.clipboard;
  if(!pages)try{const text=await navigator.clipboard.readText();if(text)pages=validateClipboard(text,this.getProject());}catch{}
  if(!pages?.length){this.toast('请先复制页面；离线环境可使用同一窗口内的复制、粘贴按钮。',true);return;}
  const p=this.getProject();if(p.slides.length+pages.length>100){this.toast('每份文稿最多100页，请减少粘贴页数。',true);return;}
  const copies=duplicatePages(pages),at=this.getIndex()+1;this.savePoint();p.slides.splice(at,0,...copies);this.ids=new Set(copies.map(s=>s.id));this.anchor=at;this.activate(at);this.render();this.persist();this.toast(`已插入 ${copies.length} 页；备注、媒体与格式均已保留。`);
 }
 requestDelete(){this.sync();if(this.ids.size>=this.getProject().slides.length){this.toast('至少保留一页，请取消选择一页后再删除。',true);return;}this.confirmDelete(this.ids.size);}
 delete(){
  const p=this.getProject(),at=this.getIndex(),count=this.ids.size;
  if(count>=p.slides.length)return;
  this.savePoint();p.slides=p.slides.filter(s=>!this.ids.has(s.id));this.ids.clear();this.activate(Math.min(at,p.slides.length-1));this.reset();this.render();this.persist();
 }
 move(before){
  const p=this.getProject(),current=p.slides[this.getIndex()].id,active=this.ids.has(current)?current:p.slides.find(s=>this.ids.has(s.id)).id,next=movePages(p.slides,this.ids,before);
  if(next.every((s,i)=>s.id===p.slides[i].id))return;
  this.savePoint();p.slides=next;this.activate(p.slides.findIndex(s=>s.id===active));this.render();this.persist();
 }
 step(direction){this.sync();const indices=this.getProject().slides.flatMap((s,i)=>this.ids.has(s.id)?[i]:[]);this.move(direction<0?Math.max(0,Math.min(...indices)-1):Math.min(this.getProject().slides.length,Math.max(...indices)+2));}
 key(e){
  if(e.target.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||document.querySelector('dialog[open]')||document.body.classList.contains('presenting'))return;
  const mod=e.ctrlKey||e.metaKey,key=e.key.toLowerCase();
  if(mod&&['c','v','a'].includes(key)){e.preventDefault();e.stopPropagation();if(key==='c')this.copy();if(key==='v')this.paste();if(key==='a'){this.ids=new Set(this.getProject().slides.map(s=>s.id));this.sync();}}
  else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();e.stopPropagation();this.requestDelete();}
 }
 dragStart(e){
  const b=e.target.closest('.slide-thumb');if(!b)return;
  const n=Number(b.dataset.page),s=this.getProject().slides[n];if(!this.ids.has(s.id)){this.ids=new Set([s.id]);this.anchor=n;this.sync();}
  this.dragIds=new Set(this.ids);e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('application/x-web-slide-pages',JSON.stringify([...this.dragIds]));
  for(const b of document.querySelectorAll('.slide-thumb.is-selected'))b.classList.add('dragging');
 }
 dragOver(e){
  if(!this.dragIds)return;const b=e.target.closest('.slide-thumb');if(!b)return;
  e.preventDefault();e.dataTransfer.dropEffect='move';this.clearMarkers();const r=b.getBoundingClientRect(),after=e.clientY>r.top+r.height/2;this.dropBefore=Number(b.dataset.page)+(after?1:0);b.classList.add(after?'drop-after':'drop-before');
  const list=document.querySelector('#slides'),bounds=list.getBoundingClientRect();if(e.clientY<bounds.top+40)list.scrollTop-=18;else if(e.clientY>bounds.bottom-40)list.scrollTop+=18;
 }
 drop(e){if(!this.dragIds)return;e.preventDefault();e.stopPropagation();if(this.dropBefore!==undefined){this.ids=this.dragIds;this.move(this.dropBefore);}this.clearDrag();}
 clearMarkers(){document.querySelectorAll('.drop-before,.drop-after').forEach(b=>b.classList.remove('drop-before','drop-after'));}
 clearDrag(){this.clearMarkers();document.querySelectorAll('.dragging').forEach(b=>b.classList.remove('dragging'));this.dragIds=null;this.dropBefore=undefined;}
}
