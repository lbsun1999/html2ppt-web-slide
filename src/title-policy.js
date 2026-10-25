// One title policy for the HTML renderer, layout audit and native PPTX export.
export const TITLE_SELECTOR='h1,h2,h3,h4,h5,h6,.part-title-text,.part-subheading,.plain-group-title,.table-title,.figure-title,.toc-title,.timeline-year [data-text],.timeline-event-title,.profile-name,[data-field="title"],[data-module-field="groupTitle"],[data-slide-field="title"]';
export const MANUAL_BREAK_SELECTOR=TITLE_SELECTOR+',.profile-identity [data-text]';
export const titleCSS=MANUAL_BREAK_SELECTOR.split(',').map(s=>'.slide '+s).join(',')+'{white-space:pre!important;overflow-wrap:normal!important;word-break:normal!important}\n.cover-band h1,.profile-identity [data-text]{max-width:100%;min-width:0}';

export function titleErrors(slide){
 return [...slide.querySelectorAll(MANUAL_BREAK_SELECTOR)].filter(el=>el.clientWidth>0&&el.scrollWidth>el.clientWidth+2).map(el=>`${el.matches(TITLE_SELECTOR)?'标题':'身份信息'}不允许自动换行：${el.innerText.trim().slice(0,36)}。请精简、加宽区域或按语义手动分行。`);
}
