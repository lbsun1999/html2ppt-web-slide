import test from 'node:test';
import assert from 'node:assert/strict';
import {alignToGuide,distributeEven,radialCenter,radialLayout,radialGroupEdit,makeRadialGroup} from '../src/advanced-alignment.js';

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
 const center={x:200,y:200},options={count:4,radius:100,start:0,end:360,center};
 const items=radialLayout([{id:'a',x:0,y:0,w:40,h:20}],options);
 const group=makeRadialGroup(items,'g',options);
 assert.equal(group.type,'group');assert.equal(group.items.length,4);assert.ok(group.w>200);assert.ok(group.h>180);
 assert.equal(new Set(group.items.map(item=>item.id)).size,4,'cloned ring members keep distinct identities');
 const edit=radialGroupEdit(group);
 assert.equal(edit.items.length,4);assert.deepEqual(edit.items.map(item=>item.parts),items.map(item=>item.parts));
 assert.deepEqual(edit.options.center,center);assert.equal(Math.round(edit.options.radius),100);assert.deepEqual([edit.options.start,edit.options.end],[0,360]);
 const relaid=radialLayout(edit.items,{...edit.options,radius:140});
 const updated=makeRadialGroup(relaid,group.id,{...edit.options,radius:140});
 assert.equal(updated.id,group.id);assert.equal(updated.items.length,4);assert.ok(updated.items.every(item=>item.type!=='group'),'re-editing rearranges original members instead of nesting or cloning the whole group');
});
