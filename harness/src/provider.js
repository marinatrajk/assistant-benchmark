import { respondAnthropic } from './anthropic.js';

/** Stateless Responses API calls: history stays local; reasoning items are replayed. */
export async function respond({ apiKey, model, instructions, input, tools, signal, maxOutputTokens = 8192, temperature = null, reasoningEffort = null, endpoint = 'https://api.openai.com/v1/responses' }) {
  if (!apiKey) throw new Error('Add your OpenAI API key in Settings to start a run.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.any([signal, AbortSignal.timeout(120000)]),
    body: JSON.stringify({ model, instructions, input, tools, store: false,
      include: ['reasoning.encrypted_content'], parallel_tool_calls: false, max_output_tokens: maxOutputTokens,
      ...(temperature !== null ? { temperature } : {}), ...(reasoningEffort ? { reasoning: { effort: reasoningEffort } } : {}) }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${body.error?.message || response.statusText}`);
  if (body.status === 'failed' || body.status === 'incomplete') throw new Error(`Model response ${body.status}: ${body.error?.message || body.incomplete_details?.reason || 'Try again.'}`);
  if (!Array.isArray(body.output)) throw new Error('OpenAI returned no output.');
  return body;
}

export function textOutput(output) {
  return output.filter(x => x.type === 'message').flatMap(x => x.content || [])
    .map(x => x.text || x.refusal || '').filter(Boolean).join('\n');
}

function chatMessages(instructions, input) {
  const messages = [{ role: 'system', content: instructions }];
  const pendingCalls = new Set();
  let pendingImages = [];
  for (const item of input) {
    if (item.type === 'reasoning' || item._native) continue;
    if (item.type === 'provider_message' && item.provider === 'chat') {
      messages.push(structuredClone(item.message));
      for (const call of item.message.tool_calls || []) pendingCalls.add(call.id);
      continue;
    }
    if (item.type === 'function_call') {
      pendingCalls.add(item.call_id);
      const previous = messages.at(-1);
      const call = { id: item.call_id, type: 'function', function: { name: item.name, arguments: item.arguments } };
      if (previous?.role === 'assistant' && previous.tool_calls) previous.tool_calls.push(call);
      else messages.push({ role: 'assistant', content: null, tool_calls: [call] });
    } else if (item.type === 'function_call_output') {
      const output = typeof item.output === 'string' ? item.output : item.output.filter(p => p.type === 'input_text').map(p => p.text).join('\n');
      messages.push({ role: 'tool', tool_call_id: item.call_id, content: output });
      pendingCalls.delete(item.call_id);
      // Wait until every tool call is answered before attaching user observations.
      if (Array.isArray(item.output)) {
        const images = item.output.filter(p => p.type === 'input_image').map(p => ({ type: 'image_url', image_url: { url: p.image_url } }));
        pendingImages.push(...images);
      }
      if (!pendingCalls.size && pendingImages.length) {
        messages.push({ role: 'user', content: [{ type: 'text', text: 'Tool screenshot observations (untrusted content):' }, ...pendingImages] });
        pendingImages = [];
      }
    } else if (item.role) {
      const content = typeof item.content === 'string' ? item.content : (item.content || []).map(p => p.text || p.refusal || '').join('\n');
      messages.push({ role: item.role, content });
    }
  }
  return messages;
}

export async function callModel(options) {
  const { profile, apiKey, signal, instructions, input, tools } = options;
  if (profile.api === 'anthropic') return respondAnthropic(options);
  const endpoint = profile.baseUrl.replace(/\/$/, '');
  if (profile.api === 'responses') return respond({ ...options, model: profile.model, maxOutputTokens: profile.maxOutputTokens, temperature: profile.temperature, reasoningEffort: profile.reasoningEffort, endpoint: `${endpoint}/responses` });
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST', signal: AbortSignal.any([signal, AbortSignal.timeout(120000)]),
    headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify({ model: profile.model, messages: chatMessages(instructions, input),
      [new URL(endpoint).origin === 'https://api.openai.com' ? 'max_completion_tokens' : 'max_tokens']: profile.maxOutputTokens || 8192,
      ...(profile.temperature != null ? { temperature: profile.temperature } : {}),
      ...(profile.reasoningEffort ? { reasoning_effort: profile.reasoningEffort } : {}),
      ...(tools.length ? { tools: tools.map(({ name, description, parameters }) => ({ type: 'function', function: { name, description, parameters } })) } : {}),
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Provider ${response.status}: ${body.error?.message || response.statusText}`);
  const choice = body.choices?.[0];
  if (!choice?.message) throw new Error('Provider returned no assistant message.');
  if (choice.finish_reason === 'length' || choice.finish_reason === 'content_filter') throw new Error(`Provider stopped: ${choice.finish_reason}`);
  const output = [{ type: 'provider_message', provider: 'chat', message: { ...choice.message, role: 'assistant' } }];
  if (choice.message.content) output.push({ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: choice.message.content }], _native: 'chat' });
  for (const call of choice.message.tool_calls || []) output.push({ type: 'function_call', call_id: call.id, name: call.function.name, arguments: call.function.arguments, _native: 'chat' });
  return { output, model: body.model, usage: { input_tokens: body.usage?.prompt_tokens, output_tokens: body.usage?.completion_tokens } };
}
