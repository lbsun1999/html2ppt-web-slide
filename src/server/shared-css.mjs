import fs from 'node:fs/promises';
import path from 'node:path';
export async function sharedCSS(root=process.cwd()){
 const katexDir=path.join(root,'node_modules','katex','dist');let css=await fs.readFile(path.join(katexDir,'katex.min.css'),'utf8');
 const sources=[...css.matchAll(/src:([^;}]+)/g)];
 for(const match of sources){const file=match[1].match(/url\((?:["']?)(fonts\/[^)"']+\.woff2)(?:["']?)\)/)?.[1];if(file){const data=await fs.readFile(path.join(katexDir,file));css=css.replace(match[0],`src:url(data:font/woff2;base64,${data.toString('base64')}) format("woff2")`);}}
 return (await Promise.all(['styles.css','text-styles.css','viewer.css','reference-layouts.css'].map(name=>fs.readFile(path.join(root,name),'utf8')))).join('\n')+'\n'+css;
}
