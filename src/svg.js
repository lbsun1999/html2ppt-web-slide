export function validateSVGText(text){
 if(typeof text!=='string'||text.length>5*1024*1024||!/<svg\b/i.test(text)||!/<\/svg\s*>/i.test(text))throw Error('SVG文件无效或超过5MB。');
 if(/<(?:script|foreignObject|iframe|object|embed)\b|<!DOCTYPE|<!ENTITY|\bon[a-z]+\s*=|@import/i.test(text))throw Error('SVG含脚本或活动内容，请导出为纯图形SVG后重试。');
 for(const m of text.matchAll(/(?:\s|:)(?:href|src)\s*=\s*["']([^"']*)["']/ig))if(!/^(?:#|data:image\/(?:png|jpeg|webp);base64,)/i.test(m[1]))throw Error('SVG不能引用外部文件，请将图像嵌入后重试。');
 for(const m of text.matchAll(/url\(\s*["']?([^)'"\s]+)/ig))if(!m[1].startsWith('#'))throw Error('SVG不能引用外部样式或资源。');
 return text;
}
export function svgDataURL(text){validateSVGText(text);return 'data:image/svg+xml;base64,'+encodeSVG(text);}
function encodeSVG(text){const bytes=new TextEncoder().encode(text);let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(binary);}
export function decodeSVGData(src){if(!/^data:image\/svg\+xml;base64,/i.test(src||''))return null;const text=new TextDecoder().decode(Uint8Array.from(atob(src.split(',')[1]),c=>c.charCodeAt(0)));validateSVGText(text);return text;}
export function svgRatio(src){const text=decodeSVGData(src);if(!text)return null;const root=text.match(/<svg\b[^>]*>/i)?.[0]||'',view=root.match(/viewBox\s*=\s*["']([^"']+)["']/i)?.[1]?.trim().split(/[\s,]+/).map(Number);if(view?.length===4&&view[2]>0&&view[3]>0)return view[2]/view[3];const width=parseFloat(root.match(/\bwidth\s*=\s*["']([^"']+)/i)?.[1]),height=parseFloat(root.match(/\bheight\s*=\s*["']([^"']+)/i)?.[1]);return width>0&&height>0?width/height:null;}
