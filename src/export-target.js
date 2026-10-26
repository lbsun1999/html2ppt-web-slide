export async function chooseExportTarget(kind,name){
 if(typeof window.showSaveFilePicker!=='function')return null;
 try{return await window.showSaveFilePicker({suggestedName:name,excludeAcceptAllOption:true,types:[{description:kind==='pdf'?'PDF演示文稿':'PowerPoint演示文稿',accept:{[kind==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.presentationml.presentation']:['.'+kind]}}]});}catch(error){if(error.name==='AbortError')return false;throw error;}
}
export async function writeExport(handle,blob){let stream;try{stream=await handle.createWritable();await stream.write(blob);await stream.close();}catch(error){try{await stream?.abort();}catch{}throw Error('导出文件写入失败：'+error.message+'。请检查所选目录权限或更换位置。');}}
