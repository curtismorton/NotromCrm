import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { log } from './vite';

test('log outputs formatted message', () => {
  const spy = mock.method(console, 'log');
  log('hello world', 'tester');
  assert.equal(spy.mock.calls.length, 1);
  const [message] = spy.mock.calls[0].arguments;
  assert.ok(message.includes('[tester] hello world'));
  spy.mock.restore();
});
