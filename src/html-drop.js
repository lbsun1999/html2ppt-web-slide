export async function droppedHTML(dataTransfer){
 for(const item of [...(dataTransfer?.items||[])])if(typeof item.getAsFileSystemHandle==='function')try{const handle=await item.getAsFileSystemHandle();if(handle?.kind==='file'&&/\.html?$/i.test(handle.name))return {handle,file:await handle.getFile()};if(handle?.kind==='directory'){const fileHandle=await handle.getFileHandle('template.html');return {handle:fileHandle,file:await fileHandle.getFile()};}}catch{}
 const file=[...(dataTransfer?.files||[])].find(file=>/\.html?$/i.test(file.name));return file?{file,handle:null}:null;
}
