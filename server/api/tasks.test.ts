import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

process.env.DATABASE_URL = 'http://localhost';
process.env.SESSION_SECRET = 'test';
process.env.OPENAI_API_KEY = 'test';

const { db } = await import('../config/db');

const now = new Date();
const tasksData = [
  { title: 'Soon', status: 'todo', dueDate: new Date(now.getTime() + 2 * 86400000), completedAt: null },
  { title: 'Later', status: 'todo', dueDate: new Date(now.getTime() + 5 * 86400000), completedAt: null },
  { title: 'Done', status: 'todo', dueDate: new Date(now.getTime() + 1 * 86400000), completedAt: new Date() },
];

(db as any).select = () => ({
  from: () => ({
    where: () => ({
      orderBy: () => {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        return tasksData.filter(
          (t) => t.status === 'todo' && t.completedAt === null && t.dueDate <= threeDaysFromNow
        );
      },
    }),
  }),
});

const app = express();
const tasksRouter = (await import('./tasks')).default;
app.use('/', tasksRouter);

test('GET /due-soon returns tasks due within three days', async () => {
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const res = await fetch(`http://127.0.0.1:${port}/due-soon`);
  const body = await res.json();
  server.close();
  assert.equal(body.length, 1);
  assert.equal(body[0].title, 'Soon');
});
