import { test } from 'node:test';
import assert from 'node:assert/strict';

// Set required environment variables before importing modules
process.env.DATABASE_URL = 'postgres://localhost/test';
process.env.SESSION_SECRET = 'test';
process.env.OPENAI_API_KEY = 'test';

const { recordActivity } = await import('./index');
const { storage } = await import('../config/storage');
const { logger } = await import('../utils/logger');

// Helper to replace storage.createActivity and logger.error during tests

test('recordActivity surfaces errors to caller', async () => {
  const err = new Error('boom');
  const original = storage.createActivity;
  // @ts-ignore override for test
  storage.createActivity = async () => {
    throw err;
  };

  try {
    await assert.rejects(
      recordActivity('u', 'action', 'entity', 1),
      err
    );
  } finally {
    // @ts-ignore restore
    storage.createActivity = original;
  }
});

test('callers can handle recordActivity errors', async () => {
  const err = new Error('boom');
  const originalActivity = storage.createActivity;
  // @ts-ignore override for test
  storage.createActivity = async () => {
    throw err;
  };

  const logs: any[] = [];
  const originalLogger = logger.error;
  // @ts-ignore override logger
  logger.error = (...args: any[]) => {
    logs.push(args);
  };

  try {
    await recordActivity('u', 'action', 'entity', 1).catch((error) =>
      logger.error('Failed to record activity', error)
    );
    assert.equal(logs.length, 1);
  } finally {
    // @ts-ignore restore
    storage.createActivity = originalActivity;
    // @ts-ignore restore
    logger.error = originalLogger;
  }
});
