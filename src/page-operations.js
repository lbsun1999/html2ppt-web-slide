import {clone,uid,validateProject} from './model.js';

// IDs and internal links travel with copied pages; originals remain untouched.
export function duplicatePages(pages){
 const result=clone(pages),ids=new Map();
 for(const s of result){ids.set(s.id,uid());for(const m of s.modules)ids.set(m.id,uid());}
 const remap=value=>{
  if(typeof value==='string'){if(ids.has(value))return ids.get(value);return value.replace(/#slide-([a-zA-Z0-9_-]+)/g,(match,id)=>ids.has(id)?'#slide-'+ids.get(id):match);}
  if(Array.isArray(value))return value.map(remap);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>[ids.get(key)||key,remap(v)]));
  return value;
 };
 return remap(result);
}

export function movePages(slides,ids,before){
 const picked=slides.filter(s=>ids.has(s.id)),rest=slides.filter(s=>!ids.has(s.id));
 const target=slides.slice(0,before).filter(s=>!ids.has(s.id)).length;
 return [...rest.slice(0,target),...picked,...rest.slice(target)];
}

export function validateClipboard(text,project){
 const data=JSON.parse(text);
 if(data?.format!=='web-slide-pages-v1'||!Array.isArray(data.slides)||!data.slides.length)throw Error('剪贴板中没有复制的 Web Slide 页面。');
 // Validate a separate project so derived chapter fields never mutate the source.
 return validateProject({...clone(project),slides:clone(data.slides)}).slides;
}
