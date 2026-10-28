import fs from 'node:fs/promises';import {spawnSync} from 'node:child_process';
try{const res=await fetch('http://127.0.0.1:4317/health',{signal:AbortSignal.timeout(2000)});if((await res.json()).app!=='html2ppt-web-slide')throw Error();}catch{throw Error('请先运行启动.cmd，保持127.0.0.1:4317的本地工作台服务开启，再执行自检。');}
await fs.mkdir('ect/self-check',{recursive:true});
const files=(await fs.readdir('tests')).filter(n=>n.endsWith('.mjs')&&!n.endsWith('.test.mjs')).sort(),results=[];
for(const args of [['--test','tests/layout.test.mjs','tests/outline.test.mjs','tests/table-text.test.mjs','tests/startup.test.mjs','tests/html-drop.test.mjs'],['scripts/prepare-example.mjs','--lishui-only'],...files.map(file=>['tests/'+file])]){
 const name=args[0]==='--test'?'unit-tests':args[0].split('/').pop(),r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,timeout:240000,maxBuffer:8*1024*1024});await fs.writeFile('ect/self-check/'+name+'.log',(r.stdout||'')+(r.stderr||''));results.push({name,ok:r.status===0});console.log((r.status===0?'PASS ':'FAIL ')+name);
}
await fs.writeFile('ect/self-check/results.json',JSON.stringify(results,null,2));if(results.some(r=>!r.ok))process.exitCode=1;console.log('详细记录：ect/self-check/');
