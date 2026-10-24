import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const name of ['ect','test-results']){
 const target=path.resolve(root,name);
 if(path.dirname(target)!==root)throw Error('Cleanup target must be a direct project child.');
 let info;try{info=await fs.lstat(target);}catch(error){if(error.code==='ENOENT')continue;throw error;}
 if(info.isSymbolicLink()||!info.isDirectory())throw Error('Refusing non-directory or symbolic cleanup target: '+name);
 const actual=await fs.realpath(target),relative=path.relative(root,actual);
 if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Cleanup target resolves outside the project.');
 await fs.rm(target,{recursive:true,force:true,maxRetries:2,retryDelay:100});
 console.log('Removed generated files: '+name);
}
