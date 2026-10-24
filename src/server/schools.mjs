import fs from 'node:fs/promises';
import path from 'node:path';
export async function schoolOptions(school='ustb',root=process.cwd()){
 const folder=path.join(root,'assets',school==='ustb'?'北京科技大学':'丽水学院');
 let dimensions={};try{dimensions=JSON.parse(await fs.readFile(path.join(folder,'manifest.json'),'utf8'));}catch{}
 const assets={};for(const name of await fs.readdir(folder)){if(!/\.(png|jpg)$/i.test(name))continue;const bytes=await fs.readFile(path.join(folder,name)),png=name.endsWith('.png'),info=dimensions[name]||(png?{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}:{width:1600,height:900});assets[name]={src:'data:image/'+(png?'png':'jpeg')+';base64,'+bytes.toString('base64'),...info};}
 if(school==='lishui')for(const [alias,name] of Object.entries({'1952Beike.jpg':'school-origin.jpg','1960Beike.png':'school-rebuild.jpg','1988Beike.png':'school-campus.jpg','2008Beike.png':'school-library.jpg','example-campus.png':'school-campus.jpg','example-motto.png':'school-library.jpg'}))assets[alias]={...assets[name],name};
 return {school,logo:assets['校徽独立.png'].src,wordmark:assets['校名校徽.png'].src,assets};
}
