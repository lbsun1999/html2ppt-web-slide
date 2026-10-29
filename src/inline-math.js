import {formulaHTML} from './formula.js';

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export function inlineMathHTML(html,{source=false}={}){
 return String(html).replace(/\$([^$\n]+)\$/g,(_,latex)=>source?`<span class="inline-latex-source" data-text>$${esc(latex)}$</span>`:`<span class="inline-math" data-inline-latex="${esc(latex)}" data-raster>${formulaHTML(latex)}</span>`);
}
