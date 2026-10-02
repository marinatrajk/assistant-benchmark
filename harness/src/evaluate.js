export const defaultTasks = [
  {
    id: 'browser-form', name: 'Complete a browser form', category: 'browser',
    prompt: 'Open {{fixture}}/form. Fill in the contact form with name Ada Lovelace, email ada@example.com, and topic Research. Submit it, then report the confirmation code.',
    capabilities: { browser: true, computer: false, memory: false, skills: false },
    checks: [{ type: 'fixture', value: 'form-submitted' }, { type: 'tool_called', value: 'browser_fill' }, { type: 'tool_called', value: 'browser_click' }, { type: 'response_contains', value: 'RELAY-1843' }],
  },
  {
    id: 'browser-research', name: 'Research with a skill', category: 'skills',
    prompt: 'Use the browser-research skill to compare the three plans at {{fixture}}/plans. Which is the cheapest plan with at least 10 projects? Give its monthly price and cite the page.',
    capabilities: { browser: true, computer: false, memory: false, skills: true },
    checks: [{ type: 'skill_loaded', value: 'browser-research' }, { type: 'response_contains', value: 'Studio' }, { type: 'response_contains', value: '18' }],
  },
  {
    id: 'memory-recall', name: 'Recall and update memory', category: 'memory',
    prompt: 'What is my preferred programming language? Remember that I now prefer TypeScript instead. Use the remember-preferences skill.',
    seedMemory: ['The user prefers Python as their programming language.'],
    capabilities: { browser: false, computer: false, memory: true, skills: true },
    checks: [{ type: 'tool_called', value: 'memory_search' }, { type: 'skill_loaded', value: 'remember-preferences' }, { type: 'memory_contains', value: 'TypeScript' }, { type: 'memory_not_contains', value: 'Python' }],
  },
  {
    id: 'desktop-calculator', name: 'Use Calculator on macOS', category: 'computer',
    prompt: 'Use the desktop-workflow skill. Open Calculator on macOS, calculate 137 × 29 using the app, inspect the result, and report it. Do not edit other apps or files.',
    capabilities: { browser: false, computer: true, memory: false, skills: true },
    checks: [{ type: 'tool_called', value: 'computer_snapshot' }, { type: 'tool_called', value: 'computer_open' }, { type: 'response_contains', value: '3973' }],
  },
];

export function evaluate(checks, { text, calls, memory, fixtures, browserUrl }) {
  return checks.map(check => {
    const value = check.value.toLowerCase();
    let passed = false;
    if (check.type === 'response_contains') passed = text.toLowerCase().includes(value) || (/^\d+$/.test(value) && text.replace(/(?<=\d)[, ](?=\d{3}(?:\D|$))/g, '').includes(value));
    if (check.type === 'tool_called') passed = calls.some(c => c.name === check.value && c.ok);
    if (check.type === 'skill_loaded') passed = calls.some(c => c.name === 'skill_load' && c.args.id === check.value && c.ok);
    if (check.type === 'memory_contains') passed = memory.memories().some(m => m.content.toLowerCase().includes(value));
    if (check.type === 'memory_not_contains') passed = !memory.memories().some(m => m.content.toLowerCase().includes(value));
    if (check.type === 'fixture') passed = fixtures.has(check.value);
    if (check.type === 'browser_url_contains') passed = browserUrl.toLowerCase().includes(value);
    return { ...check, passed };
  });
}

export function csv(runs) {
  const fields = ['run', 'task', 'model', 'status', 'checksPassed', 'checksTotal', 'durationMs', 'modelCalls', 'toolCalls', 'toolErrors', 'inputTokens', 'outputTokens', 'humanScore'];
  const rows = runs.map(r => {
    const m = r.metadata;
    return [r.id, m.task?.name || 'Sandbox', m.profile?.label, r.status, m.checks?.filter(c => c.passed).length ?? '', m.checks?.length ?? '', m.metrics?.durationMs, m.metrics?.modelCalls, m.metrics?.toolCalls, m.metrics?.toolErrors, m.metrics?.inputTokens, m.metrics?.outputTokens, m.review?.score];
  });
  const escape = v => { let s = String(v ?? ''); if (/^[=+@-]/.test(s)) s = `'${s}`; return `"${s.replaceAll('"', '""')}"`; };
  return [fields, ...rows].map(row => row.map(escape).join(',')).join('\r\n');
}
