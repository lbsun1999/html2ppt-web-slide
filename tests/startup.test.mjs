import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {supportedNode,serviceState} from '../scripts/start.mjs';
import {localWorkbenchURL} from '../src/local-workbench.js';
import {svgDataURL,decodeSVGData,svgRatio} from '../src/svg.js';
import {createProject,validateProject} from '../src/model.js';
test('SVG logo/media data retains vector source and rejects active/external resources',()=>{
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="#A31418"/></svg>',data=svgDataURL(svg);assert.equal(decodeSVGData(data),svg);assert.equal(svgRatio(data),2);const p=createProject();p.theme.logo=data;assert.doesNotThrow(()=>validateProject(p));
 for(const bad of ['<svg><script>alert(1)</script></svg>','<svg><image href="https://example.com/a.png"/></svg>'])assert.throws(()=>svgDataURL(bad));
});
test('Windows launcher uses ASCII and real CRLF, including in archive-ready bytes',async()=>{
 const bytes=await fs.readFile('启动.cmd'),text=bytes.toString('ascii');assert.ok([...bytes].every(b=>b<128));assert.ok(text.includes('\r\n'));assert.equal(text.replace(/\r\n/g,'').includes('\n'),false);assert.ok(text.includes('scripts\\start.mjs'));assert.ok(text.includes('pause'));
 assert.match(await fs.readFile('.gitattributes','utf8'),/^\*\.cmd -text(?:\s+whitespace=cr-at-eol)?$/m);
});
test('startup version check enforces Node 20.10+',()=>{for(const v of ['18.20.0','20.9.0'])assert.equal(supportedNode(v),false);for(const v of ['20.10.0','22.0.0','24.15.0'])assert.equal(supportedNode(v),true);});
test('offline document transfer accepts only loopback HTTP origins',()=>{
 assert.equal(localWorkbenchURL('http://localhost:4320'),'http://localhost:4320');assert.equal(localWorkbenchURL('http://127.0.0.1:4317/'),'http://127.0.0.1:4317');
 for(const value of ['https://example.com','http://example.com','http://127.0.0.1.evil.test','http://user:pass@localhost:4317','http://localhost:4317/import','http://localhost:4317/?foo=bar'])assert.throws(()=>localWorkbenchURL(value));
});
test('startup reuses only an identified Web Slide service',async()=>{
 let app='other';const server=http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,app}));});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 try{assert.equal(await serviceState(url),'occupied');app='html2ppt-web-slide';assert.equal(await serviceState(url),'ready');}finally{await new Promise(resolve=>server.close(resolve));}assert.equal(await serviceState(url),'offline');
});
