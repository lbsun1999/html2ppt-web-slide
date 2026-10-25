import {slideBounds,occupiedItems} from './model.js';
import {intersects} from './layout.js';

const locked='.slide-header,.slide-footer,.section-line,.slide-summary,.profile-identity,table,.cover-band,.cover-info,.transition-content';
export function freeField(el,s){
 const field=el?.closest('[data-text][data-slide-field]');
 return s.kind==='body'&&field&&!field.closest('[data-module],'+locked)?field:null;
}
export function applyTextPositions(root,s){
 for(const el of root.querySelectorAll('[data-slide-field]')){
  if(!freeField(el,s))continue;
  const p=s.textPositions?.[el.dataset.slideField];
  if(p)el.style.translate=`${p.dx}px ${p.dy}px`;
 }
}
export function positionedMarkup(markup,s){
 if(!s.textPositions)return markup;
 const t=document.createElement('template');t.innerHTML=markup;applyTextPositions(t.content,s);return t.innerHTML;
}
export function canvasRect(el,canvas){
 const base=canvas.getBoundingClientRect(),r=el.getBoundingClientRect(),scale=base.width/1600||1;
 return Object.fromEntries(Object.entries({x:(r.left-base.left)/scale,y:(r.top-base.top)/scale,w:r.width/scale,h:r.height/scale}).map(([k,v])=>[k,Math.round(v*100)/100]));
}
export function freeBounds(canvas,s){
 if(s.referenceLayout){const area=canvas.querySelector('.slide-content');if(area)return canvasRect(area,canvas);}
 const b=slideBounds(s);return {...b,y:192,h:b.y+b.h-192};
}
function obstacles(canvas,s,el,moduleId){
 const boxes=occupiedItems(s).filter(m=>m.id!==moduleId&&!m.freeText).map(m=>({...m}));
 for(const node of canvas.querySelectorAll('[data-text],table,[data-image],[data-raster],.math-expression,.math-symbol,.equation-number,.formula-card,.symbol-note')){
  if(node===el||node.contains(el)||el.contains(node)||node.closest('[data-module]')?.dataset.module===moduleId)continue;
  const r=canvasRect(node,canvas);if(r.w>0&&r.h>0)boxes.push(r);
 }
 return boxes;
}
export function positionError(canvas,s,el,rect,moduleId=null){
 if(['x','y','w','h'].some(k=>!Number.isFinite(rect[k]))||rect.w<=0||rect.h<=0)return '请先填写文字，再调整位置。';
 const b=moduleId?slideBounds(s):freeBounds(canvas,s);
 if(rect.x<b.x-.1||rect.y<b.y-.1||rect.x+rect.w>b.x+b.w+.1||rect.y+rect.h>b.y+b.h+.1)return '文字块只能放在正文安全区内。';
 if(obstacles(canvas,s,el,moduleId).some(r=>intersects(rect,r)))return '此位置会进入模块或遮挡其他内容，请换一个位置。';
 return '';
}
export function auditTextPositions(canvas,s){
 const errors=[],cards=new Set();
 for(const key of Object.keys(s.textPositions||{})){
  const el=[...canvas.querySelectorAll('[data-slide-field]')].find(n=>n.dataset.slideField===key&&freeField(n,s));
  if(!el){errors.push('此字段不支持正文文字平移：'+key);continue;}
  const error=positionError(canvas,s,el,canvasRect(el,canvas));if(error)errors.push(error);
  const card=el.closest('.formula-card');if(card)cards.add(card);
 }
 for(const card of cards)for(const math of card.querySelectorAll('.math-expression')){const error=positionError(canvas,s,math,canvasRect(math,canvas));if(error)errors.push(error);}
 return errors;
}

export class FreeTextPosition{
 constructor(options){
  Object.assign(this,options);this.target=null;this.step=1;
  document.addEventListener('change',e=>{
   if(!e.target.id.startsWith('free-text-'))return;
   e.stopImmediatePropagation();
   if(e.target.id==='free-text-step'){this.step=Number(e.target.value);return;}
   const current=this.current();if(!current)return;
   const r=canvasRect(current.el,this.getCanvas()),axis=e.target.id==='free-text-x'?'x':'y',value=Number(e.target.value);
   if(Number.isFinite(value))this.move({...r,[axis]:value});
  },true);
  document.addEventListener('click',e=>{
   const button=e.target.closest('[data-free-text-move],#free-text-reset');if(!button)return;
   const current=this.current();if(!current)return;
   const r=canvasRect(current.el,this.getCanvas());
   if(button.id==='free-text-reset'){
    const p=this.getSlide().textPositions?.[current.key];if(p)this.move({...r,x:r.x-p.dx,y:r.y-p.dy},true);return;
   }
   const d=this.step*(e.shiftKey?5:1),direction=button.dataset.freeTextMove;
   this.move({...r,x:r.x+(direction==='right'?d:direction==='left'?-d:0),y:r.y+(direction==='down'?d:direction==='up'?-d:0)});
  });
 }
 focus(el){
  const s=this.getSlide(),owner=el.closest('[data-module]'),m=s.modules.find(m=>m.id===owner?.dataset.module),field=freeField(el,s);
  this.target=m?.textBox?{slideId:s.id,moduleId:m.id}:field?{slideId:s.id,key:field.dataset.slideField}:null;
  this.highlight();
 }
 current(){
  const s=this.getSlide(),canvas=this.getCanvas(),t=this.target;
  if(!t||t.slideId!==s.id||this.getMode()!=='text'||!canvas||this.isMulti())return null;
  if(t.moduleId){const m=s.modules.find(m=>m.id===t.moduleId),el=[...canvas.querySelectorAll('[data-module]')].find(n=>n.dataset.module===t.moduleId);return m?.textBox&&el?{el,m,moduleId:m.id}:null;}
  const el=[...canvas.querySelectorAll('[data-slide-field]')].find(n=>n.dataset.slideField===t.key&&freeField(n,s));return el?{el,key:t.key}:null;
 }
 sync(){
  const s=this.getSlide(),canvas=this.getCanvas();if(!canvas)return;
  if(this.target&&(this.getMode()!=='text'||this.target.slideId!==s.id))this.target=null;
  for(const [key,p]of Object.entries(s.textPositions||{})){
   const el=[...canvas.querySelectorAll('[data-slide-field]')].find(n=>n.dataset.slideField===key&&freeField(n,s));
   if(el)Object.assign(p,canvasRect(el,canvas));
  }
  this.highlight();
 }
 highlight(){document.querySelectorAll('.free-text-active').forEach(n=>n.classList.remove('free-text-active'));this.current()?.el.classList.add('free-text-active');}
 inspector(container){
  const target=this.current();if(!target)return false;
  this.highlight();const r=canvasRect(target.el,this.getCanvas()),label=target.el.innerText.trim().split('\n')[0].slice(0,32),esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  container.innerHTML=`<h2>当前文字块</h2><p class="hint">${esc(label)}</p><div class="row free-text-coordinates"><label>横向 X（px）<input id="free-text-x" type="number" step="1" value="${Math.round(r.x*100)/100}"></label><label>纵向 Y（px）<input id="free-text-y" type="number" step="1" value="${Math.round(r.y*100)/100}"></label></div><label>平移步进<select id="free-text-step">${[...new Set([1,5,this.getProject().grid])].map(n=>`<option value="${n}" ${n===this.step?'selected':''}>${n} px</option>`).join('')}</select></label><div class="size-grid">${[['left','←'],['right','→'],['up','↑'],['down','↓']].map(([v,t])=>`<button data-free-text-move="${v}" aria-label="文字块${{left:'左移',right:'右移',up:'上移',down:'下移'}[v]}">${t}</button>`).join('')}</div>${target.key&&this.getSlide().textPositions?.[target.key]?'<button id="free-text-reset">恢复原位</button>':''}<p class="hint">光标所在块即为当前目标。输入坐标或点击箭头平移，Shift加点击为5倍步进。位置须留在正文区，避开模块、图片及其他文字；可撤销，保存HTML和导出保留。</p>`;
  return true;
 }
 move(rect,reset=false){
  const target=this.current();if(!target)return;
  const canvas=this.getCanvas(),s=this.getSlide(),current=canvasRect(target.el,canvas),error=positionError(canvas,s,target.el,rect,target.moduleId);
  if(error){this.toast(error,true);this.renderInspector();return;}
  this.savePoint();
  if(target.m){target.m.x=rect.x;target.m.y=rect.y;target.el.style.left=rect.x+'px';target.el.style.top=rect.y+'px';}
  else{
   const p=s.textPositions?.[target.key],dx=(p?.dx||0)+rect.x-current.x,dy=(p?.dy||0)+rect.y-current.y;
   if(reset){delete s.textPositions[target.key];if(!Object.keys(s.textPositions).length)delete s.textPositions;target.el.style.removeProperty('translate');}
   else{(s.textPositions??={})[target.key]={...rect,dx,dy};target.el.style.translate=`${dx}px ${dy}px`;}
  }
  this.changed();this.renderInspector();
 }
}
