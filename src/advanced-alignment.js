const right=r=>r.x+r.w;
const bottom=r=>r.y+r.h;

export const alignmentAxis=mode=>mode?.startsWith('v-')?'x':mode?.startsWith('h-')?'y':null;

export function alignToGuide(rect,mode,action,guide){
 const r={...rect};
 if(mode==='v-move')r.x=action==='left'?guide:action==='center'?guide-r.w/2:guide-r.w;
 if(mode==='v-stretch'){
  if(action==='left'){r.w=right(r)-guide;r.x=guide;}
  if(action==='right')r.w=guide-r.x;
 }
 if(mode==='h-move')r.y=action==='top'?guide:action==='middle'?guide-r.h/2:guide-r.h;
 if(mode==='h-stretch'){
  if(action==='top'){r.h=bottom(r)-guide;r.y=guide;}
  if(action==='bottom')r.h=guide-r.y;
 }
 return r;
}

export function distributeEven(rects,axis){
 const key=axis==='x'?'x':'y',size=axis==='x'?'w':'h';
 const sorted=rects.map(r=>({...r})).sort((a,b)=>a[key]-b[key]);
 if(sorted.length<3)return sorted;
 const outerStart=sorted[0][key],outerEnd=sorted.at(-1)[key]+sorted.at(-1)[size];
 const gap=(outerEnd-outerStart-sorted.reduce((n,r)=>n+r[size],0))/(sorted.length-1);
 for(let i=1;i<sorted.length-1;i++)sorted[i][key]=sorted[i-1][key]+sorted[i-1][size]+gap;
 return sorted;
}

export function radialLayout(rects,{count=rects.length,radius=180,start=-90,end=270,center}={}){
 if(!rects.length)throw Error('请至少选择一个板块。');
 const source=rects.length===1?Array.from({length:Math.max(1,count)},()=>({...rects[0]})):rects.map(r=>({...r}));
 const c=center||{x:source.reduce((n,r)=>n+r.x+r.w/2,0)/source.length,y:source.reduce((n,r)=>n+r.y+r.h/2,0)/source.length};
 const full=Math.abs(end-start)>=359.999;
 return source.map((r,i)=>{const denominator=full?source.length:Math.max(1,source.length-1),angle=(start+(end-start)*i/denominator)*Math.PI/180;return {...r,x:c.x+Math.cos(angle)*radius-r.w/2,y:c.y+Math.sin(angle)*radius-r.h/2};});
}

export function groupBounds(items,padding=0){
 const x=Math.min(...items.map(r=>r.x))-padding,y=Math.min(...items.map(r=>r.y))-padding;
 const rr=Math.max(...items.map(r=>right(r)))+padding,bb=Math.max(...items.map(r=>bottom(r)))+padding;
 return {x,y,w:rr-x,h:bb-y};
}

export function makeRadialGroup(items,id){
 const box=groupBounds(items);
 return {id,type:'group',style:'plain',...box,parts:[{title:'环形分布',text:'',bullet:false}],columns:1,items:items.map(item=>({...item,x:item.x-box.x,y:item.y-box.y})),radial:true};
}
