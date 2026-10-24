import katex from 'katex';
export function formulaHTML(latex){return katex.renderToString(String(latex||''),{displayMode:true,output:'html',throwOnError:true,trust:false,strict:'ignore',maxExpand:1000});}
export function checkFormula(latex){if(!String(latex).trim())throw Error('请填写 LaTeX 公式。');formulaHTML(latex);return true;}
