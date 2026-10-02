/** Preserve complete Claude content blocks (including signed thinking) across tool rounds. */
function messagesFor(input) {
  const messages = [];
  const append = (role, content) => {
    if (messages.at(-1)?.role === role) messages.at(-1).content.push(...content);
    else messages.push({ role, content: [...content] });
  };
  for (const item of input) {
    if (item.type === 'provider_message' && item.provider === 'anthropic') append('assistant', item.content);
    else if (item._native) continue;
    else if (item.type === 'function_call_output') {
      const output = typeof item.output === 'string' ? [{ type: 'input_text', text: item.output }] : item.output;
      const content = output.map(part => {
        if (part.type === 'input_text') return { type: 'text', text: part.text };
        if (part.type === 'input_image') {
          const match = part.image_url.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/s);
          if (!match) throw new Error('Claude observations require an inline supported image.');
          return { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } };
        }
        throw new Error(`Unsupported tool result type: ${part.type}`);
      });
      let isError = false;
      try { isError = Boolean(JSON.parse(output.find(p => p.type === 'input_text')?.text || '{}').error); } catch { /* Not every observation is JSON. */ }
      append('user', [{ type: 'tool_result', tool_use_id: item.call_id, content, ...(isError ? { is_error: true } : {}) }]);
    } else if (item.role) {
      const text = typeof item.content === 'string' ? item.content : item.content.map(p => p.text || p.refusal || '').join('\n');
      if (text) append(item.role, [{ type: 'text', text }]);
    }
  }
  return messages;
}

export async function respondAnthropic({ profile, apiKey, instructions, input, tools, signal }) {
  if (!apiKey) throw new Error('Add an Anthropic API key in Models, or set ANTHROPIC_API_KEY.');
  const response = await fetch(`${profile.baseUrl.replace(/\/$/, '')}/messages`, {
    method: 'POST', signal: AbortSignal.any([signal, AbortSignal.timeout(120000)]),
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: profile.model, system: instructions, max_tokens: profile.maxOutputTokens || 8192,
      messages: messagesFor(input),
      ...(tools.length ? {
        tools: tools.map(({ name, description, parameters }) => ({ name, description, input_schema: parameters })),
        tool_choice: { type: 'auto', disable_parallel_tool_use: true },
      } : {}),
      ...(profile.reasoningEffort ? { output_config: { effort: profile.reasoningEffort } } : {}),
      ...(profile.temperature != null ? { temperature: profile.temperature } : {}),
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Anthropic ${response.status}: ${body.error?.message || response.statusText}`);
  if (!Array.isArray(body.content)) throw new Error('Anthropic returned no message content.');
  if (['max_tokens', 'model_context_window_exceeded'].includes(body.stop_reason)) throw new Error(`Anthropic stopped: ${body.stop_reason}`);
  const output = [{ type: 'provider_message', provider: 'anthropic', content: body.content }];
  for (const block of body.content) {
    if (block.type === 'text') output.push({ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: block.text }], _native: 'anthropic' });
    if (block.type === 'tool_use') output.push({ type: 'function_call', call_id: block.id, name: block.name, arguments: JSON.stringify(block.input), _native: 'anthropic' });
  }
  const usage = body.usage;
  return { output, model: body.model, continuation: body.stop_reason === 'pause_turn', usage: {
    input_tokens: usage?.input_tokens == null ? undefined : usage.input_tokens + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0),
    output_tokens: usage?.output_tokens,
  } };
}
