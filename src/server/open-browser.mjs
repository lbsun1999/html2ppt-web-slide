import {spawn} from 'node:child_process';
export function openBrowser(url){
 const command=process.platform==='win32'?'explorer.exe':process.platform==='darwin'?'open':'xdg-open';
 const child=spawn(command,[url],{windowsHide:true,stdio:'ignore'});child.on('error',()=>console.log('请在浏览器访问：'+url));child.unref();
}
