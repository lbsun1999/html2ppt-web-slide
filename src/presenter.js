import {SlideViewer} from './viewer.js';

// One explicit audience popup; the original workbench remains the presenter view.
// Browser-dependent automatic screen detection/placement is deliberately omitted.
export class PresenterSession{
 constructor({getProject,getIndex,onIndex,onStart,toast}){
  Object.assign(this,{getProject,getIndex,onIndex,onStart,toast});
  window.addEventListener('message',event=>{
   const m=event.data;if(event.source!==this.audience||!this.token||m?.token!==this.token)return;
   if(m.type==='webslide-ready')this.sync();
   if(m.type==='webslide-index'&&Number.isInteger(m.index)&&m.index>=0&&m.index<this.getProject().slides.length)this.onIndex(m.index);
   if(m.type==='webslide-end')this.end();
  });
  window.addEventListener('beforeunload',()=>this.end());
 }
 start(){
  if(this.audience&&!this.audience.closed){this.audience.focus();this.sync();return;}
  this.token=crypto.randomUUID();const url=new URL(location.href);url.searchParams.set('audience',this.token);url.hash='';
  this.audience=window.open(url.href,'webslide-'+this.token,'popup,width=1200,height=760');
  if(!this.audience){this.token=null;this.toast('放映窗口被浏览器拦截。请允许本站弹出窗口，或使用当前窗口全屏放映。',true);return;}
  document.body.classList.add('has-audience');this.onStart();
  this.timer=setInterval(()=>{if(this.audience?.closed)this.end();},500);
  this.toast('本页保留备注；请将新窗口拖到目标屏幕，再点击“进入全屏”。');
 }
 sync(){
  if(!this.audience||this.audience.closed||!this.token)return;
  // Speaker notes never enter the audience window's project data or DOM.
  const project=structuredClone(this.getProject());for(const s of project.slides)delete s.notes;
  this.audience.postMessage({type:'webslide-state',token:this.token,project,index:this.getIndex()},'*');
 }
 end(){clearInterval(this.timer);this.audience?.close();this.audience=null;this.token=null;document.body.classList.remove('has-audience');}
}

export function startAudience(token){
 let project=null,index=0,started=false;
 const opener=window.opener;
 document.querySelector('#project-data')?.remove();
 document.body.innerHTML='<div class="shell"><main class="workspace"><div id="pages-surface"></div></main></div><div id="present-hud" class="present-hud"><span>等待演讲者连接…</span><button id="audience-fullscreen">进入全屏</button><button id="audience-end">结束放映</button></div>';
 document.body.classList.add('audience-window','presenting');document.title='Web Slide · 观众放映';
 const send=(type,extra={})=>opener?.postMessage({type,token,...extra},'*');
 const viewer=new SlideViewer({root:document.querySelector('#pages-surface'),getProject:()=>project,getIndex:()=>index,
  onIndex:n=>{index=n;send('webslide-index',{index:n});},
  onRender:()=>{if(project)viewer.render({mode:'preview'});},
  onPresent:value=>{document.body.classList.toggle('presenting',value);if(!value&&started)send('webslide-end');}});
 // Keep the audience stage active even before the browser grants fullscreen.
 viewer.present=true;
 window.addEventListener('message',event=>{
  const m=event.data;if(event.source!==opener||m?.token!==token||m.type!=='webslide-state')return;
  project=m.project;index=m.index;viewer.present=true;viewer.resetZoom(false);viewer.render({mode:'preview'});started=true;
  document.title=project.title+' · 观众放映';
 });
 document.addEventListener('keydown',e=>viewer.key(e));
 document.addEventListener('dblclick',e=>viewer.doubleClick(e));
 document.querySelector('#audience-fullscreen').onclick=()=>viewer.start(index);
 document.querySelector('#audience-end').onclick=()=>{send('webslide-end');window.close();};
 document.addEventListener('fullscreenchange',()=>{document.querySelector('#audience-fullscreen').hidden=!!document.fullscreenElement;});
 window.addEventListener('resize',()=>viewer.fit());
 window.addEventListener('beforeunload',()=>send('webslide-end'));
 if(!opener){document.querySelector('#present-hud span').textContent='请从工作台点击“演讲者视图”打开本窗口。';return;}
 send('webslide-ready');
}
