import layouts from './reference-layouts.json' with {type:'json'};
import {blankSlide,moduleOf,part,clone} from './model.js';
import {tablePart} from './table-blocks.js';
const text=(style,rect,items)=>{const m=moduleOf('text',rect,items.length);m.style=style;m.columns=1;m.parts=items.map(([title,text])=>({...part(),title,text}));return m;};
const table=(rect,rows,extra)=>Object.assign(moduleOf('table',rect),{rows,headerRows:1,...extra});

export function summaryPage(){
 const f=layouts.summary.fields,s={...blankSlide(),title:f.title,lead:f.lead,source:f.source,section:'04',group:'总结与计划'};
 const cards=text('cards',{x:58,y:256,w:706,h:554},[2,4,6].map(i=>[f['legacy_'+i],f['legacy_'+(i+1)]]));cards.groupTitle='阶段总结';cards.role='summary-cards';for(const p of cards.parts)p.lineSpacing={text:1.45};
 const plan=table({x:800,y:256,w:742,h:415},[['工作阶段','关键任务','验收产出'],['近期','统一实验设置\n固定数据划分','参数清单、数据版本\n及可复现脚本'],['随后','补充对照实验\n开展关键消融','均值 ± 标准差\n重复次数及日志'],['并行','分析异常结果\n归纳失败案例','差异解释与边界条件\n典型样例定位'],['下次汇报','汇总新增证据\n逐项回应问题','更新图表与问题清单\n修订研究结论']],{tableTitle:'下一步计划',titleLevel:'group',fontPt:14,cellPaddingPt:3,columnWidths:[19,36,45],role:'plan-module'});
 plan.h=420;
 const note=text('note',{x:834,y:692,w:708,h:118},[['','本次讨论：确认实验优先级和验收标准。\n各阶段时间按实际进展填写。']]);note.role='plan-discussion';note.parts[0].lineSpacing={text:1.45};
 s.modules=[cards,plan,note];return s;
}

export function profilePage(){
 const f=layouts.profile.fields,s={...blankSlide(),title:f.title,lead:'',source:f.source,section:'附录',group:'参考与作者',chapterMode:'manual',contentTop:192,profileIdentity:{x:58,y:192,w:340,h:626}};
 for(let i=3;i<=10;i++)s['legacy_'+i]=f['legacy_'+i];s.legacy_5='学院／研究机构\n团队／实验室';
 const history=table({x:430,y:192,w:1112,h:222},[['起止时间','学校／工作单位','学位／专业／职务'],...[[12,13,14],[15,16,17],[18,19,20]].map(r=>r.map(i=>f['legacy_'+i]))],{tableTitle:f.legacy_11,profileHistory:true,bandTitle:true,frame:true,fontPt:14,cellPaddingPt:2,fixedFont:true});
 const details=table({x:430,y:430,w:1112,h:388},[['','']],{sectionedTable:true,role:'profile-details',fontPt:14});
 details.parts=[tablePart(f.legacy_21,[[f.legacy_22,f.legacy_25],[f.legacy_23,f.legacy_26],[f.legacy_24,f.legacy_27]]),tablePart(f.legacy_28,[[f.legacy_29,f.legacy_32,f.legacy_35],[f.legacy_30,f.legacy_33,f.legacy_36],[f.legacy_31,f.legacy_34,f.legacy_37]])];
 details.parts.forEach(p=>Object.assign(p,{fontPt:14,cellPaddingPt:2,fixedFont:true}));
 s.modules=[history,details];return s;
}

// Preserve page identity, metadata and authored table values while repairing these layouts.
export function restoreEditablePage(s,kind){
 const next=kind==='profile'?profilePage():summaryPage(),old=clone(s),mods=s.modules||[];
 if(kind==='profile'){
  for(let i=3;i<=10;i++)if(s['legacy_'+i]!==undefined)next['legacy_'+i]=s['legacy_'+i];
  if(s.referencePortrait)next.referencePortrait=s.referencePortrait;
  const identity=mods.find(m=>m.type==='text'&&m.x<400)?.parts[0];
  if(identity&&identity.title!=='作者姓名')next.legacy_3=identity.title;
  const history=mods.find(m=>m.type==='table'&&m.profileHistory);
  if(history){const rows=clone(history.rows),spacers=rows.every(r=>r.length===5&&r[1]===''&&r[3]==='');next.modules[0].rows=spacers?rows.map(r=>r.filter((_,i)=>i%2===0)):rows;for(const key of ['fontPt','fixedFont','cellRich','cellParagraphs','cellLineSpacing','cellFontSizes'])if(history[key]!==undefined){const value=clone(history[key]);next.modules[0][key]=spacers&&key.startsWith('cell')?Object.fromEntries(Object.entries(value).flatMap(([cell,v])=>{const [r,c]=cell.split(',').map(Number);return c%2===0?[[r+','+c/2,v]]:[];})):value;}}
  const grouped=mods.find(m=>m.type==='table'&&m.sectionedTable);if(grouped)next.modules[1].parts=clone(grouped.parts);
  const academic=mods.find(m=>m.type==='text'&&m.parts.length===2&&m.x>400),research=mods.find(m=>m.type==='table'&&m.borderless);
  if(academic){const lines=academic.parts.map(p=>p.text.split('\n'));next.modules[1].parts[0].rows=[academic.parts.map(p=>p.title),...Array.from({length:Math.max(...lines.map(l=>l.length))},(_,i)=>lines.map(l=>l[i]||''))];}
  if(research)next.modules[1].parts[1].rows=clone(research.rows);
 }else{
  const cards=mods.find(m=>m.type==='text'&&m.style==='cards');if(cards?.parts.length){next.modules[0].parts=clone(cards.parts).map(p=>({...p,lineSpacing:{...p.lineSpacing,text:p.lineSpacing?.text??1.45}}));next.modules[0].columns=cards.parts.length>3?2:1;}
  const plan=mods.find(m=>m.type==='table');if(plan)next.modules[1].rows=clone(plan.rows);
 }
 Object.assign(s,next);for(const key of ['id','section','group','chapterId','chapterMode','footer','source','sourceUrl','notes'])if(old[key]!==undefined)s[key]=old[key];
 if(kind!=='profile'&&old.lead)s.lead=old.lead;
 if(old.rich)s.rich=old.rich;if(old.paragraphs)s.paragraphs=old.paragraphs;
 delete s.referenceLayout;return s;
}
