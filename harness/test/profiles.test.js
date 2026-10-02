import test from 'node:test';
import assert from 'node:assert/strict';
import { loadProfiles, modelPresets, profileSchema, requireReady, providerKeyVariable } from '../src/profiles.js';

test('preset migration preserves custom profiles and does not restore removed presets', () => {
  const custom = { ...modelPresets[1], label: 'My Astra', baseUrl: 'https://gateway.example/v1' };
  const settings = new Map([['profiles', [custom]]]);
  const store = { setting: (key, fallback) => structuredClone(settings.get(key) ?? fallback), setSetting: (key, value) => settings.set(key, structuredClone(value)) };
  const profiles = loadProfiles(store);
  assert.equal(profiles.length, 4);
  assert.deepEqual(profiles.find(p => p.id === custom.id), custom);
  store.setSetting('profiles', profiles.filter(p => p.id !== 'claude-opus-5-5'));
  assert.equal(loadProfiles(store).length, 3);
});

test('unavailable models cannot run and provider credentials are origin scoped', () => {
  const gemini = modelPresets[0];
  assert.equal(gemini.enabled, false);
  assert.equal(gemini.model, '');
  assert.throws(() => requireReady(gemini, 'test-key'), /API model ID/);
  assert.equal(profileSchema.safeParse({ ...gemini, enabled: true }).success, false);
  assert.equal(providerKeyVariable(gemini), 'GEMINI_API_KEY');
  assert.equal(providerKeyVariable(modelPresets[2]), 'ANTHROPIC_API_KEY');
  assert.equal(providerKeyVariable({ baseUrl: 'https://api.anthropic.com.example/v1' }), undefined);
  assert.throws(() => requireReady(modelPresets[2], ''), /API key/);
  assert.doesNotThrow(() => requireReady({ ...gemini, model: 'local-model', enabled: true, baseUrl: 'http://localhost:11434/v1' }, ''));
});
