import fs from 'node:fs/promises';
import {appendFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {openBrowser} from '../src/server/open-browser.mjs';
import {browserPaths} from '../src/server/browser-paths.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),APP='html2ppt-web-slide';
export const supportedNode=version=>{const [major,minor]=version.replace(/^v/,'').split('.').map(Number);return major>20||major===20&&minor>=10;};
const exists=async file=>{try{await fs.access(file);return true;}catch{return false;}};
export async function serviceState(url){
 try{const response=await fetch(url+'/health',{signal:AbortSignal.timeout(1200)});let body;try{body=await response.json();}catch{}return response.ok&&body?.ok&&body.app===APP?'ready':'occupied';}catch{return 'offline';}
}
async function run(command,args,log){return new Promise((resolve,reject)=>{const child=spawn(command,args,{cwd:ROOT,windowsHide:true,stdio:['inherit','pipe','pipe']});child.stdout.on('data',chunk=>log(chunk.toString(),false));child.stderr.on('data',chunk=>log(chunk.toString(),false));child.once('error',reject);child.once('exit',code=>resolve(code??1));});}
async function main(){
 await fs.mkdir(path.join(ROOT,'ect'),{recursive:true});const logFile=path.join(ROOT,'ect/startup.log');await fs.appendFile(logFile,'\nWeb Slide startup '+new Date().toISOString()+'\n');
 const log=(message,newline=true)=>{const text=message+(newline?'\n':'');process.stdout.write(text);appendFileSync(logFile,text);};
 try{
  log('Web Slide 启动检查 · 日志：'+logFile);
  if(!supportedNode(process.versions.node))throw Error('需要Node.js 20.10或更新版本；当前为'+process.version+'。安装后重新打开终端。');
  const port=Number(process.env.PORT||4317);if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT必须为1–65535之间的整数。');const url='http://127.0.0.1:'+port;
  const config=JSON.parse(await fs.readFile(path.join(ROOT,'package.json'),'utf8')),require=createRequire(path.join(ROOT,'package.json'));
  const missing=Object.keys(config.dependencies).filter(name=>{try{require.resolve(name);return false;}catch{return true;}});
  if(missing.length){
   if(process.argv.includes('--check'))throw Error('依赖未就绪：'+missing.join('、')+'。请在此目录执行npm.cmd ci。');
   log('首次运行或依赖不完整，正在恢复package-lock.json锁定的依赖……');
   const candidates=[process.env.npm_execpath,path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js')].filter(Boolean);let npm;
   for(const file of candidates)if(await exists(file)){npm=file;break;}
   if(!npm)throw Error('未找到npm，请安装包含npm的官方Node.js，或在此目录执行npm.cmd ci后重试。');
   if(await run(process.execPath,[npm,'ci','--no-fund','--no-audit'],log))throw Error('依赖安装失败。请查看本日志中的npm错误并检查网络。');
  }
  let browser;for(const file of browserPaths())if(await exists(file)){browser=file;break;}
  if(!browser){try{browser=(await import('playwright')).chromium.executablePath();if(!await exists(browser))browser=null;}catch{}}
  if(!browser)throw Error('未找到Chrome／Edge。请安装其中之一，或运行npx playwright install chromium。');
  log('Node '+process.versions.node+' · 依赖就绪 · 浏览器：'+browser);
  if(process.argv.includes('--check')){log('检查通过。执行node scripts/start.mjs --open即可启动。');return 0;}
  const state=await serviceState(url);
  if(state==='ready'){log('已有Web Slide服务，直接复用：'+url);if(process.argv.includes('--open')&&!process.argv.includes('--no-open'))openBrowser(url);return 0;}
  if(state==='occupied')throw Error('端口'+port+'已有其他服务或旧版服务。请关闭原服务，或设置PORT后重新启动。');
  const child=spawn(process.execPath,['server.mjs'],{cwd:ROOT,windowsHide:true,stdio:['inherit','pipe','pipe']});let ended=false,childError;
  child.stdout.on('data',chunk=>log(chunk.toString(),false));child.stderr.on('data',chunk=>log(chunk.toString(),false));
  const done=new Promise(resolve=>{child.once('error',error=>{childError=error;ended=true;resolve(1);});child.once('exit',code=>{ended=true;resolve(code??1);});});
  const stop=()=>{if(!ended)child.kill('SIGINT');};process.once('SIGINT',stop);process.once('SIGTERM',stop);
  try{
   let ready=false;for(let i=0;i<100&&!ended;i++){if(await serviceState(url)==='ready'){ready=true;break;}await new Promise(resolve=>setTimeout(resolve,200));}
   if(!ready){stop();await done;throw Error(childError?.message||'服务未能启动，请查看上方错误和端口状态。');}
   log('服务已就绪。请保持此窗口开启；浏览器访问 '+url);
   if(process.argv.includes('--open')&&!process.argv.includes('--no-open'))openBrowser(url);
   return await done;
  }finally{process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);}
 }catch(error){log('\n启动失败：'+error.message+'\n详细日志：'+logFile+'\n也可在项目目录执行node scripts/start.mjs --check检查环境。');return 1;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))process.exitCode=await main();
