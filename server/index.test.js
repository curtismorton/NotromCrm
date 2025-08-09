import test from 'node:test';
import assert from 'node:assert';
import express from 'express';

// Test to ensure server continues running after handled errors

const createTestServer = () => {
  const app = express();

  app.get('/error', (_req, _res) => {
    throw new Error('boom');
  });

  app.get('/ok', (_req, res) => {
    res.json({ ok: true });
  });

  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
    return;
  });

  return app;
};

test('server continues running after handled errors', async () => {
  const app = createTestServer();
  const server = app.listen(0);

  await new Promise(resolve => server.once('listening', resolve));
  const port = server.address().port;

  const errorRes = await fetch(`http://localhost:${port}/error`);
  assert.equal(errorRes.status, 500);
  const errorBody = await errorRes.json();
  assert.deepEqual(errorBody, { message: 'boom' });

  const okRes = await fetch(`http://localhost:${port}/ok`);
  assert.equal(okRes.status, 200);
  const okBody = await okRes.json();
  assert.deepEqual(okBody, { ok: true });

  server.close();
});
