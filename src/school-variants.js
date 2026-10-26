// Both schools use the USTB master structure. Only school content and theme vary.
export function applyLishuiVariant(project,{logo,wordmark,assets={}}){
 const replace=value=>{if(typeof value==='string')return value.replaceAll('北京科技大学','丽水学院').replaceAll('原北科模板','共同母版').replaceAll('原北科','共同母版').replaceAll('北科','丽院').replaceAll('科技蓝','主题青色').replaceAll('钢铁红','主题青色');if(Array.isArray(value))return value.map(replace);if(value&&typeof value==='object')for(const key of Object.keys(value))value[key]=replace(value[key]);return value;};
 replace(project);
 const oldPalette=new Set(['#005b94','#005894','#1766a9','#2ba3c0','#a31418']);
 const recolor=value=>{if(typeof value==='string')return oldPalette.has(value.toLowerCase())?'#0F6674':value;if(Array.isArray(value))return value.map(recolor);if(value&&typeof value==='object')for(const key of Object.keys(value))value[key]=recolor(value[key]);return value;};recolor(project);
 Object.assign(project.theme,{name:'丽水学院',primary:'#0F6674',secondary:'#0F6674',accent:'#0F6674',emphasis:'#0F6674',tint:'#EDF6F5',ink:'#000000',monochrome:true,logo,wordmark});
 project.title='丽水学院_WebSlide制作与演示指南';
 const color=project.slides.find(s=>s.title==='主题色彩与字号口径');if(color){color.lead='以校徽中的青色作为唯一主题色，配合深色文字与同色浅底，统一标题、表头和强调区域。';const text=color.modules.find(m=>m.type==='text');text.parts[0].text='标题、表头与重点线条统一使用主题青色，浅青底用于分组；不另设第二种强调色。';}
 const history=project.slides.find(s=>s.referenceLayout==='history'||s.modules.some(m=>m.type==='timeline'&&m.schoolHistory));
 if(history){const historyFields={title:'学校概况与办学沿革',lead:'从处州师范学堂到丽水学院，学校坚持“明德笃行”，在师范教育基础上拓展多学科办学，面向地方需求推进应用型人才培养与科研服务。',
  legacy_4:'1907年',legacy_5:'办学源流可追溯至1907年创办的处州师范学堂。以师范教育为起点，逐步形成服务地方教育发展的办学传统。',
  legacy_6:'1946年',legacy_7:'抗战胜利后，在云和重建浙江省处州师范学校。此后迁回丽水，在办学条件恢复中延续师范教育传统与人才培养。',
  legacy_8:'2004年',legacy_9:'经教育部批准，学校升格更名为丽水学院。在原有办学基础上拓展本科教育，逐步形成多学科协调发展的格局。',
  legacy_10:'新时代',legacy_11:'坚持应用型办学方向，立足丽水、面向区域发展需要。围绕人才培养与科研服务，推进学科建设与产教协同发展。',
  legacy_12:'师范薪火初传',legacy_13:'重建延续文脉',legacy_14:'升本拓展格局',legacy_15:'服务地方发展',
  referenceImages:['school-origin.jpg','school-rebuild.jpg','school-campus.jpg','school-library.jpg'].map(name=>assets[name]?.src||logo),
  source:'来源：丽水学院官网·学校概况与历史沿革；配图为校史／校园资料，非逐年实景',sourceUrl:'https://www.lsu.edu.cn/47/list.htm',
  notes:'文字依据丽水学院官网学校概况及历史沿革。首图官网标注为1906年的处州学堂，作为源流资料配图；第二图为1946年重建处州师范学校。后两图为现代校园及图书馆，不代表2004年或对应阶段的实景。全部照片来源见 assets/丽水学院/manifest.json。实际研究现状汇报请替换为领域文献、方法演进及研究差距。'};
 if(history.referenceLayout)Object.assign(history,historyFields);
 else{const m=history.modules.find(m=>m.type==='timeline'&&m.schoolHistory);for(const key of ['title','lead','source','sourceUrl','notes'])history[key]=historyFields[key];m.monochrome=true;const names=['school-origin.jpg','school-rebuild.jpg','school-campus.jpg','school-library.jpg'];m.parts.forEach((p,i)=>{if(i<4){p.year=historyFields['legacy_'+(4+i*2)];p.text=historyFields['legacy_'+(5+i*2)];p.title=historyFields['legacy_'+(12+i)];if(p.asset)p.asset={...p.asset,name:names[i],src:historyFields.referenceImages[i]};}});}}
 for(const s of project.slides)for(const m of s.modules)for(const part of m.parts){if(part.asset?.name==='example-campus.png')part.asset.name='school-campus.jpg';if(part.asset?.name==='example-motto.png')part.asset.name='school-library.jpg';const replacement=assets[part.asset?.name];if(replacement&&part.asset){part.asset.src=replacement.src;if(replacement.width&&replacement.height)part.asset.naturalRatio=replacement.width/replacement.height;}}
 const main=project.slides.find(s=>s.title==='主图与关键信息');if(main){const part=main.modules.find(m=>m.type==='media').parts[0];part.caption='图 4　丽水学院校园风光';part.note='学校官网校园风光资料；图片独立排布，说明不覆盖画面。';main.source='校园图像：丽水学院官网·校园风光';main.sourceUrl='https://www.lsu.edu.cn/2017/0406/c51a216866/page.htm';}
 const pair=project.slides.find(s=>s.title==='双图对照与口径检查');if(pair){const media=pair.modules.find(m=>m.type==='media');media.parts[0].caption='图 5　校园景观';media.parts[1].caption='图 6　图书馆';pair.source='校园景观与图书馆：丽水学院官网；图像用于等高排版示范';pair.sourceUrl='https://www.lsu.edu.cn/51/list.htm';}
 return project;
}
export function schoolAssetsFromProject(project){
 const assets={};for(const s of project.slides)for(const m of s.modules)for(const p of m.parts)if(p.asset?.name)assets[p.asset.name]={name:p.asset.name,src:p.asset.src,width:(p.asset.naturalRatio||p.asset.ratio||16/9)*900,height:900};
 const history=project.slides.find(s=>s.referenceLayout==='history');if(history?.referenceImages)['school-origin.jpg','school-rebuild.jpg','school-campus.jpg','school-library.jpg'].forEach((name,i)=>{if(history.referenceImages[i]&&!assets[name])assets[name]={name,src:history.referenceImages[i],width:1600,height:900};});
 if(project.theme.name.includes('丽水'))for(const [alias,name] of Object.entries({'1952Beike.jpg':'school-origin.jpg','1960Beike.png':'school-rebuild.jpg','1988Beike.png':'school-campus.jpg','2008Beike.png':'school-library.jpg','example-campus.png':'school-campus.jpg','example-motto.png':'school-library.jpg'}))if(assets[name])assets[alias]=assets[name];return assets;
}
