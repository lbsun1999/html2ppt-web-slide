import test from 'node:test';
import assert from 'node:assert/strict';
import {alignToGuide,distributeEven,radialLayout,makeRadialGroup} from '../src/advanced-alignment.js';

test('guide move and stretch preserve the fixed edge',()=>{
 assert.deepEqual(alignToGuide({x:20,y:10,w:100,h:50},'v-move','center',200),{x:150,y:10,w:100,h:50});
 assert.deepEqual(alignToGuide({x:20,y:10,w:100,h:50},'v-stretch','left',40),{x:40,y:10,w:80,h:50});
});

test('distribution fixes the outer edges and equalizes inner gaps',()=>{
 const two=distributeEven([{id:'a',x:0,y:0,w:100,h:10},{id:'b',x:400,y:0,w:80,h:10}],'x');
 assert.deepEqual(two.map(r=>r.x),[0,400]);
 const three=distributeEven([{id:'a',x:0,y:0,w:100,h:10},{id:'b',x:150,y:0,w:80,h:10},{id:'c',x:500,y:0,w:60,h:10}],'x');
 assert.deepEqual(three.map(r=>r.x),[0,260,500]);
});

test('radial result becomes one editable container',()=>{
 const items=radialLayout([{id:'a',x:0,y:0,w:40,h:20}],{count:4,radius:100,start:0,end:360,center:{x:200,y:200}});
 const group=makeRadialGroup(items,'g');
 assert.equal(group.type,'group');assert.equal(group.items.length,4);assert.ok(group.w>200);assert.ok(group.h>180);
});
