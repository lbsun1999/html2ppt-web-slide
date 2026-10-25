import {SAFE,GAP,clone,contentBounds} from './model.js';
export const right=r=>r.x+r.w,bottom=r=>r.y+r.h;
// Whitespace is a preference; only actual overlap is a layout error.
export function intersects(a,b,gap=0){return a.x<right(b)+gap-.1&&right(a)+gap>b.x+.1&&a.y<bottom(b)+gap-.1&&bottom(a)+gap>b.y+.1;}
export function inside(r,b=contentBounds()){const flexible=r.type==='text'&&(r.textBox||['ribbon','capsule','arrow'].includes(r.style));return r.x>=b.x-.1&&r.y>=b.y-.1&&right(r)<=right(b)+.1&&bottom(r)<=bottom(b)+.1&&(flexible?r.w>0:r.w>=100)&&r.h>=(r.textBox?40:80);}
export function snap(v,step,base=0){return base+Math.round((v-base)/step)*step;}
export function findSpace(modules,step=20,bounds=SAFE,options={}){
 for(const gap of [GAP,0]){const result=spaceWithGap(modules,step,bounds,gap,options);if(result)return result;}return null;
}
export function findSpaces(modules,step=20,bounds=SAFE,options={}){
 let free=[{...bounds}];
 for(const m of modules){const next=[];for(const r of free){if(!intersects(r,m)){next.push(r);continue;}const l=Math.max(r.x,m.x),t=Math.max(r.y,m.y),rr=Math.min(right(r),right(m)),b=Math.min(bottom(r),bottom(m));if(t>r.y)next.push({x:r.x,y:r.y,w:r.w,h:t-r.y});if(b<bottom(r))next.push({x:r.x,y:b,w:r.w,h:bottom(r)-b});if(l>r.x)next.push({x:r.x,y:t,w:l-r.x,h:b-t});if(rr<right(r))next.push({x:rr,y:t,w:right(r)-rr,h:b-t});}free=next;}
 for(let changed=true;changed;){changed=false;outer:for(let i=0;i<free.length;i++)for(let j=i+1;j<free.length;j++){const a=free[i],b=free[j];let merged=null;if(a.x===b.x&&a.w===b.w&&(bottom(a)===b.y||bottom(b)===a.y))merged={x:a.x,y:Math.min(a.y,b.y),w:a.w,h:a.h+b.h};if(a.y===b.y&&a.h===b.h&&(right(a)===b.x||right(b)===a.x))merged={x:Math.min(a.x,b.x),y:a.y,w:a.w+b.w,h:a.h};if(merged){free.splice(j,1);free[i]=merged;changed=true;break outer;}}}
 return free.map(r=>{const x=bounds.x+Math.ceil((r.x-bounds.x)/step)*step,y=bounds.y+Math.ceil((r.y-bounds.y)/step)*step;return {x,y,w:Math.floor((right(r)-x)/step)*step,h:Math.floor((bottom(r)-y)/step)*step};}).filter(r=>r.w>=160&&r.h>=80&&inside({...r,...options},bounds)).sort((a,b)=>b.w*b.h-a.w*a.h).slice(0,8);
}
function spaceWithGap(modules,step,bounds,gap,options){
 let best=null;
 const xs=[bounds.x,...modules.map(m=>bounds.x+Math.ceil((right(m)+gap-bounds.x)/step)*step).filter(x=>x<right(bounds))];
 const ys=[bounds.y,...modules.map(m=>bounds.y+Math.ceil((bottom(m)+gap-bounds.y)/step)*step).filter(y=>y<bottom(bounds))];
 for(const x of xs)for(const y of ys){
  const rights=[right(bounds),...modules.filter(m=>m.x>x).map(m=>m.x-gap)];
  for(const r of rights){let end=bottom(bounds);for(const m of modules)if(m.x<r+gap&&right(m)+gap>x&&bottom(m)+gap>y){if(m.y-gap<y){end=y;break;}end=Math.min(end,m.y-gap);}
   const candidate={x,y,w:Math.floor((r-x)/step)*step,h:Math.floor((end-y)/step)*step};
   if(inside({...candidate,...options},bounds)&&!modules.some(m=>intersects(candidate,m,gap))&&(!best||candidate.w*candidate.h>best.w*best.h))best=candidate;
  }
 }
 return best;
}
// Push neighbours along grid lines. A failed plan is never applied to live state.
export function planChange(modules,id,rect,step=20,bounds=SAFE){
 return planWithGap(modules,id,rect,step,bounds,GAP)||planWithGap(modules,id,rect,step,bounds,0);
}
function planWithGap(modules,id,rect,step,bounds,gap){
 const copy=clone(modules),changed=copy.find(m=>m.id===id);if(!changed||!inside({...changed,...rect},bounds))return null;Object.assign(changed,rect);
 const queue=[changed],moved=new Set([id]);let n=0;
 while(queue.length&&n++<120){const a=queue.shift();for(const b of copy){if(a.id===b.id||!intersects(a,b))continue;
   if(b.id===id)return null;
   const down={...b,y:bounds.y+Math.ceil((bottom(a)+gap-bounds.y)/step)*step};
   const side={...b,x:bounds.x+Math.ceil((right(a)+gap-bounds.x)/step)*step};
   const opts=[down,side].filter(r=>inside(r,bounds)&&!copy.some(c=>moved.has(c.id)&&c.id!==b.id&&intersects(c,r))).sort((u,v)=>(u.x-b.x+u.y-b.y)-(v.x-b.x+v.y-b.y));
   if(!opts.length)return null;Object.assign(b,opts[0]);moved.add(b.id);queue.push(b);
  }}
 if(queue.length||copy.some((a,i)=>!inside(a,bounds)||copy.slice(i+1).some(b=>intersects(a,b))))return null;
 return copy;
}
export function anchoredResize(m,dx,dy,anchor='tl'){
 const r={x:m.x,y:m.y,w:m.w+dx,h:m.h+dy};if(anchor.includes('r'))r.x-=dx;if(anchor.startsWith('b'))r.y-=dy;return r;
}
