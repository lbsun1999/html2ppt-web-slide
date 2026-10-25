import layouts from './reference-layouts.json' with {type:'json'};
import {richHTML,textStyle} from './rich-text.js';
let identity;
export function profileCardHTML(s,edit,themeStyle){
 if(!s.profileIdentity)return '';
 if(!identity){const t=document.createElement('template');t.innerHTML=layouts.profile.html;identity=t.content.querySelector('.profile-identity');}
 const el=identity.cloneNode(true);
 for(const n of el.querySelectorAll('[data-slide-field]')){const key=n.dataset.slideField;if(s[key]!==undefined)n.innerHTML=richHTML(s[key],s.rich?.[key],false,!!s.paragraphs?.[key],undefined,s.paragraphs?.[key]);if(edit){n.contentEditable='true';n.spellcheck=false;}const style=textStyle(s,key).match(/style="([^"]*)"/)?.[1];if(style)n.style.cssText+=';'+style;}
 const photo=el.querySelector('.profile-portrait');photo.dataset.referencePortrait='';if(s.referencePortrait)photo.src=s.referencePortrait;
 const r=s.profileIdentity;
 return `<div class="profile-fixed legacy-page" data-fixed-region="profile" style="${themeStyle};position:absolute;left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px">${el.outerHTML}</div>`;
}
