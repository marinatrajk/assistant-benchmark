import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { createApp } from '../src/server.js';

async function waitDone(app, ids) {
  for(let i=0;i<150;i++) {
    if(ids.every(id=>!['queued','running'].includes(app.store.run(id).status)))return;
    await new Promise(r=>setTimeout(r,20));
  }
  throw new Error('Timed out');
}
test('Claude profiles share a memory-only key and unavailable presets reject runs',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'paces-profiles-')),app=await createApp({dataDir:dir,port:0});
  try{
    const state=await(await fetch(app.url+'/api/state')).json();
    const post=(path,value)=>fetch(app.url+path,{method:'POST',headers:{'X-Relay-Token':state.token},body:JSON.stringify(value)});
    const fable=state.profiles.find(p=>p.id==='claude-fable-5-1');
    assert.equal((await post('/api/profiles',{...fable,apiKey:'TEST-ANTHROPIC-SECRET'})).status,200);
    const updated=await(await fetch(app.url+'/api/state')).json();
    assert(updated.profiles.find(p=>p.id==='claude-opus-5-5').hasKey);
    assert(!JSON.stringify(app.store.setting('profiles')).includes('TEST-ANTHROPIC-SECRET'));
    assert(!(await(await fetch(app.url+'/api/export')).text()).includes('TEST-ANTHROPIC-SECRET'));
    const blocked=await post('/api/batch',{profiles:['gemini-4-argon'],tasks:[state.tasks[0].id],repeats:1});
    assert.equal(blocked.status,400);
    assert.match((await blocked.json()).error,/API model ID/);
    const {baseUrl,...profile}=fable;
    await post('/api/profiles',{...profile,baseUrl:'http://127.0.0.1:9999/v1'});
    const moved=await(await fetch(app.url+'/api/state')).json();
    assert.equal(moved.profiles.find(p=>p.id===fable.id).hasKey,false);
  }finally{await app.close();await rm(dir,{recursive:true,force:true});}
});
test('HTTP boundary blocks foreign origins, unknown hosts, and unauthenticated writes',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'relay-http-')),app=await createApp({dataDir:dir,port:0});
  try {
    assert.equal((await fetch(app.url+'/api/state',{headers:{Origin:'https://evil.example'}})).status,403);
    const wrongHost = await new Promise((resolve,reject)=>{const req=request(app.url+'/api/state',{headers:{Host:'evil.example'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);req.end();});
    assert.equal(wrongHost,403);
    assert.equal((await fetch(app.url+'/api/memory',{method:'POST',body:'{}'})).status,403);
    const state=await (await fetch(app.url+'/api/state')).json();
    const result=await fetch(app.url+'/api/memory',{method:'POST',headers:{'X-Relay-Token':state.token},body:JSON.stringify({content:'test'})});
    assert.equal(result.status,200);
    assert.equal((await fetch(app.url+'/.env')).status,404);
  }finally{await app.close();await rm(dir,{recursive:true,force:true});}
});
test('batch matrix isolates memory per run, persists checks, supports review, and never exports keys',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'relay-batch-'));
  const app=await createApp({dataDir:dir,port:0,modelCall:async({input})=>{
    const results=input.filter(i=>i.type==='function_call_output');
    if(!results.length)return {output:[{type:'function_call',call_id:'one',name:'memory_search',arguments:'{"query":""}'}]};
    if(results.length===1){assert.equal(JSON.parse(results[0].output[0].text).length,1);return {output:[{type:'function_call',call_id:'two',name:'memory_save',arguments:'{"content":"new fact"}'}]};}
    return {output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'done'}]}],usage:{input_tokens:2,output_tokens:1}};
  }});
  try {
    const state=await(await fetch(app.url+'/api/state')).json();
    const post=async(path,value)=>{const r=await fetch(app.url+path,{method:'POST',headers:{'X-Relay-Token':state.token},body:JSON.stringify(value)});const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));return data;};
    const base={api:'responses',baseUrl:'https://api.openai.com/v1',model:'fake'};
    await post('/api/profiles',{...base,id:'a',label:'A',apiKey:'SECRET-NEVER-EXPORT'});
    await post('/api/profiles',{...base,id:'b',label:'B',apiKey:'SECRET-NEVER-EXPORT'});
    await post('/api/tasks',{id:'test',name:'Test',prompt:'do it',capabilities:{browser:false,computer:false,skills:false,memory:true},seedMemory:['one seed'],checks:[{type:'memory_contains',value:'new fact'}]});
    const batch=await post('/api/batch',{profiles:['a','b'],tasks:['test'],repeats:2});
    assert.equal(batch.ids.length,4);await waitDone(app,batch.ids);
    assert.equal(app.store.memories().length,0);
    for(const id of batch.ids){assert.equal(app.store.run(id).status,'completed');assert.equal(JSON.parse(app.store.run(id).metadata).checks[0].passed,true);}
    await post('/api/review',{id:batch.ids[0],score:4,notes:'reviewed'});
    const exported=await(await fetch(app.url+'/api/export')).text();
    assert(!exported.includes('SECRET-NEVER-EXPORT'));assert(exported.includes('reviewed'));
  }finally{await app.close();await rm(dir,{recursive:true,force:true});}
});
