import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { callModel } from '../src/provider.js';

test('Claude tool loop preserves signed thinking and pairs image/error results with tool calls',async()=>{
  const requests=[];
  const content=[
    {type:'thinking',thinking:'Inspect the page.',signature:'opaque-signed-thinking'},
    {type:'text',text:'Checking.'},
    {type:'tool_use',id:'c1',name:'snapshot',input:{}},
    {type:'tool_use',id:'c2',name:'click',input:{ref:'missing'}},
  ];
  const server=createServer(async(req,res)=>{
    let data='';for await(const chunk of req)data+=chunk;
    requests.push({path:req.url,headers:req.headers,body:JSON.parse(data)});
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({model:'claude-test',stop_reason:requests.length===1?'tool_use':'end_turn',content:requests.length===1?content:[{type:'text',text:'Done.'}],usage:{input_tokens:10,cache_creation_input_tokens:2,cache_read_input_tokens:3,output_tokens:4}}));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{
    const options={profile:{api:'anthropic',baseUrl:`http://127.0.0.1:${server.address().port}/v1`,model:'claude-opus-5-5'},apiKey:'test-key',instructions:'test system',tools:[{type:'function',name:'snapshot',description:'Observe',parameters:{type:'object',properties:{}}}],signal:new AbortController().signal};
    const input=[{role:'user',content:'Inspect this.'}];
    const first=await callModel({...options,input});
    assert.equal(first.output.filter(i=>i.type==='function_call').length,2);
    assert.equal(first.usage.input_tokens,15);
    await callModel({...options,input:[...input,...first.output,
      {type:'function_call_output',call_id:'c1',output:[{type:'input_text',text:'{}'},{type:'input_image',image_url:'data:image/png;base64,YWJj'}]},
      {type:'function_call_output',call_id:'c2',output:[{type:'input_text',text:'{"error":"Stale reference"}'}]},
    ]});
    assert.equal(requests[0].path,'/v1/messages');
    assert.equal(requests[0].headers['x-api-key'],'test-key');
    assert.equal(requests[0].headers['anthropic-version'],'2023-06-01');
    assert.deepEqual(requests[0].body.tools[0].input_schema,options.tools[0].parameters);
    assert.equal(requests[0].body.tool_choice.disable_parallel_tool_use,true);
    const messages=requests[1].body.messages;
    assert.equal(messages.length,3);
    assert.deepEqual(messages[1],{role:'assistant',content});
    assert.equal(messages[2].role,'user');
    assert.equal(messages[2].content[0].tool_use_id,'c1');
    assert.deepEqual(messages[2].content[0].content[1],{type:'image',source:{type:'base64',media_type:'image/png',data:'YWJj'}});
    assert.equal(messages[2].content[1].tool_use_id,'c2');
    assert.equal(messages[2].content[1].is_error,true);
  }finally{await new Promise(r=>server.close(r));}
});

test('compatible chat preserves provider tool signatures without duplicating messages',async()=>{
  const requests=[];
  const message={role:'assistant',content:'Checking.',tool_calls:[{id:'c1',type:'function',function:{name:'snapshot',arguments:'{}'},extra_content:{google:{thought_signature:'opaque-token'}}}]};
  const server=createServer(async(req,res)=>{
    let data='';for await(const chunk of req)data+=chunk;requests.push(JSON.parse(data));
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{finish_reason:'tool_calls',message}]}));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{
    const options={profile:{api:'chat',baseUrl:`http://127.0.0.1:${server.address().port}`,model:'test'},instructions:'system',tools:[],signal:new AbortController().signal};
    const input=[{role:'user',content:'Inspect this.'}];
    const first=await callModel({...options,input});
    await callModel({...options,input:[...input,...first.output,{type:'function_call_output',call_id:'c1',output:'Observed.'}]});
    assert.equal(requests[1].messages.length,4);
    assert.deepEqual(requests[1].messages[2],message);
    assert.deepEqual(requests[1].messages[3],{role:'tool',tool_call_id:'c1',content:'Observed.'});
  }finally{await new Promise(r=>server.close(r));}
});

test('Responses adapter sends stateless tool loop with image observations',async()=>{
  let received;
  const server=createServer(async(req,res)=>{
    let data='';for await(const chunk of req)data+=chunk;received=JSON.parse(data);
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({status:'completed',output:[]}));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{
    await callModel({profile:{api:'responses',baseUrl:`http://127.0.0.1:${server.address().port}`,model:'test'},apiKey:'test',instructions:'test',input:[{type:'function_call_output',call_id:'c',output:[{type:'input_image',image_url:'data:image/png;base64,abc'}]}],tools:[],signal:new AbortController().signal});
    assert.equal(received.store,false);assert.equal(received.parallel_tool_calls,false);assert(received.include.includes('reasoning.encrypted_content'));assert.equal(received.input[0].output[0].type,'input_image');
  }finally{await new Promise(r=>server.close(r));}
});
test('chat adapter translates calls and screenshots, and normalizes usage',async()=>{
  let received;
  const server=createServer(async(req,res)=>{
    let data='';for await(const chunk of req)data+=chunk;received=JSON.parse(data);
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'hello'}}],usage:{prompt_tokens:10,completion_tokens:3}}));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{
    const response=await callModel({profile:{api:'chat',baseUrl:`http://127.0.0.1:${server.address().port}`,model:'test'},instructions:'system',input:[{role:'user',content:'hello'},{type:'function_call',call_id:'c',name:'snapshot',arguments:'{}'},{type:'function_call_output',call_id:'c',output:[{type:'input_text',text:'observation'},{type:'input_image',image_url:'data:image/png;base64,abc'}]}],tools:[],signal:new AbortController().signal});
    assert.equal(response.usage.input_tokens,10);
    assert.equal(received.messages[2].tool_calls[0].id,'c');assert.equal(received.messages[3].role,'tool');assert.equal(received.messages[4].content[1].type,'image_url');
  }finally{await new Promise(r=>server.close(r));}
});
