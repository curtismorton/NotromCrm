import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { AddressInfo } from 'node:net';

async function setup() {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/test';
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test';
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test';
  const { registerRoutes } = await import('./index');
  const app = express();
  app.use(express.json());
  const server = await registerRoutes(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

test('GET /api/leads/:id returns 400 for non-numeric id', async () => {
  const { server, baseUrl } = await setup();
  try {
    const res = await fetch(`${baseUrl}/api/leads/abc`);
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Invalid lead ID/i);
  } finally {
    server.close();
  }
});

test('GET /api/projects/:id returns 400 for non-numeric id', async () => {
  const { server, baseUrl } = await setup();
  try {
    const res = await fetch(`${baseUrl}/api/projects/xyz`);
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Invalid project ID/i);
  } finally {
    server.close();
  }
});

test('GET /api/tasks/:id returns 400 for non-numeric id', async () => {
  const { server, baseUrl } = await setup();
  try {
    const res = await fetch(`${baseUrl}/api/tasks/notanumber`);
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Invalid task ID/i);
  } finally {
    server.close();
  }
});
