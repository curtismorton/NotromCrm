import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

test('GET /api/health responds with status ok', async () => {
  process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
  process.env.SESSION_SECRET = 'secret';
  process.env.OPENAI_API_KEY = 'key';
  process.env.GMAIL_CLIENT_ID = 'id';
  process.env.GMAIL_CLIENT_SECRET = 'secret';
  process.env.GMAIL_REDIRECT_URI = 'uri';

  const { registerRoutes } = await import('./index.ts');

  const app = express();
  app.use(express.json());
  const server = await registerRoutes(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  const res = await fetch(`http://localhost:${port}/api/health`);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.deepEqual(data, { status: 'ok' });

  server.close();
});
