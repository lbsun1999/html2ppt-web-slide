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

export function radialCenter(items){
 if(!items.length)throw Error('请至少选择一个板块。');
 return {x:items.reduce((n,r)=>n+r.x+r.w/2,0)/items.length,y:items.reduce((n,r)=>n+r.y+r.h/2,0)/items.length};
}

function inferredCircleCenter(items){
 const points=items.map(r=>({x:r.x+r.w/2,y:r.y+r.h/2}));
 if(points.length<3)return radialCenter(items);
 const a=points[0],b=points[Math.floor((points.length-1)/2)],c=points.at(-1);
 const d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));
 if(Math.abs(d)<1e-6)return radialCenter(items);
 return {
  x:((a.x*a.x+a.y*a.y)*(b.y-c.y)+(b.x*b.x+b.y*b.y)*(c.y-a.y)+(c.x*c.x+c.y*c.y)*(a.y-b.y))/d,
  y:((a.x*a.x+a.y*a.y)*(c.x-b.x)+(b.x*b.x+b.y*b.y)*(a.x-c.x)+(c.x*c.x+c.y*c.y)*(b.x-a.x))/d
 };
}

function inferredAngles(items,center){
 const angles=items.map(r=>Math.atan2(r.y+r.h/2-center.y,r.x+r.w/2-center.x)*180/Math.PI);
 for(let i=1;i<angles.length;i++){
  while(angles[i]-angles[i-1]>180)angles[i]-=360;
  while(angles[i]-angles[i-1]<-180)angles[i]+=360;
 }
 if(angles.length>2){
  const steps=angles.slice(1).map((value,i)=>value-angles[i]),step=steps.reduce((n,value)=>n+value,0)/steps.length;
  if(Math.abs(Math.abs(step)*angles.length-360)<2)angles[angles.length-1]=angles[0]+Math.sign(step||1)*360;
 }
 return {start:angles[0]??-90,end:angles.at(-1)??270};
}

export function radialGroupEdit(group){
 if(group?.type!=='group'||!group.radial||!Array.isArray(group.items)||!group.items.length)throw Error('所选内容不是可编辑的环形组合。');
 const items=group.items.map(item=>({...item,x:group.x+item.x,y:group.y+item.y}));
 const stored=group.radialOptions||{},center=Number.isFinite(stored.centerX)&&Number.isFinite(stored.centerY)?{x:group.x+stored.centerX,y:group.y+stored.centerY}:inferredCircleCenter(items);
 const inferred=inferredAngles(items,center),radius=items.reduce((n,r)=>n+Math.hypot(r.x+r.w/2-center.x,r.y+r.h/2-center.y),0)/items.length;
 return {items,options:{count:items.length,radius:Number.isFinite(radius)&&radius>0?radius:(stored.radius||180),start:Number.isFinite(stored.start)?stored.start:inferred.start,end:Number.isFinite(stored.end)?stored.end:inferred.end,center}};
}

export function makeRadialGroup(items,id,options={}){
 const box=groupBounds(items);
 const center=options.center||radialCenter(items),used=new Set(),start=Number(options.start),end=Number(options.end);
 const children=items.map((item,i)=>{let childId=item.id;if(!childId||used.has(childId))childId=`${id}-item-${i+1}`;used.add(childId);return {...item,id:childId,x:item.x-box.x,y:item.y-box.y};});
 return {id,type:'group',style:'plain',...box,parts:[{title:'环形分布',text:'',bullet:false}],columns:1,items:children,radial:true,radialOptions:{count:children.length,radius:Number(options.radius)||180,start:Number.isFinite(start)?start:-90,end:Number.isFinite(end)?end:270,centerX:center.x-box.x,centerY:center.y-box.y}};
}
