import test from 'node:test';
import assert from 'node:assert/strict';
import {droppedHTML} from '../src/html-drop.js';

test('dropping a template package directory opens its template.html',async()=>{
 const file={name:'template.html'},fileHandle={kind:'file',name:file.name,getFile:async()=>file};
 const directory={kind:'directory',name:'new-template',getFileHandle:async name=>{assert.equal(name,'template.html');return fileHandle;}};
 const result=await droppedHTML({items:[{getAsFileSystemHandle:async()=>directory}],files:[]});
 assert.equal(result.file,file);assert.equal(result.handle,fileHandle);
});

test('single HTML handles and legacy file drops remain supported',async()=>{
 const file={name:'slides.html'},handle={kind:'file',name:file.name,getFile:async()=>file};
 assert.deepEqual(await droppedHTML({items:[{getAsFileSystemHandle:async()=>handle}],files:[]}),{file,handle});
 const fallback={name:'fallback.htm'};assert.deepEqual(await droppedHTML({items:[],files:[{name:'image.png'},fallback]}),{file:fallback,handle:null});
});
