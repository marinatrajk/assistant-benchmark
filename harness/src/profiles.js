import { z } from 'zod';

export const profileSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(100),
  label: z.string().trim().min(1).max(80),
  model: z.string().trim().max(160),
  api: z.enum(['responses', 'chat', 'anthropic']),
  baseUrl: z.string().url().refine(v => ['https:', 'http:'].includes(new URL(v).protocol), 'Use an HTTP(S) endpoint'),
  enabled: z.boolean().default(true),
  availabilityNote: z.string().max(1000).default(''),
  maxOutputTokens: z.number().int().min(128).max(128000).default(8192),
  temperature: z.number().min(0).max(2).nullable().default(null),
  reasoningEffort: z.enum(['none','minimal','low','medium','high','xhigh','max']).nullable().default(null),
}).refine(p => !p.enabled || p.model.length > 0, { message: 'Enter the API model ID before enabling this profile.', path: ['model'] });

export const modelPresets = [
  { id: 'gemini-4-argon', label: 'Gemini 4 Argon', model: '', api: 'chat',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', enabled: false,
    availabilityNote: 'Awaiting API access and a verified model ID. Google announced a limited rollout; its public API catalog does not yet list Argon (checked October 1, 2026). If you have access, enter the exact model ID and endpoint supplied for your account, then enable this profile.' },
  { id: 'gpt-6-astra', label: 'GPT-6 Astra', model: 'gpt-6-astra', api: 'responses', baseUrl: 'https://api.openai.com/v1' },
  { id: 'claude-fable-5-1', label: 'Claude Fable 5.1', model: 'claude-fable-5-1', api: 'anthropic', baseUrl: 'https://api.anthropic.com/v1' },
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5', model: 'claude-opus-5-5', api: 'anthropic', baseUrl: 'https://api.anthropic.com/v1' },
].map(p => profileSchema.parse(p));

export function loadProfiles(store) {
  let profiles = store.setting('profiles', [{ id: 'openai', label: 'OpenAI · baseline', model: process.env.OPENAI_MODEL || 'gpt-6-luna', api: 'responses', baseUrl: 'https://api.openai.com/v1' }]);
  if (!store.setting('frontierProfilesAdded', false)) {
    for (const preset of modelPresets) {
      if (!profiles.some(p => p.id === preset.id || (preset.model && p.api === preset.api && p.model === preset.model))) profiles.push(structuredClone(preset));
    }
    store.setSetting('profiles', profiles);
    store.setSetting('frontierProfilesAdded', true);
  }
  return profiles;
}

export function providerKeyVariable(profile) {
  return ({
    'https://api.openai.com': 'OPENAI_API_KEY',
    'https://api.anthropic.com': 'ANTHROPIC_API_KEY',
    'https://generativelanguage.googleapis.com': 'GEMINI_API_KEY',
  })[new URL(profile.baseUrl).origin];
}

export function requiresKey(profile) { return profile.api !== 'chat' || Boolean(providerKeyVariable(profile)); }
export function requireReady(profile, apiKey) {
  if (profile.enabled === false || !profile.model.trim()) throw new Error(`${profile.label}: enter its API model ID and enable the profile before running it.`);
  if (requiresKey(profile) && !apiKey) throw new Error(`Add an API key for ${profile.label} first.`);
}
