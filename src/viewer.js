import {W,H} from './model.js';
import {renderSlide,fitTable} from './render.js';

// Presentation state is transient: it never changes the saved slide geometry.
export class SlideViewer{
 constructor({root,getProject,getIndex,onIndex,onRender,onPresent}){
  Object.assign(this,{root,getProject,getIndex,onIndex,onRender,onPresent});this.document=root.ownerDocument;this.window=this.document.defaultView;
  this.mode='scroll';this.columns=2;this.present=false;this.overview=false;this.zoom=1;this.pan={x:0,y:0};this.wheelUntil=0;this.restoreEscapeAt=0;
  root.addEventListener('wheel',e=>this.wheel(e),{passive:false});
  root.addEventListener('pointerdown',e=>this.pointer(e));
  root.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const hash=a.getAttribute('href'),slides=this.getProject().slides;const n=hash.startsWith('#slide-')?slides.findIndex(s=>s.id===hash.slice(7)):hash.startsWith('#ref-')?slides.findIndex(s=>s.referenceLayout==='references'):-1;if(n>=0){e.preventDefault();e.stopPropagation();this.select(n);}});
  this.document.addEventListener('fullscreenchange',()=>{
   if(this.document.fullscreenElement||!this.present||this.ending)return;
   if(this.zoom>1.001||Date.now()-this.restoreEscapeAt<700){this.resetZoom();this.updateHUD();return;}
   this.end();
  });
 }
 render({mode='text',showGrid=false,grid=20,selected=null,drawing=false}={}){
  const project=this.getProject(),index=this.getIndex(),scroll=this.root.parentElement.scrollTop;
  const all=this.present?this.overview:this.mode!=='single';
  const slides=all?project.slides.map((s,i)=>({s,i})):[{s:project.slides[index],i:index}];
  this.root.className=`pages-surface ${this.present&&this.overview?'presentation-overview':!this.present?'view-'+this.mode:'presentation-stage'}`;
  this.root.style.setProperty('--view-columns',this.present?4:this.mode==='grid'?this.columns:1);
  this.root.innerHTML=slides.map(({s,i})=>`<article class="view-page ${i===index?'is-current':''}" data-view-page="${i}"><div class="view-page-label"><b>${String(i+1).padStart(2,'0')}</b><span>${this.escape(s.title.split('\n')[0])}</span><small>${this.present?'双击继续放映':this.mode==='grid'?'双击放映':''}</small></div><div ${i===index?'id="canvas"':''} class="canvas-frame mode-${mode}${showGrid&&!this.present?' show-grid':''}${drawing&&i===index?' draw-mode':''}" style="--grid:${grid}px">${renderSlide(s,project.theme,i,project.slides.length,i===index&&mode==='text'&&!this.present&&this.mode!=='grid',project)}</div></article>`).join('');
  if(selected)this.root.querySelector(`#canvas [data-module="${selected}"]`)?.classList.add('selected');
  this.fit();this.root.querySelectorAll('.module').forEach(fitTable);
  this.root.parentElement.scrollTop=scroll;
  this.updateHUD();
 }
 escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 fit(){
  for(const preview of this.document.querySelectorAll('.thumb-preview')){const slide=preview.querySelector('.slide');if(slide)slide.style.transform=`scale(${preview.clientWidth/W})`;}
  const shell=this.document.querySelector('.shell');this.document.documentElement.style.setProperty('--chrome-height',Math.ceil(shell?.getBoundingClientRect().top||126)+'px');
  for(const frame of this.root.querySelectorAll('.canvas-frame')){
   let available=frame.parentElement.clientWidth;
   if(!this.present&&this.document.body.classList.contains('has-audience')){const work=frame.closest('.workspace'),notes=this.document.querySelector('#notes-panel');available=Math.min(available,Math.max(200,work.clientHeight-(notes?.offsetHeight||0)-150)*W/H);}
   if(this.present&&!this.overview)available=Math.min(available,this.window.innerHeight*W/H);
   const scale=this.present&&!this.overview?available/W:Math.min(available/W,1);frame.dataset.baseScale=scale;frame.style.width=W*scale+'px';frame.style.height=H*scale+'px';
   frame.querySelector('.slide').style.transform=`scale(${scale})`;
  }
  if(this.present&&!this.overview)this.transform();
 }
 setView(mode,columns=this.columns){if(!['single','scroll','grid'].includes(mode))return;this.mode=mode;this.columns=Math.max(1,Math.min(6,Number(columns)||2));this.onRender();this.scrollTo(this.getIndex(),false);}
 scrollTo(index,smooth=true){if(this.present||this.mode==='single')return;this.root.querySelector(`[data-view-page="${index}"]`)?.scrollIntoView({block:'start',behavior:smooth?'smooth':'instant'});}
 async start(index=this.getIndex()){
  if(this.exitPromise)await this.exitPromise;
  this.lastDrag=0;
  if(!this.present)this.previous={mode:this.mode,columns:this.columns,scroll:this.root.parentElement.scrollTop};
  this.onIndex(index);this.present=true;this.overview=false;this.resetZoom(false);this.onPresent(true);this.onRender();
  try{if(!this.document.fullscreenElement)await this.document.documentElement.requestFullscreen();await this.window.navigator.keyboard?.lock?.(['Escape']);}catch{}
  this.fit();
  this.showHud();
 }
 end(){
  if(!this.present)return;this.present=false;this.overview=false;this.resetZoom(false);this.onPresent(false);this.window.navigator.keyboard?.unlock?.();
  if(this.hudTimer){clearTimeout(this.hudTimer);this.hudTimer=null;}
  if(this.document.fullscreenElement){this.ending=true;this.exitPromise=this.document.exitFullscreen().catch(()=>{}).finally(()=>{this.ending=false;this.exitPromise=null;});}
  if(this.previous){this.mode=this.previous.mode;this.columns=this.previous.columns;}
  this.onRender();if(this.previous)this.root.parentElement.scrollTop=this.previous.scroll;
 }
 showHud(){
  const hud=this.document.querySelector('#present-hud');if(!hud)return;
  hud.classList.remove('is-idle');
  if(this.hudTimer)clearTimeout(this.hudTimer);
  this.hudTimer=setTimeout(()=>hud.classList.add('is-idle'),3000);
 }
 select(index,{scroll=true}={}){
  if(index<0||index>=this.getProject().slides.length)return;
  if(this.present&&this.overview){this.onIndex(index);this.root.querySelectorAll('.view-page').forEach(el=>{const active=Number(el.dataset.viewPage)===index;el.classList.toggle('is-current',active);const frame=el.querySelector('.canvas-frame');if(active)frame.id='canvas';else frame.removeAttribute('id');});return;}
  this.onIndex(index);this.resetZoom(false);this.onRender();if(scroll)this.scrollTo(index);
 }
 doubleClick(e){
  const thumb=e.target.closest('.slide-thumb[data-page]');
  if(thumb){this.start(Number(thumb.dataset.page));return true;}
  const page=e.target.closest('[data-view-page]');if(!page||!this.root.contains(page))return false;
  if(this.present){
   if(Date.now()-(this.lastDrag||0)<300)return true;
   if(this.overview){this.onIndex(Number(page.dataset.viewPage));this.overview=false;this.resetZoom(false);}
   else{this.overview=true;this.resetZoom(false);}
   this.onRender();if(this.overview)this.root.querySelector('.is-current')?.scrollIntoView({block:'center'});this.showHud();return true;
  }
  if(this.mode==='grid'){this.start(Number(page.dataset.viewPage));return true;}return false;
 }
 key(e){
  if(!this.present)return false;
  this.showHud();
  if(e.key==='Escape'){
   e.preventDefault();if(this.zoom>1.001){this.restoreEscapeAt=Date.now();this.resetZoom();}else this.end();return true;
  }
  if(this.overview)return false;
  const keys={ArrowRight:1,ArrowDown:1,PageDown:1,' ':1,ArrowLeft:-1,ArrowUp:-1,PageUp:-1};
  if(e.key in keys){e.preventDefault();this.select(this.getIndex()+keys[e.key],{scroll:false});return true;}
  if(e.key==='Home'||e.key==='End'){e.preventDefault();this.select(e.key==='Home'?0:this.getProject().slides.length-1,{scroll:false});return true;}
  return false;
 }
 wheel(e){
  if(!this.present)return;
  if(this.overview){if(e.ctrlKey)e.preventDefault();return;}
  e.preventDefault();
  if(e.ctrlKey){
   const frame=this.root.querySelector('#canvas'),r=frame.getBoundingClientRect(),next=Math.max(1,Math.min(4,this.zoom*Math.exp(-e.deltaY*.002)));
   const k=next/this.zoom,x=e.clientX-r.left,y=e.clientY-r.top;this.pan.x=x-(x-this.pan.x)*k;this.pan.y=y-(y-this.pan.y)*k;this.zoom=next;this.transform();return;
  }
  if(Date.now()<this.wheelUntil||Math.abs(e.deltaY)<2)return;this.wheelUntil=Date.now()+350;this.select(this.getIndex()+(e.deltaY>0?1:-1),{scroll:false});
 }
 pointer(e){
  if(!this.present||this.overview||this.zoom<=1.001||e.button!==0||e.target.closest('video,button,a'))return;
  const frame=e.target.closest('#canvas');if(!frame)return;e.preventDefault();frame.setPointerCapture(e.pointerId);frame.classList.add('dragging');
  const start={x:e.clientX,y:e.clientY,pan:{...this.pan}};
  const move=event=>{const dx=event.clientX-start.x,dy=event.clientY-start.y;this.pan.x=start.pan.x+dx;this.pan.y=start.pan.y+dy;if(Math.abs(dx)+Math.abs(dy)>4)this.lastDrag=Date.now();this.transform();};
  const end=()=>{frame.classList.remove('dragging');frame.removeEventListener('pointermove',move);frame.removeEventListener('pointerup',end);frame.removeEventListener('pointercancel',end);};
  frame.addEventListener('pointermove',move);frame.addEventListener('pointerup',end);frame.addEventListener('pointercancel',end);
 }
 transform(){
  const frame=this.root.querySelector('#canvas');if(!frame||!this.present||this.overview)return;
  if(this.zoom<=1.001){this.zoom=1;this.pan={x:0,y:0};}
  this.pan.x=Math.max(-frame.clientWidth*(this.zoom-1),Math.min(0,this.pan.x));this.pan.y=Math.max(-frame.clientHeight*(this.zoom-1),Math.min(0,this.pan.y));
  frame.querySelector('.slide').style.transform=`translate(${this.pan.x}px,${this.pan.y}px) scale(${Number(frame.dataset.baseScale)*this.zoom})`;
  frame.classList.toggle('zoomed',this.zoom>1.001);this.updateHUD();
 }
 resetZoom(apply=true){this.zoom=1;this.pan={x:0,y:0};if(apply)this.transform();}
 updateHUD(){this.document.body.classList.toggle('presentation-overview-mode',this.present&&this.overview);const hud=this.document.querySelector('#present-hud');if(hud){hud.hidden=!this.present;hud.querySelector('span').textContent=this.overview?'双击页面继续放映 · Esc 退出':`${Math.round(this.zoom*100)}% · Ctrl＋滚轮缩放 · 左键拖动 · 双击总览 · Esc 恢复 / 退出`;}}
}
