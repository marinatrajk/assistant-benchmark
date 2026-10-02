import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../src/store.js';
import { Skills } from '../src/skills.js';
import { createTools } from '../src/tools.js';
import { runAgent } from '../src/agent.js';
import { evaluate, csv } from '../src/evaluate.js';

const temp = () => mkdtemp(join(tmpdir(), 'relay-test-'));
test('provider continuation consumes rounds and only the terminal answer completes a run',async()=>{
  const dir=await temp(),store=new Store(':memory:'),session=store.createSession().id;
  try{
    for(const maxSteps of [1,2]){
      const runId=store.createRun(session);let round=0;
      await runAgent({runId,session,prompt:'continue',profile:{id:'fake'},capabilities:{},maxSteps,memory:store,store,skills:new Skills([]),browser:{close:async()=>{}},computer:{},dataDir:dir,signal:new AbortController().signal,emit:()=>{},fixtureState:new Set(),modelCall:async({input})=>{
        if(++round===1)return {continuation:true,output:[{type:'provider_message',provider:'anthropic',content:[{type:'thinking',thinking:'Still working.',signature:'signed'}]}]};
        assert(input.some(i=>i.provider==='anthropic'));
        return {output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'Done.'}]}]};
      }});
      assert.equal(store.run(runId).status,maxSteps===1?'limit':'completed');
      assert.equal(JSON.parse(store.run(runId).metadata).finalAnswer,maxSteps===1?'':'Done.');
    }
  }finally{store.close();await rm(dir,{recursive:true,force:true});}
});
test('memory survives restart, updates search index, and forget removes indexed content', async () => {
  const dir=await temp(); let store=new Store(join(dir,'test.sqlite'));
  try {
    const old=store.remember({content:'Prefers Python',pinned:true});
    assert.equal(store.memories('Python')[0].id,old.id);
    store.remember({id:old.id,content:'Prefers TypeScript'});
    assert.equal(store.memories('Python').length,0);
    store.close();store=new Store(join(dir,'test.sqlite'));
    assert.equal(store.memories('TypeScript').length,1);
    store.forget(old.id);assert.equal(store.memories('TypeScript').length,0);
    assert.doesNotThrow(()=>store.memories('" OR * : 👀'));
  } finally {store.close();await rm(dir,{recursive:true,force:true});}
});
test('skill discovery and reference reading reject traversal and symlink escapes', async()=>{
  const dir=await temp();
  try {
    await mkdir(join(dir,'skills','one'),{recursive:true});
    await writeFile(join(dir,'skills','one','SKILL.md'),'---\nname: One\ndescription: test\n---\nDo the thing.');
    await writeFile(join(dir,'secret'),'outside');
    await symlink(join(dir,'secret'),join(dir,'skills','one','escape'));
    const skills=new Skills([join(dir,'skills')]);await skills.refresh();
    assert.equal(skills.load('one').instructions,'Do the thing.');
    await assert.rejects(skills.read('one','../../secret'),/inside/);
    await assert.rejects(skills.read('one','escape'),/inside/);
    assert.throws(()=>skills.load('absent'),/Unknown/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('disabled capabilities are enforced and invalid inputs cannot reach an executor',async()=>{
  let touched=false;
  const tools=createTools({browser:{act:()=>{touched=true;}},capabilities:{browser:true},signal:new AbortController().signal});
  await assert.rejects(tools.execute('computer_click',{x:1,y:1}),/unavailable/);
  await assert.rejects(tools.execute('browser_scroll',{pixels:Infinity}));
  await assert.rejects(tools.execute('browser_click',{ref:'r1',extra:'x'}));
  assert.equal(touched,false);
});
test('checks distinguish final text, successful calls, memory, and fixture state',()=>{
  const memory=new Store(':memory:');
  try {
    memory.remember({content:'TypeScript'});
    const results=evaluate([{type:'response_contains',value:'success'},{type:'tool_called',value:'browser_click'},{type:'memory_not_contains',value:'Python'},{type:'fixture',value:'form-submitted'}],{
      text:'success',calls:[{name:'browser_click',ok:false}],memory,fixtures:new Set(),browserUrl:''});
    assert.deepEqual(results.map(r=>r.passed),[true,false,true,false]);
  }finally{memory.close();}
});
test('agent executes tools, preserves reasoning items, evaluates results, and records usage',async()=>{
  const dir=await temp(),store=new Store(':memory:'),session=store.createSession().id,runId=store.createRun(session);
  const skills=new Skills([]);let round=0;
  try {
    await runAgent({runId,session,prompt:'remember my language',profile:{id:'fake',model:'test'},apiKey:'unused',capabilities:{memory:true},maxSteps:4,memory:store,store,skills,browser:{close:async()=>{}},computer:{},dataDir:dir,signal:new AbortController().signal,emit:(t,d)=>store.event(runId,t,d),task:{checks:[{type:'memory_contains',value:'TypeScript'}]},fixtureState:new Set(),modelCall:async({input})=>{
      round++;
      if(round===1)return {output:[{type:'reasoning',id:'r',encrypted_content:'abc',summary:[]},{type:'function_call',call_id:'c',name:'memory_save',arguments:'{"content":"Prefers TypeScript"}'}],usage:{input_tokens:10,output_tokens:5}};
      assert(input.some(i=>i.encrypted_content==='abc'));
      assert(input.some(i=>i.type==='function_call_output'));
      return {output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'Saved your preference.'}]}],usage:{input_tokens:20,output_tokens:3}};
    }});
    const metadata=JSON.parse(store.run(runId).metadata);
    assert.equal(metadata.metrics.inputTokens,30);assert.equal(metadata.metrics.toolCalls,1);
    assert.equal(metadata.checks[0].passed,true);assert.equal(store.run(runId).status,'completed');
  }finally{store.close();await rm(dir,{recursive:true,force:true});}
});
test('cancellation prevents subsequent tool execution and marks run stopped',async()=>{
  const dir=await temp(),store=new Store(':memory:'),session=store.createSession().id,runId=store.createRun(session),controller=new AbortController();
  try {
    await runAgent({runId,session,prompt:'go',profile:{id:'fake'},capabilities:{memory:true},maxSteps:2,memory:store,store,skills:new Skills([]),browser:{close:async()=>{}},computer:{},dataDir:dir,signal:controller.signal,emit:()=>{},fixtureState:new Set(),modelCall:async()=>{
      controller.abort();return {output:[{type:'function_call',call_id:'c',name:'memory_save',arguments:'{"content":"should not save"}'}]};
    }});
    assert.equal(store.memories().length,0);assert.equal(store.run(runId).status,'stopped');
  }finally{store.close();await rm(dir,{recursive:true,force:true});}
});
test('CSV export escapes spreadsheet formulas and quotes',()=>{
  const value=csv([{id:'abc',status:'completed',metadata:{profile:{label:'=SUM(1,2)'},task:{name:'A "quote"'}}}]);
  assert(value.includes("'=SUM(1,2)"));assert(value.includes('A ""quote""'));
});
test('response checks ignore intermediate commentary when the final answer is wrong',async()=>{
  const dir=await temp(),store=new Store(':memory:'),session=store.createSession().id,runId=store.createRun(session);let round=0;
  try{
    await runAgent({runId,session,prompt:'find correct result',profile:{id:'fake'},capabilities:{memory:true},maxSteps:3,memory:store,store,skills:new Skills([]),browser:{close:async()=>{}},computer:{},dataDir:dir,signal:new AbortController().signal,emit:()=>{},task:{checks:[{type:'response_contains',value:'right answer'}]},fixtureState:new Set(),modelCall:async()=>{
      if(++round===1)return {output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'Maybe right answer.'}]},{type:'function_call',call_id:'c',name:'memory_search',arguments:'{}'}]};
      return {output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'Wrong result.'}]}]};
    }});
    assert.equal(JSON.parse(store.run(runId).metadata).checks[0].passed,false);
  }finally{store.close();await rm(dir,{recursive:true,force:true});}
});
