import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/server.js';

process.env.BROWSER_HEADLESS='true';
test('real browser agent loop completes fixture form, uses fresh refs, captures screenshots, and passes checks',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'relay-browser-'));
  let round=0, stale;
  const call=(name,args)=>({output:[{type:'function_call',call_id:`c${round}`,name,arguments:JSON.stringify(args)}],usage:{input_tokens:10,output_tokens:5}});
  const app=await createApp({dataDir:dir,port:0,modelCall:async({input})=>{
    round++;
    const user=input.find(i=>i.role==='user').content;
    const results=input.filter(i=>i.type==='function_call_output');
    const last=results.at(-1);
    const data=last?JSON.parse(last.output[0].text):null;
    const element=(name)=>data.elements.find(e=>e.name===name).ref;
    if(round===1)return call('browser_navigate',{url:user.match(/http:\/\/\S+/)[0].replace(/\.$/,'')});
    if(round===2){stale=element('Name');return call('browser_fill',{ref:stale,text:'Ada Lovelace'});}
    if(round===3)return call('browser_fill',{ref:stale,text:'WRONG'}); // Expected stale-ref rejection.
    if(round===4){assert.match(data.error,/Stale reference/);return call('browser_snapshot',{});}
    if(round===5)return call('browser_fill',{ref:element('Email'),text:'ada@example.com'});
    if(round===6)return call('browser_select',{ref:element('Topic'),value:'Research'});
    if(round===7)return call('browser_click',{ref:element('Send request')});
    assert(data.text.includes('RELAY-1843'));
    return {output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'Confirmation: RELAY-1843'}]}],usage:{input_tokens:10,output_tokens:5}};
  }});
  try{
    const state=await(await fetch(app.url+'/api/state')).json();
    const post=async(path,data)=>{const r=await fetch(app.url+path,{method:'POST',headers:{'X-Relay-Token':state.token},body:JSON.stringify(data)});const body=await r.json();assert.equal(r.status,200,JSON.stringify(body));return body;};
    await post('/api/profiles',{id:'scripted',label:'Scripted test',model:'test',api:'responses',baseUrl:'https://api.openai.com/v1',apiKey:'fake-key'});
    const {ids}=await post('/api/batch',{profiles:['scripted'],tasks:['browser-form'],repeats:1});
    for(let i=0;i<600;i++){
      if(!['queued','running'].includes(app.store.run(ids[0]).status))break;
      await new Promise(r=>setTimeout(r,100));
    }
    const run=app.store.run(ids[0]),metadata=JSON.parse(run.metadata);
    assert.equal(run.status,'completed',JSON.stringify(app.store.events(run.id)));
    assert.equal(metadata.metrics.toolErrors,1);
    assert(metadata.checks.every(c=>c.passed));
    const screenshot=app.store.events(run.id).find(e=>e.data.screenshot).data.screenshot;
    assert.equal((await fetch(app.url+screenshot)).status,200);
  }finally{await app.close();await rm(dir,{recursive:true,force:true});}
});
