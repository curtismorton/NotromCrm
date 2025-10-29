import test from 'node:test';
import assert from 'node:assert';

process.env.DATABASE_URL = 'http://localhost';
process.env.SESSION_SECRET = 'test';
process.env.OPENAI_API_KEY = 'test';

const { parseModelResponse, TaskSuggestionsSchema, ClientInsightsSchema } = await import('./ai.js');

test('handles invalid JSON', () => {
  const result = parseModelResponse(TaskSuggestionsSchema, '{invalid', { tasks: [] });
  assert.deepStrictEqual(result, { tasks: [], error: 'Invalid JSON in model response' });
});

test('handles schema mismatch', () => {
  const bad = '{"wrong":1}';
  const result = parseModelResponse(TaskSuggestionsSchema, bad, { tasks: [] });
  assert.deepStrictEqual(result, { tasks: [], error: 'Invalid model response structure' });
});

test('handles invalid field types', () => {
  const bad = '{"insights":123}';
  const result = parseModelResponse(ClientInsightsSchema, bad, { insights: '' });
  assert.deepStrictEqual(result, { insights: '', error: 'Invalid model response structure' });
});
