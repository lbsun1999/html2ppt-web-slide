// Logical block selection is transient; it never becomes slide content or an export shape.
export class TextBlockSelection{
 constructor({getMode,getSlideId,onChange}){
  Object.assign(this,{getMode,getSlideId,onChange});this.keys=new Set();this.multi=false;
  document.addEventListener('pointerdown',e=>this.pointer(e),true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.multi&&!document.querySelector('dialog[open]')){e.preventDefault();this.clear();}},true);
 }
 key(el){const m=el.closest('[data-module]');return JSON.stringify([m?.dataset.module||'',...['part','field','tablePart','row','col','slideField','moduleField'].map(k=>el.dataset[k]??'')]);}
 fields(){if(this.getMode()!=='text'||this.slideId!==this.getSlideId())return [];return [...document.querySelectorAll('#canvas [data-text][contenteditable="true"]')].filter(el=>this.keys.has(this.key(el)));}
 batch(){return this.multi?this.fields():[];}
 pointer(e){
  if(e.button!==0||this.getMode()!=='text'||document.querySelector('dialog[open]'))return;
  const canvas=e.target.closest('#canvas');if(!canvas)return;
  const el=e.target.closest('[data-text][contenteditable="true"]');
  if(!el){if(!e.shiftKey)this.clear();return;}
  if(this.slideId!==this.getSlideId()){this.keys.clear();this.multi=false;}this.slideId=this.getSlideId();const key=this.key(el);
  if(e.shiftKey&&this.keys.size&&(this.multi||!this.keys.has(key))){
   e.preventDefault();e.stopPropagation();this.multi=true;if(this.keys.has(key))this.keys.delete(key);else this.keys.add(key);if(!this.keys.size)this.multi=false;
  }else{this.keys=new Set([key]);this.multi=false;}
  this.refresh();this.onChange();
 }
 refresh(){
  const fields=this.fields(),selected=new Set(fields);document.querySelectorAll('.text-block-selected').forEach(el=>el.classList.remove('text-block-selected'));
  if(this.multi)for(const el of selected)el.classList.add('text-block-selected');
  const label=document.querySelector('#format-selection-count');if(label){label.hidden=!this.multi;label.textContent=`已选 ${fields.length} 块`;label.title='Shift点击增减选中项；普通点击或Esc退出多选。';}
 }
 afterRender(){if(this.slideId!==this.getSlideId()||this.getMode()!=='text'){this.keys.clear();this.multi=false;}this.refresh();}
 clear(){this.keys.clear();this.multi=false;this.refresh();this.onChange();}
}
