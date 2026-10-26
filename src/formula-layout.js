import layouts from './reference-layouts.json' with {type:'json'};
import {moduleOf,part} from './model.js';

// Upgrade the old visual snapshot once; retain authored wording and LaTeX.
export function modularizeFormula(s){
 if(s.referenceLayout!=='formula')return s;
 const f=layouts.formula.fields,value=k=>s[k]??f[k],tex=[...layouts.formula.html.matchAll(/data-tex="([^"]*)"/g)].map(m=>m[1]);
 const description=i=>{const text=value('legacy_'+i);return text===f['legacy_'+i]&&!s.rich?.['legacy_'+i]?text.replace('。','。\n'):text;};
 const formulas=Object.assign(moduleOf('formula',{x:58,y:256,w:902,h:554},2),{style:'band',columns:1,role:'objective-formulas'});
 formulas.parts=[0,1].map(i=>({...part(),title:value('legacy_'+(4+i*2)),text:description(5+i*2),latex:s.referenceLatex?.[i]??tex[i],lineSpacing:{text:1.45},...copyFormats(s,5+i*2)}));
 const symbols=Object.assign(moduleOf('table',{x:996,y:256,w:546,h:300}),{tableTitle:value('legacy_8'),role:'formula-symbols',style:'plain',cardStyle:'plain',headerRows:0,borderless:true,fontPt:14,fixedFont:false,cellPaddingPt:1,columnWidths:[20,80],mathUseThemeColor:s.symbolUseThemeColor!==false});
 symbols.rows=Array.from({length:6},(_,i)=>['$'+(s.referenceSymbolLatex?.[i]??tex[i+2])+'$',value('legacy_'+(9+i))]);
 const styles=Object.assign(moduleOf('table',{x:996,y:574,w:546,h:236}),{tableTitle:value('legacy_15'),role:'formula-styles',style:'cards',cardStyle:'cards',headerRows:0,borderless:true,fontPt:14,fixedFont:false,cellPaddingPt:1,columnWidths:[27,27,46],mathUseThemeColor:s.symbolUseThemeColor!==false,tableNote:value('legacy_24')});
 styles.rows=[0,1,2,3].map((_,i)=>[value('legacy_'+(16+i*2)),'$'+(s.referenceStyleLatex?.[i]??tex[8+i].replace('\\symbfit','\\boldsymbol'))+'$',value('legacy_'+(17+i*2))]);
 for(let i=0;i<6;i++)copyCell(s,symbols,9+i,i+',1');
 for(let i=0;i<4;i++){copyCell(s,styles,16+i*2,i+',0');copyCell(s,styles,17+i*2,i+',2');}
 s.modules=[formulas,symbols,styles];delete s.referenceLayout;
 // Converted fields now belong to modules, so legacy free-text rectangles must
 // not reserve phantom space. All original field values remain in the source.
 for(const key of Object.keys(s.textPositions||{}))if(/^legacy_/.test(key))delete s.textPositions[key];
 return s;
}
function copyFormats(s,i){const key='legacy_'+i;return {...(s.rich?.[key]?{rich:{text:structuredClone(s.rich[key])}}:{}),...(s.paragraphs?.[key]?{paragraphs:{text:structuredClone(s.paragraphs[key])}}:{}),...(s.fontSizes?.[key]?{fontSizes:{text:s.fontSizes[key]}}:{})};}
function copyCell(s,m,i,key){if(s.rich?.['legacy_'+i]){m.cellRich??={};m.cellRich[key]=structuredClone(s.rich['legacy_'+i]);}}
