const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const byte=value=>Math.max(0,Math.min(255,Math.round(Number(value)||0)));

export function hexToRgb(hex){
 const value=String(hex||'').trim().replace(/^#/,'');
 if(!/^[\da-f]{6}$/i.test(value))return {r:0,g:0,b:0};
 return {r:parseInt(value.slice(0,2),16),g:parseInt(value.slice(2,4),16),b:parseInt(value.slice(4,6),16)};
}
export function rgbToHex({r,g,b}){return '#'+[r,g,b].map(value=>byte(value).toString(16).padStart(2,'0')).join('').toUpperCase();}
export function rgbToHsv({r,g,b}){
 r=byte(r)/255;g=byte(g)/255;b=byte(b)/255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;
 if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h=(h*60+360)%360;}
 return {h,s:max?d/max:0,v:max};
}
export function hsvToRgb({h,s,v}){
 h=((Number(h)||0)%360+360)%360;s=clamp(Number(s)||0);v=clamp(Number(v)||0);const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let rgb;
 if(h<60)rgb=[c,x,0];else if(h<120)rgb=[x,c,0];else if(h<180)rgb=[0,c,x];else if(h<240)rgb=[0,x,c];else if(h<300)rgb=[x,0,c];else rgb=[c,0,x];
 return {r:Math.round((rgb[0]+m)*255),g:Math.round((rgb[1]+m)*255),b:Math.round((rgb[2]+m)*255)};
}
export const hexToHsv=hex=>rgbToHsv(hexToRgb(hex));
export const hsvToHex=hsv=>rgbToHex(hsvToRgb(hsv));

export class OrthogonalColorPicker{
 constructor(){
  this.mode='rgb';this.root=document.createElement('div');this.root.className='orthogonal-color-picker';this.root.hidden=true;
  this.root.innerHTML=`<div class="orthogonal-color-field" role="slider" tabindex="0" aria-label="颜色取色点"><span class="orthogonal-color-point"></span></div>
   <label class="orthogonal-color-hue-row"><span>色相</span><input class="orthogonal-color-hue" type="range" min="0" max="359" step="1"></label>
   <div class="orthogonal-color-mode" role="tablist" aria-label="颜色数值模式"><button type="button" data-color-mode="rgb" role="tab">RGB</button><button type="button" data-color-mode="hsv" role="tab">HSV</button></div>
   <div class="orthogonal-color-channels"></div>
   <div class="orthogonal-color-values"><span class="orthogonal-color-preview" aria-hidden="true"></span><label><span>HEX</span><input class="orthogonal-color-hex" aria-label="十六进制颜色" maxlength="7"></label><button type="button" class="orthogonal-eyedropper">屏幕取色</button></div>
   <p>拖动取色点；按住 Shift 后仅沿起始的水平或垂直方向移动。</p><div class="orthogonal-color-actions"><button type="button" data-color-close>完成</button></div>`;
  this.field=this.root.querySelector('.orthogonal-color-field');this.point=this.root.querySelector('.orthogonal-color-point');this.hue=this.root.querySelector('.orthogonal-color-hue');this.hex=this.root.querySelector('.orthogonal-color-hex');this.channels=this.root.querySelector('.orthogonal-color-channels');this.preview=this.root.querySelector('.orthogonal-color-preview');this.eye=this.root.querySelector('.orthogonal-eyedropper');
  this.eye.hidden=!('EyeDropper' in window);
  document.addEventListener('pointerdown',event=>{const trigger=event.target.closest?.('input[type="color"]');if(trigger){event.preventDefault();this.open(trigger);return;}if(!this.root.hidden&&!this.root.contains(event.target))this.close(true);},true);
  document.addEventListener('click',event=>{if(event.target.closest?.('input[type="color"]'))event.preventDefault();},true);
  document.addEventListener('keydown',event=>{const trigger=event.target.closest?.('input[type="color"]');if(trigger&&['Enter',' '].includes(event.key)){event.preventDefault();this.open(trigger);}else if(!this.root.hidden&&event.key==='Escape'){event.preventDefault();this.close(true);}});
  this.field.addEventListener('pointerdown',event=>this.drag(event));this.field.addEventListener('keydown',event=>this.nudge(event));
  this.hue.addEventListener('input',()=>{this.hsv.h=Number(this.hue.value);this.apply(false);});this.hue.addEventListener('change',()=>this.apply(true));
  this.hex.addEventListener('change',()=>{if(!/^#[\da-f]{6}$/i.test(this.hex.value)){this.hex.value=hsvToHex(this.hsv);return;}this.hsv=hexToHsv(this.hex.value);this.apply(true);});
  this.root.addEventListener('click',event=>{const mode=event.target.dataset.colorMode;if(mode)this.setMode(mode);});
  this.channels.addEventListener('input',()=>this.readChannels(false));this.channels.addEventListener('change',()=>this.readChannels(true));
  this.root.querySelector('[data-color-close]').addEventListener('click',()=>this.close(true));
  this.eye.addEventListener('click',async()=>{try{const result=await new EyeDropper().open();this.hsv=hexToHsv(result.sRGBHex);this.apply(true);}catch{}});
  window.addEventListener('resize',()=>{if(!this.root.hidden)this.position();});
 }
 open(target){
  this.target=target;this.hsv=hexToHsv(target.value||'#000000');const host=target.closest('dialog')||document.body;if(this.root.parentElement!==host)host.append(this.root);this.root.hidden=false;this.setMode(this.mode,false);this.apply(false,false);this.position();
 }
 position(){
  const rect=this.target?.getBoundingClientRect();if(!rect)return;const width=this.root.offsetWidth,height=this.root.offsetHeight,left=clamp(rect.left,8,innerWidth-width-8),below=rect.bottom+8,top=below+height<=innerHeight-8?below:Math.max(8,rect.top-height-8);Object.assign(this.root.style,{left:left+'px',top:top+'px'});
 }
 setMode(mode,focus=true){
  this.mode=mode==='hsv'?'hsv':'rgb';this.root.querySelectorAll('[data-color-mode]').forEach(button=>{const active=button.dataset.colorMode===this.mode;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
  const values=this.mode==='rgb'?hexToRgb(hsvToHex(this.hsv)):{h:Math.round(this.hsv.h),s:Math.round(this.hsv.s*100),v:Math.round(this.hsv.v*100)};
  const fields=this.mode==='rgb'?[['R','r',0,255],['G','g',0,255],['B','b',0,255]]:[['H','h',0,359],['S','s',0,100],['V','v',0,100]];
  this.channels.innerHTML=fields.map(([label,key,min,max])=>`<label><span>${label}</span><input type="number" data-color-channel="${key}" min="${min}" max="${max}" step="1" value="${values[key]}"></label>`).join('');if(focus)this.channels.querySelector('input')?.focus();
 }
 readChannels(commit){
  const value=Object.fromEntries([...this.channels.querySelectorAll('[data-color-channel]')].map(input=>[input.dataset.colorChannel,Number(input.value)]));
  if(this.mode==='rgb')this.hsv=rgbToHsv({r:byte(value.r),g:byte(value.g),b:byte(value.b)});else this.hsv={h:Math.max(0,Math.min(359,value.h||0)),s:clamp((value.s||0)/100),v:clamp((value.v||0)/100)};this.apply(commit,false);this.notify(commit);
 }
 drag(event){
  if(event.button!==0)return;event.preventDefault();this.field.setPointerCapture(event.pointerId);const start=this.coordinates(event);this.setSV(start);let axis=null;
  const move=next=>{let point=this.coordinates(next);if(next.shiftKey){if(!axis){const dx=point.x-start.x,dy=point.y-start.y;if(Math.abs(dx)+Math.abs(dy)>.01)axis=Math.abs(dx)>=Math.abs(dy)?'x':'y';}if(axis==='x')point.y=start.y;else if(axis==='y')point.x=start.x;}else axis=null;this.setSV(point);};
  const up=next=>{move(next);this.field.releasePointerCapture?.(event.pointerId);this.field.removeEventListener('pointermove',move);this.field.removeEventListener('pointerup',up);this.field.removeEventListener('pointercancel',up);this.apply(true);};
  this.field.addEventListener('pointermove',move);this.field.addEventListener('pointerup',up);this.field.addEventListener('pointercancel',up);
 }
 coordinates(event){const rect=this.field.getBoundingClientRect();return {x:clamp((event.clientX-rect.left)/rect.width),y:clamp((event.clientY-rect.top)/rect.height)};}
 setSV(point){this.hsv.s=point.x;this.hsv.v=1-point.y;this.apply(false);}
 nudge(event){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const step=event.shiftKey?.05:.01;if(event.key==='ArrowLeft')this.hsv.s=clamp(this.hsv.s-step);if(event.key==='ArrowRight')this.hsv.s=clamp(this.hsv.s+step);if(event.key==='ArrowUp')this.hsv.v=clamp(this.hsv.v+step);if(event.key==='ArrowDown')this.hsv.v=clamp(this.hsv.v-step);this.apply(true);}
 notify(commit){if(!this.target)return;const value=hsvToHex(this.hsv);this.target.value=value;this.target.dispatchEvent(new Event('input',{bubbles:true}));if(commit)this.target.dispatchEvent(new Event('change',{bubbles:true}));}
 apply(commit,notify=true){
  const value=hsvToHex(this.hsv);this.root.style.setProperty('--picker-hue',this.hsv.h);this.point.style.left=this.hsv.s*100+'%';this.point.style.top=(1-this.hsv.v)*100+'%';this.point.style.background=value;this.hue.value=String(Math.round(this.hsv.h));this.hex.value=value;this.preview.style.background=value;this.field.setAttribute('aria-valuetext',value);
  const shown=this.mode==='rgb'?hexToRgb(value):{h:Math.round(this.hsv.h),s:Math.round(this.hsv.s*100),v:Math.round(this.hsv.v*100)};for(const input of this.channels.querySelectorAll('[data-color-channel]'))if(document.activeElement!==input)input.value=shown[input.dataset.colorChannel];if(notify)this.notify(commit);
 }
 close(commit=false){if(this.root.hidden)return;if(commit)this.apply(true);this.root.hidden=true;this.target=null;}
}
