import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SAFE,moduleOf,createProject,validateProject} from '../src/model.js';
import {findSpace,planChange,anchoredResize,intersects} from '../src/layout.js';
test('largest blank rectangle fills a new page and excludes occupied space',()=>{
 const a=findSpace([],20);assert.ok(a.w>=1400&&a.h>=500);
 const occupied=moduleOf('text',{x:58,y:280,w:600,h:530});const b=findSpace([occupied],20);assert.ok(b);assert.ok(!intersects(occupied,b));
 assert.equal(findSpace([moduleOf('text',{...SAFE})],20),null);
});
test('expanding a module pushes a neighbour without mutating input',()=>{
 const a={id:'a',x:58,y:280,w:300,h:180},b={id:'b',x:382,y:280,w:300,h:180};const p=planChange([a,b],'a',{x:58,y:280,w:400,h:180},20);assert.ok(p);assert.ok(!intersects(p[0],p[1]));assert.equal(b.x,382);
});
test('blocked resize rejects the whole plan and preserves anchor geometry',()=>{
 const a={id:'a',...SAFE};assert.equal(planChange([a],'a',{...SAFE,w:1500},20),null);const r=anchoredResize({x:100,y:100,w:200,h:200},20,40,'br');assert.deepEqual(r,{x:80,y:60,w:220,h:240});
});
test('project checks reject external media and accept default model',()=>{
 const p=createProject({withSections:false});assert.equal(validateProject(p),p);p.slides[1].modules[0].parts[0].asset={src:'https://example.com/tracker.png'};assert.throws(()=>validateProject(p),/媒体/);
});

test('center anchor preserves both center coordinates when growing or shrinking',()=>{
 const m={x:300,y:350,w:400,h:240};
 for(const [dx,dy]of [[40,0],[0,20],[40,60],[-20,-40]]){
  const r=anchoredResize(m,dx,dy,'center');
  assert.equal(r.x+r.w/2,m.x+m.w/2);assert.equal(r.y+r.h/2,m.y+m.h/2);
  assert.equal(r.w,m.w+dx);assert.equal(r.h,m.h+dy);
 }
});
test('compact whitespace is allowed while true overlap stays blocked',()=>{
 const a={id:'a',type:'text',textBox:true,x:58,y:256,w:500,h:60};
 const b={id:'b',type:'text',textBox:true,x:566,y:256,w:500,h:60};
 assert.equal(intersects(a,b),false);assert.equal(intersects(a,{...b,x:550}),true);
 const space=findSpace([{id:'top',x:58,y:256,w:1484,h:440}],8,{...SAFE,h:488},{type:'text',textBox:true});
 assert.ok(space);assert.ok(space.h>=40);assert.equal(intersects(space,{x:58,y:256,w:1484,h:440}),false);
});
