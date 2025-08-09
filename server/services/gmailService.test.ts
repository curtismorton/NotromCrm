import test from 'node:test';
import assert from 'node:assert';

// Mock Gmail API and verify base64url encoding

test('sendEmail encodes message with base64url', async () => {
  process.env.DATABASE_URL = 'postgres://example.com/db';
  process.env.SESSION_SECRET = 'secret';
  process.env.OPENAI_API_KEY = 'testkey';

  const { GmailService } = await import('./gmailService');

  const service = new GmailService();
  let receivedRaw: string | undefined;

  // Mock the Gmail API send method
  (service as any).gmail = {
    users: {
      messages: {
        send: async ({ requestBody }: any) => {
          receivedRaw = requestBody.raw;
          return {};
        },
      },
    },
  };

  await service.sendEmail('test@example.com', 'Hello', 'Body');

  const message = ['To: test@example.com', 'Subject: Hello', '', 'Body'].join('\n');
  const expected = Buffer.from(message).toString('base64url');

  assert.strictEqual(receivedRaw, expected);
});
