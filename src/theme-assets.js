import {svgRatio} from './svg.js';
// Match the theme hue without changing a secondary color's HSL saturation/lightness.
export function alignHue(color,primary){
 const hsl=hex=>{const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo,l=(hi+lo)/2;return [d?(((hi===r?(g-b)/d+(g<b?6:0):hi===g?(b-r)/d+2:(r-g)/d+4)/6)):0,d?d/(1-Math.abs(2*l-1)):0,l];};
 const [h]=hsl(primary),[,s,l]=hsl(color),c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h*6)%2-1)),m=l-c/2,sector=Math.floor(h*6)%6,rgb=[[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][sector];
 return '#'+rgb.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
}
export function mixColor(a,b,amount){
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 return '#'+rgb(a).map((n,i)=>Math.round(n*(1-amount)+rgb(b)[i]*amount).toString(16).padStart(2,'0')).join('');
}
export function themedPortrait(src,theme){
 if(!src?.startsWith('data:image/svg+xml;base64,'))return src;
 let svg;try{svg=new TextDecoder().decode(Uint8Array.from(atob(src.split(',')[1]),c=>c.charCodeAt(0)));}catch{return src;}
 // Only the built-in placeholder is recolored; uploaded portraits stay intact.
 if(!svg.includes('作者照片占位')||!svg.includes('通用人物轮廓'))return src;
 const primary=theme.primary,tint=theme.tint,line=mixColor(primary,'#FFFFFF',.78),silhouette=mixColor(primary,tint,.48);
 svg=svg.replaceAll('#e4eef5',tint).replaceAll('#c6d9e6',line).replaceAll('#8aafc6',silhouette).replaceAll('#40647d',primary).replace('浅蓝底','主题浅底');
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
export function themedMathImage(src,color){
 if(!src?.startsWith('data:image/svg+xml;base64,'))return src;
 try{const svg=new TextDecoder().decode(Uint8Array.from(atob(src.split(',')[1]),c=>c.charCodeAt(0))).replace(/#12374e/ig,color);return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);}catch{return src;}
}
export function resolveThemeAsset(asset,theme={}){
 const role=asset?.themeLogo;if(!['logo','wordmark'].includes(role)||!theme[role])return asset;
 const next={...asset,src:theme[role]};
 if(next.src.startsWith('data:image/svg+xml;base64,')){const ratio=svgRatio(next.src);if(ratio){next.naturalRatio=ratio;if(next.ratioMode==='original'||next.fit==='contain')next.ratio=ratio;}}
 if(next.src.startsWith('data:image/png;base64,'))try{const bytes=Uint8Array.from(atob(next.src.split(',')[1].slice(0,44)),c=>c.charCodeAt(0)),view=new DataView(bytes.buffer);next.naturalRatio=view.getUint32(16)/view.getUint32(20);if(next.ratioMode==='original'||next.fit==='contain')next.ratio=next.naturalRatio;}catch{}
 return next;
}
