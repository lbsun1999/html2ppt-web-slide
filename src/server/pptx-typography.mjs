import JSZip from 'jszip';

// PptxGenJS has no public options for the DrawingML East Asian line-break rules.
// Apply them to generated paragraphs, without altering their editable text/runs.
export async function finishPptxTypography(bytes){
 const zip=await JSZip.loadAsync(bytes);
 for(const file of Object.values(zip.files)){
  if(!/^ppt\/slides\/slide\d+\.xml$/.test(file.name))continue;
  const source=await file.async('string');
  const xml=source.replace(/<a:p>([\s\S]*?)<\/a:p>/g,(_,body)=>{
   // v4 can emit one pPr per rich run. OOXML permits only one per paragraph;
   // keeping the first also prevents a later rich run from clearing its bullet.
   let properties;
   const content=body.replace(/<a:pPr\b[^>]*(?:\/>|>[\s\S]*?<\/a:pPr>)/g,p=>{properties??=p;return '';});
   properties=(properties||'<a:pPr/>').replace(/<a:pPr\b([^>]*?)(\/?)>/,(_,attrs,slash)=>{
    const clean=attrs.replace(/\s+(?:eaLnBrk|latinLnBrk|hangingPunct)="[^"]*"/g,'');
    return `<a:pPr${clean} eaLnBrk="1" latinLnBrk="0" hangingPunct="1"${slash}>`;
   });
   return `<a:p>${properties}${content}</a:p>`;
  });
  zip.file(file.name,xml);
 }
 return zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
}

export function nativeText(t){
 if(!t.runs?.length)return t.text;
 return t.runs.map(run=>({text:run.text,options:{bold:run.bold,italic:run.italic,fontFace:run.fontFace||t.fontFace,fontSize:run.fontSize,color:run.color||t.color||'000000',lang:'zh-CN'}}));
}

export function nativeBullet(t){
 if(!t.bullet)return undefined;
 const code=Array.from(t.bullet)[0]?.codePointAt(0)||0x2022;
 return {characterCode:(code<=0xffff?code:0x2022).toString(16).padStart(4,'0'),indent:Math.max(1,(t.bulletIndent||32)*.6)};
}
