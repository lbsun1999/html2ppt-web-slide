export function localWorkbenchURL(value){
 let url;try{url=new URL(value);}catch{throw Error('请输入本地工作台地址，例如http://127.0.0.1:4317。');}
 if(url.protocol!=='http:'||!['127.0.0.1','localhost'].includes(url.hostname)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('仅支持本机http://127.0.0.1:端口或http://localhost:端口，不能传送到外部网站。');
 return url.origin;
}
export function openLocalExport(kind,{getProject}){
 const label=kind==='pptx'?'PPTX':'PDF',dialog=document.createElement('dialog');dialog.id='local-export-dialog';
 dialog.innerHTML=`<form method="dialog"><div class="dialog-head"><h2>连接本地工作台，导出${label}</h2><button value="cancel" aria-label="关闭">×</button></div><div class="dialog-body"><p>当前是直接打开的HTML，编辑与放映可以离线进行；PDF／PPTX导出需要本机服务。</p><ol><li>将完整项目解压到文件夹，双击“启动.cmd”，保持启动窗口开启。</li><li>双击启动失败时，在项目文件夹打开终端，执行下面的命令。首次运行会自动恢复依赖；需要Node.js 20.10+。</li></ol><pre class="local-export-command">node scripts/start.mjs --open</pre><p>服务就绪后点击“传送当前文稿”。当前内容会自动载入新窗口，随后点击该窗口的“导出${label}”，无需拖拽或先保存文件。</p><label>本地工作台地址<input id="local-workbench-url" value="http://127.0.0.1:4317" spellcheck="false"></label><p class="hint">只向本机传送。若启动服务时设置过PORT，请填写对应端口。也可在工作台点击“打开HTML”选择文件。启动日志位于项目的ect/startup.log。</p><p id="local-export-status" role="status"></p></div><div class="dialog-actions"><button value="cancel">关闭</button><button type="button" id="local-export-connect" class="primary">传送当前文稿</button></div></form>`;
 document.body.append(dialog);const button=dialog.querySelector('#local-export-connect'),status=dialog.querySelector('#local-export-status');let cleanup=()=>{};
 button.onclick=()=>{
  cleanup();let origin;try{origin=localWorkbenchURL(dialog.querySelector('#local-workbench-url').value.trim());}catch(error){status.textContent=error.message;return;}
  const token=crypto.randomUUID();let child,timer;
  const receive=event=>{
   if(event.source!==child||event.origin!==origin||event.data?.token!==token)return;
   if(event.data.type==='webslide-import-ready')try{child.postMessage({type:'webslide-import-project',token,project:getProject(),exportKind:kind},origin);}catch(error){cleanup();status.textContent='传送未完成：'+error.message;}
   if(event.data.type==='webslide-import-result'){cleanup();status.textContent=event.data.ok?'文稿已传送。请在新窗口点击“导出'+label+'”；原窗口的修改继续保留。':'传送未完成：'+event.data.error;}
  };
  cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',receive);button.disabled=false;};
  window.addEventListener('message',receive);child=window.open(origin+'/#web-slide-import='+encodeURIComponent(token),'_blank');
  if(!child){cleanup();status.textContent='浏览器阻止了新窗口，请允许此页面打开弹出窗口后重试，或直接打开本地地址再点击“打开HTML”。';return;}
  button.disabled=true;status.textContent='正在等待本地工作台；请确认启动窗口显示“服务已就绪”……';
  timer=setTimeout(()=>{cleanup();status.textContent='尚未连接成功。请先启动本地服务并确认地址，随后重试；也可在工作台点击“打开HTML”。';},12000);
 };
 dialog.querySelector('#local-workbench-url').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();button.click();}});
 dialog.addEventListener('close',()=>{cleanup();dialog.remove();},{once:true});dialog.showModal();
}
export function acceptLocalProject({applyProject,toast}){
 const token=new URLSearchParams(location.hash.slice(1)).get('web-slide-import');
 if(location.protocol!=='http:'||!['127.0.0.1','localhost'].includes(location.hostname)||!window.opener||!token||!/^[a-f\d-]{36}$/i.test(token))return;
 const source=window.opener;let timeout;
 const receive=event=>{
  if(event.source!==source||event.origin!=='null'||event.data?.type!=='webslide-import-project'||event.data.token!==token)return;
  try{applyProject(event.data.project);source.postMessage({type:'webslide-import-result',token,ok:true},'*');window.removeEventListener('message',receive);clearTimeout(timeout);history.replaceState(null,'',location.pathname+location.search);toast('当前文稿已从离线HTML传入。点击顶部“导出'+(event.data.exportKind==='pptx'?'PPTX':'PDF')+'”即可导出。');}
  catch(error){source.postMessage({type:'webslide-import-result',token,ok:false,error:error.message},'*');}
 };
 // file: openers have an opaque origin; source + random token bind the reply.
 window.addEventListener('message',receive);source.postMessage({type:'webslide-import-ready',token},'*');timeout=setTimeout(()=>window.removeEventListener('message',receive),30000);
}
